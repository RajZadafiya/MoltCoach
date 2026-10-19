/**
 * @format
 */
import React, { useCallback, useState } from 'react';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import moment from 'moment';

import { AndroidMode, MinuteInterval } from './interface';

interface IPickerProps {
  value: Date;
  visible: boolean;
  is24Hour?: boolean;
  onCancel: () => void;
  onSelect: (value: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  mode: AndroidMode;
  minuteInterval?: MinuteInterval;
  dateTimeBoth?: boolean;
}

export function DatePicker(props: IPickerProps) {
  const {
    value,
    visible,
    mode,
    is24Hour = false,
    onSelect,
    onCancel,
    minuteInterval = 15,
    minimumDate,
    maximumDate,
    dateTimeBoth,
  } = props;

  const [pickerMode, setPickerMode] = useState(mode);

  const [date, setDate] = useState<Date>();

  const onChange = useCallback(
    (_: DateTimePickerEvent, selectedDate?: Date) => {
      if (selectedDate) {
        if (dateTimeBoth) {
          if (pickerMode === 'date') {
            setDate(selectedDate);
            setPickerMode('time');
          } else {
            const sDate = moment(date).format('YYYY-MM-DD');
            const sTime = moment(selectedDate).format('hh:mm A');
            const userDate = moment(sDate + sTime, 'YYYY-MM-DDLT').toDate();
            setPickerMode('date');
            onSelect(userDate);
          }
        } else {
          onSelect(selectedDate);
        }
      } else {
        if (mode === 'time') {
          setPickerMode('time');
        } else {
          setPickerMode('date');
        }
        onCancel();
      }
    },
    [dateTimeBoth, pickerMode, date, onSelect, onCancel, mode],
  );

  if (!visible) {
    return null;
  }

  return (
    <DateTimePicker
      minuteInterval={minuteInterval}
      testID="dateTimePicker"
      minimumDate={minimumDate}
      maximumDate={maximumDate}
      value={value}
      mode={pickerMode}
      is24Hour={is24Hour}
      display="default"
      onChange={onChange}
    />
  );
}
