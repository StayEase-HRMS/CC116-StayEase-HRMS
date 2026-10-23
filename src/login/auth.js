
import { supabase } from "../api/supabaseClient";

/** Where each role lands after logging in. */
export const ROLE_HOME = {
  admin: "/admin",
  staff: "/staff",
  customer: "/",
};

const ALLOW_USERNAME_LOGIN = true;

const INVALID_CREDENTIALS =
  "Incorrect username/email or password.";

function friendlyError(error, fallback) {
  const msg = error?.message ?? "";

  if (
    error?.status === 429 ||
    /rate limit|too many|security purposes/i.test(msg)
  ) {
    return "Too many attempts. Please wait a minute and try again.";
  }

  if (/invalid login credentials/i.test(msg)) {
    return INVALID_CREDENTIALS;
  }

  if (/email not confirmed/i.test(msg)) {
    return "Please confirm your email address before logging in.";
  }

  if (/network|failed to fetch/i.test(msg)) {
    return "Network error. Check your connection and try again.";
  }

  return fallback;
}

/**
 * Reads the signed-in user's role from public.profiles.
 * The profiles.id value must match the Supabase Auth user ID.
 */
export async function getUserRole(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching user role:", error);

    throw new Error(
      "Unable to retrieve your account role. Please try again."
    );
  }

  if (!data?.role) {
    console.error(
      "No profile or role found for user:",
      userId
    );

    throw new Error(
      "Your account role is missing. Please contact the administrator."
    );
  }

  const role = String(data.role).trim().toLowerCase();

  if (!Object.prototype.hasOwnProperty.call(ROLE_HOME, role)) {
    console.error("Unsupported account role:", role);

    throw new Error(
      "Your account has an invalid role. Please contact the administrator."
    );
  }

  console.log("Role retrieved from Supabase:", role);

  return role;
}

/**
 * Log in with an email address or username.
 * Returns { user, session, role }.
 */
export async function signIn({ identity, password }) {
  const trimmedIdentity = identity?.trim();

  if (!trimmedIdentity || !password) {
    throw new Error("Enter your username/email and password.");
  }

  let email = trimmedIdentity;

  // Resolve username to email when the identity is not an email.
  if (!email.includes("@")) {
    if (!ALLOW_USERNAME_LOGIN) {
      throw new Error(INVALID_CREDENTIALS);
    }

    const { data, error } = await supabase.rpc(
      "get_email_by_username",
      { p_username: email }
    );

    if (error || !data) {
      console.error("Username lookup failed:", error);
      throw new Error(INVALID_CREDENTIALS);
    }

    email = data;
  }

  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (error) {
    throw new Error(
      friendlyError(
        error,
        "Unable to log in. Please try again."
      )
    );
  }

  if (!data?.user) {
    throw new Error("Login succeeded without returning a user.");
  }

  const role = await getUserRole(data.user.id);

  return {
    user: data.user,
    session: data.session,
    role,
  };
}

/**
 * Step 1: Send a password-recovery email.
 * The Supabase email template must include {{ .Token }}
 * if you want to use a six-digit OTP.
 */
export async function requestPasswordReset(email) {
  const { error } =
    await supabase.auth.resetPasswordForEmail(email.trim());

  if (error) {
    throw new Error(
      friendlyError(
        error,
        "Couldn't send the code. Please try again."
      )
    );
  }
}

/** Step 2: Verify the password-recovery OTP. */
export async function verifyRecoveryOtp(email, token) {
  const { error } = await supabase.auth.verifyOtp({
    email: email.trim(),
    token,
    type: "recovery",
  });

  if (error) {
    throw new Error(
      friendlyError(
        error,
        "That code is invalid or has expired. Request a new one."
      )
    );
  }
}

/** Step 3: Update the password using the recovery session. */
export async function updatePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    if (/different from the old password/i.test(error.message)) {
      throw new Error(
        "Your new password must be different from your old one."
      );
    }

    if (/weak|at least/i.test(error.message)) {
      throw new Error(error.message);
    }

    throw new Error(
      friendlyError(
        error,
        "Couldn't update your password. Please try again."
      )
    );
  }
}

/** Sign out the current Supabase session. */
export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(
      friendlyError(error, "Unable to sign out. Please try again.")
    );
  }
}
