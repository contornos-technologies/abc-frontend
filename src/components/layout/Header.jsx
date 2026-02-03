export default function Header() {
  return (
    <header className="w-full border-b">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <span className="font-bold text-lg">
          ABC
        </span>

        <nav className="flex gap-4 text-sm">
          <a href="#" className="hover:underline">Home</a>
          <a href="#" className="hover:underline">Sobre</a>
          <a href="#" className="hover:underline">Contacto</a>
        </nav>
      </div>
    </header>
  )
}
