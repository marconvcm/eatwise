import { TextProps } from 'react-native';
import { Typography } from './Typography';

interface DateHeaderProps extends TextProps {
   date: string;
}

export function DateHeader({ date, style, ...props }: DateHeaderProps) {
   const dateString = new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
   return (
      <Typography variant="header1" style={style} {...props}>{dateString}</Typography>
   );
}
