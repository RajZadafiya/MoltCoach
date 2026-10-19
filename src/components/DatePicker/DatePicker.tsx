import React from 'react';
import { DatePicker as DatePickerAndroid } from './DatePicker.android';
import { DatePicker as DatePickerIOS } from './DatePicker.ios';
import { AndroidMode, IOSMode, MinuteInterval } from './interface';
import { isAndroid } from 'globals';

export interface DatePickerProps {
  value: Date;
  visible: boolean;
  is24Hour?: boolean;
  onCancel: () => void;
  onSelect: (value: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  mode?: AndroidMode | IOSMode;
  minuteInterval?: MinuteInterval;
  dateTimeBoth?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = (
  props: DatePickerProps,
) => {
  if (!isAndroid) {
    return (
      <DatePickerIOS
        {...props}
        is24Hour={props.is24Hour ?? false}
        mode={(props.mode as IOSMode) ?? 'date'}
      />
    );
  }
  return (
    <DatePickerAndroid
      {...props}
      dateTimeBoth={props.dateTimeBoth ?? false}
      is24Hour={props.is24Hour ?? false}
      mode={(props.mode as AndroidMode) ?? 'date'}
    />
  );
};
