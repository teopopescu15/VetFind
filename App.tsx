import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/context/AuthContext';
import { CompanyProvider } from './src/context/CompanyContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <PaperProvider>
      <AuthProvider>
        <CompanyProvider>
          <AppNavigator />
          <StatusBar style="auto" />
        </CompanyProvider>
      </AuthProvider>
    </PaperProvider>
  );
}
