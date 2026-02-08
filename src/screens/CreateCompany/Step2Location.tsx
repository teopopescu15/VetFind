import React, { useState } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { TextInput, Text, HelperText, Button } from 'react-native-paper';
import { OpeningHoursPicker } from '../../components/FormComponents/OpeningHoursPicker';
import { CountyPicker } from '../../components/FormComponents/CountyPicker';
import { LocalityPicker } from '../../components/FormComponents/LocalityPicker';
import { ScrollContainer } from '../../components/FormComponents/ScrollContainer';
import { Step2FormData } from '../../types/company.types';
import { CountyCode } from '../../constants/romania';
import * as Location from 'expo-location';

export interface Step2LocationProps {
  data: Partial<Step2FormData>;
  onChange: (data: Partial<Step2FormData>) => void;
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

      // Web fallback using Geolocation API
      if (Platform.OS === 'web') {
        if (!navigator.geolocation) {
          Alert.alert('Eroare', 'Geolocalizarea nu este suportată de browser');
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            updateField('latitude', position.coords.latitude);
            updateField('longitude', position.coords.longitude);
            Alert.alert(
              'Locație detectată',
              'Coordonatele GPS au fost capturate. Completează manual detaliile adresei.'
            );
          },
          (error) => {
            Alert.alert('Eroare locație', error.message);
          },
          { enableHighAccuracy: true }
        );
        return;
      }

      // Mobile implementation - Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permisiune refuzată',
          'Permisiunea de localizare este necesară pentru a folosi locația curentă.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });

      const { latitude, longitude } = location.coords;

      // Set GPS coordinates only (reverse geocoding has been removed in Expo SDK 49+)
      updateField('latitude', latitude);
      updateField('longitude', longitude);

      Alert.alert(
        'Locație detectată',
        `Coordonate GPS capturate (${latitude.toFixed(6)}, ${longitude.toFixed(6)}). Te rugăm completează manual detaliile adresei.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Eroare de locație',
        'Nu s-a putut obține locația curentă. Te rugăm introdu adresa manual.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };


  const handleCountyChange = (county: CountyCode) => {
    // If county changes, reset locality to avoid mismatched values.
    const currentCounty = (data.county || '') as CountyCode | '';
    if (currentCounty !== county) {
      onChange({
        ...data,
        county,
        city: '',
      });
      return;
    }

    updateField('county', county);
  };

  return (
    <ScrollContainer>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Unde te pot găsi proprietarii de animale?
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Ajută clienții să găsească clinica ta și să știe când ești disponibil
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
          {isLoadingLocation ? 'Detectarea locației...' : 'Folosește locația actuală'}
        </Button>
        <HelperText type="info">
          Completare automată a adresei folosind GPS-ul dispozitivului tău
        </HelperText>
        <HelperText type="info">
          Este necesar pentru localizarea utilizatorilor a clinicii
        </HelperText>
      </View>

      {/* Street and Number Row */}
      <View style={styles.row}>
        <View style={[styles.section, styles.flex3]}>
          <TextInput
            label="Strada *"
            value={data.street || ''}
            onChangeText={(text) => updateField('street', text)}
            onFocus={() => handleFocus('street')}
            onBlur={() => handleBlur('street')}
            mode="outlined"
            error={!!errors.street}
            placeholder="Strada Mihai Eminescu"
            style={styles.input}
            outlineColor="#e5e7eb"
            activeOutlineColor="#7c3aed"
            accessibilityLabel="Stradă"
            accessibilityHint="Introdu numele străzii clinicii"
          />
          <HelperText type="error" visible={!!errors.street}>
            {errors.street || ' '}
          </HelperText>
        </View>

        <View style={[styles.section, styles.flex1]}>
          <TextInput
            label="Număr *"
            value={data.streetNumber || ''}
            onChangeText={(text) => updateField('streetNumber', text)}
            onFocus={() => handleFocus('streetNumber')}
            onBlur={() => handleBlur('streetNumber')}
            mode="outlined"
            error={!!errors.streetNumber}
            placeholder="15"
            style={styles.input}
            outlineColor="#e5e7eb"
            activeOutlineColor="#7c3aed"
            accessibilityLabel="Număr"
            accessibilityHint="Introdu numărul străzii"
          />
          <HelperText type="error" visible={!!errors.streetNumber}>
            {errors.streetNumber || ' '}
          </HelperText>
        </View>
      </View>

      {/* Building and Apartment Row (optional) */}
      <View style={styles.row}>
        <View style={[styles.section, styles.halfWidth]}>
          <TextInput
            label="Bloc"
            value={data.building || ''}
            onChangeText={(text) => updateField('building', text)}
            onFocus={() => handleFocus('building')}
            onBlur={() => handleBlur('building')}
            mode="outlined"
            error={!!errors.building}
            placeholder="A2"
            style={styles.input}
            outlineColor="#e5e7eb"
            activeOutlineColor="#7c3aed"
            accessibilityLabel="Bloc"
            accessibilityHint="Număr de bloc (opțional)"
          />
          <HelperText type="info">Opțional</HelperText>
        </View>

        <View style={[styles.section, styles.halfWidth]}>
          <TextInput
            label="Apartament"
            value={data.apartment || ''}
            onChangeText={(text) => updateField('apartment', text)}
            onFocus={() => handleFocus('apartment')}
            onBlur={() => handleBlur('apartment')}
            mode="outlined"
            error={!!errors.apartment}
            placeholder="23"
            style={styles.input}
            outlineColor="#e5e7eb"
            activeOutlineColor="#7c3aed"
            accessibilityLabel="Apartament"
            accessibilityHint="Număr apartament (opțional)"
          />
          <HelperText type="info">Opțional</HelperText>
        </View>
      </View>


      {/* Country */}
      <View style={styles.section}>
        <TextInput
          label="Țara *"
          value={data.country ?? 'Romania'}
          onChangeText={(text) => updateField('country', text)}
          mode="outlined"
          error={!!errors.country}
          placeholder="Romania"
          style={styles.input}
          outlineColor="#e5e7eb"
          activeOutlineColor="#7c3aed"
          accessibilityLabel="Țară"
          accessibilityHint="Introdu țara"
        />
        <HelperText type="error" visible={!!errors.country}>
          {errors.country || ' '}
        </HelperText>
      </View>

      {/* County */}
      <View style={styles.section}>
        <CountyPicker
          value={(data.county || '') as CountyCode | ''}
          onChange={handleCountyChange}
          error={errors.county}
          disabled={false}
        />
      </View>

      {/* Locality (depends on county) */}
      <View style={styles.section}>
        <LocalityPicker
          county={(data.county || '') as CountyCode | ''}
          value={data.city || ''}
          onChange={(locality) => updateField('city', locality)}
          error={errors.city}
          disabled={false}
        />
        <HelperText type="error" visible={!!errors.city}>
          {errors.city || ' '}
        </HelperText>
      </View>

      {/* Postal Code */}
      <View style={styles.section}>
        <TextInput
          label="Cod Poștal *"
          value={data.postalCode || ''}
          onChangeText={(text) => updateField('postalCode', text)}
          onFocus={() => handleFocus('postalCode')}
          onBlur={() => handleBlur('postalCode')}
          mode="outlined"
          error={!!errors.postalCode}
          keyboardType="number-pad"
          placeholder="010101"
          maxLength={6}
          style={styles.input}
          outlineColor="#e5e7eb"
          activeOutlineColor="#7c3aed"
          accessibilityLabel="Cod poștal"
          accessibilityHint="Introdu codul poștal din 6 cifre"
        />
        <HelperText type="error" visible={!!errors.postalCode}>
          {errors.postalCode || ' '}
        </HelperText>
        <HelperText type="info" visible={!errors.postalCode}>
          Format: XXXXXX (6 cifre)
        </HelperText>
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
            monday: { open: null, close: null, closed: false },
            tuesday: { open: null, close: null, closed: false },
            wednesday: { open: null, close: null, closed: false },
            thursday: { open: null, close: null, closed: false },
            friday: { open: null, close: null, closed: false },
            saturday: { open: null, close: null, closed: false },
            sunday: { open: null, close: null, closed: true }
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
    </ScrollContainer>
  );
};

const styles = StyleSheet.create({
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
  flex1: {
    flex: 1
  },
  flex3: {
    flex: 3
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
