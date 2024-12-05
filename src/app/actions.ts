'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Resend } from 'resend';
// Payment Integration:
import Stripe from 'stripe';

import { db } from '@/db';
import { Customers, Invoices, type Status } from '@/db/schema';
import { and, eq, isNull } from 'drizzle-orm';
import { headers } from 'next/headers';

import { WebifyInvoiceEmail } from '@/emails/invoice-created';

// Create new instance of Payment Gateway [Stripe]:
const stripe = new Stripe(String(process.env.STRIPE_API_SECRET));
// Create instance of resend email
const resend = new Resend(process.env.RESEND_API_KEY);

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

	await resend.emails.send({
		from: 'Webify <info@email.webify.org.za>',
		to: [email],
		subject: 'You Have a New Invoice',
		react: WebifyInvoiceEmail({ invoiceId: results[0].id }),
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
	/* try { */
	// Get headers and origin
	const headersList = await headers();
	const origin = headersList.get('origin');
	if (!origin) throw new Error('Origin header is missing');

	// Parse and validate ID from formData
	const id = parseInt(formData.get('id') as string);
	if (isNaN(id)) throw new Error('Invalid ID');

	// Fetch invoice details from the database
	const [result] = await db
		.select({ status: Invoices.status, amount: Invoices.amount })
		.from(Invoices)
		.where(eq(Invoices.id, id))
		.limit(1);
	if (!result) throw new Error('Invoice not found');

	// Create Checkout Sessions from body params
	const session = await stripe.checkout.sessions.create({
		line_items: [
			{
				price_data: {
					currency: 'zar',
					product: 'prod_RHYJMzAzY7T9Gy',
					unit_amount: result.amount,
				},
				quantity: 1,
			},
		],
		mode: 'payment',
		success_url: `${origin}/invoices/${id}/payment?status=success&session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${origin}/invoices/${id}/payment?status=canceled&session_id={CHECKOUT_SESSION_ID}`,
	});

	if (!session.url) {
		throw new Error('Invalid Session URL');
	}

	// Redirect to the session URL
	redirect(session.url);
	/* } catch (error) {
		console.error('Error creating payment session:', error);
		throw new Error('Failed to create payment session');
	} */
}
