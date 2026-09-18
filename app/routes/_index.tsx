import Navbar from "~/components/navbar";
import Hero from "~/components/hero/hero";
import About from "~/components/sections/about";
import Contact from "~/components/sections/contact";
import Projects from "~/components/sections/projects";
import { useTheme } from "~/hooks/use-theme";

const DESCRIPTION =
  "Naim Roslan — software engineer. Projects, stack and where to reach me.";

export const meta = () => [
  { title: "naimroslan" },
  { name: "description", content: DESCRIPTION },
  { property: "og:title", content: "naimroslan" },
  { property: "og:description", content: DESCRIPTION },
  { property: "og:type", content: "website" },
];

const YEAR = new Date().getFullYear();

export default function Index() {
  const { theme, toggle } = useTheme();

  return (
    <>
      <Navbar onToggleTheme={toggle} />

      <main id="top">
        <Hero theme={theme} />
        <About />
        <Projects />
        <Contact />
      </main>

      <footer className="mx-auto w-full max-w-6xl px-6 pb-10 text-sm text-muted lg:px-10">
        <div className="border-t border-line pt-6">© {YEAR} naimroslan</div>
      </footer>
    </>
  );
}
