import LoadingSpinner from '@/components/LoadingSpinner';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Theme } from '@/constants/Theme';
import { customerCallsApi } from '@/src/api/services';
import type { CustomerCall } from '@/src/api/types';
import { useAuthStore } from '@/src/store/authStore';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CallsScreen() {
  const { token } = useAuthStore();
  const [calls, setCalls] = useState<CustomerCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  // Fetch calls data
  const fetchCalls = async () => {
    // Don't fetch if no token is available
    if (!token) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const response = await customerCallsApi.getData();
      if (response.success && response.data) {
        setCalls(response.data.customer_calls || []);
      }
    } catch (error: any) {
      console.error('Failed to fetch calls:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to load calls');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh calls data on screen focus
  useFocusEffect(
    useCallback(() => {
      if (token) {
        setLoading(true);
        fetchCalls();
      }
    }, [token])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchCalls();
  };

  const handleDelete = async (id: number) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this call record?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: async () => {
          try {
            const response = await customerCallsApi.deleteCall(id);
            if (response.success) {
              Alert.alert('Success', 'Call deleted successfully');
              fetchCalls();
            }
          } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to delete call';
            Alert.alert('Error', errorMessage);
          }
        }
      },
    ]);
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
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

  const formatTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (duration: number | null) => {
    if (!duration) return 'N/A';
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}m ${seconds}s`;
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading calls..." />;
  }

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
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
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
                  <Text style={styles.statusText}>{item.status || 'N/A'}</Text>
                </View>
              </View>
              <View style={styles.callDetails}>
                <View style={styles.detailRow}>
                  <FontAwesome name="clock-o" size={14} color={Theme.colors.text.secondary} />
                  <Text style={styles.detailText}>{formatDate(item.initiated_at || null)} at {formatTime(item.initiated_at || null)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <FontAwesome name="hourglass-half" size={14} color={Theme.colors.text.secondary} />
                  <Text style={styles.detailText}>Duration: {formatDuration(item.duration_seconds || null)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <FontAwesome name="mobile" size={16} color={Theme.colors.text.secondary} />
                  <Text style={styles.detailText}>Device ID: {item.device_id || 'N/A'}</Text>
                </View>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity 
                  style={styles.viewButton}
                  onPress={() => router.push(`/call-detail?id=${item.id}`)}
                >
                  <Text style={styles.viewButtonText}>View Details</Text>
                  <FontAwesome name="chevron-right" size={14} color={Theme.colors.primary} />
                </TouchableOpacity>
                <Button
                  title="Delete"
                  onPress={() => handleDelete(item.id)}
                  variant="danger"
                  size="small"
                  icon={<FontAwesome name="trash" size={16} color="#fff" />}
                />
              </View>
            </View>
          </Card>
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
  cardActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 4 },
  viewButton: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  viewButtonText: { fontSize: 14, fontWeight: '600', color: Theme.colors.primary },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 64 },
  emptyText: { fontSize: 20, fontWeight: '600', color: Theme.colors.text.primary, marginTop: 16 },
  emptySubtext: { fontSize: 14, color: Theme.colors.text.secondary, marginTop: 8, textAlign: 'center' },
});

