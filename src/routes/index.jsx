import { Suspense, lazy } from "react";
import { useRoutes } from "react-router-dom";

// Lazy loading components
const HomePage = lazy(() => import("../pages/HomePage"));
const LoginPage = lazy(() => import("../pages/LoginPage"));
const RegisterPage = lazy(() => import("../pages/RegisterPage"));
const AdminPage = lazy(() => import("../pages/AdminPage"));
const Spinner = lazy(() => import("@components/atoms/Spinner"));

export const Routes = () => {
	const routes = useRoutes([
		{ path: "/", element: <HomePage /> },
		{ path: "/login", element: <LoginPage /> },
		{ path: "/register", element: <RegisterPage /> },
		{ path: "/admin", element: <AdminPage /> },
		{ path: "/*", element: 'Error' },
	]);

	return <Suspense fallback={<Spinner bgTheme={true} />}>{routes}</Suspense>;
};