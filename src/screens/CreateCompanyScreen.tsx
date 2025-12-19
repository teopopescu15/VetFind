import React, { useState, useEffect } from 'react';
import { View, StyleSheet, BackHandler, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button, ActivityIndicator } from 'react-native-paper';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { EnhancedProgressIndicator } from '../components/FormComponents/EnhancedProgressIndicator';
import { Step1BasicInfo } from './CreateCompany/Step1BasicInfo';
import { Step2Location } from './CreateCompany/Step2Location';
import { Step3Services } from './CreateCompany/Step3Services';
import { Step4Pricing } from './CreateCompany/Step4Pricing';
import { CompanyFormData, FormErrors, CreateCompanyDTO, CreateServiceDTO, ServicePricingDTO, ServiceCategoryType } from '../types/company.types';
import { ApiService } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../types/navigation.types';
import { validateRomanianPhone, validateRomanianPostalCode, validateCUI } from '../utils/romanianValidation';
import { useCompany } from '../context/CompanyContext';
import { useAuth } from '../context/AuthContext';

/**
 * CreateCompanyScreen - Multi-step company profile creation
 *
 * Features:
 * - 4-step form with progress indicator
 * - Step validation before navigation
 * - State management for all form data
 * - Error handling per step
 * - Loading states during submission
 * - Prevent back navigation on Android (mandatory flow)
 * - Success navigation to Company Dashboard
 */
type NavigationProp = StackNavigationProp<RootStackParamList, 'CreateCompany'>;

export const CreateCompanyScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { setCompany } = useCompany();
  const { accessToken } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CompanyFormData>({
    step1: {},
    step2: {
      // Initialize with default opening hours so validation passes
      opening_hours: {
        monday: { open: '09:00', close: '17:00', closed: false },
        tuesday: { open: '09:00', close: '17:00', closed: false },
        wednesday: { open: '09:00', close: '17:00', closed: false },
        thursday: { open: '09:00', close: '17:00', closed: false },
        friday: { open: '09:00', close: '17:00', closed: false },
        saturday: { open: '09:00', close: '13:00', closed: false },
        sunday: { open: '09:00', close: '17:00', closed: true }
      }
    },
    step3: {
      // Initialize new hierarchical category/specialization arrays
      selected_categories: [],
      selected_specializations: [],
      // Initialize other arrays
      specializations: [],
      facilities: [],
      payment_methods: []
    },
    step4: {}
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const stepLabels = [
    'Basic Info',
    'Location & Contact',
    'Services & Specializations',
    'Pricing & Photos'
  ];

  // Debug: Log when currentStep changes
  useEffect(() => {
    console.log('=== CURRENT STEP CHANGED ===', currentStep);
  }, [currentStep]);

  // Prevent back navigation on Android (mandatory flow)
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      Alert.alert(
        'Exit Company Creation?',
        'Your progress will be lost. Are you sure you want to exit?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Exit',
            style: 'destructive',
            onPress: () => navigation.goBack()
          }
        ]
      );
      return true; // Prevent default back behavior
    });

    return () => backHandler.remove();
  }, [navigation]);

  // Validation functions for each step
  const validateStep1 = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    const { step1 } = formData;

    // Company name validation
    if (!step1.name || step1.name.trim().length < 3) {
      newErrors.name = 'Company name must be at least 3 characters';
    } else if (step1.name.length > 100) {
      newErrors.name = 'Company name must not exceed 100 characters';
    }

    // Email validation
    if (!step1.email) {
      newErrors.email = 'Business email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(step1.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Phone validation (Romanian format)
    if (!step1.phone) {
      newErrors.phone = 'Telefonul este obligatoriu';
    } else if (!validateRomanianPhone(step1.phone)) {
      newErrors.phone = 'Format invalid. Folosiți +40 XXX XXX XXX sau 07XX XXX XXX';
    }

    // CUI validation (if provided)
    if (step1.cui && !validateCUI(step1.cui)) {
      newErrors.cui = 'Format CUI invalid';
    } else if (!/^\+?1?\s*\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/.test(step1.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    // Description validation (optional but with limits)
    if (step1.description && step1.description.length > 100) {
      newErrors.description = 'Description must not exceed 100 characters';
    }

    setErrors({ step1: newErrors });
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    const { step2 } = formData;

    // Romanian Address validation
    if (!step2.street || step2.street.trim().length === 0) {
      newErrors.street = 'Strada este obligatorie';
    }

    if (!step2.streetNumber || step2.streetNumber.trim().length === 0) {
      newErrors.streetNumber = 'Numărul este obligatoriu';
    }

    if (!step2.city || step2.city.trim().length === 0) {
      newErrors.city = 'Orașul este obligatoriu';
    }

    if (!step2.county || step2.county.trim().length === 0) {
      newErrors.county = 'Județul este obligatoriu';
    }

    if (!step2.postalCode || step2.postalCode.trim().length === 0) {
      newErrors.postalCode = 'Codul poștal este obligatoriu';
    } else if (!validateRomanianPostalCode(step2.postalCode)) {
      newErrors.postalCode = 'Format invalid. Folosiți 6 cifre (ex: 010101)';
    }

    // Website validation (optional but must be valid URL if provided)
    if (step2.website && !/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(step2.website)) {
      newErrors.website = 'Invalid website URL';
    }

    // Opening hours validation
    if (!step2.opening_hours) {
      newErrors.opening_hours = 'Opening hours are required';
    } else {
      // Validate each day's schedule
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
      let hasInvalidDay = false;
      let invalidDayMessage = '';

      for (const day of days) {
        const schedule = step2.opening_hours[day];
        if (!schedule) continue;

        // If day is not closed, both open and close times are required
        if (!schedule.closed) {
          if (!schedule.open || !schedule.close) {
            hasInvalidDay = true;
            invalidDayMessage = `Please set opening hours for ${day} or mark it as closed`;
            break;
          }

          // Validate time format (HH:MM)
          const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
          if (!timeRegex.test(schedule.open) || !timeRegex.test(schedule.close)) {
            hasInvalidDay = true;
            invalidDayMessage = `Invalid time format for ${day}`;
            break;
          }

          // Validate close time is after open time
          const [openHour, openMin] = schedule.open.split(':').map(Number);
          const [closeHour, closeMin] = schedule.close.split(':').map(Number);
          const openMinutes = openHour * 60 + openMin;
          const closeMinutes = closeHour * 60 + closeMin;

          if (closeMinutes <= openMinutes) {
            hasInvalidDay = true;
            invalidDayMessage = `Closing time must be after opening time for ${day}`;
            break;
          }
        }
      }

      if (hasInvalidDay) {
        newErrors.opening_hours = invalidDayMessage;
      }
    }

    setErrors({ step2: newErrors });
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    const { step3 } = formData;

    // Clinic type validation
    if (!step3.clinic_type) {
      newErrors.clinic_type = 'Clinic type is required';
    }

    // Specializations validation (using new hierarchical selected_specializations)
    if (!step3.selected_specializations || step3.selected_specializations.length === 0) {
      newErrors.selected_specializations = 'At least 1 specialization is required';
    }

    // Facilities validation
    if (!step3.facilities || step3.facilities.length === 0) {
      newErrors.facilities = 'At least 1 facility is required';
    }

    // Payment methods validation
    if (!step3.payment_methods || step3.payment_methods.length === 0) {
      newErrors.payment_methods = 'At least 1 payment method is required';
    }

    setErrors({ step3: newErrors });
    return Object.keys(newErrors).length === 0;
  };

  const validateStep4 = (): boolean => {
    console.log('=== Validating Step 4 ===');
    const newErrors: { [key: string]: string } = {};
    const { step4 } = formData;

    console.log('Step 4 data:', step4);
    console.log('Description:', step4.description);
    console.log('Description length:', step4.description?.trim().length || 0);
    console.log('Services:', step4.services);
    console.log('Services count:', step4.services?.length || 0);

    // Full description validation
    if (!step4.description || step4.description.trim().length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
      console.log('Description validation failed');
    } else if (step4.description.length > 500) {
      newErrors.description = 'Description must not exceed 500 characters';
      console.log('Description too long');
    }

    // Services validation
    if (!step4.services || step4.services.length === 0) {
      newErrors.services = 'At least 1 service is required';
      console.log('Services validation failed - no services');
    } else {
      // Validate price ranges for each service
      const invalidPriceServices = step4.services.filter((service) => {
        if (service.price_min !== null && service.price_max !== null) {
          const min = parseFloat(service.price_min);
          const max = parseFloat(service.price_max);
          return !isNaN(min) && !isNaN(max) && min > max;
        }
        return false;
      });

      if (invalidPriceServices.length > 0) {
        newErrors.services = 'Some services have invalid price ranges (min > max)';
        console.log('Invalid price ranges detected');
      }
    }

    // Photos validation (optional, but max 10 if provided)
    if (step4.photos && step4.photos.length > 10) {
      newErrors.photos = 'Maximum 10 photos allowed';
      console.log('Too many photos');
    }

    console.log('Validation errors:', newErrors);
    console.log('Validation result:', Object.keys(newErrors).length === 0);

    setErrors({ step4: newErrors });
    return Object.keys(newErrors).length === 0;
  };

  // Handle Next button
  const handleNext = () => {
    let isValid = false;

    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      default:
        isValid = true;
    }

    if (isValid) {
      // Mark current step as completed (0-indexed for EnhancedProgressIndicator)
      const stepIndex = currentStep - 1;
      if (!completedSteps.includes(stepIndex)) {
        setCompletedSteps([...completedSteps, stepIndex]);
      }
      setCurrentStep(currentStep + 1);
      setErrors({}); // Clear errors when moving to next step
    }
  };

  // Handle Back button
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({}); // Clear errors when going back
    }
  };

  // Handle Submit
  const handleSubmit = async () => {
    // Immediate alert to confirm button click
    Alert.alert('Debug', 'Submit button clicked!');
    
    console.log('=== SUBMIT BUTTON CLICKED ===');
    console.log('Current step:', currentStep);
    console.log('Form data:', JSON.stringify(formData, null, 2));
    
    // Final validation
    const isValid = validateStep4();
    console.log('Step 4 validation result:', isValid);
    console.log('Validation errors:', errors);
    
    if (!isValid) {
      console.log('Validation failed, returning early');
      Alert.alert(
        'Validation Failed',
        'Please fill in all required fields correctly before submitting.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    console.log('Validation passed, proceeding with submission');

    try {
      setIsSubmitting(true);

      // Combine all form data - Send Romanian fields directly (backend now supports them!)
      console.log('=== PREPARING COMPANY DATA ===');
      console.log('Step 1 data:', formData.step1);
      console.log('Step 2 data:', formData.step2);
      console.log('Step 3 data:', formData.step3);
      console.log('Step 4 data:', formData.step4);

      const companyData: any = {
        // From Step 1
        name: formData.step1.name!,
        email: formData.step1.email!,
        phone: formData.step1.phone!,
        description: formData.step4.description || formData.step1.description,

        // From Step 2 - Send Romanian field names directly
        street: formData.step2.street!,
        streetNumber: formData.step2.streetNumber!,
        building: formData.step2.building,
        apartment: formData.step2.apartment,
        city: formData.step2.city!,
        county: formData.step2.county!, // Romanian: Județ
        postalCode: formData.step2.postalCode!, // Romanian: Cod poștal
        latitude: formData.step2.latitude,
        longitude: formData.step2.longitude,
        website: formData.step2.website,
        opening_hours: formData.step2.opening_hours!,

        // From Step 3
        clinicType: formData.step3.clinic_type!, // Send as clinicType
        specializations: formData.step3.specializations!,
        facilities: formData.step3.facilities!,
        payment_methods: formData.step3.payment_methods!,
        num_veterinarians: formData.step3.num_veterinarians,
        years_in_business: formData.step3.years_in_business,

        // From Step 4
        photos: formData.step4.photos || []
      };

      console.log('=== COMPANY DATA TO SEND ===', JSON.stringify(companyData, null, 2));

      // Upload logo if provided (Step 1)
      if (formData.step1.logo_url) {
        // Note: Logo upload will be handled separately after company creation
        // or as part of the company creation if the backend supports it
      }

      // Create company
      console.log('🔐 ACCESS TOKEN from useAuth():', accessToken ? `${accessToken.substring(0, 30)}...` : 'NULL/UNDEFINED');

      // Also check localStorage directly
      const localStorageToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      console.log('🔐 ACCESS TOKEN from localStorage:', localStorageToken ? `${localStorageToken.substring(0, 30)}...` : 'NULL/UNDEFINED');

      const tokenToUse = accessToken || localStorageToken;
      console.log('🔐 TOKEN TO USE:', tokenToUse ? `${tokenToUse.substring(0, 30)}...` : 'NONE - THIS WILL FAIL!');

      const createdCompany = await ApiService.createCompany(companyData, tokenToUse || undefined);

      // Create services (Step 4) - Convert ServicePricingDTO to CreateServiceDTO
      if (formData.step4.services && formData.step4.services.length > 0) {
        const servicesToCreate: CreateServiceDTO[] = formData.step4.services
          .filter((service: ServicePricingDTO) => {
            // Only include services with valid prices AND non-empty service names
            const hasValidPrices = service.price_min !== null && service.price_min !== '' &&
                                   service.price_max !== null && service.price_max !== '';
            const hasServiceName = service.service_name && service.service_name.trim() !== '';

            if (!hasServiceName) {
              console.error('❌ Filtered out service with empty name:', service);
            }

            return hasValidPrices && hasServiceName;
          })
          .map((service: ServicePricingDTO) => {
            const priceMin = parseFloat(service.price_min!);
            const priceMax = parseFloat(service.price_max!);

            return {
              category: (service.is_custom ? 'custom' : 'routine_care') as ServiceCategoryType,
              service_name: service.service_name,
              description: service.description,
              specialization_id: service.specialization_id,
              category_id: service.category_id, // Include category_id from ServicePricingDTO
              price_min: isNaN(priceMin) ? 0 : priceMin,
              price_max: isNaN(priceMax) ? 0 : priceMax,
              duration_minutes: service.duration_minutes,
              is_custom: service.is_custom,
            };
          });

        // Check if we have any services with valid prices
        if (servicesToCreate.length === 0) {
          console.warn('No services with valid prices to create');
        } else {
          console.log('📤 Sending services to backend:', servicesToCreate);
          await ApiService.bulkCreateServices(
            createdCompany.id,
            servicesToCreate,
            accessToken || undefined
          );
        }
      }

      // Upload logo if provided
      if (formData.step1.logo_url) {
        await ApiService.uploadCompanyPhoto(
          createdCompany.id,
          formData.step1.logo_url,
          accessToken || undefined
        );
      }

      // Upload photos if provided
      if (formData.step4.photos && formData.step4.photos.length > 0) {
        for (const photo of formData.step4.photos) {
          await ApiService.uploadCompanyPhoto(createdCompany.id, photo, accessToken || undefined);
        }
      }

      // Update company context with new company
      setCompany(createdCompany);
      console.log('Company created successfully:', createdCompany);

      // Success! Navigate to Success Screen
      navigation.navigate('CompanyCreatedSuccess', {
        companyId: createdCompany.id,
        companyName: createdCompany.name
      });
    } catch (error: any) {
      console.error('Error creating company:', error);

      let errorMessage = 'Failed to create company profile. Please try again.';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render current step
  const renderStep = () => {
    console.log('=== RENDERING STEP ===', currentStep);
    switch (currentStep) {
      case 1:
        return (
          <Step1BasicInfo
            data={formData.step1}
            onChange={(data) => setFormData({ ...formData, step1: data })}
            errors={errors.step1 || {}}
          />
        );
      case 2:
        return (
          <Step2Location
            data={formData.step2}
            onChange={(data) => setFormData({ ...formData, step2: data })}
            errors={errors.step2 || {}}
          />
        );
      case 3:
        return (
          <Step3Services
            data={formData.step3}
            onChange={(data) => setFormData({ ...formData, step3: data })}
            errors={errors.step3 || {}}
          />
        );
      case 4:
        return (
          <Step4Pricing
            data={formData.step4}
            onChange={(data) => setFormData({ ...formData, step4: data })}
            errors={errors.step4 || {}}
            selectedSpecializationIds={formData.step3.selected_specializations || []}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Enhanced Progress Indicator (Phase 3 Redesign) */}
      <EnhancedProgressIndicator
        currentStep={currentStep - 1} // Convert to 0-indexed
        totalSteps={4}
        stepLabels={stepLabels}
        completedSteps={completedSteps}
        onStepPress={(stepIndex) => {
          // Allow navigation to completed steps only
          if (completedSteps.includes(stepIndex) && stepIndex !== currentStep - 1) {
            setCurrentStep(stepIndex + 1); // Convert back to 1-indexed
            setErrors({});
          }
        }}
      />

      {/* Current Step Content */}
      <View style={styles.stepContainer}>
        {renderStep()}
      </View>

      {/* Navigation Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={handleBack}
          disabled={currentStep === 1 || isSubmitting}
          style={[styles.button, styles.backButton]}
          labelStyle={styles.backButtonLabel}
        >
          Back
        </Button>

{currentStep < 4 ? (
          <Button
            mode="contained"
            onPress={handleNext}
            disabled={isSubmitting}
            style={[styles.button, styles.nextButton]}
            buttonColor="#7c3aed"
          >
            Next
          </Button>
        ) : (
          <Button
            mode="contained"
            onPress={() => {
              console.log('Submit button pressed!');
              console.log('Current step:', currentStep);
              console.log('isSubmitting:', isSubmitting);
              handleSubmit();
            }}
            disabled={isSubmitting}
            loading={isSubmitting}
            style={[styles.button, styles.submitButton]}
            buttonColor="#7c3aed"
            testID="submit-button"
          >
            {isSubmitting ? 'Creating...' : 'Submit'}
          </Button>
        )}
      </View>

      {/* Loading Overlay */}
      {isSubmitting && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#7c3aed" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  stepContainer: {
    flex: 1,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minHeight: 0, // Critical for flex children to scroll properly
    overflow: 'hidden' // Prevent parent from scrolling
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff'
  },
  button: {
    flex: 1
  },
  backButton: {
    borderColor: '#e5e7eb'
  },
  backButtonLabel: {
    color: '#6b7280'
  },
  nextButton: {
    backgroundColor: '#7c3aed'
  },
  submitButton: {
    backgroundColor: '#7c3aed'
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  }
});
