import { Form } from "@/lib/forms/Form";
import { UserProfileInviteRequest } from "@/lib/user";


export const InviteFriendForm: Partial<Form<UserProfileInviteRequest>> = {
   id: "invite-friend-form",
   fields: {
      "name": {
         label: "What is your friend's name?",
         type: "text",
         placeholder: "",
         hint: "HINT: Enter your friend's full name.",
         validations: [
            { type: "required", message: "Friend's name is required." }
         ]
      },
      "targetUserEmail": {
         label: "What is your friend's email?",
         type: "email",
         placeholder: "",
         hint: "HINT: Enter a valid email address.",
         validations: [
            { type: "required", message: "Email is required." },
            { type: "email", message: "Please enter a valid email address." }
         ]
      },
      "message": {
         label: "What message would you like to include?",
         type: "textarea",
         placeholder: "Enter your message",
         hint: "You can include a personal message to your friend.",
         validations: [
            { type: "maxLength", value: 500, message: "Message cannot exceed 500 characters." }
         ],
      }
   },
   submitLabel: "Submit",
   defaultNextButtonLabel: "Next",
   allowPrematureDismissal: true,
}
