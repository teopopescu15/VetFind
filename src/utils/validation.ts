/**
 * Validation Utilities for VetFinder Company Creation Forms
 * Phase 12: Comprehensive validation for multi-step company creation
 *
 * Follows object-literal pattern (no classes) - CLAUDE.md compliant
 */

import type {
  Step1FormData,
  Step2FormData,
  Step3FormData,
  Step4FormData,
  CompanyFormData,
  FormErrors,
  OpeningHours,
  CreateServiceDTO,
} from '../types/company.types';

// ==================== VALIDATION REGEX PATTERNS ====================

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?1?\s*\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
const ZIP_CODE_REGEX = /^\d{5}(-\d{4})?$/;
const TIME_REGEX = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

// ==================== VALIDATION RESULT TYPES ====================

interface ValidationResult {
  valid: boolean;
  error?: string;
}

interface StepValidationResult {
  valid: boolean;
  errors: { [key: string]: string };
}

interface FormValidationResult {
  valid: boolean;
  errors: FormErrors;
}

// ==================== BASIC FIELD VALIDATORS ====================

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  return EMAIL_REGEX.test(email.trim());
};

/**
 * Validate phone number format (US format)
 */
export const validatePhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  return PHONE_REGEX.test(phone.trim());
};

/**
 * Validate URL format
 */
export const validateURL = (url: string): boolean => {
  if (!url || typeof url !== 'string') {
    return false;
  }
  return URL_REGEX.test(url.trim());
};

/**
 * Validate ZIP code format
 */
export const validateZipCode = (zipCode: string): boolean => {
  if (!zipCode || typeof zipCode !== 'string') {
    return false;
  }
  return ZIP_CODE_REGEX.test(zipCode.trim());
};

/**
 * Validate time format (HH:MM)
 */
export const validateTime = (time: string): boolean => {
  if (!time || typeof time !== 'string') {
    return false;
  }
  return TIME_REGEX.test(time.trim());
};

/**
 * Validate company name
 */
export const validateCompanyName = (name: string): ValidationResult => {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Company name is required' };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 3) {
    return { valid: false, error: 'Company name must be at least 3 characters' };
  }

  if (trimmedName.length > 100) {
    return { valid: false, error: 'Company name must be less than 100 characters' };
  }

  return { valid: true };
};

/**
 * Validate price range
 */
export const validatePriceRange = (min: number, max: number): ValidationResult => {
  if (typeof min !== 'number' || typeof max !== 'number') {
    return { valid: false, error: 'Prices must be valid numbers' };
  }

  if (min < 0) {
    return { valid: false, error: 'Minimum price cannot be negative' };
  }

  if (max < 0) {
    return { valid: false, error: 'Maximum price cannot be negative' };
  }

  if (max < min) {
    return { valid: false, error: 'Maximum price must be greater than or equal to minimum price' };
  }

  return { valid: true };
};

/**
 * Validate required field
 */
export const validateRequired = (value: any, fieldName: string): ValidationResult => {
  if (value === null || value === undefined || value === '') {
    return { valid: false, error: `${fieldName} is required` };
  }

  if (typeof value === 'string' && value.trim() === '') {
    return { valid: false, error: `${fieldName} is required` };
  }

  if (Array.isArray(value) && value.length === 0) {
    return { valid: false, error: `${fieldName} is required` };
  }

  return { valid: true };
};

/**
 * Validate minimum length
 */
export const validateMinLength = (value: string, min: number, fieldName: string): ValidationResult => {
  if (!value || typeof value !== 'string') {
    return { valid: false, error: `${fieldName} must be a valid string` };
  }

  if (value.trim().length < min) {
    return { valid: false, error: `${fieldName} must be at least ${min} characters` };
  }

  return { valid: true };
};

/**
 * Validate maximum length
 */
export const validateMaxLength = (value: string, max: number, fieldName: string): ValidationResult => {
  if (!value || typeof value !== 'string') {
    return { valid: false, error: `${fieldName} must be a valid string` };
  }

  if (value.trim().length > max) {
    return { valid: false, error: `${fieldName} must be less than ${max} characters` };
  }

  return { valid: true };
};

/**
 * Validate opening hours
 */
export const validateOpeningHours = (hours: OpeningHours): ValidationResult => {
  if (!hours || typeof hours !== 'object') {
    return { valid: false, error: 'Opening hours must be provided' };
  }

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  for (const day of days) {
    const schedule = hours[day as keyof OpeningHours];

    if (schedule && !schedule.closed) {
      // Validate time format
      if (!validateTime(schedule.open)) {
        return { valid: false, error: `Invalid opening time for ${day}` };
      }

      if (!validateTime(schedule.close)) {
        return { valid: false, error: `Invalid closing time for ${day}` };
      }

      // Validate that close time is after open time
      const openParts = schedule.open.split(':');
      const closeParts = schedule.close.split(':');
      const openMinutes = parseInt(openParts[0]) * 60 + parseInt(openParts[1]);
      const closeMinutes = parseInt(closeParts[0]) * 60 + parseInt(closeParts[1]);

      if (closeMinutes <= openMinutes) {
        return { valid: false, error: `Closing time must be after opening time for ${day}` };
      }
    }
  }

  return { valid: true };
};

/**
 * Validate photo array
 */
export const validatePhotos = (photos: string[], minPhotos = 4, maxPhotos = 10): ValidationResult => {
  if (!Array.isArray(photos)) {
    return { valid: false, error: 'Photos must be an array' };
  }

  if (photos.length < minPhotos) {
    return { valid: false, error: `Minimum ${minPhotos} photos required` };
  }

  if (photos.length > maxPhotos) {
    return { valid: false, error: `Maximum ${maxPhotos} photos allowed` };
  }

  // Check if all photos are valid URIs
  for (const photo of photos) {
    if (typeof photo !== 'string' || photo.trim() === '') {
      return { valid: false, error: 'All photos must be valid URIs' };
    }
  }

  return { valid: true };
};

/**
 * Validate service
 */
export const validateService = (service: CreateServiceDTO): ValidationResult => {
  // Validate service name
  const nameValidation = validateRequired(service.service_name, 'Service name');
  if (!nameValidation.valid) {
    return nameValidation;
  }

  const nameLengthValidation = validateMinLength(service.service_name, 3, 'Service name');
  if (!nameLengthValidation.valid) {
    return nameLengthValidation;
  }

  // Validate category
  const categoryValidation = validateRequired(service.category, 'Service category');
  if (!categoryValidation.valid) {
    return categoryValidation;
  }

  // Validate price range
  const priceValidation = validatePriceRange(service.price_min, service.price_max);
  if (!priceValidation.valid) {
    return priceValidation;
  }

  return { valid: true };
};

// ==================== STEP VALIDATORS ====================

/**
 * Validate Step 1: Basic Info
 */
export const validateStep1 = (data: Partial<Step1FormData>): StepValidationResult => {
  const errors: { [key: string]: string } = {};

  // Validate company name (required)
  const nameValidation = validateCompanyName(data.name || '');
  if (!nameValidation.valid) {
    errors.name = nameValidation.error || 'Invalid company name';
  }

  // Validate email (required)
  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(data.email)) {
    errors.email = 'Invalid email format';
  }

  // Validate phone (required)
  if (!data.phone) {
    errors.phone = 'Phone number is required';
  } else if (!validatePhone(data.phone)) {
    errors.phone = 'Invalid phone number format (use format: (123) 456-7890)';
  }

  // Validate description (optional, but if provided, check length)
  if (data.description) {
    const descLengthValidation = validateMaxLength(data.description, 100, 'Short description');
    if (!descLengthValidation.valid) {
      errors.description = descLengthValidation.error || 'Description too long';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate Step 2: Location & Contact
 */
export const validateStep2 = (data: Partial<Step2FormData>): StepValidationResult => {
  const errors: { [key: string]: string } = {};

  // Validate address (required)
  const addressValidation = validateRequired(data.address, 'Address');
  if (!addressValidation.valid) {
    errors.address = addressValidation.error || 'Address is required';
  } else {
    const addressLengthValidation = validateMinLength(data.address || '', 5, 'Address');
    if (!addressLengthValidation.valid) {
      errors.address = addressLengthValidation.error || 'Address too short';
    }
  }

  // Validate city (required)
  const cityValidation = validateRequired(data.city, 'City');
  if (!cityValidation.valid) {
    errors.city = cityValidation.error || 'City is required';
  }

  // Validate state (required)
  const stateValidation = validateRequired(data.state, 'State');
  if (!stateValidation.valid) {
    errors.state = stateValidation.error || 'State is required';
  }

  // Validate ZIP code (required)
  if (!data.zip_code) {
    errors.zip_code = 'ZIP code is required';
  } else if (!validateZipCode(data.zip_code)) {
    errors.zip_code = 'Invalid ZIP code format (use format: 12345 or 12345-6789)';
  }

  // Validate website (optional, but if provided, check format)
  if (data.website && data.website.trim() !== '') {
    if (!validateURL(data.website)) {
      errors.website = 'Invalid website URL';
    }
  }

  // Validate opening hours (optional, but if provided, validate format)
  if (data.opening_hours) {
    const hoursValidation = validateOpeningHours(data.opening_hours);
    if (!hoursValidation.valid) {
      errors.opening_hours = hoursValidation.error || 'Invalid opening hours';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate Step 3: Services & Specializations
 */
export const validateStep3 = (data: Partial<Step3FormData>): StepValidationResult => {
  const errors: { [key: string]: string } = {};

  // Validate clinic type (required)
  const clinicTypeValidation = validateRequired(data.clinic_type, 'Clinic type');
  if (!clinicTypeValidation.valid) {
    errors.clinic_type = clinicTypeValidation.error || 'Clinic type is required';
  }

  // Validate specializations (required, at least 1)
  if (!data.specializations || data.specializations.length === 0) {
    errors.specializations = 'At least 1 specialization is required';
  }

  // Validate facilities (optional)
  // No validation needed for optional facilities

  // Validate payment methods (required, at least 1)
  if (!data.payment_methods || data.payment_methods.length === 0) {
    errors.payment_methods = 'At least 1 payment method is required';
  }

  // Validate num_veterinarians (optional, but if provided, must be positive)
  if (data.num_veterinarians !== undefined && data.num_veterinarians !== null) {
    if (data.num_veterinarians < 1) {
      errors.num_veterinarians = 'Number of veterinarians must be at least 1';
    }
  }

  // Validate years_in_business (optional, but if provided, must be non-negative)
  if (data.years_in_business !== undefined && data.years_in_business !== null) {
    if (data.years_in_business < 0) {
      errors.years_in_business = 'Years in business cannot be negative';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate Step 4: Pricing & Photos
 */
export const validateStep4 = (data: Partial<Step4FormData>): StepValidationResult => {
  const errors: { [key: string]: string } = {};

  // Validate services (at least 1 service required)
  if (!data.services || data.services.length === 0) {
    errors.services = 'At least 1 service is required';
  } else {
    // Validate each service
    for (let i = 0; i < data.services.length; i++) {
      const service = data.services[i];
      const serviceValidation = validateService(service);
      if (!serviceValidation.valid) {
        errors[`service_${i}`] = serviceValidation.error || `Invalid service at position ${i + 1}`;
      }
    }
  }

  // Validate photos (4-10 photos required)
  const photosValidation = validatePhotos(data.photos || [], 4, 10);
  if (!photosValidation.valid) {
    errors.photos = photosValidation.error || 'Invalid photos';
  }

  // Validate full description (required)
  const descriptionValidation = validateRequired(data.full_description, 'Full description');
  if (!descriptionValidation.valid) {
    errors.full_description = descriptionValidation.error || 'Full description is required';
  } else {
    const descMinLengthValidation = validateMinLength(data.full_description || '', 50, 'Full description');
    if (!descMinLengthValidation.valid) {
      errors.full_description = descMinLengthValidation.error || 'Description too short';
    }

    const descMaxLengthValidation = validateMaxLength(data.full_description || '', 500, 'Full description');
    if (!descMaxLengthValidation.valid) {
      errors.full_description = descMaxLengthValidation.error || 'Description too long';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

// ==================== COMPLETE FORM VALIDATOR ====================

/**
 * Validate complete company form (all 4 steps)
 */
export const validateCompanyForm = (data: CompanyFormData): FormValidationResult => {
  const errors: FormErrors = {};

  // Validate Step 1
  const step1Validation = validateStep1(data.step1 || {});
  if (!step1Validation.valid) {
    errors.step1 = step1Validation.errors;
  }

  // Validate Step 2
  const step2Validation = validateStep2(data.step2 || {});
  if (!step2Validation.valid) {
    errors.step2 = step2Validation.errors;
  }

  // Validate Step 3
  const step3Validation = validateStep3(data.step3 || {});
  if (!step3Validation.valid) {
    errors.step3 = step3Validation.errors;
  }

  // Validate Step 4
  const step4Validation = validateStep4(data.step4 || {});
  if (!step4Validation.valid) {
    errors.step4 = step4Validation.errors;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

// ==================== VALIDATION UTILS EXPORT ====================

/**
 * Comprehensive validation utilities object
 * Following object-literal pattern (no classes)
 */
export const ValidationUtils = {
  // Basic validators
  validateEmail,
  validatePhone,
  validateURL,
  validateZipCode,
  validateTime,
  validateCompanyName,
  validatePriceRange,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateOpeningHours,
  validatePhotos,
  validateService,

  // Step validators
  validateStep1,
  validateStep2,
  validateStep3,
  validateStep4,

  // Complete form validator
  validateCompanyForm,
};

export default ValidationUtils;
