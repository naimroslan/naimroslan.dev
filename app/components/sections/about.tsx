import {
  SiDocker,
  SiFigma,
  SiJavascript,
  SiKotlin,
  SiNodedotjs,
  SiTailwindcss,
  SiTypescript,
} from "react-icons/si";

import portrait from "~/assets/naimroslan.png";
import { about } from "~/data/content";

import Section from "./section";

const STACK = [
  { Icon: SiTypescript, label: "TypeScript" },
  { Icon: SiJavascript, label: "JavaScript" },
  { Icon: SiKotlin, label: "Kotlin" },
  { Icon: SiNodedotjs, label: "Node.js" },
  { Icon: SiTailwindcss, label: "Tailwind CSS" },
  { Icon: SiDocker, label: "Docker" },
  { Icon: SiFigma, label: "Figma" },
];

const ICON_SIZE = 22;

export default function About() {
  return (
    <Section id="about" label="ABOUT">
      <div className="grid gap-8 sm:grid-cols-[9rem_1fr] sm:gap-10 lg:grid-cols-[13rem_1fr] lg:gap-14">
        <div className="aspect-4/5 w-32 overflow-hidden rounded-2xl border border-line bg-white sm:w-full">
          <img
            src={portrait}
            alt="Naim Roslan"
            className="h-full w-full object-cover object-center"
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="flex flex-col gap-8">
          <p className="max-w-2xl text-lg leading-relaxed text-muted">{about.body}</p>

          <div>
            <p className="text-sm font-medium tracking-[0.15em] text-muted">MY STACK</p>
            <ul className="mt-4 flex flex-wrap gap-3">
              {STACK.map(({ Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-2 rounded-xs border border-line bg-surface px-3.5 py-1.5 text-sm"
                >
                  <Icon size={ICON_SIZE} aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Section>
  );
}
