-- Messages table for storing individual messages (Supabase uyumlu)
CREATE TABLE IF NOT EXISTS public.messages (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  conversation_id bigint NOT NULL,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  message_type character varying(50) NOT NULL DEFAULT 'text',
  is_read boolean NOT NULL DEFAULT false,
  metadata jsonb NULL,
  created_at timestamp with time zone NOT NULL DEFAULT NOW(),
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE,
  CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES profiles (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages USING btree (conversation_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages USING btree (sender_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages USING btree (created_at DESC) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON public.messages USING btree (is_read) WHERE is_read = false;

-- Trigger to update conversation's last_message_at when a new message is added
CREATE TRIGGER update_conversation_last_message_trigger
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- RLS for messages table
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Messages RLS: Kullanıcı sadece katıldığı konuşmaların mesajlarını görebilir
CREATE POLICY "Users can view messages from their conversations" ON messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Messages RLS: Kullanıcı katıldığı konuşmalara mesaj gönderebilir
CREATE POLICY "Users can send messages to their conversations" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Messages RLS: Kullanıcı kendi mesajlarını güncelleyebilir
CREATE POLICY "Users can update their own messages" ON messages
  FOR UPDATE USING (sender_id = auth.uid());

-- Messages RLS: Kullanıcı kendi mesajlarını silebilir
CREATE POLICY "Users can delete their own messages" ON messages
  FOR DELETE USING (sender_id = auth.uid());
