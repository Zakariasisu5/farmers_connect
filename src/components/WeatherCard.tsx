
import React from "react";
import { CloudSun, CloudRain } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "../contexts/LanguageContext";

interface WeatherProps {
  day: string;
  condition: "sunny" | "cloudy" | "rainy";
  temperature: number;
  humidity: number;
}

const WeatherCard: React.FC<WeatherProps> = ({
  day,
  condition,
  temperature,
  humidity
}) => {
  const { t } = useLanguage();
  
  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">{day}</h3>
          <div className="flex items-center gap-1 text-farm-sky-dark">
            {condition === "rainy" ? (
              <CloudRain size={24} />
            ) : (
              <CloudSun size={24} />
            )}
          </div>
        </div>
        
        <div className="mt-2">
          <div className="text-2xl font-bold">{temperature}°C</div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <span>💧 {humidity}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherCard;
