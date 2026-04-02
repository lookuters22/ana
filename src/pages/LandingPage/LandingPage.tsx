import { useEffect } from "react";
import { Header } from "./components/Header";
import { HeroWrapper } from "./components/Hero/HeroWrapper";
import { ValueProposition } from "./components/ValueProposition";
import { FeatureGrid, FEATURE_GRID_IMAGE_SRCS } from "./components/FeatureGrid";
import { SectionHeader, Highlight } from "./components/SectionHeader";
import { HighlightSection } from "./components/HighlightSection";
import { FeatureCarousel } from "./components/FeatureCarousel";
import { Features3DCarousel } from "./components/Features3DCarousel";
import { FAQSection } from "./components/FAQSection";
import { Footer } from "./components/Footer";
import SmoothScrolling from "../../components/SmoothScrolling";

export function LandingPage() {
  useEffect(() => {
    const root = document.documentElement;
    const prevBg = root.style.background;
    const wasLight = root.classList.contains("light");
    root.style.background = "#020617";
    root.classList.remove("light");
    root.style.colorScheme = "dark";

    for (const src of FEATURE_GRID_IMAGE_SRCS) {
      const img = new Image();
      img.src = src;
    }

    return () => {
      root.style.background = prevBg;
      if (wasLight) root.classList.add("light");
    };
  }, []);

  return (
    <SmoothScrolling>
    <div className="min-h-screen bg-slate-950 text-white">
      <Header />
      <HeroWrapper />
      <ValueProposition />
      <FeatureGrid />
      <SectionHeader
        title={
          <>
            Let autonomous intelligence conquer your{" "}
            <Highlight>administrative overhead.</Highlight>
          </>
        }
      />
      <HighlightSection />
      <FeatureCarousel />
      <Features3DCarousel />
      <SectionHeader
        className="bg-[#F3F1EB]"
        title={
          <>
            Your studio manager just got smarter.
            <br />
            <Highlight>Discover the latest capabilities.</Highlight>
          </>
        }
      />
      <FAQSection />
      <Footer />
    </div>
    </SmoothScrolling>
  );
}
