'use server';

import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';

import { Invoices } from '@/db/schema';
import { db } from '@/db';

export async function formAction(formData: FormData) {
	const { userId } = auth();
	const amount = Math.floor(parseFloat(String(formData.get('amount'))) * 100);
	const description = formData.get('description') as string;

	if (!userId) {
		return;
	}

	const results = await db
		.insert(Invoices)
		.values({
			amount,
			description,
			status: 'open',
		})
		.returning({
			id: Invoices.id,
		});

	redirect(`/invoices/${results[0].id}`);
}
