
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import MarketPriceCard from "@/components/MarketPriceCard";
import { useMarket } from "@/contexts/MarketContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown } from "lucide-react";

const MarketPricesList: React.FC = () => {
  const { filteredData, region, isLoading } = useMarket();
  const { t } = useLanguage();

  const isRegionSpecific = region !== "all";

  // Use card view for mobile screens and table view for larger screens
  return (
    <div className="container px-4 py-2 pb-20">
      {/* For mobile: Stack of cards */}
      <div className="md:hidden">
        <Card className="shadow-sm">
          <CardContent className="space-y-4 pt-4">
            {isLoading ? (
              <div className="text-center py-6 text-muted-foreground">
                {t("loading") || "Loading market prices..."}
              </div>
            ) : filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <MarketPriceCard
                  key={index}
                  crop={item.crop}
                  price={item.price}
                  unit={item.unit}
                  change={item.change}
                  region={item.region}
                  isRealTime={true}
                />
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                {t("noCropsFound")}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* For desktop: Table view */}
      <div className="hidden md:block">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("crop")}</TableHead>
                  <TableHead>{t("price")}</TableHead>
                  {!isRegionSpecific && <TableHead>{t("region")}</TableHead>}
                  <TableHead className="text-right">{t("change")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={isRegionSpecific ? 3 : 4} className="text-center py-6 text-muted-foreground">
                      {t("loading") || "Loading market prices..."}
                    </TableCell>
                  </TableRow>
                ) : filteredData.length > 0 ? (
                  filteredData.map((item, index) => {
                    const changeAbs = Math.abs(item.change);
                    const isPositive = item.change > 0;
                    return (
                      <TableRow key={index} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {item.crop}
                            <Badge variant="secondary" className="text-xs bg-farm-green/10 text-farm-green border-farm-green/20">
                              Live
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-farm-sky">
                          GH₵{item.price.toFixed(2)}/{item.unit}
                        </TableCell>
                        {!isRegionSpecific && <TableCell>{item.region}</TableCell>}
                        <TableCell className={`text-right font-medium ${isPositive ? 'text-farm-green' : 'text-destructive'}`}>
                          <div className="flex items-center justify-end gap-1">
                            {changeAbs > 0.5 ? (
                              isPositive ? (
                                <TrendingUp size={14} />
                              ) : (
                                <TrendingDown size={14} />
                              )
                            ) : (
                              isPositive ? (
                                <ArrowUp size={14} />
                              ) : (
                                <ArrowDown size={14} />
                              )
                            )}
                            <span>
                              {isPositive ? '+' : ''}{item.change?.toFixed(1)}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={isRegionSpecific ? 3 : 4} className="text-center py-6 text-muted-foreground">
                      {t("noCropsFound")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MarketPricesList;
