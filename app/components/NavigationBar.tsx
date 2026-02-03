import { Theme } from '@/constants/theme';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export interface NavigationItem {
   id: string;
   label: string;
   icon: string;
   hidden?: boolean;
}

interface NavigationBarProps {
   items: NavigationItem[];
   activeId: string;
   onNavigate: (id: string) => void;
}

export default function NavigationBar({ items, activeId, onNavigate }: NavigationBarProps) {
   const visibleItems = items.filter(item => !item.hidden);

   return (
      <View style={styles.container}>
         <View style={styles.bar}>
            {visibleItems.map((item) => {
               const isActive = item.id === activeId;
               return (
                  <Pressable
                     key={item.id}
                     style={styles.item}
                     onPress={() => onNavigate(item.id)}
                  >
                     <Text style={[
                        styles.icon,
                        isActive ? styles.iconActive : styles.iconInactive
                     ]}>
                        {item.icon}
                     </Text>
                     <Text style={[
                        styles.label,
                        isActive ? styles.labelActive : styles.labelInactive
                     ]}>
                        {item.label}
                     </Text>
                  </Pressable>
               );
            })}
         </View>
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      position: 'absolute',
      bottom: Theme.SPACING_2F,
      left: 0,
      right: 0,
      paddingHorizontal: Theme.SPACING_3F,
      paddingBottom: Theme.SPACING_3F,
      paddingTop: Theme.SPACING_2F,
      alignItems: 'center',
      justifyContent: 'center',
   },
   bar: {
      flexDirection: 'row',
      backgroundColor: Theme.COLORS.primary.base,
      borderRadius: Theme.SPACING,
      paddingVertical: Theme.SPACING_HF / 2,
      paddingHorizontal: Theme.SPACING,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
      gap: Theme.SPACING,
      alignSelf: 'center',
   },
   item: {
      alignItems: 'center',
      justifyContent: 'center',
   },
   icon: {
      fontSize: 24,
   },
   iconActive: {
      color: Theme.COLORS.surface.base,
      opacity: 1,
   },
   iconInactive: {
      color: Theme.COLORS.surface.base,
      opacity: 0.4,
   },
   label: {
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: -1,
      fontFamily: 'Manrope_600SemiBold',
   },
   labelActive: {
      color: Theme.COLORS.surface.base,
      opacity: 1,
   },
   labelInactive: {
      color: Theme.COLORS.surface.base,
      opacity: 0.4,
   },
});
