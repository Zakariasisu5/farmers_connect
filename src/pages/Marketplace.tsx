
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, MapPin, ArrowUp, ArrowDown, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import NavigationBar from "@/components/NavigationBar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMarket, ghanaRegions } from "@/contexts/MarketContext";
import CropListingCard from "@/components/marketplace/CropListingCard";
import { toast } from "sonner";

const Marketplace: React.FC = () => {
  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [region, setRegion] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Fetch crop listings
  const { data: listings, isLoading, refetch } = useQuery({
    queryKey: ["cropListings", sortBy],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("crop_listings")
          .select("*")
          .eq("is_available", true)
          .order("created_at", { ascending: sortBy === "oldest" });
          
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error("Error fetching listings:", error);
        toast.error(t("errorFetchingListings"));
        return [];
      }
    },
    staleTime: 30000, // Cache for 30 seconds
    refetchOnWindowFocus: false
  });

  // Filter listings based on search term and selected region
  const filteredListings = listings?.filter(listing => {
    const matchesSearch = searchTerm.trim() === "" || 
      listing.crop_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRegion = region === "all" || listing.location === region;
    
    return matchesSearch && matchesRegion;
  });

  return (
    <div className="pb-20 min-h-screen bg-background">
      {/* Header (match footer colors) */}
      <div className="bg-background border-b border-border p-4 text-primary shadow-sm">
        <div className="container px-4 mx-auto">
          <h1 className="text-xl font-bold">{t("marketplace")}</h1>
          <p className="text-sm mt-1 text-muted-foreground">{t("buyFromFarmers")}</p>
        </div>
      </div>

      {/* Authentication Banner (if not logged in) */}
      {!isAuthenticated && (
        <div className="bg-muted p-4 border-b">
          <div className="container px-4 mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h3 className="font-medium">{t("loginToContact")}</h3>
              <p className="text-sm text-muted-foreground">{t("loginToContactDesc")}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate("/register")}>
                {t("register")}
              </Button>
              <Button onClick={() => navigate("/login")}>
                {t("login")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="container px-4 py-4 mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{t("availableCrops")}</h2>
          {isAuthenticated && (
            <Button onClick={() => navigate("/marketplace/post")} size="sm" className="gap-1">
              <Plus size={16} /> {t("postCrop")}
            </Button>
          )}
        </div>

        <div className="space-y-3 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder={t("searchCrops")}
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("selectRegion")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allRegions")}</SelectItem>
                  {ghanaRegions.map((region) => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("sortBy")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">{t("newest")} <ArrowDown size={14} className="ml-1 inline" /></SelectItem>
                  <SelectItem value="oldest">{t("oldest")} <ArrowUp size={14} className="ml-1 inline" /></SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-muted-foreground mb-4">
          {filteredListings?.length || 0} {filteredListings?.length === 1 ? t("result") : t("results")}
        </div>

        {/* Listings */}
        {isLoading ? (
          <div className="py-10 text-center text-muted-foreground">{t("loading")}</div>
        ) : filteredListings?.length === 0 ? (
          <div className="py-10 text-center">
            <ShoppingCart size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t("noListingsFound")}</p>
            {isAuthenticated && (
              <Button 
                onClick={() => navigate("/marketplace/post")} 
                variant="outline" 
                className="mt-4"
              >
                {t("postYourCrops")}
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredListings?.map((listing) => (
              <CropListingCard 
                key={listing.id} 
                listing={listing} 
                onUpdate={refetch} 
                onChat={() => navigate(`/chats/${listing.user_id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <NavigationBar />
    </div>
  );
};

export default Marketplace;
