
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MarketPriceProps {
  crop: string;
  price: number;
  unit: string;
  change: number;
  region: string;
  isRealTime?: boolean;
}

const MarketPriceCard: React.FC<MarketPriceProps> = ({
  crop,
  price,
  unit,
  change,
  region,
  isRealTime = true
}) => {
  const isPositive = change > 0;
  const changeAbs = Math.abs(change);
  
  return (
    <Card className="w-full hover:shadow-md transition-shadow border-l-4 border-l-farm-sky">
      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg truncate">{crop}</h3>
              {isRealTime && (
                <Badge variant="secondary" className="text-xs bg-farm-green/10 text-farm-green border-farm-green/20">
                  Live
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="truncate">{region}</span>
            </p>
          </div>
          
          <div className="text-right flex-shrink-0">
            <div className="text-xl font-bold text-farm-sky mb-1">
              GH₵{price.toFixed(2)}
              <span className="text-sm font-normal text-muted-foreground">/{unit}</span>
            </div>
            
            <div 
              className={`flex items-center justify-end gap-1 text-sm font-medium ${
                isPositive ? "text-farm-green" : "text-destructive"
              }`}
            >
              {changeAbs > 0.5 ? (
                isPositive ? (
                  <TrendingUp size={14} className="shrink-0" />
                ) : (
                  <TrendingDown size={14} className="shrink-0" />
                )
              ) : (
                isPositive ? (
                  <ArrowUp size={14} className="shrink-0" />
                ) : (
                  <ArrowDown size={14} className="shrink-0" />
                )
              )}
              <span>
                {isPositive ? '+' : ''}{change.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketPriceCard;
