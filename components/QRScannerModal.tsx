import Button from '@/components/ui/Button';
import TextInput from '@/components/ui/TextInput';
import { Theme } from '@/constants/Theme';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useState } from 'react';
import { Modal, Platform, StyleSheet, Text, View } from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (data: string) => void;
};

export default function QRScannerModal({ visible, onClose, onSuccess }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [manualValue, setManualValue] = useState('');

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    onSuccess?.(data);
    
    // Reset and close after a short delay
    setTimeout(() => {
      setScanned(false);
      onClose();
    }, 500);
  };

  const handleManualAssign = () => {
    if (!manualValue.trim()) return;
    
    onSuccess?.(manualValue.trim());
    setManualValue('');
    onClose();
  };

  // Camera permissions are still loading
  if (!permission) {
    return (
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>Loading...</Text>
            <Text style={styles.message}>Initializing camera...</Text>
            <Button title="Close" onPress={onClose} variant="outline" fullWidth />
          </View>
        </View>
      </Modal>
    );
  }

  // Camera permissions not granted yet
  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>Camera Permission Required</Text>
            <Text style={styles.message}>
              We need your permission to access the camera to scan QR codes.
              {'\n\n'}
              You can also manually enter the device UUID below.
            </Text>
            
            <Button
              title="Grant Camera Permission"
              onPress={requestPermission}
              variant="primary"
              fullWidth
            />
            
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>
            
            <TextInput
              label="Device UUID (Manual Entry)"
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              value={manualValue}
              onChangeText={setManualValue}
            />
            <Button
              title="Assign Device Manually"
              onPress={handleManualAssign}
              variant="secondary"
              fullWidth
              disabled={!manualValue.trim()}
            />
            
            <Button title="Close" onPress={onClose} variant="outline" fullWidth />
          </View>
        </View>
      </Modal>
    );
  }

  // Camera permission granted - show scanner
  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Scan Device QR Code</Text>
          <Text style={styles.subtitle}>
            {scanned ? 'QR Code Detected!' : 'Align the QR code within the frame'}
          </Text>
        </View>

        <View style={styles.scannerContainer}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
          />

          <View style={styles.overlay}>
            <View style={[styles.scanFrame, scanned && styles.scanFrameSuccess]} />
            {scanned && (
              <View style={styles.successIndicator}>
                <Text style={styles.successText}>✓ Scanned Successfully</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.footer}>
          {scanned ? (
            <Button 
              title="Tap to Scan Again" 
              onPress={() => setScanned(false)} 
              variant="secondary"
              fullWidth
            />
          ) : (
            <View style={styles.manualEntrySection}>
              <Text style={styles.manualEntryLabel}>Can't scan? Enter manually:</Text>
              <TextInput
                placeholder="Device UUID"
                value={manualValue}
                onChangeText={setManualValue}
              />
              <Button
                title="Assign Device Manually"
                onPress={handleManualAssign}
                variant="secondary"
                fullWidth
                disabled={!manualValue.trim()}
              />
            </View>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
    lineHeight: 20,
  },
  scannerContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 4,
    borderColor: Theme.colors.primary,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  scanFrameSuccess: {
    borderColor: '#10B981',
  },
  successIndicator: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#10B981',
    borderRadius: 12,
  },
  successText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  footer: {
    padding: 24,
    gap: 12,
    backgroundColor: Theme.colors.surface,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  manualEntrySection: {
    gap: 8,
  },
  manualEntryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.text.secondary,
    marginBottom: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: Theme.colors.surface,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  message: {
    fontSize: 14,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Theme.colors.text.tertiary,
    opacity: 0.3,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.text.tertiary,
  },
});
