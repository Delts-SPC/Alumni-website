import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Briefcase, Compass, Heart, Rocket, ShieldCheck } from "lucide-react";
import EmailCaptureDialog from "@/components/dialogs/EmailCaptureDialog";
import SpecificChallengeDialog from "@/components/dialogs/SpecificChallengeDialog";
import ShareExpertiseDialog from "@/components/dialogs/ShareExpertiseDialog";
import Footer from "@/components/landing/Footer";

const HERO_IMG =
  "https://images.unsplash.com/photo-1755474897404-006834b70103?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDR8MHwxfHNlYXJjaHwyfHxnbGFzcyUyMG9mZmljZSUyMGJ1aWxkaW5nJTIwaW50ZXJpb3J8ZW58MHx8fHwxNzc3ODYwNjQ2fDA&ixlib=rb-4.1.0&q=85";
const VOICE_IMG =
  "https://images.unsplash.com/photo-1758691736975-9f7f643d178e?fm=jpg&q=85&w=1200&fit=crop";
const CHALLENGE_IMG =
  "https://images.unsplash.com/photo-1677594332964-b1199e6e7928?fm=jpg&q=85&w=1200&fit=crop";
const EXPERTISE_IMG =
  "https://images.unsplash.com/photo-1754531976828-69e42ce4e0d9?fm=jpg&q=85&w=1200&fit=crop";

const PILLARS = [
  {
    icon: Briefcase,
    title: "Work + Career",
    headline: "You've built a career. Now build it with intention.",
    body:
      "Clarify your next move, strengthen how you present your own brand and value, and build a career path that reflects who you are now — and who you are becoming.",
  },
  {
    icon: Compass,
    title: "Management + Leadership",
    headline: "Promotions are based on what you could do. Leadership asks how you help others become.",
    body:
      "Build the clarity, confidence, and human leadership practices that help people perform, grow, and trust your leadership — and create your own opportunities.",
  },
  {
    icon: Heart,
    title: "Life + Personal",
    headline: "Brotherhood wasn't meant to stop at graduation. Neither was your growth.",
    body:
      "Navigate relationships, fatherhood, purpose, identity, and personal transitions with structure, reflection, and trusted Brothers walking a similar road.",
  },
  {
    icon: Rocket,
    title: "Self-employment",
    headline: "The boldest move you'll make shouldn't be the loneliest one.",
    body:
      "Explore consulting, entrepreneurship, fractional work, or independent practice with clearer positioning, practical tools, and a circle of Delts who understand what it takes to build something that lasts.",
  },
];

export default function Landing() {
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [challengeOpen, setChallengeOpen] = useState(false);
  const [expertiseOpen, setExpertiseOpen] = useState(false);

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="min-h-screen bg-white text-slate-900" data-testid="landing-page">
      {/* NAV */}
      <header className="absolute top-0 left-0 right-0 z-30">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-[#6B2C91] flex items-center justify-center text-white font-serif text-lg">
              Δ
            </div>
            <span className="text-xs tracking-[0.25em] uppercase font-semibold text-slate-700">
              Delt Alumni Excellence Center
            </span>
          </div>
          <button
            onClick={() => scrollTo("pillars")}
            className="hidden md:inline-flex text-sm text-slate-600 hover:text-[#6B2C91] transition-colors"
            data-testid="nav-pillars"
          >
            The Four Pillars
          </button>
        </div>
      </header>

      {/* HERO */}
      <section
        id="hero"
        className="relative min-h-[100vh] flex items-center pt-32 pb-20"
        data-testid="hero-section"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMG})` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-white/90" aria-hidden="true" />
        <div className="absolute inset-y-0 right-0 w-1 bg-[#6B2C91]/30" aria-hidden="true" />

        <div className="relative max-w-7xl mx-auto px-6 md:px-12 lg:px-24 grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-9 lg:col-span-8">
            <p className="text-xs tracking-[0.25em] uppercase text-[#6B2C91] font-semibold mb-6">
              An independent, alumnus-led initiative
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.05] text-slate-900 mb-8">
              The Brotherhood shaped part of who you became.
              <span className="block text-[#6B2C91] mt-2">
                Now it's here for who you're becoming next.
              </span>
            </h1>
            <p className="text-base md:text-lg text-slate-600 leading-relaxed max-w-2xl mb-10">
              Many Delts carry the Brotherhood with them well after graduation and apply the
              skills they learned as they enter their preferred industries. But career moves,
              leadership pressure, family life, personal growth, and self-employment are often
              navigated alone. The Delt Alumni Excellence Center exists to change that — offering
              support and guidance.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => scrollTo("pillars")}
                className="bg-[#6B2C91] hover:bg-[#562374] text-white px-8 py-6 rounded-sm text-base"
                data-testid="hero-find-path"
              >
                Find your path <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                onClick={() => setVoiceOpen(true)}
                variant="outline"
                className="border-slate-300 hover:border-[#6B2C91] hover:text-[#6B2C91] px-8 py-6 rounded-sm text-base"
                data-testid="hero-voice"
              >
                Make my voice matter
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* INFO GATHERING */}
      <section
        id="voice"
        className="bg-slate-50 border-y border-slate-200 py-24 md:py-32"
        data-testid="voice-section"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-5">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#6B2C91]" aria-hidden="true" />
              <img
                src={VOICE_IMG}
                alt="A diverse group of professional men in conversation"
                className="relative w-full h-[460px] object-cover"
              />
            </div>
          </div>
          <div className="md:col-span-7 md:pl-8 lg:pl-12">
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl tracking-tight text-slate-900 leading-tight mb-6">
              We want to hear from you - help shape our programs
            </h2>
            <p className="text-base md:text-lg text-slate-700 leading-relaxed mb-3">
              Most of us are navigating something. And most of the time, we're figuring it out alone.
            </p>
            <ul className="text-base md:text-lg text-slate-700 leading-relaxed mb-6 space-y-0.5">
              <li>No structure.</li>
              <li>No real support.</li>
              <li>No place to talk about it with people who actually understand.</li>
            </ul>

            <h3 className="font-serif text-xl md:text-2xl text-slate-900 leading-tight mt-8 mb-3">
              What if that changed?
            </h3>
            <p className="text-base md:text-lg text-slate-700 leading-relaxed mb-2">
              We're building something new.
            </p>
            <ul className="text-base md:text-lg text-slate-700 leading-relaxed mb-3 space-y-0.5">
              <li>Not events.</li>
              <li>Not networking.</li>
              <li>Not another ask.</li>
            </ul>
            <p className="text-base md:text-lg text-slate-700 leading-relaxed mb-2">
              Something designed to help you move forward in what actually matters right now.
            </p>
            <p className="text-base md:text-lg text-slate-700 leading-relaxed mb-8">
              But before we build anything, we need to understand where you are.
            </p>

            <h3 className="font-serif text-xl md:text-2xl text-slate-900 leading-tight mb-2">
              Take 2 minutes. Tell us what you're navigating.
            </h3>
            <p className="text-base md:text-lg text-slate-700 leading-relaxed mb-8">
              Your input will directly shape what gets built.
            </p>

            <Button
              onClick={() => setVoiceOpen(true)}
              className="bg-[#6B2C91] hover:bg-[#562374] text-white px-8 py-6 rounded-sm text-base"
              data-testid="voice-cta"
            >
              Start here <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* SPECIFIC CHALLENGE */}
      <section className="py-24 md:py-32" data-testid="challenge-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-5 order-2 md:order-1">
            <div className="relative">
              <img
                src={CHALLENGE_IMG}
                alt="Two professionals connecting"
                className="w-full h-[420px] object-cover grayscale-[30%]"
              />
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#6B2C91]" aria-hidden="true" />
            </div>
          </div>
          <div className="md:col-span-7 order-1 md:order-2 md:pl-12 lg:pl-20">
            <p className="text-xs tracking-[0.25em] uppercase text-[#6B2C91] font-semibold mb-6">
              Right now
            </p>
            <h2 className="font-serif text-3xl md:text-5xl tracking-tight text-slate-900 leading-tight mb-6">
              Is there something you're trying to resolve right now?
            </h2>
            <p className="text-base md:text-lg text-slate-600 leading-relaxed mb-8">
              A decision, a transition, a situation that matters — personally or professionally.
              The kind of thing that's easier to carry when someone else has carried it too.
            </p>
            <Button
              onClick={() => setChallengeOpen(true)}
              className="bg-[#6B2C91] hover:bg-[#562374] text-white px-8 py-6 rounded-sm text-base"
              data-testid="challenge-cta"
            >
              Share your situation <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* AFFIRMATION + EMAIL CAPTURE */}
      <section className="bg-slate-950 text-slate-100 py-24 md:py-32 relative" data-testid="affirmation-section">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-[#6B2C91]/40" aria-hidden="true" />
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
          <p className="text-xs tracking-[0.25em] uppercase text-[#C8A6E0] font-semibold mb-6">
            What this is
          </p>
          <h2 className="font-serif text-3xl md:text-5xl tracking-tight text-white leading-tight mb-6">
            Brotherhood for the life you're building now.
          </h2>
          <p className="text-base md:text-lg text-slate-300 leading-relaxed mb-10">
            The Delt Alumni Excellence Center is a Delt alumni-led, independently operated
            initiative designed to help Brothers keep advancing through work, leadership, life,
            and self-employment — with practical support, trusted circles, and no strings
            attached.
          </p>
          <Button
            onClick={() => setEmailOpen(true)}
            className="bg-white text-slate-900 hover:bg-[#6B2C91] hover:text-white px-8 py-6 rounded-sm text-base transition-colors"
            data-testid="email-cta"
          >
            Be one of the first to know <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* EXPERTISE TO SHARE */}
      <section className="py-24 md:py-32 bg-slate-50" data-testid="expertise-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7 md:pr-12 lg:pr-20">
            <p className="text-xs tracking-[0.25em] uppercase text-[#6B2C91] font-semibold mb-6">
              Brothers helping Brothers
            </p>
            <h2 className="font-serif text-3xl md:text-5xl tracking-tight text-slate-900 leading-tight mb-6">
              Could your experience help another Brother?
            </h2>
            <p className="text-base md:text-lg text-slate-600 leading-relaxed mb-8">
              What you've experienced or learned — through work or through life — might be
              exactly what someone else needs right now. We're building a quiet network of Delts
              willing to share it.
            </p>
            <Button
              onClick={() => setExpertiseOpen(true)}
              className="bg-[#6B2C91] hover:bg-[#562374] text-white px-8 py-6 rounded-sm text-base"
              data-testid="expertise-cta"
            >
              Share your experience <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="md:col-span-5">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#6B2C91]" aria-hidden="true" />
              <img
                src={EXPERTISE_IMG}
                alt="Two professionals collaborating"
                className="relative w-full h-[420px] object-cover grayscale-[30%]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* PILLARS */}
      <section id="pillars" className="py-24 md:py-32 bg-white" data-testid="pillars-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
          <div className="max-w-3xl mb-16">
            <p className="text-xs tracking-[0.25em] uppercase text-[#6B2C91] font-semibold mb-6">
              Four pillars
            </p>
            <h2 className="font-serif text-3xl md:text-5xl tracking-tight text-slate-900 leading-tight">
              Where do you want to grow next?
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-px bg-slate-200 border border-slate-200">
            {PILLARS.map((p, i) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="group bg-white p-8 md:p-10 hover:bg-slate-50 transition-colors"
                  data-testid={`pillar-${i}`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-12 w-12 bg-[#6B2C91]/10 text-[#6B2C91] flex items-center justify-center group-hover:bg-[#6B2C91] group-hover:text-white transition-colors">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-serif text-2xl md:text-3xl text-slate-900 flex-1">
                      {p.title}
                    </h3>
                  </div>
                  <p className="font-serif text-lg text-slate-800 italic mb-4 leading-snug">
                    {p.headline}
                  </p>
                  <p className="text-slate-600 leading-relaxed">{p.body}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-16 text-center">
            <Button
              onClick={() => setVoiceOpen(true)}
              className="bg-[#6B2C91] hover:bg-[#562374] text-white px-10 py-6 rounded-sm text-base"
              data-testid="pillars-choose-path"
            >
              Choose your path <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <Footer />

      <EmailCaptureDialog open={voiceOpen} onOpenChange={setVoiceOpen} source="voice" />
      <EmailCaptureDialog open={emailOpen} onOpenChange={setEmailOpen} source="email" />
      <SpecificChallengeDialog open={challengeOpen} onOpenChange={setChallengeOpen} />
      <ShareExpertiseDialog open={expertiseOpen} onOpenChange={setExpertiseOpen} />
    </div>
  );
}
