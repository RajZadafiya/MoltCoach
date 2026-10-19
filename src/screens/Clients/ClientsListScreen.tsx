import React from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useClients } from '../../hooks';
import { Client, ClientsScreenProps, Goal } from '../../interface';
import { formatStartedDaysAgo } from '../../utils/date';
import { ErrorView, LoadingView, SafeTouchable } from 'components';
import { SafeAreaView } from 'react-native-safe-area-context';

const GOAL_LABELS: Record<Goal, string> = {
  fat_loss: 'Fat loss',
  muscle_gain: 'Muscle gain',
  maintenance: 'Maintenance',
  recomp: 'Recomp',
};

export const ClientsListScreen: React.FC<ClientsScreenProps<'ClientsList'>> = ({
  navigation,
}) => {
  const { clients, isLoading, isRefetching, isError, errorMessage, refetch } =
    useClients();

  const handleClientPress = (client: Client) => {
    navigation.navigate('ClientProgress', {
      clientId: client.id,
      clientName: client.name,
    });
  };

  const renderClientItem = ({ item }: { item: Client }) => {
    const goalText = GOAL_LABELS[item.goal] || item.goal;
    const daysAgoText = formatStartedDaysAgo(item.startDateISO);
    const initial = item.name.charAt(0).toUpperCase();

    return (
      <SafeTouchable
        style={styles.clientCard}
        onPress={() => handleClientPress(item)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.avatarCircle,
            { backgroundColor: item.avatarColor || '#3B82F6' },
          ]}
        >
          <Text style={styles.avatarInitial}>{initial}</Text>
        </View>

        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{item.name}</Text>
          <Text style={styles.clientMeta}>
            {goalText} · {daysAgoText}
          </Text>
        </View>

        <Text style={styles.chevron}>›</Text>
      </SafeTouchable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Clients</Text>
      </View>

      {isLoading ? (
        <LoadingView message="Loading clients..." />
      ) : isError ? (
        <ErrorView
          message={errorMessage || 'Failed to load clients.'}
          onRetry={refetch}
        />
      ) : (
        <FlatList
          data={clients}
          keyExtractor={item => item.id}
          renderItem={renderClientItem}
          contentContainerStyle={styles.listContent}
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
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  listContent: {
    paddingVertical: 8,
  },
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  clientMeta: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 3,
  },
  chevron: {
    fontSize: 22,
    color: '#9CA3AF',
    marginLeft: 8,
    fontWeight: '300',
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 78,
  },
});
