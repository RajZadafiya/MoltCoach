import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from 'interface';
import { LoginScreen } from 'screens';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();

function AuthRoutes() {
  return (
    <AuthStack.Navigator initialRouteName="LogIn">
      <AuthStack.Screen
        name="LogIn"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
    </AuthStack.Navigator>
  );
}

export { AuthRoutes };
