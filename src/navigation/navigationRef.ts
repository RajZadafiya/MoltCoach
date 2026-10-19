/**
 * Global navigation ref and helpers
 * @format
 */
import {
  createNavigationContainerRef,
  StackActions,
} from '@react-navigation/native';
import { RootStackParamList } from 'interface';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate<T extends keyof RootStackParamList>(
  name: T,
  params?: RootStackParamList[T],
) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as any, params);
  }
}

export function push(name: keyof RootStackParamList, params?: object) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.push(name, params));
  }
}

export function currentRoute() {
  return navigationRef.isReady()
    ? navigationRef.getCurrentRoute()?.name
    : undefined;
}
