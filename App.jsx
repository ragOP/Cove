import {StyleSheet} from 'react-native';
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

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{headerShown: false}}
            initialRouteName={Paths.SPLASH}>
            <Stack.Screen name={Paths.SPLASH} component={Splash} />
            <Stack.Screen name={Paths.START} component={Start} />
            <Stack.Screen name={Paths.REGISTER} component={Register} />
            <Stack.Screen name={Paths.HOME} component={Home} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
