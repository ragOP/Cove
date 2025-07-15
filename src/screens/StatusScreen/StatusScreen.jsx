import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LucideIcon from 'react-native-vector-icons/Feather';
import { Avatar } from 'react-native-paper';

const StatusScreen = () => {
  const navigation = useNavigation();
  const [statusText, setStatusText] = useState('');

  const statusUpdates = [
    {
      id: 1,
      name: 'John Doe',
      time: '2 minutes ago',
      status: 'Hey there! I am using Cove.',
      avatar: null,
    },
    {
      id: 2,
      name: 'Jane Smith',
      time: '1 hour ago',
      status: 'Working on something exciting!',
      avatar: null,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Status</Text>
        <Text style={styles.headerSubtitle}>Share your moments</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* My Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Status</Text>
          <TouchableOpacity style={styles.myStatusItem}>
            <View style={styles.avatarContainer}>
              <Avatar.Text size={48} label="Me" style={styles.avatar} />
              <View style={styles.addButton}>
                <LucideIcon name="plus" size={16} color="#fff" />
              </View>
            </View>
            <View style={styles.statusInfo}>
              <Text style={styles.statusName}>My Status</Text>
              <Text style={styles.statusSubtitle}>Tap to add status update</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Recent Updates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Updates</Text>
          {statusUpdates.map((update) => (
            <TouchableOpacity key={update.id} style={styles.statusItem}>
              <Avatar.Text size={48} label={update.name.split(' ').map(n => n[0]).join('')} style={styles.statusAvatar} />
              <View style={styles.statusInfo}>
                <Text style={styles.statusName}>{update.name}</Text>
                <Text style={styles.statusTime}>{update.time}</Text>
                <Text style={styles.statusText} numberOfLines={2}>
                  {update.status}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Create Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Create Status</Text>
          <View style={styles.createStatusContainer}>
            <TextInput
              style={styles.statusInput}
              placeholder="What's on your mind?"
              placeholderTextColor="#888"
              value={statusText}
              onChangeText={setStatusText}
              multiline
            />
            <TouchableOpacity style={styles.postButton}>
              <LucideIcon name="send" size={20} color="#fff" />
              <Text style={styles.postButtonText}>Post</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Empty State */}
        {statusUpdates.length === 0 && (
          <View style={styles.emptyState}>
            <LucideIcon name="loader" size={64} color="#D28A8C" />
            <Text style={styles.emptyStateTitle}>No Status Updates</Text>
            <Text style={styles.emptyStateSubtitle}>
              Be the first to share a status update
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#888',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  myStatusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    backgroundColor: '#D28A8C',
  },
  addButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#D28A8C',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 8,
  },
  statusAvatar: {
    backgroundColor: '#D28A8C',
  },
  statusInfo: {
    flex: 1,
    marginLeft: 12,
  },
  statusName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  statusTime: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#888',
  },
  statusText: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
  createStatusContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  statusInput: {
    color: '#fff',
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D28A8C',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});

export default StatusScreen; 