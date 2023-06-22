/* eslint-disable no-trailing-spaces */
/* eslint-disable prettier/prettier */
// import { NavigationActions, StackActions } from 'react-navigation';
import { CommonActions } from "@react-navigation/native";
import React from 'react';
import {
    FlatList,


    Image, Platform, StyleSheet,


    Text, View
} from 'react-native';
import deviceInfoModule from "react-native-device-info";
import { initialWindowMetrics } from 'react-native-safe-area-context';
import { connect } from 'react-redux';
import Assets from '../assets';
import { strings } from '../locales/i18n';
import { saveNavigationSelection } from '../redux/actions/Navigation';
import { saveLanguageInRedux, saveUserDetailsInRedux } from '../redux/actions/UserActions';
import { flushAllData, saveLanguage } from '../utils/AsyncStorageHelper';
import { showDialogue, showNoInternetAlert, showTopDialogue } from '../utils/EDAlert';
import { EDColors } from '../utils/EDColors';
import { getProportionalFontSize } from '../utils/EDConstants';
import { EDFonts } from '../utils/EDFontConstants';
import { netStatus } from '../utils/NetworkStatusConnection';
import { logoutUser } from '../utils/ServiceManager';
import EDProgressLoader from './EDProgressLoader';
import EDRTLView from './EDRTLView';
import EDSideMenuHeader from './EDSideMenuHeader';
import EDSideMenuItem from './EDSideMenuItem';
import NavigationEvents from "./NavigationEvents";


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
    };


    /** ON DID FOCUS */
    onDidFocusNavigationEvents = () => {
    }

    /** MAIN RENDER METHOD */
    render() {
        let cmsData = this.props.arrayCMSPages || []
        cmsData = cmsData.filter(data => { return data.CMSSlug == "contact-us" })
        let arrCMSPages = ((cmsData)).map(itemToIterate => { return { isAsset: true, route: 'cms', screenName: itemToIterate.name, icon: { uri: itemToIterate.cms_icon }, cmsSlug: itemToIterate.CMSSlug }; });

        let arrTemp = this.setupSideMenuData();
        let arraySideMenuData = arrTemp.concat(arrCMSPages);
        // let arraySideMenuData = arrTemp


        this.arrayFinalSideMenu =
            this.props.isLoggedIn
                ? arraySideMenuData.concat({ route: 'Log Out', screenName: strings('accountsSignOut'), icon: 'exit-outline', iconType: 'ionicon' })
                : arraySideMenuData;

        return (
            <View
                pointerEvents={this.state.isLoading ? 'none' : 'auto'}
                style={style.mainContainer}>

                {/* DETECT DID FOCUS EVENT */}
                <NavigationEvents onFocus={this.onDidFocusNavigationEvents} navigationProps={this.props.navigationProps} />

                {this.state.isLoading ? <EDProgressLoader /> : null}

                

                {/* HEADER VIEW */}
                <EDSideMenuHeader
                    userDetails={this.props.userDetails}
                    onProfilePressed={this.onProfilePressed} />

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

                {/* VERSION DETAIL */}
                <EDRTLView style={style.versionStyle}>
                    <Image source={Assets.bg_version} style={{ height: getProportionalFontSize(24), width: getProportionalFontSize(24) }} resizeMode={'contain'} />
                    <Text style={style.versionTextStyle} >{strings("sidebarVersion") + " " + deviceInfoModule.getVersion()}</Text>
                </EDRTLView>
            </View>
        );
    }
    //#endregion

    //#region HELPER FUNCTIONS
    /** SETUP SIDE MENU ITEMS */
    setupSideMenuData = () => {
        return [
            { route: 'Home', screenName: strings('homeTitle'), icon: "home", iconType: 'simple-line-icon' },
            { route: 'account', screenName: strings('accountsTitle'), icon: 'settings-outline', iconType: 'ionicon' },
            { route: 'Order', screenName: strings('orderPast'), icon: Assets.bg_Icon, isAsset: true },
            //{ route: 'Restaurant', screenName: strings('modeMangement'), icon: "timer" },
            { route: 'cms', screenName: strings('about'), icon: "people-circle", iconType: 'ionicon' }
        ];
    };

    /**
     *
     * @param {The side menu item to render from this.arrayFinalSideMenu} sideMenuItem
     */
    renderSideMenuItem = (sideMenuItem) => {
        let isSelected = this.props.titleSelected === this.arrayFinalSideMenu[sideMenuItem.index].screenName;
        return <EDSideMenuItem isSelected={isSelected} onPressHandler={this.onPressHandler} item={sideMenuItem.item} index={sideMenuItem.index} />;
    }




    //#region BUTTON/TAP EVENTS

    /**
     *
     * @param {The item selected by the user from the list. Unused for now, so having _ as prefix} _selectedItem
     * @param {The index of item selected by the user} selectedIndex
     */
    onPressHandler = (_selectedItem, selectedIndex) => {

        // CLOSE DRAWER
        if (this.arrayFinalSideMenu[selectedIndex].screenName !== strings('accountsSignOut')) {
            this.props.navigation.closeDrawer();
        }

        // LOGOUT
        if (this.arrayFinalSideMenu[selectedIndex].screenName === strings('accountsSignOut')) {
            showDialogue(
                strings('generalLogoutAlert'),
                strings('loginAppName'),

                [{ text: strings('dialogCancel'), onPress: () => { } }],
                this.callLogoutAPI
                ,
                strings('accountsSignOut'),
                true
            );
        }
        // NOTIFICATION
        else if (this.arrayFinalSideMenu[selectedIndex].screenName === strings('profileNotification')) {
            if (this.props.isLoggedIn) {
                // SAVE SELECTED ITEM IN REDUX
                this.props.saveNavigationSelection(strings('profileNotification'));
                this.props.navigation.navigate('notifications');
            } else {
                // Take the user to login screen if not logged in
                this.props.navigation.navigate('login');
            }
        }
        // ORDERS
        else if (this.arrayFinalSideMenu[selectedIndex].screenName === strings('orderMyOrder')) {
            if (this.props.isLoggedIn) {
                // SAVE SELECTED ITEM IN REDUX
                this.props.saveNavigationSelection(strings('orderPast'));
                this.props.navigation.navigate('myOrders');
            } else {
                // Take the user to login screen if not logged in
                this.props.navigation.navigate('login');
            }
        }
        // ACCOUNT
        else if (this.arrayFinalSideMenu[selectedIndex].screenName === strings('accountsTitle')) {
            // SAVE SELECTED ITEM IN REDUX
            this.props.saveNavigationSelection(strings('accountsTitle'));
            this.props.navigation.navigate('account');
        }
        // RATE APP
        else if (this.arrayFinalSideMenu[selectedIndex].screenName === strings('sidebar.rate')) {
            this.openStore();
        }
        // SHARE APP
        else if (this.arrayFinalSideMenu[selectedIndex].screenName === strings('sidebar.share')) {
            this.shareApp();
        }
        // CHANGE CENTER SCREEN
        else {
            // SAVE SELECTED ITEM IN REDUX
            this.props.saveNavigationSelection(this.arrayFinalSideMenu[selectedIndex].screenName);

            // CHANGE MAIN SCREEN
            this.props.navigation.navigate(this.arrayFinalSideMenu[selectedIndex].route, { routeParams: this.arrayFinalSideMenu[selectedIndex] });
        }
    }

    /** PROFILE DETAILS TAP EVENT */
    onProfilePressed = () => {
        if (this.props.isLoggedIn) {
            this.props.navigation.closeDrawer();
            // SAVE SELECTED ITEM IN REDUX

            this.props.navigation.navigate('editProfileFromSideMenu');
        } else {
            // Take the user to login screen if not logged in
            this.props.navigation.closeDrawer();
            this.props.navigation.navigate('login');
        }
    }

    //#region NETWORK

    /** LOGOUT API CALL */
    callLogoutAPI = () => {
        // CHECK INTERNET STATUS
        netStatus(isConnected => {
            if (isConnected) {
                // LOGOUT PARAMS
                const logoutParams = {
                    user_id: this.props.userDetails.UserID,
                    language_slug: this.props.lan,
                };
                // LOGOUT CALL
                this.setState({ isLoading: true });
                logoutUser(logoutParams, this.onLogoutSuccess, this.onLogoutFailure, this.props);
            } else {
                showNoInternetAlert();
            }
        });
    }

    /**
     *
     * @param {The success object returned in logout API response} _objSuccess
     */
    onLogoutSuccess = (_objSuccess) => {

        this.props.navigation.closeDrawer();

        const selectedLanguage = this.props.lan;

        // CLEAR USER DETAILS IN REDUX
        this.props.saveUserDetailsInRedux({});
        this.props.saveLanguageRedux(selectedLanguage);

        // SAVE SELECTED ITEM IN REDUX
        this.props.saveNavigationSelection(this.arrayFinalSideMenu[0].screenName);

        // CLEAR USER DETAILS FROM ASYNC STORE
        flushAllData(
            _response => {

                // MAINTAIN THE SELECTED LANGUAGE IN ASYNC STORE
                saveLanguage(selectedLanguage, _successSaveLanguage => { }, _error => { });

                // TAKE THE USER TO INITIAL SCREEN
                this.props.navigation.popToTop();
                this.props.navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [{
                            name: "splash"
                        }],
                    })
                );
            },
            _error => { }
        );

        // DISMISS LOGOUT DIALOGUE
        this.setState({ isLoading: false });
    }

    /**
     *
     * @param {The failure response object returned in logout API} _objFailure
     */
    onLogoutFailure = _objFailure => {
        // DISMISS LOGOUT DIALOGUE
        showTopDialogue(_objFailure.message || '', true);
        this.setState({ isLoading: false });
    }
}

const style = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: EDColors.white },
    navItemContainer: { flex: 5, paddingBottom: 20 },
    versionStyle: { justifyContent: 'flex-start', alignItems: "center", marginHorizontal: 20, marginBottom: Platform.OS == 'ios' ? initialWindowMetrics.insets.bottom + 10 : 10 },
    versionTextStyle: { fontSize: getProportionalFontSize(14), marginHorizontal: 5, fontFamily: EDFonts.medium, color: EDColors.text },
});

export default connect(
    state => {
        return {
            titleSelected: state.navigationReducer.selectedItem,
            userDetails: state.userOperations.userDetails || {},
            isLoggedIn: state.userOperations.isLoggedIn,
            lan: state.userOperations.lan,
            arrayCMSPages: state.userOperations.arrayCMSData,

        };
    },
    dispatch => {
        return {
            saveNavigationSelection: dataToSave => {
                dispatch(saveNavigationSelection(dataToSave));
            },
            saveUserDetailsInRedux: detailsToSave => {
                dispatch(saveUserDetailsInRedux(detailsToSave));
            },
            saveLanguageRedux: language => {
                dispatch(saveLanguageInRedux(language));
            }
        };
    }
)(SideBar);
