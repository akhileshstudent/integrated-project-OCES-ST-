-- Update sample data to have proper organizer IDs and create admin user
-- Note: This script should be run after users are created in the system

-- First, let's create a sample admin user profile (this would normally be done through the app)
-- You'll need to replace the UUID with an actual user ID from your auth.users table
INSERT INTO user_profiles (id, full_name, student_id, role) VALUES
('11111111-1111-1111-1111-111111111111', 'System Administrator', 'ADMIN001', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Update the sample events to have a proper organizer_id
-- Replace with actual user IDs as needed
UPDATE events 
SET organizer_id = '11111111-1111-1111-1111-111111111111'
WHERE organizer_id = '00000000-0000-0000-0000-000000000000';

-- Create some sample organizer users
INSERT INTO user_profiles (id, full_name, student_id, role) VALUES
('22222222-2222-2222-2222-222222222222', 'Event Organizer', 'ORG001', 'organizer'),
('33333333-3333-3333-3333-333333333333', 'Student Leader', 'STU001', 'organizer')
ON CONFLICT (id) DO NOTHING;
