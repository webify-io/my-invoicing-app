import { useOptimistic } from 'react';

import { Customers, Invoices } from '@/db/schema';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Container from '@/components/Container';

import { Button } from '@/components/ui/button';
import { createPayment, updateStatusAction } from '@/app/actions';
import {
	CircleAlert,
	CircleCheck,
	CircleSlash,
	CreditCard,
} from 'lucide-react';
import { db } from '@/db';
import { eq, and, isNull } from 'drizzle-orm';
import { notFound } from 'next/navigation';

interface InvoicePageProps {
	params: { invoiceId: string };
	searchParams: { status: string };
}

export default async function InvoicePage({
	params,
	searchParams,
}: InvoicePageProps) {
	// Awaiting params
	const invoiceId = parseInt(params.invoiceId);

	// searchParams
	const isSuccess = searchParams.status === 'success';
	const isCanceled = searchParams.status === 'canceled';

	console.log('invoiceId:', invoiceId);
	// status: undefined - DEBUG
	console.log('status:', searchParams.status);
	console.log('isSuccess', isSuccess);
	console.log('isCanceled', isCanceled);

	if (isNaN(invoiceId)) {
		throw new Error('Invalid Invoice ID');
	}

	// Update status on the DB:
	if (isSuccess) {
		const formData = new FormData();
		formData.append('id', String(invoiceId));
		formData.append('status', 'paid');

		await updateStatusAction(formData);
	}

	// Get info from DB
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

	return (
		<main className="w-full h-full my-12">
			<Container>
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
