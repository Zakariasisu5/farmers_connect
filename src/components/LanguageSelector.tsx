
import React from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { Languages } from "lucide-react";

const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
    { code: "fr", name: "Français" },
    { code: "sw", name: "Kiswahili" }
  ];

  return (
    <div className="language-selector">
      <div className="flex items-center gap-1">
        <Languages size={18} />
        <span className="text-sm font-medium">{language.toUpperCase()}</span>
      </div>
      
      <div className="language-options">
        {languages.map((lang) => (
          <div
            key={lang.code}
            className={`language-option ${language === lang.code ? "bg-muted" : ""}`}
            onClick={() => setLanguage(lang.code as "en" | "es" | "fr" | "sw")}
          >
            {lang.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;
