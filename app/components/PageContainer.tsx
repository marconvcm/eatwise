import { Theme } from '@/constants/theme';
import { Pressable, StyleSheet, Text, View, ViewProps } from 'react-native';
import { DateHeader } from './DateHeader';

interface ActionButton {
   id: string;
   icon?: string;
   text?: string;
   hidden?: boolean;
   color?: string;
   textColor?: string;
}

interface PageContainerProps extends ViewProps {
   date: string;
   actionButtons?: ActionButton[];
   onActionPress?: (id: string) => void;
}

export function PageContainer({ date, actionButtons, onActionPress, style, ...props }: PageContainerProps) {
   return (
      <View style={{
         flex: 1,
         flexDirection: 'column',

      }} {...props}>
         <View style={styles.headerContainer}>
            <DateHeader date={date}></DateHeader>
            {actionButtons && actionButtons.length > 0 && (
               <View style={styles.actionsContainer}>
                  {actionButtons.filter(button => !button.hidden).map((button) => (
                     <Pressable
                        key={button.id}
                        style={[
                           styles.actionButton,
                           button.text && styles.actionButtonWithText,
                           button.color && { backgroundColor: button.color }
                        ]}
                        onPress={() => onActionPress?.(button.id)}
                     >
                        {button.icon && (
                           <Text style={[
                              styles.actionButtonIcon,
                              button.textColor && { color: button.textColor }
                           ]}>
                              {button.icon}
                           </Text>
                        )}
                        <Text style={[
                           styles.actionButtonText,
                           button.icon && button.text && styles.actionButtonTextWithIcon,
                           button.textColor && { color: button.textColor }
                        ]}>
                           {button.text || (!button.icon && button.id.charAt(0).toUpperCase())}
                        </Text>
                     </Pressable>
                  ))}
               </View>
            )}
         </View>
         
         {props.children}
         
      </View>
   )
}

const styles = StyleSheet.create({
   headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Theme.SPACING_2F,
   },
   actionsContainer: {
      flexDirection: 'row',
      gap: Theme.SPACING_2F,
   },
   actionButton: {
      height: Theme.SPACING_HF,
      paddingHorizontal: Theme.SPACING_2F,
      borderRadius: Theme.SPACING_4F,
      backgroundColor: Theme.COLORS.primary.base,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Theme.SPACING_4F,
   },
   actionButtonWithText: {
      paddingHorizontal: Theme.SPACING_3F,
   },
   actionButtonIcon: {
      fontSize: 18,
   },
   actionButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: Theme.COLORS.surface.base,
      fontFamily: 'Manrope_600SemiBold',
   },
   actionButtonTextWithIcon: {
      fontSize: 12,
   },
});
