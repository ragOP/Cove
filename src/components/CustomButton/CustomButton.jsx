import {StyleSheet, Text, TouchableOpacity} from 'react-native';

const CustomButton = ({onClick, title, style, textStyle}) => {
  return (
    <TouchableOpacity
      style={[styles.buttonContainer, style]}
      onPress={onClick}
      accessibilityLabel={title}>
      <Text style={[styles.buttonText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  buttonContainer: {
    display: 'flex',
    backgroundColor: '#D28A8C',
    borderRadius: 60,
    paddingVertical: 12,
    paddingHorizontal: 30,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
