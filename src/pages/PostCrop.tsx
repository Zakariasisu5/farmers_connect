import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowLeft, Crop, CircleDollarSign, Info, MapPin, Phone, Mail, Upload, X } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useMarket, ghanaRegions } from "@/contexts/MarketContext";
import { Button } from "@/components/ui/button";
import { getUnitsForCrop, getPrimaryUnitForCrop, getAllCropNames } from "@/lib/cropUnits";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Form schema definition
const formSchema = z.object({
  crop_name: z.string().min(2, { message: "Crop name is required" }),
  quantity: z.string().min(1, { message: "Quantity is required" }),
  unit: z.string().min(1, { message: "Unit is required" }),
  price: z.string().min(1, { message: "Price is required" }),
  location: z.string().min(2, { message: "Location is required" }),
  description: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().email({ message: "Invalid email" }).optional().or(z.literal('')),
});

type FormValues = z.infer<typeof formSchema>;

const PostCrop: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Get all available crop names
  const availableCrops = getAllCropNames();

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      crop_name: "",
      quantity: "",
      unit: "kg",
      price: "",
      location: "",
      description: "",
      contact_phone: "",
      contact_email: "",
    },
  });

  // Watch crop name to update available units
  const selectedCrop = form.watch("crop_name");
  const availableUnits = selectedCrop ? getUnitsForCrop(selectedCrop) : ["kg", "bag", "crate", "box", "ton", "piece", "dozen", "bundle"];

  // Update unit when crop changes
  useEffect(() => {
    if (selectedCrop) {
      const primaryUnit = getPrimaryUnitForCrop(selectedCrop);
      form.setValue("unit", primaryUnit);
    }
  }, [selectedCrop, form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
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

  const onSubmit = async (data: FormValues) => {
    if (!user) {
      toast.error(t("mustBeLoggedIn"));
      return;
    }

    try {
      setIsUploading(true);
      let imageUrl = null;

      // Upload image if provided
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, imageFile);

        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      // Create the listing data object
      const listingData = {
        user_id: user.id,
        crop_name: data.crop_name,
        quantity: parseFloat(data.quantity),
        unit: data.unit,
        price_per_unit: parseFloat(data.price),
        location: data.location,
        description: data.description || null,
        contact_phone: data.contact_phone || null,
        image_url: imageUrl,
        is_available: true,
      };

      const { error } = await supabase.from("crop_listings").insert(listingData);

      if (error) {
        console.error("Error details:", error);
        throw error;
      }

      toast.success(t("cropListingPosted"));
      navigate("/marketplace");
    } catch (error) {
      console.error("Error posting crop listing:", error);
      toast.error(t("errorPostingListing"));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="pb-20 min-h-screen bg-background">
      {/* Header (match footer colors) */}
      <div className="bg-background border-b border-border p-4 text-primary shadow-sm">
        <div className="container px-4 mx-auto">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2 text-primary hover:bg-primary/10" 
              onClick={() => navigate("/marketplace")}
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-xl font-bold">{t("postCropListing")}</h1>
          </div>
          <p className="text-sm mt-1 text-muted-foreground">{t("shareYourProduceWithBuyers")}</p>
        </div>
      </div>

      {/* Form with visual improvements */}
      <div className="container px-4 py-6 mx-auto max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Product Information Section */}
            <div className="bg-card p-5 rounded-lg border border-border shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Crop size={18} className="text-farm-green" />
                <h2 className="font-medium text-lg">{t("productInformation")}</h2>
              </div>
              
              <FormField
                control={form.control}
                name="crop_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("cropName")}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={t("enterCropName") || "Type crop name (autocomplete available)"} 
                        {...field}
                        list="crop-suggestions"
                      />
                      <datalist id="crop-suggestions">
                        {availableCrops.map(crop => (
                          <option key={crop} value={crop} />
                        ))}
                      </datalist>
                    </FormControl>
                    <FormDescription className="text-xs">
                      {selectedCrop && `Recommended unit: ${getPrimaryUnitForCrop(selectedCrop)}`}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4 mt-4">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("quantity")}</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("unit")}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("selectUnit")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableUnits.map(unit => (
                            <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel className="flex items-center gap-1">
                      <CircleDollarSign size={14} className="text-muted-foreground" />
                      {t("pricePerUnit")} (₵)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image Upload */}
              <div className="mt-4">
                <FormLabel className="flex items-center gap-1">
                  <Upload size={14} className="text-muted-foreground" />
                  {t("productImage")}
                </FormLabel>
                <div className="mt-2">
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={removeImage}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                      <Upload size={32} className="text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">{t("clickToUpload")}</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div className="bg-card p-5 rounded-lg border border-border shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={18} className="text-farm-green" />
                <h2 className="font-medium text-lg">{t("location")}</h2>
              </div>
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("region")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("selectRegion")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ghanaRegions.map(region => (
                          <SelectItem key={region} value={region}>{region}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description Section */}
            <div className="bg-card p-5 rounded-lg border border-border shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Info size={18} className="text-farm-green" />
                <h2 className="font-medium text-lg">{t("description")}</h2>
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("productDescription")}</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={t("describeYourCrop")} 
                        className="resize-none" 
                        rows={3} 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription className="text-xs">{t("includeQualityAndFreshness")}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contact Information Section */}
            <div className="bg-card p-5 rounded-lg border border-border shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Phone size={18} className="text-farm-green" />
                <h2 className="font-medium text-lg">{t("contactInformation")}</h2>
              </div>
              
              <FormField
                control={form.control}
                name="contact_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <Phone size={14} className="text-muted-foreground" />
                      {t("phoneNumber")}
                    </FormLabel>
                    <FormControl>
                      <Input placeholder={t("enterPhoneNumber")} {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">{t("phoneOptional")}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_email"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel className="flex items-center gap-1">
                      <Mail size={14} className="text-muted-foreground" />
                      {t("email")}
                    </FormLabel>
                    <FormControl>
                      <Input placeholder={t("enterEmail")} {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">{t("emailOptional")}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-farm-green hover:bg-farm-green/90"
              disabled={isUploading}
            >
              {isUploading ? t("uploading") : t("postListing")}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default PostCrop;
