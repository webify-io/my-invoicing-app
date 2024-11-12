import { Button } from '@/components/ui/button';
import Container from '@/components/Container';
import Link from 'next/link';

export default function Home() {
	return (
		<main className="flex h-full justify-center items-center text-center gap-6 max-w-sm  mx-auto rounded-xl bg-zinc-900 p-5 outline outline-blue-500">
			<Container>
				<div className="flex-col text-2xl font-semibold mb-4 text-white">
					<h1 className="text-5xl font-bold">InvoiceEase</h1>
					<h2>by Webify</h2>
				</div>
				<p>
					<Button
						asChild
						className="bg-blue-500 hover:bg-blue-600 text-white tracking-wider"
					>
						<Link href="/dashboard">Sign in</Link>
					</Button>
				</p>
			</Container>
		</main>
	);
}
