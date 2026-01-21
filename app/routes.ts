import { type RouteConfig, index, route } from "@react-router/dev/routes";

const routes = [
  index("routes/_index.tsx"),
  route("contact", "routes/contact.tsx"),
  route("*", "routes/error_not_found.tsx"),
] satisfies RouteConfig;

export default routes;
