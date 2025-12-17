import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { hexToHsl, hslToHex, isValidHex } from "@/lib/colorUtils";
export type CardLayout = "left" | "right" | "left-bordered" | "right-bordered" | "left-filled" | "right-filled";

export interface CustomFont {
  name: string;
  url: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

export interface DesignConfig {
  logo: string;
  storeName: string;
  storeDescription: string;
  socialLinks: SocialLink[];
  primaryColor: string;
  backgroundColor: string;
  cardBackground: string;
  accentColor: string;
  borderColor: string;
  textColor: string;
  headingColor: string;
  mutedTextColor: string;
  fontDisplay: string;
  fontBody: string;
  fontPrice: string;
  fontButton: string;
  fontNav: string;
  cardLayout: CardLayout;
  customFonts: CustomFont[];
}

const defaultDesign: DesignConfig = {
  logo: "",
  storeName: "Shake Yes",
  storeDescription: "Personalizamos o copo com o seu nome!",
  socialLinks: [],
  primaryColor: "340 75% 65%",
  backgroundColor: "15 60% 95%",
  cardBackground: "0 0% 100%",
  accentColor: "340 70% 55%",
  borderColor: "340 30% 80%",
  textColor: "340 30% 20%",
  headingColor: "340 40% 25%",
  mutedTextColor: "340 20% 50%",
  fontDisplay: "Pacifico",
  fontBody: "Poppins",
  fontPrice: "Poppins",
  fontButton: "Poppins",
  fontNav: "Poppins",
  cardLayout: "left-filled",
  customFonts: [],
};

interface DesignContextType {
  design: DesignConfig;
  loading: boolean;
  updateDesign: (updates: Partial<DesignConfig>) => void;
  resetDesign: () => void;
  addCustomFont: (font: CustomFont) => void;
  removeCustomFont: (fontName: string) => void;
  getAllFonts: () => string[];
}

const DesignContext = createContext<DesignContextType | undefined>(undefined);

const loadCustomFont = (font: CustomFont) => {
  const existingLink = document.querySelector(`link[data-font="${font.name}"]`);
  if (!existingLink) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = font.url;
    link.setAttribute("data-font", font.name);
    document.head.appendChild(link);
  }
};

const unloadCustomFont = (fontName: string) => {
  const link = document.querySelector(`link[data-font="${fontName}"]`);
  if (link) {
    link.remove();
  }
};

const applyDesignToDOM = (design: DesignConfig) => {
  const root = document.documentElement;
  root.style.setProperty("--brand-pink", design.primaryColor);
  root.style.setProperty("--background", design.backgroundColor);
  root.style.setProperty("--card", design.cardBackground);
  root.style.setProperty("--primary", design.accentColor);
  root.style.setProperty("--border", design.borderColor);
  root.style.setProperty("--foreground", design.textColor);
  root.style.setProperty("--heading", design.headingColor);
  root.style.setProperty("--muted-foreground", design.mutedTextColor);

  design.customFonts.forEach(loadCustomFont);
  const allFonts = [design.fontDisplay, design.fontBody, design.fontPrice, design.fontButton, design.fontNav];
  allFonts.forEach(fontName => {
    const customFont = design.customFonts.find(f => f.name === fontName);
    if (customFont) loadCustomFont(customFont);
  });

  root.style.setProperty("--font-display", `"${design.fontDisplay}", cursive`);
  root.style.setProperty("--font-body", `"${design.fontBody}", sans-serif`);
  root.style.setProperty("--font-price", `"${design.fontPrice || design.fontBody}", sans-serif`);
  root.style.setProperty("--font-button", `"${design.fontButton || design.fontBody}", sans-serif`);
  root.style.setProperty("--font-nav", `"${design.fontNav || design.fontBody}", sans-serif`);
};

export const DesignProvider = ({ children }: { children: ReactNode }) => {
  const [design, setDesign] = useState<DesignConfig>(defaultDesign);
  const [loading, setLoading] = useState(true);

  // Helper to convert DB color (HEX) to HSL for the app
  const convertColorFromDb = (dbColor: string | null, defaultColor: string): string => {
    if (!dbColor) return defaultColor;
    // If it's already HSL format (contains %), return as-is
    if (dbColor.includes('%')) return dbColor;
    // If it's HEX, convert to HSL
    if (isValidHex(dbColor)) return hexToHsl(dbColor);
    return defaultColor;
  };

  // Load from Supabase on mount
  useEffect(() => {
    const loadDesign = async () => {
      try {
        const { data, error } = await supabase
          .from("design_config")
          .select("*")
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          const loadedDesign: DesignConfig = {
            logo: data.logo_url || "",
            storeName: data.store_name || defaultDesign.storeName,
            storeDescription: data.store_description || defaultDesign.storeDescription,
            socialLinks: (data.social_links as unknown as SocialLink[]) || [],
            primaryColor: convertColorFromDb(data.primary_color, defaultDesign.primaryColor),
            backgroundColor: convertColorFromDb(data.background_color, defaultDesign.backgroundColor),
            cardBackground: convertColorFromDb(data.card_background, defaultDesign.cardBackground),
            accentColor: convertColorFromDb(data.accent_color, defaultDesign.accentColor),
            borderColor: convertColorFromDb(data.border_color, defaultDesign.borderColor),
            textColor: convertColorFromDb(data.text_color, defaultDesign.textColor),
            headingColor: convertColorFromDb(data.heading_color, defaultDesign.headingColor),
            mutedTextColor: convertColorFromDb(data.muted_color, defaultDesign.mutedTextColor),
            fontDisplay: data.display_font || defaultDesign.fontDisplay,
            fontBody: data.body_font || defaultDesign.fontBody,
            fontPrice: data.price_font || defaultDesign.fontPrice,
            fontButton: data.button_font || defaultDesign.fontButton,
            fontNav: data.nav_font || defaultDesign.fontNav,
            cardLayout: defaultDesign.cardLayout,
            customFonts: [],
          };
          
          if (data.custom_font_name && data.custom_font_url) {
            loadedDesign.customFonts = [{ name: data.custom_font_name, url: data.custom_font_url }];
          }
          
          setDesign(loadedDesign);
          applyDesignToDOM(loadedDesign);
        }
      } catch (error) {
        console.error("Error loading design:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDesign();
  }, []);

  // Apply design changes to DOM
  useEffect(() => {
    if (!loading) {
      applyDesignToDOM(design);
    }
  }, [design, loading]);

  // Helper to convert HSL color to HEX for DB storage
  const convertColorToDb = (hslColor: string): string => {
    // If it already starts with #, it's HEX
    if (hslColor.startsWith('#')) return hslColor;
    // If it contains %, convert HSL to HEX
    if (hslColor.includes('%')) return hslToHex(hslColor);
    return hslColor;
  };

  const updateDesign = async (updates: Partial<DesignConfig>) => {
    const newDesign = { ...design, ...updates };
    setDesign(newDesign);

    // Save to Supabase - convert HSL colors to HEX for storage
    const dbUpdates: Record<string, unknown> = {};
    if (updates.logo !== undefined) dbUpdates.logo_url = updates.logo;
    if (updates.storeName !== undefined) dbUpdates.store_name = updates.storeName;
    if (updates.storeDescription !== undefined) dbUpdates.store_description = updates.storeDescription;
    if (updates.socialLinks !== undefined) dbUpdates.social_links = updates.socialLinks;
    if (updates.primaryColor !== undefined) dbUpdates.primary_color = convertColorToDb(updates.primaryColor);
    if (updates.backgroundColor !== undefined) dbUpdates.background_color = convertColorToDb(updates.backgroundColor);
    if (updates.cardBackground !== undefined) dbUpdates.card_background = convertColorToDb(updates.cardBackground);
    if (updates.accentColor !== undefined) dbUpdates.accent_color = convertColorToDb(updates.accentColor);
    if (updates.borderColor !== undefined) dbUpdates.border_color = convertColorToDb(updates.borderColor);
    if (updates.textColor !== undefined) dbUpdates.text_color = convertColorToDb(updates.textColor);
    if (updates.headingColor !== undefined) dbUpdates.heading_color = convertColorToDb(updates.headingColor);
    if (updates.mutedTextColor !== undefined) dbUpdates.muted_color = convertColorToDb(updates.mutedTextColor);
    if (updates.fontDisplay !== undefined) dbUpdates.display_font = updates.fontDisplay;
    if (updates.fontBody !== undefined) dbUpdates.body_font = updates.fontBody;
    if (updates.fontPrice !== undefined) dbUpdates.price_font = updates.fontPrice;
    if (updates.fontButton !== undefined) dbUpdates.button_font = updates.fontButton;
    if (updates.fontNav !== undefined) dbUpdates.nav_font = updates.fontNav;

    if (Object.keys(dbUpdates).length > 0) {
      await supabase
        .from("design_config")
        .update(dbUpdates)
        .eq("id", (await supabase.from("design_config").select("id").limit(1).single()).data?.id);
    }
  };

  const resetDesign = async () => {
    setDesign(defaultDesign);
    applyDesignToDOM(defaultDesign);
    
    const { data } = await supabase.from("design_config").select("id").limit(1).single();
    if (data) {
      await supabase.from("design_config").update({
        logo_url: null,
        store_name: defaultDesign.storeName,
        store_description: defaultDesign.storeDescription,
        social_links: [],
        primary_color: convertColorToDb(defaultDesign.primaryColor),
        background_color: convertColorToDb(defaultDesign.backgroundColor),
        card_background: convertColorToDb(defaultDesign.cardBackground),
        accent_color: convertColorToDb(defaultDesign.accentColor),
        border_color: convertColorToDb(defaultDesign.borderColor),
        text_color: convertColorToDb(defaultDesign.textColor),
        heading_color: convertColorToDb(defaultDesign.headingColor),
        muted_color: convertColorToDb(defaultDesign.mutedTextColor),
        display_font: defaultDesign.fontDisplay,
        body_font: defaultDesign.fontBody,
        price_font: defaultDesign.fontPrice,
        button_font: defaultDesign.fontButton,
        nav_font: defaultDesign.fontNav,
        custom_font_name: null,
        custom_font_url: null,
      }).eq("id", data.id);
    }
  };

  const addCustomFont = async (font: CustomFont) => {
    if (design.customFonts.some((f) => f.name === font.name)) return;
    
    loadCustomFont(font);
    const newCustomFonts = [...design.customFonts, font];
    setDesign(prev => ({ ...prev, customFonts: newCustomFonts }));
    
    const { data } = await supabase.from("design_config").select("id").limit(1).single();
    if (data) {
      await supabase.from("design_config").update({
        custom_font_name: font.name,
        custom_font_url: font.url,
      }).eq("id", data.id);
    }
  };

  const removeCustomFont = (fontName: string) => {
    unloadCustomFont(fontName);
    setDesign(prev => ({
      ...prev,
      customFonts: prev.customFonts.filter((f) => f.name !== fontName),
      fontDisplay: prev.fontDisplay === fontName ? "Pacifico" : prev.fontDisplay,
      fontBody: prev.fontBody === fontName ? "Poppins" : prev.fontBody,
    }));
  };

  const getAllFonts = () => {
    const builtInFonts = ["Pacifico", "Poppins", "Roboto", "Inter", "Montserrat", "Open Sans", "Lato"];
    const customFontNames = design.customFonts.map((f) => f.name);
    return [...builtInFonts, ...customFontNames];
  };

  return (
    <DesignContext.Provider value={{ design, loading, updateDesign, resetDesign, addCustomFont, removeCustomFont, getAllFonts }}>
      {children}
    </DesignContext.Provider>
  );
};

export const useDesign = () => {
  const context = useContext(DesignContext);
  if (!context) {
    throw new Error("useDesign must be used within a DesignProvider");
  }
  return context;
};
