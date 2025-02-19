import { useContext } from "react";
import { UserDataContext } from "@context/userDataContext";
import MapPage from "./MapPage";

function HomePage() {
    const { user } = useContext(UserDataContext);

    //return user ? <MapPage /> : "Inicia sesión";

    return (
        <div className="w-full h-screen py-3 px-6">
            <p>Home</p>
        </div>
    )
}

export default HomePage;