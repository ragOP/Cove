import React from 'react';
import {
  View,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import UserAvatar from '../../components/CustomAvatar/UserAvatar';

const ProfileViewScreen = ({route, navigation}) => {
  const {user} = route.params;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LinearGradient
        colors={['#2A7BFF', '#232323']}
        style={styles.gradientHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.avatarShadow}>
          <UserAvatar
            profilePicture={user?.profilePicture}
            name={user?.name}
            id={user?._id}
            size={120}
          />
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.username}>@{user.username}</Text>
      </LinearGradient>
      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <Icon
            name="account"
            size={22}
            color="#2A7BFF"
            style={styles.infoIcon}
          />
          <Text style={styles.infoLabel}>Name</Text>
          <Text style={styles.infoValue}>{user.name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon
            name="email"
            size={22}
            color="#2A7BFF"
            style={styles.infoIcon}
          />
          <Text style={styles.infoLabel}>Username</Text>
          <Text style={styles.infoValue}>@{user.username}</Text>
        </View>
        {user.bio ? (
          <View style={styles.infoRow}>
            <Icon
              name="information-outline"
              size={22}
              color="#2A7BFF"
              style={styles.infoIcon}
            />
            <Text style={styles.infoLabel}>Bio</Text>
            <Text style={styles.infoValue}>{user.bio}</Text>
          </View>
        ) : null}
        {/* Add more fields as needed */}
      </View>
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
    paddingBottom: 32,
  },
  gradientHeader: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 32,
    width: '100%',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 16,
    elevation: 8,
    shadowColor: '#2A7BFF',
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    top: 36,
    zIndex: 2,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 4,
  },
  avatarShadow: {
    shadowColor: '#2A7BFF',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
    borderRadius: 60,
    marginBottom: 12,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: '#232323',
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  username: {
    fontSize: 16,
    color: '#c7d0e0',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  infoSection: {
    width: '92%',
    backgroundColor: '#232323',
    borderRadius: 24,
    padding: 22,
    marginTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoIcon: {
    marginRight: 10,
  },
  infoLabel: {
    color: '#bbb',
    fontSize: 15,
    width: 80,
  },
  infoValue: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
    flexWrap: 'wrap',
  },
});

export default ProfileViewScreen;
