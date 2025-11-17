import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform
} from 'react-native';

const TestConnection = () => {
  const [status, setStatus] = useState<any>({
    deviceInfo: '',
    networkTest: '',
    backendTest: '',
    expoTest: '',
  });

  const getDeviceInfo = () => {
    const info = {
      platform: Platform.OS,
      version: Platform.Version,
      isTV: Platform.isTV,
    };
    setStatus((prev: any) => ({
      ...prev,
      deviceInfo: JSON.stringify(info, null, 2)
    }));
  };

  const testBackendConnection = async () => {
    const baseUrls = [
      'http://172.23.126.178:5000/health',
      'http://localhost:5000/health',
    ];

    for (const url of baseUrls) {
      try {
        setStatus((prev: any) => ({
          ...prev,
          backendTest: `Testing ${url}...`
        }));

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStatus((prev: any) => ({
            ...prev,
            backendTest: `✅ Backend connected at ${url}\n${JSON.stringify(data, null, 2)}`
          }));
          return;
        }
      } catch (error: any) {
        console.log(`Failed to connect to ${url}:`, error.message);
      }
    }

    setStatus((prev: any) => ({
      ...prev,
      backendTest: '❌ Backend not reachable. Make sure:\n1. Backend is running (npm run dev in backend folder)\n2. You\'re on the same WiFi network\n3. Firewall is not blocking port 5000'
    }));
  };

  const testNetworkAccess = async () => {
    try {
      setStatus((prev: any) => ({
        ...prev,
        networkTest: 'Testing internet connection...'
      }));

      const response = await fetch('https://api.github.com/zen');
      const text = await response.text();

      setStatus((prev: any) => ({
        ...prev,
        networkTest: `✅ Internet connected\nGitHub says: "${text}"`
      }));
    } catch (error: any) {
      setStatus((prev: any) => ({
        ...prev,
        networkTest: `❌ No internet: ${error.message}`
      }));
    }
  };

  useEffect(() => {
    getDeviceInfo();
    testNetworkAccess();
    testBackendConnection();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📱 Mobile Connection Diagnostics</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Device Info:</Text>
        <Text style={styles.status}>{status.deviceInfo}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Network Test:</Text>
        <Text style={styles.status}>{status.networkTest}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Backend Connection:</Text>
        <Text style={styles.status}>{status.backendTest}</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          testNetworkAccess();
          testBackendConnection();
        }}
      >
        <Text style={styles.buttonText}>🔄 Retry Tests</Text>
      </TouchableOpacity>

      <View style={styles.instructions}>
        <Text style={styles.instructionTitle}>📝 Troubleshooting Steps:</Text>
        <Text style={styles.instruction}>1. Make sure your phone and computer are on the same WiFi</Text>
        <Text style={styles.instruction}>2. Start backend: cd backend && npm run dev</Text>
        <Text style={styles.instruction}>3. Start Expo: npm start (in root folder)</Text>
        <Text style={styles.instruction}>4. Scan QR code with Expo Go app</Text>
        <Text style={styles.instruction}>5. If using tunnel: expo start --tunnel</Text>
        <Text style={styles.instruction}>6. Computer IP: 172.23.126.178</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#555',
  },
  status: {
    fontSize: 14,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  instructions: {
    backgroundColor: '#fff9c4',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  instruction: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    paddingLeft: 10,
  },
});

export default TestConnection;