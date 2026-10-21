import { useLocation } from "react-router-dom";
import { CustomerSideBar, getCustomerLink } from "../components/sidebar";
import PageHeader from "../components/header";
import CustomerRooms from "./CustomerRooms";
import CustomerReservation from "./CustomerReservation";
import CustomerChatSupport from "./CustomerChatSupport";

// page id (see getCustomerLink in components/sidebar.jsx) -> content component
const PAGE_COMPONENTS = {
  rooms: CustomerRooms,
  "my-reservation": CustomerReservation,
  "chat-support": CustomerChatSupport,
};

export default function CustomerPage() {
  const { pathname } = useLocation();
  const { page, title, desc } = getCustomerLink(pathname);
  const Page = PAGE_COMPONENTS[page];

  return (
    <main className="flex h-dvh flex-col overflow-hidden">
      <PageHeader title={title} desc={desc} />

      <div className="flex min-h-0 flex-1">
        <CustomerSideBar />

        <section
          key={page}
          className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto *:flex-1">
          <Page />
        </section>
      </div>
    </main>
  );
}
