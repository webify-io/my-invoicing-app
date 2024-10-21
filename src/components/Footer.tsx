import Container from '@/components/Container';
import Link from 'next/link';

const Footer = () => {
	return (
		<footer className="mt-16 mb-6">
			<Container className="flex justify-between text-sm">
				<p>InvoiceEase &copy; {new Date().getFullYear()}.</p>
				<p>
					Created by
					<Link
						href="https://www.webify.org.za/"
						className="font-semibold hover:text-black/30"
					>
						{' '}
						Webify{' '}
					</Link>
					with Next.js, Xata and Clerk.
				</p>
			</Container>
		</footer>
	);
};

export default Footer;
