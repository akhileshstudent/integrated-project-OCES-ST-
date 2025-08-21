-- Add notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('event_reminder', 'event_update', 'event_cancelled', 'registration_confirmed')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add event favorites table
CREATE TABLE IF NOT EXISTS event_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

-- Enable RLS for new tables
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_favorites ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view their notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Event favorites policies
CREATE POLICY "Users can view their favorites" ON event_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add favorites" ON event_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove favorites" ON event_favorites FOR DELETE USING (auth.uid() = user_id);

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_event_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT
) RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, event_id, type, title, message)
  VALUES (p_user_id, p_event_id, p_type, p_title, p_message)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create registration confirmation notification
CREATE OR REPLACE FUNCTION notify_registration_confirmed()
RETURNS TRIGGER AS $$
DECLARE
  event_title TEXT;
BEGIN
  -- Get event title
  SELECT title INTO event_title FROM events WHERE id = NEW.event_id;
  
  -- Create notification
  PERFORM create_notification(
    NEW.user_id,
    NEW.event_id,
    'registration_confirmed',
    'Registration Confirmed',
    'You have successfully registered for "' || event_title || '"'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for registration notifications
DROP TRIGGER IF EXISTS registration_notification_trigger ON event_registrations;
CREATE TRIGGER registration_notification_trigger
  AFTER INSERT ON event_registrations
  FOR EACH ROW EXECUTE FUNCTION notify_registration_confirmed();
