import LoadingSpinner from '@/components/LoadingSpinner';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Theme } from '@/constants/Theme';
import { helperCallsApi } from '@/src/api/services';
import type { HelperCall } from '@/src/api/types';
import { useAuthStore } from '@/src/store/authStore';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HelpersCallsScreen() {
  const { token } = useAuthStore();
  const [calls, setCalls] = useState<HelperCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  // Fetch helper calls data
  const fetchCalls = async () => {
    // Don't fetch if no token is available
    if (!token) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const response = await helperCallsApi.getData();
      if (response.success && response.data) {
        setCalls(response.data.helper_calls || []);
      }
    } catch (error: any) {
      console.error('Failed to fetch helper calls:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to load helper calls');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh helper calls data on screen focus
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
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this helper call record?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: async () => {
          try {
            const response = await helperCallsApi.deleteCall(id);
            if (response.success) {
              Alert.alert('Success', 'Helper call deleted successfully');
              fetchCalls();
            }
          } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to delete helper call';
            Alert.alert('Error', errorMessage);
          }
        }
      },
    ]);
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

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading helper calls..." />;
  }

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
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Card variant="elevated" style={styles.callCard}>
            <View style={styles.cardHeader}>
              <View style={styles.helperIconContainer}>
                {item.helper?.avatar_url ? (
                  <Image source={{ uri: item.helper.avatar_url }} style={styles.helperAvatar} />
                ) : (
                  <FontAwesome name="user-circle" size={40} color={Theme.colors.primary} />
                )}
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.helperName}>{item.helper?.name || 'Helper'}</Text>
                <View style={styles.helperIdRow}>
                  <FontAwesome name="phone" size={12} color={Theme.colors.text.secondary} />
                  <Text style={styles.helperId}>{item.helper?.phone_number || 'N/A'}</Text>
                </View>
              </View>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.helper?.pivot?.priority || 3) }]}>
                <Text style={styles.priorityText}>{item.helper?.pivot?.priority || 3}</Text>
              </View>
            </View>
            
            <View style={styles.statusRow}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status || 'pending') }]}>
                <FontAwesome name={getStatusIcon(item.status || 'pending')} size={12} color="#fff" />
                <Text style={styles.statusText}>{item.status || 'pending'}</Text>
              </View>
            </View>

            <View style={styles.callMetadata}>
              <View style={styles.metadataItem}>
                <FontAwesome name="clock-o" size={14} color={Theme.colors.text.secondary} />
                <Text style={styles.metadataText}>Initiated: {item.initiated_at ? new Date(item.initiated_at).toLocaleString() : 'N/A'}</Text>
              </View>
              {item.duration_seconds && (
                <View style={styles.metadataItem}>
                  <FontAwesome name="hourglass-half" size={14} color={Theme.colors.text.secondary} />
                  <Text style={styles.metadataText}>Duration: {Math.floor(item.duration_seconds / 60)}m {item.duration_seconds % 60}s</Text>
                </View>
              )}
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity 
                style={styles.viewButton}
                onPress={() => router.push(`/helper-call-detail?id=${item.id}`)}
              >
                <Text style={styles.viewDetailsText}>View Details</Text>
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
          </Card>
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
  listContent: { padding: 24, paddingBottom: 120 },
  callCard: { marginBottom: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  helperIconContainer: { marginRight: 12, width: 40, height: 40, borderRadius: 20, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  helperAvatar: { width: 40, height: 40, borderRadius: 20 },
  cardInfo: { flex: 1 },
  helperName: { fontSize: 18, fontWeight: '700', color: Theme.colors.text.primary, marginBottom: 4 },
  helperIdRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  helperId: { fontSize: 12, color: Theme.colors.text.secondary },
  priorityBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 9999, minWidth: 36, alignItems: 'center', justifyContent: 'center' },
  priorityText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  statusRow: { marginBottom: 12 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, alignSelf: 'flex-start' },
  statusText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  callMetadata: { marginBottom: 12 },
  metadataItem: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  metadataText: { fontSize: 12, color: Theme.colors.text.secondary },
  metadataValue: { fontSize: 14, color: Theme.colors.text.primary, fontWeight: '500' },
  cardActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  viewButton: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  viewDetailsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start' },
  viewDetailsText: { fontSize: 14, fontWeight: '600', color: Theme.colors.primary },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 64 },
  emptyText: { fontSize: 20, fontWeight: '600', color: Theme.colors.text.primary, marginTop: 16 },
  emptySubtext: { fontSize: 14, color: Theme.colors.text.secondary, marginTop: 8, textAlign: 'center' },
});

