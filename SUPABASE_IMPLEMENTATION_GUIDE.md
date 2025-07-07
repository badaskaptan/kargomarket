# Supabase Schema Alignment - Implementation Guide

## Overview
Based on the current database schema analysis, I've created comprehensive SQL scripts and TypeScript types to align your Supabase database with the intended schema for the Kargo Market platform.

## Files Created

### 1. `supabase-schema-alignment.sql`
- **Purpose**: Complete SQL script to align existing tables and add missing ones
- **Features**:
  - Adds missing columns to existing tables (`user_profiles`, `listings`, `transport_services`)
  - Creates new tables (`offers`, `messages`, `reviews`, `ads`, `transactions`, `notifications`)
  - Establishes proper foreign key relationships
  - Creates comprehensive indexes for performance
  - Sets up Row Level Security (RLS) policies
  - Adds triggers for automatic updates
  - Creates storage buckets and policies
  - Includes utility functions

### 2. `src/types/database-types.ts`
- **Purpose**: TypeScript type definitions matching the database schema
- **Features**:
  - Complete Database interface for Supabase
  - Proper typing for all JSONB fields
  - Helper types for easy usage
  - Insert, Update, and Row types for all tables

## Current Database State (from CSV analysis)
✅ **Existing Tables:**
- `user_profiles` - Main user profile table
- `listings` - Listings/requests table  
- `transport_services` - Transport service providers

❌ **Missing Tables:**
- `offers` - Bids/offers on listings
- `messages` - Communication system
- `reviews` - Rating and review system
- `ads` - Advertisement management
- `transactions` - Payment and delivery tracking
- `notifications` - System notifications

## Implementation Steps

### Step 1: Apply Schema Alignment SQL
```bash
# In your Supabase SQL Editor, run:
# c:\kargomarkett\supabase-schema-alignment.sql
```

**What this will do:**
- Add missing columns to existing tables
- Create all missing tables with proper relationships
- Set up indexes for optimal performance
- Enable Row Level Security on all tables
- Create storage buckets for file uploads
- Add utility functions and triggers

### Step 2: Verify Foreign Key Relationships
After running the SQL, verify these key relationships:
- `user_profiles.id` → `auth.users.id` (Foreign Key)
- `listings.user_id` → `user_profiles.id`
- `transport_services.user_id` → `user_profiles.id`
- `offers.listing_id` → `listings.id`
- `offers.carrier_id` → `user_profiles.id`
- `messages.sender_id` → `user_profiles.id`
- `messages.recipient_id` → `user_profiles.id`

### Step 3: Test RLS Policies
Verify that RLS policies work correctly:
```sql
-- Test user profile access
SELECT * FROM user_profiles WHERE id = auth.uid();

-- Test listing visibility
SELECT * FROM listings WHERE status = 'active';

-- Test offer permissions
SELECT * FROM offers WHERE carrier_id = auth.uid();
```

### Step 4: Configure Storage
Verify storage buckets are created:
- `avatars` - User profile pictures
- `listing-images` - Listing photos
- `transport-images` - Vehicle/service photos
- `ad-images` - Advertisement images
- `documents` - Private documents
- `message-attachments` - File attachments

### Step 5: Update Frontend Types
Replace the existing database types in your project:
```typescript
// Import the new types
import type { Database, UserProfile, Listing } from '@/types/database-types'
```

### Step 6: Install Supabase Client
If not already installed:
```bash
npm install @supabase/supabase-js
```

### Step 7: Create Supabase Client Configuration
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database-types'

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

## Key Features of the New Schema

### 1. Comprehensive User Management
- Extended user profiles with company information
- User verification system (email, phone)
- Role-based access (buyer_seller, carrier, both)
- Rating and review system integration

### 2. Flexible Listing System
- Support for both shipment requests and load listings
- JSONB fields for dynamic cargo/transport details
- Priority levels and featured listings
- Automatic view and offer counting

### 3. Complete Offer Management
- Carrier bids on listings
- Terms and conditions support
- Offer expiration system
- Status tracking (pending, accepted, rejected, etc.)

### 4. Messaging System
- Direct communication between users
- Listing and offer-related messaging
- File attachment support
- Read/archive status tracking

### 5. Review and Rating System
- Bidirectional reviews (buyer ↔ carrier)
- 5-star rating system
- Automatic user rating calculation
- Review moderation support

### 6. Advertisement Platform
- Multiple ad types (banner, featured, sponsored)
- Targeting system (audience, location, category)
- Budget and performance tracking
- Campaign management

### 7. Transaction Management
- Complete payment flow tracking
- Platform fee calculation
- Delivery tracking with GPS updates
- Dispute resolution support

### 8. Notification System
- Multi-channel notifications (in-app, email, SMS, push)
- Categorized notifications
- Read/unread status tracking
- Action URL support

## Testing the Schema

### 1. Create Test Data
```sql
-- Test user profile
INSERT INTO user_profiles (id, full_name, email, user_type)
VALUES ('test-uuid', 'Test User', 'test@example.com', 'both');

-- Test listing
INSERT INTO listings (user_id, listing_type, title, pickup_location, delivery_location)
VALUES ('test-uuid', 'shipment_request', 'Test Shipment', 'Istanbul', 'Ankara');
```

### 2. Test Relationships
```sql
-- Verify foreign keys work
SELECT l.title, p.full_name 
FROM listings l 
JOIN user_profiles p ON l.user_id = p.id;
```

### 3. Test RLS
```sql
-- Test as authenticated user
SET session.role = 'authenticated';
SET session.user_id = 'test-uuid';
SELECT * FROM user_profiles;
```

## Next Steps After Schema Implementation

1. **Update AuthContext**: Replace mock authentication with real Supabase auth
2. **Implement CRUD Operations**: Create services for each table
3. **Update Forms**: Map form fields to JSONB schema structure
4. **Test Real-time Features**: Implement Supabase real-time subscriptions
5. **File Upload Integration**: Connect forms to storage buckets
6. **Test RLS Policies**: Ensure security policies work as expected

## Troubleshooting

### Common Issues:
1. **Foreign Key Violations**: Ensure `auth.users` table has the referenced IDs
2. **RLS Policy Errors**: Check that policies match your authentication flow
3. **Index Creation Failures**: Some indexes might conflict with existing ones
4. **Storage Policy Issues**: Verify bucket permissions are set correctly

### Debug Commands:
```sql
-- Check foreign key constraints
SELECT * FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY';

-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables WHERE schemaname = 'public';

-- Check storage buckets
SELECT * FROM storage.buckets;
```

This comprehensive schema provides a solid foundation for your Kargo Market platform with proper relationships, security, and scalability features.
