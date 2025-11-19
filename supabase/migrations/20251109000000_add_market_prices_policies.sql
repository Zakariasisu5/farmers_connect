-- Add INSERT and DELETE policies for market_prices table
-- This allows the system to update market prices from external APIs

-- Allow authenticated users to insert market prices (for system updates)
CREATE POLICY "Authenticated users can insert market prices"
  ON public.market_prices FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to delete old market prices (for system cleanup)
CREATE POLICY "Authenticated users can delete market prices"
  ON public.market_prices FOR DELETE
  TO authenticated
  USING (true);

-- Allow authenticated users to update market prices (for system updates)
CREATE POLICY "Authenticated users can update market prices"
  ON public.market_prices FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

