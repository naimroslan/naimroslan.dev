import { useEffect, useState } from "react";
import { HiOutlineMoon, HiOutlineSun } from "react-icons/hi2";

const NAV_ITEMS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
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
    /**
     * No border and no backdrop blur: the bar fades from the page colour at its
     * top to transparent at its bottom. A blur would have to go regardless of
     * the border, since backdrop-filter applies across the whole element box
     * and would leave a hard cut-off exactly where the fade should vanish.
     *
     * The transparent lower half overlays scrolling content, so the header
     * itself takes no pointer events and the controls opt back in.
     */
    <header className="pointer-events-none sticky top-0 z-50 bg-linear-to-b from-page from-30% via-page/80 to-transparent">
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-6xl items-center px-6 lg:px-10"
      >
        <ul className="pointer-events-auto flex items-center">
          {NAV_ITEMS.map(({ id, label }) => {
            const isActive = activeSection === id;
            return (
              <li key={id}>
                <a
                  href={`#${id}`}
                  /* The dot carries no text, so the accessible name has to come
                     from here or the link announces as nothing at all. */
                  aria-label={label}
                  aria-current={isActive ? "true" : undefined}
                  className="group flex h-10 items-center px-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <span
                    className={`h-1.5 rounded-full transition-all duration-300 motion-reduce:transition-none ${
                      isActive ? "w-6 bg-accent" : "w-1.5 bg-muted/45 group-hover:bg-muted"
                    }`}
                  />
                </a>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          className="pointer-events-auto ml-auto flex size-9 cursor-pointer items-center justify-center rounded-xs text-muted transition-colors hover:bg-fg/5 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <HiOutlineSun className="hidden dark:block" aria-hidden="true" />
          <HiOutlineMoon className="block dark:hidden" aria-hidden="true" />
        </button>
      </nav>
    </header>
  );
}
