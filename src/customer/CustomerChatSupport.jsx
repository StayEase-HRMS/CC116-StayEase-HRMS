import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { createSupportTicket, listSupportTickets } from "../api/support";

// Placeholder data — replace with API/state later.
const AGENT = { name: "John Doe", role: "Customer service assistant" };

const GREETING = {
  id: "greeting",
  from: "agent",
  text: "Hi! Welcome to StayEase support. How can we help you today?",
  time: "",
};

const formatTime = (value) =>
  new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

// A support ticket is saved as one message from the customer.
const ticketToMessage = (ticket) => ({
  id: ticket.id,
  from: "customer",
  text: ticket.message,
  time: formatTime(ticket.created_at),
});

function Avatar({ className = "" }) {
  return <div className={`shrink-0 rounded-full bg-orange-200 ${className}`} />;
}

function ChatHeader({ name, role }) {
  return (
    <div className="flex items-center gap-4 border-b border-gray-200 bg-white p-3">
      <Avatar className="h-14 w-14 bg-red-200" />
      <div>
        <p className="font-bold">{name}</p>
        <p className="text-sm text-gray-600">{role}</p>
      </div>
    </div>
  );
}

function MessageBubble({ message }) {
  const isCustomer = message.from === "customer";

  return (
    <div className={`flex items-end gap-3 ${isCustomer ? "flex-row-reverse" : ""}`}>
      <Avatar className="h-12 w-12" />
      <div className={`flex flex-col gap-1 ${isCustomer ? "items-end" : "items-start"}`}>
        <p className="max-w-120 rounded-xl bg-white p-3 wrap-break-word">{message.text}</p>
        {(message.time || message.pending || message.failed) && (
          <p className={`text-sm ${message.failed ? "text-red-600" : "text-gray-500"}`}>
            {message.failed
              ? "Couldn't send. Please try again."
              : message.pending
                ? "Sending…"
                : isCustomer
                  ? `Sent ${message.time}`
                  : message.time}
          </p>
        )}
      </div>
    </div>
  );
}

function MessageInput({ value, onChange, onSubmit }) {
  const isEmpty = value.trim() === "";

  return (
    <form
      onSubmit={onSubmit}
      className="flex items-center gap-2 border-t border-gray-200 bg-white p-3"
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your message..."
        aria-label="Message"
        className="min-w-0 flex-1 rounded-full border border-gray-200 bg-slate-100 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      />
      <button
        type="submit"
        disabled={isEmpty}
        aria-label="Send message"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        <Send size={18} />
      </button>
    </form>
  );
}

export default function CustomerChatSupport() {
  const [messages, setMessages] = useState([GREETING]);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef(null);

  // Load the customer's earlier messages (empty when logged out or offline).
  useEffect(() => {
    let ignore = false;

    listSupportTickets()
      .then((tickets) => {
        if (ignore) return;
        const history = tickets.map(ticketToMessage);
        const loaded = new Set(history.map((m) => m.id));
        setMessages((prev) => [
          GREETING,
          ...history,
          // keep anything sent while the history was loading
          ...prev.filter((m) => m.from === "customer" && !loaded.has(m.id)),
        ]);
      })
      .catch((err) => console.warn("[CustomerChatSupport] Could not load messages:", err));

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;

    // Show the message right away, then swap in the saved ticket.
    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [...prev, { id: tempId, from: "customer", text, pending: true }]);
    setDraft("");

    try {
      const ticket = await createSupportTicket({ message: text });
      setMessages((prev) => prev.map((m) => (m.id === tempId ? ticketToMessage(ticket) : m)));
    } catch (err) {
      console.warn("[CustomerChatSupport] Could not send message:", err);
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, pending: false, failed: true } : m))
      );
    }
  }

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-slate-100">
      <ChatHeader name={AGENT.name} role={AGENT.role} />

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-3">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={bottomRef} />
      </div>

      <MessageInput value={draft} onChange={setDraft} onSubmit={handleSubmit} />
    </section>
  );
}