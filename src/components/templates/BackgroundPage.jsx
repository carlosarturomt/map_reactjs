import { ICONS } from "@assets/icons"

const BackgroundPage = ({ children }) => {
    return (
        <section className="relative w-full h-full flex items-center flex-col bg-main-light overflow-hidden">
            <header className="w-full h-[50vh] flex justify-center items-center flex-col bg-main-blue">
                <hgroup className="flex items-center justify-start gap-1 my-5">
                    <i className="w-[70px] h-[70px] rounded-full flex items-center justify-center bg-main-light p-3 border-4 border-main-blue shadow-lg">
                        {ICONS.logo.svg("#034a84")}
                    </i>
                    <h2 className="flex flex-col leading-7 text-3xl font-bold uppercase text-main-light tracking-wide">
                        Map<span className="font-extrabold text-main-light">Explorer</span>
                    </h2>
                </hgroup>
                <p className="px-8 text-center text-lg font-medium text-main-light/90 leading-relaxed">
                    Navega por territorios interactivos y descubre información clave con solo un clic.
                </p>
            </header>
            <span className="w-[150%] h-32 bg-main-blue rounded-b-[100%] shadow-xl"></span>
            <div className="w-full flex-grow flex justify-center items-center py-10">
                {children}
            </div>
        </section>
    )
}

export { BackgroundPage }
