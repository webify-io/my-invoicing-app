import { eq } from 'drizzle-orm';
import {
	CircleAlert,
	CircleCheck,
	CircleSlash,
	CreditCard,
} from 'lucide-react';
import Stripe from 'stripe';

import Container from '@/components/Container';
import { Badge } from '@/components/ui/badge';
import { Customers, Invoices } from '@/db/schema';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';

import { createPayment, updateStatusAction } from '@/app/actions';
import { db } from '@/db';
import { notFound } from 'next/navigation';

// Create new instance of Payment Gateway [Stripe]:
const stripe = new Stripe(String(process.env.STRIPE_API_SECRET));

interface InvoicePageProps {
	params: { invoiceId: string };
	searchParams: {
		status: string;
		session_id: string;
	};
}

export default async function InvoicePage({
	params,
	searchParams,
}: InvoicePageProps) {
	const invoiceId = Number.parseInt(params.invoiceId);

	const sessionId = searchParams.session_id;
	const isSuccess = sessionId && searchParams.status === 'success';
	const isCanceled = searchParams.status === 'canceled';
	let isError = isSuccess && !sessionId;

	console.log('isSuccess', isSuccess);
	console.log('isCanceled', isCanceled);

	if (Number.isNaN(invoiceId)) {
		throw new Error('Invalid Invoice ID');
	}

	if (isSuccess) {
		const { payment_status } =
			await stripe.checkout.sessions.retrieve(sessionId);

		if (payment_status !== 'paid') {
			isError = true;
		} else {
			const formData = new FormData();
			formData.append('id', String(invoiceId));
			formData.append('status', 'paid');
			await updateStatusAction(formData);
		}
	}

	const [result] = await db
		.select({
			id: Invoices.id,
			status: Invoices.status,
			createTs: Invoices.createTs,
			description: Invoices.description,
			amount: Invoices.amount,
			name: Customers.name,
		})
		.from(Invoices)
		.innerJoin(Customers, eq(Invoices.customerId, Customers.id))
		.where(eq(Invoices.id, invoiceId))
		.limit(1);

	if (!result) {
		notFound();
	}

	const invoice = {
		...result,
		customer: {
			name: result.name,
		},
	};
	// Debugging to check values
	//console.log('Params:', params);
	//console.log('Search Params:', searchParams);

	/* let pstate;
	try {
		pstate = await searchParams;
		console.log('Status:', pstate.status);
	} catch (error) {
		console.error('Error:', error);
	}

	const isSuccess = pstate?.status === 'success';
	const isCanceled = pstate?.status === 'canceled'; */

	// Check searchParams
	/* const isSuccess = searchParams.status === 'success';
	const isCanceled = searchParams.status === 'canceled';
 */
	/* console.log('invoiceId:', invoiceId);
	console.log('status:', searchParams.status); */
	/* console.log('isSuccess', isSuccess);
	console.log('isCanceled', isCanceled); */
	/*
	if (isNaN(invoiceId)) {
		throw new Error('Invalid Invoice ID');
	}

	// Update status in the DB if success
	if (isSuccess) {
		await stripe.checkout.sessions.retrieve(session_id);
		const formData = new FormData();
		formData.append('id', String(invoiceId));
		formData.append('status', 'paid');

		await updateStatusAction(formData);
	}

	// Fetch invoice information from the DB
	const [result] = await db
		.select({
			id: Invoices.id,
			status: Invoices.status,
			createTs: Invoices.createTs,
			description: Invoices.description,
			amount: Invoices.amount,
			name: Customers.name,
		})
		.from(Invoices)
		.innerJoin(Customers, eq(Invoices.customerId, Customers.id))
		.where(eq(Invoices.id, invoiceId))
		.limit(1);

	if (!result) {
		notFound();
	}

	const invoice = {
		...result,
		customer: {
			name: result.name,
		},
	};
 */
	// Return or render the component
	return (
		<main className="w-full h-full my-12">
			<Container>
				{isError && (
					<p className="bg-red-100 text-sm text-red-800 text-center px-3 py-2 rounded-lg mb-6">
						Something went wrong, please try again!
					</p>
				)}
				{isCanceled && (
					<p className="bg-yellow-100 text-sm text-yellow-800 text-center px-3 py-2 rounded-lg mb-6">
						Payment was canceled, please try again.
					</p>
				)}
				<div className="grid grid-cols-2">
					<div>
						<div className="flex justify-between mb-8">
							<h1 className="flex items-center gap-4 text-3xl font-semibold">
								Invoice {invoice.id}
								<Badge
									className={cn(
										'rounded-full capitalize',
										invoice.status === 'open' && 'bg-blue-500',
										invoice.status === 'paid' && 'bg-green-600',
										invoice.status === 'void' && 'bg-zinc-500',
										invoice.status === 'uncollectable' && 'bg-red-500'
									)}
								>
									{invoice.status}
								</Badge>
							</h1>
						</div>

						<p className="text-3xl mb-3">
							R{(invoice.amount / 100).toFixed(2)}
						</p>
						<p className="text-lg mb-8">{invoice.description}</p>
					</div>
					<div>
						<h2 className="text-xl font-bold mb-4">Manage Invoice</h2>
						{invoice.status === 'open' && (
							<form action={createPayment}>
								<input type="hidden" name="id" value={invoice.id} />
								<Button className="flex gap-2 font-semibold bg-blue-500 hover:bg-blue-600">
									<CreditCard className="w-5 h-auto" />
									Pay Invoice
								</Button>
							</form>
						)}
						{invoice.status === 'paid' && (
							<p className="flex gap-2 items-center text-lg font-medium border p-2 bg-green-200 rounded-sm">
								<CircleCheck className="w-8 h-auto bg-green-500 rounded-full text-white p-1" />
								Invoice Paid
							</p>
						)}
						{invoice.status === 'void' && (
							<p className="flex gap-2 items-center text-lg font-medium border p-2 bg-slate-200 rounded-sm">
								<CircleSlash className="w-8 h-auto bg-slate-500 rounded-full text-white p-1" />
								Invoice Voided
							</p>
						)}
						{invoice.status === 'uncollectable' && (
							<p className="flex gap-2 items-center text-lg font-medium border p-2 bg-red-200 rounded-sm">
								<CircleAlert className="w-8 h-auto bg-red-500 rounded-full text-white p-1" />
								Invoice Uncollectable
							</p>
						)}
					</div>
				</div>

				<h2 className="font-bold text-lg mb-4">Billing Details</h2>

				<ul className="grid gap-2">
					<li className="flex gap-4">
						<strong className="block w-28 flex-shrink-0 font-medium text-sm">
							Invoice ID
						</strong>
						<span>{invoice.id}</span>
					</li>
					<li className="flex gap-4">
						<strong className="block w-28 flex-shrink-0 font-medium text-sm">
							Invoice Date
						</strong>
						<span>
							{new Date(String(invoice.createTs)).toLocaleDateString()}
						</span>
					</li>
					<li className="flex gap-4">
						<strong className="block w-28 flex-shrink-0 font-medium text-sm">
							Billing Name
						</strong>
						<span>{invoice.customer.name}</span>
					</li>
				</ul>
			</Container>
		</main>
	);
}
