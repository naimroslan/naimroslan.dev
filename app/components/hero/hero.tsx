import { useEffect, useRef, useState, type ComponentType } from "react";
import Typed from "typed.js";
import { SiGithub } from "react-icons/si";

import type { Theme } from "~/hooks/use-theme";
import portrait from "~/assets/naimroslan.png";
import type { DeskSceneProps } from "./desk-scene.client";

const GITHUB_URL = "https://github.com/naimroslan/";
const TYPE_SPEED_MS = 80;
const SKILLS = [
  "TypeScript",
  "JavaScript",
  "React Router",
  "React Native",
  "Kotlin/Java",
  "Node.js",
  "Tailwind CSS",
  "Docker",
  "Figma",
];

export interface HeroProps {
  theme: Theme;
}

export default function Hero({ theme }: HeroProps) {
  const skillsRef = useRef<HTMLSpanElement>(null);
  const [Scene, setScene] = useState<ComponentType<DeskSceneProps> | null>(null);
  const [chunkFailed, setChunkFailed] = useState(false);

  // three.js is pulled in only after hydration, which keeps it out of both the
  // Workers bundle and the entry chunk. The placeholder below reserves the
  // exact height, so the swap causes no layout shift.
  useEffect(() => {
    let cancelled = false;

    import("./desk-scene.client")
      .then((module) => {
        if (!cancelled) setScene(() => module.default);
      })
      .catch((error: unknown) => {
        // A stale deploy or an offline visitor would otherwise be left staring
        // at the placeholder forever, so fall back to the photo.
        console.error("Hero scene failed to load", error);
        if (!cancelled) setChunkFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!skillsRef.current) return;

    const typed = new Typed(skillsRef.current, {
      strings: SKILLS,
      typeSpeed: TYPE_SPEED_MS,
      loop: true,
    });

    return () => typed.destroy();
  }, []);

  return (
    <section id="home" className="mx-auto w-full max-w-6xl px-6 lg:px-10">
      <div className="grid items-center gap-6 pt-10 pb-6 lg:min-h-[calc(100vh-4rem)] lg:grid-cols-2 lg:gap-12 lg:py-0">
        <div className="flex flex-col">
          <p className="animate-slidein [--slidein-delay:200ms] text-sm font-medium tracking-wide text-muted">
            Hi, I'm
          </p>
          <h1 className="animate-slidein [--slidein-delay:300ms] mt-2 text-5xl leading-[0.95] font-semibold tracking-tight sm:text-6xl lg:text-7xl">
            NAIM
            <br />
            ROSLAN
          </h1>
          <p className="animate-slidein [--slidein-delay:500ms] mt-6 max-w-md text-lg text-muted lg:text-xl">
            I'm a software engineer. I can do{" "}
            {/* Fixed break, so the paragraph is always two lines. typed.js puts
                its cursor in a sibling after this span, so making the span
                block-level would push the cursor onto a third line instead. */}
            <br />
            <span ref={skillsRef} className="font-medium text-fg" />
          </p>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="animate-slidein [--slidein-delay:700ms] group mt-10 flex w-full items-center gap-4 text-sm font-medium sm:inline-flex sm:w-fit transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            {/* Decorative rule, so it is not announced as content inside the link. */}
            <span
              aria-hidden="true"
              className="h-px flex-1 bg-line transition-colors group-hover:bg-accent sm:w-32 sm:flex-none"
            />
            <SiGithub aria-hidden="true" />
            Github
          </a>
        </div>

        <div className="relative h-[42vh] min-h-[260px] lg:h-[70vh]">
          {Scene && <Scene theme={theme} />}
          {!Scene && chunkFailed && (
            <div className="flex h-full w-full items-end justify-center">
              <img src={portrait} alt="Naim Roslan" className="max-h-full w-auto object-contain" />
            </div>
          )}
          {!Scene && !chunkFailed && (
            <div className="flex h-full w-full items-center justify-center">
              <div className="h-24 w-24 rounded-full bg-fg/5 motion-safe:animate-pulse" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
