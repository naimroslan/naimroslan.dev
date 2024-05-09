import { useNavigate } from "@remix-run/react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { SiGithub, SiLinkedin } from "react-icons/si";

export default function Contact() {
  const navigate = useNavigate()

  const handleLinkedInOnClick = () => {
    window.open('https://www.linkedin.com/in/muhammad-naim-bin-roslan/', '_blank');
  }

  const handleGithubOnClick = () => {
    window.open('https://github.com/naimroslan/', '_blank');
  }

  return(
    <div className="h-screen overflow-hidden">
      <div className="font-SpaceGrotesk h-full flex flex-col">
        <div className="p-4 cursor-pointer" onClick={() =>  navigate("/")}>
          <IoIosArrowRoundBack size={30} />
        </div>
        <div className="flex justify-center items-center mt-14">
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
    </div>
  )
}