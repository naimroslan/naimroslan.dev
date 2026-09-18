import {
  SiClaude,
  SiDocker,
  SiFigma,
  SiJavascript,
  SiMailtrap,
  SiNodedotjs,
  SiPostgresql,
  SiPython,
  SiReact,
  SiReactrouter,
  SiShadcnui,
  SiTailwindcss,
  SiTypescript,
} from "react-icons/si";

import TanstackIcon from "~/components/icons/tanstack";

import { about } from "~/data/content";

import Section from "./section";

/** Ordered languages, then framework and runtime, then data, service, tools. */
const STACK = [
  { Icon: SiTypescript, label: "TypeScript" },
  { Icon: SiJavascript, label: "JavaScript" },
  { Icon: SiPython, label: "Python" },
  { Icon: SiReact, label: "React" },
  { Icon: SiReactrouter, label: "React Router" },
  { Icon: TanstackIcon, label: "TanStack Start" },
  { Icon: SiNodedotjs, label: "Node.js" },
  { Icon: SiTailwindcss, label: "Tailwind CSS" },
  { Icon: SiShadcnui, label: "shadcn/ui" },
  { Icon: SiPostgresql, label: "Postgres" },
  { Icon: SiMailtrap, label: "Mailtrap" },
  { Icon: SiDocker, label: "Docker" },
  { Icon: SiFigma, label: "Figma" },
  { Icon: SiClaude, label: "Claude Code" },
];

const ICON_SIZE = 22;

export default function About() {
  return (
    <Section id="about" label="ABOUT">
      <div className="grid gap-8">
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
