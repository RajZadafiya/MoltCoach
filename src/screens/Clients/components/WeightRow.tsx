import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { WeightEntry, WeightUnit } from '../../../interface';
import { formatDelta, formatWeight } from '../../../utils/conversions';
import { formatDate } from '../../../utils/date';
import { SafeTouchable } from 'components';

interface WeightRowProps {
  item: WeightEntry;
  deltaKg: number | null;
  unit: WeightUnit;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export const WeightRow: React.FC<WeightRowProps> = ({
  item,
  deltaKg,
  unit,
  onDelete,
  isDeleting,
}) => {
  const handleLongPress = () => {
    if (item.isPending || isDeleting) return;
    Alert.alert(
      'Delete Entry',
      `Are you sure you want to delete the entry for ${formatDate(
        item.dateISO,
      )}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(item.id),
        },
      ],
    );
  };

  const isPending = !!item.isPending;
  const formattedWeight = formatWeight(item.weightKg, unit);
  const formattedDelta = formatDelta(deltaKg, unit);

  return (
    <SafeTouchable
      style={[styles.row, isPending && styles.rowPending]}
      onLongPress={handleLongPress}
      delayLongPress={400}
      activeOpacity={0.7}
    >
      <View style={styles.leftCol}>
        <View style={styles.dateRow}>
          <Text style={styles.dateText}>{formatDate(item.dateISO)}</Text>
          {isPending && (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>Saving...</Text>
            </View>
          )}
        </View>
        {!!item.note && <Text style={styles.noteText}>{item.note}</Text>}
      </View>

      <View style={styles.rightCol}>
        <Text style={styles.weightText}>{formattedWeight}</Text>
        <Text
          style={[
            styles.deltaText,
            deltaKg !== null && deltaKg > 0 ? styles.deltaPositive : null,
            deltaKg !== null && deltaKg < 0 ? styles.deltaNegative : null,
          ]}
        >
          {formattedDelta}
        </Text>
      </View>
    </SafeTouchable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  rowPending: {
    opacity: 0.55,
    backgroundColor: '#F9FAFB',
  },
  leftCol: {
    flex: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  pendingBadge: {
    marginLeft: 8,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pendingBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D97706',
  },
  noteText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  rightCol: {
    alignItems: 'flex-end',
  },
  weightText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  deltaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 2,
  },
  deltaPositive: {
    color: '#DC2626', // Weight gain usually red
  },
  deltaNegative: {
    color: '#16A34A', // Weight loss green
  },
});
