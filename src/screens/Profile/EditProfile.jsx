import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector, useDispatch } from 'react-redux';
import { selectFiles } from '../../helpers/files/selectFiles';
import { uploadFilesToCloud } from '../../apis/uploadFilesToCloud';
import { onUpdateDetails } from '../../apis/onUpdateDetails';
import CustomTextField from '../../components/CustomTextField/CustomTextField';
import CustomButton from '../../components/CustomButton/CustomButton';
import CustomDialog from '../../components/CustomDialog/CustomDialog';
import { showSnackbar } from '../../redux/slice/snackbarSlice';
import { updateUser } from '../../redux/slice/authSlice';

const EditProfile = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const token = useSelector(state => state.auth.token);

  console.log('user', user);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    // bio: '', // Commented out for now
    gender: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        username: user.username || '',
        // bio: user.bio || '', // Commented out for now
        gender: user.gender || '',
      });
      if (user.profilePicture) {
        setProfileImage({ uri: user.profilePicture });
      }
    }
  }, [user]);

  useEffect(() => {
    // Check if there are any changes
    const originalData = {
      name: user?.name || '',
      username: user?.username || '',
      // bio: user?.bio || '', // Commented out for now
      gender: user?.gender || '',
    };
    
    const hasFormChanges = JSON.stringify(formData) !== JSON.stringify(originalData);
    const hasImageChanges = profileImage?.uri !== user?.profilePicture;
    
    setHasChanges(hasFormChanges || hasImageChanges);
  }, [formData, profileImage, user]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSelectImage = async () => {
    try {
      const result = await selectFiles({
        mediaType: 'photo',
        selectionLimit: 1,
        includeBase64: false,
      });

      if (result && result.length > 0) {
        const selectedImage = result[0];
        setProfileImage({
          uri: selectedImage.uri,
          type: selectedImage.type,
          name: selectedImage.fileName || 'profile.jpg',
        });
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      dispatch(
        showSnackbar({
          type: 'error',
          title: 'Error',
          subtitle: 'Failed to select image',
          placement: 'top',
        }),
      );
    }
  };

  const uploadImage = async () => {
    if (!profileImage || profileImage.uri === user?.profilePicture) {
      return null; // No new image to upload
    }

    try {
      const formData = new FormData();
      formData.append('files', {
        uri: profileImage.uri,
        type: profileImage.type || 'image/jpeg',
        name: profileImage.name || 'profile.jpg',
      });

      const response = await uploadFilesToCloud({ payload: formData });
      
      if (response?.response?.success && response.response.data?.length > 0) {
        return response.response.data[0]; // Return the uploaded file URL
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!hasChanges) {
      navigation.goBack();
      return;
    }

    // Basic validation
    if (!formData.name.trim()) {
      dispatch(
        showSnackbar({
          type: 'error',
          title: 'Validation Error',
          subtitle: 'Name is required',
          placement: 'top',
        }),
      );
      return;
    }

    if (!formData.username.trim()) {
      dispatch(
        showSnackbar({
          type: 'error',
          title: 'Validation Error',
          subtitle: 'Username is required',
          placement: 'top',
        }),
      );
      return;
    }

    setIsLoading(true);
    try {
      let uploadedImageUrl = null;

      // Upload image if changed
      if (profileImage && profileImage.uri !== user?.profilePicture) {
        uploadedImageUrl = await uploadImage();
      }

      // Prepare update payload
      const updatePayload = new FormData();
      updatePayload.append('name', formData.name);
      updatePayload.append('username', formData.username);
      // updatePayload.append('bio', formData.bio); // Commented out for now
      updatePayload.append('gender', formData.gender);
      
      if (uploadedImageUrl) {
        updatePayload.append('profilePicture', uploadedImageUrl);
      }

      const response = await onUpdateDetails({
        payload: updatePayload,
        token,
      });

      if (response?.response?.success) {
        // Update Redux store
        dispatch(updateUser({
          ...user,
          ...formData,
          profilePicture: uploadedImageUrl || user?.profilePicture,
        }));

        dispatch(
          showSnackbar({
            type: 'success',
            title: 'Profile Updated',
            subtitle: 'Your profile has been updated successfully',
            placement: 'top',
          }),
        );

        navigation.goBack();
      } else {
        throw new Error(response?.response?.data?.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      dispatch(
        showSnackbar({
          type: 'error',
          title: 'Error',
          subtitle: error.message || 'Failed to update profile',
          placement: 'top',
        }),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscard = () => {
    if (hasChanges) {
      setShowDiscardDialog(true);
    } else {
      navigation.goBack();
    }
  };

  const handleDiscardConfirm = () => {
    setShowDiscardDialog(false);
    navigation.goBack();
  };

  const handleDiscardCancel = () => {
    setShowDiscardDialog(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleDiscard} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Edit Profile</Text>
        
        <TouchableOpacity 
          onPress={handleSave} 
          style={[styles.headerButton, !hasChanges && styles.headerButtonDisabled]}
          disabled={!hasChanges || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#D28A8C" />
          ) : (
            <Text style={[styles.headerButtonText, styles.headerButtonTextBold]}>
              Save
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Image Section */}
        <View style={styles.imageSection}>
          <TouchableOpacity onPress={handleSelectImage} style={styles.imageContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage.uri }} style={styles.profileImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Icon name="person" size={60} color="#888" />
              </View>
            )}
            <View style={styles.imageEditButton}>
              <Icon name="camera" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.imageLabel}>Tap to change photo</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Name</Text>
            <CustomTextField
              placeholder="Enter your name"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Username</Text>
            <CustomTextField
              placeholder="Enter username"
              value={formData.username}
              onChangeText={(value) => handleInputChange('username', value)}
            />
          </View>

          {/* Bio field commented out for now
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Bio</Text>
            <CustomTextField
              placeholder="Tell us about yourself"
              value={formData.bio}
              onChangeText={(value) => handleInputChange('bio', value)}
              multiline={true}
              numberOfLines={3}
            />
          </View>
          */}

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Gender</Text>
            <View style={styles.genderContainer}>
              {['Male', 'Female', 'Other'].map((gender) => (
                <TouchableOpacity
                  key={gender}
                  style={[
                    styles.genderOption,
                    formData.gender === gender && styles.genderOptionSelected,
                  ]}
                  onPress={() => handleInputChange('gender', gender)}
                >
                  <Text
                    style={[
                      styles.genderOptionText,
                      formData.gender === gender && styles.genderOptionTextSelected,
                    ]}
                  >
                    {gender}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Discard Changes Dialog */}
      <CustomDialog
        visible={showDiscardDialog}
        onDismiss={handleDiscardCancel}
        title="Discard Changes"
        message="Are you sure you want to discard your changes? This action cannot be undone."
        icon="alert-circle-outline"
        iconColor="#ff4444"
        confirmText="Discard"
        cancelText="Keep Editing"
        onConfirm={handleDiscardConfirm}
        onCancel={handleDiscardCancel}
        confirmButtonColor="#ff4444"
        destructive={true}
        showCancel={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  headerButtonDisabled: {
    opacity: 0.5,
  },
  headerButtonText: {
    color: '#D28A8C',
    fontSize: 16,
  },
  headerButtonTextBold: {
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  imageSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#D28A8C',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#181818',
  },
  imageLabel: {
    color: '#888',
    fontSize: 14,
  },
  formSection: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  fieldLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: '#765152',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  genderOptionSelected: {
    borderColor: '#D28A8C',
    backgroundColor: 'rgba(210, 138, 140, 0.1)',
  },
  genderOptionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  genderOptionTextSelected: {
    color: '#D28A8C',
    fontWeight: '600',
  },
});

export default EditProfile; 