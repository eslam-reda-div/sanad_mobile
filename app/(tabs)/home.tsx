import QRScannerModal from '@/components/QRScannerModal';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Theme } from '@/constants/Theme';
import * as mockServer from '@/src/api/mockServer';
import { useAuthStore } from '@/src/store/authStore';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const [helpersCount, setHelpersCount] = useState(0);
  const [devicesCount, setDevicesCount] = useState(0);
  const [callsCount, setCallsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [qrVisible, setQrVisible] = useState(false);

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    const helpers = await mockServer.getHelpers();
    const devices = await mockServer.getDevices();
    const calls = await mockServer.getCalls();
    setHelpersCount(helpers.length);
    setDevicesCount(devices.length);
    setCallsCount(calls.length);
  };

  const handleTriggerCall = async () => {
    setLoading(true);
    try {
      const call = await mockServer.triggerCall();
      Alert.alert(
        'Emergency Call Triggered',
        `Call ID: ${call.twilio_call_sid}\nStatus: ${call.status}`,
        [{ text: 'OK' }]
      );
      fetchCounts();
    } catch (err: any) {
      Alert.alert('Call Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
          </View>
          <View style={styles.avatarContainer}>
            <FontAwesome name="user-circle" size={48} color="#fff" />
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Quick Stats</Text>
        <View style={styles.statsGrid}>
          <Card variant="elevated" style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#EEF2FF' }]}>
              <FontAwesome name="users" size={24} color={Theme.colors.primary} />
            </View>
            <Text style={styles.statValue}>{helpersCount}</Text>
            <Text style={styles.statLabel}>Helpers</Text>
          </Card>
          <Card variant="elevated" style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#F0FDF4' }]}>
              <FontAwesome name="mobile" size={28} color={Theme.colors.secondary} />
            </View>
            <Text style={styles.statValue}>{devicesCount}</Text>
            <Text style={styles.statLabel}>Devices</Text>
          </Card>
          <Card variant="elevated" style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
              <FontAwesome name="phone" size={24} color={Theme.colors.accent} />
            </View>
            <Text style={styles.statValue}>{callsCount}</Text>
            <Text style={styles.statLabel}>Total Calls</Text>
          </Card>
          <Card variant="elevated" style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#FEE2E2' }]}>
              <FontAwesome name="heartbeat" size={24} color={Theme.colors.danger} />
            </View>
            <Text style={styles.statValue}>Active</Text>
            <Text style={styles.statLabel}>Status</Text>
          </Card>
        </View>

        <Text style={styles.sectionTitle}>Emergency Actions</Text>
        <Card variant="elevated" style={styles.emergencyCard}>
          <View style={styles.emergencyHeader}>
            <View style={styles.emergencyIconContainer}>
              <FontAwesome name="exclamation-triangle" size={28} color="#fff" />
            </View>
            <View style={styles.emergencyInfo}>
              <Text style={styles.emergencyTitle}>Need Help?</Text>
              <Text style={styles.emergencySubtitle}>Trigger an emergency call to all your helpers</Text>
            </View>
          </View>
          {loading ? (
            <ActivityIndicator size="large" color={Theme.colors.primary} style={{ marginTop: 16 }} />
          ) : (
            <Button
              title="Trigger Emergency Call"
              onPress={handleTriggerCall}
              variant="danger"
              fullWidth
              icon={<FontAwesome name="phone" size={20} color="#fff" />}
              style={styles.emergencyButton}
            />
          )}
        </Card>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={() => setQrVisible(true)}>
            <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.actionGradient}>
              <FontAwesome name="qrcode" size={32} color="#fff" />
              <Text style={styles.actionText}>Scan Device QR</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <LinearGradient colors={['#10B981', '#059669']} style={styles.actionGradient}>
              <FontAwesome name="user-plus" size={32} color="#fff" />
              <Text style={styles.actionText}>Add Helper</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <LinearGradient colors={['#F59E0B', '#EF4444']} style={styles.actionGradient}>
              <FontAwesome name="history" size={32} color="#fff" />
              <Text style={styles.actionText}>Call History</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.actionGradient}>
              <FontAwesome name="cog" size={32} color="#fff" />
              <Text style={styles.actionText}>Settings</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Card variant="elevated" style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <FontAwesome name="lightbulb-o" size={24} color={Theme.colors.accent} />
            <Text style={styles.tipsTitle}>Health Tip of the Day</Text>
          </View>
          <Text style={styles.tipsText}>Stay hydrated and maintain regular communication with your healthcare providers. Regular monitoring helps ensure better health outcomes.</Text>
        </Card>
      </ScrollView>

      <QRScannerModal visible={qrVisible} onClose={() => setQrVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  header: { paddingTop: 60, paddingBottom: 24, paddingHorizontal: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 16, color: 'rgba(255,255,255,0.9)', marginBottom: 4 },
  userName: { fontSize: 28, fontWeight: '800', color: '#fff' },
  avatarContainer: { width: 56, height: 56, borderRadius: 9999, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  scrollView: { flex: 1 },
  content: { padding: 24, paddingBottom: 64 },
  sectionTitle: { fontSize: 24, fontWeight: '600', color: '#111827', marginTop: 16, marginBottom: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 24 },
  statCard: { flex: 1, minWidth: '45%', alignItems: 'center', paddingVertical: 24 },
  statIcon: { width: 56, height: 56, borderRadius: 9999, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { fontSize: 28, fontWeight: '700', color: '#111827' },
  statLabel: { fontSize: 14, color: '#6B7280' },
  emergencyCard: { marginBottom: 24, backgroundColor: '#FEF3C7' },
  emergencyHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  emergencyIconContainer: { width: 56, height: 56, borderRadius: 9999, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  emergencyInfo: { flex: 1 },
  emergencyTitle: { fontSize: 20, fontWeight: '600', color: '#111827', marginBottom: 4 },
  emergencySubtitle: { fontSize: 14, color: '#6B7280' },
  emergencyButton: { marginTop: 8 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 24 },
  actionCard: Platform.select({
    web: {
      flex: 1,
      minWidth: '45%',
      height: 120,
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    } as any,
    default: {
      flex: 1,
      minWidth: '45%',
      height: 120,
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
  }),
  actionGradient: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  actionText: { fontSize: 14, color: '#fff', fontWeight: '600' },
  tipsCard: { backgroundColor: '#FEF9C3', marginBottom: 24 },
  tipsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  tipsTitle: { fontSize: 20, fontWeight: '600', color: '#111827' },
  tipsText: { fontSize: 16, color: '#6B7280', lineHeight: 24 },
});