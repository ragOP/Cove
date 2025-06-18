import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import {Text} from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import HomeStyles from '../styles/HomeStyles';

const SelectedContactBar = ({selectedContacts, onClose, onDelete, onFavorite}) => {
  if (!selectedContacts || selectedContacts.length === 0) {
    return null;
  }
  return (
    <View style={HomeStyles.selectedBarContainer}>
      <TouchableOpacity onPress={onClose} style={HomeStyles.iconBtn}>
        <Icon name="close" size={24} color="#fff" />
      </TouchableOpacity>
      <View style={HomeStyles.selectedContactInfoCount}>
        <Text style={HomeStyles.selectedContactCount}>
          {selectedContacts.length}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => onFavorite(selectedContacts)}
        style={HomeStyles.iconBtn}>
        <Icon name="star-outline" size={22} color="#D28A8C" />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onDelete(selectedContacts)}
        style={HomeStyles.iconBtn}>
        <Icon name="trash" size={22} color="#f55" />
      </TouchableOpacity>
    </View>
  );
};

export default SelectedContactBar;
