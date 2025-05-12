import React, {forwardRef} from 'react';
import {StyleSheet} from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import Icon from 'react-native-vector-icons/Ionicons';

const CustomPhoneInput = forwardRef(
  (
    {value, onChangeText, defaultCode = 'IN', autoFocus, maxLength = 15},
    ref,
  ) => {
    const handleTextChange = text => {
      const sanitizedText = text.replace(/[^0-9]/g, '');
      onChangeText(sanitizedText);
    };

    return (
      <PhoneInput
        ref={ref}
        value={value}
        defaultValue={value}
        defaultCode={defaultCode}
        layout="second"
        onChangeText={handleTextChange}
        renderDropdownImage={
          <Icon name="chevron-down" size={20} color="#fff" />
        }
        textInputProps={{
          placeholderTextColor: '#fff',
          cursorColor: '#fff',
          keyboardType: 'phone-pad',
          autoFocus: autoFocus,
          maxLength: maxLength,
        }}
        countryPickerProps={{withFlag: false}}
        withDarkTheme
        withShadow
        autoFocus
        containerStyle={styles.phoneInputLibContainer}
        textContainerStyle={styles.textInputContainer}
        textInputStyle={styles.textInputStyle}
        codeTextStyle={styles.codeTextStyle}
      />
    );
  },
);

export default CustomPhoneInput;

const styles = StyleSheet.create({
  phoneInputLibContainer: {
    borderRadius: 70,
    overflow: 'hidden',
    // height: 70,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    margin: 0,
    background: '#765152',
    backgroundColor: '#765152',
    color: '#fff',
  },
  textInputContainer: {
    padding: 0,
    backgroundColor: '#765152',
    background: '#765152',
    color: '#fff',
    margin: 0,
  },
  textInputStyle: {
    color: '#fff',
    margin: 0,
  },
  codeTextStyle: {
    color: '#fff',
    marginLeft: 20,
  },
});
