import LoadingSpinner from '@/components/LoadingSpinner';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import TextInput from '@/components/ui/TextInput';
import { Theme } from '@/constants/Theme';
import { helpersApi } from '@/src/api/services';
import type { Helper } from '@/src/api/types';
import { useAuthStore } from '@/src/store/authStore';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Image, Modal, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HelpersScreen() {
  const { token } = useAuthStore();
  const [helpers, setHelpers] = useState<Helper[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingHelper, setEditingHelper] = useState<Helper | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    phone_number: '', 
    location: '', 
    age: 0, 
    priority: 1 
  });
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  // Fetch helpers data
  const fetchHelpers = async () => {
    // Don't fetch if no token is available
    if (!token) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const response = await helpersApi.getData();
      if (response.success && response.data) {
        setHelpers(response.data.helpers || []);
      }
    } catch (error: any) {
      console.error('Failed to fetch helpers:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to load helpers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh helpers data on screen focus
  useFocusEffect(
    useCallback(() => {
      if (token) {
        setLoading(true);
        fetchHelpers();
      }
    }, [token])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchHelpers();
  };

  const handleAdd = () => {
    setEditingHelper(null);
    setForm({ 
      name: '', 
      email: '', 
      phone_number: '', 
      location: '', 
      age: 0, 
      priority: 1 
    });
    setAvatarUri(null);
    setModalVisible(true);
  };

  const handleEdit = (helper: Helper) => {
    setEditingHelper(helper);
    setForm({ 
      name: helper.name, 
      email: helper.email || '', 
      phone_number: helper.phone_number, 
      location: helper.location || '', 
      age: helper.age || 0, 
      priority: helper.pivot?.priority || 1
    });
    setAvatarUri(null);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone_number.trim()) {
      Alert.alert('Validation', 'Name, email, and phone are required.');
      return;
    }

    try {
      const data: any = {
        name: form.name,
        email: form.email,
        phone_number: form.phone_number,
        priority: form.priority,
      };
      
      if (form.location) {
        data.location = form.location;
      }
      if (form.age && form.age > 0) {
        data.age = form.age;
      }
      
      if (avatarUri) {
        const filename = avatarUri.split('/').pop() || 'avatar.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        data.avatar = {
          uri: avatarUri,
          name: filename,
          type,
        } as any;
      }

      let response;
      if (editingHelper) {
        response = await helpersApi.updateHelper(editingHelper.id, data);
      } else {
        response = await helpersApi.addHelper(data);
      }

      if (response.success) {
        Alert.alert('Success', editingHelper ? 'Helper updated successfully' : 'Helper added successfully');
        setModalVisible(false);
        fetchHelpers();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save helper';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleDelete = async (id: number) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to remove this helper?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: async () => {
          try {
            const response = await helpersApi.deleteHelper(id);
            if (response.success) {
              Alert.alert('Success', 'Helper deleted successfully');
              fetchHelpers();
            }
          } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to delete helper';
            Alert.alert('Error', errorMessage);
          }
        }
      },
    ]);
  };

  const handleAvatarPress = async () => {
    Alert.alert(
      'Choose Avatar',
      'Select an option',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: () => pickImage(true) },
        { text: 'Choose from Library', onPress: () => pickImage(false) },
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
        setAvatarUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority === 1) return Theme.colors.danger;
    if (priority === 2) return Theme.colors.accent;
    if (priority === 3) return Theme.colors.secondary;
    return Theme.colors.info;
  };

  const renderItem = ({ item }: { item: Helper }) => (
    <Card variant="elevated" style={styles.helperCard}>
      <View style={styles.helperHeader}>
        <View style={styles.avatarContainer}>
          {item.avatar_full_url ? (
            <Image source={{ uri: item.avatar_full_url }} style={styles.avatarImage} />
          ) : (
            <FontAwesome name="user-circle" size={48} color={Theme.colors.primary} />
          )}
        </View>
        <View style={styles.helperInfo}>
          <Text style={styles.helperName}>{item.name}</Text>
          <View style={styles.infoRow}>
            <FontAwesome name="envelope" size={12} color={Theme.colors.text.secondary} />
            <Text style={styles.infoText}>{item.email || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <FontAwesome name="phone" size={12} color={Theme.colors.text.secondary} />
            <Text style={styles.infoText}>{item.phone_number}</Text>
          </View>
        </View>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.pivot?.priority || 3) }]}>
          <Text style={styles.priorityText}>{item.pivot?.priority || 3}</Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        <Button
          title="Edit"
          onPress={() => handleEdit(item)}
          variant="outline"
          size="small"
          icon={<FontAwesome name="edit" size={16} color={Theme.colors.primary} />}
          style={styles.actionButton}
        />
        <Button
          title="Delete"
          onPress={() => handleDelete(item.id)}
          variant="danger"
          size="small"
          icon={<FontAwesome name="trash" size={16} color="#fff" />}
          style={styles.actionButton}
        />
      </View>
    </Card>
  );

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading helpers..." />;
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#10B981', '#059669']} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>My Helpers</Text>
            <Text style={styles.headerSubtitle}>{helpers.length} trusted contacts</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
            <FontAwesome name="plus" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <FlatList
        data={helpers}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <FontAwesome name="users" size={64} color={Theme.colors.border.light} />
            <Text style={styles.emptyText}>No helpers yet</Text>
            <Text style={styles.emptySubtext}>Add trusted contacts to help you in emergencies</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient colors={['#10B981', '#059669']} style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingHelper ? 'Edit Helper' : 'Add New Helper'}</Text>
            </LinearGradient>
            <ScrollView style={styles.modalBody}>
              <TouchableOpacity onPress={handleAvatarPress} style={styles.avatarPickerContainer}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarPreview} />
                ) : editingHelper?.avatar_full_url ? (
                  <Image source={{ uri: editingHelper.avatar_full_url }} style={styles.avatarPreview} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <FontAwesome name="camera" size={32} color={Theme.colors.text.secondary} />
                    <Text style={styles.avatarPlaceholderText}>Tap to add photo</Text>
                  </View>
                )}
              </TouchableOpacity>
              
              <TextInput
                label="Name *"
                placeholder="Enter helper's name"
                value={form.name}
                onChangeText={(v) => setForm({ ...form, name: v })}
                leftIcon={<FontAwesome name="user" size={20} color={Theme.colors.text.secondary} />}
              />
              <TextInput
                label="Email *"
                placeholder="Enter email address"
                value={form.email}
                onChangeText={(v) => setForm({ ...form, email: v })}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<FontAwesome name="envelope" size={20} color={Theme.colors.text.secondary} />}
              />
              <TextInput
                label="Phone Number *"
                placeholder="Enter phone number"
                value={form.phone_number}
                onChangeText={(v) => setForm({ ...form, phone_number: v })}
                keyboardType="phone-pad"
                leftIcon={<FontAwesome name="phone" size={20} color={Theme.colors.text.secondary} />}
              />
              <TextInput
                label="Location"
                placeholder="Enter location"
                value={form.location}
                onChangeText={(v) => setForm({ ...form, location: v })}
                leftIcon={<FontAwesome name="map-marker" size={20} color={Theme.colors.text.secondary} />}
              />
              <TextInput
                label="Age"
                placeholder="Enter age"
                value={form.age ? String(form.age) : ''}
                onChangeText={(v) => setForm({ ...form, age: parseInt(v) || 0 })}
                keyboardType="number-pad"
                leftIcon={<FontAwesome name="calendar" size={20} color={Theme.colors.text.secondary} />}
              />
              <TextInput
                label="Priority (Number: 1, 2, 3, etc.)"
                placeholder="Enter priority"
                value={String(form.priority)}
                onChangeText={(v) => setForm({ ...form, priority: parseInt(v) || 1 })}
                keyboardType="number-pad"
                leftIcon={<FontAwesome name="flag" size={20} color={Theme.colors.text.secondary} />}
              />
              <View style={styles.modalActions}>
                <Button
                  title="Save"
                  onPress={handleSave}
                  variant="primary"
                  fullWidth
                  icon={<FontAwesome name="check" size={20} color="#fff" />}
                />
                <Button
                  title="Cancel"
                  onPress={() => setModalVisible(false)}
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
  header: { paddingTop: 60, paddingBottom: 24, paddingHorizontal: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 4 },
  headerSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)' },
  addButton: { width: 56, height: 56, borderRadius: 9999, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: 24, paddingBottom: 64 },
  helperCard: { marginBottom: 16 },
  helperHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  avatarContainer: { marginRight: 16, width: 48, height: 48, borderRadius: 24, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  avatarImage: { width: 48, height: 48, borderRadius: 24 },
  helperInfo: { flex: 1 },
  helperName: { fontSize: 18, fontWeight: '700', color: Theme.colors.text.primary, marginBottom: 6 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  infoText: { fontSize: 13, color: Theme.colors.text.secondary },
  priorityBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 9999, minWidth: 36, alignItems: 'center', justifyContent: 'center' },
  priorityText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  cardActions: { flexDirection: 'row', gap: 12 },
  actionButton: { flex: 1 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 64 },
  emptyText: { fontSize: 20, fontWeight: '600', color: Theme.colors.text.primary, marginTop: 16 },
  emptySubtext: { fontSize: 14, color: Theme.colors.text.secondary, marginTop: 8, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Theme.colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  modalHeader: { paddingVertical: 24, paddingHorizontal: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  modalTitle: { fontSize: 24, fontWeight: '700', color: '#fff', textAlign: 'center' },
  modalBody: { padding: 24 },
  modalActions: { gap: 12, marginTop: 24, marginBottom: 32 },
  avatarPickerContainer: { 
    alignSelf: 'center', 
    marginBottom: 20,
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Theme.colors.border.light,
    borderStyle: 'dashed',
  },
  avatarPreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 12,
    color: Theme.colors.text.secondary,
    marginTop: 8,
    textAlign: 'center',
  },
});

