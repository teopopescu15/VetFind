import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import EmptyCompanyState from '../components/EmptyCompanyState';
import { CompanyDashboardScreen } from './CompanyDashboardScreen';
import * as api from '../services/api';
const ApiService = api.ApiService;

interface DashboardScreenProps {
  navigation: any;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [hasCompany, setHasCompany] = useState<boolean | null>(null);
  const [isCheckingCompany, setIsCheckingCompany] = useState(true);

  useEffect(() => {
    checkIfUserHasCompany();
  }, [user]);

  const checkIfUserHasCompany = async () => {
    console.log('🔍 Checking user role:', user?.role);
    console.log('🔍 Is vetcompany?:', user?.role === 'vetcompany');

    if (user?.role === 'vetcompany') {
      try {
        setIsCheckingCompany(true);
        // Check if user has a company by fetching their company profile
        const company = await ApiService.getMyCompany();
        setHasCompany(!!company);
      } catch (error) {
        console.error('Error checking company:', error);
        setHasCompany(false);
      } finally {
        setIsCheckingCompany(false);
      }
    } else {
      setIsCheckingCompany(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleCreateCompany = () => {
    console.log('Navigate to CreateCompanyScreen');
    navigation.navigate('CreateCompany');
  };

  // Loading state while checking company
  if (isCheckingCompany) {
    return (
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </LinearGradient>
    );
  }

  // VetCompany user without company - show EmptyCompanyState
  if (user?.role === 'vetcompany' && !hasCompany) {
    return (
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.container}
      >
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={styles.safeArea}>
          <EmptyCompanyState onCreatePress={handleCreateCompany} />

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutButtonAbsolute}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // VetCompany user with company - show CompanyDashboard
  if (user?.role === 'vetcompany' && hasCompany) {
    return <CompanyDashboardScreen />;
  }

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome to Dashboard</Text>
            <Text style={styles.subtitle}>VetFinder</Text>
          </View>

          {/* User Info Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>User Information</Text>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{user?.name}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{user?.email}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Role:</Text>
              <Text style={styles.value}>
                {user?.role === 'user' ? 'Pet Owner' : 'Veterinarian'}
              </Text>
            </View>
          </View>

          {/* VetFinder Actions */}
          <View style={styles.actionsCard}>
            <Text style={styles.cardTitle}>VetFinder</Text>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('VetFinderHome')}
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonText}>🏥 Find Clinics</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('MyAppointments')}
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonText}>📅 My Appointments</Text>
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
  },
  placeholderText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  logoutButtonAbsolute: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: '#FF6B6B',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    boxShadow: '0px 2px 2.62px rgba(0, 0, 0, 0.2)',
    elevation: 4,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#E0E0E0',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 25,
    marginBottom: 30,
    boxShadow: '0 2px 3.84px rgba(0, 0, 0, 0.1)',
    elevation: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  label: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  actionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 25,
    marginBottom: 30,
    boxShadow: '0 2px 3.84px rgba(0, 0, 0, 0.1)',
    elevation: 5,
  },
  actionButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    boxShadow: '0 2px 2.62px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    boxShadow: '0 2px 2.62px rgba(0, 0, 0, 0.2)',
    elevation: 4,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DashboardScreen;
