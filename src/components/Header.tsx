import {
	OrganizationSwitcher,
	SignInButton,
	SignedIn,
	SignedOut,
	UserButton,
} from '@clerk/nextjs';
import Container from '@/components/Container';
import Link from 'next/link';

const Header = () => {
	return (
		<header className="mt-8 mb-12">
			<Container>
				<div className="flex justify-between items-center gap-4">
					<div className="flex items-center gap-4">
						<p className="font-bold text-xl">
							<Link href="/dashboard">InvoiceEase</Link>
						</p>
						<SignedIn>
							<span className="text-slate-300">/</span>
							<span className="-ml-2">
								<OrganizationSwitcher afterCreateOrganizationUrl="/dashboard" />
							</span>
						</SignedIn>
					</div>

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
