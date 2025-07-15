import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../redux/slice/authSlice';
import UserAvatar from '../../components/CustomAvatar/UserAvatar';
import CustomDialog from '../../components/CustomDialog/CustomDialog';
import MediaPreview from '../../components/MediaPreview/MediaPreview';

const Profile = ({ 
  navigation, 
  onNavigateToProfileView, 
  onNavigateToSettings 
}) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  
  const [previewVisible, setPreviewVisible] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [logoutDialog, setLogoutDialog] = useState(false);
  
  const handleLogout = () => {
    setLogoutDialog(true);
  };

  const handleLogoutConfirm = () => {
    dispatch(logoutUser());
    setLogoutDialog(false);
  };

  const handleLogoutCancel = () => {
    setLogoutDialog(false);
  };

  // Use passed navigation handlers or fall back to direct navigation
  const handleNavigateToProfileView = onNavigateToProfileView || ((userId) => {
    if (navigation) {
      navigation.navigate('ProfileView', { userId });
    }
  });

  const handleNavigateToSettings = onNavigateToSettings || (() => {
    // Navigate to settings when implemented
    console.log('Navigate to settings');
  });

  const handleEditProfile = () => {
    // Navigate to edit profile screen
    console.log('Navigate to edit profile');
  };

  const handleChangePassword = () => {
    // Navigate to change password screen
    console.log('Navigate to change password');
  };

  const handlePrivacySettings = () => {
    // Navigate to privacy settings
    console.log('Navigate to privacy settings');
  };

  const handleHelpSupport = () => {
    // Navigate to help and support
    console.log('Navigate to help and support');
  };

  const handleAbout = () => {
    // Navigate to about screen
    console.log('Navigate to about');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setPreviewVisible(true)}
          activeOpacity={0.85}
          style={styles.avatarContainer}>
          <UserAvatar
            profilePicture={user?.profilePicture}
            name={user?.name}
            id={user?.id}
            size={100}
          />
          <View style={styles.editAvatarButton}>
            <Icon name="camera" size={16} color="#fff" />
          </View>
        </TouchableOpacity>
        
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.name || 'User Name'}</Text>
          <Text style={styles.userUsername}>@{user?.username || 'username'}</Text>
          <Text style={styles.userPhone}>{user?.phoneNumber || '+1234567890'}</Text>
        </View>

     
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Friends</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Groups</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </View>
      </View>

      {/* Settings Section */}
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity style={styles.settingItem} onPress={handleEditProfile}>
          <View style={styles.settingLeft}>
            <MaterialCommunityIcons name="account-edit" size={24} color="#D28A8C" />
            <Text style={styles.settingText}>Edit Profile</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#888" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={handleChangePassword}>
          <View style={styles.settingLeft}>
            <MaterialCommunityIcons name="lock-outline" size={24} color="#D28A8C" />
            <Text style={styles.settingText}>Change Password</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#888" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={handlePrivacySettings}>
          <View style={styles.settingLeft}>
            <MaterialCommunityIcons name="shield-account-outline" size={24} color="#D28A8C" />
            <Text style={styles.settingText}>Privacy & Security</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#888" />
        </TouchableOpacity>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <MaterialCommunityIcons name="bell-outline" size={24} color="#D28A8C" />
            <Text style={styles.settingText}>Notifications</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            color="#D28A8C"
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <MaterialCommunityIcons name="theme-light-dark" size={24} color="#D28A8C" />
            <Text style={styles.settingText}>Dark Mode</Text>
          </View>
          <Switch
            value={darkModeEnabled}
            onValueChange={setDarkModeEnabled}
            color="#D28A8C"
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <MaterialCommunityIcons name="eye-off-outline" size={24} color="#D28A8C" />
            <Text style={styles.settingText}>Privacy Mode</Text>
          </View>
          <Switch
            value={privacyMode}
            onValueChange={setPrivacyMode}
            color="#D28A8C"
          />
        </View>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <TouchableOpacity style={styles.settingItem} onPress={handleHelpSupport}>
          <View style={styles.settingLeft}>
            <MaterialCommunityIcons name="help-circle-outline" size={24} color="#D28A8C" />
            <Text style={styles.settingText}>Help & Support</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#888" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={handleAbout}>
          <View style={styles.settingLeft}>
            <MaterialCommunityIcons name="information-outline" size={24} color="#D28A8C" />
            <Text style={styles.settingText}>About Cove</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#888" />
        </TouchableOpacity>
      </View>

      {/* Logout Section */}
      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="log-out-outline" size={20} color="#ff4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <View style={styles.appInfo}>
        <MaterialCommunityIcons name="heart" size={16} color="#D28A8C" />
        <Text style={styles.appInfoText}>Made with love • v1.0</Text>
      </View>

      <CustomDialog
        visible={logoutDialog}
        onDismiss={() => setLogoutDialog(false)}
        title="Logout"
        message="Are you sure you want to logout?"
        icon="logout"
        iconColor="#ff4444"
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
        confirmButtonColor="#ff4444"
        destructive={true}
      />

      <MediaPreview
        visible={previewVisible}
        media={
          user?.profilePicture
            ? { type: 'image', uri: user.profilePicture }
            : null
        }
        onClose={() => setPreviewVisible(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    position: 'relative',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  editAvatarButton: {
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
  userInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userUsername: {
    fontSize: 16,
    color: '#D28A8C',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    color: '#888',
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(210, 138, 140, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D28A8C',
  },
  editProfileText: {
    color: '#D28A8C',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 8,
  },
  settingsSection: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 12,
  },
  logoutSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  logoutText: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  appInfoText: {
    color: '#888',
    fontSize: 14,
    marginLeft: 6,
  },
});

export default Profile;
