import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import ProblemSolving from "@/components/ProblemSolving";
import Process from "@/components/Process";
import Partner from "@/components/Partner";
import About from "@/components/About";
import CtaBanner from "@/components/CtaBanner";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <Services />
        <ProblemSolving />
        <Process />
        <Partner />
        <About />
        <CtaBanner />
      </main>
      <Footer />
    </>
  );
}
