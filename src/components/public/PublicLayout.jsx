import Navbar from "./Navbar";
import Footer from "./Footer";

export default function PublicLayout({
  children,
  darkHero = false,
}) {
  return (
    <div>
      <Navbar darkHero={darkHero} />

      <main>
        {children}
      </main>

      <Footer />
    </div>
  );
}