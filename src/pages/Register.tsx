
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageSelector from "../components/LanguageSelector";
import { ghanaRegions } from "../contexts/MarketContext";

const Register: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [region, setRegion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password) {
      setError("Please fill out all required fields");
      return;
    }
    
    setError("");
    setIsLoading(true);
    
    if (!region) {
      setError("Please select your region");
      setIsLoading(false);
      return;
    }
    
    try {
      await register(name, email, password, region);
      navigate("/home");
    } catch (error) {
      setError("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-farm-green-light/10 to-farm-sky-light/10">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-farm-green">Farmer Focus Connect</h1>
          <p className="text-muted-foreground mt-2">Agricultural insights at your fingertips</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-center">{t("register")}</CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="name">{t("username")}</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">{t("password")}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="region">Region <span className="text-destructive">*</span></Label>
                <Select value={region} onValueChange={setRegion} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your region" />
                  </SelectTrigger>
                  <SelectContent>
                    {ghanaRegions.map((regionOption) => (
                      <SelectItem key={regionOption} value={regionOption}>
                        {regionOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : t("register")}
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Button variant="link" className="p-0" onClick={() => navigate("/login")}>
                  {t("login")}
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
