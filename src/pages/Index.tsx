
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Calendar, MapPin } from "lucide-react";
import WeatherCard from "../components/WeatherCard";
import MarketPriceCard from "../components/MarketPriceCard";
import NavigationBar from "../components/NavigationBar";
import LanguageSelector from "../components/LanguageSelector";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { useWeather } from "@/hooks/useWeather";
import { useMarket } from "@/contexts/MarketContext";
import { MarketProvider } from "@/contexts/MarketContext";

const IndexContent: React.FC = () => {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const { region: selectedRegion } = useMarket();
  const navigate = useNavigate();
  
  // Use selected region from MarketContext, or default to user's profile region
  const displayRegion = selectedRegion !== "all" ? selectedRegion : (profile?.region || "Central Region");
  const userRegion = displayRegion;
  
  // Use the weather hook to fetch data
  const { weatherData, isLoading: weatherLoading, refreshWeather } = useWeather([
    userRegion, 
    userRegion === "Greater Accra" ? "Central Region" : "Greater Accra" // Show user's region + another region
  ]);

  return (
    <div className="pb-20 min-h-screen bg-background">
      {/* Header (styled to match footer) */}
      <div className="bg-background border-b border-border p-4 text-primary shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Farmer Focus Connect</h1>
            {profile && (
              <div className="flex items-center text-sm mt-1 gap-1 text-muted-foreground">
                <MapPin size={14} />
                <span>{displayRegion}</span>
              </div>
            )}
          </div>
          <LanguageSelector />
        </div>
      </div>

      {/* Main Content */}
      <div className="container px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="text-farm-earth" />
            {t("weatherForecast")}
          </h2>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-farm-sky flex items-center gap-1" 
            onClick={refreshWeather}
            disabled={weatherLoading}
          >
            <RefreshCw size={16} className={weatherLoading ? "animate-spin" : ""} />
            {t("today")}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {weatherData && weatherData.length > 0 ? (
            weatherData.map((weather, index) => (
              <WeatherCard
                key={index}
                day={index === 0 ? t("today") : t("tomorrow")}
                condition={weather.condition}
                temperature={weather.temperature}
                humidity={weather.humidity}
              />
            ))
          ) : (
            // Fallback while loading
            Array(2).fill(0).map((_, index) => (
              <WeatherCard
                key={index}
                day={index === 0 ? t("today") : t("tomorrow")}
                condition="sunny"
                temperature={28}
                humidity={65}
              />
            ))
          )}
        </div>

        <MarketPricesSection navigate={navigate} />
      </div>

      {/* Bottom Navigation */}
      <NavigationBar />
    </div>
  );
};

const Index: React.FC = () => {
  return (
    <MarketProvider>
      <IndexContent />
    </MarketProvider>
  );
};

// Extract the Market Prices section into a separate component
const MarketPricesSection: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const { t } = useLanguage();
  const { filteredData: marketData, refreshPrices, isLoading: marketLoading } = useMarket();

  // Get top 2 market items
  const topMarketItems = marketData.slice(0, 2);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          {t("marketPrices")}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 text-farm-sky flex items-center gap-1" 
            onClick={refreshPrices}
            disabled={marketLoading}
          >
            <RefreshCw size={14} className={marketLoading ? "animate-spin" : ""} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {topMarketItems.length > 0 ? (
          topMarketItems.map((market, index) => (
            <MarketPriceCard
              key={index}
              crop={market.crop}
              price={market.price}
              unit={market.unit}
              change={market.change}
              region={market.region}
              isRealTime={true}
            />
          ))
        ) : (
          // Fallback data while loading
          [
            {
              crop: "Maize",
              price: 12.45,
              unit: "kg",
              change: 0.3,
              region: "Central Region",
            },
            {
              crop: "Tomatoes",
              price: 8.75,
              unit: "kg",
              change: -0.5,
              region: "Eastern Region",
            }
          ].map((market, index) => (
            <MarketPriceCard
              key={index}
              crop={market.crop}
              price={market.price}
              unit={market.unit}
              change={market.change}
              region={market.region}
            />
          ))
        )}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-2"
          onClick={() => navigate('/market')}
        >
          {t("viewAllPrices")}
        </Button>
      </CardContent>
    </Card>
  );
};

export default Index;
