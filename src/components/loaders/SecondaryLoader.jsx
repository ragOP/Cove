import React from 'react';
import {View, StyleSheet} from 'react-native';
import PrimaryLoader from './PrimaryLoader';

const SecondaryLoader = ({size = 'small', style = {}}) => (
  <View style={[styles.container, style]}>
    <PrimaryLoader size={size} />
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
