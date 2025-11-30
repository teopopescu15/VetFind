import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
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

// Stack navigators
const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { isLoading, isAuthenticated } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <NavigationContainer>
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
