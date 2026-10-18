import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { CustomerSideBar } from "../components/sidebar";
import PageHeader from "../components/header";

// Placeholder data — replace with API/state later.
const AGENT = { name: "John Doe", role: "Customer service assistant" };

const INITIAL_MESSAGES = [
  {
    id: 1,
    from: "agent",
    text: "Hi! Welcome to StayEase support. How can I help you today?",
    time: "2:41 am",
  },
  {
    id: 2,
    from: "customer",
    text: "Hello! I have a reservation for this Friday. Can I check in earlier than 2 PM?",
    time: "2:43 am",
  },
  {
    id: 3,
    from: "agent",
    text: "Of course! Let me check your booking. Could you share your reservation number?",
    time: "2:44 am",
  },
  {
    id: 4,
    from: "customer",
    text: "Sure, it's SE-20481. I booked a Deluxe room for two nights.",
    time: "2:46 am",
  },
  {
    id: 5,
    from: "agent",
    text: "Thanks! Your Deluxe room is expected to be ready by 11 AM on Friday, so early check-in is possible at no extra charge.",
    time: "2:49 am",
  },
  {
    id: 6,
    from: "customer",
    text: "That's great. Is contactless check-in available too?",
    time: "2:51 am",
  },
  {
    id: 7,
    from: "agent",
    text: "Yes! You'll receive a digital key and check-in link by email 24 hours before arrival. Is there anything else I can help with?",
    time: "2:55 am",
  },
  {
    id: 8,
    from: "customer",
    text: "That's all, thank you so much!",
    time: "2:56 am",
  },
];

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
        <p className="text-sm text-gray-500">
          {isCustomer ? "Sent" : "Read"} {message.time}
        </p>
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
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSubmit(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        from: "customer",
        text,
        time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      },
    ]);
    setDraft("");
  }

  return (
    <main className="flex h-dvh flex-col overflow-hidden">
      <PageHeader title="Customer service" desc="View upcoming stays, manage contactless check-in." />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <CustomerSideBar />

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
      </div>
    </main>
  );
}