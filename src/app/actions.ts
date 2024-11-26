'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
// Payment Integration:
import Stripe from 'stripe';

import { Customers, Invoices, Status } from '@/db/schema';
import { db } from '@/db';
import { and, eq, isNull } from 'drizzle-orm';
import { headers } from 'next/headers';

// Create new instance of Payment Gateway [Stripe]:
const stripe = new Stripe(String(process.env.STRIPE_API_SECRET));

export async function formCreateAction(formData: FormData) {
	const { userId, orgId } = auth();

	if (!userId) {
		return;
	}

	const amount = Math.floor(parseFloat(String(formData.get('amount'))) * 100);
	const description = formData.get('description') as string;
	const name = formData.get('name') as string;
	const email = formData.get('email') as string;

	const [customer] = await db
		.insert(Customers)
		.values({
			name,
			email,
			userId,
			organizationId: orgId || null,
		})
		.returning({
			id: Customers.id,
		});

	const results = await db
		.insert(Invoices)
		.values({
			amount,
			description,
			userId,
			customerId: customer.id,
			status: 'open',
			organizationId: orgId || null,
		})
		.returning({
			id: Invoices.id,
		});

	redirect(`/invoices/${results[0].id}`);
}

export async function updateStatusAction(formData: FormData) {
	const { userId, orgId } = auth();

	if (!userId) {
		return;
	}

	const id = formData.get('id') as string;
	const status = formData.get('status') as Status;

	if (orgId) {
		await db
			.update(Invoices)
			.set({ status })
			.where(
				and(eq(Invoices.id, parseInt(id)), eq(Invoices.organizationId, orgId))
			);
	} else {
		await db
			.update(Invoices)
			.set({ status })
			.where(
				and(
					eq(Invoices.id, parseInt(id)),
					eq(Invoices.userId, userId),
					isNull(Invoices.organizationId)
				)
			);
	}

	revalidatePath(`/invoices/${id}`, `page`);
}

export async function deleteInvoiceAction(formData: FormData) {
	const { userId, orgId } = auth();

	if (!userId) {
		return;
	}

	const id = formData.get('id') as string;

	if (orgId) {
		await db
			.delete(Invoices)
			.where(
				and(eq(Invoices.id, parseInt(id)), eq(Invoices.organizationId, orgId))
			);
	} else {
		await db
			.delete(Invoices)
			.where(
				and(
					eq(Invoices.id, parseInt(id)),
					eq(Invoices.userId, userId),
					isNull(Invoices.organizationId)
				)
			);
	}

	redirect('/dashboard');
}

// Stripe
export async function createPayment(formData: FormData) {
	const headersList = await headers();
	const origin = headersList.get('origin');

	const id = parseInt(formData.get('id') as string);

	const [result] = await db
		.select({
			status: Invoices.status,
			amount: Invoices.amount,
		})
		.from(Invoices)
		.where(eq(Invoices.id, id))
		.limit(1);

	// Create Checkout Sessions from body params.
	const session = await stripe.checkout.sessions.create({
		line_items: [
			{
				// Provide the exact Price ID (for example, pr_1234) of the product you want to sell
				price_data: {
					currency: 'zar',
					product: 'prod_RHYJMzAzY7T9Gy',
					unit_amount: result.amount,
				},
				quantity: 1,
			},
		],
		mode: 'payment',
		success_url: `${origin}/invoices/${id}/payment?status=success`,
		cancel_url: `${origin}/invoices/${id}/payment?status=canceled`,
	});

	if (!session.url) {
		throw new Error('Invalid Session URL');
	}

	redirect(session.url);
	/* return session.url; */ // Return the session URL instead of redirecting directly
}
