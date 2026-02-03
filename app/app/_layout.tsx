import AppNavigationBar from '@/components/AppNavigationBar';
import { DebugModal } from '@/components/DebugModal';
import { AppProvider } from '@/context';
import { Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, useFonts } from '@expo-google-fonts/manrope';
import { Stack, usePathname, useRouter } from "expo-router";
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
   const router = useRouter();
   const pathname = usePathname();

   useEffect(() => {
      if (fontsLoaded) {
         SplashScreen.hideAsync();
      }
   }, [fontsLoaded]);

   if (!fontsLoaded) {
      return null;
   }

   const getActiveId = () => {
      if (pathname === '/user') return 'you';
      if (pathname === '/admin') return 'admin';
      return 'activity';
   };

   const handleNavigation = (id: string) => {
      switch (id) {
         case 'you':
            router.replace('/user');
            break;
         case 'admin':
            router.replace('/admin');
            break;
         case 'activity':
         default:
            router.replace('/');
            break;
      }
   };

   return (
      <AppProvider>
         <SafeAreaProvider>
            <StatusBar style="dark" />
            <Stack>
               <Stack.Screen name="index" options={{ headerShown: false }} />
               <Stack.Screen name="user" options={{ headerShown: false }} />
               <Stack.Screen name="admin" options={{ headerShown: false }} />
            </Stack>

            <AppNavigationBar
               activeId={getActiveId()}
               onNavigate={handleNavigation}
            />
            {__DEV__ && <DebugModal />}
         </SafeAreaProvider>
      </AppProvider>
   );
}
