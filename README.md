# SnipPug Video Studio

Build SnipPug: A cute, non-AI video clipper app and landing page designed with the exact clean, tactile, editorial aesthetic of https://gettapmac.com/

Key requirements:
1. Design & Typography (matching gettapmac.com):
   - Typography: Clean sans-serif paired with elegant Instrument Serif style italic accents (e.g. "Slice long videos. *Export viral clips.*")
   - Tactile Mac aesthetic: Apple-inspired monochrome & warm neutral palette, crisp borders, subtle shadows, keycap badges (`I`, `O`, `Space`, `⌘ + S`), interactive sound toggle with pleasant audio clicks/pops
   - Polished hero section with live stats badge, kicker, and an interactive mascot stage with ground shadow

2. Mascot: "Puggy" (The little video editor pug):
   - A super cute, animated pug mascot (SVG/Canvas) with animated blinking, ear wiggles, and interactive moods
   - Interactive moods soundboard section just like Tappy on gettapmac: "Meet Puggy: He never loses a frame." with mood chips (Snip ✂️, Love ❤️, Listening 🎧, Focus 🎯, Celebrate 🎉, Sleepy 💤, Dizzy 🌀, Oops 🐾) that change his facial expression, animation, and speech bubble
   - Clickable mascot in the hero that reacts when clicked (bounces, wiggles, plays cute sounds)

3. Fully Functional In-Browser Video Clipper (Zero AI, $0 server cost):
   - Works 100% in the user's browser using HTML5 Video + Canvas/MediaRecorder
   - Video upload drag-and-drop or file picker (supports MP4/WebM/MOV)
   - Pre-loaded sample creator clips (e.g., Podcast snippet, Tech review, Gaming moment) so anyone can test it instantly without uploading a file
   - Timeline scrubber with draggable In (Start) and Out (End) trim markers
   - Quick keyboard shortcuts: 'I' for Mark In, 'O' for Mark Out, 'Space' for Play/Pause, 'J/L' for jump backward/forward 1s
   - Aspect ratio presets: 9:16 Vertical Reel/Shorts (with aesthetic blurred video background and phone frame), 1:1 Square, 16:9 Landscape
   - Export clip button that extracts and downloads the clipped segment directly from the browser

4. Landing Page Sections (following gettapmac.com flow):
   - Sticky header with Puggy brand icon, nav links (How it works, Puggy, Studio, Pricing, FAQ), sound effect toggle, and CTA button
   - Hero with interactive Puggy, tagline, and instant launch button
   - "How it works" interactive 3-step timeline (1. Drop video, 2. Tap I & O to mark clip, 3. Export 9:16 Reel)
   - "Meet Puggy" interactive mood stage with mood selector buttons
   - Live Clipper Studio embedded directly on the page or as a full-screen studio modal
   - Feature Bento Grid with tactile keycaps, privacy badges ("100% On-Device, zero video uploads"), and creator presets
   - Pricing section with Free vs Pro creator license / subscription ($5/mo or $29 lifetime) with feature breakdown
   - FAQ section answering common creator questions (watermark, speed, privacy, formats)
   - Wall of love / creator reviews grid with tweet-style cards

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/54fa7a2b-fac9-49aa-bc42-680e2c8cbeca).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
