import { Theme } from "@/constants/theme";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

type PageIndicatorProps = {
   totalPages: number;
   currentPage: number;
   color: string;
   disabledColor: string;
   maxVisiblePages?: number;
};

export default function PageIndicator({
   totalPages,
   currentPage,
   color,
   disabledColor,
   maxVisiblePages
}: PageIndicatorProps) {
   const scaleAnimations = useRef<Animated.Value[]>([]);

   // Initialize or update animations when totalPages changes
   if (scaleAnimations.current.length !== totalPages) {
      scaleAnimations.current = Array.from(
         { length: totalPages }, 
         (_, i) => scaleAnimations.current[i] || new Animated.Value(0.8)
      );
   }

   useEffect(() => {
      scaleAnimations.current.forEach((anim, index) => {
         Animated.spring(anim, {
            toValue: index === currentPage ? 1 : 0.8,
            useNativeDriver: true,
            friction: 5,
            tension: 100,
         }).start();
      });
   }, [currentPage, totalPages]);

   if (totalPages === 0) {
      return null;
   }

   // Calculate visible page range
   const getVisiblePages = () => {
      if (!maxVisiblePages || maxVisiblePages >= totalPages) {
         return { pages: Array.from({ length: totalPages }, (_, i) => i), hasLeft: false, hasRight: false };
      }

      const half = Math.floor(maxVisiblePages / 2);
      let start = Math.max(0, currentPage - half);
      let end = Math.min(totalPages - 1, start + maxVisiblePages - 1);

      // Adjust start if we're at the end
      if (end - start + 1 < maxVisiblePages) {
         start = Math.max(0, end - maxVisiblePages + 1);
      }

      return {
         pages: Array.from({ length: end - start + 1 }, (_, i) => start + i),
         hasLeft: start > 0,
         hasRight: end < totalPages - 1
      };
   };

   const { pages: visiblePages, hasLeft, hasRight } = getVisiblePages();

   return (
      <View style={styles.container}>
         {hasLeft && (
            <View style={[styles.dot, styles.indicatorDot, { backgroundColor: disabledColor }]} />
         )}
         {visiblePages.map((pageIndex) => (
            <Animated.View
               key={pageIndex}
               style={[
                  styles.dot,
                  {
                     backgroundColor: pageIndex === currentPage ? color : disabledColor,
                     transform: [{ scale: scaleAnimations.current[pageIndex] }],
                  },
               ]}
            />
         ))}
         {hasRight && (
            <View style={[styles.dot, styles.indicatorDot, { backgroundColor: disabledColor }]} />
         )}
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: Theme.SPACING_3F,
      height: Theme.SPACING_2F,

   },
   dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
   },
   indicatorDot: {
      transform: [{ scale: 0.5 }],
      opacity: 0.6,
   },
});
