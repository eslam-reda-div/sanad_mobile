import LoadingSpinner from '@/components/LoadingSpinner';
import QRScannerModal from '@/components/QRScannerModal';
import Button from '@/components/ui/Button';
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
      const jsonObject = JSON.parse(data);
      const response = await devicesApi.addDevice({ uuid: jsonObject.uuid });
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
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <View style={styles.deviceCard}>
            <LinearGradient
              colors={['#F8FAFC', '#F1F5F9']}
              style={styles.deviceCardGradient}
            >
              <View style={styles.deviceCardContent}>
                <View style={styles.deviceLeft}>
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
                      <FontAwesome name="mobile" size={36} color="#fff" />
                    </LinearGradient>
                  )}
                  
                  <View style={styles.deviceInfo}>
                    <Text style={styles.deviceLabel}>Device UUID</Text>
                    <Text style={styles.deviceId} numberOfLines={1} ellipsizeMode="middle">
                      {item.uuid}
                    </Text>
                    <View style={styles.deviceMeta}>
                      <View style={styles.versionBadge}>
                        <FontAwesome name="info-circle" size={12} color="#6366F1" />
                        <Text style={styles.versionText}>{item.version}</Text>
                      </View>
                    </View>
                  </View>
                </View>

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
            </LinearGradient>
          </View>
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
  listContent: { padding: 24, paddingBottom: 120 },
  deviceCard: {
    width: '100%',
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  deviceCardGradient: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  deviceCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  deviceLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  deviceImage: {
    width: 72,
    height: 72,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  deviceIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  deviceInfo: {
    flex: 1,
    gap: 6,
  },
  deviceLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Theme.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  deviceId: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.text.primary,
    fontFamily: 'monospace',
  },
  deviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  versionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  versionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6366F1',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  deleteButton: {
    marginLeft: 12,
  },
  deleteButtonGradient: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 64, paddingHorizontal: 24 },
  emptyText: { fontSize: 20, fontWeight: '600', color: Theme.colors.text.primary, marginTop: 16 },
  emptySubtext: { fontSize: 14, color: Theme.colors.text.secondary, marginTop: 8, textAlign: 'center', marginBottom: 24 },
  scanEmptyButton: { minWidth: 200 },
});

