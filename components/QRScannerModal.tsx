import * as mockServer from '@/src/api/mockServer';
import { BarCodeScanner } from 'expo-barcode-scanner';
import React, { useEffect, useState } from 'react';
import { Alert, Button, Modal, StyleSheet, Text, View } from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function QRScannerModal({ visible, onClose, onSuccess }: Props) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    // Validate UUID regex (simple check):
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(data)) {
      Alert.alert('Invalid QR', 'QR code does not contain a valid UUID.');
      setScanned(false);
      return;
    }
    try {
      const device = await mockServer.assignDevice(data);
      Alert.alert('Device assigned', `Device ${device.uuid} assigned successfully.`);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      Alert.alert('Assignment failed', err.message);
      setScanned(false);
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting camera permission...</Text>;
  }
  if (hasPermission === false) {
    return <Text>No camera access. Please grant permission in settings.</Text>;
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <Text style={styles.title}>Scan Device QR Code</Text>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
        {scanned && <Button title="Tap to Scan Again" onPress={() => setScanned(false)} />}
        <Button title="Close" onPress={onClose} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
});
