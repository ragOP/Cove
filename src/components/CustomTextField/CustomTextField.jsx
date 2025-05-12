import {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {TextInput} from 'react-native-gesture-handler';

const CustomTextInput = ({
  placeholder = 'Enter text',
  onChangeText,
  value,
  autoFocus = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View
      style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
      ]}>
      <TextInput
        style={styles.textInput}
        value={value}
        placeholder={placeholder}
        keyboardType="default"
        onChangeText={onChangeText}
        placeholderTextColor="rgba(255, 255, 255, 0.35)"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoFocus={autoFocus}
      />
    </View>
  );
};

export default CustomTextInput;

const styles = StyleSheet.create({
  inputContainer: {
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: '#765152',
    overflow: 'hidden',
  },
  inputContainerFocused: {
    borderColor: '#fff',
  },
  textInput: {
    color: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    fontSize: 16,
  },
});
