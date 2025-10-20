import { Text, View } from '@/components/Themed';
import * as mockServer from '@/src/api/mockServer';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet } from 'react-native';

type HelperCallDetail = {
  uuid: string;
  helper_id: string;
  customer_id: string;
  customer_call_id?: string;
  twilio_call_sid?: string;
  reason?: string;
  priority: number;
  status: string;
  initiated_at: string;
  ringing_at?: string;
  answered_at?: string;
  completed_at?: string;
  duration_seconds?: number;
  accepted?: boolean;
  response?: string;
  call_metadata?: any;
  error_message?: string;
  retry_count?: number;
};

export default function HelperCallDetailScreen() {
  const { uuid } = useLocalSearchParams<{ uuid: string }>();
  const [call, setCall] = useState<HelperCallDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCallDetail();
  }, [uuid]);

  const fetchCallDetail = async () => {
    const calls = await mockServer.getHelpersCalls();
    const found = calls.find((c: any) => c.uuid === uuid);
    setCall(found || null);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!call) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Helper Call not found</Text>
      </View>
    );
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Helper Call Details</Text>
      <View style={styles.section}>
        <Text style={styles.label}>UUID:</Text>
        <Text style={styles.value}>{call.uuid}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Helper ID:</Text>
        <Text style={styles.value}>{call.helper_id}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Customer ID:</Text>
        <Text style={styles.value}>{call.customer_id}</Text>
      </View>
      {call.customer_call_id && (
        <View style={styles.section}>
          <Text style={styles.label}>Customer Call ID:</Text>
          <Text style={styles.value}>{call.customer_call_id}</Text>
        </View>
      )}
      {call.twilio_call_sid && (
        <View style={styles.section}>
          <Text style={styles.label}>Twilio Call SID:</Text>
          <Text style={styles.value}>{call.twilio_call_sid}</Text>
        </View>
      )}
      {call.reason && (
        <View style={styles.section}>
          <Text style={styles.label}>Reason:</Text>
          <Text style={styles.value}>{call.reason}</Text>
        </View>
      )}
      <View style={styles.section}>
        <Text style={styles.label}>Priority:</Text>
        <Text style={styles.value}>{call.priority}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Status:</Text>
        <Text style={styles.value}>{call.status}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Initiated At:</Text>
        <Text style={styles.value}>{new Date(call.initiated_at).toLocaleString()}</Text>
      </View>
      {call.ringing_at && (
        <View style={styles.section}>
          <Text style={styles.label}>Ringing At:</Text>
          <Text style={styles.value}>{new Date(call.ringing_at).toLocaleString()}</Text>
        </View>
      )}
      {call.answered_at && (
        <View style={styles.section}>
          <Text style={styles.label}>Answered At:</Text>
          <Text style={styles.value}>{new Date(call.answered_at).toLocaleString()}</Text>
        </View>
      )}
      {call.completed_at && (
        <View style={styles.section}>
          <Text style={styles.label}>Completed At:</Text>
          <Text style={styles.value}>{new Date(call.completed_at).toLocaleString()}</Text>
        </View>
      )}
      <View style={styles.section}>
        <Text style={styles.label}>Duration:</Text>
        <Text style={styles.value}>{formatDuration(call.duration_seconds)}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Accepted:</Text>
        <Text style={styles.value}>{call.accepted ? 'Yes' : 'No'}</Text>
      </View>
      {call.response && (
        <View style={styles.section}>
          <Text style={styles.label}>Response:</Text>
          <Text style={styles.value}>{call.response}</Text>
        </View>
      )}
      {call.error_message && (
        <View style={styles.section}>
          <Text style={styles.label}>Error Message:</Text>
          <Text style={[styles.value, { color: 'red' }]}>{call.error_message}</Text>
        </View>
      )}
      <View style={styles.section}>
        <Text style={styles.label}>Retry Count:</Text>
        <Text style={styles.value}>{call.retry_count || 0}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  section: { marginBottom: 12, padding: 12, backgroundColor: '#f9f9f9', borderRadius: 8 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 4, color: '#666' },
  value: { fontSize: 16 },
});
