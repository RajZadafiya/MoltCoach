import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WeightUnit } from '../interface';
import { SafeTouchable } from './SafeTouchable';

interface UnitToggleProps {
  unit: WeightUnit;
  onToggle: (unit: WeightUnit) => void;
}

export const UnitToggle: React.FC<UnitToggleProps> = ({ unit, onToggle }) => {
  return (
    <View style={styles.container}>
      <SafeTouchable
        style={[styles.button, unit === 'kg' && styles.buttonActive]}
        onPress={() => onToggle('kg')}
        activeOpacity={0.7}
      >
        <Text style={[styles.text, unit === 'kg' && styles.textActive]}>
          kg
        </Text>
      </SafeTouchable>
      <SafeTouchable
        style={[styles.button, unit === 'lb' && styles.buttonActive]}
        onPress={() => onToggle('lb')}
        activeOpacity={0.7}
      >
        <Text style={[styles.text, unit === 'lb' && styles.textActive]}>
          lb
        </Text>
      </SafeTouchable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  button: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buttonActive: {
    backgroundColor: '#2563EB',
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  textActive: {
    color: '#FFFFFF',
  },
});
