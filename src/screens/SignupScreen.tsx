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

  // Inline validation state (keeps user on the same progress with data preserved)
  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const MIN_PASSWORD_LENGTH = 8;
  const SPECIAL_CHAR_REGEX = /[^A-Za-z0-9]/;

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

  const isValidEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const getPasswordIssues = (pass: string): string[] => {
    const issues: string[] = [];
    if ((pass || '').length < MIN_PASSWORD_LENGTH) issues.push(`at least ${MIN_PASSWORD_LENGTH} characters`);
    if (!/[A-Z]/.test(pass)) issues.push('an uppercase letter');
    if (!/[a-z]/.test(pass)) issues.push('a lowercase letter');
    if (!/[0-9]/.test(pass)) issues.push('a number');
    if (!SPECIAL_CHAR_REGEX.test(pass)) issues.push('a special character');
    return issues;
  };

  const shouldShowError = (field: keyof typeof touched) => submitAttempted || touched[field];

  const errors = {
    fullName: !fullName.trim() ? 'Please enter your full name' : '',
    email: !email.trim() ? 'Please enter your email' : (!isValidEmail(email) ? 'Please enter a valid email address' : ''),
    password: '',
    confirmPassword: '',
  };

  const passwordIssues = getPasswordIssues(password);
  if (!password) {
    errors.password = 'Please enter a password';
  } else if (passwordIssues.length > 0) {
    // Make it explicit: too short / missing special chars etc.
    errors.password = `Password must include ${passwordIssues.join(', ')}`;
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  const isFormValid = !errors.fullName && !errors.email && !errors.password && !errors.confirmPassword;

  const handleSignUp = async () => {
    // Inline validation UX: keep user on same screen, preserve inputs,
    // highlight invalid fields and show what needs to be fixed.
    setSubmitAttempted(true);
    setTouched({ fullName: true, email: true, password: true, confirmPassword: true });

    if (!isFormValid) {
      // Optional: keep a gentle top-level hint, but the main feedback is inline.
      Alert.alert('Fix the highlighted fields', 'Please correct the errors shown in red.');
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
      const rawMsg = String(error?.message || '').trim();
      const msgLower = rawMsg.toLowerCase();

      // Friendly mapping for duplicate emails (backend returns 409 with a clear message)
      if (msgLower.includes('email already exists') || msgLower.includes('account with this email already exists')) {
        Alert.alert('Email already in use', 'An account with this email already exists. Try logging in instead.');
      } else {
        Alert.alert('Signup Failed', rawMsg || 'An error occurred during signup');
      }
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

  // React Native expects numeric width while web can accept string percentages.
  const getPasswordStrengthWidthValue = (): any => {
    if (Platform.OS === 'web') return getPasswordStrengthWidth();
    return `${(passwordStrength / 5) * 100}%` as any;
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
              {/* Decorative Floating Paw Prints */}
              <View style={styles.floatingPawsContainer}>
                <Ionicons name="paw" size={30} color="rgba(139, 92, 246, 0.1)" style={styles.floatingPaw1} />
                <Ionicons name="paw" size={24} color="rgba(167, 139, 250, 0.12)" style={styles.floatingPaw2} />
                <Ionicons name="paw" size={36} color="rgba(139, 92, 246, 0.08)" style={styles.floatingPaw3} />
                <Ionicons name="paw" size={28} color="rgba(167, 139, 250, 0.1)" style={styles.floatingPaw4} />
                <Ionicons name="paw" size={32} color="rgba(139, 92, 246, 0.09)" style={styles.floatingPaw5} />
                <Ionicons name="paw" size={26} color="rgba(167, 139, 250, 0.11)" style={styles.floatingPaw6} />
              </View>

              <View style={styles.cardContainer}>
                <View style={styles.content}>
              {/* Logo with Paw Icon */}
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={['#8b5cf6', '#a78bfa']}
                  style={styles.logoGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="paw" size={44} color="#ffffff" />
                </LinearGradient>
                {/* Small decorative paws around logo */}
                <Ionicons name="paw" size={16} color="rgba(139, 92, 246, 0.3)" style={styles.decorativePaw1} />
                <Ionicons name="paw" size={14} color="rgba(167, 139, 250, 0.3)" style={styles.decorativePaw2} />
              </View>

              {/* Title */}
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>🐾 Find the best vet for your beloved animal! 🐾</Text>

              {/* Full Name Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={20} color="#8b5cf6" style={styles.inputIcon} />
                  <Text style={styles.inputLabel}>Full Name</Text>
                </View>
                <TextInput
                    style={[styles.input, shouldShowError('fullName') && !!errors.fullName && styles.inputError]}
                  placeholder="John Doe"
                  placeholderTextColor="#a0a0a0"
                  value={fullName}
                    onChangeText={(t) => {
                      setFullName(t);
                      if (!touched.fullName) setTouched((p) => ({ ...p, fullName: true }));
                    }}
                    onBlur={() => setTouched((p) => ({ ...p, fullName: true }))}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
                  {shouldShowError('fullName') && !!errors.fullName && (
                    <View style={styles.errorContainer}>
                      <Ionicons name="close-circle" size={14} color="#ff4444" />
                      <Text style={styles.errorText}>{errors.fullName}</Text>
                    </View>
                  )}
              </View>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} color="#8b5cf6" style={styles.inputIcon} />
                  <Text style={styles.inputLabel}>Email Address</Text>
                </View>
                <TextInput
                    style={[styles.input, shouldShowError('email') && !!errors.email && styles.inputError]}
                  placeholder="username@domain.com"
                  placeholderTextColor="#a0a0a0"
                  value={email}
                    onChangeText={(t) => {
                      setEmail(t);
                      if (!touched.email) setTouched((p) => ({ ...p, email: true }));
                    }}
                    onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                  {shouldShowError('email') && !!errors.email && (
                    <View style={styles.errorContainer}>
                      <Ionicons name="close-circle" size={14} color="#ff4444" />
                      <Text style={styles.errorText}>{errors.email}</Text>
                    </View>
                  )}
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
                                width: getPasswordStrengthWidthValue(),
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
                    style={[
                      styles.input,
                      styles.passwordInput,
                      shouldShowError('password') && !!errors.password && styles.inputError,
                    ]}
                    placeholder="••••••••••••"
                    placeholderTextColor="#a0a0a0"
                    value={password}
                    onChangeText={(t) => {
                      handlePasswordChange(t);
                      if (!touched.password) setTouched((p) => ({ ...p, password: true }));
                    }}
                    onBlur={() => setTouched((p) => ({ ...p, password: true }))}
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
                      name={passwordIssues.length === 0 ? 'checkmark-circle' : 'information-circle'}
                      size={14}
                      color={passwordIssues.length === 0 ? '#00aa00' : '#ffaa00'}
                    />
                    <Text
                      style={[
                        styles.requirementText,
                        { color: passwordIssues.length === 0 ? '#00aa00' : '#999999' },
                      ]}
                    >
                      {passwordIssues.length === 0
                        ? 'Password looks good'
                        : `Missing: ${passwordIssues.join(', ')}`}
                    </Text>
                  </View>
                )}

                {shouldShowError('password') && !!errors.password && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="close-circle" size={14} color="#ff4444" />
                    <Text style={styles.errorText}>{errors.password}</Text>
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
                    style={[
                      styles.input,
                      styles.passwordInput,
                      shouldShowError('confirmPassword') && !!errors.confirmPassword && styles.inputError,
                    ]}
                    placeholder="••••••••"
                    placeholderTextColor="#a0a0a0"
                    value={confirmPassword}
                    onChangeText={(t) => {
                      setConfirmPassword(t);
                      if (!touched.confirmPassword) setTouched((p) => ({ ...p, confirmPassword: true }));
                    }}
                    onBlur={() => setTouched((p) => ({ ...p, confirmPassword: true }))}
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
                {shouldShowError('confirmPassword') && !!errors.confirmPassword && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="close-circle" size={14} color="#ff4444" />
                    <Text style={styles.errorText}>{errors.confirmPassword}</Text>
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
    top: '8%',
    left: '10%',
    transform: [{ rotate: '-15deg' }],
  },
  floatingPaw2: {
    position: 'absolute',
    top: '12%',
    right: '10%',
    transform: [{ rotate: '25deg' }],
  },
  floatingPaw3: {
    position: 'absolute',
    top: '40%',
    left: '6%',
    transform: [{ rotate: '10deg' }],
  },
  floatingPaw4: {
    position: 'absolute',
    bottom: '25%',
    left: '8%',
    transform: [{ rotate: '-20deg' }],
  },
  floatingPaw5: {
    position: 'absolute',
    top: '55%',
    right: '7%',
    transform: [{ rotate: '15deg' }],
  },
  floatingPaw6: {
    position: 'absolute',
    bottom: '18%',
    right: '12%',
    transform: [{ rotate: '-10deg' }],
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
  },
  inputError: {
    borderColor: '#ff4444',
    borderWidth: 1.5,
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
