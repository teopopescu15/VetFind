import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import { validateRomanianPhone, formatRomanianPhone } from '../../utils/romanianValidation';

/**
 * RomanianPhoneInput Component
 * Phone input with Romanian format validation and formatting
 * Follows object-literal pattern (no classes)
 */

export interface RomanianPhoneInputProps {
  value: string;
  onChange: (phone: string) => void;
  error?: string;
  disabled?: boolean;
}

export const RomanianPhoneInput = ({
  value,
  onChange,
  error,
  disabled = false,
}: RomanianPhoneInputProps) => {
  const [focused, setFocused] = useState(false);

  const handleChange = (text: string) => {
    // Remove all characters except digits and + at start
    let cleaned = text.replace(/[^\d+]/g, '');

    // Ensure + only at start
    if (cleaned.includes('+')) {
      const plusIndex = cleaned.indexOf('+');
      if (plusIndex === 0) {
        cleaned = '+' + cleaned.slice(1).replace(/\+/g, '');
      } else {
        cleaned = cleaned.replace(/\+/g, '');
      }
    }

    onChange(cleaned);
  };

  // Show formatted version when not focused, raw when focused
  const displayValue = focused ? value : formatRomanianPhone(value);

  // Show validation status if has value and not focused
  const showValidation = value && !focused;
  const isValid = showValidation && validateRomanianPhone(value);

  return (
    <View style={styles.container}>
      <TextInput
        label="Telefon *"
        value={displayValue}
        onChangeText={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType="phone-pad"
        placeholder="+40 XXX XXX XXX"
        error={!!error}
        disabled={disabled}
        mode="outlined"
        left={<TextInput.Icon icon="phone" />}
        style={styles.input}
        outlineColor="#e5e7eb"
        activeOutlineColor="#7c3aed"
        accessibilityLabel="Phone Number"
        accessibilityHint="Romanian phone number: +40 XXX XXX XXX or 07XX XXX XXX"
      />

      {error ? (
        <HelperText type="error" visible={true}>
          {error}
        </HelperText>
      ) : (
        <HelperText type="info" visible={true}>
          {showValidation && isValid
            ? 'Valid Romanian phone number ✓'
            : 'Format: +40 XXX XXX XXX sau 07XX XXX XXX'}
        </HelperText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    backgroundColor: '#fff',
  },
});
