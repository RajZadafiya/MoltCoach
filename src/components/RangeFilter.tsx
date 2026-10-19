import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RangeFilterKey } from '../interface';
import { SafeTouchable } from './SafeTouchable';

interface RangeFilterProps {
  selected: RangeFilterKey;
  onSelect: (range: RangeFilterKey) => void;
}

const RANGES: RangeFilterKey[] = ['7D', '30D', '90D', 'All'];

export const RangeFilter: React.FC<RangeFilterProps> = ({
  selected,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      {RANGES.map(range => {
        const isSelected = selected === range;
        return (
          <SafeTouchable
            key={range}
            style={[styles.button, isSelected && styles.buttonActive]}
            onPress={() => onSelect(range)}
            activeOpacity={0.7}
          >
            <Text style={[styles.text, isSelected && styles.textActive]}>
              {range}
            </Text>
          </SafeTouchable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 3,
    alignSelf: 'flex-start',
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  buttonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  textActive: {
    color: '#111827',
  },
});
