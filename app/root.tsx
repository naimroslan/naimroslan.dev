import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import { PAGE_COLOR } from "~/hooks/use-theme";
import "./app.css";

export const links: Route.LinksFunction = () => [
  // SVG first; favicon.ico stays declared for browsers that cannot use it.
  { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
  { rel: "alternate icon", href: "/favicon.ico", sizes: "any" },
  // Installed-icon pair. Opaque tiles rather than the transparent favicon:
  // older iOS reads only this link and ignores manifest icons entirely, and it
  // composites any transparency onto black.
  { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
  { rel: "manifest", href: "/site.webmanifest" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        {/* No theme-color meta here on purpose. It has to track the `dark`
            class rather than prefers-color-scheme, so the boot script below
            owns it; leaving it out of the React tree is what stops hydration
            from reverting what that script set. */}
        {/* iOS before 17.4 launches standalone from this meta, not the manifest. */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        {/* iOS labels a home screen icon from this, falling back to the page
            title rather than to the manifest's short_name. Pinning it keeps the
            label right when the site is added from /contact or a 404. */}
        <meta name="apple-mobile-web-app-title" content="naimroslan" />
        {/* Light is the default; only an explicit saved choice opts into dark.
            Runs before paint so there is no flash of the wrong theme, and it
            sets the browser UI tint in the same pass so the iOS standalone
            status bar matches the page instead of the OS preference. Lives in
            Layout, so it covers every route, not just the one that calls
            useTheme. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var d=false;try{d=localStorage.getItem('theme')==='dark'}catch(e){}if(d)document.documentElement.classList.add('dark');var m=document.createElement('meta');m.setAttribute('name','theme-color');m.setAttribute('content',d?'${PAGE_COLOR.dark}':'${PAGE_COLOR.light}');document.head.appendChild(m)})();`,
          }}
        />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
