-- Add new enum value (must be committed first before use)
ALTER TYPE project_status ADD VALUE IF NOT EXISTS 'pending_approval';