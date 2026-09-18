// Content layer: markdown files in /content, imported as raw text at build time.
// No runtime fetch, no DB. Edit a .md → rebuild → site updates.

import aboutRaw from "../../content/about.md?raw";
import tofuRaw from "../../content/projects/tofu.md?raw";
import dosaRaw from "../../content/projects/dosa-aksara.md?raw";
import lazytikRaw from "../../content/projects/lazytik.md?raw";

export interface ContentItem {
  title: string;
  body: string;
  link?: string;
}

const FRONTMATTER = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/;
const SURROUNDING_QUOTES = /^["'](.*)["']$/;

const unquote = (value: string) => value.replace(SURROUNDING_QUOTES, "$1");

function parse(raw: string): ContentItem {
  // frontmatter: ---\n key: value \n---\n body
  const match = raw.match(FRONTMATTER);
  if (!match) return { title: "", body: raw };

  const fields: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const [key, ...rest] = line.split(":");
    if (key && rest.length) fields[key.trim()] = unquote(rest.join(":").trim());
  }

  return { title: fields.title ?? "", body: match[2].trim(), link: fields.link };
}

export const about = parse(aboutRaw);
export const projects: ContentItem[] = [
  parse(tofuRaw),
  parse(dosaRaw),
  parse(lazytikRaw),
];
