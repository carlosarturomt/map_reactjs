import { useContext } from "react";
import { UserDataContext } from "@context/userDataContext";
import { LogOutButton } from "../components/atoms/Button";

function AdminPage() {
	const { user } = useContext(UserDataContext);

    return user ? (
        <>
            <LogOutButton />
        </>
    ) : "Inicia sesión";
}

export default AdminPage;