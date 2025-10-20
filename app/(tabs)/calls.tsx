import Card from '@/components/ui/Card';
import { Theme } from '@/constants/Theme';
import * as mockServer from '@/src/api/mockServer';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Call = { uuid: string; device_id: string; status: string; initiated_at: string; twilio_call_sid: string };

export default function CallsScreen() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchCalls();
  }, []);

  const fetchCalls = async () => {
    const list = await mockServer.getCalls();
    setCalls(list);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCalls();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return Theme.colors.secondary;
      case 'in-progress': return Theme.colors.accent;
      case 'failed': return Theme.colors.danger;
      default: return Theme.colors.text.secondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'check-circle';
      case 'in-progress': return 'spinner';
      case 'failed': return 'times-circle';
      default: return 'phone';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#F59E0B', '#EF4444']} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Call History</Text>
            <Text style={styles.headerSubtitle}>{calls.length} total calls</Text>
          </View>
          <View style={styles.iconContainer}>
            <FontAwesome name="phone" size={32} color="#fff" />
          </View>
        </View>
      </LinearGradient>

      <FlatList
        data={calls}
        keyExtractor={(item) => item.uuid}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/call-detail?uuid=${item.uuid}`)}>
            <Card variant="elevated" style={styles.callCard}>
              <View style={styles.timelineContainer}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineLine} />
              </View>
              <View style={styles.callContent}>
                <View style={styles.callHeader}>
                  <View style={styles.callTitleRow}>
                    <FontAwesome name="phone" size={20} color={Theme.colors.primary} />
                    <Text style={styles.callTitle}>Emergency Call</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <FontAwesome name={getStatusIcon(item.status)} size={12} color="#fff" />
                    <Text style={styles.statusText}>{item.status}</Text>
                  </View>
                </View>
                <View style={styles.callDetails}>
                  <View style={styles.detailRow}>
                    <FontAwesome name="clock-o" size={14} color={Theme.colors.text.secondary} />
                    <Text style={styles.detailText}>{formatDate(item.initiated_at)} at {formatTime(item.initiated_at)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <FontAwesome name="mobile" size={16} color={Theme.colors.text.secondary} />
                    <Text style={styles.detailText}>Device: {item.device_id?.slice(0, 8) || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <FontAwesome name="hashtag" size={14} color={Theme.colors.text.secondary} />
                    <Text style={styles.detailText}>ID: {item.uuid.slice(0, 13)}...</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.viewButton}>
                  <Text style={styles.viewButtonText}>View Details</Text>
                  <FontAwesome name="chevron-right" size={14} color={Theme.colors.primary} />
                </TouchableOpacity>
              </View>
            </Card>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <FontAwesome name="phone" size={64} color={Theme.colors.border.light} />
            <Text style={styles.emptyText}>No calls yet</Text>
            <Text style={styles.emptySubtext}>Trigger an emergency call from the home screen</Text>
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
  callCard: { marginBottom: 16, flexDirection: 'row' },
  timelineContainer: { width: 24, alignItems: 'center', marginRight: 16 },
  timelineDot: { width: 12, height: 12, borderRadius: 9999, backgroundColor: Theme.colors.primary, marginTop: 8 },
  timelineLine: { flex: 1, width: 2, backgroundColor: Theme.colors.border.light, marginTop: 4 },
  callContent: { flex: 1 },
  callHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  callTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  callTitle: { fontSize: 18, fontWeight: '700', color: Theme.colors.text.primary },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 9999 },
  statusText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  callDetails: { gap: 8, marginBottom: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailText: { fontSize: 14, color: Theme.colors.text.secondary },
  viewButton: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start' },
  viewButtonText: { fontSize: 14, fontWeight: '600', color: Theme.colors.primary },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 64 },
  emptyText: { fontSize: 20, fontWeight: '600', color: Theme.colors.text.primary, marginTop: 16 },
  emptySubtext: { fontSize: 14, color: Theme.colors.text.secondary, marginTop: 8, textAlign: 'center' },
});

