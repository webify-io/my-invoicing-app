import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function Home() {
	return (
		<main className="flex flex-col justify-center h-full gap-6 max-w-5xl mx-auto my-12">
			<div className="flex justify-between">
				<h1 className="text-3xl font-semibold">Create Invoice</h1>
			</div>

			<form className="grid gap-4 max-w-xs">
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
					<Label htmlFor="amount" className="block mb-2 font-semibold text-sm">
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
					<Button className="w-full font-semibold">Submit</Button>
				</div>
			</form>
		</main>
	);
}
