
import type { MetaFunction } from "@remix-run/node";
import { useEffect, useRef } from "react";
import Typed from "typed.js";

import { SiDocker, SiFigma, SiGithub, SiJavascript, SiKotlin, SiRemix, SiTailwindcss, SiTypescript } from "react-icons/si";
import { DiNodejs } from "react-icons/di";

import Navbar from "~/components/navbar";
import Project from "~/components/projects/project";
import naimroslan from "~/assets/naimroslan.png";
import { useNavigate } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "naimroslan" },
  ];
};

export default function Index() {
  const skills = useRef(null);

  const homeRef = useRef(null)
  const aboutRef = useRef(null)
  const projectRef = useRef(null)

  useEffect(() => {
    const typed = new Typed(skills.current, {
      strings: ['Remix JS', 'JavaScript', 'TypeScript', 'React Native', 'Kotlin/Java', 'Node.js', 'Tailwind CSS', 'Docker', 'Figma'],
      typeSpeed: 80,
    });

    return () => {
      // Destroy Typed instance during cleanup to stop animation
      typed.destroy();
    }
  }, [])

  const handleGithubClick = () => {
    window.open('https://github.com/naimroslan/', '_blank');
  }

  return (
    <div className="font-SpaceGrotesk space-y-10" ref={homeRef}>
      <Navbar homeRef={homeRef} aboutRef={aboutRef} projectRef={projectRef} />
      <div className="flex flex-col px-12">
        <div className="flex flex-row">
          <div className="flex flex-col">
            <div className="text-8xl font-medium">
              HI, I'M<br/>NAIM ROSLAN
            </div>
            <div className="text-2xl font-medium">
              I'm a software engineer. I can do <span ref={skills} />
            </div>
          </div>
          {/* <div>
            <img src={naimroslan} />
          </div> */}
        </div>
        <div className="flex justify-end">
          <div className="flex flex-row mt-64">
            <div className="w-48 border-t border-gray-400 mx-4 mt-4"></div>
            <div className="cursor-pointer" onClick={handleGithubClick}>
              <SiGithub size={30} title="Check out my Github profile!"/>
            </div>
          </div>
        </div>
        <div className="flex flex-row justify-between mt-36" ref={aboutRef}>
          <div className="font-medium text-xl">
            ABOUT
          </div>
          <div className="flex flex-col space-y-4">
            <div className="text-lg text-justify max-w-[700px]">
              Hey there! I'm a frontend developer who loves finding cool ways to make stuff
              look awesome and work even better. Lately, I've been getting into backend development
              too, playing around with things like Node.js and PostgreSQL. It's been a wild ride,
              but super fun! I'm figuring out all this new stuff like message queues and ORM integration,
              which keeps me on my toes. But hey, every line of code is a chance to create something rad
              that gets people stoked. Let's make some magic happen!
            </div>
            <div className="text-lg">
              Take a look at my stack
              <div className="flex flex-row space-x-4 mt-2">
                <SiRemix size={20} title="Remix JS"/>
                <SiJavascript size={20} title="JavaScript"/>
                <SiTypescript size={20} title="TypeScript"/>
                <SiKotlin size={20} title="Kotlin"/>
                <DiNodejs className="-mt-5" size={60} title="Node.js"/>
                <SiTailwindcss size={20} title="Tailwind CSS"/>
                <SiDocker size={20} title="Docker"/>
                <SiFigma size={20} title="Figma"/>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col mt-96 space-y-8" ref={projectRef}>
          <div className="font-medium text-xl">
            PROJECT
          </div>
          <div className="flex justify-center">
            <div className="flex flex-row space-x-4">
              <div className="flex flex-col space-y-4">
                <Project 
                  title="Dosa Aksara"
                  description="Dosa Aksara is this (silly) little side project I made for my friends.
                  Okay, so here's the story — we've been friends since college. Over the years,
                  we've been mispronouncing words like crazy. You know how people mistype a word,
                  they call it a typo? Well, Dosa Aksara is like that, but for speech mishaps.
                  We used to use Google Forms for this, but I felt like it was missing a lot
                  of features, like proper filtering. So I decided to make my own thing."
                  link="https://dosa-aksara.naimroslan.dev"
                />
                <Project 
                  title="Let 'em know"
                  description={
                    <>
                      (Upcoming)
                      <br/>
                      Early 2025
                    </>
                  }
                />
              </div>
              <div className="flex flex-col space-y-4">
                <Project 
                  title="Ez2Sign"
                  description="Ez2Sign is an e-signature system crafter on Remix JS and styles with
                  Tailwind CSS. It makes signing documents online super easy. You can add up to 3 parties,
                  and they'll all get the email updates on the signing progress."
                  link="#"
                />
                <Project 
                  title="MySecurePasskey"
                  description="MySecurePasskey is a Single Sign-On system with eKYC functionality.
                  Users can log in to any system that requires eKYC, but they only need to do it once
                  during MySecurePasskey registration. The system uses OpenID Connect protocol for single
                  sign-on and FIDO2 for passwordless authentication"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}