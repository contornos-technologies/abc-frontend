
import PublicLayout from "../../components/public/PublicLayout";
import ContactHero from "../../components/public/sections/ContactHero";
import ContactInfoSection from "../../components/public/sections/ContactInfoSection";
import ContactMapSection from "../../components/public/sections/ContactMapSection";


export default function Contact() {
  return (
    <PublicLayout darkHero>
      <ContactHero />
      <ContactInfoSection />
      <ContactMapSection />
      

    </PublicLayout>
  );
}
