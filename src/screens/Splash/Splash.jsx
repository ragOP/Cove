import React from 'react';
import {StyleSheet, View, Image, Text, TouchableOpacity} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
// import Icon from 'react-native-vector-icons/FontAwesome5';
import {useNavigation} from '@react-navigation/native';
import {Paths} from '../../navigaton/paths';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Splash = () => {
  const navigation = useNavigation();

  const onNextPress = () => {
    navigation.navigate(Paths.START);
  };

  return (
    <LinearGradient
      colors={['#D28A8C', '#281E14']}
      style={styles.container}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}>
      <View style={styles.logoContainer}>
        <Image
          source={require('./../../assets/images/brand-logo.png')}
          style={styles.logo}
        />
        <Text style={styles.text}>Connect and Communicate!</Text>
      </View>

      <TouchableOpacity onPress={onNextPress} style={styles.iconContainer}>
        <Icon name="arrow-right" size={30} color="#fff" />
      </TouchableOpacity>
    </LinearGradient>
  );
};

export default Splash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  text: {
    marginTop: 20,
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  iconContainer: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 15,
    borderRadius: 50,
  },
});
