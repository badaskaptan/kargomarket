-- Storage Bucket Policies for Message Attachments
-- Bu policy'ler Supabase Dashboard > Storage > Policies bölümünde uygulanmalı

-- 1. MESSAGES BUCKET POLICIES (resimler için)

-- Policy 1: Users can upload images to their own folder
CREATE POLICY "Users can upload to own folder in messages bucket" ON storage.objects
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'messages' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy 2: Users can view images from their conversations
CREATE POLICY "Users can view images from their conversations" ON storage.objects
  FOR SELECT 
  USING (
    bucket_id = 'messages' 
    AND (
      -- Own files
      auth.uid()::text = (storage.foldername(name))[1]
      OR
      -- Files from conversations where user is participant
      EXISTS (
        SELECT 1 FROM messages m
        JOIN conversations c ON m.conversation_id = c.id
        WHERE m.image_urls @> ARRAY[storage.objects.name]
        AND (
          c.creator_id = auth.uid()::text 
          OR 
          EXISTS (
            SELECT 1 FROM conversation_participants cp 
            WHERE cp.conversation_id = c.id 
            AND cp.user_id = auth.uid()::text
          )
        )
      )
    )
  );

-- Policy 3: Users can delete their own images
CREATE POLICY "Users can delete own images" ON storage.objects
  FOR DELETE 
  USING (
    bucket_id = 'messages' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 2. MESSAGE_ATTACHMENTS BUCKET POLICIES (dosyalar için)

-- Policy 1: Users can upload documents to their own folder
CREATE POLICY "Users can upload to own folder in message_attachments bucket" ON storage.objects
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'message_attachments' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy 2: Users can view documents from their conversations
CREATE POLICY "Users can view documents from their conversations" ON storage.objects
  FOR SELECT 
  USING (
    bucket_id = 'message_attachments' 
    AND (
      -- Own files
      auth.uid()::text = (storage.foldername(name))[1]
      OR
      -- Files from conversations where user is participant
      EXISTS (
        SELECT 1 FROM messages m
        JOIN conversations c ON m.conversation_id = c.id
        WHERE m.document_urls @> ARRAY[storage.objects.name]
        AND (
          c.creator_id = auth.uid()::text 
          OR 
          EXISTS (
            SELECT 1 FROM conversation_participants cp 
            WHERE cp.conversation_id = c.id 
            AND cp.user_id = auth.uid()::text
          )
        )
      )
    )
  );

-- Policy 3: Users can delete their own documents
CREATE POLICY "Users can delete own documents" ON storage.objects
  FOR DELETE 
  USING (
    bucket_id = 'message_attachments' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
