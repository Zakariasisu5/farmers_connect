import * as React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Star, Upload, Send, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  avatar: string;
  rating: number;
}

const initialTestimonials: Testimonial[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    text: "This platform has transformed how I manage my farm. The real-time market prices and weather updates are incredibly helpful!",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    rating: 5,
  },
  {
    id: "2",
    name: "Michael Chen",
    text: "As a new farmer, the community support and expert advice available here has been invaluable. Highly recommend!",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    rating: 5,
  },
  {
    id: "3",
    name: "Emma Rodriguez",
    text: "The marketplace feature helped me sell my crops at better prices. This is exactly what the farming community needed.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
    rating: 5,
  },
  {
    id: "4",
    name: "David Thompson",
    text: "Outstanding platform! The integration of market data, weather, and community features makes it a one-stop solution.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    rating: 5,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [testimonials, setTestimonials] = React.useState<Testimonial[]>(() => {
    try {
      const raw = localStorage.getItem("ffc_testimonials");
      return raw ? (JSON.parse(raw) as Testimonial[]) : initialTestimonials;
    } catch (e) {
      return initialTestimonials;
    }
  });
  const [formData, setFormData] = React.useState({
    name: "",
    text: "",
    avatar: "",
    rating: 5,
  });
  const [avatarPreview, setAvatarPreview] = React.useState<string>("");
  const avatarInputRef = React.useRef<HTMLInputElement | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  const testimonialsRef = React.useRef<HTMLDivElement | null>(null);
  const [highlightedId, setHighlightedId] = React.useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
        setFormData((prev) => ({ ...prev, avatar: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.text.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newTestimonial: Testimonial = {
      id: Date.now().toString(),
      name: formData.name,
      text: formData.text,
      avatar: formData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`,
      rating: formData.rating,
    };

    setTestimonials((prev) => {
      const next = [newTestimonial, ...prev];
      try {
        localStorage.setItem("ffc_testimonials", JSON.stringify(next));
      } catch (e) {
        // ignore
      }
      return next;
    });

    // Scroll to the testimonials section and briefly highlight the newly added item
    try {
      setTimeout(() => {
        if (testimonialsRef.current) {
          testimonialsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        setHighlightedId(newTestimonial.id);
        setTimeout(() => setHighlightedId(null), 3500);
      }, 150);
    } catch (e) {}

    toast({
      title: "Success!",
      description: "Your testimonial has been added",
    });

    // Reset form
    setFormData({
      name: "",
      text: "",
      avatar: "",
      rating: 5,
    });
    setAvatarPreview("");
    // reset file input if present
    try {
      if (avatarInputRef.current) {
        avatarInputRef.current.value = "";
      }
    } catch (e) {}
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Theme Toggle */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Farmer Focus Connect</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ThemeToggle />
          </motion.div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Hero Section */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mb-16 md:mb-24"
        >
          <motion.div
            variants={itemVariants}
            className="mx-auto max-w-3xl text-center"
          >
            <motion.h1
              variants={itemVariants}
              className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
            >
              Connect, Grow,{" "}
              <span className="text-primary">Thrive</span>
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="mb-8 text-lg text-muted-foreground sm:text-xl md:text-2xl"
            >
              Your all-in-one platform for modern farming. Get real-time market prices,
              weather updates, and connect with a community of farmers.
            </motion.p>
            <motion.div
              variants={itemVariants}
              className="flex flex-col gap-4 sm:flex-row sm:justify-center"
            >
              <Button 
                size="lg" 
                className="text-lg px-8"
                onClick={() => navigate("/register")}
              >
                Get Started
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8"
                onClick={() => navigate("/login")}
              >
                Sign In
              </Button>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Testimonials Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          className="mb-16 md:mb-24"
        >
          <motion.div variants={itemVariants} className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              What Farmers Say
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Join thousands of farmers who are already using our platform to improve their operations
            </p>
          </motion.div>

          <div ref={testimonialsRef} className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className={`h-full ${highlightedId === testimonial.id ? "ring-2 ring-primary/40 animate-pulse" : ""}`}>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                        <AvatarFallback>
                          {testimonial.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                        <div className="flex gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < testimonial.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      "{testimonial.text}"
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Add Testimonial Form */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          className="mb-16 md:mb-24"
        >
          <motion.div variants={itemVariants} className="mb-8 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Share Your Experience
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Help other farmers by sharing your story
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mx-auto max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>Add Your Testimonial</CardTitle>
                <CardDescription>
                  Tell us about your experience with our platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="text">Testimonial *</Label>
                    <Textarea
                      id="text"
                      name="text"
                      value={formData.text}
                      onChange={handleInputChange}
                      placeholder="Share your experience..."
                      rows={5}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="avatar">Avatar (Optional)</Label>
                    <div className="flex items-center gap-4">
                      {avatarPreview && (
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={avatarPreview} alt="Preview" />
                          <AvatarFallback>Preview</AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex-1">
                        <input
                          id="avatar"
                          ref={avatarInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                        <label
                          htmlFor="avatar"
                          className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          <Upload className="h-4 w-4" />
                          {avatarPreview ? "Change Avatar" : "Upload Avatar"}
                        </label>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Maximum file size: 5MB. If no avatar is uploaded, one will be generated.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rating">Rating</Label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, rating }))}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`h-6 w-6 transition-colors ${
                              rating <= formData.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground hover:text-yellow-400"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Submitting..."
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit Testimonial
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 Farmer Focus Connect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

