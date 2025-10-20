import Card from '@/components/ui/Card';
import { Theme } from '@/constants/Theme';
import * as mockServer from '@/src/api/mockServer';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HelpersCallsScreen() {
  const [calls, setCalls] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchCalls();
  }, []);

  const fetchCalls = async () => {
    const list = await mockServer.getHelpersCalls();
    setCalls(list);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCalls();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'answered': return Theme.colors.secondary;
      case 'no-answer': return Theme.colors.accent;
      case 'busy': return Theme.colors.danger;
      case 'failed': return Theme.colors.danger;
      default: return Theme.colors.text.secondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'answered': return 'check-circle';
      case 'no-answer': return 'phone';
      case 'busy': return 'ban';
      case 'failed': return 'times-circle';
      default: return 'phone';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority === 1) return '#EF4444';
    if (priority === 2) return '#F59E0B';
    return '#10B981';
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#8B5CF6', '#A855F7']} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Helper Calls</Text>
            <Text style={styles.headerSubtitle}>{calls.length} outgoing calls</Text>
          </View>
          <View style={styles.iconContainer}>
            <FontAwesome name="users" size={28} color="#fff" />
          </View>
        </View>
      </LinearGradient>

      <FlatList
        data={calls}
        keyExtractor={(item) => item.uuid}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/helper-call-detail?uuid=${item.uuid}`)}>
            <Card variant="elevated" style={styles.callCard}>
              <View style={styles.cardHeader}>
                <View style={styles.helperIconContainer}>
                  <FontAwesome name="user-circle" size={40} color={Theme.colors.primary} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.helperName}>Helper</Text>
                  <View style={styles.helperIdRow}>
                    <FontAwesome name="hashtag" size={12} color={Theme.colors.text.secondary} />
                    <Text style={styles.helperId}>{item.helper_id?.slice(0, 8) || 'N/A'}</Text>
                  </View>
                </View>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority || 3) }]}>
                  <FontAwesome name="flag" size={12} color="#fff" />
                  <Text style={styles.priorityText}>P{item.priority || 3}</Text>
                </View>
              </View>
              
              <View style={styles.statusRow}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                  <FontAwesome name={getStatusIcon(item.status)} size={12} color="#fff" />
                  <Text style={styles.statusText}>{item.status || 'pending'}</Text>
                </View>
              </View>

              <View style={styles.callMetadata}>
                <View style={styles.metadataItem}>
                  <FontAwesome name="phone" size={14} color={Theme.colors.text.secondary} />
                  <Text style={styles.metadataText}>Call ID</Text>
                </View>
                <Text style={styles.metadataValue}>{item.uuid.slice(0, 13)}...</Text>
              </View>

              <View style={styles.viewDetailsRow}>
                <Text style={styles.viewDetailsText}>View Details</Text>
                <FontAwesome name="chevron-right" size={14} color={Theme.colors.primary} />
              </View>
            </Card>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <FontAwesome name="phone" size={64} color={Theme.colors.border.light} />
            <Text style={styles.emptyText}>No helper calls yet</Text>
            <Text style={styles.emptySubtext}>Helper calls will appear here when triggered</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  header: { paddingTop: 60, paddingBottom: 24, paddingHorizontal: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 4 },
  headerSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)' },
  iconContainer: { width: 56, height: 56, borderRadius: 9999, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: 24, paddingBottom: 64 },
  callCard: { marginBottom: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  helperIconContainer: { marginRight: 12 },
  cardInfo: { flex: 1 },
  helperName: { fontSize: 18, fontWeight: '700', color: Theme.colors.text.primary, marginBottom: 4 },
  helperIdRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  helperId: { fontSize: 12, color: Theme.colors.text.secondary },
  priorityBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 9999 },
  priorityText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  statusRow: { marginBottom: 12 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, alignSelf: 'flex-start' },
  statusText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  callMetadata: { marginBottom: 12 },
  metadataItem: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  metadataText: { fontSize: 12, color: Theme.colors.text.secondary },
  metadataValue: { fontSize: 14, color: Theme.colors.text.primary, fontWeight: '500' },
  viewDetailsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start' },
  viewDetailsText: { fontSize: 14, fontWeight: '600', color: Theme.colors.primary },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 64 },
  emptyText: { fontSize: 20, fontWeight: '600', color: Theme.colors.text.primary, marginTop: 16 },
  emptySubtext: { fontSize: 14, color: Theme.colors.text.secondary, marginTop: 8, textAlign: 'center' },
});

