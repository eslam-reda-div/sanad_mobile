import LoadingSpinner from '@/components/LoadingSpinner';
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
      case 'answered': case 'completed': return '#10B981'; // Green - same as 'completed'
      case 'no-answer': return '#F59E0B'; // Orange - same as 'in-progress'
      case 'busy': return '#EF4444'; // Red - same as 'failed'
      case 'failed': return '#EF4444'; // Red - same as 'failed'
      default: return '#6B7280'; // Gray
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
          <View style={styles.callCard}>
            <LinearGradient
              colors={['#FFFFFF', '#F8FAFC']}
              style={styles.callCardGradient}
            >
              {/* Status Indicator Strip */}
              {/* <View style={[styles.statusStrip, { backgroundColor: getStatusColor(item.status || 'pending') }]} /> */}
              
              <View style={styles.callCardContent}>
                {/* Header with Helper Image and Status */}
                <View style={styles.callHeader}>
                  <View style={styles.callHeaderLeft}>
                    <View style={styles.helperImageContainer}>
                      {item.helper?.avatar_url ? (
                        <Image 
                          source={{ uri: item.helper.avatar_url }} 
                          style={styles.helperImage}
                        />
                      ) : (
                        <LinearGradient
                          colors={['#8B5CF6', '#A855F7']}
                          style={styles.helperImageGradient}
                        >
                          <FontAwesome name="user" size={28} color="#fff" />
                        </LinearGradient>
                      )}
                    </View>
                    <View style={styles.callTitleContainer}>
                      <Text style={styles.callTitle}>{item.helper?.name || 'Helper'}</Text>
                      <Text style={styles.callSubtitle}>
                        {formatDate(item.initiated_at || null)}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status || 'pending') }]}>
                    <FontAwesome name={getStatusIcon(item.status || 'pending')} size={10} color="#fff" />
                    <Text style={styles.statusText}>{item.status || 'pending'}</Text>
                  </View>
                </View>

                {/* Details Grid */}
                <View style={styles.detailsGrid}>
                  <View style={styles.detailBox}>
                    <View style={styles.detailIconContainer}>
                      <FontAwesome name="clock-o" size={16} color="#F59E0B" />
                    </View>
                    <Text style={styles.detailLabel}>Time</Text>
                    <Text style={styles.detailValue}>{formatTime(item.initiated_at || null)}</Text>
                  </View>
                  
                  <View style={styles.detailBox}>
                    <View style={styles.detailIconContainer}>
                      <FontAwesome name="hourglass-half" size={16} color="#8B5CF6" />
                    </View>
                    <Text style={styles.detailLabel}>Duration</Text>
                    <Text style={styles.detailValue}>{formatDuration(item.duration_seconds || null)}</Text>
                  </View>
                  
                  <View style={styles.detailBox}>
                    <View style={[styles.detailIconContainer, { backgroundColor: getPriorityColor(item.helper?.pivot?.priority || 3) }]}>
                      <FontAwesome name="flag" size={16} color="#fff" />
                    </View>
                    <Text style={styles.detailLabel}>Priority</Text>
                    <Text style={styles.detailValue}>{item.helper?.pivot?.priority || 3}</Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.cardActions}>
                  <TouchableOpacity 
                    style={styles.viewButton}
                    onPress={() => router.push(`/helper-call-detail?id=${item.id}`)}
                  >
                    <LinearGradient
                      colors={['#8B5CF6', '#A855F7']}
                      style={styles.viewButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.viewButtonText}>View Details</Text>
                      <FontAwesome name="chevron-right" size={14} color="#fff" />
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDelete(item.id)}
                  >
                    <LinearGradient
                      colors={['#FEE2E2', '#FECACA']}
                      style={styles.deleteButtonGradient}
                    >
                      <FontAwesome name="trash" size={18} color="#EF4444" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          </View>
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
  callCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  callCardGradient: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  statusStrip: {
    width: '100%',
    height: 4,
  },
  callCardContent: {
    padding: 20,
  },
  callHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  callHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  helperImageContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  helperImage: {
    width: 56,
    height: 56,
    borderRadius: 16,
  },
  helperImageGradient: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callTitleContainer: {
    flex: 1,
    gap: 4,
  },
  callTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.text.primary,
  },
  callSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: Theme.colors.text.secondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'capitalize',
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  detailBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Theme.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.text.primary,
    textAlign: 'center',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  viewButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  viewButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  viewButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  deleteButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  deleteButtonGradient: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 64 },
  emptyText: { fontSize: 20, fontWeight: '600', color: Theme.colors.text.primary, marginTop: 16 },
  emptySubtext: { fontSize: 14, color: Theme.colors.text.secondary, marginTop: 8, textAlign: 'center' },
});

