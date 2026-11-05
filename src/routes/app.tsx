import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";

export const Route = createFileRoute("/app")({
  component: AppPageLayout,
});

function AppPageLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
