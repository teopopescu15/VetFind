import React, { useMemo, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, Button, Snackbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { CountyPicker } from '../components/FormComponents/CountyPicker';
import { LocalityPicker } from '../components/FormComponents/LocalityPicker';
import { CountyCode } from '../constants/romania';
import { validateRomanianPostalCode, validateRomanianPhone, validateCUI } from '../utils/romanianValidation';
import { buildAddressForGeocoding, geocodeAddress } from '../utils/geocoding';
import { useCompany } from '../context/CompanyContext';

type CompanySettingsForm = {
  name: string;
  phone: string;
  cui: string;

  street: string;
  streetNumber: string;
  building: string;
  apartment: string;
  city: string;
  county: CountyCode | '';
  postalCode: string;
  country: string;
};

export const CompanySettingsScreen = () => {
  const { company, updateCompany } = useCompany();

  const initial = useMemo<CompanySettingsForm>(() => ({
    name: String(company?.name ?? ''),
    phone: String(company?.phone ?? ''),
    cui: String((company as any)?.cui ?? ''),

    street: String((company as any)?.street ?? company?.address ?? ''),
    streetNumber: String((company as any)?.street_number ?? ''),
    building: String((company as any)?.building ?? ''),
    apartment: String((company as any)?.apartment ?? ''),
    city: String(company?.city ?? ''),
    county: ((company as any)?.county ?? (company as any)?.state ?? '') as any,
    postalCode: String((company as any)?.postal_code ?? (company as any)?.zip_code ?? ''),
    country: 'Romania',
  }), [company]);

  const [form, setForm] = useState<CompanySettingsForm>(initial);

  // Completó formularul cu valorile din company când acestea se încarcă sau se actualizează
  useEffect(() => {
    setForm(initial);
  }, [initial]);

  const [saving, setSaving] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');

  const setField = (k: keyof CompanySettingsForm, v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: '' }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};

    if (!form.name.trim()) e.name = 'Denumirea clinicii este obligatorie';
    if (!form.phone.trim()) e.phone = 'Numărul de telefon este obligatoriu';
    else if (!validateRomanianPhone(form.phone)) e.phone = 'Format invalid (ex: +40 7xx xxx xxx)';
    if (form.cui.trim() && !validateCUI(form.cui)) e.cui = 'CUI invalid';

    if (!form.street.trim()) e.street = 'Strada este obligatorie';
    if (!form.streetNumber.trim()) e.streetNumber = 'Numărul este obligatoriu';
    if (!form.city.trim()) e.city = 'Localitatea este obligatorie';
    if (!String(form.county || '').trim()) e.county = 'Județul este obligatoriu';
    if (!form.postalCode.trim()) e.postalCode = 'Codul poștal este obligatoriu';
    else if (!validateRomanianPostalCode(form.postalCode)) e.postalCode = 'Format invalid (6 cifre)';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const doGeocode = async (): Promise<{ latitude: number; longitude: number } | null> => {
    if (!validate()) return null;
    try {
      setGeocoding(true);
      const address = buildAddressForGeocoding({
        street: form.street,
        streetNumber: form.streetNumber,
        building: form.building,
        apartment: form.apartment,
        city: form.city,
        county: form.county,
        postalCode: form.postalCode,
        country: form.country,
      });
      const coords = await geocodeAddress(address);
      if (!coords) {
        Alert.alert('Adresa invalida', 'Adresa invalida');
        return null;
      }
      return coords;
    } catch (_e: any) {
      Alert.alert('Adresa invalida', 'Adresa invalida');
      return null;
    } finally {
      setGeocoding(false);
    }
  };

  const handleSave = async () => {
    if (!company) {
      setSnackMessage('Nu există profil de clinică încă.');
      setSnackVisible(true);
      return;
    }

    if (!validate()) return;

    try {
      setSaving(true);

      const addressLine = [form.street.trim(), form.streetNumber.trim()].filter(Boolean).join(' ');
      const coords = await doGeocode();

      const payload: Parameters<typeof updateCompany>[1] = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        cui: form.cui.trim() || undefined,

        street: form.street.trim(),
        street_number: form.streetNumber.trim(),
        building: form.building.trim() || undefined,
        apartment: form.apartment.trim() || undefined,
        city: form.city.trim(),
        county: (form.county as any) || undefined,
        postal_code: form.postalCode.trim(),

        address: addressLine,
        state: (form.county as any) || undefined,
        zip_code: form.postalCode.trim(),
      };

      if (coords) {
        payload.latitude = coords.latitude;
        payload.longitude = coords.longitude;
      }
      // Când geocoding eșuează, nu trimitem lat/lng ca să nu ștergem coordonatele existente

      await updateCompany(payload);

      setSnackMessage('Setările clinicii au fost actualizate');
      setSnackVisible(true);
    } catch (e: any) {
      setSnackMessage(e?.message || 'Nu s-au putut salva setările');
      setSnackVisible(true);
    } finally {
      setSaving(false);
    }
  };

  if (!company) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.content}>
          <Text>Nu există profil de clinică.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Ionicons name="settings-outline" size={22} color={theme.colors.primary.main} />
          <Text style={styles.title}>Setări clinică</Text>
        </View>

        <Text style={styles.sectionTitle}>Date clinică</Text>

        <TextInput
          mode="outlined"
          label="Denumire clinică"
          value={form.name}
          onChangeText={(t) => setField('name', t)}
          error={!!errors.name}
          style={styles.input}
        />
        {!!errors.name && <Text style={styles.err}>{errors.name}</Text>}

        <TextInput
          mode="outlined"
          label="Telefon"
          value={form.phone}
          onChangeText={(t) => setField('phone', t)}
          error={!!errors.phone}
          style={styles.input}
        />
        {!!errors.phone && <Text style={styles.err}>{errors.phone}</Text>}

        <TextInput
          mode="outlined"
          label="CUI (opțional)"
          value={form.cui}
          onChangeText={(t) => setField('cui', t)}
          error={!!errors.cui}
          style={styles.input}
        />
        {!!errors.cui && <Text style={styles.err}>{errors.cui}</Text>}

        <Text style={styles.sectionTitle}>Adresă (cu actualizare coordonate)</Text>
        <Text style={styles.sectionSubtitle}>
          La salvare se recalculează automat coordonatele clinicii.
        </Text>

        <TextInput
          mode="outlined"
          label="Strada"
          value={form.street}
          onChangeText={(t) => setField('street', t)}
          error={!!errors.street}
          style={styles.input}
        />
        {!!errors.street && <Text style={styles.err}>{errors.street}</Text>}

        <TextInput
          mode="outlined"
          label="Număr"
          value={form.streetNumber}
          onChangeText={(t) => setField('streetNumber', t)}
          error={!!errors.streetNumber}
          style={styles.input}
        />
        {!!errors.streetNumber && <Text style={styles.err}>{errors.streetNumber}</Text>}

        <View style={styles.row}>
          <TextInput
            mode="outlined"
            label="Bloc (opțional)"
            value={form.building}
            onChangeText={(t) => setField('building', t)}
            style={[styles.input, styles.flex1]}
          />
          <TextInput
            mode="outlined"
            label="Apartament (opțional)"
            value={form.apartment}
            onChangeText={(t) => setField('apartment', t)}
            style={[styles.input, styles.flex1]}
          />
        </View>

        <View style={styles.picker}>
          <CountyPicker
            value={form.county}
            onChange={(c) => setForm((p) => ({ ...p, county: c }))}
            error={errors.county}
            disabled={false}
          />
        </View>

        <View style={styles.picker}>
          <LocalityPicker
            county={form.county}
            value={form.city}
            onChange={(locality) => setField('city', locality)}
            error={errors.city}
            disabled={false}
          />
        </View>

        <TextInput
          mode="outlined"
          label="Cod poștal"
          value={form.postalCode}
          onChangeText={(t) => setField('postalCode', t)}
          keyboardType="number-pad"
          maxLength={6}
          error={!!errors.postalCode}
          style={styles.input}
        />
        {!!errors.postalCode && <Text style={styles.err}>{errors.postalCode}</Text>}

        <View style={styles.actions}>
          <Button mode="contained" onPress={handleSave} loading={saving || geocoding} disabled={saving || geocoding}>
            Salvează
          </Button>
        </View>

        <View style={styles.coords}>
          <Text style={styles.coordsLabel}>Coordonate curente:</Text>
          <Text style={styles.coordsValue}>
            {typeof (company as any).latitude === 'number' && typeof (company as any).longitude === 'number'
              ? `${Number((company as any).latitude).toFixed(6)}, ${Number((company as any).longitude).toFixed(6)}`
              : '—'}
          </Text>
        </View>
      </ScrollView>

      <Snackbar
        visible={snackVisible}
        onDismiss={() => setSnackVisible(false)}
        duration={2500}
        action={{ label: 'OK', onPress: () => setSnackVisible(false) }}
      >
        {snackMessage}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.neutral[100] },
  content: { padding: theme.spacing.lg, gap: 10 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  title: { fontSize: 22, fontWeight: '800', color: theme.colors.neutral[900] },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: theme.colors.neutral[800], marginTop: 8 },
  sectionSubtitle: { color: theme.colors.neutral[600], marginBottom: 6 },
  input: { backgroundColor: theme.colors.neutral[50] },
  err: { color: theme.colors.error.main, fontSize: 12, marginTop: -6 },
  row: { flexDirection: 'row', gap: 10 },
  flex1: { flex: 1 },
  picker: { marginTop: 4 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12, justifyContent: 'space-between' },
  coords: { marginTop: 14, padding: 12, borderRadius: 12, backgroundColor: theme.colors.neutral[50], borderWidth: 1, borderColor: theme.colors.neutral[200] },
  coordsLabel: { color: theme.colors.neutral[600], fontWeight: '700' },
  coordsValue: { color: theme.colors.neutral[900], marginTop: 4, fontWeight: '700' },
});

export default CompanySettingsScreen;

