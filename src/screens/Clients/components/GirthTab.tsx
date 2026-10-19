import React, { useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { GirthEntry, GirthSite, RangeFilterKey } from '../../../interface';
import { useGirth } from '../../../hooks';
import { EmptyState, ErrorView, LoadingView, SafeTouchable } from 'components';
import { formatGirthCm, formatGirthDeltaCm } from '../../../utils/conversions';
import { formatDate } from '../../../utils/date';

interface GirthTabProps {
  clientId: string;
  range: RangeFilterKey;
}

const SITES: { key: GirthSite; label: string }[] = [
  { key: 'waist', label: 'Waist' },
  { key: 'chest', label: 'Chest' },
  { key: 'hip', label: 'Hip' },
  { key: 'arm', label: 'Arm' },
  { key: 'thigh', label: 'Thigh' },
];

export const GirthTab: React.FC<GirthTabProps> = ({ clientId, range }) => {
  const [selectedSite, setSelectedSite] = useState<GirthSite>('waist');

  const {
    entries,
    latestMm,
    totalChangeMm,
    entryDeltas,
    isLoading,
    isRefetching,
    isError,
    errorMessage,
    refetch,
  } = useGirth(clientId, selectedSite, range);

  const selectedSiteLabel =
    SITES.find(s => s.key === selectedSite)?.label || selectedSite;

  const renderGirthRow = ({ item }: { item: GirthEntry }) => {
    const deltaMm = entryDeltas.get(item.id) ?? null;
    const formattedCm = formatGirthCm(item.valueMm);
    const formattedDelta = formatGirthDeltaCm(deltaMm);

    return (
      <View style={styles.row}>
        <View style={styles.leftCol}>
          <Text style={styles.dateText}>{formatDate(item.dateISO)}</Text>
        </View>

        <View style={styles.rightCol}>
          <Text style={styles.valueText}>{formattedCm}</Text>
          <Text
            style={[
              styles.deltaText,
              deltaMm !== null && deltaMm > 0 ? styles.deltaPositive : null,
              deltaMm !== null && deltaMm < 0 ? styles.deltaNegative : null,
            ]}
          >
            {formattedDelta}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.siteSelectorWrapper}>
        <View style={styles.siteSelector}>
          {SITES.map(site => {
            const isSelected = selectedSite === site.key;
            return (
              <SafeTouchable
                key={site.key}
                style={[
                  styles.siteButton,
                  isSelected && styles.siteButtonActive,
                ]}
                onPress={() => setSelectedSite(site.key)}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.siteText, isSelected && styles.siteTextActive]}
                >
                  {site.label}
                </Text>
              </SafeTouchable>
            );
          })}
        </View>
      </View>

      {/* Content Area */}
      {isLoading ? (
        <LoadingView message={`Loading ${selectedSiteLabel} measurements...`} />
      ) : isError ? (
        <ErrorView
          message={errorMessage || 'Failed to load girth measurements.'}
          onRetry={refetch}
        />
      ) : (
        <>
          {entries.length > 0 && latestMm !== null && (
            <View style={styles.summaryCard}>
              <Text style={styles.latestValueText}>
                {formatGirthCm(latestMm)}
              </Text>
              <Text style={styles.totalChangeText}>
                {totalChangeMm !== null
                  ? `${formatGirthDeltaCm(totalChangeMm)} since oldest entry`
                  : '— (single entry)'}
              </Text>
            </View>
          )}

          <FlatList
            data={entries}
            keyExtractor={item => item.id}
            renderItem={renderGirthRow}
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
              <EmptyState
                title={`No ${selectedSiteLabel.toLowerCase()} measurements`}
                description={`No girth data recorded for ${selectedSiteLabel.toLowerCase()} in the selected range.`}
              />
            }
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  siteSelectorWrapper: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  siteSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 3,
  },
  siteButton: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 6,
  },
  siteButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  siteText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  siteTextActive: {
    color: '#111827',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  latestValueText: {
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
    paddingBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  leftCol: {
    flex: 1,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  rightCol: {
    alignItems: 'flex-end',
  },
  valueText: {
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
    color: '#DC2626',
  },
  deltaNegative: {
    color: '#16A34A',
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
});
