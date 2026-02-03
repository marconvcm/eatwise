import { Theme } from "@/constants/theme";
import type { Form, FormField, ValidationConstraint } from "@/lib/forms/Form";
import { useEffect, useRef, useState } from "react";
import { Animated, Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

type FormWizardProps<T> = {
   form: Partial<Form<T>>;
   onSubmit: (data: T, dataId?: string | number) => void;
   onCancel?: () => void;
   initialData?: Partial<T>;
   dataId?: string | number;
   autoCompleteValueLookup?: (value: string, fieldName: keyof T) => Promise<Record<string, string>>;
   autoCompleteValuePickup?: (key: string, fieldName: keyof T, currentData: Partial<T>) => Promise<Partial<T>>;
};

export default function FormWizard<T extends Record<string, any>>({
   form,
   onSubmit,
   onCancel,
   initialData,
   dataId,
   autoCompleteValueLookup,
   autoCompleteValuePickup
}: FormWizardProps<T>) {
   const fields = Object.entries(form.fields || {}) as [keyof T, FormField][];
   
   // Convert time fields from HH:MM format to minutes for internal use
   const processedInitialData = initialData ? { ...initialData } : {};
   if (initialData) {
      fields.forEach(([key, field]) => {
         if (field.type === 'time' && initialData[key]) {
            const timeStr = initialData[key] as string;
            if (typeof timeStr === 'string' && timeStr.includes(':')) {
               const [hours, mins] = timeStr.split(':').map(Number);
               processedInitialData[key] = (hours * 60 + mins) as any;
            }
         }
      });
   }
   
   const [currentStep, setCurrentStep] = useState(0);
   const [formData, setFormData] = useState<Partial<T>>(processedInitialData || {});
   const [errors, setErrors] = useState<Record<string, string>>({});
   const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<Record<string, string>>({});
   const [isSubmitting, setIsSubmitting] = useState(false);

   const fadeAnim = useRef(new Animated.Value(1)).current;
   const slideAnim = useRef(new Animated.Value(0)).current;
   const inputRef = useRef<TextInput>(null);

   // Animate on step change
   useEffect(() => {
      fadeAnim.setValue(0);
      slideAnim.setValue(20);
      Animated.parallel([
         Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
         }),
         Animated.spring(slideAnim, {
            toValue: 0,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
         }),
      ]).start(() => {
         // Auto-focus input after animation completes
         setTimeout(() => {
            if (inputRef.current) {
               inputRef.current.focus();
            }
         }, 50);
      });
      
      // Clear autocomplete suggestions when changing steps
      setAutocompleteSuggestions({});
   }, [currentStep]);

   const currentField = fields[currentStep];
   const isLastStep = currentStep === fields.length - 1;

   // Validate a single field
   const validateField = (fieldName: keyof T, value: any): string | null => {
      const field = form.fields?.[fieldName];
      if (!field?.validations) return null;

      for (const validation of field.validations) {
         if (!isValidConstraint(validation, value)) {
            return validation.message;
         }
      }
      return null;
   };

   // Check if a validation constraint is satisfied
   const isValidConstraint = (constraint: ValidationConstraint, value: any): boolean => {
      switch (constraint.type) {
         case "required":
            return value !== undefined && value !== null && value !== "";
         case "minLength":
            return typeof value === "string" && value.length >= (constraint.value as number);
         case "maxLength":
            return typeof value === "string" && value.length <= (constraint.value as number);
         case "min":
            return typeof value === "number" && value >= (constraint.value as number);
         case "max":
            return typeof value === "number" && value <= (constraint.value as number);
         case "pattern":
            return typeof value === "string" && (constraint.value as RegExp).test(value);
         case "email":
            if (typeof value !== "string") return false;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value);
         case "custom":
            return constraint.validate ? constraint.validate(value) : true;
         default:
            return true;
      }
   };

   // Handle field value change
   const handleFieldChange = (fieldName: keyof T, value: any) => {
      setFormData((prev) => ({ ...prev, [fieldName]: value }));
      // Clear error when user starts typing
      if (errors[fieldName as string]) {
         setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[fieldName as string];
            return newErrors;
         });
      }
   };

   // Handle next button
   const handleNext = () => {
      if (!currentField) return;

      const [fieldName, fieldConfig] = currentField;
      const value = formData[fieldName];
      const error = validateField(fieldName, value);

      if (error) {
         setErrors({ [fieldName as string]: error });
         return;
      }

      if (isLastStep) {
         // Convert time fields from minutes to HH:MM format before submitting
         const formattedData = { ...formData };
         fields.forEach(([key, field]) => {
            if (field.type === 'time' && formattedData[key] !== undefined) {
               const minutes = formattedData[key] as number;
               const hours = Math.floor(minutes / 60);
               const mins = minutes % 60;
               formattedData[key] = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}` as any;
            }
         });
         setIsSubmitting(true);
         onSubmit(formattedData as T, dataId);
      } else {
         setCurrentStep((prev) => prev + 1);
      }
   };

   // Handle back button
   const handleBack = () => {
      if (currentStep > 0) {
         setCurrentStep((prev) => prev - 1);
      }
   };

   // Render input based on field type
   const renderField = (fieldName: keyof T, field: FormField) => {
      const value = formData[fieldName];

      // Helper for number increment/decrement
      const handleNumberChange = (increment: boolean) => {
         const currentValue = (value as number) || field.boundaries?.min || 0;
         const step = field.boundaries?.step || 1;
         const min = field.boundaries?.min ?? -Infinity;
         const max = field.boundaries?.max ?? Infinity;

         let newValue = increment ? currentValue + step : currentValue - step;
         newValue = Math.max(min, Math.min(max, newValue));

         handleFieldChange(fieldName, newValue);
      };

      switch (field.type) {
         case "text":
            return (
               <TextInput
                  ref={inputRef}
                  style={[styles.input, errors[fieldName as string] && styles.inputError]}
                  value={value?.toString() || ""}
                  onChangeText={(text) => handleFieldChange(fieldName, text)}
                  returnKeyType="done"
                  onSubmitEditing={handleNext}
               />
            );

         case "email":
            return (
               <TextInput
                  ref={inputRef}
                  style={[styles.input, errors[fieldName as string] && styles.inputError]}
                  value={value?.toString() || ""}
                  onChangeText={(text) => handleFieldChange(fieldName, text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  returnKeyType="done"
                  onSubmitEditing={handleNext}
               />
            );

         case "number":
            return (
               <View style={styles.sliderContainer}>
                  <View style={styles.numberInputContainer}>
                     <Pressable
                        style={styles.numberButton}
                        onPress={() => handleNumberChange(false)}
                     >
                        <Text style={styles.numberButtonText}>−</Text>
                     </Pressable>
                     <Text style={styles.sliderValue}>{value || field.boundaries?.min || 0}</Text>
                     <Pressable
                        style={styles.numberButton}
                        onPress={() => handleNumberChange(true)}
                     >
                        <Text style={styles.numberButtonText}>+</Text>
                     </Pressable>
                  </View>
                  {field.options && (
                     <View style={styles.optionsGrid}>
                        {field.options.map((option) => (
                           <Pressable
                              key={option}
                              style={[
                                 styles.optionButton,
                                 value?.toString() === option && styles.optionButtonActive,
                              ]}
                              onPress={() => handleFieldChange(fieldName, parseFloat(option))}
                           >
                              <Text
                                 style={[
                                    styles.optionText,
                                    value?.toString() === option && styles.optionTextActive,
                                 ]}
                              >
                                 {option}
                              </Text>
                           </Pressable>
                        ))}
                     </View>
                  )}
               </View>
            );

         case "select":
            return (
               <View style={styles.optionsGrid}>
                  {field.options?.map((option) => (
                     <Pressable
                        key={option}
                        style={[
                           styles.optionButton,
                           value === option && styles.optionButtonActive,
                        ]}
                        onPress={() => handleFieldChange(fieldName, option)}
                     >
                        <Text
                           style={[
                              styles.optionText,
                              value === option && styles.optionTextActive,
                           ]}
                        >
                           {option}
                        </Text>
                     </Pressable>
                  ))}
               </View>
            );

         case "date":
            return (
               <TextInput
                  style={[styles.input, errors[fieldName as string] && styles.inputError]}
                  placeholder={field.placeholder || "YYYY-MM-DD"}
                  placeholderTextColor={Theme.COLORS.text.lighter}
                  value={value?.toString() || ""}
                  onChangeText={(text) => handleFieldChange(fieldName, text)}
               />
            );

         case "time":
            // Helper for time increment/decrement with wrap-around
            const handleTimeChange = (increment: boolean) => {
               // Value is stored as total minutes (0-1439)
               const currentMinutes = (value as number) || 0;
               const step = field.boundaries?.step || 1; // step in minutes
               
               let newMinutes = increment ? currentMinutes + step : currentMinutes - step;
               
               // Wrap around: 0-1439 (24 hours * 60 minutes - 1)
               if (newMinutes < 0) {
                  newMinutes = 1440 + newMinutes; // wrap to end of day
               } else if (newMinutes >= 1440) {
                  newMinutes = newMinutes - 1440; // wrap to start of day
               }
               
               handleFieldChange(fieldName, newMinutes);
            };
            
            // Convert minutes to HH:MM format
            const minutesToTimeString = (minutes: number): string => {
               if (minutes === undefined || minutes === null) return "00:00";
               const hours = Math.floor(minutes / 60);
               const mins = minutes % 60;
               return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
            };
            
            // Convert HH:MM format to minutes
            const timeStringToMinutes = (timeStr: string): number => {
               const [hours, mins] = timeStr.split(':').map(Number);
               return hours * 60 + mins;
            };
            
            return (
               <View style={styles.sliderContainer}>
                  <View style={styles.numberInputContainer}>
                     <Pressable
                        style={styles.numberButton}
                        onPress={() => handleTimeChange(false)}
                     >
                        <Text style={styles.numberButtonText}>−</Text>
                     </Pressable>
                     <Text style={styles.sliderValue}>
                        {minutesToTimeString(value as number || 0)}
                     </Text>
                     <Pressable
                        style={styles.numberButton}
                        onPress={() => handleTimeChange(true)}
                     >
                        <Text style={styles.numberButtonText}>+</Text>
                     </Pressable>
                  </View>
                  {field.options && (
                     <View style={styles.optionsGrid}>
                        {field.options.map((option) => {
                           const optionMinutes = timeStringToMinutes(option);
                           return (
                              <Pressable
                                 key={option}
                                 style={[
                                    styles.optionButton,
                                    value === optionMinutes && styles.optionButtonActive,
                                 ]}
                                 onPress={() => handleFieldChange(fieldName, optionMinutes)}
                              >
                                 <Text
                                    style={[
                                       styles.optionText,
                                       value === optionMinutes && styles.optionTextActive,
                                    ]}
                                 >
                                    {option}
                                 </Text>
                              </Pressable>
                           );
                        })}
                     </View>
                  )}
               </View>
            );

         case "autocomplete":
            return (
               <View style={styles.autocompleteContainer}>
                  <TextInput
                     style={[styles.input, errors[fieldName as string] && styles.inputError]}
                     value={value?.toString() || ""}
                     onChangeText={async (text) => {
                        handleFieldChange(fieldName, text);
                        if (autoCompleteValueLookup && text) {
                           try {
                              const suggestions = await autoCompleteValueLookup(text, fieldName);
                              setAutocompleteSuggestions(suggestions);
                           } catch (error) {
                              console.error('Error fetching autocomplete suggestions:', error);
                              setAutocompleteSuggestions({});
                           }
                        } else {
                           setAutocompleteSuggestions({});
                        }
                     }}
                  />
                  {Object.keys(autocompleteSuggestions).length > 0 && (
                     <ScrollView
                        style={styles.suggestionsContainer}
                        keyboardShouldPersistTaps="handled"
                        nestedScrollEnabled={true}
                     >
                        {Object.entries(autocompleteSuggestions).map(([key, suggestion], index) => (
                           <Pressable
                              key={index}
                              style={styles.suggestionItem}
                              onPress={async () => {
                                 Keyboard.dismiss();
                                 if (autoCompleteValuePickup) {
                                    try {
                                       const updatedData = await autoCompleteValuePickup(key, fieldName, formData);
                                       setFormData(updatedData);
                                    } catch (error) {
                                       console.error('Error picking autocomplete value:', error);
                                    }
                                 } else {
                                    handleFieldChange(fieldName, suggestion);
                                 }
                                 setAutocompleteSuggestions({});
                              }}
                           >
                              <Text style={styles.suggestionText}>{suggestion}</Text>
                           </Pressable>
                        ))}
                     </ScrollView>
                  )}
               </View>
            );

         case "textarea":
            return (
               <TextInput
                  ref={inputRef}
                  style={[styles.input, styles.textarea, errors[fieldName as string] && styles.inputError]}
                  value={value?.toString() || ""}
                  onChangeText={(text) => handleFieldChange(fieldName, text)}
                  multiline
                  numberOfLines={4}
                  placeholder={field.placeholder}
                  placeholderTextColor={Theme.COLORS.text.lighter}
                  blurOnSubmit={true}
                  returnKeyType="done"
               />
            );

         default:
            return (
               <TextInput
                  style={[styles.input, errors[fieldName as string] && styles.inputError]}
                  value={value?.toString() || ""}
                  onChangeText={(text) => handleFieldChange(fieldName, text)}
               />
            );
      }
   };

   if (!currentField) {
      return null;
   }

   const [fieldName, fieldConfig] = currentField;

   return (
      <View style={styles.container}>
         <View style={styles.headerRow}>
            <View style={styles.header}>
               <Text style={styles.stepIndicator}>
                  Step {currentStep + 1} of {fields.length}
               </Text>
               <Text style={styles.label}>{fieldConfig.label}</Text>
               {fieldConfig.hint && <Text style={styles.hint}>{fieldConfig.hint}</Text>}
            </View>
            {onCancel && (
               <Pressable style={styles.closeButton} onPress={onCancel}>
                  <Text style={styles.closeButtonText}>✕</Text>
               </Pressable>
            )}
         </View>

         <Animated.View
            style={[
               styles.fieldContainer,
               {
                  opacity: fadeAnim,
                  transform: [{ translateX: slideAnim }],
               },
            ]}
         >
            {renderField(fieldName, fieldConfig)}
            {errors[fieldName as string] && (
               <Text style={styles.errorText}>{errors[fieldName as string]}</Text>
            )}
         </Animated.View>

         <View style={styles.actions}>
            {currentStep > 0 && (
               <Pressable style={[styles.button, styles.secondaryButton]} onPress={handleBack}>
                  <Text style={styles.secondaryButtonText}>Back</Text>
               </Pressable>
            )}
            {currentStep === 0 && onCancel && (
               <Pressable style={[styles.button, styles.secondaryButton]} onPress={onCancel}>
                  <Text style={styles.secondaryButtonText}>Cancel</Text>
               </Pressable>
            )}
            <Pressable 
               style={[styles.button, styles.primaryButton, isSubmitting && styles.buttonDisabled]} 
               onPress={handleNext}
               disabled={isSubmitting}
            >
               <Text style={styles.primaryButtonText}>
                  {isSubmitting ? "Submitting..." : isLastStep
                     ? form.submitLabel || "Submit"
                     : form.nextButtonLabel?.[fields[currentStep][0]] || form.defaultNextButtonLabel || "Next"}
               </Text>
            </Pressable>
         </View>
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      padding: Theme.SPACING_2F,
      gap: Theme.SPACING_2F,
   },
   headerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: Theme.SPACING_2F,
   },
   header: {
      flex: 1,
      gap: Theme.SPACING_4F,
   },
   closeButton: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 16,
   },
   closeButtonText: {
      fontSize: 24,
      color: Theme.COLORS.border.light,
      lineHeight: 24,
   },
   pager: {
      flex: 1,
   },
   page: {
      flex: 1,
      gap: Theme.SPACING_2F,
   },
   pageHeader: {
      gap: Theme.SPACING_4F,
   },
   stepIndicator: {
      fontSize: 14,
      fontWeight: "500",
      color: Theme.COLORS.text.lighter,
      fontFamily: "Manrope_500Medium",
   },
   label: {
      fontSize: 24,
      fontWeight: "700",
      letterSpacing: -1,
      color: Theme.COLORS.text.base,
      fontFamily: "Manrope_700Bold",
   },
   hint: {
      fontSize: 14,
      color: Theme.COLORS.text.lighter,
      fontFamily: "Manrope_400Regular",
   },
   fieldContainer: {
      flex: 1,
      gap: Theme.SPACING_4F,
   },
   autocompleteContainer: {
      gap: Theme.SPACING_2F,
      zIndex: 1000,
   },
   suggestionsContainer: {
      borderWidth: 1,
      borderColor: Theme.COLORS.border.base,
      borderRadius: 8,
      backgroundColor: Theme.COLORS.surface.base,
      maxHeight: 200,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
   },
   suggestionItem: {
      padding: Theme.SPACING_2F,
      borderBottomWidth: 1,
      borderBottomColor: Theme.COLORS.border.light,
   },
   suggestionText: {
      fontSize: 16,
      color: Theme.COLORS.text.base,
      fontFamily: "Manrope_400Regular",
   },
   input: {
      borderWidth: 1,
      borderColor: Theme.COLORS.border.base,
      borderRadius: 8,
      padding: Theme.SPACING_2F,
      fontSize: 16,
      fontFamily: "Manrope_400Regular",
      backgroundColor: Theme.COLORS.surface.base,
   },
   textarea: {
      minHeight: 120,
      textAlignVertical: "top",
   },
   inputError: {
      borderColor: Theme.COLORS.error.base,
   },
   errorText: {
      fontSize: 14,
      color: Theme.COLORS.error.base,
      fontFamily: "Manrope_400Regular",
   },
   numberInputContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: Theme.SPACING_2F,
   },
   numberButton: {
      width: 56,
      height: 56,
      borderRadius: 12,
      backgroundColor: Theme.COLORS.primary.base,
      alignItems: "center",
      justifyContent: "center",
   },
   numberButtonText: {
      fontSize: 32,
      fontWeight: "700",
      color: Theme.COLORS.surface.base,
      fontFamily: "Manrope_700Bold",
   },
   sliderContainer: {
      gap: Theme.SPACING_2F,
   },
   sliderValue: {
      fontSize: 48,
      fontWeight: "700",
      color: Theme.COLORS.primary.base,
      fontFamily: "Manrope_700Bold",
      textAlign: "center",
      flex: 1,
   },
   optionsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: Theme.SPACING_4F,
      justifyContent: "flex-start",
   },
   optionButton: {
      paddingVertical: Theme.SPACING_4F,
      paddingHorizontal: Theme.SPACING_4F,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: Theme.COLORS.border.base,
      backgroundColor: Theme.COLORS.surface.base,
      width: Theme.SPACING_2X,
      alignItems: "center",
   },
   optionButtonActive: {
      backgroundColor: Theme.COLORS.primary.base,
      borderColor: Theme.COLORS.primary.base,
   },
   optionText: {
      fontSize: 16,
      fontWeight: "500",
      color: Theme.COLORS.text.base,
      fontFamily: "Manrope_500Medium",
   },
   optionTextActive: {
      color: Theme.COLORS.surface.base,
   },
   actions: {
      flexDirection: "row",
      gap: Theme.SPACING_2F,
   },
   button: {
      flex: 1,
      paddingVertical: Theme.SPACING_2F,
      borderRadius: Theme.SPACING_3F,
      alignItems: "center",
      justifyContent: "center",
   },
   primaryButton: {
      backgroundColor: Theme.COLORS.primary.base,
   },
   buttonDisabled: {
      opacity: 0.5,
   },
   primaryButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: Theme.COLORS.surface.base,
      fontFamily: "Manrope_600SemiBold",
   },
   secondaryButton: {
      backgroundColor: Theme.COLORS.surface.light,
      borderWidth: 1,
      borderColor: Theme.COLORS.border.base,
   },
   secondaryButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: Theme.COLORS.text.base,
      fontFamily: "Manrope_600SemiBold",
   },
});
