import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "@services/firebase/config";
import { SimpleButton } from "@components/atoms/Button";

const Register = () => {
	const [errors, setErrors] = useState({ general: "" });
	const navigate = useNavigate();
	const provider = new GoogleAuthProvider();

	const googleSignInHandler = async () => {
		try {
			// Iniciar sesión con Google
			const result = await signInWithPopup(auth, provider);
			const user = result.user;

			// Guardar los datos del usuario en Firestore
			await setDoc(doc(db, `userAuth/${user.uid}`), {
				uid: user.uid,
				email: user.email,
				displayName: user.displayName || '',
				providerId: user.providerData[0].providerId,
				rol: 'user',
				registrationDate: new Date().toISOString(),
			});

			// Redirigir al usuario a la página deseada después del inicio de sesión
			navigate("/");

		} catch (error) {
			console.error('Error during Google sign-in:', error);
			setErrors({ general: error.message });
		}
	};

	return (
		<form className="flex-center flex-col rounded-xl w-10/12 max-w-[666px] py-12 px-6 text-center bg-white -mt-40 mb-40 border">
			<h1 className="text-xl font-semibold text-main-dark">Regístrate con Google</h1>
			{errors.general && <span className="text-sm text-red-600">{errors.general}</span>}

			{/* Botón de Google */}
			<div className="w-full my-3 flex-center">
				<SimpleButton
					text={"Regístrarse con Google"}
					onClick={googleSignInHandler}
				/>
			</div>
		</form>
	);
};

export { Register };
