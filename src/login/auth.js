import { supabase } from "./supabaseClient";

/** Where each role lands after logging in. Adjust to your routes. */
export const ROLE_HOME = {
  admin: "/admin",
  staff: "/staff",
  customer: "/",
};

/**
 * Set to false if you only want email login. Username login relies on the
 * `get_email_by_username` SQL function (see supabase/schema.sql), which lets
 * anyone map a username to an email address, so weigh that trade-off.
 */
const ALLOW_USERNAME_LOGIN = true;

const INVALID_CREDENTIALS = "Incorrect username/email or password.";

function friendlyError(error, fallback) {
  const msg = error?.message ?? "";
  if (error?.status === 429 || /rate limit|too many|security purposes/i.test(msg)) {
    return "Too many attempts. Please wait a minute and try again.";
  }
  if (/invalid login credentials/i.test(msg)) return INVALID_CREDENTIALS;
  if (/email not confirmed/i.test(msg)) return "Please confirm your email address before logging in.";
  if (/network|failed to fetch/i.test(msg)) return "Network error. Check your connection and try again.";
  return fallback;
}

/** Reads the signed-in user's role from `public.profiles` (defaults to "customer"). */
export async function getUserRole(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  if (error || !data?.role) return "customer";
  return data.role;
}

/**
 * Log in with an email OR a username.
 * Resolves to { user, session, role }. Throws an Error with a user-friendly message.
 */
export async function signIn({ identity, password }) {
  let email = identity.trim();

  if (!email.includes("@")) {
    if (!ALLOW_USERNAME_LOGIN) throw new Error(INVALID_CREDENTIALS);
    const { data, error } = await supabase.rpc("get_email_by_username", { p_username: email });
    // Same message for "unknown username" and "wrong password" so usernames can't be probed.
    if (error || !data) throw new Error(INVALID_CREDENTIALS);
    email = data;
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(friendlyError(error, "Unable to log in. Please try again."));

  const role = await getUserRole(data.user.id);
  return { user: data.user, session: data.session, role };
}

/**
 * Step 1 of password recovery: emails a 6-digit code.
 * (Requires the "Reset Password" email template to include {{ .Token }}.)
 * Supabase succeeds even for unknown emails, so this doesn't reveal which accounts exist.
 */
export async function requestPasswordReset(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
  if (error) throw new Error(friendlyError(error, "Couldn't send the code. Please try again."));
}

/** Step 2: checks the code. On success Supabase opens a temporary recovery session. */
export async function verifyRecoveryOtp(email, token) {
  const { error } = await supabase.auth.verifyOtp({
    email: email.trim(),
    token,
    type: "recovery",
  });
  if (error) {
    throw new Error(
      friendlyError(error, "That code is invalid or has expired. Request a new one.")
    );
  }
}

/** Step 3: sets the new password (needs the recovery session from step 2). */
export async function updatePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    if (/different from the old password/i.test(error.message)) {
      throw new Error("Your new password must be different from your old one.");
    }
    if (/weak|at least/i.test(error.message)) {
      throw new Error(error.message);
    }
    throw new Error(friendlyError(error, "Couldn't update your password. Please try again."));
  }
}

export async function signOut() {
  await supabase.auth.signOut();
}
