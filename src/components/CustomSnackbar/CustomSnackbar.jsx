import React from 'react';
import {StyleSheet} from 'react-native';
import {Snackbar} from 'react-native-paper';

const CustomSnackbar = ({
  visible,
  message,
  onDismiss,
  duration = 3000,
  style = {},
  type = 'info',
}) => {
  const getSnackbarStyle = () => {
    switch (type) {
      case 'success':
        return styles.positiveSnackbar;
      case 'error':
        return styles.negativeSnackbar;
      case 'info':
      default:
        return styles.infoSnackbar;
    }
  };

  return (
    <Snackbar
      visible={visible}
      onDismiss={onDismiss}
      duration={duration}
      style={[getSnackbarStyle(), style]}>
      {message}
    </Snackbar>
  );
};

export default CustomSnackbar;

const styles = StyleSheet.create({
  positiveSnackbar: {
    backgroundColor: '#4CAF50',
  },
  negativeSnackbar: {
    backgroundColor: '#E53935',
  },
  infoSnackbar: {
    backgroundColor: '#2196F3',
  },
});
