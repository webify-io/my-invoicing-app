import { db } from '@/db';
import { Customers, Invoices } from '@/db/schema';
import { auth } from '@clerk/nextjs/server';
import { eq, and, isNull } from 'drizzle-orm';

import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CirclePlus } from 'lucide-react';
import Container from '@/components/Container';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default async function Home() {
	const { userId, orgId } = auth();

	if (!userId) return;

	let results;

	if (orgId) {
		results = await db
			.select()
			.from(Invoices)
			.innerJoin(Customers, eq(Invoices.customerId, Customers.id))
			.where(eq(Invoices.organizationId, orgId));
	} else {
		results = await db
			.select()
			.from(Invoices)
			.innerJoin(Customers, eq(Invoices.customerId, Customers.id))
			.where(and(eq(Invoices.userId, userId), isNull(Invoices.organizationId)));
	}

	const invoices = results?.map(({ invoices, customers }) => {
		return {
			...invoices,
			customer: customers,
		};
	});

	return (
		<main className="h-full">
			<Container>
				<div className="flex justify-between mb-4">
					<h1 className="text-3xl font-semibold">Invoices</h1>
					<p>
						<Button asChild variant="ghost" className="inline-flex gap-2">
							<Link href="/invoices/new">
								<CirclePlus className="h-4 w-4" />
								Create Invoice
							</Link>
						</Button>
					</p>
				</div>

				<Table>
					<TableCaption>A list of your recent invoices.</TableCaption>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[40px] p-4">ID</TableHead>
							<TableHead className="w-[100px] p-4">Date</TableHead>
							<TableHead className="p-4">Customer</TableHead>
							<TableHead className="p-4">Email</TableHead>
							<TableHead className="text-center p-4">Status</TableHead>
							<TableHead className="text-right p-4">Amount</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{invoices.map((result) => {
							return (
								<TableRow key={result.id}>
									<TableCell className="font-medium text-left p-0">
										<Link
											href={`/invoices/${result.id}`}
											className="block font-semibold p-4"
										>
											{result.id}
										</Link>
									</TableCell>
									<TableCell className="font-medium text-left p-0">
										<Link
											href={`/invoices/${result.id}`}
											className="block font-semibold p-4"
										>
											{new Date(result.createTs).toLocaleDateString()}
										</Link>
									</TableCell>
									<TableCell className="text-left p-0">
										<Link
											href={`/invoices/${result.id}`}
											className="block font-semibold p-4"
										>
											{result.customer.name}
										</Link>
									</TableCell>
									<TableCell className="text-left p-0">
										<Link
											href={`/invoices/${result.id}`}
											className="block text-black/40 p-4"
										>
											{result.customer.email}
										</Link>
									</TableCell>
									<TableCell className="text-center p-0">
										<Link href={`/invoices/${result.id}`} className="block p-4">
											<Badge
												className={cn(
													'rounded-full capitalize',
													result.status === 'open' && 'bg-blue-500',
													result.status === 'paid' && 'bg-green-600',
													result.status === 'void' && 'bg-zinc-500',
													result.status === 'uncollectable' && 'bg-red-500'
												)}
											>
												{result.status}
											</Badge>
										</Link>
									</TableCell>
									<TableCell className="text-right p-0">
										<Link
											href={`/invoices/${result.id}`}
											className="block font-semibold p-4"
										>
											R{(result.amount / 100).toFixed(2)}
										</Link>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</Container>
		</main>
	);
}
