-- Insert sample events (these will be created by system user, adjust organizer_id as needed)
-- Note: In production, these would be created through the app by actual organizers
INSERT INTO events (title, description, location, start_time, end_time, max_capacity, category, organizer_id) VALUES
('Welcome Week Orientation', 'New student orientation and campus tour', 'Student Center', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 2 hours', 200, 'Academic', '00000000-0000-0000-0000-000000000000'),
('Career Fair 2024', 'Meet with top employers and explore career opportunities', 'Main Auditorium', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days 4 hours', 500, 'Career', '00000000-0000-0000-0000-000000000000'),
('Basketball vs State University', 'Home game against our biggest rivals', 'Sports Arena', NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days 2 hours', 1000, 'Sports', '00000000-0000-0000-0000-000000000000'),
('Study Group: Calculus II', 'Weekly study session for Calculus II students', 'Library Room 201', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 2 hours', 20, 'Academic', '00000000-0000-0000-0000-000000000000'),
('Spring Concert', 'Annual spring concert featuring student bands', 'Outdoor Amphitheater', NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days 3 hours', 300, 'Entertainment', '00000000-0000-0000-0000-000000000000')
ON CONFLICT DO NOTHING;
