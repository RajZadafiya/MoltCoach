/**
 * iOS DatePicker modal implementation using @react-native-community/datetimepicker
 * @format
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
  IOSNativeProps,
} from '@react-native-community/datetimepicker';

import { IOSMode, MinuteInterval } from './interface';
import { SafeTouchable } from 'components/SafeTouchable';
import { isAndroid } from 'globals';

interface IPickerProps extends IOSNativeProps {
  visible: boolean;
  is24Hour?: boolean;
  onCancel: () => void;
  onSelect: (value: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  minuteInterval?: MinuteInterval;
  mode: IOSMode;
}

export function DatePicker(props: IPickerProps) {
  const {
    visible,
    value,
    is24Hour,
    onCancel,
    onSelect,
    minimumDate,
    maximumDate,
    minuteInterval = 15,
    mode,
  } = props;

  const [selectedValue, setSelectedValue] = useState(value);

  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  const onChange = useCallback((_: DateTimePickerEvent, date?: Date) => {
    if (date) setSelectedValue(date);
  }, []);

  const onCancelPress = useCallback(() => onCancel(), [onCancel]);

  const onDonePress = useCallback(
    () => onSelect(selectedValue),
    [onSelect, selectedValue],
  );

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancelPress}
    >
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header with Cancel and Done */}
          <View style={styles.header}>
            <SafeTouchable onPress={onCancelPress} style={styles.headerBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </SafeTouchable>
            <Text style={styles.headerTitle}>Select Date</Text>
            <SafeTouchable onPress={onDonePress} style={styles.headerBtn}>
              <Text style={styles.doneText}>Done</Text>
            </SafeTouchable>
          </View>

          {/* DateTimePicker spinner */}
          <View style={styles.pickerWrapper}>
            <DateTimePicker
              mode={mode}
              minuteInterval={minuteInterval}
              style={styles.picker}
              textColor="#111827"
              testID="dateTimePicker"
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              value={selectedValue}
              is24Hour={is24Hour}
              display="spinner"
              themeVariant="light"
              onChange={onChange}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: isAndroid ? 20 : 34,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerBtn: {
    padding: 6,
  },
  cancelText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  doneText: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '600',
  },
  pickerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  picker: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    height: 200,
  },
});
