import React from 'react';
import {View, StyleSheet} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';

const PrimaryLoader = ({size = 'large', style = {}, color = '#D28A8C'}) => (
  <View style={[styles.container, style]}>
    <ActivityIndicator size={size} color={color} />
  </View>
);

export default PrimaryLoader;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});
