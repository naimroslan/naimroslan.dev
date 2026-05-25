import { useNavigate } from "react-router";
import { useEffect, useState, type RefObject } from "react";
import { HiSun, HiMoon } from "react-icons/hi";

type SectionRefs = {
  homeRef: RefObject<HTMLDivElement>;
  aboutRef: RefObject<HTMLDivElement>;
  projectRef: RefObject<HTMLDivElement>;
};

export default function Navbar({ homeRef, aboutRef, projectRef }: SectionRefs) {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>("home");

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem("theme", isDark ? "dark" : "light");
    } catch {}
  };

  useEffect(() => {
    const handleScroll = () => {
      const homePosition = homeRef.current?.getBoundingClientRect().top || 0;
      const aboutPosition = aboutRef.current?.getBoundingClientRect().top || 0;
      const projectPosition =
        projectRef.current?.getBoundingClientRect().top || 0;

      if (homePosition >= 0 && homePosition < window.innerHeight) {
        setActiveSection("home");
      } else if (aboutPosition >= 0 && aboutPosition < window.innerHeight) {
        setActiveSection("about");
      } else if (projectPosition >= 0 && projectPosition < window.innerHeight) {
        setActiveSection("project");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [homeRef, aboutRef, projectRef]);

  const handleNavClick = (ref: RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  return (
    <nav className="bg-transparent">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-stretch h-16 divide-x divide-fg">
          <span
            className="flex flex-1 items-center px-3 lg:px-6 text-xl lg:text-2xl text-fg font-semibold cursor-pointer"
            onClick={() => handleNavClick(homeRef)}
          >
            <span className="lg:hidden">n.</span>
            <span className="hidden lg:inline">naimroslan.</span>
          </span>
          <span
            className={`flex items-center px-3 lg:px-6 text-fg cursor-pointer ${activeSection === "about" ? "font-bold" : ""}`}
            onClick={() => handleNavClick(aboutRef)}
          >
            ABOUT
          </span>
          <span
            className={`flex items-center px-3 lg:px-6 text-fg cursor-pointer ${activeSection === "project" ? "font-bold" : ""}`}
            onClick={() => handleNavClick(projectRef)}
          >
            PROJECT
          </span>
          <span
            className="flex items-center px-3 lg:px-6 text-fg cursor-pointer"
            onClick={() => navigate("/contact")}
          >
            CONTACT
          </span>
          <button
            type="button"
            className="flex items-center px-3 lg:px-4 text-fg cursor-pointer focus-visible:outline focus-visible:outline-1 focus-visible:outline-fg focus-visible:outline-offset-[-4px]"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <HiSun className="hidden dark:block" />
            <HiMoon className="block dark:hidden" />
          </button>
        </div>
      </div>
    </nav>
  );
}
