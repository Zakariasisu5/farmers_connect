
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import LanguageSelector from "../components/LanguageSelector";
import NavigationBar from "../components/NavigationBar";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Bell, Smartphone, Wifi } from "lucide-react";

const Settings: React.FC = () => {
  const { t } = useLanguage();
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="pb-20 min-h-screen bg-background">
      {/* Header (match footer style) */}
      <div className="bg-background border-b border-border p-4 text-primary shadow-sm">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">{t("settings")}</h1>
          <LanguageSelector />
        </div>
      </div>

      {/* Settings Content */}
      <div className="container px-4 py-6 space-y-6">
        {/* User Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Name</span>
              <span>{profile?.name || "Guest User"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Email</span>
              <span>{profile?.email || "Not set"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Region</span>
              <span>{profile?.region || "Central Region"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell size={18} />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="price-alerts">Price Alerts</Label>
              <Switch id="price-alerts" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="weather-alerts">Weather Alerts</Label>
              <Switch id="weather-alerts" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="pest-alerts">Pest & Disease Alerts</Label>
              <Switch id="pest-alerts" defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Data Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Smartphone size={18} />
              Data Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="offline-mode" className="flex items-center gap-2">
                <Wifi size={18} />
                Offline Mode
              </Label>
              <Switch id="offline-mode" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="data-saver">Data Saver</Label>
              <Switch id="data-saver" defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Language */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Language</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label>App Language</Label>
              <div className="w-40">
                <LanguageSelector />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleLogout}
        >
          {t("logout")}
        </Button>
      </div>

      {/* Bottom Navigation */}
      <NavigationBar />
    </div>
  );
};

export default Settings;
