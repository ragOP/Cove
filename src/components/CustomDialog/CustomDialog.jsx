import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Dialog, Portal, Text, Button, IconButton } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const CustomDialog = ({
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
  isLoading = false,
}) => {
  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm?.();
      onDismiss();
    }
  };

  const handleCancel = () => {
    if (!isLoading) {
      onCancel?.();
      onDismiss();
    }
  };

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={isLoading ? undefined : onDismiss}
        style={styles.dialog}
        contentStyle={styles.dialogContent}>
        
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
        <Dialog.Title style={styles.title}>
          {title}
        </Dialog.Title>

        {/* Message */}
        <Dialog.Content>
          <Text style={styles.message}>
            {message}
          </Text>
        </Dialog.Content>

        {/* Actions */}
        <Dialog.Actions style={styles.actions}>
          {showCancel && (
            <Button
              onPress={handleCancel}
              textColor={cancelButtonColor}
              style={styles.cancelButton}
              disabled={isLoading}>
              {cancelText}
            </Button>
          )}
          <Button
            onPress={handleConfirm}
            textColor={destructive ? '#ff4444' : '#fff'}
            style={[
              styles.confirmButton,
              {
                backgroundColor: destructive ? 'rgba(255, 68, 68, 0.1)' : confirmButtonColor,
                borderColor: destructive ? '#ff4444' : confirmButtonColor,
              },
            ]}
            disabled={isLoading}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.loadingText}>Processing...</Text>
              </View>
            ) : (
              confirmText
            )}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: {
    borderRadius: 16,
    backgroundColor: '#232323',
  },
  dialogContent: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    backgroundColor: '#232323',
    borderRadius: 16,
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
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#666',
  },
  confirmButton: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 24,
    borderWidth: 1,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: 8,
    color: '#fff',
    fontSize: 14,
  },
});

export default CustomDialog; 