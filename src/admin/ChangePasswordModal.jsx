import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

function PasswordField({ label, name, autoComplete }) {
  return (
    <label className="grid gap-1 text-xs font-semibold text-[#574d40]">
      {label}
      <input
        name={name}
        type="password"
        autoComplete={autoComplete}
        className="rounded-lg border border-[#cfd6e0] px-3 py-2 text-sm font-normal text-[#15212b] focus:outline-2 focus:outline-[#4b6b95]"
      />
    </label>
  );
}

export default function ChangePasswordModal({ onClose, onSuccess }) {
  const dialog = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);

  function submit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const current = data.get("current");
    const next = data.get("next");
    const confirm = data.get("confirm");

    if (!current) return setError("Enter your current password.");
    if (next.length < 8) return setError("New password must be at least 8 characters.");
    if (next === current) return setError("New password must be different from the current one.");
    if (next !== confirm) return setError("New password and confirmation do not match.");

    // TODO: call your backend here to verify `current` and save `next`.
    onSuccess();
    onClose();
  }

  return (
    <dialog
      ref={dialog}
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      onClick={(e) => e.target === dialog.current && onClose()}
      className="m-auto w-[min(420px,calc(100%-2rem))] rounded-2xl p-0 backdrop:bg-black/40"
    >
      <form onSubmit={submit} className="grid gap-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#15212b]">Change Password</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="cursor-pointer rounded-lg p-1.5 hover:bg-[#e3effe]">
            <X size={18} />
          </button>
        </div>

        <PasswordField label="Current password" name="current" autoComplete="current-password" />
        <PasswordField label="New password" name="next" autoComplete="new-password" />
        <PasswordField label="Confirm new password" name="confirm" autoComplete="new-password" />

        {error && <p role="alert" className="text-sm font-semibold text-[#bd3343]">{error}</p>}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="cursor-pointer rounded-lg bg-[#e3e8ef] px-4 py-2.5 text-sm font-semibold text-[#574d40] hover:bg-[#d5dce6]">
            Cancel
          </button>
          <button type="submit" className="cursor-pointer rounded-lg bg-[#d4a04a] px-4 py-2.5 text-sm font-semibold text-[#3d2c0e] hover:bg-[#c8922f]">
            Update password
          </button>
        </div>
      </form>
    </dialog>
  );
}
