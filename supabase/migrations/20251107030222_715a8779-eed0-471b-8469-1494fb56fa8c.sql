-- Drop all policies on conversations and conversation_participants first
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can add participants to conversations" ON public.conversation_participants;

-- Drop function with CASCADE
DROP FUNCTION IF EXISTS public.is_conversation_participant(uuid, uuid) CASCADE;

-- Recreate the function with correct parameter names
CREATE FUNCTION public.is_conversation_participant(p_conv_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.conversation_participants cp
    WHERE cp.conversation_id = p_conv_id
      AND cp.user_id = p_user_id
  );
$$;

-- Recreate all necessary policies

-- Policies for conversations table
CREATE POLICY "Users can create conversations"
  ON public.conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view their conversations"
  ON public.conversations
  FOR SELECT
  TO authenticated
  USING (public.is_conversation_participant(id, auth.uid()));

-- Policies for conversation_participants table
CREATE POLICY "Users can view participants of their conversations"
  ON public.conversation_participants
  FOR SELECT
  TO authenticated
  USING (public.is_conversation_participant(conversation_id, auth.uid()));

CREATE POLICY "Users can add participants to conversations"
  ON public.conversation_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (true);