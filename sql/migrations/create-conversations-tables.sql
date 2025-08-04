-- Conversations table for bigint IDs (matching your messages table)
CREATE TABLE IF NOT EXISTS public.conversations (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  listing_id bigint NULL,
  creator_id uuid NOT NULL,
  title character varying(255) NULL,
  last_message_at timestamp with time zone NULL,
  created_at timestamp with time zone NOT NULL DEFAULT NOW(),
  updated_at timestamp with time zone NOT NULL DEFAULT NOW(),
  CONSTRAINT conversations_pkey PRIMARY KEY (id),
  CONSTRAINT conversations_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES profiles (id) ON DELETE CASCADE,
  CONSTRAINT conversations_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES listings (id) ON DELETE SET NULL
) TABLESPACE pg_default;

-- Conversation participants table (Supabase uyumlu)
CREATE TABLE IF NOT EXISTS public.conversation_participants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_id bigint NOT NULL,
  user_id uuid NOT NULL,
  last_read_at timestamp with time zone NULL,
  is_active boolean NOT NULL DEFAULT true,
  joined_at timestamp with time zone NOT NULL DEFAULT NOW(),
  CONSTRAINT conversation_participants_pkey PRIMARY KEY (id),
  CONSTRAINT conversation_participants_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE,
  CONSTRAINT conversation_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles (id) ON DELETE CASCADE,
  CONSTRAINT unique_conversation_user UNIQUE (conversation_id, user_id)
) TABLESPACE pg_default;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_creator_id ON public.conversations USING btree (creator_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON public.conversations USING btree (last_message_at DESC) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON public.conversation_participants USING btree (conversation_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON public.conversation_participants USING btree (user_id) TABLESPACE pg_default;

-- Function to update conversation's last_message_at when a new message is added
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS trigger AS $$
BEGIN
  UPDATE conversations 
  SET 
    last_message_at = NEW.created_at,
    updated_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- Conversations RLS: Kullanıcı sadece katıldığı konuşmaları görebilir
CREATE POLICY "Users can view conversations they participate in" ON conversations
  FOR SELECT USING (
    id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Conversations RLS: Kullanıcı yeni konuşma oluşturabilir
CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (creator_id = auth.uid());

-- Conversations RLS: Kullanıcı katıldığı konuşmaları güncelleyebilir
CREATE POLICY "Users can update conversations they participate in" ON conversations
  FOR UPDATE USING (
    id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Conversation participants RLS: Kullanıcı katıldığı konuşmaların katılımcılarını görebilir
CREATE POLICY "Users can view participants of their conversations" ON conversation_participants
  FOR SELECT USING (
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Conversation participants RLS: Kullanıcı konuşmalara katılımcı ekleyebilir
CREATE POLICY "Users can add participants to conversations" ON conversation_participants
  FOR INSERT WITH CHECK (
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Conversation participants RLS: Kullanıcı kendi katılımını güncelleyebilir
CREATE POLICY "Users can update their own participation" ON conversation_participants
  FOR UPDATE USING (user_id = auth.uid());
