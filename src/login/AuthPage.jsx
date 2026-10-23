import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  AtSign,
  Check,
  Eye,
  EyeOff,
  Info,
  KeyRound,
  Lock,
  Mail,
  MailCheck,
  OctagonAlert,
} from "lucide-react";
import logo from "../assets/logo.png";

/* ------------------------------------------------------------------ */
/*  Config                                                             */
/* ------------------------------------------------------------------ */

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1400&q=80";

const OTP_LENGTH = 6;
const OTP_LIFETIME_SECONDS = 10 * 60;
const RESEND_COOLDOWN_SECONDS = 60;
const REDIRECT_DELAY_MS = 2500;
const MIN_PASSWORD_LENGTH = 8;

/* Shared class tokens */
const INK = "text-[#111c27]";
const MUTED = "text-[#475f85]";
const GOLD_LINK = "text-[#7a5516]";
const INPUT_BG = "bg-[#ecf2fe]";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function maskEmail(email) {
  const [local = "", domain = ""] = email.split("@");
  if (!domain) return email;
  const masked =
    local.length > 2 ? `${local[0]}${"*".repeat(Math.min(local.length - 2, 4))}${local.at(-1)}` : `${local[0] ?? ""}****`;
  return `${masked}@${domain}`;
}

const mmss = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

/* ------------------------------------------------------------------ */
/*  Building blocks                                                    */
/* ------------------------------------------------------------------ */

function PrimaryButton({ children, className = "", ...props }) {
  return (
    <button
      type="submit"
      {...props}
      className={`flex h-12 w-full items-center justify-center gap-1.5 rounded-lg bg-[#d6a75f] text-sm font-semibold text-white shadow-md shadow-[#d6a75f]/30 transition-colors hover:bg-[#c8964c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a8761a] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}

function Field({
  id,
  label,
  icon: Icon,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  error,
  trailing,
  autoFocus,
}) {
  return (
    <div>
      <label htmlFor={id} className={`mb-1.5 block text-sm font-medium ${INK}`}>
        {label}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`h-11 w-full rounded-lg border border-transparent ${INPUT_BG} pl-10 ${
            trailing ? "pr-11" : "pr-3"
          } text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-500/80 focus:border-[#d6a75f] focus:bg-white ${
            error ? "border-red-400" : ""
          }`}
        />
        {trailing}
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs font-medium text-[#b42318]">
          {error}
        </p>
      )}
    </div>
  );
}

function PasswordField({ id, label, value, onChange, placeholder, autoComplete, error, autoFocus }) {
  const [show, setShow] = useState(false);
  return (
    <Field
      id={id}
      label={label}
      icon={Lock}
      type={show ? "text" : "password"}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoComplete={autoComplete}
      error={error}
      autoFocus={autoFocus}
      trailing={
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:text-slate-800"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      }
    />
  );
}

function Heading({ title, children }) {
  return (
    <div className="text-center">
      <h1 className={`text-[32px] font-extrabold leading-tight tracking-tight ${INK}`}>{title}</h1>
      <p className={`mx-auto mt-2 max-w-[300px] text-sm leading-relaxed ${MUTED}`}>{children}</p>
    </div>
  );
}

/** Split-screen layout shared by every step. */
function AuthShell({ onBack, children }) {
  return (
    <div
      className="flex min-h-screen bg-white"
      style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
    >
      {/* Form side */}
      <section className="relative flex w-full flex-col items-center justify-center px-6 py-16 lg:w-[41.25%] lg:shrink-0">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className={`absolute left-6 top-8 flex items-center gap-1.5 text-sm font-medium ${MUTED} transition-colors hover:text-[#111c27]`}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        )}
        <div className="w-full max-w-[432px]">
          <img src={logo} alt="StayEase Hospitality Suite" className="mx-auto mb-5 h-24 w-auto" />
          {children}
        </div>
      </section>

      {/* Hero side */}
      <aside className="relative hidden flex-1 overflow-hidden bg-gradient-to-br from-[#3a2a1c] via-[#8a6c47] to-[#e9b77a] lg:block">
        <img
          src={HERO_IMAGE}
          alt=""
          onError={(e) => (e.currentTarget.style.display = "none")}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
        <div className="absolute bottom-24 left-10 right-10 text-white xl:left-10">
          <div className="mb-4 h-2 w-44 bg-[#d6a75f]" />
          <h2 className="max-w-md text-4xl font-bold leading-[1.15] tracking-tight">
            Hotel Reservation &amp; Management System
          </h2>
          <p className="mt-12 max-w-md text-[13px] leading-relaxed text-white/90">
            Efficiently search, reserve, and manage hotel rooms while helping staff track
            availability and reservations.
          </p>
        </div>
      </aside>
    </div>
  );
}

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
      style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
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
/*  Steps                                                              */
/* ------------------------------------------------------------------ */

function LoginStep({ onForgot, onLogin }) {
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!identity.trim()) next.identity = "Enter your username or email.";
    if (!password) next.password = "Enter your password.";
    setErrors(next);
    if (Object.keys(next).length === 0) onLogin({ identity: identity.trim(), password });
  };

  return (
    <AuthShell>
      <Heading title="Welcome Back">Sign in to access your account.</Heading>
      <form onSubmit={submit} noValidate className="mt-8 space-y-4">
        <Field
          id="identity"
          label="Username or Email"
          icon={AtSign}
          value={identity}
          onChange={setIdentity}
          placeholder="Enter your username or email"
          autoComplete="username"
          error={errors.identity}
        />
        <PasswordField
          id="password"
          label="Password"
          value={password}
          onChange={setPassword}
          placeholder="Enter your password"
          autoComplete="current-password"
          error={errors.password}
        />
        <button
          type="button"
          onClick={onForgot}
          className={`text-[13px] font-semibold ${GOLD_LINK} hover:underline`}
        >
          Forgot Password?
        </button>
        <PrimaryButton>
          Log In <ArrowRight className="h-4 w-4" />
        </PrimaryButton>
      </form>
    </AuthShell>
  );
}

function ForgotStep({ email, setEmail, onBack, onSend }) {
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!isEmail(email.trim())) {
      setError("Enter a valid work email address.");
      return;
    }
    setError("");
    onSend();
  };

  return (
    <AuthShell onBack={onBack}>
      <Heading title="Forgot Your Password?">
        Enter your email address and we'll send you a secure reset link.
      </Heading>
      <form onSubmit={submit} noValidate className="mt-14 space-y-5">
        <Field
          id="reset-email"
          label="Work Email Address"
          icon={Mail}
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="e.g. alex@stayease.com"
          autoComplete="email"
          error={error}
          autoFocus
        />
        <PrimaryButton>
          Send Reset Link <ArrowRight className="h-4 w-4" />
        </PrimaryButton>
      </form>
    </AuthShell>
  );
}

function OtpStep({ email, onBack, onVerified }) {
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [secondsLeft, setSecondsLeft] = useState(OTP_LIFETIME_SECONDS);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [error, setError] = useState("");
  const refs = useRef([]);

  // One ticking interval drives both the expiry timer and the resend cooldown.
  useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
      setCooldown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const setDigit = (i, raw) => {
    const d = raw.replace(/\D/g, "").slice(-1);
    setError("");
    setDigits((prev) => prev.map((v, idx) => (idx === i ? d : v)));
    if (d && i < OTP_LENGTH - 1) refs.current[i + 1]?.focus();
  };

  const onKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
    if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < OTP_LENGTH - 1) refs.current[i + 1]?.focus();
  };

  const onPaste = (e) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!text) return;
    e.preventDefault();
    setError("");
    setDigits(Array.from({ length: OTP_LENGTH }, (_, i) => text[i] ?? ""));
    refs.current[Math.min(text.length, OTP_LENGTH - 1)]?.focus();
  };

  const resend = () => {
    if (cooldown > 0) return;
    setDigits(Array(OTP_LENGTH).fill(""));
    setSecondsLeft(OTP_LIFETIME_SECONDS);
    setCooldown(RESEND_COOLDOWN_SECONDS);
    setError("");
    refs.current[0]?.focus();
    // TODO: call your "resend OTP" endpoint here.
  };

  const submit = (e) => {
    e.preventDefault();
    const code = digits.join("");
    if (secondsLeft === 0) return setError("This code has expired. Request a new one.");
    if (code.length < OTP_LENGTH) return setError("Enter the full 6-digit code.");
    // TODO: verify `code` against your API. Any 6-digit code passes for now.
    onVerified(code);
  };

  return (
    <AuthShell onBack={onBack}>
      <Heading title="Enter Verification Code">Enter the 6-digit code sent to your email.</Heading>
      <p className="mt-2 flex justify-center">
        <span
          className={`inline-flex items-center gap-1.5 rounded-md ${INPUT_BG} px-2.5 py-1 text-[13px] font-medium ${INK}`}
        >
          <Mail className="h-3.5 w-3.5 text-[#7a5516]" /> {maskEmail(email)}
        </span>
      </p>

      <form onSubmit={submit} noValidate className="mt-9">
        <div
          className={`flex items-center gap-2 rounded-lg ${INPUT_BG} px-3.5 py-2.5 text-[13px] font-medium text-slate-700`}
          role="timer"
        >
          <Mail className="h-4 w-4 text-[#7a5516]" />
          <span>
            One-Time Passcode expires in{" "}
            <span className={`font-bold ${secondsLeft === 0 ? "text-[#b42318]" : INK}`}>
              {mmss(secondsLeft)}
            </span>
          </span>
        </div>

        <div className="mt-6 flex justify-between gap-2" onPaste={onPaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (refs.current[i] = el)}
              value={d}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              onFocus={(e) => e.target.select()}
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              maxLength={1}
              aria-label={`Digit ${i + 1}`}
              className={`h-14 w-full min-w-0 rounded-xl border-2 ${INPUT_BG} text-center text-xl font-bold text-slate-900 outline-none transition-all focus:-translate-y-px focus:border-[#d6a75f] focus:bg-white focus:shadow-md ${
                error ? "border-red-300" : "border-transparent"
              }`}
            />
          ))}
        </div>
        <p
          role={error ? "alert" : undefined}
          className={`mt-2 px-1 text-xs ${error ? "font-medium text-[#b42318]" : MUTED}`}
        >
          {error || "Enter 6-digit code"}
        </p>

        <PrimaryButton className="mt-6">
          Verify Code <ArrowRight className="h-4 w-4" />
        </PrimaryButton>
      </form>

      <p className={`mt-6 text-center text-sm ${MUTED}`}>
        Didn't get a code?{" "}
        <button
          type="button"
          onClick={resend}
          disabled={cooldown > 0}
          className={`font-semibold ${GOLD_LINK} hover:underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-60`}
        >
          {cooldown > 0 ? `Resend Code (${cooldown}s)` : "Resend Code"}
        </button>
      </p>
    </AuthShell>
  );
}

function ResetStep({ onBack, onSubmit }) {
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (pw.length < MIN_PASSWORD_LENGTH)
      next.pw = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
    if (confirm !== pw) next.confirm = "Passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length === 0) onSubmit(pw);
  };

  return (
    <AuthShell onBack={onBack}>
      <Heading title="Create New Password">Create a new password for your account.</Heading>
      <form onSubmit={submit} noValidate className="mt-9 space-y-4">
        <PasswordField
          id="new-password"
          label="New Password"
          value={pw}
          onChange={setPw}
          placeholder="Enter your new password"
          autoComplete="new-password"
          error={errors.pw}
          autoFocus
        />
        <PasswordField
          id="confirm-password"
          label="Confirm New Password"
          value={confirm}
          onChange={setConfirm}
          placeholder="Confirm your password"
          autoComplete="new-password"
          error={errors.confirm}
        />
        <PrimaryButton>Reset Password</PrimaryButton>
      </form>
    </AuthShell>
  );
}

/* ------------------------------------------------------------------ */
/*  Modals                                                             */
/* ------------------------------------------------------------------ */

function CheckEmailModal({ email, onContinue }) {
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

function CancelModal({ onYes, onNo }) {
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

function SuccessModal({ onDone }) {
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

/* ------------------------------------------------------------------ */
/*  Page / flow controller                                             */
/* ------------------------------------------------------------------ */

/**
 * Flow: login → forgot → (check-email modal) → otp → reset → (success modal) → login
 * Pressing Back on the reset step opens the "Cancel Password Change?" modal.
 *
 * Props:
 *   onLogin({ identity, password })  called when the login form passes validation
 *   onPasswordReset(newPassword)     called when a new password is submitted
 */
export default function AuthPage({ onLogin = () => {}, onPasswordReset = () => {} }) {
  const [step, setStep] = useState("login"); // login | forgot | otp | reset
  const [modal, setModal] = useState(null); // checkEmail | cancel | success | null
  const [email, setEmail] = useState("");

  const toLogin = useCallback(() => {
    setModal(null);
    setStep("login");
  }, []);

  return (
    <>
      {step === "login" && (
        <LoginStep onForgot={() => setStep("forgot")} onLogin={onLogin} />
      )}

      {step === "forgot" && (
        <ForgotStep
          email={email}
          setEmail={setEmail}
          onBack={() => setStep("login")}
          onSend={() => setModal("checkEmail")}
        />
      )}

      {step === "otp" && (
        <OtpStep
          email={email}
          onBack={() => setStep("forgot")}
          onVerified={() => setStep("reset")}
        />
      )}

      {step === "reset" && (
        <ResetStep
          onBack={() => setModal("cancel")}
          onSubmit={(pw) => {
            onPasswordReset(pw);
            setModal("success");
          }}
        />
      )}

      {modal === "checkEmail" && (
        <CheckEmailModal
          email={email}
          onContinue={() => {
            setModal(null);
            setStep("otp");
          }}
        />
      )}
      {modal === "cancel" && <CancelModal onYes={toLogin} onNo={() => setModal(null)} />}
      {modal === "success" && <SuccessModal onDone={toLogin} />}
    </>
  );
}
