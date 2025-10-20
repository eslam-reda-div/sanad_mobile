import LoadingSpinner from '@/components/LoadingSpinner';
import QRScannerModal from '@/components/QRScannerModal';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Theme } from '@/constants/Theme';
import { devicesApi } from '@/src/api/services';
import type { Device } from '@/src/api/types';
import { useAuthStore } from '@/src/store/authStore';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DevicesScreen() {
  const { token } = useAuthStore();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [qrVisible, setQrVisible] = useState(false);

  const fetchDevices = async () => {
    // Don't fetch if no token is available
    if (!token) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const response = await devicesApi.getData();
      if (response.success && response.data) {
        setDevices(response.data.devices);
      }
    } catch (error: any) {
      console.error('Failed to fetch devices:', error);
      Alert.alert('Error', 'Failed to load devices');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (token) {
        setLoading(true);
        fetchDevices();
      }
    }, [token])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDevices();
  };

  const handleDelete = async (deviceId: number) => {
    Alert.alert('Confirm Delete', 'Remove this device from your account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await devicesApi.deleteDevice(deviceId);
            Alert.alert('Success', 'Device removed successfully');
            fetchDevices();
          } catch (error: any) {
            const msg = error.response?.data?.message || 'Failed to delete device';
            Alert.alert('Error', msg);
          }
        },
      },
    ]);
  };

  const handleQRScanned = async (data: string) => {
    try {
      const response = await devicesApi.addDevice({ uuid: data });
      if (response.success) {
        Alert.alert('Success', 'Device added successfully');
        setQrVisible(false);
        fetchDevices();
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to add device';
      Alert.alert('Error', msg);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading devices..." />;
  }

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
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.columnWrapper}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <Card variant="elevated" style={styles.deviceCard}>
            {item.image_full_url ? (
              <Image 
                source={{ uri: item.image_full_url }} 
                style={styles.deviceImage}
                resizeMode="cover"
              />
            ) : (
              <LinearGradient
                colors={['#6366F1', '#8B5CF6']}
                style={styles.deviceIconContainer}
              >
                <FontAwesome name="mobile" size={40} color="#fff" />
              </LinearGradient>
            )}
            <View style={styles.deviceInfo}>
              <Text style={styles.deviceLabel}>Device ID</Text>
              <Text style={styles.deviceId}>{item.uuid.slice(0, 8)}...</Text>
              <View style={styles.versionRow}>
                <FontAwesome name="info-circle" size={12} color={Theme.colors.text.secondary} />
                <Text style={styles.versionText}>{item.version}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item.id)}
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
        onSuccess={handleQRScanned}
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
  deviceImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
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

