import SoundPlayer from 'react-native-sound-player';

export function playSoundEffect(type) {
  let fileName;
  if (type === 'send') {
    fileName = 'send.mp3';
  } else if (type === 'receive') {
    fileName = 'receive.mp3';
  } else {
    return;
  }
  try {
    SoundPlayer.playSoundFile(fileName.replace('.mp3', ''), 'mp3');
  } catch (e) {
    console.log('Cannot play the sound', e);
  }
}
