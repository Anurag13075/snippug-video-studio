import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { openPolarCheckout } from "@/lib/polar";
import { PLAN_LIMITS } from "@/lib/plans";

export const Route = createFileRoute("/app/billing")({
  component: BillingPage,
});

function BillingPage() {
  const { user, isPro } = useAuth();
  const currentPlan = isPro ? PLAN_LIMITS.pro : PLAN_LIMITS.free;

  return (
    <div className="space-y-6 pb-12 max-w-2xl">
      <div className="border-b border-[#262330] pb-5">
        <h1 className="text-xl font-bold text-white">Billing & Plan</h1>
        <p className="text-xs text-[#A19EAA] mt-1">
          Manage your subscription, view monthly transcription usage, and billing history.
        </p>
      </div>

      {/* Plan Card */}
      <div className="rounded-3xl border border-[#262330] bg-[#131118] p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-lg">👑</span>
              <h2 className="text-base font-bold text-white">
                {isPro ? "SnipPug Pro" : "Free Creator Plan"}
              </h2>
              <span className="rounded-full bg-[#7C3AED]/20 px-2 py-0.5 text-[10px] font-semibold text-[#8B5CF6]">
                {isPro ? "Active" : "Current"}
              </span>
            </div>
            <p className="text-xs text-[#A19EAA]">
              {isPro
                ? "Lifetime access to 4K exports, no watermark, and all AI clipping tools."
                : "Basic features with watermark and up to 1080p exports."}
            </p>
          </div>

          {!isPro && (
            <button
              type="button"
              onClick={() => openPolarCheckout(user?.email)}
              className="rounded-xl bg-[#7C3AED] px-4 py-2 text-xs font-bold text-white shadow-lg hover:bg-[#8B5CF6]"
            >
              Upgrade ($4)
            </button>
          )}
        </div>

        {/* Usage Meters */}
        <div className="space-y-3 pt-3 border-t border-[#262330]">
          <h3 className="text-xs font-bold text-white">Monthly Transcription Usage</h3>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-[#A19EAA]">0 min used</span>
              <span className="text-[#A19EAA]">{currentPlan.monthlyTranscriptionMinutes} min limit</span>
            </div>
            <div className="h-2 w-full rounded-full bg-[#262330] overflow-hidden">
              <div className="h-full rounded-full bg-[#4ADE80]" style={{ width: "0%" }} />
            </div>
          </div>
        </div>

        {/* Plan Feature Checklist */}
        <div className="pt-2 text-xs space-y-2 text-[#A19EAA]">
          <div className="flex items-center gap-2">
            <span className="text-[#4ADE80]">✓</span>
            <span>Max video length: {Math.round(currentPlan.maxVideoDurationSec / 60)} minutes</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#4ADE80]">✓</span>
            <span>Export resolution: {currentPlan.maxExportResolution}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#4ADE80]">✓</span>
            <span>Watermark: {currentPlan.watermark ? "Included" : "None"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
