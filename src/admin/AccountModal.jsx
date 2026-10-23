
import { useState } from "react";
import {
  UserRoundPlus,
  X,
  Eye,
  EyeOff,
  AlertOctagon,
} from "lucide-react";
import "./AccountModal.css";

function generateAccountId(role) {
  const prefix = role === "System Admin" ? "ADM" : "STF";
  return `${prefix}-${Date.now().toString().slice(-6)}`;
}

export default function AccountModal({
  mode,
  account,
  onClose,
  onSave,
  onEdit,
  onToggleStatus,
  onShowToast,
}) {
  const isAdd = mode === "add";
  const readOnly = mode === "view";

  const initialRole =
    account?.role === "Admin" || account?.role === "System Admin"
      ? "System Admin"
      : account?.role === "Guest"
        ? "Guest"
        : "Staff";

  const [name, setName] = useState(account?.name ?? "");
  const [email, setEmail] = useState(account?.email ?? "");
  const [role, setRole] = useState(isAdd ? "Staff" : initialRole);
  const [accountId, setAccountId] = useState(
    () =>
      account?.accountId ||
      account?.employeeId ||
      generateAccountId("Staff")
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  function handleRoleChange(event) {
    const nextRole = event.target.value;
    setRole(nextRole);
    setAccountId(generateAccountId(nextRole));
    setError("");
  }

  function closeModal() {
    if (!saving) onClose();
  }

  function validateForm() {
    if (!name.trim()) return "Please enter the full name.";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return "Please enter a valid email address.";
    }

    if (isAdd && !["Staff", "System Admin"].includes(role)) {
      return "Please select Staff or System Admin.";
    }

    if (isAdd && password.length < 8) {
      return "Password must contain at least 8 characters.";
    }

    if (isAdd && password.length > 20) {
      return "Password cannot exceed 20 characters.";
    }

    if (isAdd && password !== confirmPassword) {
      return "Passwords do not match.";
    }

    return "";
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (isAdd) {
      setConfirmation("create");
    } else {
      saveChanges();
    }
  }

  async function confirmCreate() {
    if (saving) return;

    setSaving(true);
    setError("");

    const values = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      systemRole: role,
      accountId,
      employeeId: accountId,
      password,
      status: "Active",
      created: new Date().toISOString().slice(0, 10),
    };

    try {
      const result = await onSave(values);

      if (typeof result === "string" && result) {
        setError(result);
        return;
      }

      setConfirmation(null);
      onClose();
      onShowToast?.(
        "Account Added Successfully.",
        "The account has been created."
      );
    } catch (err) {
      setError(err?.message || "Unable to create the account.");
    } finally {
      setSaving(false);
    }
  }

  async function saveChanges() {
    if (saving) return;

    setSaving(true);
    setError("");

    try {
      const result = await onSave({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        systemRole: role,
        accountId,
        employeeId: accountId,
      });

      if (typeof result === "string" && result) {
        setError(result);
        return;
      }

      onClose();
      onShowToast?.(
        "Account Updated Successfully.",
        "Account details have been updated."
      );
    } catch (err) {
      setError(err?.message || "Unable to save changes.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmStatusChange() {
    if (saving || !confirmation) return;

    setSaving(true);
    setError("");

    const action = confirmation;

    try {
      const result = await onToggleStatus();

      if (typeof result === "string" && result) {
        setError(result);
        return;
      }

      setConfirmation(null);
      onClose();

      if (action === "suspend") {
        onShowToast?.(
          "Account Suspended Successfully.",
          "The account has been suspended."
        );
      } else {
        onShowToast?.(
          "Account Reactivated Successfully.",
          "The account has been reactivated."
        );
      }
    } catch (err) {
      setError(err?.message || "Unable to update account status.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmAction() {
    if (confirmation === "create") {
      await confirmCreate();
    } else {
      await confirmStatusChange();
    }
  }

  const title = isAdd
    ? "Create New Account"
    : mode === "edit"
      ? "Edit Account"
      : "Account Details";

  const confirmationTitle =
    confirmation === "create"
      ? "Create this account?"
      : confirmation === "suspend"
        ? "Suspend this account?"
        : "Reactivate this account?";

  const confirmationMessage =
    confirmation === "create"
      ? "Are you sure you want to create this account with the details entered?"
      : confirmation === "suspend"
        ? `Are you sure you want to suspend ${account?.name ?? "this account"}?`
        : `Are you sure you want to reactivate ${account?.name ?? "this account"}?`;

  return (
    <>
      <div className="account-modal-backdrop">
        <section
  className="account-modal"
  role="dialog"
  aria-modal="true"
  aria-labelledby="account-modal-title"
  style={{
    height: "fit-content",
    minHeight: 0,
    maxHeight: "calc(100vh - 40px)",
    alignSelf: "center",
    flex: "0 1 810px",
  }}
>
          <header className="account-modal-header">
            <span className="account-modal-icon">
              <UserRoundPlus size={19} />
            </span>

            <div className="account-modal-heading">
              <h2 id="account-modal-title">{title}</h2>
              <p>
                {isAdd
                  ? "Create a new staff or system admin account."
                  : readOnly
                    ? "Review account details and system access."
                    : "Manage account details and system role."}
              </p>
            </div>

            <button
              type="button"
              className="account-close"
              aria-label="Close dialog"
              onClick={closeModal}
            >
              <X size={20} />
            </button>
          </header>

          <form
  onSubmit={handleSubmit}
  style={{
    display: "block",
    height: "auto",
    minHeight: 0,
    flex: "none",
  }}
>
            <div className="account-form-body">
              <div className="account-form-grid">
                <label>
                  Full Name {!readOnly && <span>*</span>}
                  <input
                    name="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    maxLength={100}
                    placeholder="e.g. Marcus Vance"
                    readOnly={readOnly}
                  />
                </label>

                <label>
                  Email {!readOnly && <span>*</span>}
                  <input
                    name="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    maxLength={254}
                    placeholder="name@stayease.com"
                    readOnly={readOnly}
                  />
                </label>

                <label>
                  System Role {!readOnly && <span>*</span>}
                  <select
                    name="role"
                    value={role}
                    onChange={handleRoleChange}
                    disabled={readOnly}
                    required
                  >
                    <option value="Staff">Staff</option>
                    <option value="System Admin">System Admin</option>
                    {!isAdd && account?.role === "Guest" && (
                      <option value="Guest">Guest</option>
                    )}
                  </select>
                </label>

                <label>
                  Account ID
                  <input name="accountId" value={accountId} readOnly />
                  <small>Generated automatically.</small>
                </label>

                {isAdd && (
                  <>
                    <label>
                      Password <span>*</span>
                      <div className="account-password-field">
                        <input
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(event) =>
                            setPassword(event.target.value)
                          }
                          minLength={8}
                          maxLength={20}
                          required
                          autoComplete="new-password"
                          placeholder="8–20 characters"
                        />
                        <button
                          type="button"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                          onClick={() =>
                            setShowPassword((value) => !value)
                          }
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </label>

                    <label>
                      Confirm Password <span>*</span>
                      <div className="account-password-field">
                        <input
                          name="confirmPassword"
                          type={
                            showConfirmPassword ? "text" : "password"
                          }
                          value={confirmPassword}
                          onChange={(event) =>
                            setConfirmPassword(event.target.value)
                          }
                          minLength={8}
                          maxLength={20}
                          required
                          autoComplete="new-password"
                          placeholder="Confirm password"
                        />
                        <button
                          type="button"
                          aria-label={
                            showConfirmPassword
                              ? "Hide confirm password"
                              : "Show confirm password"
                          }
                          onClick={() =>
                            setShowConfirmPassword((value) => !value)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </label>
                  </>
                )}
              </div>

              {account && (
                <p className="account-meta">
                  Account {account.id} · {account.status}
                </p>
              )}

              {error && (
                <p className="account-form-error" role="alert">
                  {error}
                </p>
              )}
            </div>

            <footer className="account-modal-footer">
              {readOnly && (
                <button
                  type="button"
                  className="account-status-action"
                  onClick={() =>
                    setConfirmation(
                      account?.status === "Active"
                        ? "suspend"
                        : "reactivate"
                    )
                  }
                >
                  {account?.status === "Active"
                    ? "Suspend Account"
                    : "Reactivate Account"}
                </button>
              )}

              <button
                type="button"
                className="account-secondary"
                onClick={closeModal}
                disabled={saving}
              >
                {readOnly ? "Close" : "Cancel"}
              </button>

              {readOnly ? (
                <button
                  type="button"
                  className="account-submit"
                  onClick={onEdit}
                >
                  Edit Account
                </button>
              ) : (
                <button
                  type="submit"
                  className="account-submit"
                  disabled={saving}
                >
                  {isAdd ? "Create Account" : "Save Changes"}
                </button>
              )}
            </footer>
          </form>
        </section>
      </div>

      {confirmation && (
        <div className="account-confirm-backdrop">
          <section
            className="account-confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="account-confirm-title"
            aria-describedby="account-confirm-message"
          >
            <button
              type="button"
              className="account-confirm-close"
              aria-label="Close confirmation"
              onClick={() => !saving && setConfirmation(null)}
              disabled={saving}
            >
              <X size={20} />
            </button>

            <div className="account-confirm-icon account-warning-icon">
              <AlertOctagon size={32} />
            </div>

            <h2 id="account-confirm-title">{confirmationTitle}</h2>
            <p id="account-confirm-message">{confirmationMessage}</p>

            {error && (
              <p className="account-form-error" role="alert">
                {error}
              </p>
            )}

            <div className="account-confirm-divider" />

            <footer className="account-confirm-actions">
              <button
                type="button"
                className="account-confirm-yes"
                onClick={confirmAction}
                disabled={saving}
              >
                {saving ? "Please wait..." : "Confirm"}
              </button>

              <button
                type="button"
                className="account-confirm-no"
                onClick={() => setConfirmation(null)}
                disabled={saving}
              >
                No
              </button>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}
