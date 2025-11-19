import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, TrendingUp, CloudRain, Bug, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface Notification {
  id: string;
  type: "price" | "weather" | "pest";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string;
}

const NotificationsDropdown: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch notifications from database or generate mock data
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const fetchNotifications = async () => {
      // For now, generate mock notifications
      // In production, these would come from a notifications table
      const mockNotifications: Notification[] = [
        {
          id: "1",
          type: "price",
          title: "Price Alert: Maize",
          message: "Maize prices increased by 15% in Central Region",
          timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
          read: false,
          link: "/market"
        },
        {
          id: "2",
          type: "weather",
          title: "Weather Alert",
          message: "Heavy rain expected in Greater Accra tomorrow",
          timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          read: false,
          link: "/home"
        },
        {
          id: "3",
          type: "pest",
          title: "Pest Alert: Fall Armyworm",
          message: "Fall Armyworm detected in nearby farms. Take preventive measures.",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          read: true,
          link: "/support"
        },
        {
          id: "4",
          type: "price",
          title: "Price Alert: Tomatoes",
          message: "Tomato prices dropped by 8% in Ashanti Region",
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
          read: true,
          link: "/market"
        }
      ];

      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
    };

    fetchNotifications();

    // Set up real-time subscription for new notifications
    // This would subscribe to a notifications table in production
    const channel = supabase
      .channel('notifications-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          // Handle new notification
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "price":
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case "weather":
        return <CloudRain className="h-4 w-4 text-cyan-500" />;
      case "pest":
        return <Bug className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "price":
        return "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800";
      case "weather":
        return "bg-cyan-50 dark:bg-cyan-950 border-cyan-200 dark:border-cyan-800";
      case "pest":
        return "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800";
      default:
        return "bg-muted";
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const markAsRead = async (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    // In production, update the database
    // await supabase.from('notifications').update({ read: true }).eq('id', notificationId);
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    
    // In production, update the database
    // await supabase.from('notifications').update({ read: true }).eq('user_id', user?.id);
  };

  // Clear old read notifications (older than 7 days)
  const clearOldNotifications = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    setNotifications(prev => 
      prev.filter(n => {
        // Keep unread notifications
        if (!n.read) return true;
        // Keep read notifications that are less than 7 days old
        return n.timestamp > sevenDaysAgo;
      })
    );
  };

  // Auto-clear old notifications when component mounts or when notifications change
  useEffect(() => {
    // Clear immediately on mount and when notifications change
    clearOldNotifications();

    // Set up interval to check periodically
    const interval = setInterval(() => {
      clearOldNotifications();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications.length]);

  if (!user) {
    return null;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 flex items-center justify-center text-[10px] font-bold"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                markAllAsRead();
              }}
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            <div className="space-y-1 p-1">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                    !notification.read
                      ? getNotificationColor(notification.type)
                      : "bg-background"
                  }`}
                  onClick={() => {
                    if (!notification.read) {
                      markAsRead(notification.id);
                    }
                    if (notification.link) {
                      navigate(notification.link);
                    }
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-none">
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-primary mt-1 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimeAgo(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                // Navigate to notifications page or settings
                navigate("/settings");
                setIsOpen(false);
              }}
            >
              View all notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsDropdown;

