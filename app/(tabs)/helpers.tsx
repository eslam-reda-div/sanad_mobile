import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import TextInput from '@/components/ui/TextInput';
import { Theme } from '@/constants/Theme';
import * as mockServer from '@/src/api/mockServer';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Helper = { id: string; name: string; phone: string; relationship: string; priority: number };

export default function HelpersScreen() {
  const [helpers, setHelpers] = useState<Helper[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingHelper, setEditingHelper] = useState<Helper | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', relationship: '', priority: 1 });

  useEffect(() => {
    fetchHelpers();
  }, []);

  const fetchHelpers = async () => {
    const list = await mockServer.getHelpers();
    setHelpers(list);
  };

  const handleAdd = () => {
    setEditingHelper(null);
    setForm({ name: '', phone: '', relationship: '', priority: 1 });
    setModalVisible(true);
  };

  const handleEdit = (h: Helper) => {
    setEditingHelper(h);
    setForm({ name: h.name, phone: h.phone, relationship: h.relationship, priority: h.priority });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (editingHelper) {
      await mockServer.updateHelper(editingHelper.id, form);
    } else {
      await mockServer.addHelper(form);
    }
    fetchHelpers();
    setModalVisible(false);
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to remove this helper?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await mockServer.deleteHelper(id); fetchHelpers(); } },
    ]);
  };

  const getPriorityColor = (priority: number) => {
    if (priority === 1) return Theme.colors.danger;
    if (priority === 2) return Theme.colors.accent;
    return Theme.colors.secondary;
  };

  const getPriorityLabel = (priority: number) => {
    if (priority === 1) return 'High';
    if (priority === 2) return 'Medium';
    return 'Low';
  };

  const renderItem = ({ item }: { item: Helper }) => (
    <Card variant="elevated" style={styles.helperCard}>
      <View style={styles.helperHeader}>
        <View style={styles.avatarContainer}>
          <FontAwesome name="user-circle" size={48} color={Theme.colors.primary} />
        </View>
        <View style={styles.helperInfo}>
          <Text style={styles.helperName}>{item.name}</Text>
          <View style={styles.relationshipRow}>
            <FontAwesome name="heart" size={14} color={Theme.colors.text.secondary} />
            <Text style={styles.relationship}>{item.relationship}</Text>
          </View>
          <View style={styles.phoneRow}>
            <FontAwesome name="phone" size={14} color={Theme.colors.text.secondary} />
            <Text style={styles.phone}>{item.phone}</Text>
          </View>
        </View>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
          <Text style={styles.priorityText}>{getPriorityLabel(item.priority)}</Text>
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
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
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
              <TextInput
                label="Name"
                placeholder="Enter helper's name"
                value={form.name}
                onChangeText={(v) => setForm({ ...form, name: v })}
                leftIcon={<FontAwesome name="user" size={20} color={Theme.colors.text.secondary} />}
              />
              <TextInput
                label="Phone Number"
                placeholder="Enter phone number"
                value={form.phone}
                onChangeText={(v) => setForm({ ...form, phone: v })}
                keyboardType="phone-pad"
                leftIcon={<FontAwesome name="phone" size={20} color={Theme.colors.text.secondary} />}
              />
              <TextInput
                label="Relationship"
                placeholder="e.g., Family, Friend, Caregiver"
                value={form.relationship}
                onChangeText={(v) => setForm({ ...form, relationship: v })}
                leftIcon={<FontAwesome name="heart" size={20} color={Theme.colors.text.secondary} />}
              />
              <TextInput
                label="Priority (1=High, 2=Medium, 3=Low)"
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
  avatarContainer: { marginRight: 16 },
  helperInfo: { flex: 1 },
  helperName: { fontSize: 20, fontWeight: '700', color: Theme.colors.text.primary, marginBottom: 8 },
  relationshipRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  relationship: { fontSize: 14, color: Theme.colors.text.secondary },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  phone: { fontSize: 14, color: Theme.colors.text.secondary },
  priorityBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 9999 },
  priorityText: { fontSize: 12, fontWeight: '700', color: '#fff' },
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
});

