-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  max_capacity INTEGER,
  current_registrations INTEGER DEFAULT 0,
  category TEXT NOT NULL,
  image_url TEXT,
  organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create event_registrations table for tracking who registered for what
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  attendance_status TEXT DEFAULT 'registered' CHECK (attendance_status IN ('registered', 'attended', 'no_show')),
  UNIQUE(event_id, user_id)
);

-- Create user_profiles table for additional user info
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  student_id TEXT,
  year TEXT,
  major TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin', 'organizer')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Events policies
CREATE POLICY "Anyone can view events" ON events FOR SELECT USING (true);
CREATE POLICY "Organizers can create events" ON events FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Organizers can update their events" ON events FOR UPDATE USING (auth.uid() = organizer_id);
CREATE POLICY "Organizers can delete their events" ON events FOR DELETE USING (auth.uid() = organizer_id);

-- Event registrations policies
CREATE POLICY "Users can view their registrations" ON event_registrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can register for events" ON event_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can cancel their registrations" ON event_registrations FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Organizers can view registrations for their events" ON event_registrations FOR SELECT USING (
  EXISTS (SELECT 1 FROM events WHERE events.id = event_registrations.event_id AND events.organizer_id = auth.uid())
);
CREATE POLICY "Organizers can update attendance" ON event_registrations FOR UPDATE USING (
  EXISTS (SELECT 1 FROM events WHERE events.id = event_registrations.event_id AND events.organizer_id = auth.uid())
);

-- User profiles policies
CREATE POLICY "Users can view their profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can create their profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON user_profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);
