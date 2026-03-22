-- Create bookings table for pet grooming/playcare appointments
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  pet_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  service TEXT NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on bookings table
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert bookings (public booking form)
CREATE POLICY "Anyone can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (true);

-- Create policy to allow authenticated users (admin) to view all bookings
CREATE POLICY "Authenticated users can view all bookings" ON public.bookings
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy to allow authenticated users (admin) to update bookings
CREATE POLICY "Authenticated users can update bookings" ON public.bookings
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Create policy to allow authenticated users (admin) to delete bookings
CREATE POLICY "Authenticated users can delete bookings" ON public.bookings
  FOR DELETE USING (auth.role() = 'authenticated');
