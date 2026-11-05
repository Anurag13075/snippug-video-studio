import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { getStorageEstimate } from "@/lib/storage";

export const Route = createFileRoute("/app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user, signOut } = useAuth();
  const [storageMb, setStorageMb] = useState(0);

  useEffect(() => {
    void getStorageEstimate().then((est) => setStorageMb(est.usageMb));
  }, []);

  const handleClearCache = () => {
    try {
      localStorage.clear();
      setStorageMb(0);
      toast.success("Local browser cache cleared!");
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-2xl">
      <div className="border-b border-[#262330] pb-5">
        <h1 className="text-xl font-bold text-white">Settings</h1>
        <p className="text-xs text-[#A19EAA] mt-1">
          Manage your account profile and browser storage preferences.
        </p>
      </div>

      <div className="rounded-3xl border border-[#262330] bg-[#131118] p-6 space-y-6">
        {/* Profile Details */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#6B6778]">Profile</h2>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7C3AED] text-base font-bold text-white">
              {(user?.email || "C").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                {user?.user_metadata?.full_name || user?.email || "Guest Creator"}
              </p>
              <p className="text-xs text-[#A19EAA]">
                {user?.email || "Signed in locally as guest"}
              </p>
            </div>
          </div>
        </div>

        {/* Local Storage Section */}
        <div className="space-y-3 pt-3 border-t border-[#262330]">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#6B6778]">Local Media Storage</h2>
          <div className="flex items-center justify-between text-xs">
            <div>
              <p className="font-semibold text-white">Cached Media Space</p>
              <p className="text-[#A19EAA] text-[11px]">Currently using ~{storageMb} MB of browser storage.</p>
            </div>
            <button
              type="button"
              onClick={handleClearCache}
              className="rounded-xl border border-red-500/30 bg-red-950/20 px-3.5 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-900/30"
            >
              Clear Cache
            </button>
          </div>
        </div>

        {/* Sign Out */}
        <div className="pt-3 border-t border-[#262330] flex justify-between items-center">
          <span className="text-xs text-[#A19EAA]">Session status</span>
          <button
            type="button"
            onClick={() => void signOut()}
            className="rounded-xl border border-[#262330] bg-[#1A1722] px-4 py-2 text-xs font-semibold text-white hover:bg-[#262330]"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
