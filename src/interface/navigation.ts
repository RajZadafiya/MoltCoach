import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

export type AuthStackParamList = {
  LogIn: undefined;
};

export type ClientsStackParamList = {
  ClientsList: undefined;
  ClientProgress: {
    clientId: string;
    clientName: string;
  };
};

export type RootTabParamList = {
  Clients: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Tabs: undefined;
};

export type AuthScreenProps<Screen extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, Screen>;

export type ClientsScreenProps<Screen extends keyof ClientsStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<ClientsStackParamList, Screen>,
    BottomTabScreenProps<RootTabParamList>
  >;

export type ProfileScreenProps = BottomTabScreenProps<
  RootTabParamList,
  'Profile'
>;

export type ClientsNavigationProp<Screen extends keyof ClientsStackParamList> =
  NativeStackNavigationProp<ClientsStackParamList, Screen>;
