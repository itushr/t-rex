import Header from "../components/Header";
import { CTA } from "../components/landing/CTA";
import { BottomDinoRunner } from "../components/landing/BottomDinoRunner";

export function Home() {
  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <section
        className="relative h-screen min-h-screen w-full flex flex-col justify-between overflow-hidden bg-cover bg-no-repeat bg-position-[center_top]"
        style={{ backgroundImage: "url('/hero2.png')" }}
      >
        <div className="absolute inset-0 bg-linear-to-b from-black/55 via-black/30 to-background/95 pointer-events-none" />

        <div className="relative z-20 pt-10">
          <Header />
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center mt-2">
          <img
            src="/heading.png"
            className="w-md sm:w-lg max-w-full mx-auto drop-shadow-2xl"
            alt="T-Rex AI"
          />

          <div className="mt-4 text-lg sm:text-2xl text-white/95 font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            Explore machine learning through games.
            <br />
            Experiment with algorithms, train different models,
            <br />
            and discover how they learn to play.
          </div>

          <div className="mt-4 w-full">
            <CTA contrast="high" />
          </div>
        </div>

        <div className="relative z-20 w-full">
          <BottomDinoRunner />
        </div>
      </section>
    </div>
  );
}

export default Home;
