-- Fix weather_forecasts and market_prices RLS policies to allow system data generation
DROP POLICY IF EXISTS "Service role can insert weather forecasts" ON public.weather_forecasts;
DROP POLICY IF EXISTS "Service role can insert market prices" ON public.market_prices;

-- Allow authenticated users to insert weather and market data (system-generated)
CREATE POLICY "Allow system weather data insertion"
ON public.weather_forecasts
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow system market data insertion"
ON public.market_prices
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Fix conversation_participants RLS policy to avoid infinite recursion
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON public.conversation_participants;

-- Create a security definer function to check conversation participation
CREATE OR REPLACE FUNCTION public.is_conversation_participant(conv_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM conversation_participants
    WHERE conversation_id = conv_id
      AND user_id = user_id
  );
$$;

-- Recreate the policy using the function
CREATE POLICY "Users can view participants of their conversations"
ON public.conversation_participants
FOR SELECT
TO authenticated
USING (public.is_conversation_participant(conversation_id, auth.uid()));