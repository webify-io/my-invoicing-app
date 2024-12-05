'use client';

import { useOptimistic } from 'react';

import { Customers, Invoices } from '@/db/schema';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Container from '@/components/Container';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { AVAILABLE_STATUSES } from '@/data/invoice';
import { updateStatusAction, deleteInvoiceAction } from '@/app/actions';
import { ChevronDown, CreditCard, Ellipsis, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface InvoiceProps {
	invoice: typeof Invoices.$inferSelect & {
		customer: typeof Customers.$inferSelect;
	};
}

export default function Invoice({ invoice }: InvoiceProps) {
	const [currentStatus, setCurrentStatus] = useOptimistic(
		invoice.status,
		// updateFn
		(state, newStatus) => {
			// merge and return new state
			// with optimistic value
			return String(newStatus);
		}
	);

	async function handleOnUpdateStatus(formData: FormData) {
		const originalStatus = currentStatus;
		setCurrentStatus(formData.get('status'));
		try {
			await updateStatusAction(formData);
		} catch (e) {
			console.error('Error updating status:', e);
			setCurrentStatus(originalStatus);
		}
	}

	return (
		<main className="w-full h-full my-12">
			<Container>
				<div className="flex justify-between mb-8">
					<h1 className="flex items-center gap-4 text-3xl font-semibold">
						Invoice {invoice.id}
						<Badge
							className={cn(
								'rounded-full capitalize',
								currentStatus === 'open' && 'bg-blue-500',
								currentStatus === 'paid' && 'bg-green-600',
								currentStatus === 'void' && 'bg-zinc-500',
								currentStatus === 'uncollectable' && 'bg-red-500'
							)}
						>
							{currentStatus}
						</Badge>
					</h1>

					<div className="flex gap-4">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button className="flex items-center gap-2" variant="outline">
									Change Status <ChevronDown className="w-4 h-auto" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								{AVAILABLE_STATUSES.map((status) => {
									return (
										<DropdownMenuItem key={status.id}>
											<form action={handleOnUpdateStatus}>
												<input type="hidden" name="id" value={invoice.id} />
												<input type="hidden" name="status" value={status.id} />
												<button>{status.label}</button>
											</form>
										</DropdownMenuItem>
									);
								})}
							</DropdownMenuContent>
						</DropdownMenu>

						<Dialog>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button className="flex items-center gap-2" variant="outline">
										<span className="sr-only">More Options</span>
										<Ellipsis className="w-4 h-auto" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									<DropdownMenuItem>
										<Link
											href={`/invoices/${invoice.id}/payment`}
											className="flex gap-2 items-center"
										>
											<CreditCard className="w-4 h-auto" />
											Payment
										</Link>
									</DropdownMenuItem>

									<DropdownMenuItem>
										<DialogTrigger asChild>
											<button className="flex gap-2 items-center">
												<Trash2 className="w-4 h-auto" />
												Delete Invoice
											</button>
										</DialogTrigger>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>

							<DialogContent>
								<DialogHeader>
									<DialogTitle className="text-xl">Delete Invoice?</DialogTitle>
									<DialogDescription>
										This action cannot be undone. This will permanently delete
										your invoice and remove your data from our servers.
									</DialogDescription>
								</DialogHeader>
								<DialogFooter className="sm:justify-between">
									<form action={deleteInvoiceAction}>
										<input type="hidden" name="id" value={invoice.id} />
										<Button variant="destructive" className="flex gap-2">
											<Trash2 className="w-4 h-auto" />
											Delete Invoice
										</Button>
									</form>
									<DialogClose asChild>
										<Button type="button" variant="secondary">
											Cancel
										</Button>
									</DialogClose>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</div>
				</div>

				<p className="text-3xl mb-3">R{(invoice.amount / 100).toFixed(2)}</p>
				<p className="text-lg mb-8">{invoice.description}</p>

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
					<li className="flex gap-4">
						<strong className="block w-28 flex-shrink-0 font-medium text-sm">
							Billing Email
						</strong>
						<span>{invoice.customer.email}</span>
					</li>
				</ul>
			</Container>
		</main>
	);
}
