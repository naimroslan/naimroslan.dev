import { useEffect } from "react";
import { SiGithub, SiLinkedin } from "react-icons/si";

import naim from "~/assets/naimroslan.png"

export default function Contact() {

  const handleLinkedInOnClick = () => {
    window.open('https://www.linkedin.com/in/muhammad-naim-bin-roslan/', '_blank');
  }

  const handleGithubOnClick = () => {
    window.open('https://github.com/naimroslan/', '_blank');
  }

  return(
    <div className="font-SpaceGrotesk">
      <div className="flex h-screen justify-center items-center">
        <div className="flex flex-col space-y-8">
          <div className="flex flex-row items-center space-x-4">
            <div className="flex flex-col font-medium text-7xl">
              <div>REACH</div>
              <div>ME</div>
              <div>OUT</div>
            </div>
            <div>
              
            </div>
          </div>
          <div className="flex flex-row justify-between">
            <div className="flex flex-row items-center space-x-2 cursor-pointer" onClick={handleLinkedInOnClick}>
              <SiLinkedin />
              <div>LinkedIn</div>
            </div>
            <div className="flex flex-row items-center space-x-2 cursor-pointer" onClick={handleGithubOnClick}>
              <SiGithub />
              <div>Github</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}