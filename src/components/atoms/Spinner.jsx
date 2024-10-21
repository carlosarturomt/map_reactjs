export default function Spinner(props) {
	return (
		<div
			className={`${
				props.bgTheme ? " dark:bg-[#00091d] " : " bg-[#0904309f] "
			}  absolute w-full h-full left-0 top-0 z-60 flex justify-center items-center rounded-md`}
		>
			<div className="w-16 h-16 relative block ">
				<span className="absolute w-full h-full border-t-4 border-t-[#604df2] rounded-full animate-spin"></span>
				<span className="absolute left-[0.3rem] top-[0.3rem] w-14 h-14 border-r-4 border-r-[#604df2] rounded-full animate-spin-reverse"></span>
			</div>
		</div>
	);
}