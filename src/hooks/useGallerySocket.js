import {useEffect} from 'react';
import {useSocketContext} from '../context/SocketContext';
import {useSelector} from 'react-redux';
import {selectUser} from '../redux/slice/authSlice';

export default function useGallerySocket({
  onGalleryMessageDeleted,
  onNewGalleryMessage,
}) {
  const socket = useSocketContext();
  const user = useSelector(selectUser);
  const id = user?.id;

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleGalleryMessageDeleted = data => {
      console.info('[GALLERY MESSAGE DELETED]', data);
      if (data?.success && data?.data && Array.isArray(data.data)) {
        onGalleryMessageDeleted?.(data);
      }
    };

    const handleNewGalleryMessage = data => {
      console.info('[NEW GALLERY MESSAGE]', data);
      if (data?.success && data?.data && data?.data?._id) {
        onNewGalleryMessage?.(data);
      }
    };

    socket.on('gallery_message_deleted', handleGalleryMessageDeleted);
    socket.on('new_gallery_message', handleNewGalleryMessage);

    return () => {
      socket.off('gallery_message_deleted', handleGalleryMessageDeleted);
      socket.off('new_gallery_message', handleNewGalleryMessage);
    };
  }, [socket, onGalleryMessageDeleted, onNewGalleryMessage]);

  return {socket};
}
