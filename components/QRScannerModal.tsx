import Button from '@/components/ui/Button';
import TextInput from '@/components/ui/TextInput';
import { Theme } from '@/constants/Theme';
import * as mockServer from '@/src/api/mockServer';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, Platform, StyleSheet, Text, View } from 'react-native';

// Safely import Camera
let CameraComponent: any = null;
let CameraType: any = null;
let requestCameraPermissions: any = null;
let isCameraAvailable = false;

try {
  const { Camera, CameraType: CT } = require('expo-camera');
  // Check if Camera is actually a valid component (function or class)
  if (Camera && (typeof Camera === 'function' || typeof Camera === 'object')) {
    CameraComponent = Camera;
    CameraType = CT;
    requestCameraPermissions = Camera.requestCameraPermissionsAsync;
    isCameraAvailable = typeof Camera === 'function' || (Camera.render && typeof Camera.render === 'function');
  }
} catch (e) {
  console.warn('expo-camera not available:', e);
}

type Props = {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function QRScannerModal({ visible, onClose, onSuccess }: Props) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [manualValue, setManualValue] = useState('');

  useEffect(() => {
    if (!isCameraAvailable || !requestCameraPermissions) {
      setHasPermission(false);
      return;
    }

    (async () => {
      try {
        // Request camera permissions
        const { status } = await requestCameraPermissions();
        setHasPermission(status === 'granted');
      } catch (error) {
        console.error('Permission request failed:', error);
        setHasPermission(false);
      }
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

  const handleManualAssign = async () => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(manualValue)) {
      Alert.alert('Invalid UUID', 'Please enter a valid device UUID.');
      return;
    }
    try {
      const device = await mockServer.assignDevice(manualValue);
      Alert.alert('Device assigned', `Device ${device.uuid} assigned successfully.`);
      setManualValue('');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      Alert.alert('Assignment failed', err.message);
    }
  };

  // If camera is not available, show manual input option.
  if (!isCameraAvailable || !CameraComponent) {
    return (
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>QR Scanner Unavailable</Text>
            <Text style={styles.message}>
              Camera scanning requires a native rebuild. Please run: npx expo prebuild && npx expo run:android
              {'\n\n'}
              Or you can manually enter the device UUID below.
            </Text>
            <TextInput
              label="Device UUID"
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              value={manualValue}
              onChangeText={setManualValue}
            />
            <Button
              title="Assign Device"
              onPress={handleManualAssign}
              variant="primary"
              fullWidth
            />
            <Button title="Close" onPress={onClose} variant="outline" fullWidth />
          </View>
        </View>
      </Modal>
    );
  }

  if (hasPermission === null) {
    return (
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>Requesting Permission...</Text>
            <Text style={styles.message}>Please grant camera access to scan QR codes.</Text>
          </View>
        </View>
      </Modal>
    );
  }

  if (hasPermission === false) {
    return (
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>Camera Access Required</Text>
            <Text style={styles.message}>
              Please grant camera permission in your device settings to scan QR codes, or enter the UUID manually below.
            </Text>
            <TextInput
              label="Device UUID (Manual)"
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              value={manualValue}
              onChangeText={setManualValue}
            />
            <Button
              title="Assign Device"
              onPress={handleManualAssign}
              variant="primary"
              fullWidth
            />
            <Button title="Close" onPress={onClose} variant="outline" fullWidth />
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Scan Device QR Code</Text>
          <Text style={styles.subtitle}>Align the QR code within the frame</Text>
        </View>

        <View style={styles.scannerContainer}>
          {isCameraAvailable && CameraComponent ? (
            <CameraComponent
              style={StyleSheet.absoluteFillObject}
              facing={CameraType?.back || 'back'}
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ['qr'],
              }}
            />
          ) : (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>Camera not available</Text>
            </View>
          )}

          <View style={styles.overlay}>
            <View style={styles.scanFrame} />
          </View>
        </View>

        <View style={styles.footer}>
          {scanned && (
            <Button 
              title="Tap to Scan Again" 
              onPress={() => setScanned(false)} 
              variant="secondary"
              fullWidth
            />
          )}
          <Button title="Close" onPress={onClose} variant="outline" fullWidth />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Theme.colors.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: Theme.colors.surface,
  },
  title: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: Theme.colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Theme.colors.text.secondary,
  },
  scannerContainer: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: Theme.colors.primary,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  footer: {
    padding: 24,
    gap: 12,
    backgroundColor: Theme.colors.surface,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: Theme.colors.surface,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    gap: 16,
  },
  message: {
    fontSize: 14,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  placeholderText: {
    color: '#fff',
    fontSize: 16,
  },
});
