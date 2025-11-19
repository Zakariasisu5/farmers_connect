
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "../components/ThemeToggle";
import NotificationsDropdown from "../components/NotificationsDropdown";
import NavigationBar from "../components/NavigationBar";
import QuestionForm from "../components/QuestionForm";
import { useLanguage } from "../contexts/LanguageContext";

const Support: React.FC = () => {
  const { t } = useLanguage();

  // Enhanced FAQ data with more farming-related questions
  const faqData = [
    {
      question: "When is the best time to plant maize in Ghana?",
      answer: "In Ghana, the best time to plant maize depends on your region. In the southern parts, planting should be done in March-April for the major season and August-September for the minor season. In northern Ghana, plant in May-June when the rainy season begins.",
    },
    {
      question: "How do I identify tomato blight?",
      answer: "Tomato blight appears as dark brown spots on leaves that quickly enlarge and turn black. Infected stems develop dark, elongated lesions, and fruits show dark, leathery patches. In Ghana's humid conditions, it spreads rapidly during rainy seasons.",
    },
    {
      question: "What are natural methods to control aphids?",
      answer: "Natural aphid control includes introducing beneficial insects like ladybugs, spraying with neem oil or soap solutions, and planting companion plants such as marigolds or nasturtiums. These methods are particularly effective in Ghana's tropical climate.",
    },
    {
      question: "How often should I rotate crops?",
      answer: "Crop rotation should ideally occur every growing season, but at minimum practice a 3-4 year rotation cycle to prevent soil-borne diseases and pest buildup. This is especially important in Ghana to maintain soil fertility and reduce pest pressure.",
    },
    {
      question: "Which fertilizers are best for cassava in Ghana?",
      answer: "For cassava cultivation in Ghana, NPK fertilizers with ratios like 15-15-15 or 12-12-17 are recommended. Apply approximately 200-400 kg/ha, with application timing 4-8 weeks after planting for optimal yield.",
    },
    {
      question: "How can I improve soil fertility naturally?",
      answer: "Improve soil fertility naturally by incorporating compost, practicing crop rotation with legumes, using green manures, and applying organic matter like poultry manure. These practices are well-suited to Ghana's agricultural systems and help build long-term soil health.",
    },
    {
      question: "What's the best way to store yams after harvest?",
      answer: "For yam storage in Ghana, keep them in cool, dry, well-ventilated yam barns or traditional structures raised above ground. Regularly inspect for rot or pest damage. Properly stored yams can last 4-6 months after harvest.",
    },
    {
      question: "How do I manage weeds without chemicals?",
      answer: "Manage weeds organically by timely cultivation, mulching, hand weeding, and maintaining proper plant spacing. In Ghana, cover cropping with mucuna or other leguminous plants can also effectively suppress weeds while improving soil fertility.",
    },
  ];

  return (
    <div className="pb-20 min-h-screen bg-background">
      {/* Header */}
        <div className="bg-background border-b border-border p-4 text-primary shadow-sm">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">{t("support")}</h1>
          <div className="flex items-center gap-2">
            <NotificationsDropdown />
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Support Content */}
      <div className="container px-4 py-6">
        <Tabs defaultValue="ask">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="ask">{t("askQuestion")}</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="ask" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ask Our Farming Experts</CardTitle>
              </CardHeader>
              <CardContent>
                <QuestionForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faq">
            <div className="space-y-4">
              {faqData.map((faq, index) => (
                <Card key={index}>
                  <CardHeader className="py-3">
                    <CardTitle className="text-base font-medium">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Navigation */}
      <NavigationBar />
    </div>
  );
};

export default Support;
