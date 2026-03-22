import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get("date")

  if (!date) {
    return NextResponse.json({ error: "Date is required" }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Get all active bookings for the specified date
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("booking_time, drop_off_time, pick_up_time, service")
    .eq("booking_date", date)
    .neq("status", "cancelled")

  if (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Return booked time slots
  const bookedSlots = bookings?.map(b => ({
    time: b.booking_time,
    dropOff: b.drop_off_time,
    pickUp: b.pick_up_time,
    service: b.service,
  })) || []

  return NextResponse.json({ bookedSlots })
}
