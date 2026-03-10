import Image from "next/image";
import { Header } from "./components/header";
import { SearchFilter } from "./components/search_filter";
import MainSection from "./components/main_section";
import FoodCategory from "./components/FoodCategory";
import FoodEvaluation from "./components/foodevaluation";
import { Footer } from "./components/footer";

export default function Home() {
  return (
<main className="min-h-screen bg-white">
      <Header />
      <MainSection/>
      <FoodCategory/>
      <FoodEvaluation/>
      <Footer/>
</main>


  );
}
