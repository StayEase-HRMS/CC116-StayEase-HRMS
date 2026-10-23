import { useEffect, useState } from "react";
import { ArrowRight, Check, Info, KeyRound, Mail, MailCheck, OctagonAlert } from "lucide-react";
import { FONT_STACK, INK, INPUT_BG, MUTED, PrimaryButton, maskEmail } from "./authShared";

const REDIRECT_DELAY_MS = 2500;

/* ------------------------------------------------------------------ */
/*  Modal primitives                                                   */
/* ------------------------------------------------------------------ */

/** Centered modal card with the gold top hairline. */
function Modal({ children, onClose, label }) {
  useEffect(() => {
    if (!onClose) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[2px]"
      style={{ fontFamily: FONT_STACK }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="relative w-full max-w-[440px] overflow-hidden rounded-2xl border border-slate-800 bg-white px-7 pb-8 pt-9 text-center shadow-2xl shadow-slate-900/30"
      >
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#d6a75f] to-transparent" />
        {children}
      </div>
    </div>
  );
}

/** Icon surrounded by soft concentric gold rings (cancel / success dialogs). */
function RingIcon({ children }) {
  return (
    <div className="mx-auto flex h-[100px] w-[100px] items-center justify-center rounded-full bg-[#fbeccb]/60">
      <div className="flex h-[78px] w-[78px] items-center justify-center rounded-full border border-[#ecd9b8] bg-[#fbf3e2]">
        <div className="flex h-[58px] w-[58px] items-center justify-center rounded-full border border-[#ecd9b8] bg-[#f3efe6]">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Modals                                                             */
/* ------------------------------------------------------------------ */

export function CheckEmailModal({ email, onContinue }) {
  return (
    <Modal label="Check your email">
      <div className="relative mx-auto h-20 w-20">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#d3f3de]">
          <MailCheck className="h-9 w-9 text-[#1f6b3d]" strokeWidth={2.2} />
        </div>
        <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#d6a75f] text-[#5b3d08]">
          <KeyRound className="h-3.5 w-3.5" />
        </span>
      </div>
      <h2 className={`mt-6 text-2xl font-extrabold tracking-tight ${INK}`}>Check Your Email</h2>
      <p className="mx-auto mt-3 max-w-[290px] text-sm leading-relaxed text-slate-600">
        We've sent a verification code to your registered email address.
      </p>
      <p className="mt-4">
        <span
          className={`inline-flex items-center gap-2 rounded-lg ${INPUT_BG} px-3 py-1.5 text-[13px] font-semibold ${MUTED}`}
        >
          <Mail className="h-3.5 w-3.5 text-[#7a5516]" /> {maskEmail(email)}
        </span>
      </p>

      <div className={`mt-5 flex gap-2.5 rounded-xl ${INPUT_BG} p-4 text-left`}>
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#7a5516]" />
        <div>
          <p className={`text-sm font-semibold ${INK}`}>Didn't receive an email?</p>
          <p className={`mt-1 text-xs leading-relaxed ${MUTED}`}>
            Please check your junk or spam folder, or allow up to 60 seconds before requesting a
            replacement token.
          </p>
        </div>
      </div>

      <PrimaryButton type="button" onClick={onContinue} className="mt-5">
        Enter Verification Code <ArrowRight className="h-4 w-4" />
      </PrimaryButton>
    </Modal>
  );
}

export function CancelModal({ onYes, onNo }) {
  return (
    <Modal label="Cancel password change" onClose={onNo}>
      <RingIcon>
        <OctagonAlert className="h-9 w-9 fill-[#c01f1f] text-white" strokeWidth={2} />
      </RingIcon>
      <h2 className={`mt-6 text-2xl font-extrabold tracking-tight ${INK}`}>
        Cancel Password Change?
      </h2>
      <p className={`mx-auto mt-3 max-w-[360px] text-sm leading-relaxed ${MUTED}`}>
        Are you sure you want to cancel changing your password? You will have to enter your old
        password again to login.
      </p>
      <div className="mx-auto mt-6 h-1 rounded-full bg-[#dfeafb]" />
      <div className="mt-6 grid grid-cols-2 gap-5">
        <button
          type="button"
          onClick={onYes}
          className="h-11 rounded-lg bg-[#a8762f] text-sm font-semibold text-white transition-colors hover:bg-[#95661f]"
        >
          Yes
        </button>
        <button
          type="button"
          autoFocus
          onClick={onNo}
          className="h-11 rounded-lg bg-[#d6a75f] text-sm font-semibold text-white transition-colors hover:bg-[#c8964c]"
        >
          No
        </button>
      </div>
    </Modal>
  );
}

export function SuccessModal({ onDone }) {
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setFilled(true));
    const t = setTimeout(onDone, REDIRECT_DELAY_MS);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [onDone]);

  return (
    <Modal label="Password successfully reset">
      <RingIcon>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1f6b3d]">
          <Check className="h-5 w-5 text-white" strokeWidth={3} />
        </span>
      </RingIcon>
      <h2 className={`mt-6 text-2xl font-extrabold tracking-tight ${INK}`}>
        Password Successfully Reset
      </h2>
      <p className={`mx-auto mt-3 max-w-[340px] text-sm leading-relaxed ${MUTED}`}>
        Your password has been updated. You can now log in with your new credentials.
      </p>
      <div className="mx-auto mt-6 h-1 overflow-hidden rounded-full bg-[#dfeafb]">
        <div
          className="h-full rounded-full bg-[#d6a75f] transition-[width] ease-linear"
          style={{ width: filled ? "100%" : "0%", transitionDuration: `${REDIRECT_DELAY_MS}ms` }}
        />
      </div>
      <button
        type="button"
        onClick={onDone}
        className="mt-6 h-11 w-full rounded-lg bg-[#d6a75f] text-sm font-semibold text-white"
      >
        Redirecting to Login
      </button>
    </Modal>
  );
}
