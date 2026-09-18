import { redirect } from "react-router";

// Contact is a section on the home page now; keep the old URL working rather
// than letting it fall through to the 404 splat route.
export function loader() {
  return redirect("/#contact");
}
