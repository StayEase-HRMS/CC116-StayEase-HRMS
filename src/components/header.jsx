import logo from "../assets/logo.png"

export default function PageHeader({ title, desc }) {
  return (
    <header className="flex border-b-2 border-gray-200 bg-white">
      <div className="flex w-[200px] shrink-0 items-center justify-center border-r-2 border-gray-200 p-5">
        <img className="w-[140px]" src={logo} />
      </div>

      <div className="flex flex-col justify-center px-6 py-4 text-left">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p>{desc}</p>
      </div>
    </header>
  )
}