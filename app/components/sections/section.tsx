import type { ReactNode } from "react";

export interface SectionProps {
  id: string;
  label: string;
  children: ReactNode;
}

/** Shared shell so every section shares one heading treatment and rhythm. */
export default function Section({ id, label, children }: SectionProps) {
  return (
    <section
      id={id}
      className="mx-auto w-full max-w-6xl px-6 py-16 lg:px-10 lg:py-24"
    >
      <h2 className="flex items-center gap-4 text-sm font-medium tracking-[0.2em] text-muted">
        {label}
        <span className="h-px flex-1 bg-line" aria-hidden="true" />
      </h2>
      <div className="mt-8 lg:mt-10">{children}</div>
    </section>
  );
}
