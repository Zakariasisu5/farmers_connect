
import React from "react";
import { useMarket, ghanaRegions } from "@/contexts/MarketContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { MapPin, Clock, Radio } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import NotificationsDropdown from "@/components/NotificationsDropdown";
import { Badge } from "@/components/ui/badge";

const MarketHeader: React.FC = () => {
  const { t } = useLanguage();
  const { region, isLoading, lastUpdated } = useMarket();
  const { profile } = useAuth();
  
  // Get the display name for the region (showing user's profile region if "all" is selected)
  const displayRegion = region === "all" 
    ? (profile?.region || t("allRegions") || "All Regions")
    : region;
  
  // Calculate time since last update
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };
  
  return (
    <div className="bg-background border-b border-border p-4 text-primary shadow-sm">
      <div className="container px-4 mx-auto">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold">{t("marketPrices")}</h1>
              <Badge variant="secondary" className="text-xs bg-farm-green/10 text-farm-green border-farm-green/20 flex items-center gap-1">
                <Radio size={10} className="animate-pulse" />
                Real-time
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm mt-1 text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin size={14} />
                <span>{displayRegion}</span>
              </div>
              {!isLoading && (
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>Updated {getTimeAgo(lastUpdated)}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationsDropdown />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketHeader;
