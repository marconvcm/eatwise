import { useCurrentUser } from '@/hooks/user/useCurrentUser';
import { usePathname } from 'expo-router';
import { useEffect, useMemo } from 'react';
import NavigationBar, { NavigationItem } from './NavigationBar';

interface AppNavigationBarProps {
   activeId: string;
   onNavigate: (id: string) => void;
}

export default function AppNavigationBar({ activeId, onNavigate }: AppNavigationBarProps) {
   const { data: currentUser, loading, execute } = useCurrentUser();
   const pathname = usePathname();

   // Refetch user data when pathname changes (e.g., after user switch in DebugModal)
   useEffect(() => {
      execute();
   }, [pathname, execute]);

   const navigationItems = useMemo<NavigationItem[]>(() => {
      return [
         {
            id: 'activity',
            label: 'Activity',
            icon: '📊',
            hidden: false,
         },
         {
            id: 'you',
            label: 'You',
            icon: '👤',
            hidden: !currentUser,
         },
         {
            id: 'admin',
            label: 'Admin',
            icon: '⚙️',
            hidden: !currentUser?.isAdmin,
         },
      ];
   }, [currentUser]);

   if (loading) {
      return null;
   }

   return (
      <NavigationBar
         items={navigationItems}
         activeId={activeId}
         onNavigate={onNavigate}
      />
   );
}
