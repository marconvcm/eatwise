import { Theme } from "@/constants/theme";
import { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";

type EntryButtonProps = {
   children?: ReactNode;
   onPress?: () => void;
};

export default function EntryButton({ children, onPress }: EntryButtonProps) {
   return (
      <Pressable
         onPress={onPress}
         style={({ pressed }) => [
            styles.container,
            pressed && styles.pressed
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
   );
}

const styles = StyleSheet.create({
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
});
