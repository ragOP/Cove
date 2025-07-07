import React, { useState } from 'react';
import { View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

/**
 * ImagePlaceholder - For use when an image fails to load or as a generic placeholder.
 * Usage: For fallback UI, not for standard images.
 */
const ImagePlaceholder = ({ style, iconSize = 40 }) => (
  <View style={[style, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#232323' }]}>
    <Icon name="image" size={iconSize} color="#bbb" />
  </View>
);

export default ImagePlaceholder;
