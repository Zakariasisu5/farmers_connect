
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Chat {
  id: string;
  created_at: string;
  last_message?: string;
  last_message_time?: string;
  other_user_id: string;
  other_user_name?: string;
  unread_count: number;
}

interface ChatListItemProps {
  chat: Chat;
  onClick: () => void;
}

const ChatListItem: React.FC<ChatListItemProps> = ({ chat, onClick }) => {
  const formattedTime = chat.last_message_time
    ? formatDistanceToNow(new Date(chat.last_message_time), { addSuffix: true })
    : "";

  const userInitials = chat.other_user_name
    ? chat.other_user_name.charAt(0).toUpperCase()
    : "U";

  return (
    <div 
      onClick={onClick}
      className="flex items-center p-4 hover:bg-muted/50 cursor-pointer transition-colors"
    >
      <Avatar className="h-12 w-12 mr-3">
        <AvatarFallback className="bg-primary/10 text-primary">
          {userInitials}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <h3 className="font-medium truncate">
            {chat.other_user_name || "Unknown User"}
          </h3>
          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
            {formattedTime}
          </span>
        </div>
        
        <p className="text-sm text-muted-foreground truncate">
          {chat.last_message || "No messages yet"}
        </p>
      </div>
      
      {chat.unread_count > 0 && (
        <Badge className="ml-2 bg-primary" variant="default">
          {chat.unread_count}
        </Badge>
      )}
    </div>
  );
};

export default ChatListItem;
