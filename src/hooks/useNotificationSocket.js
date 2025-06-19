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

    console.log('[NOTIFICATION SOCKET] Connected:', socket.connected);

    const handleNotification = data => {
      if (!data?.notification) {
        return;
      }

      dispatch(
        showSnackbar({
          type: 'info',
          title: data?.title,
          subtitle: data?.body,
          placement: 'top',
          onPress: () => {
            const redirect = notificationTypeToRedirect[data.type];
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
