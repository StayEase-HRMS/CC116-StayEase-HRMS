import ReservationsAndStatus from "./components/components";
import { Bed, UserRound, KeyRound, ClipboardClock, DoorOpen } from "lucide-react"

function QuickDetailsCard({ color, icon, cardName, value, comment }) {
  return (
    <div className="flex-1 min-w-0 p-4 rounded-md bg-white shadow-md">
      <div className="flex justify-between">
        <div>
          <p className="pt-1 pb-2 text-sm">{cardName}</p>
          <p className="pb-2 text-2xl font-bold">{value}</p>
        </div>

        <div className={`${color} w-fit h-fit p-2 rounded-xl`}>
          {icon}
        </div>
      </div>

      <p className="border-t-1 border-gray-300 pt-2 text-sm text-gray-400 italic text-right">{comment}</p>
    </div>
  )
}

function RoomAvailabilityCard({ roomType, comment, occupied, available }) {
  return (
    <div className="w-80 shrink-0 p-3 grid gap-1 rounded-md bg-white shadow-md border-1 border-gray-200">
      <div className="w-full h-30 rounded-md bg-gray-200"></div>
      <p className="text-xl font-bold">{roomType}</p>
      <p className="text-sm">{comment}</p>

      <div className="flex justify-between mt-2">
        <div className="w-fit h-fit p-1 pr-2 pl-2 rounded-xl bg-yellow-100">{occupied} occupied</div>
        <div className="w-fit h-fit p-1 pr-2 pl-2 rounded-xl bg-green-200">{available} available</div>
      </div>
    </div>
  )
}

export default function AdminTabPage() {
  return (
    <main className="bg-blue-100 h-full p-5 max-w-full grid gap-5">
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
    </main>
  )
}