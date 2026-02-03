import Header from './Header'
import Footer from './Footer'

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
        {children}
      </main>

      <Footer />
    </div>
  )
}
