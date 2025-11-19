
import { useState, useEffect } from "react";
import { fetchWeatherData, WeatherData } from "@/services/WeatherService";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface UseWeatherResult {
  weatherData: WeatherData[] | null;
  isLoading: boolean;
  error: string | null;
  refreshWeather: () => Promise<void>;
}

export const useWeather = (locations: string[]): UseWeatherResult => {
  const [weatherData, setWeatherData] = useState<WeatherData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Log user activity
  const logUserActivity = async (activityType: string, details?: any) => {
    if (!user) return;
    
    try {
      await supabase.from('user_activities').insert({
        user_id: user.id,
        activity_type: activityType,
        activity_details: details || {}
      });
    } catch (error) {
      console.error("Failed to log weather activity:", error);
    }
  };

  // Function to fetch weather data
  const loadWeatherData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const weatherPromises = locations.map(location => fetchWeatherData(location));
      const weatherResults = await Promise.all(weatherPromises);
      const validWeatherData = weatherResults.filter(data => data !== null) as WeatherData[];
      
      setWeatherData(validWeatherData);
      
      // Log activity
      if (user) {
        logUserActivity("check_weather", { 
          locations,
          timestamp: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error("Error fetching weather data:", err);
      setError("Failed to load weather data");
    } finally {
      setIsLoading(false);
    }
  };

  // Load weather data on initial render
  useEffect(() => {
    loadWeatherData();
    
    // Set up auto-refresh interval (every 30 minutes)
    const intervalId = setInterval(() => {
      loadWeatherData();
    }, 30 * 60 * 1000);
    
    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [JSON.stringify(locations)]); // Re-run when locations change
  
  const refreshWeather = async () => {
    await loadWeatherData();
  };

  return {
    weatherData,
    isLoading,
    error,
    refreshWeather
  };
};
