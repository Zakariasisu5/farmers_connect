
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "../contexts/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const QuestionForm: React.FC = () => {
  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState("");
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) return;
    
    setIsSubmitting(true);
    setResponse("");
    
    try {
      // Get current session to check if user is authenticated
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      
      // Simulate API request - in a real app, this would call a Supabase edge function
      const farmerQuestions = {
        "fertilizer": "For optimal results, apply NPK fertilizer at the beginning of the growing season. The best ratio depends on your soil test results, but 15-15-15 is often a good general-purpose option for most crops.",
        "pest": "To control pests naturally, consider introducing beneficial insects like ladybugs or using neem oil spray. For severe infestations, consult with a local agricultural extension officer for targeted solutions.",
        "water": "Most crops require 1-2 inches of water per week. Water deeply and less frequently to encourage deep root growth. Early morning is the best time to water to reduce evaporation.",
        "seed": "Plant seeds at a depth approximately 2-3 times their diameter. Keep soil consistently moist but not waterlogged during germination. Most vegetable seeds germinate best at soil temperatures between 21-26°C.",
        "weather": "The current forecast indicates the rainy season should arrive on schedule this year. Plan your planting accordingly, and consider having irrigation systems ready in case of any unexpected dry spells.",
        "market": "Current market trends suggest higher prices for tomatoes and maize in the coming weeks due to seasonal demand. Consider timing your harvest to take advantage of these price increases.",
      };
      
      // Generate response based on keywords in the question
      let generatedResponse = "I'm sorry, I don't have specific information about that topic. Please contact our agricultural extension office for more detailed assistance.";
      
      const questionLower = question.toLowerCase();
      for (const [key, value] of Object.entries(farmerQuestions)) {
        if (questionLower.includes(key)) {
          generatedResponse = value;
          break;
        }
      }
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setResponse(generatedResponse);
      
      // Save question to database if user is logged in
      if (userId) {
        await supabase.from('community_posts').insert({
          user_id: userId,
          title: question.substring(0, 100),
          content: question
        });
      }
      
      toast({
        title: "Question submitted",
        description: "Our expert has provided a response below.",
      });
    } catch (error) {
      console.error("Error submitting question:", error);
      toast({
        title: "Error",
        description: "Failed to submit your question. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder="What farming questions can we help with? (Try asking about fertilizer, pests, water, seeds, weather, or market)"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={4}
          className="resize-none"
        />
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={!question.trim() || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            t("askQuestion")
          )}
        </Button>
      </form>
      
      {response && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex gap-3 items-start">
              <div className="bg-farm-green text-white p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 16v-4"></path>
                  <path d="M12 8h.01"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-sm mb-1">Expert Response:</h3>
                <p className="text-sm text-muted-foreground">{response}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuestionForm;
