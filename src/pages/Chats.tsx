
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, PenSquare, Search, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import NavigationBar from "@/components/NavigationBar";
import ChatListItem from "@/components/chat/ChatListItem";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

interface Chat {
  id: string;
  created_at: string;
  last_message?: string;
  last_message_time?: string;
  other_user_id: string;
  other_user_name?: string;
  unread_count: number;
}

const Chats: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch user's chats - optimized with single query
  const { 
    data: chats, 
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["chats", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        // Get user's conversations first
        const { data: userConvs, error: userError } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', user.id);

        if (userError) throw userError;
        if (!userConvs || userConvs.length === 0) return [];

        const userConvIds = userConvs.map(c => c.conversation_id);

        // Get all participants for these conversations
        const { data: allParticipants, error: partError } = await supabase
          .from('conversation_participants')
          .select('conversation_id, user_id')
          .in('conversation_id', userConvIds)
          .neq('user_id', user.id);

        if (partError) throw partError;
        if (!allParticipants || allParticipants.length === 0) return [];

        // Get all user IDs to fetch profiles
        const userIds = [...new Set(allParticipants.map(p => p.user_id))];
        
        // Fetch all profiles in one query
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', userIds);

        if (profileError) throw profileError;

        // Create profile map
        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

        // Get conversations
        const { data: conversations, error: convError } = await supabase
          .from('conversations')
          .select('id, created_at')
          .in('id', userConvIds);

        if (convError) throw convError;

        const convMap = new Map(conversations?.map(c => [c.id, c]) || []);

        // Get latest messages for all conversations in one query
        const { data: latestMessages } = await supabase
          .from('messages')
          .select('conversation_id, content, created_at')
          .in('conversation_id', userConvIds)
          .order('created_at', { ascending: false });

        // Map latest message per conversation
        const messageMap = new Map();
        latestMessages?.forEach(msg => {
          if (!messageMap.has(msg.conversation_id)) {
            messageMap.set(msg.conversation_id, msg);
          }
        });

        // Build chat list
        const chatList: Chat[] = allParticipants.map(participant => {
          const conv = convMap.get(participant.conversation_id);
          const profile = profileMap.get(participant.user_id);
          const latestMsg = messageMap.get(participant.conversation_id);
          
          return {
            id: participant.conversation_id,
            created_at: conv?.created_at || new Date().toISOString(),
            last_message: latestMsg?.content || null,
            last_message_time: latestMsg?.created_at || conv?.created_at || new Date().toISOString(),
            other_user_id: participant.user_id,
            other_user_name: profile?.name || "Unknown User",
            unread_count: 0
          };
        });

        // Sort by latest message time
        return chatList.sort((a, b) => {
          const timeA = a.last_message_time || a.created_at;
          const timeB = b.last_message_time || b.created_at;
          return new Date(timeB).getTime() - new Date(timeA).getTime();
        });
      } catch (error) {
        console.error("Error fetching chats:", error);
        toast.error(t("errorFetchingChats"));
        return [];
      }
    },
    enabled: !!user,
    staleTime: 30000, // Cache for 30 seconds
    refetchOnWindowFocus: false
  });

  // Delete conversation mutation
  const deleteConversationMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      const { error } = await supabase.rpc('delete_conversation', {
        p_conversation_id: conversationId
      });
        
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("chatDeleted"));
      queryClient.invalidateQueries({ queryKey: ["chats", user?.id] });
    },
    onError: (error) => {
      console.error("Error deleting conversation:", error);
      toast.error(t("errorDeletingChat"));
    }
  });

  const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (window.confirm(t("confirmDeleteChat"))) {
      deleteConversationMutation.mutate(chatId);
    }
  };

  // Listen for new messages using Supabase realtime
  useEffect(() => {
    if (!user) return;
    
    // Subscribe to message events for all conversations
    const channel = supabase
      .channel('chats-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
          console.log('New message received:', payload);
          const newMessage = payload.new as { user_id: string; conversation_id: string; content: string };
          
          // Only show notification if message is not from current user
          if (newMessage.user_id !== user.id) {
            // Get sender's name
            const { data: senderProfile } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', newMessage.user_id)
              .single();
            
            const senderName = senderProfile?.name || "Someone";
            toast.message(`${senderName}`, {
              description: newMessage.content,
              action: {
                label: t("viewContact"),
                onClick: () => navigate(`/chats/${newMessage.conversation_id}`)
              }
            });
          }
          
          // Refetch chats to update the UI
          refetch();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refetch, navigate, t]);

  // Filter chats based on search
  const filteredChats = searchTerm.trim() === "" 
    ? chats 
    : chats?.filter(chat => 
        chat.other_user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.last_message?.toLowerCase().includes(searchTerm.toLowerCase())
      );

  return (
    <div className="pb-20 min-h-screen bg-background">
      {/* Header (match footer look) */}
      <div className="bg-background border-b border-border p-4 text-primary shadow-sm">
        <div className="container px-4 mx-auto">
          <h1 className="text-xl font-bold">{t("chats")}</h1>
          <p className="text-sm mt-1 text-muted-foreground">{t("connectWithFarmersAndBuyers")}</p>
        </div>
      </div>
      
      {/* Search */}
      <div className="container mx-auto px-4 pt-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            className="pl-10"
            placeholder={t("searchChats")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* No chats state */}
      {!isLoading && (!chats || chats.length === 0) && (
        <div className="flex flex-col items-center justify-center p-8 mt-8 text-center">
          <MessageSquare size={64} className="text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium mb-2">{t("noChatsYet")}</h2>
          <p className="text-muted-foreground mb-6 max-w-xs">
            {t("noChatsDescription")}
          </p>
          <Button onClick={() => navigate('/marketplace')}>
            <PenSquare size={16} className="mr-2" />
            {t("browseMarketplace")}
          </Button>
        </div>
      )}
      
      {/* Loading state */}
      {isLoading && (
        <div className="container mx-auto px-4 divide-y">
          {[1, 2, 3].map((i) => (
            <div key={i} className="py-4 flex items-center">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="ml-3 space-y-2 flex-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-5/6" />
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Chat list */}
      {!isLoading && filteredChats && filteredChats.length > 0 && (
        <div className="container mx-auto px-4 divide-y">
          {filteredChats.map(chat => (
            <div key={chat.id} className="flex items-center group">
              <div className="flex-1" onClick={() => navigate(`/chats/${chat.id}`)}>
                <ChatListItem 
                  chat={chat}
                  onClick={() => {}}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                onClick={(e) => handleDeleteChat(e, chat.id)}
                disabled={deleteConversationMutation.isPending}
              >
                <Trash2 size={18} />
              </Button>
            </div>
          ))}
        </div>
      )}
      
      {/* Navigation bar */}
      <NavigationBar />
    </div>
  );
};

export default Chats;
