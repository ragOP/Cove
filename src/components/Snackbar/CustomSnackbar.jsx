import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, View, Platform} from 'react-native';
import {Portal, Text, TouchableRipple} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {hideSnackbar} from '../../redux/slice/snackbarSlice';
import {getZIndexStyle} from '../../utils/zIndex';

const getSnackbarStyle = (type = 'info') => {
  switch (type) {
    case 'success':
      return {backgroundColor: '#4BB543'};
    case 'error':
      return {backgroundColor: '#D32F2F'};
    case 'info':
    default:
      return {backgroundColor: '#1976D2'};
  }
};

const CustomSnackbar = () => {
  const dispatch = useDispatch();
  const {
    visible,
    type,
    title,
    subtitle,
    duration = 3000,
    placement = 'bottom',
  } = useSelector(state => state.snackbar);

  const translateY = useRef(
    new Animated.Value(placement === 'top' ? -100 : 100),
  ).current;

  useEffect(() => {
    const initialValue = placement === 'top' ? -100 : 100;
    const finalValue = 0;
    const exitValue = initialValue;
    if (visible) {
      translateY.setValue(initialValue);
      Animated.spring(translateY, {
        toValue: finalValue,
        useNativeDriver: true,
      }).start();

      const timeout = setTimeout(() => {
        Animated.timing(translateY, {
          toValue: exitValue,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          dispatch(hideSnackbar());
        });
      }, duration);

      return () => clearTimeout(timeout);
    }
  }, [dispatch, visible, placement, duration, translateY]);

  if (!visible) {
    return null;
  }

  const containerStyle =
    placement === 'top'
      ? {
          top: Platform.OS === 'ios' ? 60 : 40,
        }
      : {
          bottom: 40,
        };

  return (
    <Portal>
      <Animated.View
        style={[
          styles.snackbarContainer,
          containerStyle,
          {
            transform: [{translateY}],
          },
        ]}>
        <TouchableRipple
          onPress={() => dispatch(hideSnackbar())}
          style={[styles.snackbar, getSnackbarStyle(type ?? 'info')]}>
          <View>
            {title ? <Text style={styles.title}>{title}</Text> : null}
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        </TouchableRipple>
      </Animated.View>
    </Portal>
  );
};

const styles = StyleSheet.create({
  snackbarContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    ...getZIndexStyle('SNACKBAR'),
    borderRadius: 8,
  },
  snackbar: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 4,
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  subtitle: {
    color: '#fff',
    fontSize: 14,
    marginTop: 2,
  },
});

export default CustomSnackbar;
