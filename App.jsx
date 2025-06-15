import {SafeAreaView, StyleSheet} from 'react-native';
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Splash from './src/screens/Splash/Splash';
import Register from './src/screens/Register/Register';
import Home from './src/screens/Home/Home';
import {NavigationContainer} from '@react-navigation/native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Paths} from './src/navigaton/paths';
import Start from './src/screens/Start/Start';
import {Provider, useSelector} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {persistor, store} from './src/redux/store';
import ContactChat from './src/screens/ContactChat/ContactChat';
import AddContact from './src/screens/AddContact/AddContact';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import FriendRequests from './src/screens/FriendRequests/FriendRequests';
import {PaperProvider} from 'react-native-paper';
import CustomSnackbar from './src/components/Snackbar/CustomSnackbar';
import Profile from './src/screens/Profile/Profile';
import {SocketProvider} from './src/context/SocketContext';

export const queryClient = new QueryClient();

const Stack = createNativeStackNavigator();

const AppStack = () => {
  const token = useSelector(state => state.auth.token);
  return (
    <SocketProvider token={token}>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name={Paths.HOME} component={Home} />
        <Stack.Screen name={Paths.CONTACT_CHAT} component={ContactChat} />
        <Stack.Screen name={Paths.ADD_CONTACT} component={AddContact} />
        <Stack.Screen name={Paths.FRIEND_REQUESTS} component={FriendRequests} />
        <Stack.Screen name={Paths.PROFILE} component={Profile} />
      </Stack.Navigator>
    </SocketProvider>
  );
};

const AuthStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name={Paths.SPLASH} component={Splash} />
    <Stack.Screen name={Paths.START} component={Start} />
    <Stack.Screen name={Paths.REGISTER} component={Register} />
  </Stack.Navigator>
);

const RootNavigator = () => {
  const token = useSelector(state => state.auth.token);

  return (
    <NavigationContainer>
      {token ? <AppStack /> : <AuthStack />}
      <CustomSnackbar />
    </NavigationContainer>
  );
};

const App = () => {
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
