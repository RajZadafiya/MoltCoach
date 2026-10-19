/**
 * @format
 */
import { isAndroid } from 'globals';
import { useEffect, useState } from 'react';
import { Keyboard, type KeyboardEvent } from 'react-native';

const emptyCoordinates = Object.freeze({
  screenX: 0,
  screenY: 0,
  width: 0,
  height: 0,
});

const initialValue = {
  start: emptyCoordinates,
  end: emptyCoordinates,
};

export const useKeyboard = () => {
  const [shown, setShown] = useState(false);

  const [coordinates, setCoordinates] = useState<{
    start: any;
    end: any;
  }>(initialValue);

  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);

  const handleKeyboardWillShow = (e: KeyboardEvent) => {
    setShown(true);
    const start =
      'startCoordinates' in e ? e.startCoordinates : e.endCoordinates;
    setCoordinates({ start, end: e.endCoordinates });
    setKeyboardHeight(e.endCoordinates.height);
  };

  const handleKeyboardWillHide = (e: KeyboardEvent) => {
    setShown(false);
    if (e) {
      const start =
        'startCoordinates' in e ? e.startCoordinates : e.endCoordinates;
      setCoordinates({ start, end: e.endCoordinates });
    } else {
      setCoordinates(initialValue);
      setKeyboardHeight(0);
    }
  };

  useEffect(() => {
    const subscriptions = isAndroid
      ? [
          Keyboard.addListener('keyboardDidShow', handleKeyboardWillShow),
          Keyboard.addListener('keyboardDidHide', handleKeyboardWillHide),
        ]
      : [
          Keyboard.addListener('keyboardWillShow', handleKeyboardWillShow),
          Keyboard.addListener('keyboardWillHide', handleKeyboardWillHide),
        ];

    return () => {
      subscriptions.forEach(subscription => subscription.remove());
    };
  }, []);

  return {
    keyboardShown: shown,
    coordinates,
    keyboardHeight,
  };
};
