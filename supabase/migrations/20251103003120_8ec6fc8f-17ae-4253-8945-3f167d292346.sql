-- Add INSERT policies for weather_forecasts (for system data generation)
CREATE POLICY "Service role can insert weather forecasts"
ON public.weather_forecasts
FOR INSERT
TO service_role
WITH CHECK (true);

-- Add INSERT policies for market_prices (for system data generation)
CREATE POLICY "Service role can insert market prices"
ON public.market_prices
FOR INSERT
TO service_role
WITH CHECK (true);