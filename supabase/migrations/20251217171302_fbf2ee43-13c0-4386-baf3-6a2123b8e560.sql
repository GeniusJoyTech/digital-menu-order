-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create enum for order status
CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'cancelled');

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Menu categories table
CREATE TABLE public.menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT DEFAULT '#ec4899',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Menu items table
CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.menu_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  stock INTEGER,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Checkout steps table
CREATE TABLE public.checkout_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  required BOOLEAN DEFAULT false,
  enabled BOOLEAN DEFAULT true,
  show_condition TEXT DEFAULT 'always',
  trigger_item_ids TEXT[] DEFAULT '{}',
  trigger_category_ids TEXT[] DEFAULT '{}',
  max_selections_enabled BOOLEAN DEFAULT false,
  max_selections INTEGER DEFAULT 1,
  pricing_rule JSONB,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Checkout step options table
CREATE TABLE public.checkout_step_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id UUID REFERENCES public.checkout_steps(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  is_linked_menu_item BOOLEAN DEFAULT false,
  linked_menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
  exclude_from_stock BOOLEAN DEFAULT false,
  track_stock BOOLEAN DEFAULT false,
  stock INTEGER,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Design configuration table (single row)
CREATE TABLE public.design_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name TEXT DEFAULT 'MilkShakes',
  store_description TEXT DEFAULT 'Personalizamos o copo com o seu nome!',
  logo_url TEXT,
  primary_color TEXT DEFAULT '#ec4899',
  background_color TEXT DEFAULT '#fdf2f8',
  card_background TEXT DEFAULT '#ffffff',
  accent_color TEXT DEFAULT '#f472b6',
  border_color TEXT DEFAULT '#fbcfe8',
  text_color TEXT DEFAULT '#1f2937',
  heading_color TEXT DEFAULT '#831843',
  muted_color TEXT DEFAULT '#6b7280',
  display_font TEXT DEFAULT 'Pacifico',
  body_font TEXT DEFAULT 'Poppins',
  price_font TEXT DEFAULT 'Poppins',
  button_font TEXT DEFAULT 'Poppins',
  nav_font TEXT DEFAULT 'Poppins',
  custom_font_name TEXT,
  custom_font_url TEXT,
  social_links JSONB DEFAULT '[]',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  table_number TEXT,
  delivery_type TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  extras JSONB DEFAULT '[]',
  drink TEXT,
  observations TEXT,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  status order_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkout_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkout_step_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Public read access for menu and design (customer-facing)
CREATE POLICY "Anyone can view categories" ON public.menu_categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view menu items" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "Anyone can view checkout steps" ON public.checkout_steps FOR SELECT USING (true);
CREATE POLICY "Anyone can view checkout options" ON public.checkout_step_options FOR SELECT USING (true);
CREATE POLICY "Anyone can view design config" ON public.design_config FOR SELECT USING (true);

-- Anyone can create orders (customers)
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);

-- Admin-only write access
CREATE POLICY "Admins can manage categories" ON public.menu_categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage menu items" ON public.menu_items FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage checkout steps" ON public.checkout_steps FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage checkout options" ON public.checkout_step_options FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage design config" ON public.design_config FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage orders" ON public.orders FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_menu_categories_updated_at BEFORE UPDATE ON public.menu_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_checkout_steps_updated_at BEFORE UPDATE ON public.checkout_steps FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_checkout_step_options_updated_at BEFORE UPDATE ON public.checkout_step_options FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_design_config_updated_at BEFORE UPDATE ON public.design_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default design config
INSERT INTO public.design_config (id) VALUES (gen_random_uuid());