-- Create a safe helper to create or get a 1:1 conversation
CREATE OR REPLACE FUNCTION public.create_or_get_conversation(p_other_user uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_me uuid := auth.uid();
  v_conv uuid;
BEGIN
  IF v_me IS NULL THEN
    RAISE EXCEPTION 'authentication required';
  END IF;
  IF p_other_user IS NULL OR p_other_user = v_me THEN
    RAISE EXCEPTION 'invalid other user';
  END IF;

  -- Try to find existing conversation with both participants
  SELECT cp.conversation_id INTO v_conv
  FROM public.conversation_participants cp
  WHERE cp.user_id IN (v_me, p_other_user)
  GROUP BY cp.conversation_id
  HAVING COUNT(DISTINCT cp.user_id) = 2
  LIMIT 1;

  IF v_conv IS NOT NULL THEN
    RETURN v_conv;
  END IF;

  -- Create a new conversation and add both participants
  INSERT INTO public.conversations DEFAULT VALUES RETURNING id INTO v_conv;

  INSERT INTO public.conversation_participants (conversation_id, user_id)
  VALUES (v_conv, v_me), (v_conv, p_other_user);

  RETURN v_conv;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_or_get_conversation(uuid) TO authenticated;