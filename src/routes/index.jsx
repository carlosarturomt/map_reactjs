import { Suspense, lazy } from "react";
import { useRoutes } from "react-router-dom";

// Lazy loading components
const HomePage = lazy(() => import("../components/pages/HomePage"));
const LoginPage = lazy(() => import("../components/pages/LoginPage"));
const RegisterPage = lazy(() => import("../components/pages/RegisterPage"));
const Spinner = lazy(() => import("@components/atoms/Spinner"));

export const Routes = () => {
	const routes = useRoutes([
		{ path: "/", element: <HomePage /> },
		{ path: "/login", element: <LoginPage /> },
		{ path: "/register", element: <RegisterPage /> },
		{ path: "/*", element: 'Error' },
	]);

	return <Suspense fallback={<Spinner bgTheme={true} />}>{routes}</Suspense>;
};