
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface WeatherData {
  id?: string;
  location: string;
  condition: "sunny" | "cloudy" | "rainy";
  temperature: number;
  humidity: number;
  updated_at?: string;
}

export const fetchWeatherData = async (location: string): Promise<WeatherData | null> => {
  try {
    // First check if we have recent weather data for this location
    const { data, error } = await supabase
      .from('weather_forecasts')
      .select('*')
      .eq('location', location)
      .order('updated_at', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error("Error fetching weather data:", error);
      throw error;
    }
    
    // If we have recent data (less than 30 minutes old), return it
    if (data && data.length > 0) {
      const weatherData = data[0];
      const updatedAt = new Date(weatherData.updated_at);
      const now = new Date();
      const timeDiff = now.getTime() - updatedAt.getTime();
      
      // If data is less than 30 minutes old
      if (timeDiff < 30 * 60 * 1000) {
        return {
          id: weatherData.id,
          location: weatherData.location,
          condition: weatherData.condition as "sunny" | "cloudy" | "rainy",
          temperature: weatherData.temperature,
          humidity: weatherData.humidity,
          updated_at: weatherData.updated_at
        };
      }
    }
    
    // If no recent data or data is too old, fetch new data
    // For now, generate mock data
    const conditions: Array<"sunny" | "cloudy" | "rainy"> = ["sunny", "cloudy", "rainy"];
    const newWeatherData: WeatherData = {
      location,
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      temperature: Math.floor(Math.random() * 15) + 20, // Random between 20-35°C
      humidity: Math.floor(Math.random() * 40) + 40, // Random between 40-80%
    };
    
    // Store this new data
    const weatherWithDate = {
      ...newWeatherData,
      forecast_date: new Date().toISOString().split('T')[0]
    };
    
    const { data: insertedData, error: insertError } = await supabase
      .from('weather_forecasts')
      .insert([weatherWithDate])
      .select('*');
    
    if (insertError) {
      console.error("Error storing weather data:", insertError);
      throw insertError;
    }
    
    if (insertedData && insertedData.length > 0) {
      return {
        id: insertedData[0].id,
        location: insertedData[0].location,
        condition: insertedData[0].condition as "sunny" | "cloudy" | "rainy",
        temperature: insertedData[0].temperature,
        humidity: insertedData[0].humidity,
        updated_at: insertedData[0].updated_at
      };
    }
    
    return newWeatherData;
  } catch (error) {
    console.error("Weather service error:", error);
    toast.error("Could not update weather data");
    return null;
  }
};
