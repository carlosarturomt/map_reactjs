import { useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from "@services/firebase/config";
import { SimpleButton } from "@components/atoms/Button";

const Login = () => {
	const navigate = useNavigate();

	const signInWithGoogle = async () => {
		const provider = new GoogleAuthProvider();
		try {
			// Iniciar sesión con Google
			await signInWithPopup(auth, provider);
			// Redirigir a la página principal u otra ruta
			navigate('/'); // Cambia '/home' a la ruta deseada
		} catch (err) {
			console.error('Error al iniciar sesión con Google:', err);
		}
	};

	return (
		<div className="flex-center flex-col p-6 rounded-xl w-10/12 bg-white -mt-60 mb-60">
			<h1 className="text-xl font-semibold mb-6 text-main-dark">Iniciar Sesión con Google</h1>

			{/* Botón de inicio de sesión con Google */}
			<div className="w-full flex-center">
				<SimpleButton
					text={"Iniciar sesión con Google"}
					onClick={signInWithGoogle}
					className="bg-main-highlight text-white w-full py-3"
				/>
			</div>
		</div>
	);
};

export { Login };
