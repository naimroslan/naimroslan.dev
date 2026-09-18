import { useEffect, useState } from "react";
import { HiOutlineMoon, HiOutlineSun } from "react-icons/hi2";

const NAV_ITEMS = [
  { id: "about", label: "ABOUT" },
  { id: "projects", label: "PROJECTS" },
  { id: "contact", label: "CONTACT" },
] as const;

/**
 * A section becomes "current" once its top edge crosses this fraction of the
 * viewport, so the nav updates as content reaches reading position rather than
 * the instant a section's edge appears.
 */
const ACTIVATION_LINE_RATIO = 0.35;
/** Slack for fractional device pixels when testing for end-of-document. */
const BOTTOM_TOLERANCE_PX = 2;

export interface NavbarProps {
  onToggleTheme: () => void;
}

export default function Navbar({ onToggleTheme }: NavbarProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const sections = NAV_ITEMS.map(({ id }) => document.getElementById(id)).filter(
      (element): element is HTMLElement => element !== null,
    );
    const lastSection = sections.at(-1);
    if (!lastSection) return;

    const resolveActive = () => {
      const activationLine = window.innerHeight * ACTIVATION_LINE_RATIO;

      // The last section to have crossed the line wins, so scrolling down
      // hands off cleanly instead of the earliest match sticking.
      let current: string | null = null;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= activationLine) current = section.id;
      }

      // A short final section can never reach the activation line once the
      // page has bottomed out, so end-of-document always means the last one.
      const scrolledToBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - BOTTOM_TOLERANCE_PX;
      setActiveSection(scrolledToBottom ? lastSection.id : current);
    };

    // Coalesced into one measurement per frame, so the three reads never run
    // more than once per paint however fast the scroll events arrive.
    let frameId = 0;
    const onScroll = () => {
      if (frameId !== 0) return;
      frameId = requestAnimationFrame(() => {
        frameId = 0;
        resolveActive();
      });
    };

    resolveActive();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (frameId !== 0) cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-page/80 backdrop-blur-md">
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-6xl items-center gap-0.5 px-6 lg:gap-1 lg:px-10"
      >
        <a
          href="#top"
          className="mr-auto text-lg font-semibold tracking-tight lg:text-xl"
        >
          <span className="lg:hidden">n.</span>
          <span className="hidden lg:inline">naimroslan.</span>
        </a>

        {NAV_ITEMS.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            aria-current={activeSection === id ? "true" : undefined}
            className={`rounded-xs px-2.5 py-2 text-xs font-medium tracking-[0.12em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:px-3 lg:text-sm ${
              activeSection === id ? "text-accent" : "text-muted hover:text-fg"
            }`}
          >
            {label}
          </a>
        ))}

        <button
          type="button"
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          className="ml-1 flex size-9 cursor-pointer items-center justify-center rounded-xs text-muted transition-colors hover:bg-fg/5 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <HiOutlineSun className="hidden dark:block" aria-hidden="true" />
          <HiOutlineMoon className="block dark:hidden" aria-hidden="true" />
        </button>
      </nav>
    </header>
  );
}
