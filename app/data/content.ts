// Content layer: markdown files in /content, imported as raw text at build time.
// No runtime fetch, no DB. Edit a .md → rebuild → site updates.

import aboutRaw from "../content/about.md?raw";
import tofuRaw from "../content/projects/tofu.md?raw";
import dosaRaw from "../content/projects/dosa-aksara.md?raw";
import lazytikRaw from "../content/projects/lazytik.md?raw";

export interface ContentItem {
  title: string;
  body: string;
  link?: string;
}

function parse(raw: string): ContentItem {
  // frontmatter: ---\n key: value \n---\n body
  const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!m) return { title: "", body: raw };
  const fm: Record<string, string> = {};
  for (const line of m[1].split("\n")) {
    const [k, ...v] = line.split(":");
    if (k && v.length) fm[k.trim()] = v.join(":").trim();
  }
  return { title: fm.title ?? "", body: m[2].trim(), link: fm.link };
}

export const about = parse(aboutRaw);
export const projects: ContentItem[] = [
  parse(tofuRaw),
  parse(dosaRaw),
  parse(lazytikRaw),
];
