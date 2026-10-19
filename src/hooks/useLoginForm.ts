import { useState } from 'react';
import axios from 'axios';
import { useFormik } from 'formik';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessage } from '../api';

export interface LoginFormValues {
  email: string;
  password: string;
}

export function useLoginForm() {
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const formik = useFormik<LoginFormValues>({
    initialValues: {
      email: __DEV__ ? 'coach@molt.app' : '',
      password: __DEV__ ? 'molt1234' : '',
    },
    validate: values => {
      const errors: Partial<Record<keyof LoginFormValues, string>> = {};
      const trimmedEmail = values.email.trim();
      if (!trimmedEmail) {
        errors.email = 'Email is required.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        errors.email = 'Please enter a valid email address.';
      }

      if (!values.password) {
        errors.password = 'Password is required.';
      }

      return errors;
    },
    onSubmit: async (values, { setSubmitting }) => {
      setServerError(null);
      try {
        await login({
          email: values.email.trim(),
          password: values.password,
        });
      } catch (err: unknown) {
        const status = axios.isAxiosError(err) ? err.response?.status : undefined;
        if (status === 401) {
          setServerError('Email or password is wrong.');
        } else if (status === 503) {
          setServerError(
            'Server is temporarily unavailable. Please try again.',
          );
        } else {
          setServerError(
            extractErrorMessage(err, 'Unable to sign in. Please try again.'),
          );
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  return {
    ...formik,
    serverError,
    setServerError,
  };
}
