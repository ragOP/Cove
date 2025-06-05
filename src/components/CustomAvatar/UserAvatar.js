import React, {useState} from 'react';
import {Avatar} from 'react-native-paper';
import {getInitials} from '../../utils/name/getInitials';
import {StyleSheet, Modal, View, Pressable, Image} from 'react-native';

const UserAvatar = ({profilePicture, name, id, size = 44, showPreview = true}) => {
  const [modalVisible, setModalVisible] = useState(false);

  if (profilePicture) {
    return (
      <>
        <Pressable onPress={() => showPreview && setModalVisible(true)}>
          <Avatar.Image size={size} source={{uri: profilePicture}} />
        </Pressable>
        {showPreview && (
          <Modal
            visible={modalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setModalVisible(false)}>
            <View style={styles.modalBackdrop}>
              <View style={styles.modalContent}>
                <Image
                  source={{uri: profilePicture}}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
                <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
                  <Avatar.Icon icon="close" size={36} style={styles.closeButtonIcon} color="#fff" />
                </Pressable>
              </View>
            </View>
          </Modal>
        )}
      </>
    );
  }
  return (
    <Avatar.Text
      size={size}
      label={getInitials(name) || id}
      style={styles.avatarText}
    />
  );
};

const styles = StyleSheet.create({
  avatarText: {
    backgroundColor: '#444',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '92%',
    height: '80%',
    backgroundColor: '#181818',
    borderRadius: 18,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modalImage: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
    backgroundColor: '#222',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 2,
  },
  closeButtonIcon: {
    backgroundColor: 'transparent',
    elevation: 0,
  },
});

export default UserAvatar;
