import { HiArrowUpRight } from "react-icons/hi2";
import { SiGithub, SiLinkedin } from "react-icons/si";

import Section from "./section";

// Add an { Icon: HiOutlineMail, label: "Email", href: "mailto:..." } entry here
// if you want an address on the page.
const CHANNELS = [
  {
    Icon: SiLinkedin,
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/muhammad-naim-bin-roslan/",
  },
  {
    Icon: SiGithub,
    label: "Github",
    href: "https://github.com/naimroslan/",
  },
];

export default function Contact() {
  return (
    <Section id="contact" label="CONTACT">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-14">
        <p className="text-4xl leading-[0.95] font-semibold tracking-tight sm:text-5xl lg:text-6xl">
          REACH
          <br />
          ME
          <br />
          OUT
        </p>

        <ul className="flex flex-col gap-3">
          {CHANNELS.map(({ Icon, label, href }) => (
            <li key={label}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="card card-interactive group flex items-center gap-3 px-5 py-4"
              >
                <Icon aria-hidden="true" />
                <span className="font-medium">{label}</span>
                <HiArrowUpRight
                  className="ml-auto text-muted transition-colors group-hover:text-accent"
                  aria-hidden="true"
                />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
