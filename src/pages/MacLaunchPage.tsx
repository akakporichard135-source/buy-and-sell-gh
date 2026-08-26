import { useEffect, useRef } from "react";
import { ArrowRight, Braces, Cpu, PanelsTopLeft, Sparkles, Workflow, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { SEO } from "../components/SEO";
import { newMacLaunches } from "../data/newMacLaunches";
import type { NewMacLaunchKey } from "../data/newMacLaunches";

type StorySection = {
  eyebrow: string;
  title: string;
  description: string;
  icon: typeof Cpu;
  facts: string[];
  tone?: "light" | "dark" | "gold" | "blue";
};

const macMiniSections: StorySection[] = [
  { eyebrow: "Design", title: "Big capability. Small footprint.", description: "A compact desktop built to fit naturally into home, studio, classroom and business setups.", icon: PanelsTopLeft, facts: ["Front USB-C access", "Rear display and network connectivity", "Quiet, efficient desktop design"] },
  { eyebrow: "M6", title: "Fast for every day. Ready for what is next.", description: "M6 brings a 12-core CPU and 12-core GPU to responsive productivity, creative work and on-device AI workflows.", icon: Sparkles, facts: ["12-core CPU", "12-core GPU with Neural Accelerators", "16GB unified memory standard, configurable up to 32GB"], tone: "gold" },
  { eyebrow: "M5 Pro", title: "More headroom for pro work.", description: "Choose M5 Pro for demanding development, rendering, research and media projects in the same compact format.", icon: Cpu, facts: ["Up to 18-core CPU", "Up to 20-core GPU", "Up to 64GB unified memory"], tone: "dark" },
  { eyebrow: "Workflows", title: "A desktop for ideas in motion.", description: "Build apps, develop games, create media and run capable local AI tools without giving up desk space.", icon: Braces, facts: ["Coding and STEM", "Creative production", "Gaming and local AI workflows"] },
  { eyebrow: "Connectivity", title: "Ready for your setup.", description: "Connect displays, storage, networking and professional peripherals through a practical front-and-rear port layout.", icon: Workflow, facts: ["Wi-Fi 7 and Bluetooth 6", "2.5Gb Ethernet, with 10Gb configurable", "Thunderbolt 4 on M6; Thunderbolt 5 on M5 Pro"], tone: "light" },
];

const macStudioSections: StorySection[] = [
  { eyebrow: "Choose your power", title: "Built around demanding work.", description: "Mac Studio scales from advanced creative production to large on-device AI and technical workflows.", icon: Zap, facts: ["M5 Max for serious pro workflows", "M5 Ultra for the most intensive workloads", "Compact professional workstation design"], tone: "dark" },
  { eyebrow: "M5 Max", title: "Creative and technical power.", description: "A high-performance option for video, 3D, development and accelerated local AI work.", icon: Cpu, facts: ["18-core CPU", "Up to 40-core GPU", "Up to 128GB unified memory"], tone: "gold" },
  { eyebrow: "M5 Ultra", title: "Scale up the hardest projects.", description: "Designed for exceptionally large models, complex rendering and high-end professional media pipelines.", icon: Sparkles, facts: ["Up to 36-core CPU", "Up to 80-core GPU", "Up to 512GB unified memory"], tone: "blue" },
  { eyebrow: "Pro workflows", title: "From first frame to final build.", description: "Handle professional video, 3D rendering, code compilation, game development and data-heavy projects.", icon: Braces, facts: ["Professional video workflows", "3D and visual effects", "Development and local model workloads"], tone: "dark" },
  { eyebrow: "Connectivity", title: "A workstation that connects broadly.", description: "High-bandwidth I/O supports fast storage, displays, expansion and advanced professional setups.", icon: Workflow, facts: ["Thunderbolt 5", "Wi-Fi 7 and Bluetooth 6", "Front and rear professional connectivity"], tone: "light" },
];

export function MacLaunchPage({ product }: { product: NewMacLaunchKey }) {
  const launch = newMacLaunches[product];
  const sections = product === "mac-mini" ? macMiniSections : macStudioSections;

  return (
    <>
      <SEO title={`${launch.name} ${launch.chips} Pre-Order`} description={`Explore the new ${launch.name} with ${launch.chips}, then prepare a pre-order request with Buy & Sell GH.`} />
      <main className={`mac-story-page mac-story-${launch.theme}`}>
        <section className="mac-story-hero" aria-labelledby="mac-story-title">
          <div className="mac-story-hero-copy">
            <p className="store-eyebrow">New Mac · Pre-order</p>
            <h1 id="mac-story-title">{launch.name}</h1>
            <p>{launch.chips}</p>
            <span>Local availability and final pricing will be confirmed by Buy &amp; Sell GH.</span>
            <div className="store-actions">
              <Link className="store-button store-button-primary" to={launch.preorderTo}>Pre-order {launch.name}</Link>
              <Link className="store-button store-button-secondary" to="/macbooks">Explore available Macs</Link>
            </div>
          </div>
          <img src={launch.image} alt={launch.imageAlt} fetchPriority="high" decoding="async" />
        </section>

        <div className="mac-story-grid">
          {sections.map((section) => <MacStoryPanel section={section} key={section.eyebrow} />)}
        </div>

        <section className="mac-story-preorder" aria-labelledby="mac-story-preorder-title">
          <p className="store-eyebrow">Buy &amp; Sell GH pre-order</p>
          <h2 id="mac-story-preorder-title">Tell us which {launch.name} you want.</h2>
          <p>Prepare your request now. Buy &amp; Sell GH will confirm Ghana availability, configuration, price, payment and delivery details before anything is final.</p>
          <Link className="store-button store-button-primary" to={launch.preorderTo}>Start pre-order <ArrowRight size={17} /></Link>
        </section>
      </main>
    </>
  );
}

function MacStoryPanel({ section }: { section: StorySection }) {
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    if (!window.IntersectionObserver) {
      panel.classList.add("is-visible");
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      panel.classList.add("is-visible");
      observer.disconnect();
    }, { threshold: 0.16 });
    observer.observe(panel);
    return () => observer.disconnect();
  }, []);

  const Icon = section.icon;
  return (
    <article ref={panelRef} className={`mac-story-panel mac-story-panel-${section.tone ?? "light"}`}>
      <Icon size={30} aria-hidden="true" />
      <p className="store-eyebrow">{section.eyebrow}</p>
      <h2>{section.title}</h2>
      <p>{section.description}</p>
      <ul>{section.facts.map((fact) => <li key={fact}>{fact}</li>)}</ul>
    </article>
  );
}
