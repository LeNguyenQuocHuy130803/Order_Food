import Image from "next/image";
import { Header } from "./components/layout/header";
import { SearchFilter } from "./components/search_filter";
import MainSection from "./components/main_banner";
import FoodCategory from "./components/home_body";
import { Footer } from "./components/layout/footer";

export default function Home() {
  return (
<main className="min-h-screen bg-white">
      <Header />
      <MainSection/>
      <FoodCategory/>
      <Footer/>
</main>


  );
}
