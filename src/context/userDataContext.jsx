import { createContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "@services/firebase/config";

export const UserDataContext = createContext();

export function UserDataProvider({ children }) {
	const [user, setUser] = useState(null);
	const [userAuth, setUserAuth] = useState({});
	const [userData, setUserData] = useState({});

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (userFirebase) => {
			if (userFirebase) {
				setUser(userFirebase);

				const userID = userFirebase.uid;
				const docRefAuth = doc(db, `userAuth/${userID}`);

				// Cargar userAuth
				const authDetail = await getDoc(docRefAuth);
				setUserAuth(authDetail.data() || null);
			} else {
				setUser(null);
				setUserAuth(null);
				setUserData(null);
			}
		});

		return () => unsubscribe();
	}, []);

	useEffect(() => {
		const loadUserData = async () => {
			try {
				if (userAuth.username) {
					const docRefData = doc(db, `userData/${userAuth.username}`);
					const dataDetail = await getDoc(docRefData);
					setUserData(dataDetail.data() || null);
				}
			} catch (error) {
				console.error('Error loading user data:', error);
			}
		};

		loadUserData();
	}, [userAuth]);

	return (
		<UserDataContext.Provider value={{ user, userAuth, userData }}>
			{children}
		</UserDataContext.Provider>
	);
}
