
export type FormPresentation = 'wizard' | 'stack';

export type FormFieldType = 'text' | 'email' | 'number' | 'date' | 'select' | 'autocomplete' | 'time' | 'textarea';

export type Form<Output> = {
   id: string;
   fields: Partial<Record<keyof Output, FormField>>;
   submitLabel: string;
   defaultNextButtonLabel: string;
   allowPrematureDismissal: boolean;
   nextButtonLabel: Partial<Record<keyof Output, string>>;
   onSubmit: (data: Record<string, any>) => Promise<Output> | Output;
}

export type FormField = {
   label: string;
   placeholder?: string;
   hint?: string;
   type: FormFieldType;
   boundaries?: { min?: number; max?: number; step?: number; };
   options?: string[];
   validations?: ValidationConstraint[];
}

export type ValidationConstraint = {
   type: 'required' | 'minLength' | 'maxLength' | 'min' | 'max' | 'pattern' | 'custom' | 'email';
   value?: number | string | RegExp;
   message: string;
   validate?: (value: any) => boolean;
}