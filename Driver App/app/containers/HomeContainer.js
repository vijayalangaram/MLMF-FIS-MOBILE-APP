import { default as I18n } from "i18n-js";
import React from 'react';
import { AppState, Linking, Platform, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import BackgroundService from 'react-native-background-actions';
import deviceInfoModule from 'react-native-device-info';
import { Icon } from "react-native-elements";
import { PERMISSIONS } from 'react-native-permissions';
import RNRestart from 'react-native-restart';
import { connect } from 'react-redux';
import Context from '../../Context';
import EDButton from "../components/EDButton";
import EDLanguageSelect from '../components/EDLanguageSelect';
import EDOrdersViewFlatList from '../components/EDOrdersViewFlatList';
import EDPlaceholderComponent from '../components/EDPlaceholderComponent';
import EDPopupView from '../components/EDPopupView';
import EDRTLText from "../components/EDRTLText";
import EDRTLView from "../components/EDRTLView";
import EDTopTabBar from '../components/EDTopTabBar';
import NavigationEvents from '../components/NavigationEvents';
import { strings } from '../locales/i18n';
import { saveNavigationSelection } from "../redux/actions/Navigation";
import { saveCurrencySymbol, saveEarningInRedux, saveLanguageInRedux, saveSocialURL, saveUserFCMInRedux } from "../redux/actions/User";
import { getLanguage, saveLanguage } from '../utils/AsyncStorageHelper';
import { showDialogue, showNoInternetAlert } from '../utils/EDAlert';
import { EDColors } from '../utils/EDColors';
import { debugLog, getProportionalFontSize, GOOGLE_API_KEY, isRTLCheck } from '../utils/EDConstants';
import { EDFonts } from '../utils/EDFontConstants';
import { checkFirebasePermission } from '../utils/FirebaseServices';
import { getCurrentLocation } from '../utils/LocationServiceManager';
import Metrics from '../utils/metrics';
import { netStatus } from '../utils/NetworkStatusConnection';
import { checkPermission, requestNotificationPermission } from '../utils/PermissionManager';
import { getAllOrders, updateDeviceTokenAPI, updateDriverLocation, userLanguage } from '../utils/ServiceManager';
import BaseContainer from './BaseContainer';



class HomeContainer extends React.Component {

  //#region LIFECYCLE METHODS
  static contextType = Context
  constructor(props) {
    super(props);
    this.userDetails = this.props.userData;
    this.strCurrentOrdersTitle = '';
    this.strCurrentOrdersSubtitle = '';
    this.strPastOrdersTitle = '';
    this.strPastOrdersSubtitle = '';
    this.arrayCurrentOrders = [];
    this.arrayPastOrders = undefined;
    this.refreshing = false,
      this.isRefresh = 0;
    this.allowFullPermission = false
    this.isPermission = true
    this.tastOptions = {
      taskName: strings("appName"),
      taskTitle: strings("backgroundTracking"),
      taskDesc: strings("backgroundEnable"),
      taskIcon: {
        name: 'ic_stat_name',
        type: 'drawable',
      },
      color: EDColors.primary,
      linkingURI: 'eatancedelivery://openapp',
      parameters: {
        delay: 10000,
      },
    };

  }

  /** STATE */
  state = {
    isLoading: false,
    isLoadingPastOrders: false,
    appState: AppState.currentState,
    selectedIndex: 0,
    languageModal: false,
    value: '',
    isRefresh: 0,
    locationError: false
  };

  componentDidMount() {
    this.locationUpdateHandler()
    this.getLanguageFromAsync()

    // this.setState({isRefresh : this.context.isRefresh})
    this.isRefresh = this.context.isRefresh
    if (this.appStateListener !== undefined && this.appStateListener !== null)
      return;
    this.appStateListener = AppState.addEventListener('change', this._handleAppStateChange);
  }

  componentWillUnmount() {
    if (this.appStateListener !== undefined && this.appStateListener !== null)
      this.appStateListener.remove()
  }

  componentDidUpdate(nextProps, nextState) {
    if (this.context.isRefresh !== this.isRefresh) {
      this.isRefresh = this.context.isRefresh
      this.strCurrentOrdersTitle = '';
      this.strCurrentOrdersSubtitle = '';
      this.strPastOrdersTitle = '';
      this.strPastOrdersSubtitle = '';
      this.refreshing = false
      this.arrayPastOrders = []
      this.arrayCurrentOrders = []
      this.callAllOrderAPI()
    }
  }


  getLanguageFromAsync = () => {
    getLanguage(languageSelected => {
      var languageToSave = languageSelected || 'en'
      this.setUserLanguage(languageToSave)

    },
      _err => {
        var languageToSave = 'en'
        this.setUserLanguage(languageToSave)

      })
  }

  onConnectionChangeHandler = () => {
    this.callAllOrderAPI()
  }

  /**
  *
  * @param {The call API for get Product data}
  */
  setUserLanguage = (lan) => {
    netStatus(status => {
      if (status) {
        let objUserLanguageParams = {
          user_id: this.userDetails.UserID,
          language_slug: lan,
        };

        userLanguage(
          objUserLanguageParams,
          this.onSuccessUserLanguage,
          this.onFailureUserLanguage,
          this.props,
        )
      }
      else
        showNoInternetAlert()
    })
  }

  //#region NETWORK METHODS
  /**
  *
  * @param {The success response object} objSuccess
  */
  onSuccessUserLanguage = (onSuccess) => {


  }

  /**
  *
  * @param {The failure response object} objFailure
  */
  onFailureUserLanguage = (onFailure) => {

  }
  //#region


  //#region APP STATE
  /**
   * @param { nextAppState for GPS } nextAppState
   */
  _handleAppStateChange = nextAppState => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      if (this.isPermission)
        this.locationUpdateHandler()
    }
    this.setState({ appState: nextAppState });
  };
  //#endregion

  locationUpdateHandler = () => {
    var paramPermission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        :
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
      ;
    checkPermission(paramPermission,
      () => {
        this.setState({ locationError: false })

        this.didFocusEventHandler()
      },
      () => {
        this.isPermission = false
        this.setState({ locationError: true })
        // showDialogue(strings("permissionTitle"), strings("permissionSubTitle"), [
        //   { "text": strings("cancel"), onPress: () => { }, isNotPreferred: true }
        // ], () => {
        //   this.isPermission = true
        //   Linking.openSettings()
        // })
      })
  }
  android10BackgroundPermissionCheck = () => {
    let system_version = Number(deviceInfoModule.getSystemVersion())
    if (Platform.OS == "android" && system_version >= 10) {
      var paramPermission = PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION;

      checkPermission(paramPermission,
        () => {
          this.allowFullPermission = true
        },
        (err) => {
          this.isPermission = false
          showDialogue(strings("backgroundLocation"), "", [
            { "text": strings("cancel"), onPress: () => { }, isNotPreferred: true }
          ], () => {
            this.isPermission = true
            Linking.openSettings()
          })
        })

    }
    else
      this.allowFullPermission = true


  }
  // //#region TRACKING DRIVER LOCATION
  didFocusEventHandler = () => {
    this.android10BackgroundPermissionCheck()

    getCurrentLocation(
      this.props.googleMapKey || GOOGLE_API_KEY,
      onSuccessResponse => {
        this.setState({
          curr_latitude: onSuccessResponse.latitude,
          curr_longitude: onSuccessResponse.longitude
        })
        this.driverTracking(
          onSuccessResponse.latitude,
          onSuccessResponse.longitude,
        );
      },
      onFailureResponse => {
        BackgroundService.stop();
        showDialogue(strings("currentLocationError"))
      }
    )

  };
  // //#endregion

  //#region CHANGE API TOKEN
  updateDeviceToken = () => {
    netStatus(isConnectedToNetwork => {
      if (isConnectedToNetwork) {
        let params = {
          user_id: this.userDetails.UserID,
          firebase_token: this.props.token,
          language_slug: this.props.lan
        };
        updateDeviceTokenAPI(params, this.onSuccessToken, this.onFailureToken, this.props);
      }
    })
  };

  onSuccessToken = () => {
  };

  onFailureToken = () => {
  };
  //#endregion

  //#region TRACK DRIVER LOCATION
  /**
   * @param { latitude cordinate for traking } latitude
   * @param { longitude cordinate for traking } longitude
   */
  driverTracking = (latitude, longitude) => {
    netStatus(status => {
      if (status) {
        let param = {
          user_id: this.userDetails.UserID,
          latitude: latitude,
          longitude: longitude,
          language_slug: this.props.lan

        };
        updateDriverLocation(param, this.onSuccessTracking, this.onFailureTracking, this.props);
      } else {
        this.strCurrentOrdersSubtitle = strings('noInternet');
        this.strCurrentOrdersTitle = strings('noInternetTitle')
        this.strPastOrdersSubtitle = strings('noInternet');
        this.strPastOrdersTitle = strings('noInternetTitle')
      }
    });
  };

  onSuccessTracking = () => {
  };
  onFailureTracking = () => {
  };


  //#region 

  /**
   *  Button Menu Pressed
   */

  buttonMenuPressed = () => {
    this.props.navigation.openDrawer();
  }

  /**
        * LANGUAGE CHANGE PRESSED
        */
  _onChangeLanguagePressed = () => {
    this.setState({ languageModal: true })
  }

  /** RENDER LANGUAGE CHANGE DIALOGUE */
  renderLanguageSelectDialogue = () => {
    return (
      <EDPopupView isModalVisible={this.state.languageModal}>
        <EDLanguageSelect
          languages={this.props.arrayLanguages}
          lan={this.props.lan}
          onChangeLanguageHandler={this.onChangeLanguageHandler}
          onDismissHandler={this.onDismissHandler}
          title={strings('chooseLanguage')}
        />
      </EDPopupView>
    )
  }
  //#endregion

  onDismissHandler = () => {
    this.setState({ languageModal: false })
  }

  //#region LANGUAGE CHANGE BUTTON EVENTS
  onChangeLanguageHandler = (lan) => {
    this.setState({ languageModal: false })

    // let lan = I18n.currentLocale();
    // switch (language) {
    //   case 0: {
    //     lan = "en";
    //     I18n.locale = "en";
    //     break;
    //   }
    //   case 1: {
    //     lan = "fr";
    //     I18n.locale = "fr";
    //     break;
    //   }
    //   case 2: {
    //     lan = "ar";
    //     I18n.locale = "ar";
    //     break;
    //   }
    // }
    this.props.saveLanguageRedux(lan);
    saveLanguage
      (
        lan,
        success => {
          RNRestart.Restart();
        },
        error => { }
      );


  }
  //#endregion



  //#endregion
  sleep = (time) => new Promise((resolve) => setTimeout(() => resolve(), time));
  startBackgroundTask = async (taskDataArguments) => {

    const { delay } = taskDataArguments;
    await new Promise(async (resolve) => {
      for (let i = 0; BackgroundService.isRunning(); i++) {
        getCurrentLocation(
          this.props.googleMapKey || GOOGLE_API_KEY,
          onCurrentLocation => {
            this.setState({
              curr_latitude: onCurrentLocation.latitude,
              curr_longitude: onCurrentLocation.longitude
            })
            this.driverTracking(onCurrentLocation.latitude, onCurrentLocation.longitude)
          },
          err => {
            BackgroundService.stop();
            showDialogue(strings("currentLocationError"))
          })
        await this.sleep(delay);
      }
    });
  }

  // Navigation Events

  onWillFocusHomeContainer = async () => {
    this.props.saveNavigationSelection(strings("homeTitle"))
    this.setState({ selectedIndex: 0 })
    if (this.scrollViewOrders !== undefined && this.scrollViewOrders !== null)
      this.scrollViewOrders.scrollTo({
        x: 0,
        y: 0,
        animated: true,
      });
    this.arrayCurrentOrders = undefined;
    this.arrayPastOrders = undefined;
    this.callAllOrderAPI();
    // this.callPastOrderAPI();
    if (Platform.OS == "android" && await deviceInfoModule.getApiLevel() >= 33) {
      requestNotificationPermission(
        onSuccess => {
          console.log("notification permission success :::::::: ", onSuccess)
          checkFirebasePermission(
            onSucces => {
              this.props.saveToken(onSucces)
              this.updateDeviceToken();
            },
            () => {
            }
          )
        },
        error => {
          console.log("notification permission error :::::::: ", error)
          showDialogue(strings("notificationPermission"), "", [],
            () => { Linking.openSettings() })
        }
      )

    }
    else
      checkFirebasePermission(
        onSucces => {
          this.props.saveToken(onSucces)
          this.updateDeviceToken();
        },
        () => {
        }
      )

  }


  /** NETWORK API FOR ORDERS */
  callAllOrderAPI = () => {
    this.strCurrentOrdersTitle = '';
    this.strCurrentOrdersSubtitle = '';
    this.strPastOrdersSubtitle = ''
    this.strPastOrdersTitle = ''
    this.arrayCurrentOrders = [];
    this.arrayPastOrders = [];

    netStatus(isConnectedToNetwork => {
      if (isConnectedToNetwork) {
        let params = {
          user_id: this.userDetails.UserID,
          language_slug: this.props.lan

        };
        this.setState({ isLoading: true });
        getAllOrders(params, this.onGetAllOrderSuccess, this.onGetAllOrderFailure, this.props)
      } else {
        this.arrayCurrentOrders = [];
        this.arrayPastOrders = []
        this.strCurrentOrdersTitle = strings('noInternetTitle');
        this.strCurrentOrdersSubtitle = strings('noInternet');
        this.strPastOrdersTitle = strings('noInternetTitle');
        this.strPastOrdersSubtitle = strings('noInternet');
        this.setState({ isLoading: false })
      }
    })
  };

  /**
     * @param {The success response object} objSuccess
     */
  onGetAllOrderSuccess = async (objSuccess) => {
    this.strCurrentOrdersTitle = strings('noCurrentOrder');
    this.strCurrentOrdersSubtitle = strings('noCurrentOrderSubtitle');
    this.arrayCurrentOrders = [];
    this.strPastOrdersTitle = strings('noPastOrder');
    this.strPastOrdersSubtitle = strings('noPastOrderSubtitle');
    this.arrayPastOrders = [];

    if (objSuccess.data.social_details !== undefined)
      this.props.saveSocialURLInRedux({
        facebook: objSuccess.data.social_details.facebook,
        linkedin: objSuccess.data.social_details.linkedin,
        twitter: objSuccess.data.social_details.twitter
      })

    if (objSuccess.data.total_earning !== undefined &&
      objSuccess.data.total_earning !== null &&
      objSuccess.data.total_earning !== "" &&
      objSuccess.data.total_earning !== "0.00"
    ) {
      this.props.saveTotalEarning(objSuccess.data.total_earning)
    }
    this.props.saveCurrency(objSuccess.data.currency)

    // CURRENT ORDERS ARRAY
    if (objSuccess.data.order_list !== undefined && objSuccess.data.order_list.current.length !== 0) {
      this.onGoingOrders = objSuccess.data.order_list.current.filter(items => {
        return items.order_status !== undefined && items.order_status.toLowerCase() == "ongoing"
      })
      this.arrayCurrentOrders = objSuccess.data.order_list.current;
      if (this.onGoingOrders.length !== 0) {
        var paramPermission =
          Platform.OS === 'ios'
            ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
            :
            PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
          ;
        checkPermission(paramPermission,
          () => {
            if (!BackgroundService.isRunning())
              BackgroundService.start(this.startBackgroundTask, this.tastOptions).catch(err => {

              })

          },
          () => {
            BackgroundService.stop();

          })


      } else {
        BackgroundService.stop();

      }
    } else {
      BackgroundService.stop();

      this.strCurrentOrdersTitle = strings('noCurrentOrder');
      this.strCurrentOrdersSubtitle = strings('noCurrentOrderSubtitle');
    }

    // PAST ORDER ARRAY 
    if (this.arrayPastOrders === undefined) {
      this.arrayPastOrders = []
    }


    // PAST ORDERS ARRAY
    if (objSuccess.data.order_list !== undefined && objSuccess.data.order_list.past.length > 0) {
      this.arrayPastOrders = objSuccess.data.order_list.past || []
    }


    this.setState({ isLoading: false });
  };

  /**
   * @param {The failure response object} objFailure
   */
  onGetAllOrderFailure = objFailure => {
    BackgroundService.stop();

    this.strCurrentOrdersTitle = objFailure.message
    this.strCurrentOrdersSubtitle = ''
    this.strPastOrdersTitle = objFailure.message
    this.strCurrentOrdersSubtitle = ''
    this.setState({ isLoading: false });
  };

  handleIndexChange = segmentIndex => {
    this.setState({ selectedIndex: segmentIndex });
    this.scrollViewOrders.scrollTo({
      x: Metrics.screenWidth * segmentIndex,
      y: 0,
      animated: true,
    });
  }

  onPullToRefreshHandler = () => {
    this.strCurrentOrdersTitle = '';
    this.strCurrentOrdersSubtitle = '';
    this.strPastOrdersTitle = '';
    this.strPastOrdersSubtitle = '';
    this.refreshing = false
    this.arrayPastOrders = []
    this.arrayCurrentOrders = []
    this.callAllOrderAPI()
  }

  /** CURRENT ORDER TAB */
  renderCurrentOrder = () => {
    return this.arrayCurrentOrders !== undefined && this.arrayCurrentOrders.length > 0 ? (
      <EDOrdersViewFlatList
        style={styles.flatlistContainer}
        arrayOrders={this.arrayCurrentOrders}
        onPressHandler={this.navigateToCurrentOrderDetails}
        onPullToRefreshHandler={this.onPullToRefreshHandler}

      />
    ) : (this.strCurrentOrdersTitle || '').trim().length > 0 ? (
      <View>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={this.refreshing || false}
              titleColor={EDColors.textAccount}
              title={strings("refresh")}
              tintColor={EDColors.textAccount}
              colors={[EDColors.textAccount]}
              onRefresh={this.onPullToRefreshHandler}
            />
          }>
          <EDPlaceholderComponent
            title={this.strCurrentOrdersTitle}
            subTitle={this.strCurrentOrdersSubtitle}
          />
        </ScrollView>
      </View>
    ) : <View style={{ width: Metrics.screenWidth, flex: 1 }} />;
  };

  navigateToCurrentOrderDetails = (currentOrderDetails) => {
    this.props.navigation.navigate('CurrentOrderContainer', { currentOrder: currentOrderDetails })
  }

  /** PAST ORDERS TAB */
  renderPastOrders = () => {
    return this.arrayPastOrders !== undefined && this.arrayPastOrders.length > 0 ? (
      <EDOrdersViewFlatList
        style={styles.flatlistContainer}
        arrayOrders={this.arrayPastOrders}
        onPressHandler={this.navigateToEarningsContainer}
        onPullToRefreshHandler={this.onPullToRefreshHandler}
      />
    ) : (this.strPastOrdersTitle || '').trim().length > 0 ? (
      <View>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={this.refreshing || false}
              title={strings("refresh")}
              titleColor={EDColors.textAccount}
              tintColor={EDColors.textAccount}
              colors={[EDColors.textAccount]}
              onRefresh={this.onPullToRefreshHandler}
            />
          }
        >
          <EDPlaceholderComponent
            title={this.strPastOrdersTitle}
            subTitle={this.strPastOrdersSubtitle}
          />
        </ScrollView>
      </View>
    ) : <View style={{ width: Metrics.screenWidth, flex: 1 }} />;
  };


  navigateToEarningsContainer = () => {
    this.props.navigation.navigate('myEarningFromHome');
  }

  onDidBlurHomeContainer = async () => {
    await BackgroundService.stop()
  }

  allowLocation = () =>{
     showDialogue(strings("permissionTitle"), strings("permissionSubTitle"), [
          { "text": strings("cancel"), onPress: () => { }, isNotPreferred: true }
        ], () => {
          this.isPermission = true
          Linking.openSettings()
        })
  }
  //#region  RENDER
  render() {
    return (
      <BaseContainer
        title={strings('homeTitle')}
        left={'menu'}
        onLeft={this.buttonMenuPressed}
        right={
          this.props.arrayLanguages !== undefined &&
            this.props.arrayLanguages !== null &&
            this.props.arrayLanguages.length > 1 ? 'language' : null}
        iconFamily={"material"}
        loading={this.state.isLoading}
        onRight={
          this.props.arrayLanguages !== undefined &&
            this.props.arrayLanguages !== null &&
            this.props.arrayLanguages.length > 1 ? this._onChangeLanguagePressed : null}
        availabilityStatus={this.props.status}
        navigationProps={this.props}
      >
        {/* <NavigationEvents onWillFocus={this.onWillFocusHomeContainer} /> */}
        <NavigationEvents
          onFocus={this.onWillFocusHomeContainer}
          onBlur={this.onDidBlurHomeContainer}
          navigationProps={this.props}
        />

        {this.renderLanguageSelectDialogue()}
        <View style={{ flex: 1 }}>



          {/* VIKRANT 20-07-21 */}
          <EDTopTabBar
            data={[{ title: strings("currentOrders"), onPress: this.handleIndexChange, index: 0 },
            { title: strings("pastOrder"), onPress: this.handleIndexChange, index: 1 }]}
            selectedIndex={this.state.selectedIndex}
          />
          <View style={styles.parentContaier}>
            {this.state.locationError ?
              <EDRTLView style={{ justifyContent: "space-between", alignItems: 'center', backgroundColor: EDColors.white, padding: 10, paddingVertical: 15 }}>
                <EDRTLView style={{ flex: 1, alignItems: "center", paddingHorizontal: 5 }}>
                  <Icon name="location-disabled" color={EDColors.primary} size={22} />
                  <EDRTLText title={strings("noLocationPermission")} style={styles.locationErrorTitle} />

                </EDRTLView>
                <EDButton
                  style={{ marginHorizontal: 0, borderRadius: 16, }}
                  label={strings("allowLocationButton")}
                  textStyle={{ fontSize: getProportionalFontSize(13) }}
                  onPress={this.allowLocation}
                />
              </EDRTLView> : null
            }
            <ScrollView
              contentContainerStyle={[styles.scrollContent, {
                flexDirection: isRTLCheck() ? "row" : "row"
              }]}
              scrollEnabled={false}
              ref={scrollView => (this.scrollViewOrders = scrollView)}
              bounces={false}
              pagingEnabled={true}
              showsHorizontalScrollIndicator={false}
              horizontal={true}>


              {this.renderCurrentOrder()}
              {this.renderPastOrders()}
            </ScrollView>
          </View>
        </View>
      </BaseContainer>
    )
  }

  //#endregion
}

export default connect(
  state => {
    return {
      userData: state.userOperations.userData,
      isLogout: state.userOperations.isLogout,
      token: state.userOperations.token,
      lan: state.userOperations.lan,
      arrayLanguages: state.userOperations.arrayLanguages,
      status: state.userOperations.activeStatus,
      socialURL: state.userOperations.socialURL,
      googleMapKey: state.userOperations.googleMapKey


    };
  },
  dispatch => {
    return {
      saveNavigationSelection: dataToSave => {
        dispatch(saveNavigationSelection(dataToSave));
      },
      saveLanguageRedux: language => {
        dispatch(saveLanguageInRedux(language));
      },
      saveToken: token => {
        dispatch(saveUserFCMInRedux(token))
      },
      saveTotalEarning: token => {
        dispatch(saveEarningInRedux(token))
      },
      saveCurrency: token => {
        dispatch(saveCurrencySymbol(token))
      },
      saveSocialURLInRedux: data => {
        dispatch(saveSocialURL(data))
      }
    };
  }
)(HomeContainer);

const styles = StyleSheet.create({
  parentContaier: {
    flex: 1,

  },
  scrollContent: { backgroundColor: EDColors.offWhite, paddingBottom: 10 },
  flatlistContainer:
  {
    width: Metrics.screenWidth, //Vikrant 20-07-21
    paddingHorizontal: 15,   //Vikrant 20-07-21
  },
  scrollContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: Metrics.screenWidth,
  },
  tabStyle: { borderColor: EDColors.primary, height: 40 },
  tabTextStyle: { color: EDColors.primary, fontFamily: EDFonts.regular, fontSize: getProportionalFontSize(16) },
  locationErrorTitle: { color: EDColors.black, fontFamily: EDFonts.regular, fontSize: getProportionalFontSize(14), marginHorizontal: 5, flex: 1 },

})