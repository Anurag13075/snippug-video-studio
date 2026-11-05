import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "./login";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — SnipPug Studio" },
      {
        name: "description",
        content: "Sign in to SnipPug with Google.",
      },
    ],
  }),
  component: LoginPage,
});
