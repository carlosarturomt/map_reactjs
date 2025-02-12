import { Suspense, lazy } from "react";
import { useRoutes } from "react-router-dom";
import Layout from "@layout";

// Lazy loading components
const HomePage = lazy(() => import("../pages/HomePage"));
const MapPage = lazy(() => import("../pages/MapPage"));
const LoginPage = lazy(() => import("../pages/LoginPage"));
const RegisterPage = lazy(() => import("../pages/RegisterPage"));
const AdminPage = lazy(() => import("../pages/AdminPage"));
const Spinner = lazy(() => import("@components/atoms/Spinner"));

export const Routes = () => {
	const routes = useRoutes([
		{
			element: <Layout />,
			children: [
				{ path: "/", element: <HomePage /> },
				{ path: "/events", element: <MapPage /> },
				{ path: "/admin", element: <AdminPage /> },
			],
		},
		{ path: "/login", element: <LoginPage /> },
		{ path: "/register", element: <RegisterPage /> },
		{ path: "/*", element: 'Error' },
	]);

	return <Suspense fallback={<Spinner bgTheme={true} />}>{routes}</Suspense>;
};