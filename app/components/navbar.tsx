import { useNavigate } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";

export default function Navbar({ homeRef, aboutRef, projectRef}) {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState<string>('home')

  useEffect(() => {
    const handleScroll = () => {
      const homePosition = homeRef.current?.getBoundingClientRect().top || 0;
      const aboutPosition = aboutRef.current?.getBoundingClientRect().top || 0;
      const projectPosition = projectRef.current?.getBoundingClientRect().top || 0;

      if (homePosition >= 0 && homePosition < window.innerHeight) {
        setActiveSection('home');
      } else if (aboutPosition >= 0 && aboutPosition < window.innerHeight) {
        setActiveSection('about');
      } else if (projectPosition >= 0 && projectPosition < window.innerHeight) {
        setActiveSection('project');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [homeRef, aboutRef, projectRef]);

  const handleNavClick = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({ 
        behavior: 'smooth'
      })
    }
  }
  
  return (
    <nav className="sticky top-2 z-10 bg-white backdrop-filter backdrop-blur-lg bg-opacity-30 border-b border-gray-200 rounded-full">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <span 
            className="text-2xl text-gray-900 font-semibold cursor-pointer" 
            onClick={() => handleNavClick(homeRef)}
          >
            naimroslan.
          </span>
          <div className="flex space-x-4 text-gray-900">
            <span 
              className={`cursor-pointer ${activeSection === 'home' ? 'font-bold' : ''}`} 
              onClick={() => handleNavClick(homeRef)}
            >
              HOME
              {activeSection === 'home' && <div className="w-2 h-2 bg-gray-900 rounded-full absolute mt-1 ml-5" />}
            </span>
            <span 
              className={`cursor-pointer ${activeSection === 'about' ? 'font-bold' : ''}`}
              onClick={() => handleNavClick(aboutRef)}
            >
              ABOUT
              {activeSection === 'about' && <div className="w-2 h-2 bg-gray-900 rounded-full absolute mt-1 ml-5" />}
            </span>
            <span 
              className={`cursor-pointer ${activeSection === 'project' ? 'font-bold' : ''}`}
              onClick={() => handleNavClick(projectRef)}
            >
              PROJECT
              {activeSection === 'project' && <div className="w-2 h-2 bg-gray-900 rounded-full absolute mt-1 ml-7" />}
            </span>
          </div>
          <span className="text-gray-900 cursor-pointer" onClick={() => navigate("/contact")}>CONTACT</span>
        </div>
      </div>
    </nav>
  )
}