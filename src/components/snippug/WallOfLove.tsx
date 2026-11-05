import heroHills from "@/assets/hero-hills.jpg";

const QUOTES = [
  {
    name: "Rhea",
    handle: "@reelsbyrhea",
    date: "Oct 12, 2026",
    color: "#e0b088",
    text: "cut a 40-min podcast into 6 clips before my chai went cold. the I/O keys are stupidly fast",
  },
  {
    name: "Dev",
    handle: "@devmakesvids",
    date: "Oct 14, 2026",
    color: "#9fc3a8",
    text: "no upload. no queue. no \"AI is thinking\" spinner. i press export and the file is just... there. wild concept",
  },
  {
    name: "Meera",
    handle: "@meeramakes",
    date: "Oct 18, 2026",
    color: "#c3a3d6",
    text: "the captions feature is the killer. typed my hooks once, every export came out ready to post. didn't touch capcut",
  },
  {
    name: "Arjun",
    handle: "@arjunclips",
    date: "Oct 21, 2026",
    color: "#e8a5a0",
    text: "snipped 9 moments from one stream and hit export all. nine reels before lunch. puggy celebrated each one",
  },
  {
    name: "Tania",
    handle: "@taniashoots",
    date: "Oct 25, 2026",
    color: "#a8c6e0",
    text: "used it on a flight with zero wifi. worked the entire way. my editor friends didn't believe me",
  },
  {
    name: "Kabir",
    handle: "@kabirframes",
    date: "Nov 1, 2026",
    color: "#d6c98f",
    text: "the waveform on the timeline means i cut exactly on the beat. it's the small things",
  },
];

function Tweet({ q, i }: { q: (typeof QUOTES)[number]; i: number }) {
  return (
    <figure
      className="tactile break-inside-avoid rounded-2xl p-5"
      style={{ marginTop: i % 2 === 1 ? "0.75rem" : undefined }}
    >
      <figcaption className="flex items-center gap-3">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-full border-[1.5px] border-border text-sm font-bold text-cocoa"
          style={{ backgroundColor: q.color }}
        >
          {q.name[0]}
        </span>
        <div className="leading-tight">
          <div className="text-sm font-bold">{q.name}</div>
          <div className="text-xs text-muted-foreground">{q.handle}</div>
        </div>
        <span className="ml-auto text-[11px] text-muted-foreground">{q.date}</span>
      </figcaption>
      <blockquote className="mt-3 text-sm leading-relaxed">{q.text}</blockquote>
    </figure>
  );
}

export function WallOfLove() {
  return (
    <section id="love" className="scroll-mt-24 px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Wall of love
        </p>
        <h2 className="mt-2 text-center text-4xl font-bold tracking-tight sm:text-5xl">
          Loved by <span className="serif-accent text-cocoa">creators.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-center text-sm text-muted-foreground">
          Sample words from the kind of creators SnipPug is built for — swap in real posts as they
          roll in.
        </p>

        <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
          {QUOTES.map((q, i) => (
            <Tweet key={q.handle} q={q} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="px-4 pb-24 pt-8">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] px-4 py-20 text-center sm:py-28">
        <img
          src={heroHills}
          alt=""
          loading="lazy"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-black/35" />
        <div className="relative">
          <h2 className="text-4xl font-bold tracking-tight text-white [text-shadow:0_3px_24px_rgba(10,25,10,0.5)] sm:text-6xl">
            Teach your timeline{" "}
            <span className="serif-accent">a new trick.</span>
          </h2>
          <p className="mt-4 text-lg text-white/95 [text-shadow:0_1px_12px_rgba(10,25,10,0.5)]">
            Mark it, snip it, ship it.
          </p>
          <a
            href="#studio"
            className="mt-9 inline-flex h-13 items-center gap-2 rounded-full bg-white px-8 text-base font-semibold text-cocoa shadow-[0_10px_30px_-8px_rgba(15,30,15,0.5)] transition-all hover:-translate-y-0.5"
          >
            Open the Studio
          </a>
        </div>
      </div>
    </section>
  );
}
