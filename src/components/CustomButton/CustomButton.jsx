import {StyleSheet, Text, TouchableOpacity} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';

export const START = 'start';
export const END = 'end';

const CustomButton = ({
  onClick,
  title,
  style,
  textStyle,
  isLoading = false,
  loadingPlacement = END,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[styles.buttonContainer, style]}
      onPress={onClick}
      disabled={disabled}
      accessibilityLabel={title}>
      {isLoading && loadingPlacement === START && (
        <ActivityIndicator size="small" color="#fff" />
      )}
      <Text style={[styles.buttonText, textStyle]}>{title}</Text>
      {isLoading && loadingPlacement === END && (
        <ActivityIndicator size="small" color="#fff" />
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#D28A8C',
    borderRadius: 60,
    paddingVertical: 12,
    paddingHorizontal: 30,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
