import { SafeAreaView, StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Splash from './src/screens/Splash/Splash';
import Register from './src/screens/Register/Register';
import Home from './src/screens/Home/Home';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Paths } from './src/navigaton/paths';
import Start from './src/screens/Start/Start';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from './src/redux/store';
import ContactChat from './src/screens/ContactChat/ContactChat';
import AddContact from './src/screens/AddContact/AddContact';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import FriendRequests from './src/screens/FriendRequests/FriendRequests';
import { PaperProvider } from 'react-native-paper';
import CustomSnackbar from './src/components/Snackbar/CustomSnackbar';
import Profile from './src/screens/Profile/Profile';
import ProfileViewScreen from './src/screens/Profile/ProfileViewScreen';
import { SocketProvider } from './src/context/SocketContext';
import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';
import useNotificationSocket from './src/hooks/useNotificationSocket';

export const queryClient = new QueryClient();

const Stack = createNativeStackNavigator();

const AppStack = () => {
  useNotificationSocket();

  async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.info('Authorization status:', authStatus);
    }
  }

  useEffect(() => {
    requestUserPermission();
  }, []);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={Paths.HOME} component={Home} />
      <Stack.Screen name={Paths.CONTACT_CHAT} component={ContactChat} />
      <Stack.Screen name={Paths.ADD_CONTACT} component={AddContact} />
      <Stack.Screen name={Paths.FRIEND_REQUESTS} component={FriendRequests} />
      <Stack.Screen name={Paths.PROFILE} component={Profile} />
      <Stack.Screen name="ProfileView" component={ProfileViewScreen} />
    </Stack.Navigator>
  );
};

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={Paths.SPLASH} component={Splash} />
    <Stack.Screen name={Paths.START} component={Start} />
    <Stack.Screen name={Paths.REGISTER} component={Register} />
  </Stack.Navigator>
);

const RootNavigator = () => {
  const token = useSelector(state => state.auth.token);

  return (
    <NavigationContainer>
      {token ? (
        <SocketProvider token={token}>
          <AppStack />
        </SocketProvider>
      ) : (
        <AuthStack />
      )}
      <CustomSnackbar />
    </NavigationContainer>
  );
};

const requestNotificationPermission = async () => {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.warn('Notification permission not granted');
      }
    } catch (err) {
      console.warn('Notification permission error:', err);
    }
  }
};

const App = () => {
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <GestureHandlerRootView style={styles.container}>
            <SafeAreaProvider>
              <SafeAreaView style={styles.safeAreaContainer}>
                <PaperProvider>
                  <RootNavigator />
                </PaperProvider>
              </SafeAreaView>
            </SafeAreaProvider>
          </GestureHandlerRootView>
        </PersistGate>
      </Provider>
    </QueryClientProvider>
  );
};

export default App;

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});
