/* eslint-disable react-native/no-inline-styles */
/* eslint-disable semi */
/* eslint-disable prettier/prettier */
import React from 'react';
import {
    View,
    StyleSheet,
} from 'react-native';
import { connect } from 'react-redux';
import { strings } from '../locales/i18n';
import {
    saveUserDetailsInRedux,
    saveUserFCMInRedux,
    saveLanguageInRedux
} from '../redux/actions/UserActions';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { EDColors } from '../utils/EDColors';
import { EDFonts } from '../utils/EDFontConstants';
import Validations from '../utils/Validations';
import { heightPercentageToDP } from 'react-native-responsive-screen';
import { TextFieldTypes, isRTLCheck, getProportionalFontSize } from '../utils/EDConstants';
import EDThemeButton from '../components/EDThemeButton';
import { netStatus } from '../utils/NetworkStatusConnection';
import {  editProfile } from '../utils/ServiceManager';
import { showNoInternetAlert, showTopDialogue } from '../utils/EDAlert';
import BaseContainer from './BaseContainer';
import EDProfilePicture from '../components/EDProfilePicture';
import { saveUserLoginDetails,  getUserLoginDetails } from '../utils/AsyncStorageHelper';
import NavigationEvents from '../components/NavigationEvents';
import EDRTLTextInput from '../components/EDRTLTextInput';
import EDRTLView from '../components/EDRTLView';
import ToggleSwitch from 'toggle-switch-react-native';
import EDRTLText from '../components/EDRTLText';
import Metrics from '../utils/metrics';


class EditProfileContainer extends React.Component {
    //#region LIFE CYCLE METHODS
    constructor(props) {
        super(props)
        this.validationsHelper = new Validations()
        this.avatarSource = undefined
    }
    getUserProfile = () => {
        getUserLoginDetails(
            success => {
                this.props.saveUserDetailsInRedux(success)
            },
            () => {
            },
        )
    }
    render() {
        return (
            <BaseContainer
                title={strings('profileTitle')}
                left = { isRTLCheck() ? 'arrow-forward' : 'arrow-back' }
                onLeft={this.buttonBackPressed}
                loading={this.state.isLoading}
            >
                {/* KEYBOARD AVOIDING SCROLL VIEW */}
                <KeyboardAwareScrollView
                    pointerEvents={this.state.isLoading ? 'none' : 'auto'}
                    enableResetScrollToCoords={true}
                    resetScrollToCoords={{ x: 0, y: 0 }}
                    style={styles.keyboardAwareScrollViewStyle}
                    bounces={false}
                    keyboardShouldPersistTaps="always"
                    behavior="padding"
                    enabled>

                    <NavigationEvents onFocus={this.getUserProfile} navigationProps={this.props} />
                    {/* PARENT CONTAINER */}
                    <View pointerEvents={this.state.isLoading ? 'none' : 'auto'} style={styles.mainViewStyle}>

                        {/* PROFILE IMAGE COMPONENT */}
                        <EDProfilePicture imagePath={this.props.userDetails.image} onImageSelectionHandler={this.onImageSelectionHandler} style={styles.profilePictureStyle} />

                        {/* TEXT INPUTS CONTAINER */}
                        <View style={styles.textInputsContainer}>


                            {/* FIRST NAME FIELD - EDITABLE */}
                            <EDRTLTextInput
                                icon="person"
                                identifier={'FirstName'}
                                initialValue={this.state.firstName}
                                onChangeText={this.firstNameChanged}
                                placeholder={strings('profileFirstName')}
                                labelStyle={styles.labelStyle}
                                style={ styles.textInputStyle }
                                customIcon={"pencil"}
                                focusText={this.state.firstName.charAt(this.state.firstName.length - 1)}
                                focusOnPress={true}
                                isEditIcon={true}
                            />

                            {/* LAST NAME FIELD - EDITABLE */}
                            <EDRTLTextInput
                                icon="person"
                                identifier={'LastName'}
                                initialValue={this.state.lastName}
                                onChangeText={this.lastNameChanged}
                                labelStyle={styles.labelStyle}
                                placeholder={strings('profileLastName')}
                                style={ styles.textInputStyle }
                                customIcon={"pencil"}
                                // focusText={this.state.lastName}
                                focusOnPress={true}
                                isEditIcon={true}
                            />

                            {/* EMAIL FIELD - UNEDITABLE */}
                            <EDRTLTextInput
                                type={TextFieldTypes.default}
                                icon="mail"
                                editableBox={false}
                                initialValue={this.state.objProfileDetails.Email}
                                labelStyle={styles.labelStyle}
                                placeholder={strings('profileEail')}
                                style={ styles.textInputStyle }
                            />

                            {/* PHONE NUMBER FIELD - UNEDITABLE */}
                            <EDRTLTextInput
                                type={TextFieldTypes.phone}
                                countryData={this.props.countryData}
                                dialCode={this.state.objProfileDetails.phone_code}
                                icon="call"
                                labelStyle={styles.labelStyle}
                                editableBox={false}
                                initialValue={this.state.objProfileDetails.PhoneNumber}
                                placeholder={strings('loginPhone')}
                                style={ styles.textInputStyle }
                            />

                            <View style={styles.notificationMainViewStyle} >
                                <EDRTLView style={styles.notificationEDRTLViewStyle}>
                                     <EDRTLText style={styles.notificationChildEDRTLViewStyle} title={strings('profileNotification')} />
                                    <View style={styles.switchView} >
                                        <ToggleSwitch
                                          isOn={this.state.isNotificationAllowed}
                                          onColor={EDColors.primary}
                                          offColor={EDColors.text}
                                          onToggle={this.didChangeNotificationSettings}
                                          size={'small'}
                                        />
                                    </View>
                                </EDRTLView>
                            </View>

                        </View>

                        {/* SAVE BUTTON */}
                        <View style = {styles.switchView} >
                        <EDThemeButton
                            label={strings('profileSave')}
                            // isLoading={this.state.isLoading}
                            onPress={this.buttonSavePressed}
                            isRadius={true}
                            textStyle={styles.buttonTextStyle}
                            style={styles.buttonStyle}
                        />      
                        </View>

                    </View>
                </KeyboardAwareScrollView >
            </BaseContainer >
        )
    }
    //#endregion

    //#region STATE
    state = {
        isLoading: false,
        objProfileDetails: this.props.userDetails,
        firstName: this.props.userDetails.FirstName,
        lastName: this.props.userDetails.LastName,
        isNotificationAllowed: this.props.userDetails.notification === '1',
    }
    //#endregion

    //#region HELPER METHODS
    navigateToAddressList = () => {
        this.props.navigation.navigate('addressList', { isSelectAddress: false })
    }
    /**
     *
     * @param {The image response received from image picker} imageSource
     */
    onImageSelectionHandler = (imageSource) => {
        this.avatarSource = imageSource
    }

    firstNameChanged = (value) => {
        this.setState({ firstName: value })
    }

    lastNameChanged = (value) => {
        this.setState({ lastName: value })
    }

    /**
     *
     * @param {Value of notification switch} value
     */
    didChangeNotificationSettings = () => {
        this.setState({ isNotificationAllowed: !this.state.isNotificationAllowed })
    }
    //#endregion

    //#region BUTTON EVENTS
    /**
     *
     * @param {Checking all conditions and redirect to home screen on success}
     */
    buttonSavePressed = () => {
        if (this.validationsHelper.checkForEmpty(this.state.firstName, strings('validationEmptyFirstName')).length > 0) {
            showTopDialogue(strings('validationEmptyFirstName'), true)
            return
        }
        if (this.validationsHelper.checkForEmpty(this.state.lastName, strings('validationEmptyLastName')).length > 0) {
            showTopDialogue(strings('validationEmptyLastName'), true)
            return
        }

        this.callEditProfileAPI()
    }

    /** EDIT BUTTON EVENT */
    buttonEditPressed = () => {
        this.secondTextInput.focus()
    }

    //#region NETWORK METHODS

    /**
     *
     * @param {The success response object} objSuccess
     */
    onEditProfileSuccess = objSuccess => {
        // this.setState({ isLoading: false })
        if (objSuccess.data !== undefined && objSuccess.data.profile !== undefined) {
            this.props.saveUserDetailsInRedux(objSuccess.data.profile)
            saveUserLoginDetails(
                objSuccess.data.profile,
                onSuccess => {},
                onFailure => {} )
        }
        showTopDialogue(objSuccess.message || strings('profileProfileUpdate'), false )
        setTimeout(() => {
            this.props.navigation.goBack()
        }, 3000)
        // this.props.navigation.goBack()
    }

    /**
    *
    * @param {The failure response object} objFailure
    */
    onEditProfileFailure = objFailure => {
        this.setState({ isLoading: false })
        showTopDialogue(objFailure.message, true)
    }

    /** REQUEST CHANGE PASSWORD */
    callEditProfileAPI = () => {

        netStatus(isConnected => {
            if (isConnected) {
                let objEditProfileDetails = {
                    user_id: this.state.objProfileDetails.UserID || 0,
                    first_name: this.state.firstName,
                    last_name: this.state.lastName,
                    language_slug: this.props.lan,
                    image: this.avatarSource,
                    notification: this.state.isNotificationAllowed ? '1' : '0',
                    email: this.state.objProfileDetails.Email,
                    token:this.state.objProfileDetails.PhoneNumber,
                };

                this.setState({ isLoading: true });
                editProfile(objEditProfileDetails, this.onEditProfileSuccess, this.onEditProfileFailure, this.props);
            } else {
                showNoInternetAlert()
            }
        })
    }

    buttonBackPressed = () => {
        this.props.navigation.goBack()
    }
    //#endregion

}


//#region STYLES
const styles = StyleSheet.create({
    mainViewStyle: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: EDColors.offWhite,
    },
    textInputsContainer: {
        backgroundColor: EDColors.white,
        borderRadius: 16,
        padding: 5,
        margin: 10,
        shadowOpacity: 0.25,
        shadowRadius: 5,
        shadowColor: EDColors.text,
        shadowOffset: { height: 0, width: 0 },
        paddingHorizontal:10
    },
    keyboardAwareScrollViewStyle: { flex: 1, backgroundColor: EDColors.offWhite },
    textInputStyle: { marginHorizontal: 0 },
    notificationMainViewStyle: { backgroundColor: EDColors.white, alignItems: 'center', borderColor: EDColors.shadow, borderRadius: 5, borderWidth: 0, marginVertical : 10, marginTop:15 ,paddingVertical:0 , marginHorizontal:0 },
    notificationEDRTLViewStyle: { alignItems: 'center', height: heightPercentageToDP('6.5%') },
    notificationIconStyle: { marginHorizontal: 10 },
    notificationChildEDRTLViewStyle: { flex : 1, fontFamily: EDFonts.semibold, color: EDColors.grayNew, fontSize: getProportionalFontSize(16), fontWeight:"normal", marginHorizontal:5},
    notificationChildViewStyle: { borderLeftWidth : 1, borderColor : EDColors.buttonUnreserve, height : getProportionalFontSize(16) + 30, marginLeft : 8, marginRight: 8 },
    switchView: { marginHorizontal : 5 },
    profilePictureStyle: {marginVertical:10},
    labelStyle: {fontSize : getProportionalFontSize(12)},
    buttonTextStyle: {fontFamily : EDFonts.medium , fontSize: getProportionalFontSize(16)},
    buttonStyle: {fontFamily : EDFonts.medium , fontSize: getProportionalFontSize(16)}
})
//#endregion


export default connect(
    state => {
        return {
            lan: state.userOperations.lan,
            userDetails: state.userOperations.userDetails || {},
            code: state.userOperations.code,
            countryData: state.userOperations.countryData || {}
        }
    },
    dispatch => {
        return {
            saveUserDetailsInRedux: detailsToSave => {
                dispatch(saveUserDetailsInRedux(detailsToSave))
            },
            saveToken: token => {
                dispatch(saveUserFCMInRedux(token))
            },
            saveLanguageRedux: language => {
                dispatch(saveLanguageInRedux(language))
            }
        }
    }
)(EditProfileContainer)
