import { Bed, UserRound, KeyRound, ClipboardClock, DoorOpen } from "lucide-react"
import { ReservationsAndStatus, QuickDetailsCard, RoomAvailabilityCard } from "./components/components";
import { AdminSideBar } from "../components/sidebar";
import PageHeader from "../components/header";

export default function AdminPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <PageHeader title="Admin dashboard" desc="lorem ipsum" />

      <div className="flex">
        <AdminSideBar />

        <div className="flex-1 min-w-0 overflow-y-auto">
          <div className="bg-blue-100 h-full p-5 max-w-full grid gap-5">
            <div className="flex gap-2">
              <QuickDetailsCard color="bg-blue-200" icon={<Bed />} cardName="TOTAL ROOMS" value="50" comment="Across all room types" />
              <QuickDetailsCard color="bg-orange-200" icon={<UserRound />} cardName="OCCUPIED ROOMS" value="45" comment="90% Occupancy rate" />
              <QuickDetailsCard color="bg-green-200" icon={<KeyRound />} cardName="AVAILABLE ROOMS" value="5" comment="10% Availability rate" />
              <QuickDetailsCard color="bg-yellow-200" icon={<ClipboardClock />} cardName="TODAY'S CHECK-INS" value="50" />
              <QuickDetailsCard color="bg-red-200" icon={<DoorOpen />} cardName="TODAY'S CHECK-OUTS" value="50" />
            </div>

            <div className="grid p-2 bg-white rounded-md">
              <p className="text-xl">Room Availability</p>
              <div className="p-3 flex gap-2 overflow-x-auto">
                <RoomAvailabilityCard roomType="Standard" comment="A comfortable and practical room for a simple stay" occupied="16" available="2" />
                <RoomAvailabilityCard roomType="Deluxe" comment="A comfortable and practical room for a simple stay" occupied="16" available="2" />
                <RoomAvailabilityCard roomType="Executive Suit" comment="A comfortable and practical room for a simple stay" occupied="16" available="2" />
                <RoomAvailabilityCard roomType="Family" comment="A comfortable and practical room for a simple stay" occupied="16" available="2" />
              </div>
            </div>

            <ReservationsAndStatus />
          </div>
        </div>
      </div>
    </main>
  )
}