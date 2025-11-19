-- Create community_posts table
CREATE TABLE public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view posts"
  ON public.community_posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create posts"
  ON public.community_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON public.community_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON public.community_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create market_prices table
CREATE TABLE public.market_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop TEXT NOT NULL,
  price NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  region TEXT NOT NULL,
  change NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view market prices"
  ON public.market_prices FOR SELECT
  TO authenticated
  USING (true);

-- Create weather_forecasts table
CREATE TABLE public.weather_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location TEXT NOT NULL,
  condition TEXT NOT NULL,
  temperature NUMERIC NOT NULL,
  humidity NUMERIC,
  forecast_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.weather_forecasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view weather forecasts"
  ON public.weather_forecasts FOR SELECT
  TO authenticated
  USING (true);

-- Create triggers for updated_at
CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_market_prices_updated_at
  BEFORE UPDATE ON public.market_prices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_weather_forecasts_updated_at
  BEFORE UPDATE ON public.weather_forecasts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get unread message count
CREATE OR REPLACE FUNCTION public.get_unread_message_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.messages m
  JOIN public.conversation_participants cp ON m.conversation_id = cp.conversation_id
  WHERE cp.user_id = p_user_id
    AND m.user_id != p_user_id
    AND m.read = false;
$$;