import { useNavigate } from "@remix-run/react";
import { useState } from "react";

export default function Navbar() {
  const navigate = useNavigate()
  const [activeItem, setActiveItem] = useState('HOME');

  const handleItemClick = (item) => {
    setActiveItem(item);

    if (item === 'HOME') {
      navigate("/")
    } else if (item === 'ABOUT') {
      navigate("/about")
    } else if (item === 'PROJECT') {
      navigate("/project")
    }
  }
  
  const pyramidIndicator = (
    <div className="absolute left-[-20px] top-1/2 transform -translate-y-1/2">
      ▶
    </div>
  )

  return (
    <div className="font-SpaceGrotesk flex flex-row justify-between">
      <div 
        className="font-medium text-xl cursor-pointer"
        onClick={() => navigate("/")}
      >
        naimroslan.
      </div>
      <div className="flex flex-col font-medium text-sm">
        <div className="relative">
          <div
            className={`cursor-pointer ${activeItem === 'HOME' ? 'font-bold' : ''}`}
            onClick={() => handleItemClick('HOME')}
          >
            HOME
            {activeItem === 'HOME' && pyramidIndicator}
          </div>
        </div>
        <div className="relative">
          <div
            className={`cursor-pointer ${activeItem === 'ABOUT' ? 'font-bold' : ''}`}
            onClick={() => handleItemClick('ABOUT')}
          >
            ABOUT
            {activeItem === 'ABOUT' && pyramidIndicator}
          </div>
        </div>
        <div className="relative">
          <div
            className={`cursor-pointer ${activeItem === 'PROJECT' ? 'font-bold' : ''}`}
            onClick={() => handleItemClick('PROJECT')}
          >
            PROJECT
            {activeItem === 'PROJECT' && pyramidIndicator}
          </div>
        </div>
      </div>
      <div>
        <div className="font-medium text-base">
          CONTACT
        </div>
      </div>
    </div>
  );
}