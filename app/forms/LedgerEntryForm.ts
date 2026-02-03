import { Form } from "@/lib/forms/Form";
import { LedgerEntryRequest } from "@/lib/ledger";
import { range } from "@/lib/utils";


export const LedgerEntryForm: Partial<Form<LedgerEntryRequest & { asOf: string }>> = {
   id: "ledger-entry-form",
   fields: {
      "subject": {
         label: "What did you eat?",
         type: "autocomplete",
         placeholder: "",
         hint: "HINT: As you type, suggestions will appear based on common meals.",
         validations: [
            { type: "required", message: "Meal is required." }
         ]
      },
      "calories": {
         label: "How many calories?",
         type: "number",
         placeholder: "e.g., 500",
         hint: "Enter the estimated calorie content of your meal. Use plus and minus to adjust in 10 kcal increments.",
         validations: [
            { type: "required", message: "Calories are required." },
            { type: "min", value: 0, message: "Calories cannot be negative." },
         ],
         boundaries: { min: 0, max: 2000, step: 10 },
         options: [
            "20", "50", "100", "150",
            "250", "300", "350",
            "400", "450", "500", "600",
            "700", "800", "900",
            "1000", "1200", "1500",
            "1800", "2000"
         ]
      },
      "asOf": {
         label: "When did you eat?",
         type: "time",
         placeholder: "Select time",
         hint: "Use plus and minus to adjust hours and minutes in 00:05 increments.",
         boundaries: { step: 5 },
         validations: [
            { type: "required", message: "Time is required." }
         ],
         options: range(0, 24).map(hour => `${hour.toString().padStart(2, '0')}:00`)
      }
   },
   submitLabel: "Submit",
   defaultNextButtonLabel: "Next",
   allowPrematureDismissal: true,
}
