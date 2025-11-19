-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true);

-- RLS policies for product images
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their own product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create storage bucket for chat images
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-images', 'chat-images', true);

-- RLS policies for chat images
CREATE POLICY "Participants can view chat images"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-images');

CREATE POLICY "Authenticated users can upload chat images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'chat-images' 
  AND auth.uid() IS NOT NULL
);

-- Add image_url column to messages table
ALTER TABLE public.messages 
ADD COLUMN image_url TEXT;

-- Add function to delete conversation
CREATE OR REPLACE FUNCTION public.delete_conversation(p_conversation_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if user is a participant
  IF NOT is_conversation_participant(p_conversation_id, auth.uid()) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  -- Delete messages first (due to foreign key constraints)
  DELETE FROM public.messages WHERE conversation_id = p_conversation_id;
  
  -- Delete conversation participants
  DELETE FROM public.conversation_participants WHERE conversation_id = p_conversation_id;
  
  -- Delete conversation
  DELETE FROM public.conversations WHERE id = p_conversation_id;
END;
$$;