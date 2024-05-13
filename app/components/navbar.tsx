import { useNavigate } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { HiOutlineMenuAlt3 } from "react-icons/hi";

export default function Navbar({ homeRef, aboutRef, projectRef}) {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState<string>('home')
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // function to toggle the visibility of the dropdown meny
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

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

      setIsMenuOpen(false)
    }
  }
  
  return (
    <nav className="sticky top-2 z-10 bg-white backdrop-filter backdrop-blur-lg bg-opacity-30 border-b border-gray-200 rounded-full">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <span 
            className="text-2xl text-gray-900 font-semibold cursor-pointer md:text-center" 
            onClick={() => handleNavClick(homeRef)}
          >
            naimroslan.
          </span>
          <div className="flex md:flex-col relative">
            <div className="lg:hidden relative" onClick={toggleMenu}>
              <HiOutlineMenuAlt3 />
            </div>
            {/* Dropdown menu */}
            <div className={`absolute top-full right-0 ${isMenuOpen ? 'flex flex-col mt-4 text-right' : 'hidden'} lg:flex flex-row space-x-4 text-gray-900`}>
              <span 
                className={`ml-4 cursor-pointer ${activeSection === 'home' ? 'font-bold' : ''}`} 
                onClick={() => handleNavClick(homeRef)}
              >
                HOME
                {activeSection === 'home' && <div className="lg:w-2 lg:h-2 bg-gray-900 sm:rounded-full sm:absolute sm:mt-1 sm:ml-5" />}
              </span>
              <span 
                className={`cursor-pointer ${activeSection === 'about' ? 'font-bold' : ''}`}
                onClick={() => handleNavClick(aboutRef)}
              >
                ABOUT
                {activeSection === 'about' && <div className="lg:w-2 lg:h-2 bg-gray-900 sm:rounded-full sm:absolute sm:mt-1 sm:ml-5" />}
              </span>
              <span 
                className={`cursor-pointer ${activeSection === 'project' ? 'font-bold' : ''}`}
                onClick={() => handleNavClick(projectRef)}
              >
                PROJECT
                {activeSection === 'project' && <div className="lg:w-2 lg:h-2 bg-gray-900 sm:rounded-full sm:absolute sm:mt-1 sm:ml-5" />}
              </span>
              <span 
                className={` cursor-pointer ${activeSection === 'contact' ? 'font-bold' : ''} lg:hidden`}
                onClick={() => navigate("/contact")}
              >
                CONTACT
                {activeSection === 'contact' && <div className="lg:w-2 lg:h-2 bg-gray-900 sm:rounded-full sm:absolute sm:mt-1 sm:ml-5" />}
              </span>
            </div>
          </div>
          <div className="hidden lg:block">
            <span className={` text-gray-900 cursor-pointer`} onClick={() => navigate("/contact")}>CONTACT</span>
          </div>
        </div>
      </div>
    </nav>
  )
}