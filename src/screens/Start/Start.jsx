import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Paths} from '../../navigaton/paths';
import {useNavigation} from '@react-navigation/native';
import UserAgreementFooter from '../../components/Footer/UserAgreementFooter';

const Start = () => {
  const navigation = useNavigation();

  const onRegisterPage = () => {
    navigation.navigate(Paths.REGISTER);
  };

  return (
    <LinearGradient
      colors={['#D28A8C', '#281E14']}
      style={styles.container}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}>
      <View style={styles.containerInner}>
        <View style={styles.logoContainer}>
          <Image
            source={require('./../../assets/images/brand-logo.png')}
            style={styles.logo}
          />
        </View>

        <View style={styles.welcomeTextContainer}>
          <Text style={styles.welcomeText}>Hello</Text>
          <Text style={styles.welcomeText}>Welcome to Cove</Text>
          <Text style={styles.welcomeText}>Your safe space</Text>
        </View>

        <View style={styles.authTypeContainer}>
          <TouchableOpacity
            style={[styles.phoneNumberButton]}
            onPress={onRegisterPage}
            accessibilityLabel="Sign in with Phone Number">
            <Text style={styles.phoneNumberButtonText}>
              Sign in with Phone Number
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.outlinedButton]}
            onPress={() => {}}
            accessibilityLabel="Continue with Google">
            <Text style={styles.outlinedButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.outlinedButton]}
            onPress={() => {}}
            accessibilityLabel="Continue with Apple">
            <Text style={styles.outlinedButtonText}>Continue with Apple</Text>
          </TouchableOpacity>
        </View>
      </View>

      <UserAgreementFooter />
    </LinearGradient>
  );
};

export default Start;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 20,
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  containerInner: {
    flex: 1,
    gap: 20,
    width: '100%',
    alignItems: 'center',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 70,
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
  welcomeTextContainer: {
    // marginVertical: 20,
    width: '80%',
  },
  welcomeText: {
    fontFamily: 'Sansita-BoldItalic',
    fontWeight: '400',
    fontSize: 30,
    lineHeight: 40,
    letterSpacing: 0,
    color: '#fff',
  },
  authTypeContainer: {
    display: 'flex',
    gap: 16,
    width: '80%',
    marginTop: 30,
  },
  phoneNumberButton: {
    backgroundColor: '#D28A8C',
    borderRadius: 100,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  phoneNumberButtonText: {
    color: '#fff',
    fontWeight: 600,
    fontSize: 14,
    lineHeight: 22,
  },
  outlinedButton: {
    backgroundColor: '#fff',
    borderRadius: 100,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  outlinedButtonText: {
    color: '#000',
    fontWeight: 600,
    fontSize: 14,
    lineHeight: 22,
  },
});
