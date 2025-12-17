import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

export interface DesignConfig {
  id: string;
  store_name: string;
  store_description: string;
  logo_url: string | null;
  primary_color: string;
  background_color: string;
  card_background: string;
  accent_color: string;
  border_color: string;
  text_color: string;
  heading_color: string;
  muted_color: string;
  display_font: string;
  body_font: string;
  price_font: string;
  button_font: string;
  nav_font: string;
  custom_font_name: string | null;
  custom_font_url: string | null;
  social_links: SocialLink[];
}

const defaultDesign: Omit<DesignConfig, "id"> = {
  store_name: "MilkShakes",
  store_description: "Personalizamos o copo com o seu nome!",
  logo_url: null,
  primary_color: "#ec4899",
  background_color: "#fdf2f8",
  card_background: "#ffffff",
  accent_color: "#f472b6",
  border_color: "#fbcfe8",
  text_color: "#1f2937",
  heading_color: "#831843",
  muted_color: "#6b7280",
  display_font: "Pacifico",
  body_font: "Poppins",
  price_font: "Poppins",
  button_font: "Poppins",
  nav_font: "Poppins",
  custom_font_name: null,
  custom_font_url: null,
  social_links: [],
};

export const useSupabaseDesign = () => {
  const [design, setDesign] = useState<DesignConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDesign = useCallback(async () => {
    const { data, error } = await supabase
      .from("design_config")
      .select("*")
      .limit(1)
      .maybeSingle();
    
    if (!error && data) {
      setDesign({
        ...data,
        social_links: (data.social_links as unknown as SocialLink[]) || [],
      });
    }
    setLoading(false);
    return data;
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    await fetchDesign();
  }, [fetchDesign]);

  useEffect(() => {
    fetchDesign();
  }, [fetchDesign]);

  const updateDesign = async (updates: Partial<Omit<DesignConfig, "id">>) => {
    if (!design?.id) return { error: { message: "No design config found" } };

    const { social_links, ...rest } = updates;
    const updateData = {
      ...rest,
      ...(social_links !== undefined && { social_links: social_links as any }),
    };
    const { error } = await supabase
      .from("design_config")
      .update(updateData)
      .eq("id", design.id);
    
    if (!error) {
      setDesign(prev => prev ? { ...prev, ...updates } : null);
    }
    return { error };
  };

  const resetDesign = async () => {
    if (!design?.id) return { error: { message: "No design config found" } };

    const { social_links, ...rest } = defaultDesign;
    const updateData = {
      ...rest,
      social_links: social_links as any,
    };
    const { error } = await supabase
      .from("design_config")
      .update(updateData)
      .eq("id", design.id);
    
    if (!error) {
      setDesign(prev => prev ? { ...prev, ...defaultDesign } : null);
    }
    return { error };
  };

  return {
    design,
    loading,
    reload,
    updateDesign,
    resetDesign,
    defaultDesign,
  };
};
