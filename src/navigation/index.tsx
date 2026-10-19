import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
import { RootStackParamList } from 'interface';
import { navigationRef } from './navigationRef';
import { AuthRoutes } from './auth.navigation';
import { BottomTabNavigator } from './tabs.navigations';
import { useAuth } from '../context/AuthContext';
import { LoadingView } from 'components';

const Stack = createNativeStackNavigator<RootStackParamList>();

function NavContainer() {
  const { isAuthenticated, isLoading } = useAuth();

  const screenOptions: NativeStackNavigationOptions = React.useMemo(
    () => ({
      headerShown: false,
      gestureEnabled: true,
    }),
    [],
  );

  if (isLoading) {
    return <LoadingView message="Starting Molt Coach..." />;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar barStyle="dark-content" />
      <Stack.Navigator screenOptions={screenOptions}>
        {isAuthenticated ? (
          <Stack.Screen name="Tabs" component={BottomTabNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthRoutes} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default NavContainer;
