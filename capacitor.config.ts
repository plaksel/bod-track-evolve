import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.46ba988450c444d9922e4c147d9c5336',
  appName: 'bod-track-evolve',
  webDir: 'dist',
  server: {
    url: 'https://46ba9884-50c4-44d9-922e-4c147d9c5336.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav",
    },
  },
};

export default config;