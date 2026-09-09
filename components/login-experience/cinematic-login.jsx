"use client";

/* =========================================================================
   The cinematic sign-in experience.

   Renders in place of the plain SignInForm in auth-gate.jsx. Every prop
   here is exactly what SignInForm already held as local state — this
   component owns none of the authentication logic itself, only how it's
   presented, so the actual supabase.auth.signInWithPassword call in
   auth-gate.jsx is untouched.
   ========================================================================= */

import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import {
  BarChart3,
  CalendarClock,
  ClipboardList,
  Eye,
  EyeOff,
  FileText,
  HeartPulse,
  LogIn,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

const HeartScene = dynamic(() => import("./heart-scene"), { ssr: false });

// Positioned to sit in the gap between the headline column / login card and
// the heart itself — that gap is narrow, so these are deliberately close to
// the centre line rather than spread as wide as the reference composition.
const ORBIT_NODES = [
  { key: "hfa", label: "HFA-ICOS Score", Icon: HeartPulse, left: "41%", top: "18%" },
  { key: "esc", label: "ESC Guidelines", Icon: ShieldCheck, left: "40%", top: "68%" },
  { key: "records", label: "Patient Records", Icon: ClipboardList, left: "59%", top: "22%" },
  { key: "followup", label: "Follow-up", Icon: CalendarClock, left: "60%", top: "70%" },
];

const FEATURES = [
  { Icon: BarChart3, label: "Evidence-based risk assessment" },
  { Icon: FileText, label: "Integrated patient records" },
  { Icon: CalendarClock, label: "Long-term follow up" },
  { Icon: ShieldCheck, label: "Better outcomes together" },
];

/** Subscribes to a matchMedia query via useSyncExternalStore, the pattern
 *  React's own docs recommend for exactly this — it synchronizes with the
 *  browser query without ever calling setState from inside an effect body. */
function useMediaQuery(query) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

/** WebGL support never changes mid-session, so this is a one-shot read —
 *  same useSyncExternalStore shape, with a no-op subscribe. */
function useWebglSupport() {
  return useSyncExternalStore(
    () => () => {},
    () => {
      try {
        const canvas = document.createElement("canvas");
        return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
      } catch {
        return false;
      }
    },
    () => true
  );
}

function CorscMark({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
      <path
        d="M11.5 8c-3 0-5.5 2.3-5.5 5.6 0 5 6.6 9.3 9.6 11.7.2.2.6.2.8 0 1.2-.9 3-2.3 4.6-3.9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20.5 6c3 0 5.5 2.5 5.5 5.8 0 3-1.9 5.5-4.2 7.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CinematicLogin({ email, setEmail, password, setPassword, error, isSubmitting, onSubmit }) {
  const navRef = useRef(null);
  const headlineRef = useRef(null);
  const featuresRef = useRef(null);
  const loginCardRef = useRef(null);
  const nodeRefs = useRef([]);
  const heartApiRef = useRef(null);
  const idleState = useRef({ active: false, mouseX: 0, mouseY: 0 });
  const timelineRef = useRef(null);

  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const isMobile = useMediaQuery("(max-width: 767px)");
  const webglOk = useWebglSupport();
  const skipCinematic = reducedMotion || isMobile || !webglOk;

  const [cinematicDone, setCinematicDone] = useState(false);
  const introDone = skipCinematic || cinematicDone;
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [resetState, setResetState] = useState({ status: "idle", message: "" });

  const handleHeartReady = useCallback(
    (api) => {
      heartApiRef.current = api;
      if (skipCinematic) {
        // No animated dolly, but still land on the same final framing the
        // full timeline would have reached, not stay parked at the close-up
        // starting position.
        const { camera, framing } = api;
        camera.position.set(0, framing.endDistance * 0.035, framing.endDistance);
        camera.fov = framing.endFov;
        camera.updateProjectionMatrix();
        idleState.current.active = webglOk;
      }
    },
    [skipCinematic, webglOk]
  );

  // The one master timeline. Every layer — camera, heart rotation, nav,
  // headline, orbital nodes, login card — is a child tween of this same
  // `tl` at explicit offsets, never an independent animation of its own.
  useLayoutEffect(() => {
    const revealTargets = [navRef.current, headlineRef.current, featuresRef.current, loginCardRef.current];

    if (skipCinematic) {
      gsap.set(revealTargets, { opacity: 1, y: 0, x: 0 });
      gsap.set(nodeRefs.current.filter(Boolean), { opacity: isMobile ? 0 : 1, scale: 1 });
      return undefined;
    }

    let cancelled = false;
    let raf;

    const waitForHeart = () => {
      if (cancelled) return;
      if (!heartApiRef.current) {
        raf = requestAnimationFrame(waitForHeart);
        return;
      }
      const { camera, heartGroup, framing } = heartApiRef.current;
      const nodes = nodeRefs.current.filter(Boolean);

      gsap.set(revealTargets, { opacity: 0 });
      gsap.set(headlineRef.current, { y: 20 });
      gsap.set(loginCardRef.current, { x: 26, y: 0 });
      gsap.set(nodes, { opacity: 0, scale: 0.86 });

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        onComplete: () => {
          idleState.current.active = true;
          setCinematicDone(true);
        },
      });
      timelineRef.current = tl;

      tl.to(heartGroup.position, { y: -0.02, duration: 0.7, ease: "sine.inOut" }, 0)
        .to(heartGroup.rotation, { y: 0.34, duration: 3.6, ease: "power1.inOut" }, 0.5)
        .to(camera.position, { z: framing.endDistance, y: framing.endDistance * 0.035, duration: 4.2, ease: "power2.inOut" }, 0.5)
        .to(
          camera,
          {
            fov: framing.endFov,
            duration: 4.2,
            ease: "power2.inOut",
            onUpdate: () => camera.updateProjectionMatrix(),
          },
          0.5
        )
        .to(navRef.current, { opacity: 1, duration: 0.8 }, 2.6)
        .to(headlineRef.current, { opacity: 1, y: 0, duration: 0.9 }, 3.0)
        .to(featuresRef.current, { opacity: 1, duration: 0.8 }, 3.35)
        .to(nodes, { opacity: 1, scale: 1, duration: 0.6, stagger: 0.15 }, 3.5)
        .to(loginCardRef.current, { opacity: 1, x: 0, duration: 0.9 }, 4.0);
    };

    waitForHeart();
    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      timelineRef.current?.kill();
    };
  }, [skipCinematic, isMobile, webglOk]);

  // Post-intro: the orbital nodes drift on their own extremely slow,
  // independently-phased float, and pointer position feeds the heart's
  // parallax (read inside heart-scene's own useFrame, not driven from here).
  useEffect(() => {
    if (!introDone || reducedMotion || isMobile) return undefined;
    const nodes = nodeRefs.current.filter(Boolean);
    const floats = nodes.map((el, i) =>
      gsap.to(el, { y: "+=7", duration: 5.5 + i * 0.7, ease: "sine.inOut", yoyo: true, repeat: -1 })
    );

    function onPointerMove(e) {
      idleState.current.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      idleState.current.mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    }
    window.addEventListener("pointermove", onPointerMove);

    return () => {
      floats.forEach((t) => t.kill());
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [introDone, reducedMotion, isMobile]);

  async function handleForgotPassword() {
    if (!supabase || !email.trim()) {
      setResetState({ status: "error", message: "Enter your email address first." });
      return;
    }
    setResetState({ status: "sending", message: "" });
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim());
    setResetState(
      resetError
        ? { status: "error", message: resetError.message }
        : { status: "sent", message: "Check your inbox for a reset link." }
    );
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#EEF2F4]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(120% 90% at 50% 38%, #F7F9FA 0%, #E7ECEF 62%, #DCE3E7 100%)" }}
      />

      {/* Fixed, not absolute: the content column below can be taller than
          one viewport (mobile especially), and an absolutely-positioned
          canvas would stretch to that full scroll height, centering the
          heart far down the page instead of in the visible frame. */}
      {webglOk && (
        <div className="fixed inset-0 z-10">
          <HeartScene onReady={handleHeartReady} idle={idleState} reducedMotion={reducedMotion || isMobile} />
        </div>
      )}
      {!webglOk && (
        <div className="fixed inset-0 z-10 flex items-center justify-center" aria-hidden="true">
          <HeartPulse className="size-28 text-[#0B1F3A]/25" strokeWidth={1} />
        </div>
      )}

      {!isMobile && (
        <svg className="pointer-events-none fixed inset-0 z-20 h-full w-full" viewBox="0 0 1000 1000" preserveAspectRatio="none">
          {ORBIT_NODES.map((node, i) => {
            const x = parseFloat(node.left) * 10;
            const y = parseFloat(node.top) * 10;
            const midY = (y + 500) / 2;
            return (
              <path
                key={node.key}
                d={`M ${x} ${y} Q ${(x + 500) / 2} ${midY} 500 500`}
                fill="none"
                stroke="#0B1F3A"
                strokeOpacity="0.16"
                strokeWidth="1.5"
                ref={(el) => {
                  if (el) nodeRefs.current[i + 100] = el;
                }}
              />
            );
          })}
        </svg>
      )}

      <nav
        ref={navRef}
        className="relative z-30 flex items-center justify-between px-6 py-6 md:px-14 md:py-8"
        style={{ opacity: isMobile ? 1 : 0 }}
      >
        <div className="flex items-center gap-2.5 text-[#0B1F3A]">
          <CorscMark className="size-7" />
          <div className="leading-tight">
            <p className="text-[15px] font-bold tracking-[0.14em]">CORSC</p>
            <p className="hidden text-[11px] text-[#5B6472] sm:block">Cardio-Oncology Risk &amp; Surveillance Console</p>
          </div>
        </div>
        <div className="hidden items-center gap-6 text-[13px] font-medium text-[#3B4656] sm:flex">
          <a href="#evidence" className="transition hover:text-[#0B1F3A]">
            Evidence
          </a>
          <a href="#guidelines" className="transition hover:text-[#0B1F3A]">
            Guidelines
          </a>
          <a href="#support" className="transition hover:text-[#0B1F3A]">
            Support
          </a>
        </div>
      </nav>

      {!isMobile &&
        ORBIT_NODES.map((node, i) => (
          <div
            key={node.key}
            ref={(el) => {
              nodeRefs.current[i] = el;
            }}
            className="fixed z-40 flex w-[108px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 rounded-2xl border border-white/60 bg-white/65 px-2.5 py-2.5 text-center shadow-[0_8px_30px_-12px_rgba(11,31,58,0.25)] backdrop-blur-md"
            style={{ left: node.left, top: node.top }}
          >
            <node.Icon className="size-3.5 text-[#0F6E6E]" strokeWidth={1.75} aria-hidden="true" />
            <span className="text-[10.5px] font-medium leading-tight text-[#0B1F3A]">{node.label}</span>
          </div>
        ))}

      <div className="relative z-30 mx-auto flex min-h-[calc(100vh-96px)] max-w-[1400px] flex-col items-center justify-center gap-10 px-6 pb-16 md:flex-row md:items-center md:justify-between md:px-14 lg:px-20">
        <div
          ref={headlineRef}
          className="order-2 max-w-md text-center md:order-1 md:text-left"
          style={{ opacity: isMobile ? 1 : 0 }}
        >
          <h1 className="text-[38px] font-semibold tracking-tight leading-[1.08] text-[#0B1F3A] sm:text-[46px]" style={{ textWrap: "balance" }}>
            Safer Cancer Care
            <br />
            <span className="text-[#5B7A94]">Starts Here</span>
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-[#4B5563]">
            Cardiovascular risk stratification for chemotherapy patients using HFA-ICOS scores and ESC guidelines.
          </p>

          <div ref={featuresRef} className="mt-8 grid grid-cols-1 gap-3.5 sm:grid-cols-2" style={{ opacity: isMobile ? 1 : 0 }}>
            {FEATURES.map(({ Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5 text-left">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/70 text-[#0F6E6E] shadow-sm">
                  <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span className="text-[13px] font-medium text-[#3B4656]">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div ref={loginCardRef} className="order-1 w-full max-w-[400px] md:order-2" style={{ opacity: isMobile ? 1 : 0 }}>
          <section className="rounded-[22px] border border-white/70 bg-white/70 p-7 shadow-[0_30px_60px_-20px_rgba(11,31,58,0.28)] backdrop-blur-xl sm:p-8">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-2xl bg-[#0B1F3A] text-white">
                <CorscMark className="size-5" />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0F6E6E]">CORSC</p>
              <p className="mt-0.5 text-[11px] text-[#6B7280]">Cardio-Oncology Risk &amp; Surveillance Console</p>
              <h2 className="mt-3 text-[22px] font-bold text-[#0B1F3A]">Sign in to continue</h2>
              <p className="mt-1.5 text-[13px] text-[#6B7280]">
                Access your account to manage patients, assess risk and follow up with confidence.
              </p>
            </div>

            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-[#374151]" htmlFor="email">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" aria-hidden="true" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-[#374151]" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    className="pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] transition hover:text-[#4B5563]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[13px]">
                <label className="flex items-center gap-2 text-[#4B5563]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="size-3.5 rounded border-[#D1D5DB] accent-[#0B1F3A]"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="font-medium text-[#0F6E6E] transition hover:text-[#0B1F3A]"
                >
                  Forgot password?
                </button>
              </div>

              {resetState.status !== "idle" && resetState.message && (
                <p className={`text-[12.5px] ${resetState.status === "error" ? "text-red-600" : "text-[#0F6E6E]"}`}>
                  {resetState.status === "sending" ? "Sending reset link…" : resetState.message}
                </p>
              )}

              {error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-[13px] text-red-700">{error}</p>}

              <Button className="h-11 w-full bg-[#0B1F3A] text-white hover:bg-[#123055]" disabled={isSubmitting} type="submit">
                <LogIn className="size-4" aria-hidden="true" />
                {isSubmitting ? "Signing in…" : "Sign in"}
              </Button>

              <p className="text-center text-[12.5px] text-[#6B7280]">
                New to CORSC? <span className="text-[#374151]">Contact your administrator</span>
              </p>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
