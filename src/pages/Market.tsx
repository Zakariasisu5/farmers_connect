
import React from "react";
import NavigationBar from "@/components/NavigationBar";
import { MarketProvider } from "@/contexts/MarketContext";
import MarketHeader from "@/components/market/MarketHeader";
import MarketFilters from "@/components/market/MarketFilters";
import MarketPricesList from "@/components/market/MarketPricesList";

const Market: React.FC = () => {
  return (
    <MarketProvider>
      <div className="pb-20 min-h-screen bg-background">
        {/* Header Component */}
        <MarketHeader />
        
        {/* Filters Component */}
        <MarketFilters />
        
        {/* Market Prices List Component */}
        <MarketPricesList />
        
        {/* Bottom Navigation */}
        <NavigationBar />
      </div>
    </MarketProvider>
  );
};

export default Market;
