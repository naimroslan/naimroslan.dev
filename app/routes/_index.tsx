import { useEffect, useRef } from "react";
import Typed from "typed.js";

import {
  SiDocker,
  SiFigma,
  SiGithub,
  SiJavascript,
  SiKotlin,
  SiRemix,
  SiTailwindcss,
  SiTypescript,
} from "react-icons/si";
import { DiNodejs } from "react-icons/di";

import Navbar from "~/components/navbar";
import Project from "~/components/projects/project";

export const meta = () => [{ title: "naimroslan" }];

export default function Index() {
  const skills = useRef<HTMLSpanElement>(null);

  const homeRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const projectRef = useRef<HTMLDivElement>(null);
  const skillStrings = useRef<string[]>([
    "TypeScript",
    "JavaScript",
    "React Router",
    "React Native",
    "Kotlin/Java",
    "Node.js",
    "Tailwind CSS",
    "Docker",
    "Figma",
  ]);

  useEffect(() => {
    if (!skills.current) {
      return;
    }

    const typed = new Typed(skills.current, {
      strings: skillStrings.current,
      typeSpeed: 80,
    });

    return () => {
      // Destroy Typed instance during cleanup to stop animation
      typed.destroy();
    };
  }, []);

  const handleGithubClick = () => {
    window.open("https://github.com/naimroslan/", "_blank");
  };

  return (
    <div className="font-SpaceGrotesk space-y-10 px-10 py-5" ref={homeRef}>
      <Navbar homeRef={homeRef} aboutRef={aboutRef} projectRef={projectRef} />
      <div className="flex flex-col">
        <div className="flex flex-row">
          <div className="flex flex-col">
            <div className="animate-slidein [--slidein-delay:300ms] text-4xl lg:text-8xl font-medium">
              HI, I'M
              <br />
              NAIM ROSLAN
            </div>
            <div className="animate-slidein [--slidein-delay:500ms] text-xl lg:text-2xl font-medium">
              I'm a software engineer. I can do <span ref={skills} />
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <div className="animate-slidein [--slidein-delay:700ms] flex flex-row mt-64">
            <div className="w-48 border-t border-gray-400 mx-4 mt-4"></div>
            <div className="cursor-pointer" onClick={handleGithubClick}>
              <SiGithub size={30} title="Check out my Github profile!" />
            </div>
          </div>
        </div>
        <div ref={aboutRef}>
          <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row justify-between mt-36">
            <div className="animate-slidein [--slidein-delay:300ms] font-medium text-xl">
              ABOUT
            </div>
            <div className="flex flex-col space-y-4">
              <div className="text-lg text-justify max-w-[700px]">
                Hey there! I'm a frontend developer who loves finding cool ways
                to make stuff look awesome and work even better. Lately, I've
                been getting into backend development too, playing around with
                things like Node.js and PostgreSQL. It's been a wild ride, but
                super fun! I'm figuring out all this new stuff like message
                queues and ORM integration, which keeps me on my toes. But hey,
                every line of code is a chance to create something rad that gets
                people stoked. Let's make some magic happen!
              </div>
              <div className="text-lg">
                Take a look at my stack
                <div className="flex flex-row space-x-4 mt-2">
                  <SiTypescript size={20} title="TypeScript" />
                  <SiJavascript size={20} title="JavaScript" />
                  <SiKotlin size={20} title="Kotlin" />
                  <DiNodejs className="-mt-5" size={60} title="Node.js" />
                  <SiTailwindcss size={20} title="Tailwind CSS" />
                  <SiDocker size={20} title="Docker" />
                  <SiFigma size={20} title="Figma" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div ref={projectRef}>
          <div className="flex flex-col mt-40 space-y-8">
            <div className="font-medium text-xl">PROJECT</div>
            <div className="flex justify-center">
              <div className="flex flex-col lg:flex-row space-y-4 lg:space-x-4 lg:space-y-0">
                <div className="flex flex-col space-y-4">
                  <Project
                    title="makanmana"
                    description="makanmana is a web app designed to help people — especially workers around Titiwangsa — decide where to eat. If you're feeling indecisive, just roll the dice and let fate decide your next meal!"
                    link="https://makanmana.naimroslan.dev"
                  />
                  <Project
                    title="Typit.in iOS Shortcuts"
                    description="I sorta put together an iOS Shortcut using the Typit.in API. Typit.in
                    is this super catchy temporary URL shortener."
                    link="https://www.icloud.com/shortcuts/0b0bad32615e422697d1c3b1d556b2ab"
                  />
                </div>
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
                  {/* <Project
                    title="MySecurePasskey"
                    description="MySecurePasskey is a Single Sign-On system with eKYC functionality.
                    Users can log in to any system that requires eKYC, but they only need to do it once
                    during MySecurePasskey registration. The system uses OpenID Connect protocol for single
                    sign-on and FIDO2 for passwordless authentication"
                    link={null}
                  /> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
