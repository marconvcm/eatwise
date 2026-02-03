import { Theme } from "@/constants/theme";
import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type EntryButtonProps = {
   children?: ReactNode;
   onPress?: () => void;
   editMode?: boolean;
   badgeText?: string;
   onBadgePress?: () => void;
   coma?: boolean;
};

export default function EntryButton({ children, onPress, editMode, badgeText, onBadgePress, coma }: EntryButtonProps) {
   return (
      <View style={styles.wrapper}>
         <Pressable
            onPress={editMode ? undefined : onPress}
            style={({ pressed }) => [
               styles.container,
               pressed && !editMode && styles.pressed,
               coma && styles.coma
            ]}
         >
            {children ? (
               children
            ) : (
               <View style={styles.plusContainer}>
                  <View style={styles.plusHorizontal} />
                  <View style={styles.plusVertical} />
               </View>
            )}
         </Pressable>
         {editMode && (
            <Pressable 
               style={({ pressed }) => [
                  styles.badge,
                  pressed && styles.badgePressed,
                  coma && { backgroundColor: Theme.COLORS.primary.light }
               ]}
               onPress={onBadgePress}
            >
               <Text style={styles.badgeText}>{badgeText || '×'}</Text>
            </Pressable>
         )}
      </View>
   );
}

const styles = StyleSheet.create({
   wrapper: {
      position: 'relative',
   },
   container: {
      aspectRatio: 16 / 12,
      backgroundColor: Theme.COLORS.surface.light,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: Theme.COLORS.border.light,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: Theme.COLORS.border.base,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
   },
   pressed: {
      opacity: 0.7,
      backgroundColor: Theme.COLORS.surface.dark,
   },
   badge: {
      position: 'absolute',
      top: -8,
      left: -8,
      paddingHorizontal: Theme.SPACING_4F,
      paddingVertical: 2,
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 14,
      backgroundColor: Theme.COLORS.error.base,
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3,
      elevation: 5,
   },
   badgePressed: {
      opacity: 0.7,
      transform: [{ scale: 0.95 }],
   },
   badgeText: {
      color: Theme.COLORS.surface.base,
      fontSize: 14,
      fontWeight: '700',
      fontFamily: 'Manrope_700Bold',
   },
   plusContainer: {
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
   },
   plusHorizontal: {
      position: "absolute",
      width: 40,
      height: 4,
      backgroundColor: Theme.COLORS.border.light,
      borderRadius: 2,
   },
   plusVertical: {
      position: "absolute",
      width: 4,
      height: 40,
      backgroundColor: Theme.COLORS.border.light,
      borderRadius: 2,
   },
   coma: {
      opacity: 0.5,
      transform: [{ scale: 0.80 }],
   }
});
