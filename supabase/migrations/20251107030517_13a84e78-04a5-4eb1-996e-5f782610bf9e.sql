-- Expand insert policy to cover possible anon role during edge cases
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='conversations' AND policyname='Users can create conversations'
  ) THEN
    ALTER POLICY "Users can create conversations"
      ON public.conversations
      TO authenticated, anon;
  ELSE
    CREATE POLICY "Users can create conversations"
      ON public.conversations
      FOR INSERT
      TO authenticated, anon
      WITH CHECK (true);
  END IF;
END $$;