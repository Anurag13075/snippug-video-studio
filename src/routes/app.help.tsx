import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/help")({
  component: HelpPage,
});

function HelpPage() {
  const faqs = [
    {
      q: "How does SnipPug turn a long video into clips?",
      a: "SnipPug extracts audio locally in your browser, runs high-speed word transcription via Groq Whisper, and analyzes narrative peaks and hooks using Groq LLM to propose ready-to-post 9:16 vertical clips.",
    },
    {
      q: "Are my original video files uploaded to your servers?",
      a: "No! All heavy video processing and media caching run entirely inside your browser using the Origin Private File System (OPFS). We never store your full video files on cloud servers.",
    },
    {
      q: "What keyboard shortcuts are available in the Studio?",
      a: "Space to play/pause, I to mark In point, O to mark Out point, Left/Right arrows to nudge 1 second, J/K/L for fast reverse/pause/forward scrubbing, and Cmd+Enter / Ctrl+Enter to quick export.",
    },
  ];

  return (
    <div className="space-y-6 pb-12 max-w-2xl">
      <div className="border-b border-[#262330] pb-5">
        <h1 className="text-xl font-bold text-white">Help & Documentation</h1>
        <p className="text-xs text-[#A19EAA] mt-1">
          Everything you need to know about AI clipping, studio editing, and privacy.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="rounded-2xl border border-[#262330] bg-[#131118] p-5 space-y-2">
            <h3 className="text-sm font-bold text-white">{faq.q}</h3>
            <p className="text-xs text-[#A19EAA] leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
