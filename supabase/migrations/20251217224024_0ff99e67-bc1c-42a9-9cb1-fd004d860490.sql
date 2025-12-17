-- Add prices_json column to store multiple prices as JSONB
ALTER TABLE public.menu_items 
ADD COLUMN IF NOT EXISTS prices_json JSONB DEFAULT '[]'::jsonb;

-- Update existing items to have prices_json based on current price
UPDATE public.menu_items 
SET prices_json = jsonb_build_array(
  jsonb_build_object('size', 'Único', 'price', price)
)
WHERE prices_json = '[]'::jsonb OR prices_json IS NULL;