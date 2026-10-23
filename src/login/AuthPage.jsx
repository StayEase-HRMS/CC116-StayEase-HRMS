import { useCallback, useRef, useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, AtSign, Eye, EyeOff, Lock, Mail } from "lucide-react";
import {
  ROLE_HOME,
  requestPasswordReset,
  signIn,
  signOut,
  updatePassword,
  verifyRecoveryOtp,
} from "./auth";
import logo from "../assets/logo.png";
import { CancelModal, CheckEmailModal, SuccessModal } from "./AuthModals";
import { FONT_STACK, GOLD_LINK, INK, INPUT_BG, MUTED, PrimaryButton, maskEmail } from "./authShared";

/* ------------------------------------------------------------------ */
/*  Config                                                             */
/* ------------------------------------------------------------------ */

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1400&q=80";

const OTP_LENGTH = 6;
const OTP_LIFETIME_SECONDS = 10 * 60;
const RESEND_COOLDOWN_SECONDS = 60;
const MIN_PASSWORD_LENGTH = 8;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const mmss = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

/* ------------------------------------------------------------------ */
/*  Building blocks                                                    */
/* ------------------------------------------------------------------ */

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

function FormError({ children }) {
  return (
    <p
      role="alert"
      className="rounded-lg border border-[#f3c9c9] bg-[#fde4e4] px-3 py-2 text-[13px] font-medium text-[#b42318]"
    >
      {children}
    </p>
  );
}

/** Split-screen layout shared by every step. */
function AuthShell({ onBack, children }) {
  return (
    <div
      className="flex min-h-screen bg-white"
      style={{ fontFamily: FONT_STACK }}
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

/* ------------------------------------------------------------------ */
/*  Steps                                                              */
/* ------------------------------------------------------------------ */

function LoginStep({ onForgot, onLogin }) {
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!identity.trim()) next.identity = "Enter your username or email.";
    if (!password) next.password = "Enter your password.";
    setErrors(next);
    setFormError("");
    if (Object.keys(next).length > 0) return;

    setBusy(true);
    try {
      await onLogin({ identity: identity.trim(), password });
    } catch (err) {
      setFormError(err.message);
      setBusy(false); // on success the page navigates away, so only reset on failure
    }
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
        {formError && <FormError>{formError}</FormError>}
        <PrimaryButton loading={busy}>
          {busy ? "Logging in…" : <>Log In <ArrowRight className="h-4 w-4" /></>}
        </PrimaryButton>
      </form>
    </AuthShell>
  );
}

function ForgotStep({ email, setEmail, onBack, onSend }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!isEmail(email.trim())) {
      setError("Enter a valid work email address.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      await onSend(email.trim());
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
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
        <PrimaryButton loading={busy}>
          {busy ? "Sending…" : <>Send Reset Link <ArrowRight className="h-4 w-4" /></>}
        </PrimaryButton>
      </form>
    </AuthShell>
  );
}

function OtpStep({ email, onBack, onVerified, onResend }) {
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [secondsLeft, setSecondsLeft] = useState(OTP_LIFETIME_SECONDS);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [error, setError] = useState("");
  const refs = useRef([]);
  const [busy, setBusy] = useState(false);

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

  const resend = async () => {
    if (cooldown > 0 || busy) return;
    setBusy(true);
    try {
      await onResend();
      setDigits(Array(OTP_LENGTH).fill(""));
      setSecondsLeft(OTP_LIFETIME_SECONDS);
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setError("");
      refs.current[0]?.focus();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const code = digits.join("");
    if (secondsLeft === 0) return setError("This code has expired. Request a new one.");
    if (code.length < OTP_LENGTH) return setError("Enter the full 6-digit code.");

    setBusy(true);
    try {
      await onVerified(code);
    } catch (err) {
      setError(err.message);
      setDigits(Array(OTP_LENGTH).fill(""));
      refs.current[0]?.focus();
    } finally {
      setBusy(false);
    }
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

        <PrimaryButton className="mt-6" loading={busy}>
          {busy ? "Verifying…" : <>Verify Code <ArrowRight className="h-4 w-4" /></>}
        </PrimaryButton>
      </form>

      <p className={`mt-6 text-center text-sm ${MUTED}`}>
        Didn't get a code?{" "}
        <button
          type="button"
          onClick={resend}
          disabled={cooldown > 0 || busy}
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
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setFormError("");
    const next = {};
    if (pw.length < MIN_PASSWORD_LENGTH)
      next.pw = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
    if (confirm !== pw) next.confirm = "Passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setBusy(true);
    try {
      await onSubmit(pw);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setBusy(false);
    }
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
        {formError && <FormError>{formError}</FormError>}
        <PrimaryButton loading={busy}>{busy ? "Updating…" : "Reset Password"}</PrimaryButton>
      </form>
    </AuthShell>
  );
}

/* ------------------------------------------------------------------ */
/*  Modals                                                             */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Page / flow controller                                             */
/* ------------------------------------------------------------------ */

/**
 * Flow: login → forgot → (check-email modal) → otp → reset → (success modal) → login
 * Pressing Back on the reset step opens the "Cancel Password Change?" modal.
 *
 * Auth calls live in ./api/auth.js (Supabase).
 *
 * Props:
 *   onLoginSuccess({ user, session, role })  optional; by default the browser is sent to
 *                                            ROLE_HOME[role] (admin → /admin, etc.)
 */
export default function AuthPage({ onLoginSuccess }) {
  const [step, setStep] = useState("login"); // login | forgot | otp | reset
  const [modal, setModal] = useState(null); // checkEmail | cancel | success | null
  const [email, setEmail] = useState("");

  const toLogin = useCallback(() => {
    setModal(null);
    setStep("login");
  }, []);

  const handleLogin = async (credentials) => {
    const result = await signIn(credentials);
    if (onLoginSuccess) onLoginSuccess(result);
    else window.location.assign(ROLE_HOME[result.role] ?? "/");
  };

  const handleSendCode = async (address) => {
    await requestPasswordReset(address);
    setEmail(address);
    setModal("checkEmail");
  };

  const handleVerifyCode = async (code) => {
    await verifyRecoveryOtp(email, code);
    setStep("reset");
  };

  const handleNewPassword = async (password) => {
    await updatePassword(password);
    await signOut(); // the recovery session must not stay logged in; user logs in with the new password
    setModal("success");
  };

  const handleCancelReset = async () => {
    await signOut(); // drop the temporary recovery session
    toLogin();
  };

  return (
    <>
      {step === "login" && <LoginStep onForgot={() => setStep("forgot")} onLogin={handleLogin} />}

      {step === "forgot" && (
        <ForgotStep
          email={email}
          setEmail={setEmail}
          onBack={() => setStep("login")}
          onSend={handleSendCode}
        />
      )}

      {step === "otp" && (
        <OtpStep
          email={email}
          onBack={() => setStep("forgot")}
          onVerified={handleVerifyCode}
          onResend={() => requestPasswordReset(email)}
        />
      )}

      {step === "reset" && (
        <ResetStep onBack={() => setModal("cancel")} onSubmit={handleNewPassword} />
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
      {modal === "cancel" && <CancelModal onYes={handleCancelReset} onNo={() => setModal(null)} />}
      {modal === "success" && <SuccessModal onDone={toLogin} />}
    </>
  );
}
