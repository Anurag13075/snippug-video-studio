import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    q: "Is there a watermark?",
    a: "Free exports carry a small, tasteful \"SnipPug\" tag in the corner. It's there so people can ask where the clip came from. The Pro plan removes it — or replaces it with your own watermark text.",
  },
  {
    q: "Does it use AI?",
    a: "No — and that's the point. SnipPug doesn't guess which part of your video is \"engaging\". You watch your footage, tap I and O, and export exactly the moment you chose. No AI credits, no servers, no surprises.",
  },
  {
    q: "How fast is an export?",
    a: "Exports render in real time: a 20-second clip takes about 20 seconds, with a live preview while it records. There's no upload or queue because everything happens on your own machine.",
  },
  {
    q: "Is my video uploaded anywhere?",
    a: "Never. The video file is opened locally by your browser and every frame stays on your device. SnipPug has no accounts and no analytics on your footage. You could even use it offline.",
  },
  {
    q: "Which formats work?",
    a: "MP4, WebM and MOV files all open fine (anything your browser can play, really). Exports download as .webm, which plays everywhere a browser plays video — and converts to MP4 with any free converter if a platform asks for one.",
  },
  {
    q: "Why a pug?",
    a: "Because a grey timeline is boring. Puggy sits in the studio, celebrates your exports and never loses a frame. He also doesn't shed on the footage.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="scroll-mt-24 px-4 py-20">
      <div className="mx-auto max-w-3xl">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          FAQ
        </p>
        <h2 className="mt-2 text-center text-4xl font-bold tracking-tight sm:text-5xl">
          Questions, <span className="serif-accent text-cocoa">answered.</span>
        </h2>

        <Accordion type="single" collapsible className="mt-10">
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-border">
              <AccordionTrigger className="text-left text-base font-semibold hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
