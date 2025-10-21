import LoadingSpinner from '@/components/LoadingSpinner';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import TextInput from '@/components/ui/TextInput';
import { Theme } from '@/constants/Theme';
import { authApi, profileApi } from '@/src/api/services';
import type { Customer } from '@/src/api/types';
import { useAuthStore } from '@/src/store/authStore';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, Image, Modal, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const { user, logout, updateUser, token } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profileData, setProfileData] = useState<Customer | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone_number: '',
    age: 0,
    disability: '',
    location: '',
  });
  
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  // Fetch profile data
  const fetchProfileData = async () => {
    // Don't fetch if no token is available
    if (!token) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const response = await profileApi.getData();
      if (response.success && response.data) {
        setProfileData(response.data.customer);
        await updateUser(response.data.customer);
      }
    } catch (error: any) {
      console.error('Failed to fetch profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh profile data on screen focus
  useFocusEffect(
    useCallback(() => {
      if (token) {
        setLoading(true);
        fetchProfileData();
      }
    }, [token])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfileData();
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await authApi.logout();
          } catch (error) {
            console.error('Logout error:', error);
          } finally {
            await logout();
            router.replace('/auth/login');
          }
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    if (profileData) {
      setForm({
        name: profileData.name,
        email: profileData.email,
        phone_number: profileData.phone_number,
        age: profileData.age || 0,
        disability: profileData.disability || '',
        location: profileData.location || '',
      });
    }
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone_number.trim()) {
      Alert.alert('Validation', 'Name, email, and phone are required.');
      return;
    }
    
    try {
      const response = await profileApi.updateProfile({
        name: form.name,
        email: form.email,
        phone_number: form.phone_number,
        age: form.age || undefined,
        disability: form.disability || undefined,
        location: form.location || undefined,
      });
      
      if (response.success && response.data) {
        setProfileData(response.data.customer);
        await updateUser(response.data.customer);
        Alert.alert('Success', 'Profile updated successfully.');
        setEditModalVisible(false);
        fetchProfileData();
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update profile';
      Alert.alert('Update failed', errorMessage);
    }
  };

  const handleChangePassword = () => {
    setPasswordForm({ 
      current_password: '', 
      new_password: '', 
      new_password_confirmation: '' 
    });
    setPasswordModalVisible(true);
  };

  const handleSavePassword = async () => {
    const { current_password, new_password, new_password_confirmation } = passwordForm;
    
    if (!current_password || !new_password || !new_password_confirmation) {
      Alert.alert('Validation', 'All password fields are required.');
      return;
    }
    
    if (new_password !== new_password_confirmation) {
      Alert.alert('Validation', 'New password and confirmation do not match.');
      return;
    }
    
    if (new_password.length < 6) {
      Alert.alert('Validation', 'New password must be at least 6 characters.');
      return;
    }
    
    try {
      const response = await authApi.resetPassword({
        current_password,
        new_password,
        new_password_confirmation,
      });
      
      if (response.success) {
        Alert.alert('Success', 'Password changed successfully.');
        setPasswordModalVisible(false);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to change password';
      Alert.alert('Change password failed', errorMessage);
    }
  };

  const handleAvatarPress = async () => {
    Alert.alert(
      'Update Avatar',
      'Choose an option',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Take Photo',
          onPress: () => pickImage(true),
        },
        {
          text: 'Choose from Library',
          onPress: () => pickImage(false),
        },
      ]
    );
  };

  const pickImage = async (useCamera: boolean) => {
    try {
      const permissionResult = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please grant permission to access photos.');
        return;
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });

      if (!result.canceled && result.assets[0]) {
        await uploadAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadAvatar = async (uri: string) => {
    setUploadingAvatar(true);
    try {
      const filename = uri.split('/').pop() || 'avatar.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      const file = {
        uri,
        name: filename,
        type,
      } as any;

      const response = await profileApi.updateAvatar(file);
      
      if (response.success && response.data) {
        setProfileData(response.data.customer);
        await updateUser(response.data.customer);
        Alert.alert('Success', 'Avatar updated successfully');
        fetchProfileData();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to upload avatar';
      Alert.alert('Upload failed', errorMessage);
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading profile..." />;
  }

  const displayData = profileData || user;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.header}>
        <TouchableOpacity 
          style={styles.avatarContainer} 
          onPress={handleAvatarPress}
          disabled={uploadingAvatar}
        >
          {displayData?.avatar_full_url ? (
            <Image 
              source={{ uri: displayData.avatar_full_url }} 
              style={styles.avatarImage}
            />
          ) : (
            <FontAwesome name="user-circle" size={100} color="#fff" />
          )}
        </TouchableOpacity>
        <Text style={styles.userName}>{displayData?.name || 'User'}</Text>
        <Text style={styles.userEmail}>{displayData?.email || 'N/A'}</Text>
      </LinearGradient>

      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Card variant="elevated" style={styles.infoCard}>
          <Text style={styles.cardTitle}>Personal Information</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <FontAwesome name="user" size={20} color={Theme.colors.primary} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{displayData?.name || 'N/A'}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <FontAwesome name="envelope" size={20} color={Theme.colors.info} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{displayData?.email || 'N/A'}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <FontAwesome name="phone" size={20} color={Theme.colors.secondary} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{displayData?.phone_number || 'N/A'}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <FontAwesome name="calendar" size={20} color={Theme.colors.accent} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Age</Text>
              <Text style={styles.infoValue}>{displayData?.age || 'N/A'}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <FontAwesome name="wheelchair" size={20} color={Theme.colors.info} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Disability</Text>
              <Text style={styles.infoValue}>{displayData?.disability || 'N/A'}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <FontAwesome name="map-marker" size={20} color={Theme.colors.danger} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{displayData?.location || 'N/A'}</Text>
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

      {/* Edit Profile Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
            </LinearGradient>
            <ScrollView style={styles.modalBody}>
              <TextInput 
                label="Name" 
                placeholder="Enter your name" 
                value={form.name} 
                onChangeText={(v) => setForm({ ...form, name: v })} 
                leftIcon={<FontAwesome name="user" size={20} color={Theme.colors.text.secondary} />} 
              />
              <TextInput 
                label="Email" 
                placeholder="Enter your email" 
                value={form.email} 
                onChangeText={(v) => setForm({ ...form, email: v })} 
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<FontAwesome name="envelope" size={20} color={Theme.colors.text.secondary} />} 
              />
              <TextInput 
                label="Phone" 
                placeholder="Enter phone number" 
                value={form.phone_number} 
                onChangeText={(v) => setForm({ ...form, phone_number: v })} 
                keyboardType="phone-pad" 
                leftIcon={<FontAwesome name="phone" size={20} color={Theme.colors.text.secondary} />} 
              />
              <TextInput 
                label="Age" 
                placeholder="Enter your age" 
                value={form.age ? String(form.age) : ''} 
                onChangeText={(v) => setForm({ ...form, age: parseInt(v) || 0 })} 
                keyboardType="number-pad" 
                leftIcon={<FontAwesome name="calendar" size={20} color={Theme.colors.text.secondary} />} 
              />
              <TextInput 
                label="Disability" 
                placeholder="Enter disability information" 
                value={form.disability} 
                onChangeText={(v) => setForm({ ...form, disability: v })} 
                leftIcon={<FontAwesome name="wheelchair" size={20} color={Theme.colors.text.secondary} />} 
              />
              <TextInput 
                label="Location" 
                placeholder="Enter your location" 
                value={form.location} 
                onChangeText={(v) => setForm({ ...form, location: v })} 
                leftIcon={<FontAwesome name="map-marker" size={20} color={Theme.colors.text.secondary} />} 
              />
              <View style={styles.modalActions}>
                <Button 
                  title="Save Changes" 
                  onPress={handleSaveProfile} 
                  variant="primary" 
                  fullWidth 
                  icon={<FontAwesome name="check" size={20} color="#fff" />} 
                />
                <Button 
                  title="Cancel" 
                  onPress={() => setEditModalVisible(false)} 
                  variant="outline" 
                  fullWidth 
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal visible={passwordModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient colors={['#F59E0B', '#EF4444']} style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
            </LinearGradient>
            <ScrollView style={styles.modalBody}>
              <TextInput 
                label="Current Password" 
                placeholder="Enter current password" 
                value={passwordForm.current_password} 
                onChangeText={(v) => setPasswordForm({ ...passwordForm, current_password: v })} 
                secureTextEntry 
                leftIcon={<FontAwesome name="lock" size={20} color={Theme.colors.text.secondary} />} 
              />
              <TextInput 
                label="New Password" 
                placeholder="Enter new password" 
                value={passwordForm.new_password} 
                onChangeText={(v) => setPasswordForm({ ...passwordForm, new_password: v })} 
                secureTextEntry 
                leftIcon={<FontAwesome name="key" size={20} color={Theme.colors.text.secondary} />} 
              />
              <TextInput 
                label="Confirm New Password" 
                placeholder="Confirm new password" 
                value={passwordForm.new_password_confirmation} 
                onChangeText={(v) => setPasswordForm({ ...passwordForm, new_password_confirmation: v })} 
                secureTextEntry 
                leftIcon={<FontAwesome name="key" size={20} color={Theme.colors.text.secondary} />} 
              />
              <View style={styles.modalActions}>
                <Button 
                  title="Update Password" 
                  onPress={handleSavePassword} 
                  variant="danger" 
                  fullWidth 
                  icon={<FontAwesome name="check" size={20} color="#fff" />} 
                />
                <Button 
                  title="Cancel" 
                  onPress={() => setPasswordModalVisible(false)} 
                  variant="outline" 
                  fullWidth 
                />
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
  header: { paddingTop: 50, paddingBottom: 30, alignItems: 'center', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  avatarContainer: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  userName: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 4 },
  userEmail: { fontSize: 16, color: 'rgba(255,255,255,0.8)' },
  content: { padding: 24, paddingBottom: 120 },
  infoCard: { marginBottom: 16 },
  actionsCard: { marginBottom: 16 },
  cardTitle: { fontSize: 20, fontWeight: '700', color: Theme.colors.text.primary, marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Theme.colors.border.light },
  infoIconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: Theme.colors.background, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  infoTextContainer: { flex: 1 },
  infoLabel: { fontSize: 12, color: Theme.colors.text.secondary, marginBottom: 4 },
  infoValue: { fontSize: 16, fontWeight: '600', color: Theme.colors.text.primary },
  actionItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Theme.colors.border.light },
  actionLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  actionText: { fontSize: 16, fontWeight: '600', color: Theme.colors.text.primary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Theme.colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%', paddingBottom: 50 },
  modalHeader: { paddingVertical: 24, paddingHorizontal: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  modalTitle: { fontSize: 24, fontWeight: '700', color: '#fff', textAlign: 'center' },
  modalBody: { padding: 24 },
  modalActions: { gap: 12, marginTop: 24, marginBottom: 32 },
});
