import { Button } from '@/components/ui/button';
import Container from '@/components/Container';
import Link from 'next/link';

export default function Home() {
	return (
		<main className="flex h-full justify-center items-center text-center gap-6">
			<Container>
				<div className="flex-col text-2xl font-semibold mb-4">
					<h1 className="text-5xl font-bold">InvoiceEase</h1>
					<h2>by Webify</h2>
				</div>
				<p>
					<Button asChild>
						<Link href="/dashboard">Sign In</Link>
					</Button>
				</p>
			</Container>
		</main>
	);
}
