import Card from '@/components/ui/Card';
import { Theme } from '@/constants/Theme';
import { helperCallsApi } from '@/src/api/services';
import type { HelperCall } from '@/src/api/types';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function HelperCallDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [call, setCall] = useState<HelperCall | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCallDetail();
  }, [id]);

  const fetchCallDetail = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      const response = await helperCallsApi.getCall(parseInt(id));
      if (response.success && response.data) {
        setCall(response.data.helper_call);
      }
    } catch (error: any) {
      console.error('Failed to fetch helper call details:', error);
      Alert.alert('Error', 'Failed to load helper call details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  if (!call) {
    return (
      <View style={styles.container}>
        <Card variant="elevated" style={styles.errorCard}>
          <FontAwesome name="exclamation-circle" size={48} color={Theme.colors.danger} />
          <Text style={styles.errorText}>Helper Call not found</Text>
        </Card>
      </View>
    );
  }

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'answered': return Theme.colors.secondary;
      case 'no-answer': return Theme.colors.accent;
      case 'busy': return Theme.colors.danger;
      case 'failed': return Theme.colors.danger;
      default: return Theme.colors.text.secondary;
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
        <Text style={styles.headerTitle}>Helper Call Details</Text>
        <Text style={styles.headerSubtitle}>Call to Helper Information</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {call.helper && (
          <Card variant="elevated" style={styles.helperCard}>
            <View style={styles.helperHeader}>
              <View style={styles.helperAvatarContainer}>
                {call.helper.avatar_url ? (
                  <Image source={{ uri: call.helper.avatar_url }} style={styles.helperAvatar} />
                ) : (
                  <FontAwesome name="user-circle" size={48} color={Theme.colors.primary} />
                )}
              </View>
              <View style={styles.helperInfo}>
                <Text style={styles.helperName}>{call.helper.name}</Text>
                <Text style={styles.helperContact}>{call.helper.phone_number}</Text>
                {call.helper.email && <Text style={styles.helperContact}>{call.helper.email}</Text>}
              </View>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(call.helper.pivot?.priority || 3) }]}>
                <Text style={styles.priorityText}>{call.helper.pivot?.priority || 3}</Text>
              </View>
            </View>
          </Card>
        )}

        <Card variant="elevated" style={styles.card}>
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(call.status || 'pending') }]}>
              <Text style={styles.statusText}>{call.status || 'pending'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <FontAwesome name="hashtag" size={16} color={Theme.colors.text.secondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Call ID</Text>
              <Text style={styles.infoValue}>{call.id}</Text>
            </View>
          </View>

          {call.customer_call_id && (
            <View style={styles.infoRow}>
              <FontAwesome name="link" size={16} color={Theme.colors.text.secondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Customer Call ID</Text>
                <Text style={styles.infoValue}>{call.customer_call_id}</Text>
              </View>
            </View>
          )}

          {call.twilio_call_sid && (
            <View style={styles.infoRow}>
              <FontAwesome name="phone" size={16} color={Theme.colors.text.secondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Twilio Call SID</Text>
                <Text style={styles.infoValue}>{call.twilio_call_sid}</Text>
              </View>
            </View>
          )}

          {call.reason && (
            <View style={styles.infoRow}>
              <FontAwesome name="info-circle" size={16} color={Theme.colors.info} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Reason</Text>
                <Text style={styles.infoValue}>{call.reason}</Text>
              </View>
            </View>
          )}

          <View style={styles.infoRow}>
            <FontAwesome name="clock-o" size={16} color={Theme.colors.text.secondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Initiated At</Text>
              <Text style={styles.infoValue}>{formatDate(call.initiated_at)}</Text>
            </View>
          </View>

          {call.ringing_at && (
            <View style={styles.infoRow}>
              <FontAwesome name="bell-o" size={16} color={Theme.colors.text.secondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Ringing At</Text>
                <Text style={styles.infoValue}>{formatDate(call.ringing_at)}</Text>
              </View>
            </View>
          )}

          {call.answered_at && (
            <View style={styles.infoRow}>
              <FontAwesome name="check-circle" size={16} color={Theme.colors.secondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Answered At</Text>
                <Text style={styles.infoValue}>{formatDate(call.answered_at)}</Text>
              </View>
            </View>
          )}

          {call.completed_at && (
            <View style={styles.infoRow}>
              <FontAwesome name="flag-checkered" size={16} color={Theme.colors.text.secondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Completed At</Text>
                <Text style={styles.infoValue}>{formatDate(call.completed_at)}</Text>
              </View>
            </View>
          )}

          <View style={styles.infoRow}>
            <FontAwesome name="hourglass-half" size={16} color={Theme.colors.text.secondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Duration</Text>
              <Text style={styles.infoValue}>{formatDuration(call.duration_seconds)}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <FontAwesome name={call.accepted ? 'check-square' : 'square-o'} size={16} color={call.accepted ? Theme.colors.secondary : Theme.colors.text.secondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Accepted</Text>
              <Text style={styles.infoValue}>{call.accepted ? 'Yes' : 'No'}</Text>
            </View>
          </View>

          {call.response && (
            <View style={styles.infoRow}>
              <FontAwesome name="comment" size={16} color={Theme.colors.info} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Response</Text>
                <Text style={styles.infoValue}>{call.response}</Text>
              </View>
            </View>
          )}

          {call.error_message && (
            <View style={styles.infoRow}>
              <FontAwesome name="times-circle" size={16} color={Theme.colors.danger} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Error Message</Text>
                <Text style={[styles.infoValue, { color: Theme.colors.danger }]}>{call.error_message}</Text>
              </View>
            </View>
          )}

          <View style={styles.infoRow}>
            <FontAwesome name="repeat" size={16} color={Theme.colors.text.secondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Retry Count</Text>
              <Text style={styles.infoValue}>{call.retry_count || 0}</Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  header: { paddingTop: 60, paddingBottom: 24, paddingHorizontal: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 4, textAlign: 'center' },
  headerSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)', textAlign: 'center' },
  content: { padding: 24 },
  helperCard: { marginBottom: 16 },
  helperHeader: { flexDirection: 'row', alignItems: 'center' },
  helperAvatarContainer: { marginRight: 16, width: 48, height: 48, borderRadius: 24, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  helperAvatar: { width: 48, height: 48, borderRadius: 24 },
  helperInfo: { flex: 1 },
  helperName: { fontSize: 18, fontWeight: '700', color: Theme.colors.text.primary, marginBottom: 4 },
  helperContact: { fontSize: 13, color: Theme.colors.text.secondary, marginBottom: 2 },
  priorityBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 9999, minWidth: 36, alignItems: 'center', justifyContent: 'center' },
  priorityText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  card: { marginBottom: 16 },
  errorCard: { alignItems: 'center', padding: 32 },
  errorText: { fontSize: 18, fontWeight: '600', color: Theme.colors.text.primary, marginTop: 16 },
  statusContainer: { alignItems: 'center', marginBottom: 16 },
  statusBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 9999 },
  statusText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Theme.colors.border.light },
  infoContent: { flex: 1, marginLeft: 12 },
  infoLabel: { fontSize: 12, color: Theme.colors.text.secondary, marginBottom: 4 },
  infoValue: { fontSize: 16, fontWeight: '600', color: Theme.colors.text.primary },
});
