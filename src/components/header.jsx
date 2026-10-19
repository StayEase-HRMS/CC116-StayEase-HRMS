import logo from "../assets/logo.svg"

export default function PageHeader({ title, desc, management = false }) {
  return (
    <header className="flex border-b-2 border-gray-200 bg-white">
      <div className={`flex ${management ? "w-16 sm:w-[200px] p-2 sm:p-5" : "w-[200px] p-5"} shrink-0 items-center justify-center border-r-2 border-gray-200`}>
        <img className="w-[140px]" src={logo} alt="StayEase" />
      </div>

      <div className="flex flex-col justify-center px-6 py-4 text-left">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className={management ? "mt-1 text-sm text-[#587296] sm:text-base" : ""}>{desc}</p>
      </div>
    </header>
  )
}
