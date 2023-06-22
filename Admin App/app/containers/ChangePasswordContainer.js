/* eslint-disable comma-dangle */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable semi */
/* eslint-disable prettier/prettier */
import React from 'react'
import {
    View,
    StyleSheet,
    Image
} from 'react-native';
import { connect } from 'react-redux';
import { strings } from '../locales/i18n';
// import {
//     saveUserDetailsInRedux,
//     saveUserFCMInRedux,
//     saveLanguageInRedux
// } from '../redux/actions/UserActions'
import NavigationEvents from '../components/NavigationEvents';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { EDColors } from '../utils/EDColors';
import Validations from '../utils/Validations';
import EDRTLTextInput from '../components/EDRTLTextInput';
import { TextFieldTypes, isRTLCheck, getProportionalFontSize } from '../utils/EDConstants';
import EDThemeButton from '../components/EDThemeButton';
import { netStatus } from '../utils/NetworkStatusConnection';
import { changePassword } from '../utils/ServiceManager';
import { showNoInternetAlert, showTopDialogue } from '../utils/EDAlert';
import EDThemeHeader from '../components/EDThemeHeader';
import Metrics from '../utils/metrics';
import BaseContainer from './BaseContainer';
import { heightPercentageToDP } from 'react-native-responsive-screen';
import { EDFonts } from '../utils/EDFontConstants';
import { Icon } from 'react-native-elements';
import Assets from '../assets';

class ChangePasswordContainer extends React.Component {
    //#region LIFE CYCLE METHODS
    constructor(props) {
        super(props)
        this.validationsHelper = new Validations()
    }

    render() {
        return (

            <BaseContainer
                title={strings('accountsChangePassword')}
                left={isRTLCheck() ? 'arrow-forward' : 'arrow-back'}
                onLeft={this.buttonBackPressed}
                loading={this.state.isLoading || this.state.isLoadingInProgressOrders}
                connection={this.onConnectionChangeHandler}
            >
            <KeyboardAwareScrollView
                pointerEvents={this.state.isLoading ? 'none' : 'auto'}
                enableResetScrollToCoords={true}
                resetScrollToCoords={{ x: 0, y: 0 }}
                style={styles.scrollViewStyle}
                bounces={false}
                keyboardShouldPersistTaps="always"
                behavior="padding"
                enabled>

                <View pointerEvents={this.state.isLoading ? 'none' : 'auto'} >
                    <NavigationEvents
                        onFocus={this.onWillFocusEvent}
                        navigationProps={this.props}
                    />

                    {/* TEXT INPUTS CONTAINER */}
                    <View style={ [styles.textInputsContainer ]}>

                    <Image source={Assets.bg_password} style={styles.imageStyle} />
                    <View style={ [styles.textInputsContainer , {backgroundColor : EDColors.white , paddingHorizontal:15 , borderRadius : 16 , padding : 10 ,  elevation: 4,shadowColor:EDColors.shadowColor, shadowOffset: {width: 0,height: 8,},shadowOpacity: 0.44,shadowRadius: 10.32,}]}> 

                        {/* OLD PASSWORD INPUT */}
                        <EDRTLTextInput
                                type={TextFieldTypes.password}
                                identifier={'oldPassword'}
                                icon="lock"
                                placeholder={strings('profileOldPassword')}
                                onChangeText={this.textFieldTextDidChangeHandler}
                                initialValue={this.state.objChangePasswordDetails.oldPassword}
                                errorFromScreen={
                                    this.state.shouldPerformValidation
                                        ? this.validationsHelper.checkForEmpty(
                                            this.state.objChangePasswordDetails.oldPassword,
                                            strings('validationOldPasswordMsg'),
                                        )
                                        : ''
                                }
                            />

                        {/* NEW PASSWORD INPUT */}
                        <EDRTLTextInput
                                type={TextFieldTypes.password}
                                identifier={'newPassword'}
                                icon="lock"
                                placeholder={strings('profileNewPassword')}
                                onChangeText={this.textFieldTextDidChangeHandler}
                                initialValue={this.state.objChangePasswordDetails.newPassword}
                                errorFromScreen={
                                    this.state.shouldPerformValidation
                                        ? this.validationsHelper.validatePassword(
                                            this.state.objChangePasswordDetails.newPassword,
                                            strings('validationNewPasswordMsg'),
                                        )
                                        : ''
                                }
                            />
                        {/* CONFIRM PASSWORD INPUT */}
                        <EDRTLTextInput
                                type={TextFieldTypes.password}
                                identifier={'confirmPassword'}
                                icon="lock"
                                placeholder={strings('profileConfirmPassword')}
                                onChangeText={this.textFieldTextDidChangeHandler}
                                initialValue={this.state.objChangePasswordDetails.confirmPassword}
                                errorFromScreen={
                                    this.state.shouldPerformValidation
                                        ? this.validationsHelper.validateConfirmPassword(
                                            this.state.objChangePasswordDetails.newPassword,
                                            this.state.objChangePasswordDetails.confirmPassword,
                                            strings('validationPasswordSameMsg'),
                                        )
                                        : ''
                                }
                            />

                        {/* SAVE BUTTON */}
                        <EDThemeButton
                            style={[styles.themeButtonStyle]}
                            label={strings('profileSave')}
                            isLoading={false}
                            onPress={this.buttonSavePressed}
                            isRadius={true}
                            textStyle={styles.buttonTextStyle}
                        />
                    </View>
                    </View>
                </View>
            </KeyboardAwareScrollView>

            </BaseContainer>
        )
    }
    //#endregion

    //#region STATE
    state = {
        isLoading: false,
        shouldPerformValidation: false,
        isModalVisible: false,
        objChangePasswordDetails: { oldPassword: '', newPassword: '', confirmPassword: '' },
    }
    //#endregion

    //#region TEXT CHANGE EVENTS
    /**
     *
     * @param {Value of textfield whatever user type} value
     ** @param {Unique identifier for every text field} identifier
     */
    textFieldTextDidChangeHandler = (value, identifier) => {
        this.state.objChangePasswordDetails[identifier] = value
        this.setState({ shouldPerformValidation: false })
    }
    //#endregion

    //#region BUTTON EVENTS
    /**
     *
     * @param {Checking all conditions and redirect to home screen on success}
     */
    buttonSavePressed = () => {
        this.setState({ shouldPerformValidation: true })
        if (this.validationsHelper.checkForEmpty(this.state.objChangePasswordDetails.oldPassword, strings('validationOldPasswordMsg')).length > 0 ||
            this.validationsHelper.validatePassword(this.state.objChangePasswordDetails.newPassword, strings('validationNewPasswordMsg')).length > 0 ||
            this.validationsHelper.validateConfirmPassword(
                this.state.objChangePasswordDetails.newPassword,
                this.state.objChangePasswordDetails.confirmPassword,
                strings('validationNewPasswordMsg')).length > 0
        ) {
            return
        }

        this.callChangePasswordAPI()
    }
    //#region NETWORK METHODS

    /**
     *
     * @param {The success response object} objSuccess
     */
    onChangePasswordSuccess = objSuccess => {
        // this.setState({ isLoading: false })
        showTopDialogue(objSuccess.message || strings('validationPasswordSuccess'), false);
        setTimeout(() => {
            this.buttonBackPressed()
        }, 3000)
        // this.buttonBackPressed()
    }
    /**
    *
    * @param {The failure response object} objFailure
    */
    onChangePasswordFailure = objFailure => {
        this.setState({ isLoading: false })
        showTopDialogue(objFailure.message, true)
    }

    /** REQUEST CHANGE PASSWORD */
    callChangePasswordAPI = () => {

        netStatus(isConnected => {
            if (isConnected) {
                let objChangePasswordParams = {
                    language_slug: this.props.lan,
                    user_id: this.props.userDetails.UserID || 0,
                    token: '' + this.props.userDetails.PhoneNumber,
                    old_password: this.state.objChangePasswordDetails.oldPassword,
                    password: this.state.objChangePasswordDetails.newPassword,
                    confirm_password: this.state.objChangePasswordDetails.confirmPassword,
                };
                this.setState({ isLoading: true });
                changePassword(objChangePasswordParams, this.onChangePasswordSuccess, this.onChangePasswordFailure, this.props);
            } else {
                showNoInternetAlert()
            }
        })
    }
    buttonBackPressed = () => {
        this.props.navigation.goBack()
    }
    //#endregion

    onWillFocusEvent = () => {
        this.setState({ shouldPerformValidation: false })
    }
}
//#region STYLES
const styles = StyleSheet.create({
    mainViewStyle: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: EDColors.white
    },
    textInputsContainer: {
        marginVertical: 44,
        marginHorizontal: 10
    },
    scrollViewStyle: { flex: 1 },
    themeButtonStyle:{ width: Metrics.screenWidth - 65, backgroundColor: EDColors.primary, marginTop: 40, borderRadius : 16 ,height: heightPercentageToDP('7.5%'), },
    imageStyle: {alignSelf:'center'},
    buttonTextStyle: {fontFamily: EDFonts.medium , fontSize: getProportionalFontSize(16)},
})
//#endregion
export default connect(
    state => {
        return {
            lan: state.userOperations.lan,
            userDetails: state.userOperations.userDetails || {},
        }
    },
    dispatch => {
        return {
            
        }
    }
)(ChangePasswordContainer)
