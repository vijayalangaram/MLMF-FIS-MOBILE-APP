/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { strings } from '../locales/i18n';
import { EDColors } from '../utils/EDColors';
import EDAccountItem from '../components/EDAccountItem';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import EDPopupView from '../components/EDPopupView';
import { flushAllData, saveLanguage } from '../utils/AsyncStorageHelper';
import { showDialogue, showNoInternetAlert, showTopDialogue } from '../utils/EDAlert';
import { logoutUser } from '../utils/ServiceManager';
import { netStatus } from '../utils/NetworkStatusConnection';
import { saveUserDetailsInRedux, saveLanguageInRedux } from '../redux/actions/UserActions';
import { connect } from 'react-redux';
import NavigationEvents from '../components/NavigationEvents';
import BaseContainer from './BaseContainer';

class AccountContainer extends React.Component {
    //#region LIFE CYCLE METHODS

    /** CONSTRUCTOR */
    constructor(props) {
        super(props);
    }

    /** STATE */
    state = {
        isLoading: false,
    };

    /** COMPONENT DID MOUNT */
    componentDidMount() {
    }

    onWillFocusAccountContainer() {

    }

    /** RENDER FUNCTION */
    render() {
        return (

            <BaseContainer
                title={strings('accountsTitle')}
                left={'menu'}
                onLeft={this.buttonMenuPressed}
                loading={this.state.isLoading || this.state.isLoadingInProgressOrders}
                connection={this.onConnectionChangeHandler}
            >
                <NavigationEvents onFocus={this.onWillFocusAccountContainer} navigationProps={this.props} />
                <KeyboardAwareScrollView
                    enableResetScrollToCoords={true}
                    style={styles.mainContainer}
                    keyboardShouldPersistTaps="always"
                    behavior="padding"
                    enabled>
                    <View style={styles.childContainer}>
                        {this.props.isLoggedIn ?
                            <View>
                                <EDAccountItem onPress={this.onPressHandler} icon={"edit"} iconType={'feather'} title={strings('accountsEditProfile')} />
                                <EDAccountItem onPress={this.onPressHandler} icon={"vpn-key"} title={strings('accountsChangePassword')} iconStyle={styles.passwordIconStyle} size={15} />
                            </View> : null}
                        {this.props.languageArray !== undefined && this.props.languageArray !== null && this.props.languageArray.length > 1 ?
                            <EDAccountItem languageArray={this.props.languageArray || []} lan={this.props.lan} isLoggedIn={this.props.isLoggedIn} onPress={this.onPressHandler} UserID={this.props.isLoggedIn ? this.props.userDetails.UserID : ""} token={this.props.isLoggedIn ? this.props.userDetails.PhoneNumber : ""} isForLanguage={true} icon={"message1"} iconType={"ant-design"} title={strings('accountsChooseLanguage')} />
                            : null}
                        {this.props.isLoggedIn ?
                            <EDAccountItem onPress={this.onPressHandler} size={25} icon={"exit-outline"} iconType={"ionicon"} title={strings('accountsSignOut')} /> : null}
                    </View>

                </KeyboardAwareScrollView>

            </BaseContainer>
        );
    }
    //#endregion

    //#region BUTTON EVENTS
    /** MENU BUTTON EVENT */
    buttonMenuPressed = () => {
        this.props.navigation.openDrawer();
    }

    onPressHandler = (title) => {
        if (title === strings('accountsEditProfile')) {
            this.props.navigation.navigate('editProfile');
        } else if (title === strings('accountsChangePassword')) {
            this.props.navigation.navigate('changePassword');
        } else if (title === strings('accountsSignOut')) {
            // this.setState({ isLogout: true });
            showDialogue(
                strings('generalLogoutAlert'),
                strings('loginAppName'),

                [{ text: strings('dialogCancel'), onPress: () => { } }],
                this.callLogoutAPI
                ,
                strings('accountsSignOut'),
                false,
                true
            );
        }
        
    }



    //#endregion

    //#region NETWORK

    /** LOGOUT API CALL */
    callLogoutAPI = () => {
        // CHECK INTERNET STATUS
        netStatus(isConnected => {
            if (isConnected) {
                this.setState({ isLoading: true });
                // LOGOUT PARAMS
                const logoutParams = {
                    user_id: this.props.userDetails.UserID,
                    language_slug: this.props.lan,
                };
                // LOGOUT CALL
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

        const selectedLanguage = this.props.lan;

        // DISMISS LOGOUT DIALOGUE
        this.setState({ isLoading: false });

        // CLEAR USER DETAILS IN REDUX
        this.props.saveUserDetailsInRedux({});
        this.props.saveLanguageRedux(selectedLanguage)

        // CLEAR USER DETAILS FROM ASYNC STORE
        flushAllData(
            _response => {

                // MAINTAIN THE SELECTED LANGUAGE IN ASYNC STORE
                saveLanguage(selectedLanguage, _successSaveLanguage => { }, _error => { });

                // TAKE THE USER TO INITIAL SCREEN
                this.props.navigation.popToTop();
                this.props.navigation.navigate('splash');
            },
            _error => { }
        );


    }

    /**
     *
     * @param {The failure response object returned in logout API} _objFailure
     */
    onLogoutFailure = _objFailure => {
        // DISMISS LOGOUT DIALOGUE
        this.setState({ isLoading: false });
        // setTimeout(() => {
        showTopDialogue(_objFailure.message, true);
        // }, 500);
    }
}

//#region STYLES
const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        //  backgroundColor: EDColors.offWhite
    },
    childContainer: { margin: 20 },
    passwordIconStyle: { borderWidth: 1, borderRadius: 8, borderColor: EDColors.text, padding: 2 },
});
//#endregion

export default connect(
    state => {
        return {
            userDetails: state.userOperations.userDetails || {},
            isLoggedIn: state.userOperations.isLoggedIn,
            lan: state.userOperations.lan,
            languageArray: state.userOperations.languageArray || [],
        };
    },
    dispatch => {
        return {
            saveUserDetailsInRedux: detailsToSave => {
                dispatch(saveUserDetailsInRedux(detailsToSave));
            },
            saveLanguageRedux: language => {
                dispatch(saveLanguageInRedux(language));
            },
        };
    }
)(AccountContainer);
