"use client";

/* =========================================================================
   The cinematic sign-in experience.

   Renders in place of the plain SignInForm in auth-gate.jsx. Every prop
   here is exactly what SignInForm already held as local state — this
   component owns none of the authentication logic itself, only how it's
   presented, so the actual supabase.auth.signInWithPassword call in
   auth-gate.jsx is untouched.

   The heart-opens-then-camera-pulls-back illusion is pure CSS transform
   animation on the real corsc-heart.png / corsc-background.png assets
   (see cinematic-login.module.css) rather than a 3D engine — a flat
   raster image gains nothing from being pushed through a 3D camera, and
   CLAUDE_HANDOFF.md is explicit that a true 3D pass is a separate future
   step (swap the PNG for a GLB, keep this same choreography).
   ========================================================================= */

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { BarChart3, CalendarClock, Eye, EyeOff, FileText, LogIn, Mail, ShieldCheck } from "lucide-react";

import styles from "./cinematic-login.module.css";
import { supabase } from "@/lib/supabase";

const ORBIT_NODES = [
  { key: "hfa", label: "HFA-ICOS Score", Icon: BarChart3, corner: styles.orbitA },
  { key: "records", label: "Patient Records", Icon: FileText, corner: styles.orbitB },
  { key: "esc", label: "ESC Guidelines", Icon: ShieldCheck, corner: styles.orbitC },
  { key: "followup", label: "Follow-up", Icon: CalendarClock, corner: styles.orbitD },
];

const FEATURES = [
  { Icon: BarChart3, label: "Evidence-based risk assessment" },
  { Icon: FileText, label: "Integrated patient records" },
  { Icon: CalendarClock, label: "Long-term follow up" },
  { Icon: ShieldCheck, label: "Better outcomes together" },
];

function HeartMark({ className }) {
  return (
    <svg viewBox="0 0 62 62" className={className} fill="none" aria-hidden="true">
      <path
        d="M19.5 23.2c0-6 8.9-8.5 12.5-2.4 3.6-6.1 12.5-3.6 12.5 2.4 0 7.3-12.5 14-12.5 14s-12.5-6.7-12.5-14Z"
        stroke="currentColor"
        strokeWidth="2.2"
      />
    </svg>
  );
}

/** Same useSyncExternalStore pattern used elsewhere in this app for
 *  matchMedia — synchronizes with the browser query without ever calling
 *  setState from inside an effect body. */
function useReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  );
}

export function CinematicLogin({ email, setEmail, password, setPassword, error, isSubmitting, onSubmit }) {
  const reducedMotion = useReducedMotion();
  const [timerDone, setTimerDone] = useState(false);
  const introDone = reducedMotion || timerDone;
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [resetState, setResetState] = useState({ status: "idle", message: "" });

  useEffect(() => {
    if (reducedMotion) return undefined;
    const timer = setTimeout(() => setTimerDone(true), 5900);
    return () => clearTimeout(timer);
  }, [reducedMotion]);

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
        : { status: "ok", message: "Check your inbox for a reset link." }
    );
  }

  return (
    <main className={`${styles.scene} ${introDone ? styles.sceneRevealed : styles.sceneIntro}`}>
      <Image
        src="/assets/corsc-background.png"
        alt=""
        aria-hidden="true"
        fill
        priority
        sizes="100vw"
        className={styles.sceneBackground}
      />
      <div className={styles.atmosphere} aria-hidden="true" />

      <div className={styles.world}>
        <div className={styles.heartStage}>
          <div className={styles.heartHalo} aria-hidden="true" />
          <Image
            src="/assets/corsc-heart.png"
            alt="Anatomical heart visualization"
            width={1278}
            height={1230}
            priority
            className={styles.heroHeart}
          />
        </div>

        <header className={styles.topbar}>
          <div className={styles.brand}>
            <div className={styles.brandMark}>
              <HeartMark className="size-6" />
            </div>
            <div>
              <div className={styles.brandName}>CORSC</div>
              <div className={styles.brandSubtitle}>Cardio-Oncology Risk &amp; Surveillance Console</div>
            </div>
          </div>
          <nav>
            <a href="#evidence">Evidence</a>
            <span className={styles.navDivider} />
            <a href="#guidelines">Guidelines</a>
            <span className={styles.navDivider} />
            <a href="#support">Support</a>
          </nav>
        </header>

        <section className={styles.heroCopy}>
          <p className={styles.eyebrow}>Cardio-Oncology Risk &amp; Surveillance</p>
          <h1>
            Safer Cancer Care
            <br />
            <span>Starts Here</span>
          </h1>
          <p className={styles.lead}>
            Cardiovascular risk stratification for chemotherapy patients using HFA-ICOS scores and ESC guidelines.
          </p>
          <div className={styles.features}>
            {FEATURES.map(({ Icon, label }) => (
              <div key={label} className={styles.featurePill}>
                <span className={styles.featureIcon}>
                  <Icon size={17} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.orbitSystem} aria-label="CORSC capabilities">
          <div className={styles.orbitRing} aria-hidden="true" />
          <div className={`${styles.orbitRing} ${styles.orbitRingB}`} aria-hidden="true" />
          {ORBIT_NODES.map(({ key, label, Icon, corner }) => (
            <div key={key} className={`${styles.orbitNode} ${corner}`} tabIndex={0}>
              <span className={styles.orbitNodeIcon}>
                <Icon size={17} strokeWidth={1.75} aria-hidden="true" />
              </span>
              <span>{label}</span>
            </div>
          ))}
        </section>

        <div className={styles.loginShell}>
          <section className={styles.loginCard} aria-label="Sign in">
            <div className={styles.loginEmblem}>
              <HeartMark className="size-5" />
            </div>
            <div className={styles.loginBrand}>CORSC</div>
            <div className={styles.loginCaption}>Cardio-Oncology Risk &amp; Surveillance Console</div>
            <h2>Sign in to continue</h2>
            <p className={styles.loginDescription}>
              Access your account to manage patients,
              <br />
              assess risk and follow up with confidence.
            </p>

            <form onSubmit={onSubmit}>
              <label className={styles.fieldLabel} htmlFor="email">
                Email address
              </label>
              <div className={styles.fieldWrap}>
                <span className={styles.fieldIcon}>
                  <Mail size={17} aria-hidden="true" />
                </span>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="clinician@example.com"
                  required
                />
              </div>

              <label className={styles.fieldLabel} htmlFor="password">
                Password
              </label>
              <div className={styles.fieldWrap}>
                <span className={styles.fieldIcon}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                    <rect x="5" y="10" width="14" height="10" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className={styles.fieldAction}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              <div className={styles.formRow}>
                <label className={styles.remember}>
                  <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />
                  <span className={styles.fakeCheck} />
                  Remember me
                </label>
                <button type="button" className={styles.textLink} onClick={handleForgotPassword}>
                  Forgot password?
                </button>
              </div>

              {resetState.status !== "idle" && resetState.message && (
                <p className={styles.resetNotice} data-tone={resetState.status === "error" ? "error" : "ok"}>
                  {resetState.status === "sending" ? "Sending reset link…" : resetState.message}
                </p>
              )}

              {error && <p className={styles.formError}>{error}</p>}

              <button className={styles.signinButton} type="submit" disabled={isSubmitting}>
                <span>{isSubmitting ? "Signing in…" : "Sign in"}</span>
                <LogIn size={17} aria-hidden="true" />
              </button>
            </form>

            <div className={styles.loginFooter}>
              New to CORSC? <span>Contact your administrator</span>
            </div>
          </section>
        </div>

        <div className={styles.microFooter}>ONCOLOGY &nbsp;•&nbsp; CARDIOLOGY &nbsp;•&nbsp; SURVEILLANCE</div>
      </div>
    </main>
  );
}
