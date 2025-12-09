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
  Dimensions,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { blurActiveElementIfWeb } from '../utils/dom';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

type UserRole = 'user' | 'vetcompany';

interface SignUpScreenProps {
  navigation?: any;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation }) => {
  const { signup } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [loading, setLoading] = useState(false);

  const checkPasswordStrength = (pass: string) => {
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[a-z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    setPasswordStrength(strength);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    checkPasswordStrength(text);
  };

  const handleSignUp = async () => {
    // Validate input
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    if (passwordStrength < 3) {
      Alert.alert(
        'Weak Password',
        'Please use a stronger password with uppercase, lowercase, and numbers'
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      setLoading(true);

      await signup({
        name: fullName,
        email: email.toLowerCase(),
        password,
        role,
      });

      // No need to navigate - AuthContext will handle it automatically
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return '#e0e0e0';
    if (passwordStrength <= 2) return '#ff4444';
    if (passwordStrength <= 3) return '#ffaa00';
    if (passwordStrength <= 4) return '#00aa00';
    return '#00dd00';
  };

  const getPasswordStrengthWidth = (): string => {
    return `${(passwordStrength / 5) * 100}%`;
  };

  return (
    <LinearGradient
      colors={['#f5f3ff', '#ede9fe', '#f5f3ff']}
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
              <View style={styles.cardContainer}>
                <View style={styles.content}>
              {/* Logo */}
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={['#8b5cf6', '#a78bfa']}
                  style={styles.logoGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="sparkles" size={40} color="#ffffff" />
                </LinearGradient>
              </View>

              {/* Title */}
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Find the best vet for your beloved animal!</Text>

              {/* Full Name Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={20} color="#8b5cf6" style={styles.inputIcon} />
                  <Text style={styles.inputLabel}>Full Name</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor="#a0a0a0"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} color="#8b5cf6" style={styles.inputIcon} />
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

              {/* Role Selection */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-circle-outline" size={20} color="#8b5cf6" style={styles.inputIcon} />
                  <Text style={styles.inputLabel}>I am a</Text>
                </View>
                <TouchableOpacity
                  style={styles.roleSelector}
                  onPress={() => setShowRolePicker(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.roleSelectorText}>
                    {role === 'user' ? 'Pet Owner' : 'Vet Company'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#8b5cf6" />
                </TouchableOpacity>
              </View>

              {/* Role Picker Modal */}
              <Modal
                visible={showRolePicker}
                transparent={true}
                animationType="fade"
                onRequestClose={() => {
                  blurActiveElementIfWeb();
                  setShowRolePicker(false);
                }}
              >
                <TouchableOpacity
                  style={styles.modalOverlay}
                  activeOpacity={1}
                  onPress={() => {
                    blurActiveElementIfWeb();
                    setShowRolePicker(false);
                  }}
                >
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Select Your Role</Text>

                    <TouchableOpacity
                      style={[
                        styles.roleOption,
                        role === 'user' && styles.roleOptionSelected
                      ]}
                      onPress={() => {
                        blurActiveElementIfWeb();
                        setRole('user');
                        setShowRolePicker(false);
                      }}
                    >
                      <Ionicons
                        name="paw"
                        size={24}
                        color={role === 'user' ? '#8b5cf6' : '#666666'}
                      />
                      <View style={styles.roleOptionText}>
                        <Text style={[
                          styles.roleOptionTitle,
                          role === 'user' && styles.roleOptionTitleSelected
                        ]}>
                          Pet Owner
                        </Text>
                        <Text style={styles.roleOptionDescription}>
                          Find the best vet for your pet
                        </Text>
                      </View>
                      {role === 'user' && (
                        <Ionicons name="checkmark-circle" size={24} color="#8b5cf6" />
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.roleOption,
                        role === 'vetcompany' && styles.roleOptionSelected
                      ]}
                      onPress={() => {
                        blurActiveElementIfWeb();
                        setRole('vetcompany');
                        setShowRolePicker(false);
                      }}
                    >
                      <Ionicons
                        name="medical"
                        size={24}
                        color={role === 'vetcompany' ? '#8b5cf6' : '#666666'}
                      />
                      <View style={styles.roleOptionText}>
                        <Text style={[
                          styles.roleOptionTitle,
                          role === 'vetcompany' && styles.roleOptionTitleSelected
                        ]}>
                          Vet Company
                        </Text>
                        <Text style={styles.roleOptionDescription}>
                          Provide veterinary services
                        </Text>
                      </View>
                      {role === 'vetcompany' && (
                        <Ionicons name="checkmark-circle" size={24} color="#8b5cf6" />
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.modalCloseButton}
                      onPress={() => {
                        blurActiveElementIfWeb();
                        setShowRolePicker(false);
                      }}
                    >
                      <Text style={styles.modalCloseButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </Modal>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color="#8b5cf6" style={styles.inputIcon} />
                  <Text style={styles.inputLabel}>Password</Text>
                  {password.length > 0 && (
                    <View style={styles.strengthIndicator}>
                      <View style={styles.strengthBar}>
                        <View
                          style={[
                            styles.strengthFill,
                            {

                              width: getPasswordStrengthWidth(),
                              backgroundColor: getPasswordStrengthColor()
                            }
                          ]}
                        />
                      </View>
                    </View>
                  )}
                </View>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="••••••••••••"
                    placeholderTextColor="#a0a0a0"
                    value={password}
                    onChangeText={handlePasswordChange}
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
                {password.length > 0 && (
                  <View style={styles.passwordRequirements}>
                    <Ionicons
                      name="checkmark-circle"
                      size={14}
                      color={passwordStrength >= 3 ? '#00aa00' : '#cccccc'}
                    />
                    <Text style={[
                      styles.requirementText,
                      { color: passwordStrength >= 3 ? '#00aa00' : '#999999' }
                    ]}>
                      Must be 8+ characters with uppercase, lowercase, and number
                    </Text>
                  </View>
                )}
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color="#8b5cf6" style={styles.inputIcon} />
                  <Text style={styles.inputLabel}>Confirm Password</Text>
                </View>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="••••••••"
                    placeholderTextColor="#a0a0a0"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                      size={22}
                      color="#a0a0a0"
                    />
                  </TouchableOpacity>
                </View>
                {confirmPassword.length > 0 && password !== confirmPassword && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="close-circle" size={14} color="#ff4444" />
                    <Text style={styles.errorText}>Passwords do not match</Text>
                  </View>
                )}
              </View>

              {/* Sign Up Button */}
              <TouchableOpacity
                style={styles.signUpButton}
                onPress={handleSignUp}
                activeOpacity={0.9}
                disabled={loading}
              >
                <LinearGradient
                  colors={['#8b5cf6', '#a78bfa']}
                  style={styles.signUpButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Text style={styles.signUpButtonText}>Sign Up</Text>
                      <Ionicons name="arrow-forward" size={20} color="#ffffff" style={styles.arrowIcon} />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Login Link */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation?.navigate('Login')}>
                  <Text style={styles.loginLink}>Login</Text>
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
  },
  cardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    boxShadow: '0 10px 20px rgba(124, 58, 237, 0.08)',
    elevation: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.15)',
    maxWidth: 420,
    width: '100%',
    marginHorizontal: 20,
  },
  content: {
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 4px 10px rgba(139, 92, 246, 0.3)',
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8b5cf6',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  inputIcon: {
    marginRight: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '600',
  },
  strengthIndicator: {
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: [{ translateY: -5 }],
  },
  strengthBar: {
    width: 60,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
    transition: 'width 0.3s ease',
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
  passwordRequirements: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  requirementText: {
    fontSize: 12,
    marginLeft: 6,
    flex: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#ff4444',
    marginLeft: 6,
  },
  signUpButton: {
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 4px 8px rgba(139, 92, 246, 0.3)',
    elevation: 6,
  },
  signUpButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  signUpButtonText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  arrowIcon: {
    marginLeft: 8,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  loginText: {
    fontSize: 14,
    color: '#666666',
  },
  loginLink: {
    fontSize: 14,
    color: '#8b5cf6',
    fontWeight: 'bold',
  },
  roleSelector: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  roleSelectorText: {
    fontSize: 16,
    color: '#333333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
    textAlign: 'center',
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e8e8e8',
    marginBottom: 12,
  },
  roleOptionSelected: {
    borderColor: '#8b5cf6',
    backgroundColor: '#f5f3ff',
  },
  roleOptionText: {
    flex: 1,
    marginLeft: 12,
  },
  roleOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  roleOptionTitleSelected: {
    color: '#8b5cf6',
  },
  roleOptionDescription: {
    fontSize: 13,
    color: '#666666',
  },
  modalCloseButton: {
    marginTop: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '600',
  },
});

export default SignUpScreen;
