import PublicLayout from "../../components/public/PublicLayout";
import Hero from "../../components/public/sections/Hero";
import Stats from "../../components/public/sections/Stats";

export default function Home() {
  return (
    <PublicLayout>
      <Hero />
      <Stats />
    </PublicLayout>
  );
}