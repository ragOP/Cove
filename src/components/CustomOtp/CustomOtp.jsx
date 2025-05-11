import {StyleSheet} from 'react-native';
import React from 'react';
import {OtpInput} from 'react-native-otp-entry';

const CustomOtp = ({
  numberOfDigits = 6,
  focusColor = '#fff',
  autoFocus = true,
  hideStick = true,
  placeholder = '',
  blurOnFilled = true,
  disabled = false,
  type = 'numeric',
  secureTextEntry = false,
  focusStickBlinkingDuration = 500,
  onFocus,
  onBlur,
  onTextChange,
  onFilled,
  textInputProps,
  textProps,
  theme,
}) => {
  return (
    <OtpInput
      numberOfDigits={numberOfDigits}
      focusColor={focusColor}
      autoFocus={autoFocus}
      hideStick={hideStick}
      placeholder={placeholder}
      blurOnFilled={blurOnFilled}
      disabled={disabled}
      type={type}
      secureTextEntry={secureTextEntry}
      focusStickBlinkingDuration={focusStickBlinkingDuration}
      onFocus={onFocus}
      onBlur={onBlur}
      onTextChange={onTextChange}
      onFilled={onFilled}
      textInputProps={textInputProps}
      textProps={textProps}
      theme={{
        containerStyle: styles.container,
        pinCodeContainerStyle: styles.pinCodeContainer,
        pinCodeTextStyle: styles.pinCodeText,
        focusStickStyle: styles.focusStick,
        focusedPinCodeContainerStyle: styles.activePinCodeContainer,
        placeholderTextStyle: styles.placeholderText,
        filledPinCodeContainerStyle: styles.filledPinCodeContainer,
        disabledPinCodeContainerStyle: styles.disabledPinCodeContainer,
        ...theme,
      }}
    />
  );
};

export default CustomOtp;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  pinCodeContainer: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#765152',
  },
  pinCodeText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
  focusStick: {
    height: 2,
    backgroundColor: '#765152',
    marginTop: 5,
  },
  activePinCodeContainer: {
    borderColor: '#fff',
    borderWidth: 3,
  },
  placeholderText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
  filledPinCodeContainer: {
    backgroundColor: '#765152',
    borderWidth: 0,
  },
  disabledPinCodeContainer: {
    backgroundColor: '#765152',
    borderColor: '#fff',
  },
});
