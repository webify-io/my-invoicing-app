import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
	return (
		<main className="flex flex-col justify-center h-screen text-center gap-6 max-w-5xl mx-auto">
			<div className="flex flex-col text-2xl font-semibold">
				<h1 className="text-5xl font-bold">InvoiceEase</h1>
				<h2>by Webify</h2>
			</div>
			<p>
				<Button asChild>
					<Link href="/dashboard">Sign In</Link>
				</Button>
			</p>
		</main>
	);
}
