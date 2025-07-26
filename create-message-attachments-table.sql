-- Message Attachments Table
-- Bu tablo mesajlara eklenen dosya attachmentlarını tutar

CREATE TABLE
IF NOT EXISTS message_attachments
(
    id UUID DEFAULT gen_random_uuid
() PRIMARY KEY,
    message_id UUID NOT NULL,
    file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_type TEXT NOT NULL,
    file_url TEXT NOT NULL,
    upload_path TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP
WITH TIME ZONE DEFAULT NOW
(),
    updated_at TIMESTAMP
WITH TIME ZONE DEFAULT NOW
(),
    
    -- Foreign key constraints
    CONSTRAINT fk_message_attachments_message 
        FOREIGN KEY
(message_id) 
        REFERENCES messages
(id) 
        ON
DELETE CASCADE
);

-- Indexler
CREATE INDEX
IF NOT EXISTS idx_message_attachments_message_id ON message_attachments
(message_id);
CREATE INDEX
IF NOT EXISTS idx_message_attachments_created_at ON message_attachments
(created_at);
CREATE INDEX
IF NOT EXISTS idx_message_attachments_file_type ON message_attachments
(file_type);

-- RLS Policies
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar sadece kendi mesajlarındaki attachmentları görebilir
CREATE POLICY "Users can view attachments from their own conversations" ON message_attachments
    FOR
SELECT USING (
        EXISTS (
            SELECT 1
    FROM messages m
        JOIN conversations c ON m.conversation_id = c.id
    WHERE m.id = message_attachments.message_id
        AND (c.creator_id = auth.uid()::text OR
        EXISTS (
                     SELECT 1
        FROM conversation_participants cp
        WHERE cp.conversation_id = c.id
            AND cp.user_id = auth.uid()::text
                 )
            )
        )
    );

-- Kullanıcılar sadece kendi gönderdiği mesajlara attachment ekleyebilir
CREATE POLICY "Users can insert attachments to their own messages" ON message_attachments
    FOR
INSERT WITH CHECK
    (
    EXISTS (

    SELECT 1 F

    WHERE m.id = message_attachments.mess
    D m.sender_id = auth.uid()

::text
        )
    );

-- Kullanıcılar sadece kendi attachmentlarını silebilir
CREATE POLICY "Users can delete their own attachments" ON message_attachments
    FOR
DELETE USING (
        EXISTS
(
            SELECT 1
FROM messages m
WHERE m.id = message_attachments.message_id
    AND m.sender_id = auth.uid()
::text
        )
    );

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_message_attachments_updated_at
()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW
();
RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_message_attachments_updated_at
    BEFORE
UPDATE ON message_attachments
    FOR EACH ROW
EXECUTE FUNCTION update_message_attachments_updated_at
();

-- Storage bucket oluşturma (manuel olarak Supabase dashboard'da yapılması gerekebilir)
-- Bucket name: message-attachments
-- Public: false (sadece authenticated kullanıcılar erişebilir)
-- File size limit: 10MB
-- Allowed MIME types: image/*, application/pdf, application/msword, application/vnd.*, text/*, application/zip

-- Storage RLS Policies
-- Aşağıdaki policy'ler Supabase dashboard'da Storage bölümünde manuel olarak eklenmeli:

-- SELECT: Kullanıcılar sadece kendi conversation'larındaki dosyaları görebilir
-- INSERT: Kullanıcılar sadece kendi user_id klasörüne dosya yükleyebilir  
-- DELETE: Kullanıcılar sadece kendi dosyalarını silebilir
