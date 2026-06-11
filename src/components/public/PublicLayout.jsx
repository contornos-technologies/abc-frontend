import Navbar from "./Navbar";
import Footer from "./Footer";

export default function PublicLayout({
  children,
  darkHero = false,
 solidWhite = false,
}) {
  return (
    <div>
   <Navbar darkHero={darkHero} solidWhite={solidWhite} />

      <main>
        {children}
      </main>

      <Footer />
    </div>
  );
}