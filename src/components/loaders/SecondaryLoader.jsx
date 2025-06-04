import React from 'react';
import {View, StyleSheet} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';

const SecondaryLoader = ({size = 'small', style = {}}) => (
  <View style={[styles.container, style]}>
    <ActivityIndicator size={size} color="#fff" />
  </View>
);

export default SecondaryLoader;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});
