import type { MetaFunction } from "@remix-run/node";
import { useEffect, useRef } from "react";
import Typed from "typed.js";
import Navbar from "~/components/navbar";

export const meta: MetaFunction = () => {
  return [
    { title: "naimroslan" },
  ];
};

export default function Index() {
  const skills = useRef(null);

  useEffect(() => {
    const typed = new Typed(skills.current, {
      strings: ['Remix JS', 'JavaScript', 'TypeScript', 'React Native', 'Kotlin/Java', 'Node.js', 'Tailwind CSS', 'Docker'],
      typeSpeed: 80,
    });

    return () => {
      // Destroy Typed instance during cleanup to stop animation
      typed.destroy();
    }
  }, [])

  return (
    <div className="font-SpaceGrotesk space-y-10">
      <Navbar />
      <div className="flex flex-col px-12">
        <div className="text-8xl font-medium">
          HI, I'M<br/>NAIM ROSLAN
        </div>
        <div className="text-2xl font-medium">
          I'm a software engineer. I can do <span ref={skills} />
        </div>
      </div>
    </div>
  )
}