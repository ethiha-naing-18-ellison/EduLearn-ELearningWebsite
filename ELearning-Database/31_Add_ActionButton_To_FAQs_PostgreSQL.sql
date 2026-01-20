-- Add ActionButton column to FAQs table for quick navigation actions
-- This script adds support for action buttons in chat widget responses

-- Connect to the ELearning database
\c ELearning;

-- Add ActionButton column to FAQs table
-- This will store JSON data for action buttons: { "text": "Button Text", "path": "/route", "type": "navigation" }
ALTER TABLE "FAQs" 
ADD COLUMN IF NOT EXISTS "ActionButton" JSONB;

-- Add comment to explain the column
COMMENT ON COLUMN "FAQs"."ActionButton" IS 'JSON object containing action button data: {"text": "Button Text", "path": "/route", "type": "navigation"}';
