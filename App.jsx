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
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {persistor, store} from './src/redux/store';
import ContactChat from './src/screens/ContactChat/ContactChat';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <GestureHandlerRootView style={styles.container}>
          <SafeAreaProvider>
            <SafeAreaView style={styles.safeAreaContainer}>
              <NavigationContainer>
                <Stack.Navigator
                  screenOptions={{headerShown: false}}
                  initialRouteName={Paths.Home}>
                  {/* initialRouteName={Paths.SPLASH}> */}
                  <Stack.Screen name={Paths.HOME} component={Home} />
                  <Stack.Screen name={Paths.SPLASH} component={Splash} />
                  <Stack.Screen name={Paths.START} component={Start} />
                  <Stack.Screen name={Paths.REGISTER} component={Register} />
                  <Stack.Screen
                    name={Paths.CONTACT_CHAT}
                    component={ContactChat}
                  />
                </Stack.Navigator>
              </NavigationContainer>
            </SafeAreaView>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </PersistGate>
    </Provider>
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
