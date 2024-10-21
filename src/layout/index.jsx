import { NavigationFooter } from "@components/organisms/Navigation";

export default function Layout({ children }) {
	return (
		<main className="relative h-full p-3 flex-center bg-main-light">
			<section className="w-full h-full max-w-screen-sm">
				{children}
			</section>
			<NavigationFooter />
		</main>
	);
}
