import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { handleAuthCallback } from "@/lib/supabase";
import { Puggy } from "@/components/snippug/Puggy";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [{ title: "Authenticating — SnipPug" }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function processAuth() {
      try {
        const session = await handleAuthCallback();
        if (session) {
          void navigate({ to: "/studio" });
        } else {
          void navigate({ to: "/studio" });
        }
      } catch (err) {
        console.error("Auth callback failed", err);
        setError("Sign in could not be completed. Redirecting...");
        setTimeout(() => {
          void navigate({ to: "/" });
        }, 2000);
      }
    }

    void processAuth();
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#14100c] p-6 text-center text-[#F5E6CB]">
      <div className="h-24 w-24">
        <Puggy mood="listening" bouncing className="h-full w-full" />
      </div>
      <h2 className="mt-4 text-lg font-bold">
        {error ? error : "Signing you in to SnipPug..."}
      </h2>
      <p className="mt-1 text-xs text-[#A89F91]">
        Connecting your Google creator account
      </p>
    </div>
  );
}
