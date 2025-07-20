import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Profile from '../../screens/Profile/Profile';
import { Paths } from '../../navigation/paths';

const ProfileTabScreen = () => {
  const navigation = useNavigation();

  // Handle navigation to other screens from the profile tab
  const handleNavigateToProfileView = (userId) => {
    navigation.navigate('ProfileView', { userId });
  };

  const handleNavigateToSettings = () => {
    // Navigate to settings when implemented
    console.log('Navigate to settings');
  };

  return (
    <View style={styles.container}>
      <Profile 
        onNavigateToProfileView={handleNavigateToProfileView}
        onNavigateToSettings={handleNavigateToSettings}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
  },
});

export default ProfileTabScreen; 