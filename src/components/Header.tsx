import {
	ClerkProvider,
	SignInButton,
	SignedIn,
	SignedOut,
	UserButton,
} from '@clerk/nextjs';
import Container from '@/components/Container';
import Link from 'next/link';

const Header = () => {
	return (
		<header className="my-6">
			<Container>
				<div className="flex justify-between items-center gap-4">
					<Link href="/dashboard">
						<p className="font-bold text-xl">InvoiceEase</p>
					</Link>

					<div className="rounded px-1 py-0.5 text-neutral-700 outline-none hover:bg-neutral-100 focus-visible:bg-neutral-100">
						<SignedOut>
							<SignInButton />
						</SignedOut>
						<SignedIn>
							<UserButton />
						</SignedIn>
					</div>
				</div>
			</Container>
		</header>
	);
};

export default Header;
