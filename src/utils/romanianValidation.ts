/**
 * Romanian Validation Utilities
 * Validation and formatting functions for Romanian-specific data
 */

/**
 * Validate Romanian Phone Number
 * Format: +40 XXX XXX XXX or 07XX XXX XXX
 */
export const validateRomanianPhone = (phone: string): boolean => {
  if (!phone) return false;

  // Remove all spaces and dashes
  const cleanPhone = phone.replace(/[\s-]/g, '');

  // With country code: +40XXXXXXXXX (10 digits after +40)
  const intlPattern = /^\+40[0-9]{9}$/;
  // Local format: 07XXXXXXXX (10 digits starting with 07)
  const localPattern = /^07[0-9]{8}$/;

  return intlPattern.test(cleanPhone) || localPattern.test(cleanPhone);
};

/**
 * Validate Romanian Postal Code
 * Format: XXXXXX (6 digits)
 */
export const validateRomanianPostalCode = (postalCode: string): boolean => {
  if (!postalCode) return false;

  // Remove spaces
  const cleanCode = postalCode.replace(/\s/g, '');

  // Format: XXXXXX (6 digits)
  const pattern = /^[0-9]{6}$/;
  return pattern.test(cleanCode);
};

/**
 * Validate CUI (Romanian Tax ID)
 * Format: RO followed by 2-10 digits, or just 2-10 digits
 */
export const validateCUI = (cui: string): boolean => {
  if (!cui) return false;

  // Remove spaces
  const cleanCUI = cui.replace(/\s/g, '').toUpperCase();

  // CUI format: RO followed by 2-10 digits, or just 2-10 digits
  const pattern = /^(RO)?[0-9]{2,10}$/;

  if (!pattern.test(cleanCUI)) {
    return false;
  }

  // TODO: Implement CUI checksum validation if needed
  // For now, basic format check
  return true;
};

/**
 * Format Romanian Phone Number for Display
 * Converts to: +40 XXX XXX XXX format
 */
export const formatRomanianPhone = (phone: string): string => {
  if (!phone) return '';

  // Remove all non-digit characters except + at start
  const cleanPhone = phone.replace(/[^\d+]/g, '');

  if (cleanPhone.startsWith('+40')) {
    // Format: +40 XXX XXX XXX
    const digits = cleanPhone.slice(3);
    if (digits.length >= 9) {
      return `+40 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
    }
    return `+40 ${digits}`;
  } else if (cleanPhone.startsWith('07')) {
    // Format: 07XX XXX XXX
    if (cleanPhone.length >= 10) {
      return `${cleanPhone.slice(0, 4)} ${cleanPhone.slice(4, 7)} ${cleanPhone.slice(7, 10)}`;
    }
    return cleanPhone;
  }

  return phone;
};

/**
 * Format Romanian Postal Code for Display
 * Converts to: XXX XXX format
 */
export const formatRomanianPostalCode = (code: string): string => {
  if (!code) return '';

  // Remove all non-digit characters
  const cleanCode = code.replace(/\D/g, '');

  // Format: XXX XXX
  if (cleanCode.length === 6) {
    return `${cleanCode.slice(0, 3)} ${cleanCode.slice(3)}`;
  }

  return cleanCode;
};

/**
 * Normalize phone number to +40 format for storage
 */
export const normalizeRomanianPhone = (phone: string): string => {
  if (!phone) return '';

  const cleanPhone = phone.replace(/[\s-]/g, '');

  // If starts with 07, convert to +40
  if (cleanPhone.startsWith('07') && cleanPhone.length === 10) {
    return `+40${cleanPhone.slice(1)}`;
  }

  // If already starts with +40, return as is
  if (cleanPhone.startsWith('+40')) {
    return cleanPhone;
  }

  return phone;
};

/**
 * Normalize CUI by removing spaces and ensuring proper format
 */
export const normalizeCUI = (cui: string): string => {
  if (!cui) return '';

  const cleanCUI = cui.replace(/\s/g, '').toUpperCase();

  // Ensure RO prefix
  if (!cleanCUI.startsWith('RO') && /^[0-9]/.test(cleanCUI)) {
    return `RO${cleanCUI}`;
  }

  return cleanCUI;
};
