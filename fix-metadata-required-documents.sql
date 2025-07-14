-- Fix metadata required_documents duplication
-- Remove required_documents from metadata column to prevent duplication
-- Only keep required_documents in the main column

-- 1. Show current problematic records
SELECT 
    id,
    listing_number,
    listing_type,
    required_documents,
    metadata->>'required_documents' as metadata_required_docs,
    jsonb_array_length(metadata->'required_documents') as metadata_docs_count,
    array_length(required_documents, 1) as main_docs_count
FROM listings 
WHERE listing_type = 'transport_service'
AND metadata ? 'required_documents'
AND required_documents IS NOT NULL;

-- 2. Clean metadata by removing required_documents
UPDATE listings 
SET metadata = metadata - 'required_documents'
WHERE listing_type = 'transport_service'
AND metadata ? 'required_documents'
AND required_documents IS NOT NULL;

-- 3. Verify the fix
SELECT 
    id,
    listing_number,
    listing_type,
    required_documents,
    metadata->>'required_documents' as metadata_required_docs_after,
    array_length(required_documents, 1) as main_docs_count_after,
    metadata->'contact_info' as contact_info,
    metadata->'transport_details' as transport_details
FROM listings 
WHERE listing_type = 'transport_service'
AND required_documents IS NOT NULL;

-- 4. Show summary
SELECT 
    'FIXED: Removed required_documents from metadata column' as status,
    count(*) as affected_records
FROM listings 
WHERE listing_type = 'transport_service'
AND required_documents IS NOT NULL
AND NOT (metadata ? 'required_documents');
