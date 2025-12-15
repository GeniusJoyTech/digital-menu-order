import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type CardLayout = "left" | "right" | "left-bordered" | "right-bordered" | "left-filled" | "right-filled";

export interface CustomFont {
  name: string;
  url: string;
}

export interface DesignConfig {
  logo: string;
  storeName: string;
  primaryColor: string; // HSL values like "340 75% 65%"
  backgroundColor: string;
  cardBackground: string;
  accentColor: string;
  fontDisplay: string;
  fontBody: string;
  cardLayout: CardLayout;
  customFonts: CustomFont[];
}

const defaultDesign: DesignConfig = {
  logo: "",
  storeName: "Shake Yes",
  primaryColor: "340 75% 65%",
  backgroundColor: "15 60% 95%",
  cardBackground: "0 0% 100%",
  accentColor: "340 70% 55%",
  fontDisplay: "Pacifico",
  fontBody: "Poppins",
  cardLayout: "left-filled",
  customFonts: [],
};

interface DesignContextType {
  design: DesignConfig;
  updateDesign: (updates: Partial<DesignConfig>) => void;
  resetDesign: () => void;
  addCustomFont: (font: CustomFont) => void;
  removeCustomFont: (fontName: string) => void;
  getAllFonts: () => string[];
}

const DesignContext = createContext<DesignContextType | undefined>(undefined);

const STORAGE_KEY = "shake-yes-design";

// Load custom fonts into the document
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

export const DesignProvider = ({ children }: { children: ReactNode }) => {
  const [design, setDesign] = useState<DesignConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return { ...defaultDesign, ...JSON.parse(saved) };
      } catch {
        return defaultDesign;
      }
    }
    return defaultDesign;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(design));
    
    // Apply CSS variables dynamically
    const root = document.documentElement;
    root.style.setProperty("--brand-pink", design.primaryColor);
    root.style.setProperty("--background", design.backgroundColor);
    root.style.setProperty("--card", design.cardBackground);
    root.style.setProperty("--primary", design.accentColor);

    // Apply fonts dynamically
    root.style.setProperty("--font-display", `"${design.fontDisplay}", cursive`);
    root.style.setProperty("--font-body", `"${design.fontBody}", sans-serif`);

    // Load all custom fonts
    design.customFonts.forEach(loadCustomFont);
  }, [design]);

  const updateDesign = (updates: Partial<DesignConfig>) => {
    setDesign((prev) => ({ ...prev, ...updates }));
  };

  const resetDesign = () => {
    setDesign(defaultDesign);
  };

  const addCustomFont = (font: CustomFont) => {
    setDesign((prev) => {
      if (prev.customFonts.some((f) => f.name === font.name)) {
        return prev;
      }
      loadCustomFont(font);
      return { ...prev, customFonts: [...prev.customFonts, font] };
    });
  };

  const removeCustomFont = (fontName: string) => {
    setDesign((prev) => {
      unloadCustomFont(fontName);
      return {
        ...prev,
        customFonts: prev.customFonts.filter((f) => f.name !== fontName),
        fontDisplay: prev.fontDisplay === fontName ? "Pacifico" : prev.fontDisplay,
        fontBody: prev.fontBody === fontName ? "Poppins" : prev.fontBody,
      };
    });
  };

  const getAllFonts = () => {
    const builtInFonts = ["Pacifico", "Poppins", "Roboto", "Inter", "Montserrat", "Open Sans", "Lato"];
    const customFontNames = design.customFonts.map((f) => f.name);
    return [...builtInFonts, ...customFontNames];
  };

  return (
    <DesignContext.Provider value={{ design, updateDesign, resetDesign, addCustomFont, removeCustomFont, getAllFonts }}>
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
