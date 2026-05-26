import PublicLayout from "../../components/public/PublicLayout";
import Hero from "../../components/public/sections/Hero";
import Stats from "../../components/public/sections/Stats";
import WhyChoose from "../../components/public/sections/WhyChoose";
import Disciplines from "../../components/public/sections/Disciplines";
import Pricing from "../../components/public/sections/Pricing";
import Testimonials from "../../components/public/sections/Testimonials";
import CTA from "../../components/public/sections/CTA";


export default function Home() {
  return (
    <PublicLayout>
      <Hero />
      <Stats />
      <WhyChoose />
      <Disciplines />
      <Pricing />
      <Testimonials />
      <CTA />
    </PublicLayout>
  );
}