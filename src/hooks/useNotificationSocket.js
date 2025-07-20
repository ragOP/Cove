import {useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {showSnackbar} from '../redux/slice/snackbarSlice';
import {useSocketContext} from '../context/SocketContext';
import {useNavigation} from '@react-navigation/native';

const notificationTypeToRedirect = {
  friend_request_accepted: 'Friends',
  friend_request_received: 'FriendRequests',
};

export default function useNotificationSocket() {
  const dispatch = useDispatch();
  const socket = useSocketContext();
  const navigation = useNavigation();

  useEffect(() => {
    if (!socket) {
      return;
    }

    console.log('LISTENING TO NOTIFICATION');

    const handleNotification = data => {
      console.info('[NOTIFICATION] Connected:', data);

      if (!data?.data) {
        return;
      }

      const notificationData = data?.data;

      dispatch(
        showSnackbar({
          type: 'info',
          title: notificationData?.title,
          subtitle: notificationData?.body,
          placement: 'top',
          onPress: () => {
            const redirect = notificationTypeToRedirect[notificationData.type];
            if (redirect) {
              navigation.navigate(redirect);
            }
          },
        }),
      );
    };

    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
    };
  }, [socket, dispatch, navigation]);
}
