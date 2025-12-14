import { useState, useEffect } from "react";
import { hexToHsl, hslToHex, isValidHex, normalizeHex } from "@/lib/colorUtils";

interface ColorPickerProps {
  label: string;
  hslValue: string;
  onChange: (hslValue: string) => void;
}

export const ColorPicker = ({ label, hslValue, onChange }: ColorPickerProps) => {
  const [hexValue, setHexValue] = useState(() => hslToHex(hslValue));
  const [inputValue, setInputValue] = useState(hexValue);

  useEffect(() => {
    const newHex = hslToHex(hslValue);
    setHexValue(newHex);
    setInputValue(newHex);
  }, [hslValue]);

  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    setHexValue(hex);
    setInputValue(hex);
    onChange(hexToHsl(hex));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (isValidHex(value)) {
      const normalizedHex = normalizeHex(value);
      setHexValue(normalizedHex);
      onChange(hexToHsl(normalizedHex));
    }
  };

  return (
    <div>
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="flex gap-2 mt-1">
        <input
          type="color"
          value={hexValue}
          onChange={handleColorPickerChange}
          className="w-12 h-10 rounded-lg border border-border cursor-pointer"
        />
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="#ec4899"
          className="flex-1 p-3 rounded-xl border border-border bg-background text-foreground uppercase"
          maxLength={7}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Formato HEX (ex: #ec4899)
      </p>
    </div>
  );
};

export default ColorPicker;
