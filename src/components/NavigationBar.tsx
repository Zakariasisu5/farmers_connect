import React, { useEffect, useState } from "react";
import { Home, Calendar, MessageCircle, Settings, ShoppingCart } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { Badge } from "./ui/badge";
import { supabase } from "@/integrations/supabase/client";

const NavigationBar: React.FC = () => {
  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread message count - optimized
  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      const { data, error } = await supabase
        .rpc('get_unread_message_count', { p_user_id: user.id });
      
      if (!error && data !== null) {
        setUnreadCount(data);
      }
    };

    fetchUnreadCount();

    // Subscribe to new messages - only refetch on INSERT for current user
    const channel = supabase
      .channel('unread-messages-nav')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          // Only update if message is for this user (not from them)
          if (payload.new.user_id !== user.id) {
            fetchUnreadCount();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const navItems = [
    { icon: <Home size={22} />, label: t("home"), path: "/home" },
    { icon: <ShoppingCart size={22} />, label: t("marketplace"), path: "/marketplace" },
    { 
      icon: <MessageCircle size={22} />, 
      label: t("chats"), 
      path: "/chats",
      badge: unreadCount > 0 ? unreadCount : null
    },
    { icon: <Settings size={22} />, label: t("settings"), path: "/settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border flex justify-around py-3 px-2 shadow-sm">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        
        return (
          <Link 
            key={item.path} 
            to={item.path} 
            className={`flex flex-col items-center p-2 rounded-lg relative ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {item.icon}
            <span className="text-xs mt-1 font-medium">{item.label}</span>
            {item.badge && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 flex items-center justify-center text-[10px] font-bold">
                {item.badge > 99 ? '99+' : item.badge}
              </Badge>
            )}
          </Link>
        );
      })}
    </nav>
  );
};

export default NavigationBar;
