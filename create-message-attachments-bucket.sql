-- Create the message-attachments storage bucket
INSERT INTO storage.buckets
    (id, name, public)
VALUES
    ('message-attachments', 'message-attachments', false);

-- Create storage policies for message attachments bucket
CREATE POLICY "Users can upload their own attachments" ON storage.objects
  FOR
INSERT WITH CHECK
    (
    bucket_id 
 'message-attachments'
    AND auth.uid()

::text =
(storage.foldername
(name))[1]
  );

CREATE POLICY "Users can view their own attachments" ON storage.objects
  FOR
SELECT USING (
    bucket_id = 'message-attachments'
        AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own attachments" ON storage.objects
  FOR
DELETE USING (
    bucket_id
= 'message-attachments' 
    AND auth.uid
()::text =
(storage.foldername
(name))[1]
  );

-- Allow users to see if they own an attachment
CREATE POLICY "Users can view message attachment participants" ON storage.objects
  FOR
SELECT USING (
    bucket_id = 'message-attachments'
        AND EXISTS (
      SELECT 1
        FROM message_attachments ma
            JOIN messages m ON ma.message_id = m.id
        WHERE ma.file_path = name
            AND (m.sender_id = auth.uid() OR m.receiver_id = auth.uid())
    )
  );
