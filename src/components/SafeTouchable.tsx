import * as React from 'react';
import {
  GestureResponderEvent,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import debounce from 'lodash.debounce';

const INTERVAL = 500;

type SafeTouchableProps = Omit<TouchableOpacityProps, 'onBlur' | 'onFocus'> & {
  onBlur?: TouchableOpacityProps['onBlur'] | null;
  onFocus?: TouchableOpacityProps['onFocus'] | null;
};

function SafeTouchable({
  onPress,
  onBlur,
  onFocus,
  children,
  ...rest
}: SafeTouchableProps) {
  const debouncedClick = React.useMemo(
    () =>
      debounce(
        (event: GestureResponderEvent) => {
          onPress?.(event);
        },
        INTERVAL,
        {
          leading: true,
          trailing: false,
          maxWait: INTERVAL,
        },
      ),
    [onPress],
  );

  React.useEffect(() => {
    return () => {
      debouncedClick.cancel();
    };
  }, [debouncedClick]);

  const handlePress = React.useCallback(
    (event: GestureResponderEvent) => {
      debouncedClick(event);
    },
    [debouncedClick],
  );

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      {...rest}
      onBlur={onBlur ?? undefined}
      onFocus={onFocus ?? undefined}
      onPress={handlePress}
    >
      {children}
    </TouchableOpacity>
  );
}

export { SafeTouchable };
