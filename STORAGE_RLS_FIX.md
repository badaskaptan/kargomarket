-- TEMPORARY: Disable RLS for storage buckets to test file upload
-- Bu sadece test amaçlı, production'da proper policies olmalı

-- Disable RLS for messages bucket (temporarily)
-- Supabase Dashboard > Storage > messages bucket > Settings > Row Level Security: OFF

-- Disable RLS for message_attachments bucket (temporarily)  
-- Supabase Dashboard > Storage > message_attachments bucket > Settings > Row Level Security: OFF

-- ALTERNATIVE: If you want to keep RLS enabled, use these simple policies:

-- For messages bucket:
-- Policy Name: "Allow authenticated users to upload"
-- Type: INSERT
-- Target: authenticated
-- USING expression: true

-- Policy Name: "Allow authenticated users to select"  
-- Type: SELECT
-- Target: authenticated
-- USING expression: true

-- For message_attachments bucket:
-- Policy Name: "Allow authenticated users to upload"
-- Type: INSERT  
-- Target: authenticated
-- USING expression: true

-- Policy Name: "Allow authenticated users to select"
-- Type: SELECT
-- Target: authenticated  
-- USING expression: true
