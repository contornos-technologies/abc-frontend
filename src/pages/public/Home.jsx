import PublicLayout from "../../components/public/PublicLayout";
import Hero from "../../components/public/sections/Hero";
import Stats from "../../components/public/sections/Stats";
import WhyChoose from "../../components/public/sections/WhyChoose";

export default function Home() {
  return (
    <PublicLayout>
      <Hero />
      <Stats />
      <WhyChoose />
    </PublicLayout>
  );
}