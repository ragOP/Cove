import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from 'react-native';

const ImageWithLink = () => {
  const openURL = async () => {
    const url = 'https://github.com/facebook/react-native'; // Open-source URL
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      alert(`Can't open URL: ${url}`);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={{uri: 'https://reactnative.dev/img/tiny_logo.png'}}
        style={styles.image}
      />
      <TouchableOpacity onPress={openURL}>
        <Text style={styles.linkText}>Visit React Native GitHub</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 50,
  },
  image: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  linkText: {
    color: '#1e90ff',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default ImageWithLink;
