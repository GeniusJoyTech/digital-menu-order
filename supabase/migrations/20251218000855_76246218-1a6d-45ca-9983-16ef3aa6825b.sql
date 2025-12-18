-- Add whatsapp_number column to design_config table
ALTER TABLE public.design_config 
ADD COLUMN whatsapp_number text DEFAULT '15998343599';

-- Update existing records to have the new number
UPDATE public.design_config 
SET whatsapp_number = '15998343599' 
WHERE whatsapp_number IS NULL;