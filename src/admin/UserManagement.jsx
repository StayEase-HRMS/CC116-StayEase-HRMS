
import { useEffect, useRef, useState } from "react";
import Pagination from "./components/Pagination";
import AccountModal from "./AccountModal";
import {
  Users,
  Briefcase,
  BadgeCheck,
  Ban,
  Plus,
  Search,
  RotateCcw,
  Eye,
  Pencil,
  CheckCircle2,
  X,
} from "lucide-react";

const initialUsers = [
  {
    id: "G001",
    name: "Elena Rostova",
    email: "elena.rostova@gmail.com",
    role: "Guest",
    status: "Active",
    created: "2023-11-04",
  },
  {
    id: "S001",
    name: "David Chen",
    email: "david.chen@stayease.com",
    role: "Staff",
    status: "Active",
    created: "2023-09-18",
    accountId: "STF-000001",
  },
  {
    id: "G002",
    name: "Mark Denina",
    email: "mark.denina@example.com",
    role: "Guest",
    status: "Active",
    created: "2023-11-10",
  },
  {
    id: "G003",
    name: "Josh Dayapera",
    email: "josh.dayapera@example.com",
    role: "Guest",
    status: "Suspended",
    created: "2023-11-10",
  },
];

const dateLabel = (value) =>
  new Date(value + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

export default function UserManagement() {
  const [accounts, setAccounts] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("All Roles");
  const [status, setStatus] = useState("All Statuses");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState("view");

  const [toast, setToast] = useState(null);
  const [toastLeaving, setToastLeaving] = useState(false);
  const toastTimer = useRef(null);
  const toastExitTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      if (toastExitTimer.current) clearTimeout(toastExitTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!toast) return undefined;

    toastTimer.current = setTimeout(() => {
      setToastLeaving(true);

      toastExitTimer.current = setTimeout(() => {
        setToast(null);
        setToastLeaving(false);
      }, 400);
    }, 3000);

    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      if (toastExitTimer.current) clearTimeout(toastExitTimer.current);
    };
  }, [toast]);

  function showSuccessToast(title, message) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    if (toastExitTimer.current) clearTimeout(toastExitTimer.current);

    setToastLeaving(false);
    setToast({ title, message, id: Date.now() });
  }

  function dismissToast() {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    if (toastExitTimer.current) clearTimeout(toastExitTimer.current);
    setToast(null);
    setToastLeaving(false);
  }

  const filtered = accounts.filter(
    (account) =>
      [account.name, account.id, account.accountId, account.email]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (role === "All Roles" || account.role === role) &&
      (status === "All Statuses" || account.status === status)
  );

  const pages = Math.max(1, Math.ceil(filtered.length / 7));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * 7, currentPage * 7);

  function reset() {
    setSearch("");
    setRole("All Roles");
    setStatus("All Statuses");
    setPage(1);
  }

  function saveAccount(values) {
    const editingId = mode === "edit" ? selected?.id : null;

    if (
      accounts.some(
        (account) =>
          account.id !== editingId &&
          account.email.toLowerCase() === values.email.toLowerCase()
      )
    ) {
      return "An account with this email already exists.";
    }

    const newAccountId = values.accountId || values.employeeId;

    if (
      newAccountId &&
      accounts.some(
        (account) =>
          account.id !== editingId &&
          (account.accountId || account.employeeId)?.toLowerCase() ===
            newAccountId.toLowerCase()
      )
    ) {
      return "This account ID is already in use. Please try again.";
    }

    if (mode === "edit") {
      setAccounts((previous) =>
        previous.map((account) =>
          account.id === selected.id
            ? { ...account, ...values, accountId: newAccountId }
            : account
        )
      );

      return null;
    }

    const created = new Date().toISOString().slice(0, 10);

    const newAccount = {
      ...values,
      id: newAccountId,
      accountId: newAccountId,
      role: values.role,
      status: "Active",
      created,
    };

    setAccounts((previous) => [...previous, newAccount]);
    reset();

    return null;
  }

  function toggleSelectedStatus() {
    if (!selected) return "No account is selected.";

    const nextStatus =
      selected.status === "Active" ? "Suspended" : "Active";

    setAccounts((previous) =>
      previous.map((account) =>
        account.id === selected.id
          ? { ...account, status: nextStatus }
          : account
      )
    );

    setSelected((previous) =>
      previous ? { ...previous, status: nextStatus } : previous
    );

    return null;
  }

  return (
    <>
      <div className="admin-toolbar">
        <button
          className="admin-primary"
          onClick={() => {
            setMode("add");
            setSelected({ id: "new" });
          }}
        >
          <Plus size={19} />
          Add User
        </button>
      </div>

      <div className="admin-stats">
        {[
          ["Total accounts", accounts.length, Users],
          [
            "Guest accounts",
            accounts.filter((account) => account.role === "Guest").length,
            Briefcase,
          ],
          [
            "Staff accounts",
            accounts.filter(
              (account) =>
                account.role === "Staff" ||
                account.role === "System Admin"
            ).length,
            BadgeCheck,
          ],
          [
            "Suspended",
            accounts.filter((account) => account.status === "Suspended")
              .length,
            Ban,
          ],
        ].map(([label, value, Icon]) => (
          <div className="admin-stat" key={label}>
            <div>
              <span>{label}</span>
              <Icon size={20} />
            </div>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <section className="admin-accounts" aria-label="User accounts">
        <div className="admin-filters">
          <label className="admin-search">
            <Search size={20} />
            <input
              aria-label="Search accounts"
              placeholder="Search by name, ID or email..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </label>

          <select
            aria-label="Filter by role"
            value={role}
            onChange={(event) => {
              setRole(event.target.value);
              setPage(1);
            }}
          >
            {["All Roles", "Guest", "Staff", "System Admin"].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>

          <select
            aria-label="Filter by status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            {["All Statuses", "Active", "Suspended"].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>

          <button
            className="admin-icon-button"
            aria-label="Reset filters"
            onClick={reset}
          >
            <RotateCcw size={19} />
          </button>
        </div>

        <div className="admin-table-scroll">
          <table className="admin-user-table management-table">
            <thead>
              <tr>
                {[
                  "Account",
                  "Email",
                  "Role",
                  "Status",
                  "Date created",
                  "Actions",
                ].map((label) => (
                  <th key={label}>{label}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {visible.map((account) => (
                <tr key={account.id}>
                  <td>
                    <strong>{account.name}</strong>
                  </td>
                  <td>{account.email}</td>
                  <td>
                    <span
                      className={
                        "admin-badge " +
                        account.role.toLowerCase().replace(/\s+/g, "-")
                      }
                    >
                      {account.role}
                    </span>
                  </td>
                  <td>
                    <span
                      className={
                        "admin-badge " + account.status.toLowerCase()
                      }
                    >
                      • {account.status}
                    </span>
                  </td>
                  <td>{dateLabel(account.created)}</td>
                  <td>
                    <button
                      className="admin-icon-button"
                      aria-label={"View " + account.name}
                      onClick={() => {
                        setMode("view");
                        setSelected(account);
                      }}
                    >
                      <Eye size={18} />
                    </button>

                    <button
                      className="admin-icon-button"
                      aria-label={"Edit " + account.name}
                      onClick={() => {
                        setMode("edit");
                        setSelected(account);
                      }}
                    >
                      <Pencil size={17} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!visible.length && (
            <p className="admin-empty">
              No accounts match your search. Try changing the filters.
            </p>
          )}
        </div>

        <Pagination
          page={currentPage}
          total={filtered.length}
          pageSize={7}
          onChange={setPage}
          noun="accounts"
        />
      </section>

      {selected && (
        <AccountModal
          key={mode + (selected.id ?? "new")}
          mode={mode}
          account={mode === "add" ? null : selected}
          onClose={() => setSelected(null)}
          onSave={saveAccount}
          onEdit={() => setMode("edit")}
          onShowToast={showSuccessToast}
          onToggleStatus={toggleSelectedStatus}
        />
      )}

      {toast && (
        <div
          key={toast.id}
          className={`account-toast ${
            toastLeaving ? "account-toast-leaving" : ""
          }`}
          role="status"
          aria-live="polite"
        >
          <CheckCircle2 size={25} className="account-toast-icon" />

          <div className="account-toast-message">
            <strong>{toast.title}</strong>
            <span>{toast.message}</span>
          </div>

          <button
            type="button"
            className="account-toast-close"
            aria-label="Dismiss notification"
            onClick={dismissToast}
          >
            <X size={17} />
          </button>
        </div>
      )}
    </>
  );
}
