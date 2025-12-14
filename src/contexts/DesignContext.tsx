import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type CardLayout = "left" | "right" | "left-bordered" | "right-bordered" | "left-filled" | "right-filled";

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
};

interface DesignContextType {
  design: DesignConfig;
  updateDesign: (updates: Partial<DesignConfig>) => void;
  resetDesign: () => void;
}

const DesignContext = createContext<DesignContextType | undefined>(undefined);

const STORAGE_KEY = "shake-yes-design";

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
  }, [design]);

  const updateDesign = (updates: Partial<DesignConfig>) => {
    setDesign((prev) => ({ ...prev, ...updates }));
  };

  const resetDesign = () => {
    setDesign(defaultDesign);
  };

  return (
    <DesignContext.Provider value={{ design, updateDesign, resetDesign }}>
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
