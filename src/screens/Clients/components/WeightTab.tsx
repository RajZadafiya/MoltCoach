import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AddWeightPayload, RangeFilterKey, WeightUnit } from '../../../interface';
import { useWeight } from '../../../hooks';
import {
  EmptyState,
  ErrorView,
  LoadingView,
  SafeTouchable,
  UnitToggle,
} from 'components';
import { WeightRow } from './WeightRow';
import { AddWeightModal } from '../AddWeightModal';
import { formatDelta, formatWeight } from '../../../utils/conversions';
import { extractErrorMessage } from '../../../api';

interface WeightTabProps {
  clientId: string;
  range: RangeFilterKey;
}

export const WeightTab: React.FC<WeightTabProps> = ({ clientId, range }) => {
  const [unit, setUnit] = useState<WeightUnit>('kg');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    entries,
    stats,
    isLoading,
    isRefetching,
    isError,
    errorMessage,
    refetch,
    addWeight,
    isAdding,
    deleteWeight,
    isDeleting,
  } = useWeight(clientId, range);

  const handleDeleteEntry = async (entryId: string) => {
    try {
      await deleteWeight(entryId);
    } catch (err) {
      Alert.alert(
        'Delete Failed',
        extractErrorMessage(err, 'Could not delete entry. Please try again.'),
      );
    }
  };

  const handleSaveWeight = async (payload: AddWeightPayload) => {
    await addWeight(payload);
  };

  if (isLoading) {
    return <LoadingView message="Loading weight history..." />;
  }

  if (isError) {
    return (
      <ErrorView
        message={errorMessage || 'Failed to load weight records.'}
        onRetry={refetch}
      />
    );
  }

  const hasEntries = entries.length > 0;
  const isRangeFiltered = range !== 'All';

  const rangeDescription =
    range === '7D'
      ? 'last 7 days'
      : range === '30D'
      ? 'last 30 days'
      : range === '90D'
      ? 'last 90 days'
      : '';

  return (
    <View style={styles.container}>
      {hasEntries && stats.latestWeightKg !== null && (
        <View style={styles.summaryCard}>
          <View style={styles.summaryTopRow}>
            <View>
              <Text style={styles.latestWeightText}>
                {formatWeight(stats.latestWeightKg, unit)}
              </Text>
              <Text style={styles.totalChangeText}>
                {stats.totalChangeKg !== null
                  ? `${formatDelta(
                      stats.totalChangeKg,
                      unit,
                    )} since oldest entry`
                  : '— (single entry)'}
              </Text>
            </View>

            <UnitToggle unit={unit} onToggle={setUnit} />
          </View>
        </View>
      )}

      <FlatList
        data={entries}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <WeightRow
            item={item}
            deltaKg={stats.entryDeltas.get(item.id) ?? null}
            unit={unit}
            onDelete={handleDeleteEntry}
            isDeleting={isDeleting}
          />
        )}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              refetch();
            }}
            tintColor="#2563EB"
            colors={['#2563EB']}
          />
        }
        ListEmptyComponent={
          isRangeFiltered ? (
            <EmptyState
              title={`Nothing in the ${rangeDescription}`}
              description="Try changing the range filter or add a new weight measurement."
              actionLabel="+ Add Weight"
              onAction={() => setIsModalOpen(true)}
            />
          ) : (
            <EmptyState
              title="No weight logged yet"
              description="Start tracking progress by logging the first weight measurement."
              actionLabel="+ Add Weight"
              onAction={() => setIsModalOpen(true)}
            />
          )
        }
      />

      <View style={styles.bottomBar}>
        <SafeTouchable
          style={styles.addButton}
          onPress={() => setIsModalOpen(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonText}>+ Add Weight</Text>
        </SafeTouchable>
      </View>

      <AddWeightModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveWeight}
        isSaving={isAdding}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  latestWeightText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  totalChangeText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 80,
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  addButton: {
    backgroundColor: '#2563EB',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
