/**
 * @format
 */
import React, { JSX } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './context/AuthContext';

export const queryClient = new QueryClient();

interface ProvideProps {
  children: JSX.Element | JSX.Element[];
}

function AppProviders(props: ProvideProps) {
  const { children } = props;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SafeAreaProvider>{children}</SafeAreaProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default AppProviders;
