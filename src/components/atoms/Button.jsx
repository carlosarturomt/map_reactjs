import { useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { auth } from "@services/firebase/config";
import { ICONS } from "@assets/icons"
import { signOut } from "firebase/auth";

const ValidateButton = ({ onClick, disabled, loading, text }) => {
	return (
		<button
			className="w-full h-10 rounded-md uppercase my-2 text-white bg-main-blue"
			onClick={onClick}
			disabled={disabled}
		>
			{loading ? "Validando..." : text}
		</button>
	);
};

const SimpleButton = ({ onClick, disabled, text, bgColor, isSubmit }) => {
	return (
		<button
			type={isSubmit ? "submit" : "button"} // Cambia el tipo según sea necesario
			className={`${bgColor ? bgColor : 'hover:bg-main-blue'} ${bgColor && bgColor.includes('bg-main-light') ? 'text-main-prusia' : 'text-white'} w-full flex-center gap-1 text-sm font-semibold bg-main-blue/80 text-white rounded-3xl p-3 transition-colors duration-200 hover:bg-main-primary-dark`}
			onClick={onClick}
			disabled={disabled}
		>
			{text}
		</button>
	);
};

function LinkButton({ to, target, download, text, bgColor }) {
	return (
		<NavLink
			to={to}
			target={target}
			download={download}
			aria-label={`open ${to}`}
			className={`flex-center h-10 rounded-md uppercase my-2 px-4 transition ease-in-out duration-500 hover:bg-main-blue text-white ${bgColor ? bgColor : 'bg-main-blue/80'}`}
		>
			{text}
		</NavLink>
	);
}

function Switcher() {
	const [colorTheme, setTheme] = useDarkMode();
	const [darkMode, setDarkMode] = useState(
		colorTheme === "light" ? true : false
	);

	const toggleDarkMode = (checked) => {
		setTheme(colorTheme);
		setDarkMode(checked);
	};

	return (
		<div
			className="flex items-center animate-underline w-fit hover:animate-pulse"
			onClick={toggleDarkMode}
		>
			<div className="flex justify-center">
				<DarkModeSwitch
					checked={darkMode}
					onChange={toggleDarkMode}
					size={20}
				/>
			</div>
			{/* <span className='cursor-pointer'>Theme</span> */}
		</div>
	);
}

function ToggleButton({ activeToggle, title, onClick, children }) {
	const isActive = activeToggle === title;

	const containerClasses = `w-full ruby flex-col md:flex-row justify-between md:items-center cursor-pointer gap-1 no-seleccionable hover:text-[#003195] hover:dark:text-[#E0E0E0] transition-colors duration-500 ${isActive && "text-[#003195] dark:text-[#b2c1df]"
		}`;

	return (
		<li
			className={containerClasses}
			onClick={onClick}
			aria-expanded={isActive}
			aria-controls={`toggle-content-${title}`}
		>
			<span className="w-full flex justify-between ">
				<span className="w-max-content">{title}</span>
				<i className="flex items-center justify-center w-4 h-4 pt-1 md:pt-2 lg:pt-3">
					{isActive ? ICONS.plane.border('#000') : ICONS.plane.border('#000')}
				</i>
			</span>
			{isActive && (
				<>
					<span
						className={`md:absolute z-50 md:mt-[65px] left-0 top-0 md:py-2 md:px-4 w-full flex justify-center border-t-2 bg-main-light dark:border-[#5376d65f] dark:bg-[#000e2c] dark:text-[#b2c1df] ${isActive ? " animate-accordion-down " : " animate-accordion-up "
							}`}
					>
						<span
							className={`w-full max-w-screen-2xl px-1 ${isActive && " animate-fade-in "
								}`}
						>
							{children}
						</span>
					</span>
					<div
						className={`absolute -z-10 md:mt-[80px] left-0 top-0 md:py-2 md:px-4 w-full h-screen`}
					></div>
				</>
			)}
		</li>
	);
}

function LogOutButton() {
	const navigate = useNavigate();

	const handleLogout = () => {
		signOut(auth)
			.then(() => {
				// Sign-out successful.
				navigate("/");
				console.log("Signed out successfully");
				window.location.reload();
			})
			.catch((error) => {
				// An error happened.
				console.log("error", error);
			});
	};

	return (
		<button
			onClick={handleLogout}
			className="flex-center font-medium py-2 px-4 rounded-md text-main-light bg-main-blue"
		>
			<span className="uppercase hover:animate-pulse">
				Cerrar Sesión
			</span>
		</button>
	);
}

function FilterButton({ items = [], label }) {
	const activatorRef = useRef(null);
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className={"relative inline-block"}>
			<button
				className="h-fit py-2 px-4 rounded font-medium text-sm text-center inline-flex items-center ml-2 my-1 text-white bg-main-blue"
				aria-haspopup="true"
				aria-controls={label}
				onClick={() => setIsOpen(!isOpen)}
				ref={activatorRef}
			>
				{label}
				{isOpen ? (
					<svg
						height="24"
						fill="rgb(255,255,255)"
						viewBox="0 0 24 24"
						width="24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path d="m0 0h24v24h-24z" fill="none" />
						<path d="m7.41 15.41 4.59-4.58 4.59 4.58 1.41-1.41-6-6-6 6z" />
					</svg>
				) : (
					<svg
						height="24"
						fill="rgb(255,255,255)"
						viewBox="0 0 24 24"
						width="24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path d="m0 0h24v24h-24z" fill="none" />
						<path d="m7.41 8.59 4.59 4.58 4.59-4.58 1.41 1.41-6 6-6-6z" />
					</svg>
				)}
			</button>

			<ul
				className={`absolute right-0 m-0 z-[1000] rounded-md p-0 bg-[#162640] shadow-sm shadow-gray-500 ${
					isOpen
						? "grid grid-cols-[repeat(auto-fill,minmax(183px,1fr))]"
						: "hidden"
				}`}
			>
				{items.map((item, index) => {
					return (
						<li
							className={"list-none last:mb-0"}
							key={index}
							onClick={() => setIsOpen(!isOpen)}
						>
							<button
								className="w-full py-1 px-4 text-gray-100 hover:bg-[#ffffff42] ml-0 animate-pulse hover:animate-none"
								value={item.anchor}
								onClick={item.slug}
							>
								{item.label}
							</button>
						</li>
					);
				})}
			</ul>
		</div>
	);
}


export { ValidateButton, SimpleButton, LinkButton, ToggleButton, Switcher, LogOutButton, FilterButton };
