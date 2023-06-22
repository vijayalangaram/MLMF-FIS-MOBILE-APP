/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import crashlytics from '@react-native-firebase/crashlytics';
import messaging from '@react-native-firebase/messaging';
import React from "react";
import { AppState, Linking, LogBox, Platform, StatusBar } from "react-native";
import { setJSExceptionHandler, setNativeExceptionHandler } from 'react-native-exception-handler';
import KeyboardManager from 'react-native-keyboard-manager';
import { Notifier, NotifierWrapper } from 'react-native-notifier';
import { Provider } from "react-redux";
import { combineReducers, createStore } from "redux";
import EDCustomAlert from './app/components/EDCustomAlert';
import RootNavigator_FUNCTION, { AppNavigator } from './app/components/RootNavigator';
import { setI18nConfig, strings } from "./app/locales/i18n";
import { navigationOperation } from "./app/redux/reducers/NavigationReducer";
import { userOperations } from "./app/redux/reducers/UserReducer";
import { showTopDialogue, showUpdateDialogue } from "./app/utils/EDAlert";
import { EDColors } from './app/utils/EDColors';
import { APP_NAME, debugLog, isRTLCheck, ORDER_TYPE } from "./app/utils/EDConstants";
import NavigationService from "./NavigationService";
import AsyncStorage from '@react-native-async-storage/async-storage'
import deviceInfoModule from 'react-native-device-info';
import { saveUpdateAlert, saveAppUpdatePrompt } from './app/redux/actions/User';
import { NavigationContainer } from '@react-navigation/native';
import Context from './Context'
import EDUpdateAlert from './app/components/EDUpdateAlert';
import BackgroundService from 'react-native-background-actions';
import { getLanguage } from './app/utils/AsyncStorageHelper';
import I18n from 'i18n-js';
import SplashScreen from 'react-native-splash-screen';


const rootReducer = combineReducers({
  userOperations: userOperations,
  navigationReducer: navigationOperation,
});


export const eatanceGlobalStore = createStore(rootReducer);

// Handle JS exceptions
const exceptionhandler = (error, isFatal) => {
  debugLog("JS ERROR :::::", error)
  if (error !== undefined && error.stack !== undefined) {
    showTopDialogue(strings("webServiceError"), true)
    crashlytics().log(error.message)
    crashlytics().recordError(error)
  }


};
setJSExceptionHandler(exceptionhandler, true);

// Handle native exceptions

setNativeExceptionHandler(exceptionString => {
  showTopDialogue(strings("webServiceError"), true)
  crashlytics().log(exceptionString)
  crashlytics().recordError(exceptionString)
});


export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.isNotification = undefined;

  }

  state = {
    isRefresh: false,
    key: 1,
    appState: AppState.currentState

  };

  async checkPermission() {
    const enabled = await messaging().hasPermission();
    if (enabled) {
      this.getToken();
    } else {
      this.requestPermission();
    }
  }

  async getToken() {
    fcmToken = await messaging().getToken();
  }

  async requestPermission() {
    try {
      await messaging().requestPermission();
      this.getToken();
    } catch (error) {
    }
  }

  async createNotificationListeners() {

    // FOR NOTIFICATION


    //   /*
    //    * Triggered when a particular notification has been received in foreground
    //    * */
    messaging().onMessage(async remoteMessage => {
      let currentRoute = NavigationService.getCurrentRoute()
      if (remoteMessage.data !== undefined && remoteMessage.data !== null && remoteMessage.data.screenType !== undefined) {
        debugLog("REMOTE MSG :::::::::::::::::::::::::::::::::::::::", remoteMessage, currentRoute)
        if (currentRoute == "HomeContainer" && remoteMessage.data.screenType == "order") {
          this.setState({ key: this.state.key + 1 })
          Notifier.showNotification({
            title: remoteMessage.notification.title || APP_NAME,
            description: remoteMessage.notification.body,
            showAnimationDuration: 800,
            onHidden: () => console.log('Hidden'),
            onPress: () => console.log('Press'),
            hideOnPress: false,
            componentProps: {
              titleStyle: {
                color: EDColors.primary
              },
            }
          });
        }
        else {

          Notifier.showNotification({
            title: remoteMessage.notification.title || APP_NAME,
            description: remoteMessage.notification.body,
            showAnimationDuration: 800,
            duration: 0,

            onHidden: () => console.log('Hidden'),
            onPress: () => {
              if (remoteMessage.data.screenType == "order")
                NavigationService.navigate(isRTLCheck() ? "homeRight" : "home")
            },
            hideOnPress: true,
            componentProps: {
              titleStyle: {
                color: EDColors.primary
              },
            }
          });
        }
      }
    });

    //   /*
    //    * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
    //    * */
    messaging().onNotificationOpenedApp(remoteMessage => {

      let currentRoute = NavigationService.getCurrentRoute()
      if (currentRoute == "HomeContainer" && remoteMessage.data.screenType == "order") {
        this.setState({ key: this.state.key + 1 })
      }
      else {
        if (remoteMessage.data !== undefined && remoteMessage.data !== null && remoteMessage.data.screenType !== undefined) {
          if (remoteMessage.data.screenType == "order")
            NavigationService.navigate(isRTLCheck() ? "homeRight" : "home")
        }
      }
    });


    //   /*
    //    * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
    //    * */
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {

          const lastNotification = AsyncStorage.getItem("lastNotification");
          console.log("NOTIFICATION FROM SLEEPING::", remoteMessage.messageId, lastNotification)
          if (lastNotification !== remoteMessage.messageId) {
            if (remoteMessage.data !== undefined && remoteMessage.data !== null && remoteMessage.data.screenType !== undefined) {
              if (remoteMessage.data.screenType === "order") {
                this.isNotification = ORDER_TYPE;
                this.setState({ isRefresh: this.state.isRefresh ? false : true });
              }
            }
            AsyncStorage.setItem("lastNotification", remoteMessage.messageId);
          }
        }
      });
  }


  _handleAppStateChange = (nextAppState) => {
    if (nextAppState === 'active') {
      eatanceGlobalStore.dispatch(
        saveUpdateAlert(undefined)
      )
      eatanceGlobalStore.dispatch(
        saveAppUpdatePrompt(false)
      )
    }
    this.setState({ appState: nextAppState });
  }

  /** //#region 
 * GET LANGAGE FROM ASYNC AND SAVE IN REDUX
 */
  async saveLanguage() {
    await getLanguage(
      success => {
        let lan = I18n.currentLocale()
        if (success != null && success != undefined) {
          lan = success
          I18n.locale = success;
          setI18nConfig(lan)
        } else {
          lan = "en"
          I18n.locale = "en";
          setI18nConfig("en")

        }
      }, failure => {

      }
    )
  }
  //#endregion

  async componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
    await BackgroundService.stop();
  }
  async componentDidMount() {
    if (Platform.OS == "ios") {
      SplashScreen.hide()
    }
    AppState.addEventListener('change', this._handleAppStateChange);
    setTimeout(() => {
      eatanceGlobalStore.dispatch(
        saveAppUpdatePrompt(false)
      )
    }, 2000)
    await this.saveLanguage()


    if (Platform.OS === 'ios') {
      KeyboardManager.setEnable(true)
      KeyboardManager.setEnableDebugging(false)
      KeyboardManager.setKeyboardDistanceFromTextField(20)
      // KeyboardManager.setPreventShowingBottomBlankSpace(true)
      KeyboardManager.setEnableAutoToolbar(true)
      KeyboardManager.setToolbarDoneBarButtonItemText('Done')
      // KeyboardManager.setToolbarManageBehaviour(0)
      KeyboardManager.setToolbarPreviousNextButtonEnable(true)
      KeyboardManager.setShouldToolbarUsesTextFieldTintColor(true)
      KeyboardManager.setShouldShowToolbarPlaceholder(true)
      KeyboardManager.setOverrideKeyboardAppearance(true)
      KeyboardManager.setShouldResignOnTouchOutside(true)
    }
    // Disable console print in release
    if (!__DEV__)
      console.log = () => null

    // Disable yellowbox
    LogBox.ignoreAllLogs()

    // Check firebase permission
    this.checkPermission();

    //Create notification listener
    this.createNotificationListeners();

    eatanceGlobalStore.subscribe(this.checkForUpdates)

  }
  updateFromStore = (app_link, is_forced = false) => {
    if (app_link !== undefined && app_link !== null && app_link.trim().length !== null) {
      if (Linking.canOpenURL(app_link)) {
        Linking.openURL(app_link).then(() => {
          eatanceGlobalStore.dispatch(
            saveUpdateAlert(undefined)
          )
          if (is_forced)
            eatanceGlobalStore.dispatch(
              saveAppUpdatePrompt(false)
            )
        }
        ).catch(
          () => {
            showTopDialogue(strings('webServiceError'), true)
          }
        )
      }
      else {
        showTopDialogue(strings('webServiceError'), true)
      }
    }
  }
  checkForUpdates = () => {
    let appVersion = eatanceGlobalStore.getState().userOperations.appVersion
    let isPrompted = eatanceGlobalStore.getState().userOperations.updatePrompt


    if (appVersion !== undefined && appVersion.app_live_version !== undefined) {
      let currentVersion = deviceInfoModule.getVersion()

      if (!isPrompted) {
        if (parseFloat(currentVersion) < parseFloat(appVersion.app_live_version)) {
          eatanceGlobalStore.dispatch(
            saveAppUpdatePrompt(true)
          )
          if (parseFloat(currentVersion) < parseFloat(appVersion.app_force_version)) {
            showUpdateDialogue(
              strings('forceUpdate'),
              strings('appName'),

              [],
              () => { this.updateFromStore(appVersion.app_url, true) },
              strings('updateTitle'),

            );
          }
          else {
            showUpdateDialogue(
              strings('updateApp'),
              strings('appName'),
              [{
                text: strings('cancel'), onPress: () => {

                },
                isNotPreferred: true
              }],
              () => { this.updateFromStore(appVersion.app_url) },
              strings('updateTitle'),

            );

          }

        }
        else {
          eatanceGlobalStore.dispatch(
            saveAppUpdatePrompt(true)
          )
          eatanceGlobalStore.dispatch(
            saveUpdateAlert(undefined)
          )
        }
      }
    }
  }


  render() {
    return (
      <Provider store={eatanceGlobalStore}>
        <StatusBar backgroundColor={EDColors.primary} barStyle='light-content' />
        <NotifierWrapper>
          <Context.Provider
            value={
              { notificationSlug: this.isNotification, isRefresh: this.state.key }
            }
          >
            <NavigationContainer
              ref={navigatorRef => {
                NavigationService.setTopLevelNavigator(navigatorRef);
              }}
            >
              <RootNavigator_FUNCTION />
            </NavigationContainer>
          </Context.Provider>
        </NotifierWrapper>
        <EDCustomAlert />
        <EDUpdateAlert />
      </Provider>
    );
  }
}

