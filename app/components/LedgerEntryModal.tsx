import FormWizard from '@/components/FormWizard';
import { useAppServices } from '@/context';
import { LedgerEntryForm } from '@/forms/LedgerEntryForm';
import { FoodSearchService } from '@/lib/food';
import { HttpClientError } from '@/lib/http';
import { LedgerEntryRequest } from '@/lib/ledger';
import type { LedgerEntry } from '@/lib/ledger/types/LedgerEntry';
import { Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface LedgerEntryModalProps {
   visible: boolean;
   currentDay: string;
   currentEntry: LedgerEntry | null;
   onClose: () => void;
   onSuccess?: () => void;
   useAdminService?: boolean;
}

export default function LedgerEntryModal({ 
   visible, 
   currentDay, 
   currentEntry, 
   onClose,
   onSuccess,
   useAdminService = false
}: LedgerEntryModalProps) {
   const { ledger, ledgerAdmin } = useAppServices();
   const service = useAdminService ? ledgerAdmin : ledger;

   const getAsOf = (): string => {
      if (currentEntry) {
         return new Date(currentEntry.registrationDate).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
         });
      } else {
         return new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
         });
      }
   };

   const handleWizardResult = async (data: LedgerEntryRequest, dataId?: string | number): Promise<[string | null, boolean]> => {
      try {
         if (dataId) {
            await service.updateEntry(dataId.toString(), data);
         } else {
            await service.createEntry(data);
         }
         onClose();
         onSuccess?.();
         return [null, true];
      } catch (error: HttpClientError | any) {
         Alert.alert(
            'Error',
            `${error.detailsToString()}`,
            [{ text: 'OK' }]
         );
         
         if (error instanceof HttpClientError) {
            const firstKey = error.firstDetailsKey();
            if (firstKey) {
               return [firstKey, false];
            }
         }
         
         return [null, false];
      }
   };

   return (
      <Modal
         visible={visible}
         animationType="slide"
         presentationStyle="pageSheet"
         onRequestClose={onClose}
      >
         <SafeAreaView style={{ flex: 1 }}>
            <FormWizard
               form={LedgerEntryForm}
               initialData={{
                  subject: currentEntry ? currentEntry.subject : '',
                  calories: currentEntry ? currentEntry.calories : undefined,
                  asOf: getAsOf(),
               }}
               dataId={currentEntry?.id}
               autoCompleteValueLookup={async (value, field) => {
                  if (field === 'subject') {
                     return FoodSearchService.autoCompleteLookup(value);
                  }
                  return {};
               }}
               autoCompleteValuePickup={async (key, field, currentData) => {
                  if (field === 'subject') {
                     const foodData = await FoodSearchService.autoCompletePickup(key);
                     return { ...currentData, ...foodData };
                  }
                  return { ...currentData };
               }}
               onSubmit={async (data, dataId) => {
                  const submitData: LedgerEntryRequest = {
                     subject: data.subject as string,
                     calories: Number(data.calories),
                     registrationDate: currentDay + 'T' + data.asOf,
                  };
                  return handleWizardResult(submitData, dataId);
               }}
               onCancel={onClose}
            />
         </SafeAreaView>
      </Modal>
   );
}
