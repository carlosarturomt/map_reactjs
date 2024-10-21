import React, { useLayoutEffect } from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const container = document.getElementById("root")
const root = createRoot(container)

const Wrapper = ({ children }) => {
	const location = useLocation()
	useLayoutEffect(() => {
		document.documentElement.scrollTo(0, 0)
	}, [location.pathname])
	return children
}

root.render(
	<BrowserRouter>
		<Wrapper>
			<React.StrictMode>
				<App />
			</React.StrictMode>
		</Wrapper>
	</BrowserRouter>
)