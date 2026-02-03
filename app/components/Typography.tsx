import { Theme } from '@/constants/theme';
import { StyleSheet, Text, TextProps } from 'react-native';

type TextVariant = 'header' | 'header1' | 'subtitle' | 'normal' | 'caption';

interface TypographyProps extends TextProps {
   variant?: TextVariant;
   children: React.ReactNode;
}

export function Typography({ variant = 'normal', style, children, ...props }: TypographyProps) {
   const variantStyle = styles[variant];
   return (
      <Text style={[variantStyle, style]} {...props}>
         {children}
      </Text>
   );
}

const styles = StyleSheet.create({
   header: {
      fontFamily: 'Manrope_700Bold',
      fontSize: Theme.FONT_SIZE_2X,
      color: Theme.COLORS.text.base,
      letterSpacing: -2.5
   },
   header1: {
      fontFamily: 'Manrope_700Bold',
      fontSize: Theme.FONT_SIZE_2X * 0.8,
      color: Theme.COLORS.text.base,
      letterSpacing: -2.0
   },
   subtitle: {
      fontFamily: 'Manrope_600SemiBold',
      fontSize: Theme.FONT_SIZE_2X * 0.75,
      color: Theme.COLORS.text.lighter,
      letterSpacing: -2.5,
   },
   normal: {
      fontFamily: 'Manrope_400Regular',
      fontSize: Theme.FONT_SIZE,
      color: Theme.COLORS.text.base,
      letterSpacing: -0.5
   },
   caption: {
      fontFamily: 'Manrope_500Medium',
      fontSize: Theme.FONT_SIZE,
      color: Theme.COLORS.text.lighter,
      fontVariant: ['small-caps'],
      letterSpacing: -1,
   },
});
