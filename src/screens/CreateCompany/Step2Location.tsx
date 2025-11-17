import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { TextInput, Text, HelperText, Button } from 'react-native-paper';
import { OpeningHoursPicker } from '../../components/FormComponents/OpeningHoursPicker';
import { Step2FormData } from '../../types/company.types';
import * as Location from 'expo-location';

export interface Step2LocationProps {
  data: Step2FormData;
  onChange: (data: Step2FormData) => void;
  errors?: { [key: string]: string };
}

/**
 * Step 2: Location & Contact
 * - Full Address (required)
 * - City (required)
 * - State (required)
 * - ZIP Code (required)
 * - GPS Coordinates (latitude, longitude) - auto or manual
 * - Website (optional, URL validation)
 * - Opening Hours (required)
 */
export const Step2Location = ({ data, onChange, errors = {} }: Step2LocationProps) => {
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isFocused, setIsFocused] = useState<{ [key: string]: boolean }>({});

  const updateField = (field: keyof Step2FormData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleFocus = (field: string) => {
    setIsFocused({ ...isFocused, [field]: true });
  };

  const handleBlur = (field: string) => {
    setIsFocused({ ...isFocused, [field]: false });
  };

  const handleUseCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);

      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to use your current location.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });

      const { latitude, longitude } = location.coords;

      // Reverse geocode to get address
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });

      if (addresses.length > 0) {
        const addr = addresses[0];

        onChange({
          ...data,
          latitude,
          longitude,
          address: `${addr.street || ''} ${addr.streetNumber || ''}`.trim() || data.address,
          city: addr.city || data.city,
          state: addr.region || data.state,
          zip_code: addr.postalCode || data.zip_code
        });

        Alert.alert(
          'Location Updated',
          'Your location has been detected and the address fields have been filled.',
          [{ text: 'OK' }]
        );
      } else {
        // Just set coordinates if reverse geocoding fails
        updateField('latitude', latitude);
        updateField('longitude', longitude);

        Alert.alert(
          'Location Detected',
          'GPS coordinates have been set. Please fill in the address details manually.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please enter the address manually.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Location & Contact
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Where can pet owners find your clinic?
        </Text>
      </View>

      {/* Location Detection */}
      <View style={styles.section}>
        <Button
          mode="outlined"
          onPress={handleUseCurrentLocation}
          loading={isLoadingLocation}
          disabled={isLoadingLocation}
          icon="map-marker"
          style={styles.locationButton}
          labelStyle={styles.locationButtonLabel}
        >
          {isLoadingLocation ? 'Detecting Location...' : 'Use Current Location'}
        </Button>
        <HelperText type="info">
          Auto-fill address using your device's GPS
        </HelperText>
      </View>

      {/* Full Address */}
      <View style={styles.section}>
        <TextInput
          label="Street Address *"
          value={data.address || ''}
          onChangeText={(text) => updateField('address', text)}
          onFocus={() => handleFocus('address')}
          onBlur={() => handleBlur('address')}
          mode="outlined"
          error={!!errors.address}
          placeholder="123 Main Street"
          style={styles.input}
          outlineColor="#e5e7eb"
          activeOutlineColor="#7c3aed"
          accessibilityLabel="Street Address"
          accessibilityHint="Enter your clinic's street address"
        />
        <HelperText type="error" visible={!!errors.address}>
          {errors.address || ' '}
        </HelperText>
      </View>

      {/* City */}
      <View style={styles.section}>
        <TextInput
          label="City *"
          value={data.city || ''}
          onChangeText={(text) => updateField('city', text)}
          onFocus={() => handleFocus('city')}
          onBlur={() => handleBlur('city')}
          mode="outlined"
          error={!!errors.city}
          placeholder="San Francisco"
          style={styles.input}
          outlineColor="#e5e7eb"
          activeOutlineColor="#7c3aed"
          accessibilityLabel="City"
          accessibilityHint="Enter the city name"
        />
        <HelperText type="error" visible={!!errors.city}>
          {errors.city || ' '}
        </HelperText>
      </View>

      {/* State and ZIP Code Row */}
      <View style={styles.row}>
        <View style={[styles.section, styles.halfWidth]}>
          <TextInput
            label="State *"
            value={data.state || ''}
            onChangeText={(text) => updateField('state', text)}
            onFocus={() => handleFocus('state')}
            onBlur={() => handleBlur('state')}
            mode="outlined"
            error={!!errors.state}
            placeholder="CA"
            maxLength={2}
            autoCapitalize="characters"
            style={styles.input}
            outlineColor="#e5e7eb"
            activeOutlineColor="#7c3aed"
            accessibilityLabel="State"
            accessibilityHint="Enter the state abbreviation"
          />
          <HelperText type="error" visible={!!errors.state}>
            {errors.state || ' '}
          </HelperText>
        </View>

        <View style={[styles.section, styles.halfWidth]}>
          <TextInput
            label="ZIP Code *"
            value={data.zip_code || ''}
            onChangeText={(text) => updateField('zip_code', text)}
            onFocus={() => handleFocus('zip_code')}
            onBlur={() => handleBlur('zip_code')}
            mode="outlined"
            error={!!errors.zip_code}
            keyboardType="number-pad"
            placeholder="94102"
            maxLength={10}
            style={styles.input}
            outlineColor="#e5e7eb"
            activeOutlineColor="#7c3aed"
            accessibilityLabel="ZIP Code"
            accessibilityHint="Enter the ZIP code"
          />
          <HelperText type="error" visible={!!errors.zip_code}>
            {errors.zip_code || ' '}
          </HelperText>
        </View>
      </View>

      {/* GPS Coordinates (read-only display) */}
      {(data.latitude || data.longitude) && (
        <View style={styles.section}>
          <Text variant="bodySmall" style={styles.coordinatesLabel}>
            GPS Coordinates:
          </Text>
          <Text variant="bodySmall" style={styles.coordinatesText}>
            Lat: {data.latitude?.toFixed(6) || 'N/A'}, Lng: {data.longitude?.toFixed(6) || 'N/A'}
          </Text>
        </View>
      )}

      {/* Website (Optional) */}
      <View style={styles.section}>
        <TextInput
          label="Website (Optional)"
          value={data.website || ''}
          onChangeText={(text) => updateField('website', text)}
          onFocus={() => handleFocus('website')}
          onBlur={() => handleBlur('website')}
          mode="outlined"
          error={!!errors.website}
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="https://www.happypaws.com"
          style={styles.input}
          outlineColor="#e5e7eb"
          activeOutlineColor="#7c3aed"
          accessibilityLabel="Website"
          accessibilityHint="Optional website URL"
        />
        <HelperText type="error" visible={!!errors.website}>
          {errors.website || ' '}
        </HelperText>
      </View>

      {/* Opening Hours */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Opening Hours *
        </Text>
        <Text variant="bodySmall" style={styles.sectionDescription}>
          Set your clinic's operating hours for each day
        </Text>
        <OpeningHoursPicker
          value={data.opening_hours || {
            monday: { open: '09:00', close: '17:00', closed: false },
            tuesday: { open: '09:00', close: '17:00', closed: false },
            wednesday: { open: '09:00', close: '17:00', closed: false },
            thursday: { open: '09:00', close: '17:00', closed: false },
            friday: { open: '09:00', close: '17:00', closed: false },
            saturday: { open: '09:00', close: '13:00', closed: false },
            sunday: { open: '09:00', close: '17:00', closed: true }
          }}
          onChange={(hours) => updateField('opening_hours', hours)}
        />
        {errors.opening_hours && (
          <HelperText type="error" visible={true}>
            {errors.opening_hours}
          </HelperText>
        )}
      </View>

      {/* Required Fields Notice */}
      <View style={styles.notice}>
        <Text variant="bodySmall" style={styles.noticeText}>
          * Required fields
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40
  },
  header: {
    marginBottom: 24
  },
  title: {
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8
  },
  subtitle: {
    color: '#6b7280',
    lineHeight: 20
  },
  section: {
    marginBottom: 16
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4
  },
  sectionDescription: {
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 18
  },
  input: {
    backgroundColor: '#fff'
  },
  row: {
    flexDirection: 'row',
    gap: 12
  },
  halfWidth: {
    flex: 1
  },
  locationButton: {
    borderColor: '#7c3aed',
    borderWidth: 1.5
  },
  locationButtonLabel: {
    color: '#7c3aed',
    fontWeight: '600'
  },
  coordinatesLabel: {
    color: '#6b7280',
    marginBottom: 4,
    fontWeight: '500'
  },
  coordinatesText: {
    color: '#111827',
    fontFamily: 'monospace',
    backgroundColor: '#f9fafb',
    padding: 8,
    borderRadius: 4
  },
  notice: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#7c3aed'
  },
  noticeText: {
    color: '#6b7280',
    fontStyle: 'italic'
  }
});
