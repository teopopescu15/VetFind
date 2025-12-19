import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';

const { width, height } = Dimensions.get('window');

interface LoginScreenProps {
  navigation?: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Validate input
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    if (!password) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    try {
      setLoading(true);

      await login({
        email: email.toLowerCase(),
        password,
      });

      // No need to navigate - AuthContext will handle it automatically
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Google login logic will be implemented later
    console.log('Google login pressed');
  };

  return (
    <LinearGradient
      colors={['#fafaf9', '#f5f5f4', '#fafaf9']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.contentWrapper}>
              {/* Decorative Floating Paw Prints */}
              <View style={styles.floatingPawsContainer}>
                <Ionicons name="paw" size={30} color="rgba(37, 99, 235, 0.1)" style={styles.floatingPaw1} />
                <Ionicons name="paw" size={24} color="rgba(234, 88, 12, 0.12)" style={styles.floatingPaw2} />
                <Ionicons name="paw" size={36} color="rgba(37, 99, 235, 0.08)" style={styles.floatingPaw3} />
                <Ionicons name="paw" size={28} color="rgba(234, 88, 12, 0.1)" style={styles.floatingPaw4} />
                <Ionicons name="paw" size={32} color="rgba(37, 99, 235, 0.09)" style={styles.floatingPaw5} />
                <Ionicons name="paw" size={26} color="rgba(234, 88, 12, 0.11)" style={styles.floatingPaw6} />
              </View>

              <View style={styles.cardContainer}>
                <View style={styles.content}>
              {/* Logo with Paw Icon */}
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={['#2563eb', '#60a5fa']}
                  style={styles.logoGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="paw" size={44} color="#ffffff" />
                </LinearGradient>
                {/* Small decorative paws around logo */}
                <Ionicons name="paw" size={16} color="rgba(37, 99, 235, 0.3)" style={styles.decorativePaw1} />
                <Ionicons name="paw" size={14} color="rgba(234, 88, 12, 0.3)" style={styles.decorativePaw2} />
              </View>

              {/* Title */}
              <Text style={styles.title}>VetFinder</Text>
              <Text style={styles.subtitle}>🐾 Welcome back! Continue your journey. 🐾</Text>

              {/* Google Sign In Button */}
              <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGoogleLogin}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg' }}
                  style={styles.googleIcon}
                />
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>OR CONTINUE WITH EMAIL</Text>
                <View style={styles.divider} />
              </View>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} color="#2563eb" style={styles.inputIcon} />
                  <Text style={styles.inputLabel}>Email Address</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="teodora.popescu@student.upt.ro"
                  placeholderTextColor="#a0a0a0"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color="#2563eb" style={styles.inputIcon} />
                  <Text style={styles.inputLabel}>Password</Text>
                </View>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="••••••••••••"
                    placeholderTextColor="#a0a0a0"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={22}
                      color="#a0a0a0"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLogin}
                activeOpacity={0.9}
                disabled={loading}
              >
                <LinearGradient
                  colors={['#ea580c', '#fb923c']}
                  style={styles.loginButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Text style={styles.loginButtonText}>Login</Text>
                      <Ionicons name="arrow-forward" size={20} color="#ffffff" style={styles.arrowIcon} />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Sign Up Link */}
              <View style={styles.signUpContainer}>
                <Text style={styles.signUpText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation?.navigate('SignUp')}>
                  <Text style={styles.signUpLink}>Create account</Text>
                </TouchableOpacity>
              </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  floatingPawsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingPaw1: {
    position: 'absolute',
    top: '10%',
    left: '8%',
    transform: [{ rotate: '-15deg' }],
  },
  floatingPaw2: {
    position: 'absolute',
    top: '15%',
    right: '12%',
    transform: [{ rotate: '25deg' }],
  },
  floatingPaw3: {
    position: 'absolute',
    top: '45%',
    left: '5%',
    transform: [{ rotate: '10deg' }],
  },
  floatingPaw4: {
    position: 'absolute',
    bottom: '20%',
    left: '10%',
    transform: [{ rotate: '-20deg' }],
  },
  floatingPaw5: {
    position: 'absolute',
    top: '50%',
    right: '8%',
    transform: [{ rotate: '15deg' }],
  },
  floatingPaw6: {
    position: 'absolute',
    bottom: '15%',
    right: '15%',
    transform: [{ rotate: '-10deg' }],
  },
  cardContainer: {
    backgroundColor: '#fafaf9',
    borderRadius: 24,
    boxShadow: '0 10px 20px rgba(37, 99, 235, 0.08)',
    elevation: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(37, 99, 235, 0.15)',
    maxWidth: 420,
    width: '100%',
    marginHorizontal: 20,
    zIndex: 10,
  },
  content: {
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 25,
    position: 'relative',
  },
  decorativePaw1: {
    position: 'absolute',
    top: -10,
    right: 80,
    transform: [{ rotate: '-25deg' }],
  },
  decorativePaw2: {
    position: 'absolute',
    top: -8,
    left: 82,
    transform: [{ rotate: '20deg' }],
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)',
    elevation: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2563eb',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 30,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 12,
    color: '#999999',
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputIcon: {
    marginRight: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333333',
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  passwordInputContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: '50%',
    transform: [{ translateY: -11 }],
  },
  loginButton: {
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 4px 8px rgba(234, 88, 12, 0.3)',
    elevation: 6,
  },
  loginButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  loginButtonText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  arrowIcon: {
    marginLeft: 8,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  signUpText: {
    fontSize: 14,
    color: '#666666',
  },
  signUpLink: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: 'bold',
  },
});

export default LoginScreen;