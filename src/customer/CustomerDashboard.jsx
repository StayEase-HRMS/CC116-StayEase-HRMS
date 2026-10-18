import { CustomerSideBar } from "../components/sidebar";
import PageHeader from "../components/header";
import logo from "../assets/logo.svg"

export default function AdminPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <PageHeader title="My reservations" desc="Browse over a wide selection of rooms and accommodations according to your taste." />

      <section className="flex">

        <CustomerSideBar />

        <div className="w-full min-w-0 bg-blue-200 relative">
        </div>

      </section>
    </main>  
  )
}