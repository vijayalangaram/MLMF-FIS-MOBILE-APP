import React from 'react';
import {Platform} from 'react-native';
import {FlatList, StyleSheet, Text, View, Image} from 'react-native';
import deviceInfoModule from 'react-native-device-info';
import {initialWindowMetrics} from 'react-native-safe-area-context';
import {connect} from 'react-redux';
import Assets from '../assets';
import ToggleSwitch from 'toggle-switch-react-native';
import {strings} from '../locales/i18n';
import {saveNavigationSelection} from '../redux/actions/Navigation';
import {
  saveLanguageInRedux,
  saveOnlineStatus,
  saveUserDetailsInRedux,
} from '../redux/actions/User';
import {
  flushAllData,
  saveLanguage,
  saveUserStatus,
} from '../utils/AsyncStorageHelper';
import {
  showDialogue,
  showNoInternetAlert,
  showTopDialogue,
} from '../utils/EDAlert';
import {EDColors} from '../utils/EDColors';
import {getProportionalFontSize, isRTLCheck} from '../utils/EDConstants';
import {EDFonts} from '../utils/EDFontConstants';
import Metrics from '../utils/metrics';
import {netStatus} from '../utils/NetworkStatusConnection';
import {driverStatus, logoutUser} from '../utils/ServiceManager';
import EDProgressLoader from './EDProgressLoader';
import EDRTLView from './EDRTLView';
import EDSideMenuHeader from './EDSideMenuHeader';
import EDSideMenuItem from './EDSideMenuItem';
import NavigationEvents from '../components/NavigationEvents';
import {CommonActions} from '@react-navigation/native';
import {Icon} from 'react-native-elements';
import {Linking} from 'react-native';
import BackgroundService from 'react-native-background-actions';

class SideBar extends React.PureComponent {
  //#region LIFECYCLE METHODS

  /** CONSTRUCTOR */
  constructor(props) {
    super(props);
    this.arrayFinalSideMenu = [];
  }

  /** STATE */
  state = {
    isLoading: false,
    isActive: this.props.status || false,
  };

  /** Toggle Switch Handler */
  _toggleSwitchActive = () => {
    this.setState({isActive: !this.state.isActive});

    saveUserStatus(
      !this.props.status,
      (onSuccess) => {
        this.props.saveStatus(!this.props.status);
      },
      (onFailure) => {},
    );
    let objDriverStatus = {
      language_slug: this.props.lan,
      user_id: this.props.userDetails.UserID,
      availability_status: this.state.isActive ? 0 : 1,
    };
    driverStatus(
      objDriverStatus,
      this.onDriverSuccessHandler,
      this.onDriverFailureHandler,
      this.props,
    );
  };

  onDriverSuccessHandler = (response) => {};
  onDriverFailureHandler = (onFailure) => {};

  // SOCIAL APP PRESSED
  openSocialApp = (item) => {
    if (item.url !== undefined && item.url !== null)
      Linking.openURL(item.url).catch(() => {});
  };

  /** MAIN RENDER METHOD */
  render() {
    let arrCMSPages = this.props.arrayCMSPages.map((itemToIterate) => {
      return {
        isAsset: true,
        route: 'cms',
        screenName: itemToIterate.name,
        icon: {uri: itemToIterate.cms_icon},
        cmsSlug: itemToIterate.CMSSlug,
      };
    });
    let arrTemp = this.setupSideMenuData();
    let arraySideMenuData = arrTemp.concat(arrCMSPages);

    // Vikrant 20-07-21

    this.arrayFinalSideMenu =
      this.props.userDetails.FirstName !== undefined
        ? arraySideMenuData.concat({
            route: 'Log Out',
            screenName: strings('logout'),
            icon: 'exit-outline',
            iconType: 'ionicon',
          })
        : arraySideMenuData;

    this.arrSocialApps = [];
    if (
      this.props.socialURL.facebook !== undefined &&
      this.props.socialURL.facebook !== null &&
      this.props.socialURL.facebook.trim().length !== 0
    ) {
      this.arrSocialApps.push({
        name: 'facebook',
        color: EDColors.facebook,
        url: this.props.socialURL.facebook,
      });
    }
    if (
      this.props.socialURL.twitter !== undefined &&
      this.props.socialURL.twitter !== null &&
      this.props.socialURL.twitter.trim().length !== 0
    ) {
      this.arrSocialApps.push({
        name: 'twitter',
        color: EDColors.twitter,
        type: 'entypo',
        url: this.props.socialURL.twitter,
      });
    }

    if (
      this.props.socialURL.linkedin !== undefined &&
      this.props.socialURL.linkedin !== null &&
      this.props.socialURL.linkedin.trim().length !== 0
    ) {
      this.arrSocialApps.push({
        name: 'logo-linkedin',
        type: 'ionicon',
        color: EDColors.linkedin,
        url: this.props.socialURL.linkedin,
      });
    }

    return (
      <View
        pointerEvents={this.state.isLoading ? 'none' : 'auto'}
        style={style.mainContainer}>
        {/* DETECT DID FOCUS EVENT */}
        <NavigationEvents onFocus={this.onDidFocusNavigationEvents} />

        {this.state.isLoading ? (
          <EDProgressLoader
            spinnerStyle={{
              marginRight: isRTLCheck() ? Metrics.screenWidth * 0.75 : 0,
            }}
          />
        ) : null}

        {/* HEADER VIEW */}
        <EDSideMenuHeader
          userDetails={this.props.userDetails}
          onProfilePressed={this.onProfilePressed}
        />
        {/* TOGGLE SWITCH VIEW  */}
        <View style={style.toggleContainer}>
          <EDRTLView style={{alignItems: 'center', paddingVertical: 15}}>
            {/* SWITCH */}
            <ToggleSwitch
              label={strings('showActive')}
              containerStyle={{
                flexDirection: isRTLCheck() ? 'row-reverse' : 'row',
              }}
              isRTL={isRTLCheck()}
              labelStyle={style.switchText}
              isOn={this.state.isActive}
              onColor={EDColors.primary}
              offColor={EDColors.white}
              trackOffStyle={{
                borderWidth: 2,
                width: 45,
                borderColor: EDColors.primary,
              }}
              trackOnStyle={{
                borderWidth: 2,
                width: 45,
                borderColor: EDColors.primary,
                backgroundColor: EDColors.palePrimary,
              }}
              onToggle={this._toggleSwitchActive}
              size={'small'}
              icon={
                <View
                  style={{
                    height: 12,
                    width: 12,
                    borderRadius: 6,
                    borderWidth: 2,
                    borderColor: EDColors.primary,
                    backgroundColor: EDColors.primary,
                  }}
                />
              }
              // style={{}}
            />
          </EDRTLView>
        </View>
        {/* SIDE MENU ITEMS LIST */}
        <View style={style.navItemContainer}>
          <FlatList
            showsVerticalScrollIndicator={false}
            data={this.arrayFinalSideMenu}
            extraData={this.state}
            keyExtractor={(item, index) => item + index}
            renderItem={this.renderSideMenuItem}
          />
        </View>

        {/* Vikrant 20-07-21 */}
        <EDRTLView
          style={{
            alignItems: 'center',
            width: '100%',
            marginBottom:
              15 +
              (Platform.OS == 'ios' ? initialWindowMetrics.insets.bottom : 0),
            paddingHorizontal: 15,
            justifyContent: 'space-between',
          }}>
          <EDRTLView style={{alignItems: 'center'}}>
            <Image
              // source={Assets.bg_version}
              source={Assets.user_placeholder}
              style={{height: 24, width: 24}}
              resizeMode={'contain'}
            />
            <Text
              style={{
                fontFamily: EDFonts.medium,
                fontSize: getProportionalFontSize(14),
                color: 'rgba(0, 0, 0, 0.4)',
                marginHorizontal: 5,
              }}>
              {strings('version') + ' ' + deviceInfoModule.getVersion()}
            </Text>
          </EDRTLView>

          {this.arrSocialApps !== undefined &&
          this.arrSocialApps !== null &&
          this.arrSocialApps.length > 0 ? (
            <EDRTLView style={style.socialIconView}>
              {this.arrSocialApps.map((item, index) =>
                item.url !== undefined && item.url !== null ? (
                  <Icon
                    key={index}
                    name={item.name}
                    containerStyle={{marginHorizontal: 5}}
                    color={item.color}
                    type={item.type}
                    onPress={() => this.openSocialApp(item)}
                  />
                ) : null,
              )}
            </EDRTLView>
          ) : null}
        </EDRTLView>
      </View>
    );
  }
  //#endregion

  //#region HELPER FUNCTIONS
  /** SETUP SIDE MENU ITEMS */
  setupSideMenuData = () => {
    return [
      // vikrant 20-07-21
      {
        route: 'Home',
        screenName: strings('homeTitle'),
        icon: 'home',
        iconType: 'simple-line-icon',
      },
      {
        route: 'myEarning',
        screenName: strings('myEarning'),
        icon: 'wallet-outline',
        iconType: 'ionicon',
        iconSize: 22,
      },
    ];
  };

  /**
   *
   * @param {The side menu item to render from this.arrayFinalSideMenu} sideMenuItem
   */
  renderSideMenuItem = (sideMenuItem) => {
    let isSelected =
      this.props.titleSelected ===
      this.arrayFinalSideMenu[sideMenuItem.index].screenName;
    return (
      <EDSideMenuItem
        key={sideMenuItem.index}
        totalEarning={this.props.totalEarning}
        currency={this.props.currencySymbol}
        lan={this.props.lan}
        isSelected={isSelected}
        onPressHandler={this.onPressHandler}
        item={sideMenuItem.item}
        index={sideMenuItem.index}
      />
    );
  };

  //#region BUTTON/TAP EVENTS

  /**
   *
   * @param {The item selected by the user from the list. Unused for now, so having _ as prefix} _selectedItem
   * @param {The index of item selected by the user} selectedIndex
   */
  onPressHandler = (_selectedItem, selectedIndex) => {
    // CLOSE DRAWER
    if (
      this.arrayFinalSideMenu[selectedIndex].screenName !== strings('logout')
    ) {
      this.props.navigation.closeDrawer();
    }

    // LOGOUT
    if (
      this.arrayFinalSideMenu[selectedIndex].screenName === strings('logout')
    ) {
      showDialogue(
        strings('logoutConfirm'),
        strings('appName'),

        [
          {
            text: strings('cancel'),
            onPress: () => this.props.navigation.closeDrawer(),
          },
        ],
        () => {
          this.callLogoutAPI();
        },
        strings('logout'),
        'warning',
        true,
      );
    }

    // CHANGE CENTER SCREEN
    else {
      // SAVE SELECTED ITEM IN REDUX
      this.props.saveNavigationSelection(
        this.arrayFinalSideMenu[selectedIndex].screenName,
      );

      // CHANGE MAIN SCREEN
      this.props.navigation.navigate(
        this.arrayFinalSideMenu[selectedIndex].route,
        {routeParams: this.arrayFinalSideMenu[selectedIndex]},
      );
    }
  };

  /** PROFILE DETAILS TAP EVENT */
  onProfilePressed = () => {
    this.props.navigation.closeDrawer();
    this.props.navigation.navigate('MyProfile');
  };

  //#endregion

  //#region NETWORK

  /** LOGOUT API CALL */
  callLogoutAPI = () => {
    // CHECK INTERNET STATUS
    netStatus((isConnected) => {
      if (isConnected) {
        // LOGOUT PARAMS
        const logoutParams = {
          user_id: this.props.userDetails.UserID,
          language_slug: this.props.lan,
        };
        // LOGOUT CALL
        this.setState({isLoading: true});
        logoutUser(
          logoutParams,
          this.onLogoutSuccess,
          this.onLogoutFailure,
          this.props,
        );
      } else {
        showNoInternetAlert();
      }
    });
  };

  /**
   *
   * @param {The success object returned in logout API response} _objSuccess
   */
  onLogoutSuccess = (_objSuccess) => {
    this.props.navigation.closeDrawer();

    const selectedLanguage = this.props.lan;
    if (BackgroundService.isRunning()) BackgroundService.stop();

    // CLEAR USER DETAILS IN REDUX
    this.props.saveUserDetailsInRedux({});
    this.props.saveLanguageRedux(selectedLanguage);

    // SAVE SELECTED ITEM IN REDUX
    this.props.saveNavigationSelection(this.arrayFinalSideMenu[0].screenName);

    // CLEAR USER DETAILS FROM ASYNC STORE
    flushAllData(
      (_response) => {
        // MAINTAIN THE SELECTED LANGUAGE IN ASYNC STORE
        saveLanguage(
          selectedLanguage,
          (_successSaveLanguage) => {},
          (_error) => {},
        );

        // TAKE THE USER TO INITIAL SCREEN
        this.props.navigation.popToTop();
        this.props.navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{name: 'splash'}],
          }),
          // StackActions.reset({
          //     index: 0,
          //     actions: [
          //         NavigationActions.navigate({ routeName: 'splash' }),
          //     ],
          // })
        );
      },
      (_error) => {},
    );

    // DISMISS LOGOUT DIALOGUE
    this.setState({isLoading: false});
  };

  /**
   *
   * @param {The failure response object returned in logout API} _objFailure
   */
  onLogoutFailure = (_objFailure) => {
    // DISMISS LOGOUT DIALOGUE
    showTopDialogue(_objFailure.message || '', true);
    this.setState({isLoading: false});
  };
}

const style = StyleSheet.create({
  mainContainer: {flex: 1, backgroundColor: EDColors.white},
  navItemContainer: {flex: 5, paddingBottom: 20, marginTop: 5},
  toggleContainer: {
    paddingHorizontal: 10,
    backgroundColor: '#F6F6F6',
    justifyContent: 'center',
  },
  switchText: {
    flex: 1,
    color: EDColors.black,
    fontFamily: EDFonts.semiBold,
    fontSize: getProportionalFontSize(16),
  },
  socialIconView: {justifyContent: 'space-between'},
});

export default connect(
  (state) => {
    return {
      titleSelected: state.navigationReducer.selectedItem,
      totalEarning: state.userOperations.totalEarning,
      currencySymbol: state.userOperations.currencySymbol,
      userDetails: state.userOperations.userData || {},
      isLoggedIn: state.userOperations.isLoggedIn,
      lan: state.userOperations.lan,
      arrayCMSPages: state.userOperations.arrayCMSData,
      status: state.userOperations.activeStatus,
      socialURL: state.userOperations.socialURL || {},
    };
  },
  (dispatch) => {
    return {
      saveNavigationSelection: (dataToSave) => {
        dispatch(saveNavigationSelection(dataToSave));
      },
      saveUserDetailsInRedux: (detailsToSave) => {
        dispatch(saveUserDetailsInRedux(detailsToSave));
      },
      saveLanguageRedux: (language) => {
        dispatch(saveLanguageInRedux(language));
      },
      saveStatus: (dataStatus) => {
        dispatch(saveOnlineStatus(dataStatus));
      },
    };
  },
)(SideBar);
