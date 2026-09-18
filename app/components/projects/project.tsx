import { HiArrowUpRight } from "react-icons/hi2";

import type { ContentItem } from "~/data/content";

export default function Project({ title, body, link }: ContentItem) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-medium">{title}</h3>
        {link && (
          <HiArrowUpRight
            className="mt-1 shrink-0 text-muted transition-colors group-hover:text-accent"
            aria-hidden="true"
          />
        )}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted">{body}</p>
    </>
  );

  // A project without a link is still worth showing — it just isn't clickable.
  if (!link) {
    return <div className="card p-6">{content}</div>;
  }

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="card card-interactive group block p-6"
    >
      {content}
    </a>
  );
}
