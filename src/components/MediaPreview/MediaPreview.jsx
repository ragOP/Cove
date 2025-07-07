import React, { useRef } from 'react';
import { Modal, View, StyleSheet, Dimensions, Platform, Animated } from 'react-native';
import { PanGestureHandler, PinchGestureHandler, State } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const MediaPreview = ({ visible, media, onClose }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const lastScale = useRef(1);
  const lastTranslateY = useRef(0);

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onPinchEvent = Animated.event(
    [{ nativeEvent: { scale: scale } }],
    { useNativeDriver: true }
  );

  const handlePanStateChange = event => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      if (Math.abs(event.nativeEvent.translationY) > 120) {
        Animated.timing(translateY, {
          toValue: event.nativeEvent.translationY > 0 ? height : -height,
          duration: 180,
          useNativeDriver: true,
        }).start(onClose);
      } else {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  const handlePinchStateChange = event => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      lastScale.current *= event.nativeEvent.scale;
      scale.setValue(lastScale.current);
    }
  };

  if (!media) return null;
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={handlePanStateChange}
        >
          <Animated.View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', transform: [{ translateY }] }}>
            <PinchGestureHandler
              onGestureEvent={onPinchEvent}
              onHandlerStateChange={handlePinchStateChange}
            >
              <Animated.Image
                source={{ uri: media.uri }}
                style={[
                  styles.media,
                  { transform: [{ scale }] },
                ]}
                resizeMode="contain"
              />
            </PinchGestureHandler>
            <Animated.View style={styles.closeBtnWrap}>
              <Icon name="close" size={36} color="#fff" onPress={onClose} style={styles.closeBtn} />
            </Animated.View>
          </Animated.View>
        </PanGestureHandler>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.98)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  media: {
    width: width,
    height: height,
    maxWidth: width,
    maxHeight: height,
  },
  closeBtnWrap: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 30,
    right: 24,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 4,
  },
  closeBtn: {
    alignSelf: 'flex-end',
  },
});

export default MediaPreview;
