-- Add time slot fields to bookings table for daycare services
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS drop_off_time TEXT,
ADD COLUMN IF NOT EXISTS pick_up_time TEXT,
ADD COLUMN IF NOT EXISTS pet_size TEXT CHECK (pet_size IN ('small', 'large')),
ADD COLUMN IF NOT EXISTS service_type TEXT,
ADD COLUMN IF NOT EXISTS duration_hours INTEGER,
ADD COLUMN IF NOT EXISTS additional_dog BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS total_price_cents INTEGER;

-- Create index for efficient date/time slot queries
CREATE INDEX IF NOT EXISTS idx_bookings_date_time ON public.bookings(booking_date, drop_off_time, pick_up_time);

-- Create a unique constraint to prevent double-booking the same slot
-- A slot is considered booked when the date and time range overlaps with an existing active booking
CREATE INDEX IF NOT EXISTS idx_bookings_active ON public.bookings(booking_date, status) WHERE status NOT IN ('cancelled');
