import { useState } from "react";
import { ICONS } from "@assets/icons";
import { NavLink, useLocation } from "react-router-dom";

const Navigation = () => {
    const location = useLocation().pathname;
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Bottom Nav */}
            <footer className="fixed w-[95%] max-w-screen-3xl mx-auto bottom-3 md:hidden rounded-full p-2 flex items-center justify-evenly font-semibold backdrop-blur-sm text-main-light bg-gray-900/70 shadow-lg">
                <ul className="w-full flex items-center justify-between">
                    {navItems.map(({ to, icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={`flex-center rounded-full transition-all duration-500 ease-in-out text-main-dark
                            ${location.includes(to) && "bg-main-light py-1 px-4"}`}
                        >
                            <i className={`flex-center rounded-full transition-all duration-300 ease-in-out ${location.includes(to) ? "w-9 h-9 px-1" : "w-11 h-11 p-3 bg-main-light/40"}`}>
                                {icon.fill(location.includes(to) ? "#1C1C1E" : "#F5F6FA")}
                            </i>
                            <span className={`${location.includes(to) ? "block pr-1" : "hidden"}`}>{label}</span>
                        </NavLink>
                    ))}
                </ul>
            </footer>

            {/* Desktop Hamburger Menu */}
            {!isOpen &&
                <div className="hidden md:flex fixed top-4 left-4 z-50">
                    <button onClick={() => setIsOpen(!isOpen)} className="p-2 space-y-1">
                        <span className="w-6 h-[2px] bg-gray-50 flex-center"></span>
                        <span className="w-5 h-[2px] bg-gray-50 flex-center"></span>
                        <span className="w-4 h-[2px] bg-gray-50 flex-center"></span>
                    </button>
                </div>}

            {/* Sidebar Menu */}
            <aside className={`fixed top-0 left-0 h-full w-64 bg-black/90 text-main-light backdrop-blur transform ${isOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out z-40 p-4`}>
                <button onClick={() => setIsOpen(false)} className="absolute top-5 left-4">
                    <span className="w-4 h-[2px] bg-gray-50 flex-center -rotate-45 mt-1"></span>
                    <span className="w-4 h-[2px] bg-gray-50 flex-center rotate-45 mt-2"></span>
                </button>
                <nav className="mt-12 flex flex-col gap-4">
                    {navItems.map(({ to, icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ease-in-out
                            ${to.length > 1 && location.includes(to) && "bg-main-light text-main-dark"} ${location === "/" && to == "/" && location == to && "bg-main-light text-main-dark"} ${location != to && "hover:bg-main-light/20"}`}
                        >
                            <i className="w-6 h-6 flex-center">{icon.fill(location === "/" && to == "/" && location == to && "#1C1C1E" || to.length > 1 && location.includes(to) ? "#1C1C1E" : "#F5F6FA")}</i>
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>
            </aside>
        </>
    );
};

const navItems = [
    { to: "/", icon: ICONS.home, label: "Inicio" },
    { to: "/events", icon: ICONS.timeline, label: "Eventos" },
    { to: "/reservations", icon: ICONS.calendar.star, label: "Reservaciones" },
    { to: "/help", icon: ICONS.help, label: "Ayuda" },
];

export { Navigation };
