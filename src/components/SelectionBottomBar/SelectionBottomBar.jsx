import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

const SelectionBottomBar = ({
  selectedItems = [],
  onSelectAll,
  onDeselectAll,
  onDelete,
  onMarkSensitive,
  onCancel,
}) => {
  const allItemsCount = selectedItems.length;
  const isAllSelected = selectedItems.length > 0;
  return (
    <View style={styles.selectionBottomBar}>
      <View style={styles.selectionInfo}>
        <Text style={styles.selectionCount}>{allItemsCount} selected</Text>
        <TouchableOpacity onPress={isAllSelected ? onDeselectAll : onSelectAll}>
          <Text style={styles.selectAllText}>
            {isAllSelected ? 'Deselect All' : 'Select All'}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.selectionActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onMarkSensitive}
          activeOpacity={0.8}>
          <MaterialIcon name="shield-outline" size={20} color="#D28A8C" />
          <Text style={styles.actionButtonText}>Sensitive</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={onDelete}
          activeOpacity={0.8}>
          <MaterialIcon name="delete" size={20} color="#ff4444" />
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
          activeOpacity={0.8}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  selectionBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 1000,
    elevation: 10,
  },
  selectionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectionCount: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  selectAllText: {
    color: '#D28A8C',
    fontSize: 14,
    fontWeight: '600',
  },
  selectionActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(210,138,140,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  actionButtonText: {
    color: '#D28A8C',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  deleteButton: {
    backgroundColor: 'rgba(255,68,68,0.1)',
  },
  deleteButtonText: {
    color: '#ff4444',
  },
  cancelButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SelectionBottomBar; 