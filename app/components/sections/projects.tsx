import Project from "~/components/projects/project";
import { projects } from "~/data/content";

import Section from "./section";

export default function Projects() {
  return (
    <Section id="projects" label="PROJECTS">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Project key={project.title} {...project} />
        ))}
      </div>
    </Section>
  );
}
