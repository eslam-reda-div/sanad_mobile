import QRScannerModal from '@/components/QRScannerModal';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Theme } from '@/constants/Theme';
import * as mockServer from '@/src/api/mockServer';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Device = { uuid: string; version: string; image: string | null };

export default function DevicesScreen() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [qrVisible, setQrVisible] = useState(false);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    const list = await mockServer.getDevices();
    setDevices(list);
  };

  const handleDelete = async (uuid: string) => {
    Alert.alert('Confirm Delete', 'Remove this device from your account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await mockServer.deleteDevice(uuid);
          fetchDevices();
        },
      },
    ]);
  };

  const handleScanSuccess = () => {
    fetchDevices();
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>My Devices</Text>
            <Text style={styles.headerSubtitle}>{devices.length} connected devices</Text>
          </View>
          <TouchableOpacity style={styles.scanButton} onPress={() => setQrVisible(true)}>
            <FontAwesome name="qrcode" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <FlatList
        data={devices}
        keyExtractor={(item) => item.uuid}
        numColumns={2}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item }) => (
          <Card variant="elevated" style={styles.deviceCard}>
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              style={styles.deviceIconContainer}
            >
              <FontAwesome name="mobile" size={40} color="#fff" />
            </LinearGradient>
            <View style={styles.deviceInfo}>
              <Text style={styles.deviceLabel}>Device ID</Text>
              <Text style={styles.deviceId}>{item.uuid.slice(0, 8)}...</Text>
              <View style={styles.versionRow}>
                <FontAwesome name="info-circle" size={12} color={Theme.colors.text.secondary} />
                <Text style={styles.versionText}>v{item.version}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item.uuid)}
            >
              <FontAwesome name="trash" size={16} color={Theme.colors.danger} />
            </TouchableOpacity>
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <FontAwesome name="mobile" size={64} color={Theme.colors.border.light} />
            <Text style={styles.emptyText}>No devices connected</Text>
            <Text style={styles.emptySubtext}>Scan a device QR code to get started</Text>
            <Button
              title="Scan QR Code"
              onPress={() => setQrVisible(true)}
              variant="primary"
              icon={<FontAwesome name="qrcode" size={20} color="#fff" />}
              style={styles.scanEmptyButton}
            />
          </View>
        }
      />

      <QRScannerModal
        visible={qrVisible}
        onClose={() => setQrVisible(false)}
        onSuccess={handleScanSuccess}
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
  scanButton: { width: 56, height: 56, borderRadius: 9999, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  gridContent: { padding: 24, paddingBottom: 64 },
  columnWrapper: { gap: 16 },
  deviceCard: { flex: 1, minWidth: '45%', alignItems: 'center', paddingVertical: 20, marginBottom: 16 },
  deviceIconContainer: { width: 80, height: 80, borderRadius: 9999, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  deviceInfo: { alignItems: 'center', marginBottom: 12 },
  deviceLabel: { fontSize: 12, color: Theme.colors.text.secondary, marginBottom: 4 },
  deviceId: { fontSize: 16, fontWeight: '700', color: Theme.colors.text.primary, marginBottom: 8 },
  versionRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  versionText: { fontSize: 12, color: Theme.colors.text.secondary },
  deleteButton: { padding: 8 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 64, paddingHorizontal: 24 },
  emptyText: { fontSize: 20, fontWeight: '600', color: Theme.colors.text.primary, marginTop: 16 },
  emptySubtext: { fontSize: 14, color: Theme.colors.text.secondary, marginTop: 8, textAlign: 'center', marginBottom: 24 },
  scanEmptyButton: { minWidth: 200 },
});

