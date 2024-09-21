import { useRef, useState } from "react";

function App() {
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

  const svgRef = useRef(null);

  const handleSillaClick = (sillaId) => {
    // Si la silla ya está seleccionada, la removemos de la lista
    if (selectedSillas.includes(sillaId)) {
      setSelectedSillas(selectedSillas.filter((silla) => silla !== sillaId));
    } else {
      // Si no está seleccionada, la agregamos
      setSelectedSillas([...selectedSillas, sillaId]);
    }
    setSelectedSilla(sillaId);
    // Actualizamos la mesa correspondiente a la silla seleccionada
    const mesaId = `mesa-${getMesaFromSilla(sillaId)}`;
    setSelectedMesa(mesaId);
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
          .filter((silla) => silla.id.startsWith(`silla-${mesaId.split("-")[1]}_`))
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
          .filter((silla) => silla.id.startsWith(`silla-${mesaId.split("-")[1]}_`))
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

  // Definimos cuántas mesas y sillas vamos a tener
  const numMesas = 200; // Puedes ajustar este valor
  const sillasPorMesa = 10; // Sillas por mesa
  // Definimos los espacios entre las mesas
  const mesaSpacingX = 222; // Distancia horizontal entre mesas
  const mesaSpacingY = 244; // Distancia vertical entre mes

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
  const mesasPorFila = 20;
  const numSecciones = 10;
  const letrasSecciones = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  for (let i = 0; i < numMesas; i++) {
    // Calculamos la posición de la mesa
    const mesaX = 100 + (i % mesasPorFila) * mesaSpacingX;
    const mesaY = 100 + Math.floor(i / mesasPorFila) * mesaSpacingY;

    // Determinar a qué sección pertenece cada mesa
    const section = Math.floor(i / (numMesas / numSecciones)) + 1;
    const sectionIndex = Math.floor(i / (numMesas / numSecciones)) % letrasSecciones.length;
    const sectionLetter = letrasSecciones[sectionIndex];

    // Agregamos la mesa con su sección
    mesas.push({ id: `mesa-${i + 1}`, cx: mesaX, cy: mesaY, section, sectionLetter });

    // Agregamos las sillas para cada mesa
    for (let j = 0; j < sillasPorMesa; j++) {
      const sillaX = mesaX + sillaOffset[j].x;
      const sillaY = mesaY + sillaOffset[j].y;
      sillas.push({ id: `silla-${i + 1}_${String.fromCharCode(97 + j)}`, x: sillaX, y: sillaY });
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
    const newScale = Math.min(Math.max(scale - event.deltaY * 0.01, 0.7), 10);
    setScale(newScale);
  };

  // Iniciar arrastre
  const handleMouseDown = (event) => {
    if (scale != 1) {
      setIsPanning(true);
      setOrigin({ x: event.clientX - translate.x, y: event.clientY - translate.y });
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

  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-50">
      <aside className="p-4 w-2/3 h-screen flex justify-center items-center flex-col bg-gray-200">
        <hgroup className="w-full border-b-2 py-3 border-gray-300">
          <h1 className="font-semibold text-xl uppercase text-center">Plano de Espacio</h1>
        </hgroup>
        <div
          className="overflow-auto flex justify-center items-center"
          style={{ width: "100%", height: "100%", cursor: isPanning ? "grabbing" : "grab" }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp} // Si el usuario sale del área durante el arrastre
        >
          <svg
            ref={svgRef}
            width="1000"
            height="800"
            viewBox="0 -900 4500 5000"
            style={{
              transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
              transformOrigin: "center",
              background: "#E5E5E5",
            }}
          >
            <g>
              {/* Escenario */}
              <g transform="translate(1800, -600)">
                {/* Fondo del escenario */}
                <rect x="50" y="-20" width="700" height="200" fill="#8A8A8A" />
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
                <rect x="0" y="180" width="800" height="50" fill="#8A8A8A" />
              </g>

              {/* Stands a la izquierda del escenario */}
              <g transform="translate(-200, 0)">
                {Array.from({ length: 15 }, (_, i) => (
                  <g key={i} transform={`translate(0, ${i * 170})`}>
                    {/* Rectángulo de cada stand */}
                    <rect x="0" y="-50" width="150" height="150" fill="#8A8A8A" />
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
                    <rect x="0" y="-50" width="150" height="150" fill="#8A8A8A" />
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
                      {i + 16} {/* El número empieza desde 16 para los stands a la derecha */}
                    </text>
                  </g>
                ))}
              </g>

              {/* Entrada */}
              <g transform="translate(-200, 2600)">
                <rect x="0" y="0" width="1080" height="10" fill="#8A8A8A" />
                <rect x="1170" y="0" width="12" height="60" fill="#8A8A8A" />
                <rect x="1270" y="0" width="2340" height="10" fill="#8A8A8A" />
                <rect x="3690" y="0" width="11" height="60" fill="#8A8A8A" />
                <rect x="3770" y="0" width="1080" height="10" fill="#8A8A8A" />
              </g>

              {/* Mesas VIP */}
              <g transform="translate(1210, -150)">
                {Array.from({ length: 10 }, (_, i) => (
                  <g key={i} transform={`translate(${i * 222})`} onClick={() => handleMesaClick(`vip-${i + 1}`)}>
                    <circle
                      r="40"
                      fill={
                        selectedMesa === "vip-" + (i + 1)
                          ? "#022e5f"
                          : hoveredMesa === "vip-" + (i + 1)
                          ? "#0452AA"
                          : vipSectionMark ? "#0452AA" : "#4c4c4c"
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
                          fill={vipSectionMark ? "#022e5f" : "#4c4c4c"}
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
                        ? "#022e5f"
                        : hoveredMesa === mesa.id // Si esta mesa está en hover, cambiar el color
                        ? "#0452AA" // Color cuando se hace hover
                        : sectionMark
                        ? `hsl(${mesa.section * 60}, 50%, 50%)`
                        : "#4c4c4c"
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
                  fill={selectedSillas.includes(silla.id) ? "#022e5f" : hoveredMesa == silla.id ? "#0452AA" : "#4c4c4c"}
                  onClick={() => handleSillaClick(silla.id)}
                  onMouseEnter={() => setHoveredMesa(silla.id)} // Activar hover
                  onMouseLeave={() => setHoveredMesa(null)} // Desactivar hover
                />
              ))}

              {/* Puntero para indicar la mesa */}
              {selectedMesa && !selectedMesa.includes("vip") && selectedMesa && selectedSillas.length > 1 && (
                <svg
                  x={pointerPosition.x - 100}
                  y={pointerPosition.y - 200}
                  width="200"
                  height="200"
                  viewBox="0 0 304 432"
                >
                  <path
                    fill="#e90628"
                    d="M149 3q62 0 106 43.5T299 152q0 31-15.5 71.5t-37.5 75t-44 65t-37 48.5l-16 17q-6-6-16-18t-35.5-46.5t-45.5-67T16 224T0 152Q0 90 43.5 46.5T149 3m0 202q22 0 38-15.5t16-37.5t-16-37.5T149 99t-37.5 15.5T96 152t15.5 37.5T149 205"
                  />
                </svg>
              )}
            </g>
          </svg>
        </div>
      </aside>

      <aside className="w-1/3 p-4 h-screen">
        <hgroup className="pt-3">
          <h1 className="font-medium text-xl text-center text-[#022e5f]">
            {selectedSilla || selectedMesa ? "Tu selección" : "Selecciona"}
          </h1>
        </hgroup>

        <hgroup className="flex flex-col justify-center w-full border-t-2 mt-4 pt-4 border-gray-300">
          <label className="text-xs uppercase flex items-center gap-1 text-[#022e5f]">
            <input type="checkbox" id="vipCheckbox" checked={vipSectionMark} onChange={handleVipCheckboxChange} />
            Resaltar zona VIP
          </label>
        </hgroup>

        <hgroup className="flex flex-col justify-center w-full border-t-2 mt-4 pt-4 border-gray-300">
          <label className="text-xs uppercase flex items-center gap-1 text-[#022e5f]">
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

        {((selectedMesa && selectedSillas) || (selectedMesa && selectedSilla)) && (
          <div className="">
            <div className="w-full flex justify-beetween py-4 my-4 border-y-2 border-gray-300">
              <hgroup className="flex flex-col justify-center w-1/3 border-r-2 mr-3 border-gray-300">
                <h3 className="text-xs uppercase text-[#022e5f]">Sección</h3>
                <p className="text-xl font-light uppercase">
                  {selectedMesa
                    ? (() => {
                        const mesa = mesas.find((mesa) => mesa.id === selectedMesa);
                        return mesa ? "General " + mesa.sectionLetter : "BTC";
                      })()
                    : "-"}
                </p>
              </hgroup>

              {(selectedMesa || selectedSilla) && (
                <hgroup className="flex flex-col justify-center w-1/3 border-r-2 mr-3 border-gray-300">
                  <h3 className="text-xs uppercase text-[#022e5f]">Mesa</h3>
                  <p className="text-xl font-light">{selectedMesa ? selectedMesa.replace("mesa-", "") : "-"}</p>
                </hgroup>
              )}

              {selectedSillas && (
                <hgroup className="flex flex-col justify-center w-1/3">
                  <h3 className="text-xs uppercase text-[#022e5f]">{selectedSillas.length > 1 ? "Sillas" : "Silla"}</h3>
                  <p className="text-xl font-light">
                    {/* {selectedSillas.length > 0
                      ? selectedSillas.map((silla) => silla.replace("silla-", "")).join(", ")
                      : "-"} */}
                    {selectedSillas.length > 0
                      ? selectedSillas
                          .filter((silla) =>
                            silla.startsWith(`silla-${getMesaFromSilla(selectedSilla || selectedMesa)}_`)
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

            {/* Mostrar la mesa y las sillas cuando se selecciona una silla */}
            {((selectedMesa && selectedSillas) || (selectedMesa && selectedSilla)) && (
              <svg width="111" height="111" viewBox="0 0 200 200" className="w-full h-full">
                <circle
                  cx="100"
                  cy="100"
                  r="40"
                  fill={selectedMesa.includes("vip") ? "#0452AA" : "#022e5f"}
                  stroke="black"
                  strokeWidth="0"
                />

                {sillas
                  .filter((silla) => silla.id.startsWith(`silla-${getMesaFromSilla(selectedSilla || selectedMesa)}_`))
                  .slice(0, cantidadSillas)
                  .map((silla, index) => (
                    <rect
                      key={silla.id}
                      x={100 + sillaOffset[index].x}
                      y={100 + sillaOffset[index].y}
                      width="15"
                      height="15"
                      fill={selectedSillas.includes(silla.id) || silla.id === selectedSilla ? "#022e5f" : "#4c4c4c"}
                      strokeWidth={silla.id === selectedSilla ? "2" : "1"}
                    />
                  ))}
              </svg>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}

export default App;
