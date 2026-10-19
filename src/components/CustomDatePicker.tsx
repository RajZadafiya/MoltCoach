import React, { JSX, useState } from 'react';
import { Keyboard, View, ViewProps } from 'react-native';
import { SafeTouchable } from './SafeTouchable';
import { DatePicker } from 'components/DatePicker';
import moment from 'moment';

interface CustomDatePickerProps extends ViewProps {
  value: string | Date;
  onChange: (date: Date) => void;
  renderTitle?: JSX.Element;
  renderUI?: JSX.Element;
  minimumDate?: Date;
  maximumDate?: Date;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value = new Date(),
  onChange,
  renderUI,
  minimumDate,
  maximumDate,
  ...rest
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  const onDateChange = (nValue: string | Date) => {
    onClose();
    const newDateValue = moment(nValue).toISOString().toString();
    if (onChange) {
      onChange(new Date(newDateValue));
    }
  };

  const dateValue =
    value && value !== ''
      ? moment(value).toDate()
      : moment(new Date()).toDate();

  const onPress = () => {
    Keyboard.dismiss();
    onOpen();
  };

  return (
    <View {...rest}>
      {renderUI ? (
        <SafeTouchable onPress={onPress}>{renderUI}</SafeTouchable>
      ) : (
        <SafeTouchable onPress={onPress} />
      )}
      <DatePicker
        mode={'date'}
        visible={isOpen}
        value={dateValue}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        onCancel={onClose}
        onSelect={onDateChange}
        dateTimeBoth={false}
        minuteInterval={15}
      />
    </View>
  );
};

export { CustomDatePicker };
