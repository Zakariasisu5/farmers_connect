
import React from "react";
import { Search, RefreshCw, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMarket, ghanaRegions } from "@/contexts/MarketContext";

const MarketFilters: React.FC = () => {
  const { t } = useLanguage();
  const { 
    searchTerm, 
    setSearchTerm, 
    region, 
    handleRegionChange, 
    refreshPrices, 
    isLoading,
    lastUpdated,
    filteredData
  } = useMarket();

  return (
    <div className="container px-4 pt-4 pb-2">
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <MapPin className="text-farm-earth" size={18} />
          {t("selectRegion")}
        </h2>
        <Select 
          value={region} 
          onValueChange={handleRegionChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("selectRegion")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allRegions")}</SelectItem>
            {ghanaRegions.map((region) => (
              <SelectItem key={region} value={region}>
                {region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
        <Input
          placeholder={t("searchCrops")}
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-muted-foreground">
          {filteredData.length} {filteredData.length === 1 ? t("result") : t("results")}
        </span>
        
        <div className="flex items-center gap-2">
          {!isLoading && (
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {t("lastUpdated")}: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <Button 
            variant="outline" 
            size="icon" 
            onClick={refreshPrices}
            disabled={isLoading}
            className="shrink-0 h-8 w-8"
            title={t("refreshPrices") || "Refresh prices"}
          >
            <RefreshCw size={16} className={`${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MarketFilters;
