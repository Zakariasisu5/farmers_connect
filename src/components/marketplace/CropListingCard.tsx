
import React, { useState, useEffect } from "react";
import { Phone, Mail, MapPin, MessageCircle, User, Trash2 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface CropListing {
  id: string;
  user_id: string;
  crop_name: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  location: string;
  description?: string;
  contact_phone?: string;
  contact_email?: string;
  image_url?: string;
  is_available: boolean;
  created_at: string;
}

interface CropListingCardProps {
  listing: CropListing;
  onUpdate?: () => void;
  onChat?: () => void;
}

const CropListingCard: React.FC<CropListingCardProps> = ({ listing, onUpdate }) => {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showContact, setShowContact] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [posterName, setPosterName] = useState<string>("");
  
  const isOwner = user?.id === listing.user_id;

  // Fetch poster's name
  useEffect(() => {
    const fetchPosterName = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', listing.user_id)
        .single();

      if (!error && data) {
        setPosterName(data.name);
      }
    };

    fetchPosterName();
  }, [listing.user_id]);
  
  const formattedDate = new Date(listing.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
  
  const handleContactClick = () => {
    if (!isAuthenticated) {
      toast.error(t("loginRequired"));
      navigate("/login");
      return;
    }
    setShowContact(prev => !prev);
    if (!showContact) {
      toast.success(t("contactInfoShown"));
    }
  };

  const handleChatClick = async () => {
    if (!isAuthenticated) {
      toast.error(t("loginRequired"));
      navigate("/login");
      return;
    }
    
    if (isOwner) {
      toast.error(t("cannotChatWithYourself"));
      return;
    }
    
    try {
      setIsStartingChat(true);
      
      // Use the database function to create or get conversation
      const { data, error } = await supabase.rpc('create_or_get_conversation', {
        p_other_user: listing.user_id
      });
      
      if (error) {
        console.error("Error creating/getting conversation:", error);
        throw error;
      }
      
      setIsStartingChat(false);
      toast.success(t("startingChat"));
      navigate(`/chats/${data}`);
    } catch (error) {
      console.error("Error starting chat:", error);
      toast.error(t("errorStartingChat"));
      setIsStartingChat(false);
    }
  };

  const handleDelete = async () => {
    if (!isOwner) {
      toast.error(t("unauthorized") || "You can only delete your own listings");
      setShowDeleteDialog(false);
      return;
    }

    try {
      setIsDeleting(true);

      // Delete image from storage if it exists
      if (listing.image_url) {
        try {
          // Extract the file path from the URL
          // URL format: https://[project].supabase.co/storage/v1/object/public/product-images/[path]
          const urlParts = listing.image_url.split('/product-images/');
          if (urlParts.length > 1) {
            const filePath = urlParts[1];
            const { error: storageError } = await supabase.storage
              .from('product-images')
              .remove([filePath]);

            if (storageError) {
              console.warn("Error deleting image from storage:", storageError);
              // Continue with listing deletion even if image deletion fails
            }
          }
        } catch (storageError) {
          console.warn("Error deleting image:", storageError);
          // Continue with listing deletion
        }
      }

      // Delete the listing from database
      const { error: deleteError } = await supabase
        .from('crop_listings')
        .delete()
        .eq('id', listing.id);

      if (deleteError) {
        console.error("Error deleting listing:", deleteError);
        throw deleteError;
      }

      toast.success(t("listingDeleted") || "Listing deleted successfully");
      
      // Close dialog
      setShowDeleteDialog(false);
      
      // Refresh the listings
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error deleting listing:", error);
      toast.error(t("errorDeletingListing") || "Failed to delete listing");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      {listing.image_url && (
        <div className="w-full h-48 overflow-hidden">
          <img 
            src={listing.image_url} 
            alt={listing.crop_name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader className="bg-farm-green/10 p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg">{listing.crop_name}</h3>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <MapPin size={14} className="mr-1" />
              {listing.location}
            </div>
            {posterName && (
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <User size={12} className="mr-1" />
                {t("postedBy")}: {posterName}
              </div>
            )}
          </div>
          <div className="font-bold text-farm-green">
            ₵{listing.price_per_unit} <span className="text-sm font-normal">/ {listing.unit}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            {t("quantity")}: <span className="font-medium text-foreground">{listing.quantity} {listing.unit}</span>
          </div>
          
          {listing.description && (
            <div className="text-sm">
              <div className="text-muted-foreground mb-1">{t("description")}:</div>
              <p className="line-clamp-3">{listing.description}</p>
            </div>
          )}
          
          <div className="text-xs text-muted-foreground">{t("postedOn")}: {formattedDate}</div>
          
          {showContact && (
            <div className="bg-muted p-3 rounded-md mt-2">
              <h4 className="font-medium mb-2">{t("contactInfo")}</h4>
              {listing.contact_phone && (
                <div className="flex items-center gap-2 text-sm mb-1">
                  <Phone size={14} />
                  <a href={`tel:${listing.contact_phone}`} className="text-primary">{listing.contact_phone}</a>
                </div>
              )}
              {listing.contact_email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail size={14} />
                  <a href={`mailto:${listing.contact_email}`} className="text-primary">{listing.contact_email}</a>
                </div>
              )}
              {!listing.contact_phone && !listing.contact_email && (
                <p className="text-sm text-muted-foreground">{t("noContactInfo")}</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-card p-4 pt-0">
        {!isOwner ? (
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button 
              onClick={handleContactClick} 
              variant={showContact ? "outline" : "default"}
              className="w-full"
            >
              {showContact ? t("hideContact") : t("viewContact")}
            </Button>
            <Button 
              onClick={handleChatClick}
              variant="secondary" 
              className="w-full"
              disabled={isStartingChat}
            >
              <MessageCircle size={16} className="mr-1" />
              {isStartingChat ? t("connecting") : t("chat")}
            </Button>
          </div>
        ) : (
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                className="w-full"
                disabled={isDeleting}
              >
                <Trash2 size={16} className="mr-1" />
                {t("deleteListing") || "Delete Listing"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("confirmDelete") || "Delete Listing?"}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("confirmDeleteMessage") || `Are you sure you want to delete "${listing.crop_name}"? This action cannot be undone.`}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>
                  {t("cancel") || "Cancel"}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete();
                  }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isDeleting}
                >
                  {isDeleting ? (t("deleting") || "Deleting...") : (t("delete") || "Delete")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardFooter>
    </Card>
  );
};

export default CropListingCard;
