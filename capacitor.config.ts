
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.5b910b0880a64382885d61eebe0c6fa6',
  appName: 'farmer-focus-connect',
  webDir: 'dist',
  server: {
    url: 'https://5b910b08-80a6-4382-885d-61eebe0c6fa6.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    backgroundColor: "#65a30d"
  },
  ios: {
    backgroundColor: "#65a30d"
  }
};

export default config;
