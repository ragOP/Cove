import React from 'react';
import {View, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {Text, Avatar, Button, Divider, IconButton} from 'react-native-paper';
import {useSelector, useDispatch} from 'react-redux';
import {logout} from '../../redux/slice/authSlice';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import UserAvatar from '../../components/CustomAvatar/UserAvatar';
import {Paths} from '../../navigaton/paths';
import MediaPreview from '../../components/MediaPreview/MediaPreview';
import { format } from 'date-fns';

const Profile = ({navigation}) => {
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();
  const [previewVisible, setPreviewVisible] = React.useState(false);

  const handleLogout = () => {
    dispatch(logout());
  };

  const createdAt = user?.createdAt ? new Date(user.createdAt) : new Date();
  const formattedDate = format(createdAt, 'EEEE, d MMMM yyyy');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <IconButton
          icon="arrow-left"
          size={28}
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          iconColor="#fff"
        />
        <Text style={styles.topBarTitle}>Profile</Text>
      </View>
      <View style={styles.header}>
        <Text style={styles.dateLabel}>{formattedDate}</Text>
        <TouchableOpacity onPress={() => setPreviewVisible(true)} activeOpacity={0.85}>
          <UserAvatar
            profilePicture={user?.profilePicture}
            name={user?.name}
            id={user?.id}
            size={96}
          />
        </TouchableOpacity>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.username}>@{user?.username}</Text>
        <Text style={styles.phone}>{user?.phoneNumber}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="account-group-outline" size={22} color="#D28A8C" style={styles.statIcon} />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Friends</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="account-multiple-plus-outline" size={22} color="#D28A8C" style={styles.statIcon} />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Groups</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="star-outline" size={22} color="#D28A8C" style={styles.statIcon} />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
        </View>
      </View>
      <Divider style={styles.divider} />
      <View style={styles.optionsSection}>
        <TouchableOpacity style={styles.optionRow}>
          <MaterialCommunityIcons name="account-edit" size={24} color="#D28A8C" style={styles.optionIcon} />
          <Text style={styles.optionText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionRow}>
          <MaterialCommunityIcons name="lock-outline" size={24} color="#D28A8C" style={styles.optionIcon} />
          <Text style={styles.optionText}>Change Password</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionRow}>
          <MaterialCommunityIcons name="bell-outline" size={24} color="#D28A8C" style={styles.optionIcon} />
          <Text style={styles.optionText}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionRow}>
          <MaterialCommunityIcons name="palette-outline" size={24} color="#D28A8C" style={styles.optionIcon} />
          <Text style={styles.optionText}>Theme</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionRow}>
          <MaterialCommunityIcons name="shield-account-outline" size={24} color="#D28A8C" style={styles.optionIcon} />
          <Text style={styles.optionText}>Privacy & Security</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionRow}>
          <MaterialCommunityIcons name="help-circle-outline" size={24} color="#D28A8C" style={styles.optionIcon} />
          <Text style={styles.optionText}>Help & Support</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionRow}>
          <MaterialCommunityIcons name="information-outline" size={24} color="#D28A8C" style={styles.optionIcon} />
          <Text style={styles.optionText}>About</Text>
        </TouchableOpacity>
      </View>
      <Divider style={styles.divider} />
      <Button
        mode="contained"
        style={styles.logoutBtn}
        labelStyle={styles.logoutLabel}
        icon="logout"
        onPress={handleLogout}
        contentStyle={styles.logoutContent}
      >
        Logout
      </Button>
      <View style={styles.madeWithCard}>
        <MaterialCommunityIcons name="heart" size={18} color="#D28A8C" style={styles.madeWithIcon} />
        <Text style={styles.madeWithText}>Made with love • v1.0</Text>
      </View>
      <MediaPreview
        visible={previewVisible}
        media={user?.profilePicture ? { type: 'image', uri: user.profilePicture } : null}
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
  content: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: '100%',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
    marginTop: 0,
    paddingHorizontal: 0,
  },
  backBtn: {
    marginLeft: -8,
    marginRight: 8,
    backgroundColor: 'transparent',
  },
  topBarTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 22,
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
    letterSpacing: 0.5,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
    backgroundColor: '#232323',
    borderRadius: 18,
    paddingVertical: 24,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  dateLabel: {
    color: '#bbb',
    fontSize: 13,
    alignSelf: 'center',
    marginBottom: 6,
    marginTop: -6,
    letterSpacing: 0.2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: 18,
    marginBottom: 2,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    marginBottom: 2,
  },
  statValue: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 2,
  },
  statLabel: {
    color: '#bbb',
    fontSize: 13,
    marginTop: 0,
    letterSpacing: 0.1,
  },
  name: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 22,
    marginTop: 12,
    letterSpacing: 0.2,
  },
  username: {
    color: '#bbb',
    fontSize: 15,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  phone: {
    color: '#bbb',
    fontSize: 14,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  divider: {
    width: '100%',
    backgroundColor: '#232323',
    marginVertical: 18,
    height: 1,
  },
  optionsSection: {
    width: '100%',
    marginBottom: 18,
    backgroundColor: '#232323',
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#232323',
  },
  optionIcon: {
    marginRight: 18,
  },
  optionText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  logoutBtn: {
    backgroundColor: '#D28A8C',
    borderRadius: 24,
    marginTop: 18,
    width: '100%',
    alignSelf: 'center',
    paddingVertical: 8,
    elevation: 2,
  },
  logoutLabel: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  madeWithCard: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 28,
    backgroundColor: '#232323',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 24,
  },
  madeWithIcon: {
    marginRight: 6,
  },
  madeWithText: {
    color: '#bbb',
    fontSize: 14,
    letterSpacing: 0.2,
  },
  logoutContent: {
    paddingHorizontal: 0,
  },
});

export default Profile;
