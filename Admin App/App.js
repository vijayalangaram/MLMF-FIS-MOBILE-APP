/* eslint-disable comma-dangle */
/* eslint-disable no-undef */
/* eslint-disable eqeqeq */
/* eslint-disable keyword-spacing */
/* eslint-disable no-trailing-spaces */
/* eslint-disable quotes */
/* eslint-disable semi */
/* eslint-disable prettier/prettier */
import AsyncStorage from '@react-native-async-storage/async-storage'
import crashlytics from '@react-native-firebase/crashlytics'
import messaging from '@react-native-firebase/messaging'
import { NavigationContainer } from "@react-navigation/native"
import React, { Component } from 'react'
import { AppState, Linking, LogBox, Platform, StatusBar } from 'react-native'
import deviceInfoModule from 'react-native-device-info'
import { setJSExceptionHandler, setNativeExceptionHandler } from 'react-native-exception-handler'
import KeyboardManager from 'react-native-keyboard-manager'
import { Notifier, NotifierWrapper } from 'react-native-notifier'
import { Provider } from 'react-redux'
import { combineReducers, createStore } from 'redux'
import EDCustomAlert from './app/components/EDCustomAlert'
import AppNavigator from './app/components/RootNavigator'
import { setI18nConfig, strings } from './app/locales/i18n'
import { saveAlertData, savePromptStatus } from './app/redux/actions/UserActions'
import { navigationOperation } from "./app/redux/reducers/NavigationReducer"
import { userOperations } from './app/redux/reducers/UserReducer'
import { showDialogue, showTopDialogue } from './app/utils/EDAlert'
import { EDColors } from './app/utils/EDColors'
import { DEFAULT_TYPE, isRTLCheck, ORDER_TYPE } from "./app/utils/EDConstants"
import Context from './Context'
import NavigationService from "./NavigationService"
import SplashScreen from 'react-native-splash-screen'

const rootReducer = combineReducers({
  userOperations: userOperations,
  navigationReducer: navigationOperation,

})
export const globalStore = createStore(rootReducer)

// Handle JS exceptions

const exceptionhandler = (error, isFatal) => {
  // debugLog("JS ERROR ::::", error)
  if (error !== undefined && error.stack !== undefined) {
    showTopDialogue(strings("generalWebServiceError"))
    crashlytics().log(error.message)
    crashlytics().recordError(error)
  }
};
setJSExceptionHandler(exceptionhandler, true);

// Handle native exceptions

setNativeExceptionHandler(exceptionString => {
  showTopDialogue(strings("generalWebServiceError"))
  crashlytics().log(exceptionString)
  crashlytics().recordError(exceptionString)
});

export default class App extends Component<> {
  state = {
    stateRefresh: false, // This is used to refresh the state to allow notification screen to be rendered if app is in background
    isRefresh: false,
    key: 1,
    appState: AppState.currentState
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
    try {
      this.notificationListener();
      this.notificationOpenedListener();
    } catch (error) { }
  }

  async createNotificationListeners() {

    setI18nConfig()
    /*
     * Triggered when a particular notification has been received in foreground
     * */

    messaging().onMessage(async remoteMessage => {
      let currentRoute = NavigationService.getCurrentRoute()


      if (currentRoute == "homeContainer" && remoteMessage.data.screenType === "order") {
        // console.log("FOREGROUND APPSTATE: ORDERTYPE: HOMESCREEN::::::::: ")
        this.setState({ key: this.state.key + 1 })

        Notifier.showNotification({
          title: remoteMessage.notification.title || strings("loginAppName"),
          description: remoteMessage.notification.body,
          showAnimationDuration: 800,
          onHidden: () => console.log('Hidden'),
          onPress: () => console.log('Press'),
          hideOnPress: false,
          componentProps: {
            titleStyle: {
              color: EDColors.primary
            },
          },
        });
      }
      else {
        Notifier.showNotification({
          title: remoteMessage.notification.title || strings("loginAppName"),
          description: remoteMessage.notification.body,
          showAnimationDuration: 800,
          duration: 0,

          onHidden: () => console.log('Hidden'),
          onPress: () => {
            NavigationService.navigateToSpecificRoute(isRTLCheck() ? 'homeRight' : 'home')
          },
          hideOnPress: true,
          componentProps: {
            titleStyle: {
              color: EDColors.primary
            },
          }
        });
      }
      // debugLog("Foreground message ::::::", remoteMessage)
    });

    /*
     * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
     * */

    messaging().onNotificationOpenedApp(remoteMessage => {
      // debugLog(
      //   'Notification caused app to open from background state:',
      //   remoteMessage.notification,
      // );
      let currentRoute = NavigationService.getCurrentRoute()
      if (currentRoute == "homeContainer" && remoteMessage.data.screenType === "order") {
        this.setState({ key: this.state.key + 1 })
      }
      else {
        NavigationService.navigateToSpecificRoute(isRTLCheck() ? 'homeRight' : 'home')
      }
    });

    /*
     * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
     * */

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          const lastNotification = AsyncStorage.getItem("lastNotification");

          if (lastNotification !== notificationId) {
            if (remoteMessage.data.screenType === "order") {
              this.isNotification = ORDER_TYPE;

              this.setState({ isRefresh: this.state.isRefresh ? false : true });
            }
            AsyncStorage.setItem("lastNotification", notificationId);
          }
        }
      });

    /*
     * Triggered for data only payload in foreground
     * */
    this.messageListener = messaging().onMessage(message => {
      //process data message
    });

    if (this.isNotification == undefined) {
      this.isNotification = DEFAULT_TYPE;
      this.setState({ isRefresh: this.state.isRefresh ? false : true });
    }
  }

  _handleAppStateChange = (nextAppState) => {
    if (nextAppState === 'active') {
      globalStore.dispatch(
        saveAlertData(undefined)
      )
      globalStore.dispatch(
        savePromptStatus(false)
      )
    }
    this.setState({ appState: nextAppState });
  }





  componentDidMount() {
    if (Platform.OS == "ios") {
      SplashScreen.hide()
    }
    setI18nConfig()
    AppState.addEventListener('change', this._handleAppStateChange);
    setTimeout(() => {
      globalStore.dispatch(
        savePromptStatus(false)
      )
    }, 2000)
    this.createNotificationListeners();

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

    //subscribe to golble store
    globalStore.subscribe(this.checkForUpdates)
  }


  updateFromStore = (app_link, is_forced = false) => {
    if (app_link !== undefined && app_link !== null && app_link.trim().length !== null) {
      if (Linking.canOpenURL(app_link)) {
        Linking.openURL(app_link).then(() => {
          globalStore.dispatch(
            saveAlertData(undefined)
          )
          if (is_forced)
            globalStore.dispatch(
              savePromptStatus(false)
            )
        }
        ).catch(
          () => {
            showTopDialogue('generalWebServiceError', true)
          }
        )
      }
      else {
        showTopDialogue('generalWebServiceError', true)
      }
    }
  }

  checkForUpdates = () => {
    setI18nConfig()
    let appVersion = globalStore.getState().userOperations.appVersion
    let isPrompted = globalStore.getState().userOperations.updatePrompt
    // console.log('---------------------------------------------appjs call ' ,deviceInfoModule.getVersion(), appVersion , isPrompted )
    if (appVersion !== undefined && appVersion.app_live_version !== undefined) {
      let currentVersion = deviceInfoModule.getVersion()

      if (!isPrompted) {
        if (parseFloat(currentVersion) < parseFloat(appVersion.app_live_version)) {
          globalStore.dispatch(
            savePromptStatus(true)
          )
          if (parseFloat(currentVersion) < parseFloat(appVersion.app_force_version)) {
            showDialogue(
              strings('generalForceUpdate'),
              strings('loginAppName'),
              [],
              () => { this.updateFromStore(appVersion.app_url, true) },
              strings('generalUpdate'),

            );
          }
          else {
            showDialogue(
              strings('generalUpdateapp'),
              strings('loginAppName'),
              [{
                text: strings('dialogCancel'), onPress: () => {

                },
                isNotPreferred: true,
              }],
              () => { this.updateFromStore(appVersion.app_url) },
              strings('generalUpdate'),

            );

          }

        }
        else {
          globalStore.dispatch(
            savePromptStatus(true)
          )
          globalStore.dispatch(
            saveAlertData(undefined)
          )
        }
      }
    }
  }

  render() {
    // debugLog("IS NOTIFICATION ::::",this.isNotification)
    return (
      <Provider store={globalStore}>
        <StatusBar backgroundColor={EDColors.primary} barStyle={'light-content'} />
        <NotifierWrapper>
          <Context.Provider value={{ notificationSlug: this.isNotification, isRefresh: this.state.key }} >
            <NavigationContainer
              ref={navigatorRef => {
                NavigationService.setTopLevelNavigator(navigatorRef);
              }}
            >
              <AppNavigator />
            </NavigationContainer>
          </Context.Provider>
        </NotifierWrapper>
        <EDCustomAlert />

      </Provider>
    )
  }
}
