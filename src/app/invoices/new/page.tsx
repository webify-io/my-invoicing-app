'use client';

import { SyntheticEvent, useState } from 'react';

import Form from 'next/form';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import SubmitButton from '@/components/SubmitButton';
import Container from '@/components/Container';

import { formCreateAction } from '@/app/actions';

export default function Home() {
	const [state, setState] = useState('ready');

	async function handleOnSubmit(event: SyntheticEvent) {
		if (state === 'pending') {
			event.preventDefault();
			return;
		}
		setState('pending');
	}

	/* async function handleOnSubmit(event: SyntheticEvent) {
		event.preventDefault();
		if (state === 'pending') return;
		setState('pending');

		const target = event.target as HTMLFormElement;

		startTransition(async () => {
			const formData = new FormData(target);
			await formAction(formData);
			console.log('Hey Request Pending');
		});
	} */

	return (
		<main className="h-full">
			<Container>
				<h1 className="text-3xl font-semibold mb-4">Create Invoice</h1>

				<Form
					action={formCreateAction}
					onSubmit={handleOnSubmit}
					className="grid gap-4 max-w-xs"
				>
					<div>
						<Label htmlFor="name" className="block mb-2 font-semibold text-sm">
							Billing Name
						</Label>
						<Input id="name" name="name" type="text" />
					</div>
					<div>
						<Label htmlFor="email" className="block mb-2 font-semibold text-sm">
							Billing Email
						</Label>
						<Input id="email" name="email" type="email" />
					</div>
					<div>
						<Label
							htmlFor="amount"
							className="block mb-2 font-semibold text-sm"
						>
							Amount
						</Label>
						<Input id="amount" name="amount" type="text" />
					</div>
					<div>
						<Label
							htmlFor="description"
							className="block mb-2 font-semibold text-sm"
						>
							Description
						</Label>
						<Textarea id="description" name="description"></Textarea>
					</div>
					<div>
						<SubmitButton />
					</div>
				</Form>
			</Container>
		</main>
	);
}
