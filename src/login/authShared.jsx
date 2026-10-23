/* Shared tokens and tiny helpers used by AuthPage.jsx and AuthModals.jsx */

import { Loader2 } from "lucide-react";
export const INK = "text-[#111c27]";
export const MUTED = "text-[#475f85]";
export const GOLD_LINK = "text-[#7a5516]";
export const INPUT_BG = "bg-[#ecf2fe]";

export const FONT_STACK = "'Inter', system-ui, -apple-system, sans-serif";

export function maskEmail(email) {
  const [local = "", domain = ""] = email.split("@");
  if (!domain) return email;
  const masked =
    local.length > 2 ? `${local[0]}${"*".repeat(Math.min(local.length - 2, 4))}${local.at(-1)}` : `${local[0] ?? ""}****`;
  return `${masked}@${domain}`;
}

export function PrimaryButton({ children, loading = false, disabled, className = "", ...props }) {
  return (
    <button
      type="submit"
      {...props}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`flex h-12 w-full items-center justify-center gap-1.5 rounded-lg bg-[#d6a75f] text-sm font-semibold text-white shadow-md shadow-[#d6a75f]/30 transition-colors hover:bg-[#c8964c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a8761a] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
