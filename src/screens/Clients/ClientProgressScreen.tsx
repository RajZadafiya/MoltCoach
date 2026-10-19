import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ClientsScreenProps, RangeFilterKey } from '../../interface';
import { RangeFilter, SafeTouchable } from 'components';
import { WeightTab } from './components/WeightTab';
import { GirthTab } from './components/GirthTab';
import { SafeAreaView } from 'react-native-safe-area-context';

type SubTab = 'weight' | 'girth';

export const ClientProgressScreen: React.FC<
  ClientsScreenProps<'ClientProgress'>
> = ({ route, navigation }) => {
  const { clientId, clientName } = route.params;

  const [activeSubTab, setActiveSubTab] = useState<SubTab>('weight');
  const [range, setRange] = useState<RangeFilterKey>('30D');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navHeader}>
        <SafeTouchable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backChevron}>‹</Text>
        </SafeTouchable>
        <Text style={styles.clientTitle} numberOfLines={1}>
          {clientName}
        </Text>
      </View>

      <View style={styles.subTabsContainer}>
        <SafeTouchable
          style={[
            styles.subTabButton,
            activeSubTab === 'weight' && styles.subTabButtonActive,
          ]}
          onPress={() => setActiveSubTab('weight')}
        >
          <Text
            style={[
              styles.subTabText,
              activeSubTab === 'weight' && styles.subTabTextActive,
            ]}
          >
            Weight
          </Text>
        </SafeTouchable>

        <SafeTouchable
          style={[
            styles.subTabButton,
            activeSubTab === 'girth' && styles.subTabButtonActive,
          ]}
          onPress={() => setActiveSubTab('girth')}
        >
          <Text
            style={[
              styles.subTabText,
              activeSubTab === 'girth' && styles.subTabTextActive,
            ]}
          >
            Girth
          </Text>
        </SafeTouchable>
      </View>

      <View style={styles.filterRow}>
        <RangeFilter selected={range} onSelect={setRange} />
      </View>

      <View style={styles.content}>
        {activeSubTab === 'weight' ? (
          <WeightTab clientId={clientId} range={range} />
        ) : (
          <GirthTab clientId={clientId} range={range} />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    paddingRight: 12,
    paddingVertical: 4,
  },
  backChevron: {
    fontSize: 30,
    fontWeight: '300',
    color: '#111827',
    marginTop: -4,
  },
  clientTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  subTabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  subTabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  subTabButtonActive: {
    borderBottomColor: '#2563EB',
  },
  subTabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  subTabTextActive: {
    color: '#2563EB',
  },
  filterRow: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  content: {
    flex: 1,
  },
});
