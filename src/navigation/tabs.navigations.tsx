import React from 'react';
import {
  BottomTabNavigationOptions,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ClientsStackParamList, RootTabParamList } from 'interface';
import {
  ClientProgressScreen,
  ClientsListScreen,
  ProfileScreen,
} from 'screens';

const BottomTab = createBottomTabNavigator<RootTabParamList>();
const ClientsStack = createNativeStackNavigator<ClientsStackParamList>();

function ClientsStackNavigator() {
  return (
    <ClientsStack.Navigator
      initialRouteName="ClientsList"
      screenOptions={{
        headerShown: false,
      }}
    >
      <ClientsStack.Screen name="ClientsList" component={ClientsListScreen} />
      <ClientsStack.Screen
        name="ClientProgress"
        component={ClientProgressScreen}
      />
    </ClientsStack.Navigator>
  );
}

function BottomTabNavigator() {
  const screenOptions: BottomTabNavigationOptions = {
    headerShown: false,
    tabBarActiveTintColor: '#2563EB',
    tabBarInactiveTintColor: '#9CA3AF',
    tabBarStyle: {
      backgroundColor: '#FFFFFF',
      borderTopWidth: 1,
      borderTopColor: '#E5E7EB',
      height: 60,
      paddingBottom: 8,
      paddingTop: 6,
    },
    tabBarLabelStyle: {
      fontSize: 12,
      fontWeight: '600',
    },
  };

  return (
    <BottomTab.Navigator
      initialRouteName="Clients"
      screenOptions={screenOptions}
    >
      <BottomTab.Screen
        name="Clients"
        component={ClientsStackNavigator}
        options={{
          title: 'Clients',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'people' : 'people-outline'}
              size={size || 22}
              color={color}
            />
          ),
        }}
      />
      <BottomTab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={size || 22}
              color={color}
            />
          ),
        }}
      />
    </BottomTab.Navigator>
  );
}

export { BottomTabNavigator };
