import { useContext, useEffect, useRef, useState } from "react";
import { UserDataContext } from "@context/userDataContext";
import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "@services/firebase/config";

function MapPage() {
	const [data, setData] = useState({ mesa: "", sillas: "" });
	const [selectedSilla, setSelectedSilla] = useState(null);
	const [selectedSillas, setSelectedSillas] = useState([]);
	const [selectedMesa, setSelectedMesa] = useState(null);
	const [sectionMark, setSectionMark] = useState(false);
	const [hoveredMesa, setHoveredMesa] = useState(null);
	const [scale, setScale] = useState(1); // Estado para el nivel de zoom
	const [isPanning, setIsPanning] = useState(false); // Estado para saber si estamos arrastrando
	const [origin, setOrigin] = useState({ x: 0, y: 0 }); // Estado para almacenar el punto de inicio del arrastre
	const [translate, setTranslate] = useState({ x: 0, y: 0 }); // Estado para la traducción (desplazamiento)
	const [pointerPosition, setPointerPosition] = useState({ x: 0, y: 0 });
	const [vipSectionMark, setVipSectionMark] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [readyToPay, setReadyToPay] = useState(false);
	const [breakfast, setBreakfast] = useState(false);
	const [lunch, setLunch] = useState(false);
	const [dinner, setDinner] = useState(false);

	const { user } = useContext(UserDataContext);

	const svgRef = useRef(null);

	const handleSillaClick = (sillaId) => {
		// Si la silla ya está seleccionada, la removemos de la lista
		if (selectedSillas.includes(sillaId)) {
			setSelectedSillas(selectedSillas.filter((silla) => silla !== sillaId));
		} else {
			// Si no está seleccionada, la agregamos
			setSelectedSillas([...selectedSillas, sillaId]);
		}
		//setSelectedSilla(sillaId);
		// Actualizamos la mesa correspondiente a la silla seleccionada
		const mesaId = `mesa-${getMesaFromSilla(sillaId)}`;
		setSelectedMesa(mesaId);
		setScale(1);
		setTranslate({ x: 0, y: 0 });
		const mesa = mesas.find((mesa) => mesa.id === mesaId);
		if (mesa) {
			setPointerPosition({ x: mesa.cx, y: mesa.cy });
		} else {
			console.warn("No se encontró la mesa con id:", mesaId);
		}
	};

	const handleMesaClick = (mesaId) => {
		if (!mesas || !Array.isArray(mesas)) {
			console.error('La variable "mesas" no está definida o no es un array');
			return;
		}

		if (mesaId.startsWith("vip-")) {
			// Lógica para mesas VIP
			if (selectedMesa === mesaId) {
				setSelectedMesa(null);
				setSelectedSillas([]);
			} else {
				setSelectedMesa(mesaId);
				setSelectedSilla(null);
				const vipSillas = sillas
					.filter((silla) =>
						silla.id.startsWith(`silla-${mesaId.split("-")[1]}_`)
					)
					.map((silla) => silla.id);
				setSelectedSillas(vipSillas);
			}
		} else {
			// Lógica para mesas normales
			if (selectedMesa === mesaId) {
				setSelectedMesa(null);
				setSelectedSillas([]);
			} else {
				setSelectedMesa(mesaId);
				setSelectedSilla(null);
				const mesaSillas = sillas
					.filter((silla) =>
						silla.id.startsWith(`silla-${mesaId.split("-")[1]}_`)
					)
					.map((silla) => silla.id);
				setSelectedSillas(mesaSillas);

				// Restablecer el zoom al seleccionar una mesa
				setScale(1);
				setTranslate({ x: 0, y: 0 });

				// Actualizar la posición del puntero
				const mesa = mesas.find((mesa) => mesa.id === mesaId);
				if (mesa) {
					setPointerPosition({ x: mesa.cx, y: mesa.cy });
				} else {
					console.warn("No se encontró la mesa con id:", mesaId);
				}
			}
		}
	};

	// Definir el tamaño de la pista de baile
	const pistaAncho = 750; // Ancho de la pista
	const pistaAlto = 500; // Alto de la pista

	// Definir la posición de la pista de baile
	const pistaX = 1825; // Posición X de la pista (ajústala según tu diseño)
	const pistaY = 950; // Posición Y de la pista (ajústala según tu diseño)

	// Definimos cuántas mesas y sillas vamos a tener
	const numMesas = 200; // Número total de mesas requeridas
	const sillasPorMesa = 10; // Sillas por mesa
	// Definimos los espacios entre las mesas
	const mesaSpacingX = 222; // Distancia horizontal entre mesas
	const mesaSpacingY = 244; // Distancia vertical entre mesas

	// Las sillas estarán distribuidas alrededor de cada mesa
	const sillaOffset = [
		{ x: -25, y: -65 }, //1
		{ x: 10, y: -65 }, //2
		{ x: -55, y: -45 }, //3
		{ x: 40, y: -45 }, //4
		{ x: -70, y: -7 }, //5
		{ x: 55, y: -7 }, //6
		{ x: -55, y: 30 }, //7
		{ x: 40, y: 30 }, //8
		{ x: -25, y: 50 }, //9
		{ x: 10, y: 50 }, //10
	];

	const mesas = [];
	const sillas = [];
	const mesasPorFila = 20; // Número de mesas por fila
	const numSecciones = 10; // Número de secciones
	const letrasSecciones = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

	// Función que determina si la mesa cae dentro de la pista de baile
	const isInsidePista = (mesaX, mesaY) => {
		return (
			mesaX > pistaX &&
			mesaX < pistaX + pistaAncho &&
			mesaY > pistaY &&
			mesaY < pistaY + pistaAlto
		);
	};

	let mesaNumero = 1; // Contador para el número de mesa visible
	let mesasColocadas = 0; // Contador de mesas que han sido colocadas (válidas)
	let fila = 0; // Contador de filas
	let i = 0; // Contador de iteraciones

	// Bucle para generar las mesas
	while (mesasColocadas < numMesas) {
		// Calculamos la posición de la mesa
		const mesaX = 100 + (i % mesasPorFila) * mesaSpacingX;
		const mesaY = 100 + fila * mesaSpacingY;

		if (!isInsidePista(mesaX, mesaY)) {
			// Si la mesa NO está dentro de la pista de baile, la agregamos
			const section =
				Math.floor(mesasColocadas / (numMesas / numSecciones)) + 1;
			const sectionIndex =
				Math.floor(mesasColocadas / (numMesas / numSecciones)) %
				letrasSecciones.length;
			const sectionLetter = letrasSecciones[sectionIndex];

			// Agregamos la mesa con su sección y usamos mesaNumero
			mesas.push({
				id: `mesa-${mesaNumero}`,
				cx: mesaX,
				cy: mesaY,
				section,
				sectionLetter,
			});

			// Agregamos las sillas para cada mesa
			for (let j = 0; j < sillasPorMesa; j++) {
				const sillaX = mesaX + sillaOffset[j].x;
				const sillaY = mesaY + sillaOffset[j].y;
				sillas.push({
					id: `silla-${mesaNumero}_${String.fromCharCode(97 + j)}`,
					x: sillaX,
					y: sillaY,
				});
			}

			mesaNumero++; // Incrementamos el número de mesa visible
			mesasColocadas++; // Incrementamos el contador de mesas válidas (fuera de la pista)
		}

		i++; // Incrementamos el contador de iteraciones

		// Si llegamos al final de la fila, incrementamos el contador de fila
		if (i % mesasPorFila === 0) {
			fila++;
		}
	}

	const getMesaFromSilla = (sillaId) => {
		if (!sillaId) return null;
		// Aseguramos que extrae correctamente el ID de la mesa, por ejemplo "silla-1_a" => "1"
		return sillaId.split("-")[1].split("_")[0];
	};

	// Manejar el zoom
	const handleWheel = (event) => {
		event.preventDefault();
		const newScale = Math.min(Math.max(scale - event.deltaY * 0.01, 1), 10);
		setScale(newScale);
	};

	// Iniciar arrastre
	const handleMouseDown = (event) => {
		if (scale != 1) {
			setIsPanning(true);
			setOrigin({
				x: event.clientX - translate.x,
				y: event.clientY - translate.y,
			});
		}
	};

	// Mover durante el arrastre
	const handleMouseMove = (event) => {
		if (!isPanning) return;

		const newTranslate = {
			x: event.clientX - origin.x,
			y: event.clientY - origin.y,
		};
		setTranslate(newTranslate);
	};

	// Finalizar arrastre
	const handleMouseUp = () => {
		setIsPanning(false);
	};

	const handleCheckboxChange = (event) => {
		setSectionMark(event.target.checked);
	};

	const handleVipCheckboxChange = (event) => {
		setVipSectionMark(event.target.checked);
	};

	const cantidadSillas = selectedMesa && selectedMesa.includes("vip") ? 6 : 12;

	const ConfirmationModal = ({ show, onClose, onConfirm, mesa, sillas }) => {
		if (!show) return null;

		return (
			<div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
				<div className="bg-white rounded-lg p-6 w-full max-w-md">
					<h2 className="text-xl font-semibold mb-4">Confirmar Resevación</h2>
					<p>
						Usted {readyToPay ? "ha reservado " : "va a reservar la "}
						<strong>mesa {mesa.replace("mesa-", "")}</strong> y las sillas:
					</p>
					<p>
						<strong>
							{sillas.map((silla) => silla.replace("silla-", "")).join(", ")}
						</strong>
						.
					</p>
					<p>
						En la Sección{" "}
						<strong>
							{(() => {
								const mesa = mesas.find((mesa) => mesa.id === selectedMesa);
								return mesa ? `General ${mesa.sectionLetter}` : "BTC";
							})()}
						</strong>
						.
					</p>

					{readyToPay && (
						<div>
							<p className="py-2">
								Además de que ha seleccionado reservar el menú de{" "}
								<strong>
								{[
                                    breakfast && "Desayuno",
                                    lunch && "Comida",
                                    dinner && "Cena"
                                ]
                                    .filter(Boolean)
                                    .join(", ")}
								</strong>
							</p>
						</div>
					)}

					<p className="py-2">¿Está seguro?</p>
					<div className="mt-6 flex justify-end space-x-3">
						<button
							className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
							onClick={onClose}
						>
							Cancelar
						</button>
						<button
							className="px-4 py-2 rounded-md text-white bg-[#3b82f6] hover:bg-[#034a84] transition-colors"
							onClick={onConfirm}
						>
							Confirmar
						</button>
					</div>
				</div>
			</div>
		);
	};

	const submitHandle = () => {
		setData({
			mesa: selectedMesa,
			sillas: selectedSillas,
			/* section: {(() => {
				const mesa = mesas.find((mesa) => mesa.id === selectedMesa);
				return mesa ? `General ${mesa.sectionLetter}` : "BTC";
			})()}, */
			breakfast,
			lunch,
			dinner,
			user: user && user.email,
			timestamp: new Date(),
		});
		setShowModal(true);
	};

	const submitHandleTotal = () => {

		const mesaObj = mesas.find((mesa) => mesa.id === selectedMesa);
		const section = mesaObj ? mesaObj.sectionLetter : "BTC";

		setData({
			section: `General ${section}`,
			mesa: selectedMesa,
			sillas: selectedSillas,
			breakfast,
			lunch,
			dinner,
			user: user && user.email,
			timestamp: new Date(),
		});
		setShowModal(true);
	};

	const handleConfirm = async () => {
		console.log('Confirm: ', data);
		try {
			await addDoc(collection(db, "reservedTables"), data);
			setData(data); // Actualiza el estado de los datos si es necesario
			setShowModal(true); // Muestra el modal
		} catch (error) {
			console.error("Error al guardar en Firebase: ", error);
		}
		setShowModal(false);
		setReadyToPay(true);
	};

	const handleClose = () => {
		setShowModal(false);
	};


	return (
		<div className="w-full h-full flex items-center justify-center flex-col-reverse md:flex-row">
			<aside className="w-full md:w-2/3 p-4 h-screen flex justify-center items-center flex-col bg-[#e0e4ea]">
				<hgroup className="w-full border-b-2 py-3 border-gray-300">
					<h1 className="font-semibold text-xl uppercase text-center text-[#333333]">
						Plano de Espacio
					</h1>
				</hgroup>
				<div
					className="overflow-auto flex justify-center items-center"
					style={{
						width: "100%",
						height: "100%",
						cursor: isPanning ? "grabbing" : "grab",
					}}
					onWheel={handleWheel}
					onMouseDown={handleMouseDown}
					onMouseMove={handleMouseMove}
					onMouseUp={handleMouseUp}
					onMouseLeave={handleMouseUp} // Si el usuario sale del área durante el arrastre
				>
					<svg
						ref={svgRef}
						width="1000"
						height="600"
						viewBox="0 -1000 4500 4000"
						style={{
							transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
							transformOrigin: "center",
							background: "#e0e4ea",
						}}
					>
						<g>
							{/* Escenario */}
							<g transform="translate(1800, -600)">
								{/* Fondo del escenario */}
								<rect x="50" y="-20" width="700" height="200" fill="#737373" />
								{/* Texto "Escenario" dentro del fondo */}
								<text
									x="400" // Coordenada x para centrar el texto en el fondo
									y="110" // Coordenada y para posicionarlo dentro del fondo
									fill="white" // Color del texto
									fontSize="70" // Tamaño de la fuente
									fontWeight="middle" // Estilo de fuente en negrita
									textAnchor="middle" // Centra el texto horizontalmente
									alignmentBaseline="middle" // Centra el texto verticalmente
								>
									ESCENARIO
								</text>
								{/* Piso del escenario */}
								<rect x="0" y="180" width="800" height="50" fill="#737373" />
							</g>

							{/* Stands a la izquierda del escenario */}
							<g transform="translate(-200, 0)">
								{Array.from({ length: 15 }, (_, i) => (
									<g key={i} transform={`translate(0, ${i * 170})`}>
										{/* Rectángulo de cada stand */}
										<rect
											x="0"
											y="-50"
											width="150"
											height="150"
											fill="#7d7d7d"
										/>
										{/* Número dentro del stand */}
										<text
											x="75" // Centrado horizontalmente en el rectángulo (mitad de 150)
											y="45" // Centrado verticalmente en el rectángulo (mitad de 150)
											fill="white" // Color del texto
											fontSize="50" // Tamaño del texto
											fontWeight="bold" // Texto en negrita
											textAnchor="middle" // Centrar horizontalmente
											alignmentBaseline="middle" // Centrar verticalmente
										>
											{i + 1}
										</text>
									</g>
								))}
							</g>
							{/* Stands a la derecha del escenario */}
							<g transform="translate(4500, 0)">
								{Array.from({ length: 15 }, (_, i) => (
									<g key={i + 15} transform={`translate(0, ${i * 170})`}>
										{/* Rectángulo de cada stand */}
										<rect
											x="0"
											y="-50"
											width="150"
											height="150"
											fill="#7d7d7d"
										/>
										{/* Número dentro del stand */}
										<text
											x="75" // Centrado horizontalmente en el rectángulo (mitad de 150)
											y="45" // Centrado verticalmente en el rectángulo (mitad de 150)
											fill="white" // Color del texto
											fontSize="50" // Tamaño del texto
											fontWeight="bold" // Texto en negrita
											textAnchor="middle" // Centrar horizontalmente
											alignmentBaseline="middle" // Centrar verticalmente
										>
											{i + 16}{" "}
											{/* El número empieza desde 16 para los stands a la derecha */}
										</text>
									</g>
								))}
							</g>

							{/* Entrada */}
							<g transform="translate(-200, 2600)">
								<rect x="0" y="0" width="1080" height="10" fill="#d1d5db" />
								<rect x="1170" y="0" width="12" height="60" fill="#d1d5db" />
								<rect x="1270" y="0" width="2340" height="10" fill="#d1d5db" />
								<rect x="3690" y="0" width="11" height="60" fill="#d1d5db" />
								<rect x="3770" y="0" width="1080" height="10" fill="#d1d5db" />
							</g>

							{/* Pista de Baile */}
							<g transform={`translate(${pistaX}, ${pistaY})`}>
								{/* Fondo de la pista de baile */}
								<rect
									x="0"
									y="0"
									width={pistaAncho}
									height={pistaAlto}
									fill="#737373" // Color de la pista
								/>
								{/* Texto "Pista de Baile" */}
								<text
									x={pistaAncho / 2} // Centrar horizontalmente
									y={pistaAlto / 1.8} // Centrar verticalmente
									fill="white"
									fontSize="90"
									fontWeight={400}
									textAnchor="middle"
									alignmentBaseline="middle"
								>
									PISTA DE BAILE
								</text>
							</g>

							{/* Mesas VIP */}
							<g transform="translate(1210, -150)">
								{Array.from({ length: 10 }, (_, i) => (
									<g
										key={i}
										transform={`translate(${i * 222})`}
										onClick={() => handleMesaClick(`vip-${i + 1}`)}
									>
										<circle
											r="40"
											fill={
												selectedMesa === "vip-" + (i + 1)
													? "#034a84"
													: hoveredMesa === "vip-" + (i + 1)
														? "#276bb0"
														: vipSectionMark
															? "#276bb0"
															: "#5e5e5e"
											}
											onMouseEnter={() => setHoveredMesa(`vip-${i + 1}`)}
											onMouseLeave={() => setHoveredMesa(null)}
										/>
										<text
											x="0"
											y="10"
											fill="white"
											fontSize="20"
											fontWeight="bold"
											textAnchor="middle"
											alignmentBaseline="middle"
										>
											btc-{i + 1}
										</text>
										{[...Array(6)].map((_, index) => {
											const positions = [
												[-70, 0],
												[-60, 30],
												[-30, 50],
												[10, 50],
												[40, 30],
												[55, 0],
											];
											const [x, y] = positions[index];
											return (
												<rect
													key={index}
													x={x}
													y={y}
													width="15"
													height="15"
													fill={vipSectionMark ? "#034a84" : "#5e5e5e"}
												/>
											);
										})}
									</g>
								))}
							</g>

							{/* Renderizar mesas */}
							{mesas.map((mesa) => (
								<g key={mesa.id} onClick={() => handleMesaClick(mesa.id)}>
									{/* Círculo de la mesa */}
									<circle
										cx={mesa.cx}
										cy={mesa.cy}
										r="40"
										fill={
											selectedMesa === mesa.id
												? "#034a84"
												: hoveredMesa === mesa.id // Si esta mesa está en hover, cambiar el color
													? "#276bb0" // Color cuando se hace hover
													: sectionMark
														? `hsl(${mesa.section * 60}, 50%, 50%)`
														: "#5e5e5e"
										}
										onMouseEnter={() => setHoveredMesa(mesa.id)} // Activar hover
										onMouseLeave={() => setHoveredMesa(null)} // Desactivar hover
									/>
									{/* Número dentro del círculo */}
									<text
										x={mesa.cx} // Centrado horizontalmente en el círculo
										y={mesa.cy + 10} // Centrado verticalmente en el círculo (ajustar +10 para centrar)
										fill="white" // Color del texto
										fontSize="20" // Tamaño del texto
										fontWeight="bold" // Texto en negrita
										textAnchor="middle" // Centrar horizontalmente
										alignmentBaseline="middle" // Centrar verticalmente
									>
										{mesa.id.replace("mesa-", "")} {/* Número de la mesa */}
									</text>
								</g>
							))}
							{/* Renderizar sillas */}
							{sillas.map((silla) => (
								<rect
									key={silla.id}
									x={silla.x}
									y={silla.y}
									width="15"
									height="15"
									fill={
										selectedSillas.includes(silla.id)
											? "#034a84"
											: hoveredMesa == silla.id
												? "#276bb0"
												: "#5e5e5e"
									}
									onClick={() => handleSillaClick(silla.id)}
									onMouseEnter={() => setHoveredMesa(silla.id)} // Activar hover
									onMouseLeave={() => setHoveredMesa(null)} // Desactivar hover
								/>
							))}

							{/* Puntero para indicar la mesa */}
							{selectedMesa &&
								!selectedMesa.includes("vip") &&
								selectedMesa &&
								selectedSillas.length > 0 && (
									<svg
										x={pointerPosition.x - 100}
										y={pointerPosition.y - 200}
										width="200"
										height="200"
										viewBox="0 0 304 432"
									>
										<path
											fill="#c8233a"
											d="M149 3q62 0 106 43.5T299 152q0 31-15.5 71.5t-37.5 75t-44 65t-37 48.5l-16 17q-6-6-16-18t-35.5-46.5t-45.5-67T16 224T0 152Q0 90 43.5 46.5T149 3m0 202q22 0 38-15.5t16-37.5t-16-37.5T149 99t-37.5 15.5T96 152t15.5 37.5T149 205"
										/>
									</svg>
								)}
						</g>
					</svg>
				</div>
			</aside>

			<aside className="w-full md:w-1/3 p-4 h-screen overflow-y-auto bg-[#f9fafb]">
				<hgroup className="pt-3">
					<h1 className="font-medium text-xl text-center text-[#034a84]">
						{selectedSilla || selectedMesa ? "Tu selección" : "Selecciona"}
					</h1>
				</hgroup>

				<hgroup className="flex flex-col justify-center w-full border-t-2 mt-4 pt-4 border-gray-300">
					<label className="text-xs uppercase flex items-center gap-1 text-[#034a84]">
						<input
							type="checkbox"
							id="vipCheckbox"
							checked={vipSectionMark}
							onChange={handleVipCheckboxChange}
						/>
						Resaltar zona VIP
					</label>
				</hgroup>

				<hgroup className="flex flex-col justify-center w-full border-t-2 mt-4 pt-4 border-gray-300">
					<label className="text-xs uppercase flex items-center gap-1 text-[#034a84]">
						<input
							type="checkbox"
							id="cbox1"
							value={sectionMark}
							checked={sectionMark}
							onChange={handleCheckboxChange}
						/>
						Resaltar secciones
					</label>
				</hgroup>

				{((selectedMesa && selectedSillas) ||
					(selectedMesa && selectedSilla)) && (
						<div className="">
							<div className="w-full flex justify-beetween py-4 my-4 border-y-2 border-gray-300">
								<hgroup className="flex flex-col justify-center w-1/3 border-r-2 mr-3 border-gray-300">
									<h3 className="text-xs uppercase text-[#034a84]">Sección</h3>
									<p className="text-xl font-light text-[#333333] uppercase">
										{selectedMesa
											? (() => {
												const mesa = mesas.find(
													(mesa) => mesa.id === selectedMesa
												);
												return mesa ? "General " + mesa.sectionLetter : "BTC";
											})()
											: "-"}
									</p>
								</hgroup>

								{(selectedMesa || selectedSilla) && (
									<hgroup className="flex flex-col justify-center w-1/3 border-r-2 mr-3 border-gray-300">
										<h3 className="text-xs uppercase text-[#034a84]">Mesa</h3>
										<p className="text-xl font-light text-[#333333]">
											{selectedMesa ? selectedMesa.replace("mesa-", "") : "-"}
										</p>
									</hgroup>
								)}

								{selectedSillas && (
									<hgroup className="flex flex-col justify-center w-1/3">
										<h3 className="text-xs uppercase text-[#034a84]">
											{selectedSillas.length > 1 ? "Sillas" : "Silla"}
										</h3>
										<p className="text-xl font-light text-[#333333]">
											{selectedSillas.length > 0
												? selectedSillas
													.filter((silla) =>
														silla.startsWith(
															`silla-${getMesaFromSilla(
																selectedSilla || selectedMesa
															)}_`
														)
													)
													.slice(0, selectedMesa.includes("vip") ? 6 : 12) // Muestra solo seis sillas si es VIP
													.map((silla) => silla.replace("silla-", ""))
													.join(", ")
												: "-"}
										</p>
									</hgroup>
								)}
								{/* <p>Estado: {selectedSilla === "silla-1a" ? "Ocupada" : "Disponible"}</p> */}
							</div>

							{/* Mostrar la mesa y las sillas cuando se selecciona una silla o mesa */}
							{((selectedMesa && selectedSillas) ||
								(selectedMesa && selectedSilla)) && (
									<svg
										width="400"
										height="222"
										viewBox="0 100 400 200"
										xmlns="http://www.w3.org/2000/svg"
										className="w-full h-full"
									>
										{/* Definimos degradado para la mesa */}
										<defs>
											<radialGradient id="tableGradient" cx="50%" cy="50%" r="50%">
												<stop
													offset="0%"
													style={{ stopColor: "#f0f8ff", stopOpacity: 1 }}
												/>
												<stop
													offset="100%"
													style={{ stopColor: "#034a84", stopOpacity: 1 }}
												/>
											</radialGradient>
											<filter
												id="shadow"
												x="-50%"
												y="-50%"
												width="200%"
												height="200%"
											>
												<feDropShadow
													dx="0"
													dy="10"
													stdDeviation="15"
													floodColor="rgba(0,0,0,0.2)"
												/>
											</filter>
										</defs>

										{/* Patas de la mesa */}
										<rect
											x="100"
											y="220"
											width="10"
											height="40"
											fill="#012c4f" // Color madera
											style={{ filter: "url(#shadow)" }}
										/>
										<rect
											x="160"
											y="240"
											width="10"
											height="40"
											fill="#012c4f" // Color madera
											style={{ filter: "url(#shadow)" }}
										/>
										<rect
											x="240"
											y="240"
											width="10"
											height="40"
											fill="#012c4f" // Color madera
											style={{ filter: "url(#shadow)" }}
										/>
										<rect
											x="290"
											y="180"
											width="10"
											height="80"
											fill="#012c4f" // Color madera
											style={{ filter: "url(#shadow)" }}
										/>

										{/* Sillas distribuidas alrededor de la mesa */}
										{sillas
											.filter((silla) =>
												silla.id.startsWith(
													`silla-${getMesaFromSilla(
														selectedSilla || selectedMesa
													)}_`
												)
											)
											.slice(0, cantidadSillas)
											.map((silla, index) => {
												// Ajusta el ángulo para considerar la forma elíptica de la mesa
												const angle =
													(index / cantidadSillas) *
													(vipSectionMark ? 1.2 : 2.35) *
													Math.PI;
												const xOffset = Math.cos(angle) * 140;
												const yOffset = Math.sin(angle) * 75; // Ajuste en el eje y para la perspectiva elíptica

												return (
													<g key={silla.id}>
														{/* Cuerpo de la silla */}
														<rect
															x={200 + xOffset - 15}
															y={200 + yOffset - 10}
															width="30"
															height="20"
															rx="5" // Borde redondeado
															ry="5" // Borde redondeado
															fill={
																selectedSillas.includes(silla.id) ||
																	silla.id === selectedSilla
																	? "#034a84"
																	: "#5e5e5e"
															}
															strokeWidth={silla.id === selectedSilla ? "2" : "1"}
															onClick={() => handleSillaClick(silla.id)}
															className="cursor-pointer"
															style={{
																transition: "all 0.3s ease-in-out",
																transform:
																	selectedSillas.includes(silla.id) ||
																		silla.id === selectedSilla
																		? "scale(1.01)"
																		: "scale(1)",
																filter:
																	selectedSillas.includes(silla.id) ||
																		silla.id === selectedSilla
																		? "drop-shadow(0 0 10px #034a84)"
																		: "none",
															}}
														/>
														{/* Patas de la silla */}
														<rect
															x={195 + xOffset - 7}
															y={200 + yOffset + 10}
															width="5"
															height="15"
															fill={
																selectedSillas.includes(silla.id) ||
																	silla.id === selectedSilla
																	? "#012c4f"
																	: "#414141"
															}
															style={{
																transition: "all 0.3s ease-in-out",
																transform:
																	selectedSillas.includes(silla.id) ||
																		silla.id === selectedSilla
																		? "scale(1.01)"
																		: "scale(1)",
																filter:
																	selectedSillas.includes(silla.id) ||
																		silla.id === selectedSilla
																		? "drop-shadow(0 0 10px #034a84)"
																		: "none",
															}}
														/>
														<rect
															x={195 + xOffset + 10}
															y={200 + yOffset + 10}
															width="5"
															height="15"
															fill={
																selectedSillas.includes(silla.id) ||
																	silla.id === selectedSilla
																	? "#012c4f"
																	: "#414141"
															}
															style={{
																transition: "all 0.3s ease-in-out",
																transform:
																	selectedSillas.includes(silla.id) ||
																		silla.id === selectedSilla
																		? "scale(1.01)"
																		: "scale(1)",
																filter:
																	selectedSillas.includes(silla.id) ||
																		silla.id === selectedSilla
																		? "drop-shadow(0 0 10px #034a84)"
																		: "none",
															}}
														/>
													</g>
												);
											})}

										{/* Mesa redonda con perspectiva */}
										<ellipse
											cx="200"
											cy="200"
											rx="120"
											ry="60"
											fill="url(#tableGradient)"
											stroke="#034a84"
											strokeWidth="2"
											style={{ filter: "url(#shadow)" }}
										/>
									</svg>
								)}

							{((selectedMesa && selectedSillas) ||
								(selectedMesa && selectedSilla)) && (
									<button
										onClick={!readyToPay && submitHandle}
										className={`w-full py-2 mt-8 rounded-lg font-medium text-white transition-colors ${readyToPay
											? "cursor-default bg-[#3b82f6]/10"
											: "bg-[#3b82f6] hover:bg-[#034a84]"
											}`}
									>
										Reservar
									</button>
								)}

							{readyToPay && (
								<>
									<h1 className="font-medium text-xl text-center border-t-2 mt-4 pt-4 border-gray-300 text-[#034a84]">
										Reservar Menú
									</h1>
									<hgroup className="flex gap-12 justify-center w-full mt-4">
										<label className="text-xs uppercase flex items-center gap-1 text-[#034a84]">
											<input
												type="checkbox"
												id="breakfastCheckbox"
												checked={breakfast}
												onChange={() => setBreakfast(!breakfast)}
											/>
											Desayuno
										</label>
										<label className="text-xs uppercase flex items-center gap-1 text-[#034a84]">
											<input
												type="checkbox"
												id="lunchCheckbox"
												checked={lunch}
												onChange={() => setLunch(!lunch)}
											/>
											Comida
										</label>
										<label className="text-xs uppercase flex items-center gap-1 text-[#034a84]">
											<input
												type="checkbox"
												id="dinnerCheckbox"
												checked={dinner}
												onChange={() => setDinner(!dinner)}
											/>
											Cena
										</label>
									</hgroup>

									<button
										className={`w-full py-2 mt-8 mb-20 rounded-lg font-medium text-white transition-colors bg-[#3b82f6] hover:bg-[#034a84]`}
										onClick={readyToPay && submitHandleTotal}
									>
										Reservar
									</button>
								</>
							)}
						</div>
					)}
			</aside>

			<ConfirmationModal
				show={showModal}
				onClose={handleClose}
				onConfirm={handleConfirm}
				mesa={data.mesa}
				sillas={data.sillas}
			/>
		</div>
	);
}

export default MapPage;
