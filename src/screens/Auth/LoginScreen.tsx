import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeTouchable } from 'components';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLoginForm } from '../../hooks';
import { isAndroid } from 'globals';

export const LoginScreen: React.FC = () => {
  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleSubmit,
    serverError,
    setServerError,
  } = useLoginForm();

  const emailError = touched.email || isSubmitting ? errors.email : null;
  const passwordError =
    touched.password || isSubmitting ? errors.password : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={isAndroid ? undefined : 'padding'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.appTitle}>Molt Coach</Text>
            <Text style={styles.subtitle}>
              Sign in to manage client progress
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, emailError ? styles.inputError : null]}
                placeholder="coach@molt.app"
                placeholderTextColor="#9CA3AF"
                value={values.email}
                onChangeText={val => {
                  handleChange('email')(val);
                  if (serverError) setServerError(null);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isSubmitting}
              />
              {!!emailError && (
                <Text style={styles.fieldError}>{emailError}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[styles.input, passwordError ? styles.inputError : null]}
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                value={values.password}
                onChangeText={val => {
                  handleChange('password')(val);
                  if (serverError) setServerError(null);
                }}
                secureTextEntry // Masked password (L1)
                autoCapitalize="none"
                editable={!isSubmitting}
              />
              {!!passwordError && (
                <Text style={styles.fieldError}>{passwordError}</Text>
              )}
            </View>

            {!!serverError && (
              <View style={styles.serverErrorBox}>
                <Text style={styles.serverErrorText}>! {serverError}</Text>
              </View>
            )}

            <SafeTouchable
              style={[
                styles.submitButton,
                isSubmitting && styles.submitButtonDisabled,
              ]}
              onPress={() => handleSubmit()}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Sign in</Text>
              )}
            </SafeTouchable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 24,
  },
  header: {
    marginBottom: 36,
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 6,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    height: 48,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#111827',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  fieldError: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  serverErrorBox: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 18,
  },
  serverErrorText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  submitButton: {
    height: 48,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.65,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
