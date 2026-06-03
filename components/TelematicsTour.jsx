"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  TOUR_STEPS,
  TOUR_STORAGE,
  TOUR_TOTAL_STEPS,
} from "@/lib/telematics-tour-steps";

const TelematicsTourContext = createContext(null);

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function waitForElement(selector, maxMs = 4000) {
  return new Promise((resolve) => {
    const found = document.querySelector(selector);
    if (found) {
      resolve(found);
      return;
    }
    const start = Date.now();
    const interval = setInterval(() => {
      const el = document.querySelector(selector);
      if (el) {
        clearInterval(interval);
        resolve(el);
      } else if (Date.now() - start > maxMs) {
        clearInterval(interval);
        resolve(null);
      }
    }, 100);
  });
}

function ProgressDots({ current, total }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-2 w-2 rounded-full transition-all duration-300 ${
            i < current
              ? "bg-white"
              : i === current
                ? "bg-transparent ring-2 ring-white"
                : "bg-zinc-600"
          }`}
        />
      ))}
    </div>
  );
}

function CloseButton({ onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white ${className}`}
      aria-label="Close"
    >
      ×
    </button>
  );
}

function WelcomeModal({ onStartTour, onExplore, onClose }) {
  return (
    <div className="fixed inset-0 z-[10050] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)" }}>
      <div
        className="relative w-full max-w-[480px] rounded-xl border border-zinc-800 bg-[#111111] p-8 shadow-2xl transition-opacity duration-300"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-welcome-title"
      >
        <CloseButton onClick={onClose} className="absolute right-4 top-4" />
        <span className="inline-block rounded bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-300">
          Uber Telematics API — Live Demo
        </span>
        <h2 id="tour-welcome-title" className="mt-4 text-2xl font-bold text-white">
          Welcome to the Telematics API Demo
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          This is a fully functional sandbox built to demonstrate the Uber Driver Telematics API — a
          new API that enables insurance companies to access driving behavior data from Uber drivers.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onStartTour}
            className="flex-1 rounded bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-zinc-200"
          >
            Take the Tour →
          </button>
          <button
            type="button"
            onClick={onExplore}
            className="flex-1 rounded border border-zinc-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-900"
          >
            Explore on my own
          </button>
        </div>
        <p className="mt-6 text-center text-xs text-zinc-500">
          You can restart the tour anytime from the menu
        </p>
      </div>
    </div>
  );
}

function CompletionModal({ onRestart, onDismiss }) {
  return (
    <div className="fixed inset-0 z-[10050] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)" }}>
      <div className="relative w-full max-w-[480px] rounded-xl border border-zinc-800 bg-[#111111] p-8 text-center shadow-2xl">
        <CloseButton onClick={onDismiss} className="absolute right-4 top-4" />
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-2xl text-emerald-400">
          ✓
        </div>
        <h2 className="mt-4 text-2xl font-bold text-white">You&apos;re ready to explore</h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          You&apos;ve seen the full flow — from data generation to insurance pricing. Try generating
          different scenarios in the Sandbox and watch how the Uber Portal alerts respond.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            href="/telematics/sandbox"
            onClick={onDismiss}
            className="rounded bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500"
          >
            Open Sandbox
          </Link>
          <Link
            href="/telematics/uber"
            onClick={onDismiss}
            className="rounded border border-zinc-600 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-900"
          >
            Uber Portal
          </Link>
          <Link
            href="/telematics/insurer"
            onClick={onDismiss}
            className="rounded border border-zinc-600 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-900"
          >
            Insurer Portal
          </Link>
        </div>
        <button
          type="button"
          onClick={onRestart}
          className="mt-6 text-xs text-zinc-500 underline hover:text-white"
        >
          Restart tour
        </button>
      </div>
    </div>
  );
}

function TourSpotlight({ targetRect, stepIndex, onSkip, onBack, onNext, onClose, transitionMsg, isMobile }) {
  const step = TOUR_STEPS[stepIndex];
  const isLast = stepIndex === TOUR_TOTAL_STEPS - 1;

  let tooltipStyle = {};
  if (isMobile || !targetRect) {
    tooltipStyle = { position: "fixed", left: 16, right: 16, bottom: 16 };
  } else if (targetRect) {
    const spaceBelow = window.innerHeight - targetRect.bottom;
    if (spaceBelow > 220) {
      tooltipStyle = {
        position: "fixed",
        top: Math.min(targetRect.bottom + 16, window.innerHeight - 280),
        left: Math.max(16, Math.min(targetRect.left, window.innerWidth - 376)),
      };
    } else {
      tooltipStyle = {
        position: "fixed",
        top: Math.max(80, targetRect.top - 260),
        left: Math.max(16, Math.min(targetRect.left, window.innerWidth - 376)),
      };
    }
  }

  return (
    <>
      {targetRect ? (
        <>
          <div
            className="pointer-events-none fixed z-[9998] rounded-lg transition-all duration-300"
            style={{
              top: targetRect.top - 4,
              left: targetRect.left - 4,
              width: targetRect.width + 8,
              height: targetRect.height + 8,
              boxShadow:
                "0 0 0 4px white, 0 0 0 8px rgba(255,255,255,0.3), 0 0 0 9999px rgba(0,0,0,0.6)",
            }}
          />
          <div
            className="fixed z-[9999] pointer-events-auto"
            style={{
              top: targetRect.top,
              left: targetRect.left,
              width: targetRect.width,
              height: targetRect.height,
            }}
          />
        </>
      ) : (
        <div className="fixed inset-0 z-[9998] bg-black/60" />
      )}

      <div
        className="z-[10000] w-full max-w-[360px] rounded-xl border border-[#333333] bg-[#111111] p-6 shadow-2xl transition-opacity duration-300"
        style={tooltipStyle}
        role="dialog"
        aria-live="polite"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex flex-col gap-2">
            <span className="text-xs text-zinc-500">
              {stepIndex + 1} of {TOUR_TOTAL_STEPS}
            </span>
            {step?.location && !transitionMsg && (
              <span className="inline-flex w-fit rounded bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-300">
                {step.location}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ProgressDots current={stepIndex} total={TOUR_TOTAL_STEPS} />
            <CloseButton onClick={onClose} />
          </div>
        </div>

        {transitionMsg ? (
          <p className="text-sm text-amber-400">{transitionMsg}</p>
        ) : (
          <>
            <h3 className="text-base font-bold text-white">{step?.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{step?.description}</p>
          </>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onSkip}
            className="text-xs text-zinc-500 hover:text-white"
          >
            Skip tour
          </button>
          <span className="text-xs text-zinc-600">
            {stepIndex + 1} of {TOUR_TOTAL_STEPS}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onBack}
              disabled={stepIndex === 0 || !!transitionMsg}
              className="rounded border border-zinc-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-40"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={!!transitionMsg}
              className="rounded bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-zinc-200 disabled:opacity-40"
            >
              {isLast ? "Finish" : "Next →"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export function TelematicsTourProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [showWelcome, setShowWelcome] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const [targetRect, setTargetRect] = useState(null);
  const [transitionMsg, setTransitionMsg] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const persistTour = useCallback((active, step) => {
    if (active) {
      localStorage.setItem(TOUR_STORAGE.active, "true");
      localStorage.setItem(TOUR_STORAGE.step, String(step));
    } else {
      localStorage.removeItem(TOUR_STORAGE.active);
      localStorage.removeItem(TOUR_STORAGE.step);
    }
  }, []);

  const markSeen = useCallback(() => {
    localStorage.setItem(TOUR_STORAGE.seen, "true");
    setShowWelcome(false);
  }, []);

  const stopTour = useCallback(() => {
    setIsActive(false);
    setShowComplete(false);
    setTransitionMsg(null);
    setTargetRect(null);
    persistTour(false, 0);
    document.querySelectorAll("[data-tour-highlight]").forEach((el) => {
      el.classList.remove("relative", "z-[9999]");
      el.removeAttribute("data-tour-highlight");
    });
  }, [persistTour]);

  const dismissComplete = useCallback(() => {
    setShowComplete(false);
  }, []);

  const closeWelcome = useCallback(() => {
    markSeen();
  }, [markSeen]);

  const startTour = useCallback(
    (fromStep = 0) => {
      markSeen();
      setShowComplete(false);
      setCurrentStep(fromStep);
      setIsActive(true);
      persistTour(true, fromStep);
      const step = TOUR_STEPS[fromStep];
      if (step && pathname !== step.path) {
        router.push(step.path);
      }
    },
    [markSeen, pathname, persistTour, router]
  );

  const restartTour = useCallback(() => {
    localStorage.removeItem(TOUR_STORAGE.seen);
    setShowComplete(false);
    setCurrentStep(0);
    setIsActive(true);
    persistTour(true, 0);
    router.push("/telematics");
  }, [persistTour, router]);

  const updateHighlight = useCallback(async (stepIndex) => {
    const step = TOUR_STEPS[stepIndex];
    if (!step) return;
    document.querySelectorAll("[data-tour-highlight]").forEach((el) => {
      el.classList.remove("relative", "z-[9999]");
      el.removeAttribute("data-tour-highlight");
    });
    const el = await waitForElement(step.selector);
    if (el) {
      el.classList.add("relative", "z-[9999]");
      el.setAttribute("data-tour-highlight", "true");
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      const rect = el.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    } else {
      setTargetRect(null);
    }
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (pathname !== "/telematics") return;
    const seen = localStorage.getItem(TOUR_STORAGE.seen);
    const active = localStorage.getItem(TOUR_STORAGE.active);
    if (!seen && active !== "true") {
      setShowWelcome(true);
    }
  }, [pathname]);

  useEffect(() => {
    const active = localStorage.getItem(TOUR_STORAGE.active);
    const step = localStorage.getItem(TOUR_STORAGE.step);
    if (active === "true" && step) {
      setIsActive(true);
      setCurrentStep(Number(step));
    }
  }, []);

  useEffect(() => {
    if (!isActive || showComplete) return;
    const step = TOUR_STEPS[currentStep];
    if (!step) return;
    if (pathname !== step.path) return;
    setTransitionMsg(null);
    const t = setTimeout(() => updateHighlight(currentStep), 350);
    return () => clearTimeout(t);
  }, [isActive, currentStep, pathname, showComplete, updateHighlight]);

  useEffect(() => {
    if (!isActive) return;
    const refresh = () => updateHighlight(currentStep);
    window.addEventListener("scroll", refresh, true);
    window.addEventListener("resize", refresh);
    return () => {
      window.removeEventListener("scroll", refresh, true);
      window.removeEventListener("resize", refresh);
    };
  }, [isActive, currentStep, updateHighlight]);

  const goToStep = useCallback(
    async (nextIndex) => {
      if (nextIndex >= TOUR_TOTAL_STEPS) {
        stopTour();
        setShowComplete(true);
        return;
      }
      const next = TOUR_STEPS[nextIndex];
      if (next.path !== pathname) {
        setTransitionMsg(next.navigateMessage || "Loading...");
        await wait(500);
        next.beforeEnter?.();
        router.push(next.path);
        await wait(600);
        setTransitionMsg(null);
      }
      setCurrentStep(nextIndex);
      persistTour(true, nextIndex);
    },
    [pathname, persistTour, router, stopTour]
  );

  const handleNext = useCallback(() => {
    const step = TOUR_STEPS[currentStep];
    if (currentStep === TOUR_TOTAL_STEPS - 1) {
      stopTour();
      setShowComplete(true);
      return;
    }
    if (step?.navigateOnNext) {
      goToStep(currentStep + 1);
    } else {
      setCurrentStep((s) => {
        const n = s + 1;
        persistTour(true, n);
        return n;
      });
    }
  }, [currentStep, goToStep, persistTour, stopTour]);

  const handleBack = useCallback(() => {
    if (currentStep === 0) return;
    const prev = currentStep - 1;
    const step = TOUR_STEPS[prev];
    if (step.path !== pathname) {
      router.push(step.path);
    }
    setCurrentStep(prev);
    persistTour(true, prev);
  }, [currentStep, pathname, persistTour, router]);

  useEffect(() => {
    if (!isActive && !showComplete && !showWelcome) return;
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (showComplete) {
        dismissComplete();
      } else if (showWelcome) {
        closeWelcome();
      } else if (isActive) {
        stopTour();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isActive, showComplete, showWelcome, dismissComplete, closeWelcome, stopTour]);

  useEffect(() => {
    if (!isActive) return;
    const onKey = (e) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        handleNext();
      }
      if (e.key === "ArrowLeft") handleBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isActive, handleNext, handleBack]);

  const value = useMemo(
    () => ({ startTour, restartTour, stopTour, isActive }),
    [startTour, restartTour, stopTour, isActive]
  );

  return (
    <TelematicsTourContext.Provider value={value}>
      {children}

      <button
        type="button"
        onClick={() => startTour(0)}
        className="fixed right-4 top-4 z-[10040] rounded border border-zinc-600 bg-black/80 px-3 py-1.5 text-xs font-medium text-zinc-300 backdrop-blur hover:border-zinc-400 hover:text-white"
        aria-label="Restart telematics tour"
      >
        ? Tour
      </button>

      {showWelcome && (
        <WelcomeModal
          onStartTour={() => startTour(0)}
          onExplore={() => markSeen()}
          onClose={closeWelcome}
        />
      )}

      {isActive && !showComplete && (
        <TourSpotlight
          targetRect={targetRect}
          stepIndex={currentStep}
          onSkip={stopTour}
          onClose={stopTour}
          onBack={handleBack}
          onNext={handleNext}
          transitionMsg={transitionMsg}
          isMobile={isMobile}
        />
      )}

      {showComplete && (
        <CompletionModal
          onDismiss={dismissComplete}
          onRestart={() => {
            dismissComplete();
            stopTour();
            localStorage.removeItem(TOUR_STORAGE.seen);
            setShowWelcome(true);
          }}
        />
      )}
    </TelematicsTourContext.Provider>
  );
}

export function useTelematicsTour() {
  const ctx = useContext(TelematicsTourContext);
  if (!ctx) throw new Error("useTelematicsTour must be used within TelematicsTourProvider");
  return ctx;
}
