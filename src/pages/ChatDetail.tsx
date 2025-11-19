
import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Send, User, Loader2, Trash2, Image as ImageIcon, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { toast } from "sonner";

interface Message {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  created_at: string;
  read: boolean;
}

interface Participant {
  user_id: string;
}

const ChatDetail: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch conversation participants to get the other user's info
  const { data: chatInfo, isLoading: loadingParticipants } = useQuery({
    queryKey: ["chatParticipants", chatId],
    queryFn: async () => {
      try {
        if (!user || !chatId) throw new Error("Missing user or chat ID");
        
        // Get conversation participants
        const { data: participants, error } = await supabase
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', chatId);
          
        if (error) {
          console.error("Error fetching participants:", error);
          throw error;
        }
        
        // Find the other participant (not the current user)
        const otherParticipant = participants?.find(p => p.user_id !== user.id);
        
        if (!otherParticipant) {
          throw new Error("Could not find chat participant");
        }
        
        // Fetch other user's profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', otherParticipant.user_id)
          .single();
        
        if (profileError) {
          console.error("Error fetching profile:", profileError);
        }
        
        return {
          id: chatId,
          other_user_id: otherParticipant.user_id,
          other_user_name: profile?.name || "Unknown User"
        };
      } catch (error) {
        console.error("Error fetching chat info:", error);
        toast.error(t("errorLoadingChat"));
        return null;
      }
    },
    enabled: !!user && !!chatId && !!isAuthenticated
  });
  
  // Fetch messages for this chat
  const { data: messages, isLoading: loadingMessages } = useQuery({
    queryKey: ["chatMessages", chatId],
    queryFn: async () => {
      try {
        if (!chatId) return [];
        
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', chatId)
          .order('created_at', { ascending: true });
          
        if (error) throw error;
        
        // Mark messages as read when viewing the chat
        if (user && data) {
          await supabase
            .from('messages')
            .update({ read: true })
            .eq('conversation_id', chatId)
            .neq('user_id', user.id)
            .eq('read', false);
        }
        
        return data;
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error(t("errorLoadingMessages"));
        return [];
      }
    },
    enabled: !!chatId && !!chatInfo,
    refetchOnWindowFocus: false
  });
  
  // Delete conversation mutation
  const deleteConversationMutation = useMutation({
    mutationFn: async () => {
      if (!chatId) throw new Error("Missing chat ID");
      
      const { error } = await supabase.rpc('delete_conversation', {
        p_conversation_id: chatId
      });
        
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("chatDeleted"));
      navigate("/chats");
    },
    onError: (error) => {
      console.error("Error deleting conversation:", error);
      toast.error(t("errorDeletingChat"));
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, imageUrl }: { content: string; imageUrl?: string }) => {
      if (!user || !chatId) throw new Error("Missing user or chat ID");
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: chatId,
          user_id: user.id,
          content: content,
          image_url: imageUrl || null
        })
        .select();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch messages
      queryClient.invalidateQueries({ queryKey: ["chatMessages", chatId] });
      setImageFile(null);
      setImagePreview(null);
    },
    onError: (error) => {
      console.error("Error sending message:", error);
      toast.error(t("errorSendingMessage"));
    }
  });
  
  // Set up realtime subscription for new messages
  useEffect(() => {
    if (!chatId) return;
    
    const channel = supabase
      .channel('chat-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${chatId}`
      }, (payload) => {
        // Refetch messages when a new one is inserted
        queryClient.invalidateQueries({ queryKey: ["chatMessages", chatId] });
        
        // Mark as read if from another user
        if (payload.new.user_id !== user?.id) {
          try {
            // Using a direct update instead of the function to avoid UUID issues
            supabase
              .from('messages')
              .update({ read: true })
              .eq('conversation_id', chatId)
              .neq('user_id', user?.id)
              .eq('read', false);
          } catch (error) {
            console.error("Error marking messages as read:", error);
          }
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, queryClient, user?.id]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t("imageTooLarge"));
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!newMessage.trim() && !imageFile) || !user) return;
    
    try {
      let imageUrl: string | undefined = undefined;

      // Upload image if provided
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('chat-images')
          .upload(fileName, imageFile);

        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          toast.error(t("errorUploadingImage"));
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('chat-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      const messageContent = newMessage.trim() || t("sentAnImage");
      setNewMessage("");
      
      await sendMessageMutation.mutateAsync({ content: messageContent, imageUrl });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleDeleteChat = () => {
    if (window.confirm(t("confirmDeleteChat"))) {
      deleteConversationMutation.mutate();
    }
  };
  
  const isLoading = loadingParticipants || loadingMessages;
  
  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }
  
  if (!chatId || !user) {
    navigate("/chats");
    return null;
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header (styling aligned with footer) */}
      <div className="bg-background border-b border-border p-4 flex items-center justify-between text-primary shadow-sm">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/chats")}
            className="text-primary hover:bg-primary/10 mr-2"
          >
            <ArrowLeft size={20} />
          </Button>
        
        {isLoading ? (
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary/30 flex items-center justify-center animate-pulse"></div>
            <div className="w-24 h-5 bg-primary/30 animate-pulse ml-2 rounded"></div>
          </div>
        ) : (
          <>
            <Avatar className="h-8 w-8 mr-2">
              <AvatarFallback className="bg-primary/30 text-white text-sm">
                {chatInfo?.other_user_name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-base font-medium">
                {chatInfo?.other_user_name || t("user")}
              </h1>
            </div>
          </>
        )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDeleteChat}
          className="text-primary hover:bg-destructive/10"
          disabled={deleteConversationMutation.isPending}
        >
          <Trash2 size={18} />
        </Button>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="py-10 text-center flex flex-col items-center">
            <Loader2 size={32} className="animate-spin text-farm-green mb-2" />
            <p className="text-muted-foreground">{t("loadingMessages")}</p>
          </div>
        ) : messages?.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-muted-foreground">{t("noMessages")}</p>
            <p className="text-sm mt-2">{t("sendFirstMessage")}</p>
          </div>
        ) : (
          messages?.map((message) => {
            const isCurrentUser = message.user_id === user?.id;
            const messageDate = new Date(message.created_at);
            const formattedTime = format(messageDate, "HH:mm");
            
            return (
              <div 
                key={message.id}
                className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
              >
                <div 
                  className={`max-w-[70%] rounded-lg p-3 ${
                    isCurrentUser 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted"
                  }`}
                >
                  {message.image_url && (
                    <img 
                      src={message.image_url} 
                      alt="Shared image"
                      className="w-full rounded-lg mb-2 max-h-64 object-cover"
                    />
                  )}
                  <p className="text-sm">{message.content}</p>
                  <span className="text-xs block text-right mt-1 opacity-70">
                    {formattedTime}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input */}
      <form 
        onSubmit={handleSendMessage}
        className="border-t border-border"
      >
        {imagePreview && (
          <div className="p-3 border-b border-border">
            <div className="relative inline-block">
              <img 
                src={imagePreview} 
                alt="Preview"
                className="h-20 w-20 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6"
                onClick={removeImage}
              >
                <X size={12} />
              </Button>
            </div>
          </div>
        )}
        <div className="p-3 flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={sendMessageMutation.isPending}
          >
            <ImageIcon size={18} />
          </Button>
          <Input
            placeholder={t("typeMessage")}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
            disabled={sendMessageMutation.isPending}
          />
          <Button 
            type="submit"
            disabled={(!newMessage.trim() && !imageFile) || sendMessageMutation.isPending}
            size="icon"
            className="shrink-0"
          >
            {sendMessageMutation.isPending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatDetail;
