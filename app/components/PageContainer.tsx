import { Theme } from '@/constants/theme';
import { View, ViewProps } from 'react-native';
import { DateHeader } from './DateHeader';

interface PageContainerProps extends ViewProps {
   date: string;
}

export function PageContainer({ date, style, ...props }: PageContainerProps) {
   return (
      <View style={{
         flex: 1,
         flexDirection: 'column',

      }} {...props}>
         <View style={{ paddingHorizontal: Theme.SPACING_2F }}>
            <DateHeader date={date}></DateHeader>
         </View>
         
         {props.children}
         
      </View>
   )
}
