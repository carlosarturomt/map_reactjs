import { useContext } from "react";
import { UserDataContext } from "@context/userDataContext";
import MapPage from "./MapPage";

function HomePage() {
	const { user } = useContext(UserDataContext);

    return user ? <MapPage /> : "Inicia sesión";
}

export default HomePage;