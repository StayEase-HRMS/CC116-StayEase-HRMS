import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

const ALL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function Field({ label, name, defaultValue, type = "text" }) {
  return (
    <label className="grid gap-1 text-xs font-semibold text-[#574d40]">
      {label}
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="rounded-lg border border-[#cfd6e0] px-3 py-2 text-sm font-normal text-[#15212b] focus:outline-2 focus:outline-[#4b6b95]"
      />
    </label>
  );
}

function Section({ title, children }) {
  return (
    <fieldset className="grid gap-3">
      <legend className="mb-1 text-[10px] font-bold tracking-[0.07em] text-[#697589] uppercase">{title}</legend>
      <div className="grid gap-3 min-[601px]:grid-cols-2">{children}</div>
    </fieldset>
  );
}

// canEditAccess: admins can edit department / supervisor / station access; staff only see their own personal fields.
export default function EditProfileModal({ profile, canEditAccess = true, onClose, onSave }) {
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
    const get = (key) => (data.get(key) ?? "").toString().trim();

    const values = {
      name: get("name"),
      title: get("title"),
      shift: get("shift"),
      email: get("email"),
      phone: get("phone"),
      fullName: get("fullName"),
      preferredName: get("preferredName"),
      languages: get("languages"),
      joined: get("joined"),
      workingDays: data.getAll("days"),
      emergency: {
        name: get("emergencyName"),
        relation: get("emergencyRelation"),
        phone: get("emergencyPhone"),
        address: get("emergencyAddress"),
      },
    };

    if (canEditAccess) {
      values.department = get("department");
      values.supervisor = get("supervisor");
      values.rfid = get("rfid");
      values.permittedFloors = get("permittedFloors");
      values.pmsLevel = get("pmsLevel");
      values.terminal = get("terminal");
    }

    if (!values.name) return setError("Display name is required.");
    if (!values.fullName) return setError("Full legal name is required.");
    if (!values.preferredName) return setError("Preferred name is required.");
    if (!/^\S+@\S+\.\S+$/.test(values.email)) return setError("Enter a valid email address.");
    if (!values.phone) return setError("Phone number is required.");
    if (!values.emergency.name || !values.emergency.phone) return setError("Emergency contact name and phone are required.");

    onSave(values);
    onClose();
  }

  return (
    <dialog
      ref={dialog}
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      onClick={(e) => e.target === dialog.current && onClose()}
      className="m-auto max-h-[90vh] w-[min(640px,calc(100%-2rem))] overflow-y-auto rounded-2xl p-0 backdrop:bg-black/40"
    >
      <form onSubmit={submit} className="grid gap-5 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#15212b]">Edit Profile</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="cursor-pointer rounded-lg p-1.5 hover:bg-[#e3effe]">
            <X size={18} />
          </button>
        </div>

        <Section title="Profile header">
          <Field label="Display name" name="name" defaultValue={profile.name} />
          <Field label="Job title" name="title" defaultValue={profile.title} />
          <Field label="Shift" name="shift" defaultValue={profile.shift} />
          <Field label="Email" name="email" type="email" defaultValue={profile.email} />
          <Field label="Phone" name="phone" type="tel" defaultValue={profile.phone} />
        </Section>

        <Section title="Personal & department details">
          <Field label="Full legal name" name="fullName" defaultValue={profile.fullName} />
          <Field label="Preferred name / alias" name="preferredName" defaultValue={profile.preferredName} />
          {canEditAccess && <Field label="Department" name="department" defaultValue={profile.department} />}
          {canEditAccess && <Field label="Supervisor / lead" name="supervisor" defaultValue={profile.supervisor} />}
          <Field label="Languages spoken" name="languages" defaultValue={profile.languages} />
          <Field label="Date joined" name="joined" defaultValue={profile.joined} />
        </Section>

        <fieldset className="grid gap-2">
          <legend className="mb-1 text-[10px] font-bold tracking-[0.07em] text-[#697589] uppercase">Shift schedule coverage</legend>
          <div className="flex flex-wrap gap-2">
            {ALL_DAYS.map((day) => (
              <label key={day} className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#cfd6e0] px-3 py-1.5 text-xs font-semibold text-[#574d40]">
                <input type="checkbox" name="days" value={day} defaultChecked={profile.workingDays.includes(day)} className="accent-[#b3832c]" />
                {day}
              </label>
            ))}
          </div>
        </fieldset>

        {canEditAccess && (
          <Section title="Station & NFC access">
            <Field label="RFID card" name="rfid" defaultValue={profile.rfid} />
            <Field label="Permitted floors" name="permittedFloors" defaultValue={profile.permittedFloors} />
            <Field label="PMS override level" name="pmsLevel" defaultValue={profile.pmsLevel} />
            <Field label="Station terminal" name="terminal" defaultValue={profile.terminal} />
          </Section>
        )}

        <Section title="Emergency contact">
          <Field label="Name" name="emergencyName" defaultValue={profile.emergency.name} />
          <Field label="Relationship" name="emergencyRelation" defaultValue={profile.emergency.relation} />
          <Field label="Phone" name="emergencyPhone" type="tel" defaultValue={profile.emergency.phone} />
          <Field label="Address" name="emergencyAddress" defaultValue={profile.emergency.address} />
        </Section>

        {error && <p role="alert" className="text-sm font-semibold text-[#bd3343]">{error}</p>}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="cursor-pointer rounded-lg bg-[#e3e8ef] px-4 py-2.5 text-sm font-semibold text-[#574d40] hover:bg-[#d5dce6]">
            Cancel
          </button>
          <button type="submit" className="cursor-pointer rounded-lg bg-[#d4a04a] px-4 py-2.5 text-sm font-semibold text-[#3d2c0e] hover:bg-[#c8922f]">
            Save changes
          </button>
        </div>
      </form>
    </dialog>
  );
}
