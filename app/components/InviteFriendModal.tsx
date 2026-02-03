import FormWizard from '@/components/FormWizard';
import { useAppServices } from '@/context';
import { InviteFriendForm } from '@/forms/InviteFriendForm';
import { UserProfileInviteRequest } from '@/lib/user';
import { Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface InviteFriendModalProps {
   visible: boolean;
   onClose: () => void;
   onSuccess?: () => void;
}

export default function InviteFriendModal({
   visible,
   onClose,
   onSuccess
}: InviteFriendModalProps) {
   const { userProfile } = useAppServices();

   const handleWizardResult = async (data: UserProfileInviteRequest) => {
      try {
         await userProfile.inviteUser(data);
         onClose();
         onSuccess?.();
      } catch (error) {
         Alert.alert(
            'Error',
            `${error}`,
            [{ text: 'OK' }]
         );
         onClose();
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
               form={InviteFriendForm}
               initialData={{
                  name: '',
                  targetUserEmail: '',
                  message: '',
               }}
               onSubmit={(data) => {
                  const submitData: UserProfileInviteRequest = {
                     name: data.name as string,
                     targetUserEmail: data.targetUserEmail as string,
                     message: data.message as string | undefined,
                  };
                  handleWizardResult(submitData);
               }}
               onCancel={onClose}
            />
         </SafeAreaView>
      </Modal>
   );
}
