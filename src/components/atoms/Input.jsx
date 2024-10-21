import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@services/firebase/config";
import { ICONS } from "@assets/icons";

const fetchCountries = async () => {
	const optionsArray = [];
	try {
		const response = await fetch('https://restcountries.com/v3.1/all');
		const countries = await response.json();
		optionsArray.push(...countries.map(country => ({
			value: country.cca2, // o country.cca3 para el código de tres letras
			label: country.name.common,
		})));
	} catch (error) {
		console.error("Error fetching countries:", error);
	}
	return optionsArray;
};

const fetchOptions = async (collectionName) => {
	const optionsArray = [];
	try {
		const querySnapshot = await getDocs(collection(db, collectionName));
		querySnapshot.forEach((doc) => {
			optionsArray.push({
				value: doc.id,
				label: doc.data().nombre,
			});
		});
	} catch (error) {
		console.error("Error fetching options:", error);
	}
	return optionsArray;
};

const InputField = ({ value, onChange, placeholder, type, name }) => {

	return (
		<label className="w-full py-1 font-medium mt-1 text-main-dark">
			<input
				type={type}
				value={value}
				name={name}
				onChange={onChange}
				placeholder={placeholder}
				className={`w-full h-10 outline-none text-sm px-2 font-medium border-b-2 text-main-dark border-main-highlight/50 focus:border-main-highlight`}
			/>
		</label>
	);
};

const SelectField = ({ label, value, onChange, children, icon, classIcon, name }) => {
	return (
		<label className="w-full py-1">
			<span className="text-main-blue">{label}</span>
			<div className="w-full flex-center">
				<i className={`flex-center w-10 h-10 rounded-l-md ${classIcon ? classIcon : 'border border-main-gray/50 bg-white'}`}>
					{icon}
				</i>
				<select
					value={value}
					name={name}
					onChange={onChange}
					className={`w-full h-10 outline-none text-sm px-3 font-semibold rounded-r-md border-main-gray/50 bg-white/50 ${!classIcon && 'border'}
						${value ? 'text-main-blue' : 'text-main-gray'}`}
				>
					<option value="" hidden className="text-main-gray">Seleccione una opción...</option>
					{children}
				</select>
			</div>
		</label>
	);
};

const SelectFieldDynamic = ({
	id,
	name,
	value,
	onChange,
	classIcon,
	icon,
	label,
	collectionName,
	isCountry
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [displayValue, setDisplayValue] = useState('Seleccione una opción...');
	const [options, setOptions] = useState([]);
	const [isOtherSelected, setIsOtherSelected] = useState(false);
	const [customValue, setCustomValue] = useState('');

	useEffect(() => {
		const loadOptions = async () => {
			try {
				let optionsData = isCountry ? await fetchCountries() : await fetchOptions(collectionName);
				const otherOption = optionsData.find(option => option.label === "Otro");
				const filteredOptions = optionsData.filter(option => option.label !== "Otro");

				if (otherOption) {
					filteredOptions.push(otherOption);
				}

				setOptions(filteredOptions);
			} catch (error) {
				console.error("Error loading options:", error);
			}
		};

		loadOptions();
	}, [collectionName, isCountry]);

	useEffect(() => {
		const selectedOption = options.find(option => option.value === value);
		setDisplayValue(selectedOption ? selectedOption.label : 'Seleccione una opción...');
	}, [value, options]);

	const filteredOptions = options.filter(option =>
		option.label.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const handleSelectChange = (selectedValue) => {
		const selectedOption = options.find(option => option.value === selectedValue);

		if (selectedValue === "otro") {
			setIsOtherSelected(true);
			setCustomValue('');
			setDisplayValue('');
		} else if (selectedValue === "0") {
			setIsOtherSelected(false);
			setDisplayValue("Ninguna");
			onChange({ target: { name, value: "Ninguna" } });
		} else {
			setIsOtherSelected(false);
			setDisplayValue(selectedOption ? selectedOption.label : 'Seleccione una opción...');
			onChange({ target: { name, value: selectedOption && selectedOption.label } });
		}
		setIsOpen(false);
	};

	const handleCustomValueChange = (e) => {
		const newValue = e.target.value;
		setCustomValue(newValue);
		onChange({ target: { name, value: newValue } });
	};

	return (
		<div className="w-full relative text-main-blue">
			{label}
			<div className="w-full flex-center">
				<i className={`flex-center w-10 h-10 rounded-l-md ${classIcon || 'border border-main-gray/50 bg-white'}`}>
					{icon}
				</i>
				{isOtherSelected ? (
					<input
						type="text"
						id={id}
						name={name}
						value={customValue}
						onChange={handleCustomValueChange}
						className="w-full h-10 outline-none text-sm px-3 font-semibold rounded-r-md focus:text-main-blue border-main-gray/50 bg-white/50"
						placeholder="Escriba su opción..."
					/>
				) : (
					<input
						type="text"
						id={id}
						name={name}
						value={displayValue}
						onClick={() => setIsOpen(true)} // Cambia a true para abrir el dropdown
						className={`w-full h-10 outline-none text-sm px-3 font-semibold rounded-r-md border-main-gray/50 bg-white/50 ${displayValue !== 'Seleccione una opción...' ? 'text-main-blue' : 'text-main-gray'}`}
						placeholder="Seleccione una opción..."
						readOnly
					/>
				)}
			</div>

			{isOpen && (
				<div className="absolute w-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-10">
					<input
						type="text"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-full px-3 py-2 border-b border-gray-300 outline-none"
						placeholder="Buscar..."
					/>

					<div className="max-h-60 overflow-y-auto">
						{filteredOptions.length === 0 ? (
							<div className="px-3 py-2 text-main-blue">No hay opciones</div>
						) : (
							filteredOptions.map((option) => (
								<div
									key={option.value}
									onClick={() => handleSelectChange(option.value)}
									className="px-3 py-2 cursor-pointer hover:bg-main-secondary/10"
								>
									{option.label}
								</div>
							))
						)}
					</div>
				</div>
			)}
		</div>
	);
};

const TwoOptionsSelect = ({ label, name, onChange }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [displayValue, setDisplayValue] = useState('Seleccione una opción...');
	const [isOtherSelected, setIsOtherSelected] = useState(false);
	const [customValue, setCustomValue] = useState('');

	const options = [
		{ value: "ninguna", label: "Ninguna" },
		{ value: "otro", label: "Otro" },
	];

	const handleSelectChange = (selectedValue) => {
		if (selectedValue === "otro") {
			setIsOtherSelected(true);
			setCustomValue('');
			setDisplayValue('');
		} else {
			setIsOtherSelected(false);
			setDisplayValue("Ninguna");
			onChange({ target: { name, value: "Ninguna" } }); // Enviar "Ninguna" al padre
		}
		setIsOpen(false);
	};

	const handleCustomValueChange = (e) => {
		const newValue = e.target.value;
		setCustomValue(newValue);
		setDisplayValue(newValue); // Actualiza el displayValue con el valor personalizado
		onChange({ target: { name, value: newValue } }); // Enviar valor personalizado al padre
	};

	return (
		<div className="w-full relative text-main-blue">
			{label}
			<div className="w-full flex-center">

				{!isOtherSelected ? (<input
					type="text"
					value={displayValue}
					onClick={() => setIsOpen(!isOpen)}
					className={`w-full h-10 outline-none text-sm px-3 font-semibold rounded-md border-main-gray/50 bg-white/50 ${displayValue !== 'Seleccione una opción...' ? 'text-main-blue' : 'text-main-gray'}`}
					placeholder="Seleccione una opción..."
					readOnly
				/>) : (
					<input
						type="text"
						value={customValue}
						onChange={handleCustomValueChange}
						className="w-full h-10 outline-none text-sm px-3 font-semibold rounded-md border-main-gray/50 bg-white/50"
						placeholder="Escriba su opción..."
					/>
				)}
			</div>

			{isOpen && (
				<div className="absolute w-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-10">
					<div className="max-h-60 overflow-y-auto">
						{options.map((option) => (
							<div
								key={option.value}
								onClick={() => handleSelectChange(option.value)}
								className="px-3 py-2 cursor-pointer hover:bg-main-secondary/10"
							>
								{option.label}
							</div>
						))}
					</div>

				</div>
			)}
		</div>
	);
};

const CustomCheckbox = ({ id, isSelected, onChange }) => {
	return (
		<div className="flex-center">
			<div className="w-min rounded-full" onClick={() => onChange(id)}>
				<span className={`w-4 h-4 flex-center rounded-full cursor-pointer transition-colors duration-300 ${isSelected ? "bg-main-blue/10" : "border bg-white border-main-gray"}`}>
					{isSelected && ICONS.logo.pepsiCo()}
				</span>
				<input type="checkbox" checked={isSelected} onChange={() => onChange(id)} className="sr-only" />
			</div>
		</div>
	);
};


export { InputField, SelectField, SelectFieldDynamic, TwoOptionsSelect, CustomCheckbox };
