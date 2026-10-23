import { useState } from "react";
import { ArrowRight, AtSign, Mail, User } from "lucide-react";
import { ROLE_HOME, signUp } from "./api/auth";
import { SignupSuccessModal } from "./AuthModals";
import {
  AuthShell,
  Field,
  FormError,
  GOLD_LINK,
  Heading,
  MUTED,
  PasswordField,
  PrimaryButton,
} from "./authShared";

const MIN_PASSWORD_LENGTH = 8;
const USERNAME_RE = /^[a-zA-Z0-9_.]{3,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Props:
 *   onSignupSuccess()  optional; called instead of the default redirect when
 *                      confirmation is off and the user is logged in right away
 */
export default function SignupPage({ onSignupSuccess }) {
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirm: "",
    terms: false,
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null); // { needsConfirmation } once the account exists

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const e = {};
    if (form.fullName.trim().length < 2) e.fullName = "Enter your full name.";
    if (!USERNAME_RE.test(form.username.trim()))
      e.username = "3–20 characters: letters, numbers, . or _";
    if (!EMAIL_RE.test(form.email.trim())) e.email = "Enter a valid email address.";
    if (form.password.length < MIN_PASSWORD_LENGTH)
      e.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
    if (form.confirm !== form.password) e.confirm = "Passwords do not match.";
    if (!form.terms) e.terms = "You need to accept the terms to continue.";
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setFormError("");
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setBusy(true);
    try {
      const result = await signUp(form);
      if (result.needsConfirmation) {
        setDone(result);
      } else if (onSignupSuccess) {
        onSignupSuccess();
      } else {
        window.location.assign(ROLE_HOME.customer);
      }
    } catch (err) {
      setFormError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <AuthShell compact>
        <Heading title="Create Your Account">Join StayEase to book and manage your stays.</Heading>

        <form onSubmit={submit} noValidate className="mt-6 space-y-3.5">
          <div className="grid gap-3.5 sm:grid-cols-2">
            <Field
              id="full-name"
              label="Full Name"
              icon={User}
              value={form.fullName}
              onChange={set("fullName")}
              placeholder="Alex Rivera"
              autoComplete="name"
              error={errors.fullName}
              autoFocus
            />
            <Field
              id="username"
              label="Username"
              icon={AtSign}
              value={form.username}
              onChange={set("username")}
              placeholder="alexrivera"
              autoComplete="username"
              error={errors.username}
            />
          </div>
          <Field
            id="signup-email"
            label="Email Address"
            icon={Mail}
            type="email"
            value={form.email}
            onChange={set("email")}
            placeholder="e.g. alex@stayease.com"
            autoComplete="email"
            error={errors.email}
          />
          <PasswordField
            id="signup-password"
            label="Password"
            value={form.password}
            onChange={set("password")}
            placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
            autoComplete="new-password"
            error={errors.password}
          />
          <PasswordField
            id="signup-confirm"
            label="Confirm Password"
            value={form.confirm}
            onChange={set("confirm")}
            placeholder="Confirm your password"
            autoComplete="new-password"
            error={errors.confirm}
          />

          <div>
            <label className={`flex items-start gap-2.5 text-[13px] leading-snug ${MUTED}`}>
              <input
                type="checkbox"
                checked={form.terms}
                onChange={(e) => set("terms")(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[#d6a75f]"
              />
              <span>
                I agree to the{" "}
                <a href="#" className={`font-semibold ${GOLD_LINK} hover:underline`}>
                  Terms of Residency
                </a>{" "}
                and{" "}
                <a href="#" className={`font-semibold ${GOLD_LINK} hover:underline`}>
                  Privacy Policy
                </a>
                .
              </span>
            </label>
            {errors.terms && (
              <p role="alert" className="mt-1.5 text-xs font-medium text-[#b42318]">
                {errors.terms}
              </p>
            )}
          </div>

          {formError && <FormError>{formError}</FormError>}

          <PrimaryButton loading={busy}>
            {busy ? (
              "Creating account…"
            ) : (
              <>
                Sign Up <ArrowRight className="h-4 w-4" />
              </>
            )}
          </PrimaryButton>

          <p className={`text-center text-sm ${MUTED}`}>
            Already have an account?{" "}
            <a href="/login" className={`font-semibold ${GOLD_LINK} hover:underline`}>
              Log In
            </a>
          </p>
        </form>
      </AuthShell>

      {done && (
        <SignupSuccessModal
          needsConfirmation={done.needsConfirmation}
          email={form.email}
          onDone={() => window.location.assign("/login")}
        />
      )}
    </>
  );
}
