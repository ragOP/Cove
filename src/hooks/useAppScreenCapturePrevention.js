import {useEffect} from 'react';
import {Platform, Alert} from 'react-native';
import {CaptureProtection} from 'react-native-capture-protection';

const useAppScreenCapturePrevention = () => {
  useEffect(() => {
    CaptureProtection.prevent();

  }, []);
};

export default useAppScreenCapturePrevention;
