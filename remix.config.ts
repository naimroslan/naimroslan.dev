import { defineConfig } from "@remix-run/dev";

export default defineConfig({
  serverModuleFormat: "esm",
  serverPlatform: "neutral",
  serverConditions: ["worker"],
  serverMinify: true,
});
