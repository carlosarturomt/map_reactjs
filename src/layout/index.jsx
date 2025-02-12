import { Outlet } from "react-router-dom";
import { Navigation } from "@components/organisms/Navigation";

export default function Layout() {
	return (
		<main className="relative w-full h-full flex-center">
			<section className="w-full h-full max-w-screen-3xl mx-auto">
				<Outlet /> {/* Renderiza el contenido de las rutas anidadas */}
			</section>
			<Navigation />
		</main>
	);
}