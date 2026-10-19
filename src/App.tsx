/**
 * @format
 */
import React, { useCallback } from 'react';
import { StatusBar, Text, TextInput } from 'react-native';

import NavContainer from './navigation';
import AppProviders from './AppProvider';
import FlashMessage from 'react-native-flash-message';

function SubApp() {
  return <NavContainer />;
}

interface TextWithDefaultProps extends Text {
  defaultProps?: { allowFontScaling?: boolean };
}
interface TextInputWithDefaultProps extends TextInput {
  defaultProps?: { allowFontScaling?: boolean };
}

function App() {
  const disableScaling = useCallback(() => {
    (Text as unknown as TextWithDefaultProps).defaultProps =
      (Text as unknown as TextWithDefaultProps).defaultProps || {};

    (Text as unknown as TextWithDefaultProps).defaultProps!.allowFontScaling =
      false;
    (TextInput as unknown as TextInputWithDefaultProps).defaultProps =
      (TextInput as unknown as TextInputWithDefaultProps).defaultProps || {};

    (
      TextInput as unknown as TextInputWithDefaultProps
    ).defaultProps!.allowFontScaling = false;
  }, []);

  React.useEffect(() => {
    disableScaling();
  }, [disableScaling]);

  return (
    <AppProviders>
      <StatusBar barStyle="dark-content" />
      <SubApp />
      <FlashMessage position="top" />
    </AppProviders>
  );
}

export default App;
