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
    <div className="font-SpaceGrotesk min-h-screen p-6 lg:p-10" ref={homeRef}>
      <div className="border border-fg divide-y divide-fg">
        <Navbar homeRef={homeRef} aboutRef={aboutRef} projectRef={projectRef} />

        <section className="px-10 py-20 lg:py-32">
          <div className="flex flex-col">
            <div className="animate-slidein [--slidein-delay:300ms] text-4xl lg:text-8xl font-medium">
              HI, I'M
              <br />
              NAIM ROSLAN
            </div>
            <div className="animate-slidein [--slidein-delay:500ms] mt-6 text-xl lg:text-2xl font-medium">
              I'm a software engineer. <br className="lg:hidden" />I can do <span ref={skills} />
            </div>
            <div className="flex justify-end mt-32 lg:mt-48">
              <div className="animate-slidein [--slidein-delay:700ms] flex flex-row items-center">
                <div className="w-48 border-t border-fg mx-4"></div>
                <div className="cursor-pointer" onClick={handleGithubClick}>
                  <SiGithub size={30} title="Check out my Github profile!" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          ref={aboutRef}
          className="grid grid-cols-1 lg:grid-cols-4 divide-y divide-fg lg:divide-y-0 lg:divide-x lg:divide-fg"
        >
          <div className="lg:col-span-1 px-10 py-12 animate-slidein [--slidein-delay:300ms] font-medium text-xl">
            ABOUT
          </div>
          <div className="lg:col-span-3 px-10 py-12 flex flex-col space-y-6">
            <div className="text-lg text-justify">
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
        </section>

        <section ref={projectRef} className="px-10 py-8 font-medium text-xl">
          PROJECT
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 divide-y divide-fg lg:divide-y-0 lg:divide-x lg:divide-fg">
          <Project
            title="makanmana"
            description="makanmana is a web app designed to help people — especially workers around Titiwangsa — decide where to eat. If you're feeling indecisive, just roll the dice and let fate decide your next meal!"
            link="https://makanmana.naimroslan.dev"
          />
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
        </section>
      </div>
    </div>
  );
}
