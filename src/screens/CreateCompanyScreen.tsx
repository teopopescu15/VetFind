import React, { useState, useEffect } from 'react';
import { View, StyleSheet, BackHandler, Alert, Platform } from 'react-native';
import { Button, ActivityIndicator } from 'react-native-paper';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { Step1BasicInfo } from './CreateCompany/Step1BasicInfo';
import { Step2Location } from './CreateCompany/Step2Location';
import { Step3Services } from './CreateCompany/Step3Services';
import { Step4Pricing } from './CreateCompany/Step4Pricing';
import { CompanyFormData, FormErrors, CreateCompanyDTO, CreateServiceDTO } from '../types/company.types';
import ApiService from '../services/api';
import { useNavigation } from '@react-navigation/native';

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
export const CreateCompanyScreen = () => {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CompanyFormData>({
    step1: {},
    step2: {},
    step3: {},
    step4: {}
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stepLabels = [
    'Basic Info',
    'Location & Contact',
    'Services & Specializations',
    'Pricing & Photos'
  ];

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

    // Phone validation
    if (!step1.phone) {
      newErrors.phone = 'Phone number is required';
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

    // Address validation
    if (!step2.address || step2.address.trim().length === 0) {
      newErrors.address = 'Street address is required';
    }

    // City validation
    if (!step2.city || step2.city.trim().length === 0) {
      newErrors.city = 'City is required';
    }

    // State validation
    if (!step2.state || step2.state.trim().length === 0) {
      newErrors.state = 'State is required';
    }

    // ZIP code validation
    if (!step2.zip_code || step2.zip_code.trim().length === 0) {
      newErrors.zip_code = 'ZIP code is required';
    }

    // Website validation (optional but must be valid URL if provided)
    if (step2.website && !/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(step2.website)) {
      newErrors.website = 'Invalid website URL';
    }

    // Opening hours validation
    if (!step2.opening_hours) {
      newErrors.opening_hours = 'Opening hours are required';
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

    // Specializations validation
    if (!step3.specializations || step3.specializations.length === 0) {
      newErrors.specializations = 'At least 1 specialization is required';
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
    const newErrors: { [key: string]: string } = {};
    const { step4 } = formData;

    // Full description validation
    if (!step4.description || step4.description.trim().length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    } else if (step4.description.length > 500) {
      newErrors.description = 'Description must not exceed 500 characters';
    }

    // Services validation
    if (!step4.services || step4.services.length === 0) {
      newErrors.services = 'At least 1 service is required';
    }

    // Photos validation
    if (!step4.photos || step4.photos.length < 4) {
      newErrors.photos = 'At least 4 photos are required';
    } else if (step4.photos.length > 10) {
      newErrors.photos = 'Maximum 10 photos allowed';
    }

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
    // Final validation
    if (!validateStep4()) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Combine all form data into CreateCompanyDTO
      const companyData: CreateCompanyDTO = {
        // From Step 1
        name: formData.step1.name!,
        email: formData.step1.email!,
        phone: formData.step1.phone!,
        description: formData.step4.description!, // Full description from Step 4

        // From Step 2
        address: formData.step2.address!,
        city: formData.step2.city!,
        state: formData.step2.state!,
        zip_code: formData.step2.zip_code!,
        latitude: formData.step2.latitude,
        longitude: formData.step2.longitude,
        website: formData.step2.website,
        opening_hours: formData.step2.opening_hours!,

        // From Step 3
        clinic_type: formData.step3.clinic_type!,
        specializations: formData.step3.specializations!,
        facilities: formData.step3.facilities!,
        payment_methods: formData.step3.payment_methods!,
        num_veterinarians: formData.step3.num_veterinarians,
        years_in_business: formData.step3.years_in_business,

        // From Step 4
        photos: formData.step4.photos || []
      };

      // Upload logo if provided (Step 1)
      if (formData.step1.logo_url) {
        // Note: Logo upload will be handled separately after company creation
        // or as part of the company creation if the backend supports it
      }

      // Create company
      const createdCompany = await ApiService.createCompany(companyData);

      // Create services (Step 4)
      if (formData.step4.services && formData.step4.services.length > 0) {
        await ApiService.bulkCreateServices(
          createdCompany.id,
          formData.step4.services
        );
      }

      // Upload logo if provided
      if (formData.step1.logo_url) {
        await ApiService.uploadCompanyPhoto(
          createdCompany.id,
          formData.step1.logo_url
        );
      }

      // Success! Navigate to Company Dashboard
      Alert.alert(
        'Success!',
        'Your company profile has been created successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to Company Dashboard
              // Note: You'll need to implement this navigation route
              navigation.navigate('CompanyDashboard' as never);
            }
          }
        ]
      );
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
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Progress Indicator */}
      <ProgressIndicator
        currentStep={currentStep}
        totalSteps={4}
        stepLabels={stepLabels}
        onStepClick={(step) => {
          // Allow navigation to completed steps only
          if (step < currentStep) {
            setCurrentStep(step);
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
            onPress={handleSubmit}
            disabled={isSubmitting}
            loading={isSubmitting}
            style={[styles.button, styles.submitButton]}
            buttonColor="#7c3aed"
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
    ...(Platform.OS === 'web' && {
      height: '100%',
      overflow: 'auto',
      position: 'relative'
    })
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
