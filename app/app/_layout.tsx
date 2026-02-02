import { AppProvider } from '@/context';
import { Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, useFonts } from '@expo-google-fonts/manrope';
import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
   const [fontsLoaded] = useFonts({
      Manrope_400Regular,
      Manrope_500Medium,
      Manrope_600SemiBold,
      Manrope_700Bold,
   });

   useEffect(() => {
      if (fontsLoaded) {
         SplashScreen.hideAsync();
      }
   }, [fontsLoaded]);

   if (!fontsLoaded) {
      return null;
   }

   return (
      <AppProvider>
         <SafeAreaProvider>
            <StatusBar style="dark" />
            <Stack>
               <Stack.Screen name="index" options={{ headerShown: false }} />
            </Stack>
         </SafeAreaProvider>
      </AppProvider>
   );
}
