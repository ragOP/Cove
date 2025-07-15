import React from 'react';
import { View, StyleSheet, Modal, Text, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const CustomModal = ({
  visible,
  onDismiss,
  title,
  message,
  icon,
  iconColor = '#D28A8C',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  confirmButtonColor = '#D28A8C',
  cancelButtonColor = '#666',
  destructive = false,
  showCancel = true,
}) => {
  const handleConfirm = () => {
    onConfirm?.();
    onDismiss();
  };

  const handleCancel = () => {
    onCancel?.();
    onDismiss();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Icon */}
          {icon && (
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name={icon}
                size={48}
                color={iconColor}
              />
            </View>
          )}

          {/* Title */}
          <Text style={styles.title}>
            {title}
          </Text>

          {/* Message */}
          <Text style={styles.message}>
            {message}
          </Text>

          {/* Actions */}
          <View style={styles.actions}>
            {showCancel && (
              <TouchableOpacity
                onPress={handleCancel}
                style={styles.cancelButton}
                activeOpacity={0.8}>
                <Text style={[styles.cancelButtonText, { color: cancelButtonColor }]}>
                  {cancelText}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleConfirm}
              style={[
                styles.confirmButton,
                {
                  backgroundColor: destructive ? 'rgba(255, 68, 68, 0.1)' : confirmButtonColor,
                  borderColor: destructive ? '#ff4444' : confirmButtonColor,
                },
              ]}
              activeOpacity={0.8}>
              <Text style={[
                styles.confirmButtonText,
                { color: destructive ? '#ff4444' : '#fff' }
              ]}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  modalContent: {
    backgroundColor: '#232323',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 8,
    minWidth: 280,
    maxWidth: '80%',
    alignItems: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    color: '#bbb',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 16,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#666',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmButton: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 24,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CustomModal; 