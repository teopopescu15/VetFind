import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { blurActiveElementIfWeb, disableBlockingAriaHiddenOverlays } from '../utils/dom';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../types/navigation.types';

// Navigators
import AuthNavigator from './AuthNavigator';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import VetFinderHomeScreen from '../screens/VetFinderHomeScreen';
import ClinicDetailScreen from '../screens/ClinicDetailScreen';
import BookAppointmentScreen from '../screens/BookAppointmentScreen';
import MyAppointmentsScreen from '../screens/MyAppointmentsScreen';
import { CreateCompanyScreen } from '../screens/CreateCompanyScreen';
import { CompanyCreatedSuccessScreen } from '../screens/CompanyCreatedSuccessScreen';
import { CompanyDashboardScreen } from '../screens/CompanyDashboardScreen';
import { UserDashboardScreen } from '../screens/UserDashboardScreen';
import { VetCompanyDetailScreen } from '../screens/VetCompanyDetailScreen';
import ManageServicesScreen from '../screens/ManageServicesScreen';
import ManagePricesScreen from '../screens/ManagePricesScreen';

// Stack navigators
const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { isLoading, isAuthenticated } = useAuth();

  // Ensure web pages allow scrolling and remove blocking overlays when navigation changes
  useEffect(() => {
    if (typeof document === 'undefined') return;

    // Force html/body overflow to auto while app is mounted (fixes pages where body was set to hidden)
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    html.style.overflow = 'auto';
    body.style.overflow = 'auto';

    // Disable any blocking aria-hidden overlays on mount
    const restoreOverlays = disableBlockingAriaHiddenOverlays();

    return () => {
      try {
        html.style.overflow = prevHtmlOverflow;
        body.style.overflow = prevBodyOverflow;
      } catch (e) {
        // ignore
      }
      try {
        restoreOverlays();
      } catch (e) {
        // ignore
      }
    };
  }, []);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <NavigationContainer onStateChange={() => { blurActiveElementIfWeb(); }}>
      {isAuthenticated ? (
        // Main app stack (protected routes)
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="CreateCompany" component={CreateCompanyScreen} />
          <Stack.Screen
            name="CompanyCreatedSuccess"
            component={CompanyCreatedSuccessScreen}
            options={{
              gestureEnabled: false, // Prevent back swipe
              headerShown: false,
            }}
          />
          <Stack.Screen name="CompanyDashboard" component={CompanyDashboardScreen} />
          <Stack.Screen name="ManageServices" component={ManageServicesScreen} />
          <Stack.Screen name="ManagePrices" component={ManagePricesScreen} />
          <Stack.Screen name="UserDashboard" component={UserDashboardScreen} />
          <Stack.Screen name="VetCompanyDetail" component={VetCompanyDetailScreen} />
          <Stack.Screen name="VetFinderHome" component={VetFinderHomeScreen} />
          <Stack.Screen name="ClinicDetail" component={ClinicDetailScreen} />
          <Stack.Screen name="BookAppointment" component={BookAppointmentScreen} />
          <Stack.Screen name="MyAppointments" component={MyAppointmentsScreen} />
        </Stack.Navigator>
      ) : (
        // Auth stack (public routes)
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
});

export default AppNavigator;
