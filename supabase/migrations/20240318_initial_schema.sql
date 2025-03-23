-- Enable PostGIS extension for location data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create table for users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  profile_image TEXT,
  spark_coins INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up RLS (Row Level Security) for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Create table for charging stations
CREATE TABLE IF NOT EXISTS charging_stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  location GEOMETRY(POINT, 4326) NOT NULL, -- SRID 4326 is for WGS84 (GPS coordinates)
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  postal_code TEXT,
  price_per_kwh DECIMAL(10, 2) NOT NULL,
  available BOOLEAN DEFAULT TRUE,
  vehicle_types TEXT[] DEFAULT '{}',
  charging_speeds TEXT[] DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}',
  rating DECIMAL(3, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up RLS (Row Level Security) for charging stations table
ALTER TABLE charging_stations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Charging stations are viewable by everyone" ON charging_stations
  FOR SELECT USING (TRUE);
CREATE POLICY "Admins can insert charging stations" ON charging_stations
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'role' = 'service_role'
  );
CREATE POLICY "Admins can update charging stations" ON charging_stations
  FOR UPDATE USING (
    auth.jwt() ->> 'role' = 'service_role'
  );
CREATE POLICY "Admins can delete charging stations" ON charging_stations
  FOR DELETE USING (
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Create table for bookings
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  station_id UUID NOT NULL REFERENCES charging_stations(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  energy_used DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up RLS (Row Level Security) for bookings table
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own bookings" ON bookings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bookings" ON bookings
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bookings" ON bookings
  FOR DELETE USING (auth.uid() = user_id);

-- Create table for payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  payment_method TEXT NOT NULL CHECK (payment_method IN ('card', 'upi', 'wallet', 'mobile')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  transaction_id TEXT,
  payment_gateway TEXT,
  spark_coins_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up RLS (Row Level Security) for payments table
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update payments" ON payments
  FOR UPDATE USING (
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Create table for payment intents (UPI payments and QR scanning)
CREATE TABLE IF NOT EXISTS payment_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reference_id TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  payee_vpa TEXT,
  payee_name TEXT,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'success', 'failure')),
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  station_id UUID REFERENCES charging_stations(id) ON DELETE SET NULL,
  order_id TEXT,
  payment_id TEXT,
  upi_transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Set up RLS (Row Level Security) for payment_intents table
ALTER TABLE payment_intents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own payment intents" ON payment_intents
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own payment intents" ON payment_intents
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own payment intents" ON payment_intents
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to find nearby charging stations
CREATE OR REPLACE FUNCTION nearby_stations(
  lat DOUBLE PRECISION,
  long DOUBLE PRECISION,
  radius_km DOUBLE PRECISION
) RETURNS SETOF charging_stations AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM charging_stations
  WHERE ST_DWithin(
    location,
    ST_SetSRID(ST_MakePoint(long, lat), 4326),
    radius_km * 1000  -- Convert km to meters
  )
  ORDER BY ST_Distance(
    location,
    ST_SetSRID(ST_MakePoint(long, lat), 4326)
  );
END;
$$ LANGUAGE plpgsql;

-- Create index for location-based queries
CREATE INDEX IF NOT EXISTS idx_charging_stations_location
  ON charging_stations USING GIST(location);

-- Create indexes for faster bookings lookups
CREATE INDEX IF NOT EXISTS idx_bookings_user_id
  ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_station_id
  ON bookings(station_id);
CREATE INDEX IF NOT EXISTS idx_bookings_start_time
  ON bookings(start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_status
  ON bookings(status);

-- Create indexes for faster payment lookups
CREATE INDEX IF NOT EXISTS idx_payments_user_id
  ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id
  ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status
  ON payments(status);

-- Create indexes for faster payment intent lookups
CREATE INDEX IF NOT EXISTS idx_payment_intents_user_id
  ON payment_intents(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_reference_id
  ON payment_intents(reference_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_status
  ON payment_intents(status);
CREATE INDEX IF NOT EXISTS idx_payment_intents_booking_id
  ON payment_intents(booking_id);

-- Create trigger to update spark coins on payment completion
CREATE OR REPLACE FUNCTION update_spark_coins() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    UPDATE users
    SET spark_coins = spark_coins + NEW.spark_coins_earned
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_payment_update_spark_coins
AFTER INSERT OR UPDATE OF status ON payments
FOR EACH ROW
EXECUTE FUNCTION update_spark_coins();