
import React, { createContext, useState, useContext, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLanguage } from "./LanguageContext";
import { useAuth } from "./AuthContext";
import { fetchMarketPrices } from "@/services/MarketService";
import { supabase } from "@/integrations/supabase/client";

// Define types for our market context
export interface MarketItem {
  crop: string;
  price: number;
  unit: string;
  change: number;
  region: string;
}

interface MarketContextType {
  marketData: MarketItem[];
  searchTerm: string;
  region: string;
  isLoading: boolean;
  lastUpdated: Date;
  filteredData: MarketItem[];
  setSearchTerm: (term: string) => void;
  setRegion: (region: string) => void;
  refreshPrices: () => void;
  handleRegionChange: (newRegion: string) => Promise<void>;
}

// All Ghana regions
export const ghanaRegions = [
  "Greater Accra",
  "Ashanti Region",
  "Northern Region",
  "Central Region",
  "Western Region",
  "Eastern Region",
  "Volta Region",
  "Upper East Region",
  "Upper West Region",
  "Bono Region",
  "Ahafo Region",
  "Bono East Region",
  "North East Region",
  "Oti Region",
  "Savannah Region",
  "Western North Region"
];

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [region, setRegion] = useState("all");

  // Set default region based on user's saved preference if they're logged in
  useEffect(() => {
    if (profile?.region && ghanaRegions.includes(profile.region)) {
      setRegion(profile.region);
    }
  }, [profile]);

  // Track last updated time
  const [lastUpdatedTime, setLastUpdatedTime] = useState<Date>(new Date());

  // Use React Query for market data with caching
  const { data: marketData = [], isLoading, refetch } = useQuery({
    queryKey: ["marketPrices", region],
    queryFn: async () => {
      try {
        const data = await fetchMarketPrices(region !== "all" ? region : undefined);
        
        if (data && data.length > 0) {
          // Update last updated time
          setLastUpdatedTime(new Date());
          
          // Log user activity if user is logged in
          if (user) {
            logUserActivity("view_market_prices", { region });
          }
          return data;
        } else {
          toast.error(t("errorFetchingMarketData"));
          return [];
        }
      } catch (error) {
        console.error("Error loading market prices:", error);
        toast.error(t("errorFetchingMarketData"));
        return [];
      }
    },
    staleTime: 60000, // Cache for 1 minute
    refetchOnWindowFocus: false
  });
  
  // Function to log user activities
  const logUserActivity = async (activityType: string, details?: any) => {
    if (!user) return;
    
    try {
      await supabase.from('user_activities').insert({
        user_id: user.id,
        activity_type: activityType,
        activity_details: details || {}
      });
    } catch (error) {
      console.error("Failed to log user activity:", error);
    }
  };
  
  // Function to refresh market prices
  const refreshPrices = () => {
    // Log the refresh attempt
    logUserActivity("refresh_market_prices", { region });
    
    // Refetch using React Query
    refetch();
  };

  // Save user's region preference
  const handleRegionChange = async (newRegion: string) => {
    setRegion(newRegion);
    
    // Log the region change
    logUserActivity("change_market_region", { 
      previous_region: region,
      new_region: newRegion 
    });
    
    // Only save region preference if user is logged in and region is a specific region (not "all")
    if (user && newRegion !== "all") {
      try {
        toast.success(t("regionPreferenceUpdated"), {
          description: newRegion
        });
      } catch (error) {
        console.error("Error saving region preference:", error);
        toast.error(t("errorSavingPreference"));
      }
    }
  };

  const filteredData = marketData.filter((item) => {
    const matchesSearch = item.crop.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = region === "all" || item.region === region;
    return matchesSearch && matchesRegion;
  });

  return (
    <MarketContext.Provider
      value={{
        marketData,
        searchTerm,
        region,
        isLoading,
        lastUpdated: lastUpdatedTime,
        filteredData,
        setSearchTerm,
        setRegion,
        refreshPrices,
        handleRegionChange
      }}
    >
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => {
  const context = useContext(MarketContext);
  if (context === undefined) {
    throw new Error("useMarket must be used within a MarketProvider");
  }
  return context;
};
