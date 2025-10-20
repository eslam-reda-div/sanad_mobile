import React, { useState } from 'react';
import { StyleSheet, Alert, Modal, ScrollView, TouchableOpacity, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';
import { useAuthStore } from '@/src/store/authStore';
import * as mockServer from '@/src/api/mockServer';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import TextInput from '@/components/ui/TextInput';

export default function ProfileScreen() {
  const { user, logout, login, token } = useAuthStore();
  const router = useRouter();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    age: user?.age || 0,
    disability: user?.disability || '',
    location: user?.location || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/auth/login');
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    setForm({
      name: user?.name || '',
      phone: user?.phone || '',
      age: user?.age || 0,
      disability: user?.disability || '',
      location: user?.location || '',
    });
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      Alert.alert('Validation', 'Name and phone are required.');
      return;
    }
    try {
      const updatedUser = await mockServer.updateProfile({
        name: form.name,
        phone: form.phone,
        age: form.age,
        disability: form.disability,
        location: form.location,
      });
      if (token && updatedUser) {
        await login(token, updatedUser);
      }
      Alert.alert('Success', 'Profile updated successfully.');
      setEditModalVisible(false);
    } catch (err: any) {
      Alert.alert('Update failed', err.message);
    }
  };

  const handleChangePassword = () => {
    setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordModalVisible(true);
  };

  const handleSavePassword = async () => {
    const { oldPassword, newPassword, confirmPassword } = passwordForm;
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Validation', 'All password fields are required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Validation', 'New password and confirm password do not match.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Validation', 'New password must be at least 6 characters.');
      return;
    }
    try {
      await mockServer.changePassword(oldPassword, newPassword);
      Alert.alert('Success', 'Password changed successfully.');
      setPasswordModalVisible(false);
    } catch (err: any) {
      Alert.alert('Change password failed', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.header}>
        <View style={styles.avatarContainer}>
          <FontAwesome name="user-circle" size={100} color="#fff" />
        </View>
        <Text style={styles.userName}>{user?.name || 'User'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'N/A'}</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <Card variant="elevated" style={styles.infoCard}>
          <Text style={styles.cardTitle}>Personal Information</Text>
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <FontAwesome name="user" size={20} color={Theme.colors.primary} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{user?.name || 'N/A'}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <FontAwesome name="phone" size={20} color={Theme.colors.secondary} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{user?.phone || 'N/A'}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <FontAwesome name="calendar" size={20} color={Theme.colors.accent} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Age</Text>
              <Text style={styles.infoValue}>{user?.age || 'N/A'}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <FontAwesome name="wheelchair" size={20} color={Theme.colors.info} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Disability</Text>
              <Text style={styles.infoValue}>{user?.disability || 'N/A'}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <FontAwesome name="map-marker" size={20} color={Theme.colors.danger} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{user?.location || 'N/A'}</Text>
            </View>
          </View>
        </Card>

        <Card variant="elevated" style={styles.actionsCard}>
          <Text style={styles.cardTitle}>Actions</Text>
          <TouchableOpacity style={styles.actionItem} onPress={handleEditProfile}>
            <View style={styles.actionLeft}>
              <FontAwesome name="edit" size={20} color={Theme.colors.primary} />
              <Text style={styles.actionText}>Edit Profile</Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color={Theme.colors.text.tertiary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} onPress={handleChangePassword}>
            <View style={styles.actionLeft}>
              <FontAwesome name="lock" size={20} color={Theme.colors.accent} />
              <Text style={styles.actionText}>Change Password</Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color={Theme.colors.text.tertiary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} onPress={handleLogout}>
            <View style={styles.actionLeft}>
              <FontAwesome name="sign-out" size={20} color={Theme.colors.danger} />
              <Text style={[styles.actionText, { color: Theme.colors.danger }]}>Logout</Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color={Theme.colors.text.tertiary} />
          </TouchableOpacity>
        </Card>
      </ScrollView>

      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
            </LinearGradient>
            <ScrollView style={styles.modalBody}>
              <TextInput label="Name" placeholder="Enter your name" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} leftIcon={<FontAwesome name="user" size={20} color={Theme.colors.text.secondary} />} />
              <TextInput label="Phone" placeholder="Enter phone number" value={form.phone} onChangeText={(v) => setForm({ ...form, phone: v })} keyboardType="phone-pad" leftIcon={<FontAwesome name="phone" size={20} color={Theme.colors.text.secondary} />} />
              <TextInput label="Age" placeholder="Enter your age" value={String(form.age)} onChangeText={(v) => setForm({ ...form, age: parseInt(v) || 0 })} keyboardType="number-pad" leftIcon={<FontAwesome name="calendar" size={20} color={Theme.colors.text.secondary} />} />
              <TextInput label="Disability" placeholder="Enter disability information" value={form.disability} onChangeText={(v) => setForm({ ...form, disability: v })} leftIcon={<FontAwesome name="wheelchair" size={20} color={Theme.colors.text.secondary} />} />
              <TextInput label="Location" placeholder="Enter your location" value={form.location} onChangeText={(v) => setForm({ ...form, location: v })} leftIcon={<FontAwesome name="map-marker" size={20} color={Theme.colors.text.secondary} />} />
              <View style={styles.modalActions}>
                <Button title="Save Changes" onPress={handleSaveProfile} variant="primary" fullWidth icon={<FontAwesome name="check" size={20} color="#fff" />} />
                <Button title="Cancel" onPress={() => setEditModalVisible(false)} variant="outline" fullWidth />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={passwordModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient colors={['#F59E0B', '#EF4444']} style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
            </LinearGradient>
            <ScrollView style={styles.modalBody}>
              <TextInput label="Current Password" placeholder="Enter current password" value={passwordForm.oldPassword} onChangeText={(v) => setPasswordForm({ ...passwordForm, oldPassword: v })} secureTextEntry leftIcon={<FontAwesome name="lock" size={20} color={Theme.colors.text.secondary} />} />
              <TextInput label="New Password" placeholder="Enter new password" value={passwordForm.newPassword} onChangeText={(v) => setPasswordForm({ ...passwordForm, newPassword: v })} secureTextEntry leftIcon={<FontAwesome name="key" size={20} color={Theme.colors.text.secondary} />} />
              <TextInput label="Confirm New Password" placeholder="Confirm new password" value={passwordForm.confirmPassword} onChangeText={(v) => setPasswordForm({ ...passwordForm, confirmPassword: v })} secureTextEntry leftIcon={<FontAwesome name="key" size={20} color={Theme.colors.text.secondary} />} />
              <View style={styles.modalActions}>
                <Button title="Update Password" onPress={handleSavePassword} variant="danger" fullWidth icon={<FontAwesome name="check" size={20} color="#fff" />} />
                <Button title="Cancel" onPress={() => setPasswordModalVisible(false)} variant="outline" fullWidth />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  header: { paddingTop: 60, paddingBottom: 32, alignItems: 'center', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  avatarContainer: { width: 120, height: 120, borderRadius: 9999, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  userName: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 4 },
  userEmail: { fontSize: 16, color: 'rgba(255,255,255,0.8)' },
  content: { padding: 24, paddingBottom: 64 },
  infoCard: { marginBottom: 16 },
  actionsCard: { marginBottom: 16 },
  cardTitle: { fontSize: 20, fontWeight: '700', color: Theme.colors.text.primary, marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Theme.colors.border.light },
  infoIconContainer: { width: 40, height: 40, borderRadius: 9999, backgroundColor: Theme.colors.background, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  infoTextContainer: { flex: 1 },
  infoLabel: { fontSize: 12, color: Theme.colors.text.secondary, marginBottom: 4 },
  infoValue: { fontSize: 16, fontWeight: '600', color: Theme.colors.text.primary },
  actionItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Theme.colors.border.light },
  actionLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  actionText: { fontSize: 16, fontWeight: '600', color: Theme.colors.text.primary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Theme.colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  modalHeader: { paddingVertical: 24, paddingHorizontal: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  modalTitle: { fontSize: 24, fontWeight: '700', color: '#fff', textAlign: 'center' },
  modalBody: { padding: 24 },
  modalActions: { gap: 12, marginTop: 24, marginBottom: 32 },
});