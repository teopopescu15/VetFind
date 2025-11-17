import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import { CompanyProvider } from './src/context/CompanyContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <CompanyProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </CompanyProvider>
    </AuthProvider>
  );
}
