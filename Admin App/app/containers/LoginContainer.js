/* eslint-disable react-native/no-inline-styles */
/* eslint-disable semi */
/* eslint-disable prettier/prettier */
import React from 'react';
import {
    View,
    StyleSheet, TouchableOpacity
} from 'react-native';
import { connect } from 'react-redux';
import { strings } from '../locales/i18n';
import CardFlip from 'react-native-card-flip/CardFlip';
import { saveLanguageInRedux, saveUserDetailsInRedux } from '../redux/actions/UserActions';
// import { StackActions, NavigationActions } from 'react-navigation'
import { CommonActions } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { EDFonts } from '../utils/EDFontConstants';
import I18n from "i18n-js";
import { EDColors } from '../utils/EDColors';
import RNRestart from 'react-native-restart';
import Validations from '../utils/Validations';
import EDRTLTextInput from '../components/EDRTLTextInput';
import { TextFieldTypes, getProportionalFontSize, isRTLCheck } from '../utils/EDConstants';
import EDThemeButton from '../components/EDThemeButton';
import EDUnderlineButton from '../components/EDUnderlineButton';
import Metrics from '../utils/metrics';
import EDThemeHeader from '../components/EDThemeHeader';
import EDPopupView from '../components/EDPopupView';
import EDForgotPassword from '../components/EDForgotPassword';
import { saveLanguage, saveUserLoginDetails } from '../utils/AsyncStorageHelper';
import { netStatus } from '../utils/NetworkStatusConnection';
import { showNoInternetAlert, showTopDialogue } from '../utils/EDAlert';
import { loginUser } from '../utils/ServiceManager';
import { Icon } from "react-native-elements";
import EDRTLText from "../components/EDRTLText";
import EDRTLView from '../components/EDRTLView';
import EDLanguageSelect from '../components/EDLanguageSelect';



class LoginContainer extends React.Component {
    //#region LIFE CYCLE METHODS
    constructor(props) {
        super(props)
        this.validationsHelper = new Validations(),
            this.countryCode = "91"
        this.useEmail =
            this.props.navigation.state !== undefined &&
                this.props.route.params !== undefined &&
                this.props.route.params.useEmail !== undefined ?
                this.props.route.params.useEmail : false
    }
    buttonBackPressed = () => {
        this.props.navigation.navigate('splash');
    }

    async componentDidMount() {
        if (this.props.countryData !== undefined && this.props.countryData !== null && this.props.countryData[0] !== undefined && this.props.countryData[0].phonecode !== undefined) {
            this.countryCode = this.props.countryData[0].phonecode
        }
    }

    onCountrySelect = country => {
        this.countryCode = country.callingCode[0]
    }

    renderLanguageSelectDialogue = () => {
        return (
            <EDPopupView isModalVisible={this.state.languageModal}>
                <EDLanguageSelect
                    languages={this.props.languageArray || []}
                    lan={this.props.lan}
                    onChangeLanguageHandler={this.onChangeLanguageHandler}
                    onDismissHandler={this.onDismissHandler}
                    title={strings('accountsSelectLanguage')}
                />
            </EDPopupView>
        )
    }
    onDismissHandler = () => {
        this.setState({ languageModal: false })
    }

    onChangeLanguageHandler = (lan) => {
        this.setState({ languageModal: false })
        // let lan = I18n.currentLocale();
        // switch (language) {
        //     case 0: {
        //         lan = "en";
        //         I18n.locale = "en";
        //         break;
        //     }
        //     case 1: {
        //         lan = "fr";
        //         I18n.locale = "fr";
        //         break;
        //     }
        //     case 2: {
        //         lan = "ar";
        //         I18n.locale = "ar";
        //         break;
        //     }
        // }
        // this.props.saveLanguageRedux(lan);
        saveLanguage
            (
                lan,
                success => {
                    RNRestart.Restart();
                },
                error => { }
            );


    }

    _onChangeLanguagePressed = () => {
        this.setState({ languageModal: true })
    }


    render() {
        // console.log('------------------' , this.state.useEmail)
        return (
            <View style={styles.parentView}>
                <KeyboardAwareScrollView
                    style={styles.parentView}
                    bounces={false}
                    keyboardShouldPersistTaps="always"
                    behavior="padding"
                    enabled>

                    {/* MAIN VIEW */}
                    <View pointerEvents={this.state.isLoading ? 'none' : 'auto'} style={styles.mainViewStyle}>

                        {/* FORGOT PASSWORD DIALOGUE */}
                        {this.renderForgotPasswordDialogue()}

                        {this.renderLanguageSelectDialogue()}
                        {/* HEADER IMAGE */}
                        <EDThemeHeader
                            // icon = { isRTLCheck() ? 'arrow-forward' : 'arrow-back' }
                            // onLeftButtonPress={this.buttonBackPressed}
                            title={strings('loginTitle')}
                            onLanguagePress={this._onChangeLanguagePressed}
                            lan={this.props.lan}
                            languageArray={this.props.languageArray}
                            showLogo={true}
                        />

                        {/* FIELDS VIEW */}
                        <View style={styles.textFieldStyle}>
                            <View style={styles.textInputViewStyle}>
                                <CardFlip
                                    clickable={false}
                                    flip={this.state.useEmail}
                                    useNativeDriver={true}
                                    flipHorizontal
                                    ref={ref => this.cardView = ref}
                                >
                                    {/* PHONE/EMAIL INPUT */}
                                    {this.state.useEmail ? null :
                                        <EDRTLTextInput
                                            icon="call"
                                            countryData={this.props.countryData}
                                            type={TextFieldTypes.phone}
                                            identifier={'phoneNumber'}
                                            onCountrySelect={this.onCountrySelect}
                                            placeholder={strings('loginPhone')}
                                            onChangeText={this.phoneNunberDidChange}
                                            initialValue={this.state.phoneNumber}
                                            errorFromScreen={
                                                this.state.shouldPerformValidation
                                                    ? this.validationsHelper.validateLoginMobile(
                                                        this.state.phoneNumber,
                                                        strings('validationEmptyPhone'),
                                                        this.countryCode
                                                    )
                                                    : ''
                                            }
                                        />}
                                    {this.state.useEmail ?
                                        <EDRTLTextInput
                                            type={TextFieldTypes.email}
                                            identifier={'email'}
                                            icon="mail"
                                            placeholder={strings('loginEmail')}
                                            onChangeText={this.textFieldTextDidChangeHandler}
                                            initialValue={this.state.objLoginDetails.email}
                                            errorFromScreen={
                                                this.state.shouldPerformValidation
                                                    ? this.validationsHelper.validateEmail(
                                                        this.state.objLoginDetails.email,
                                                        strings('validationEmptyEmail'),
                                                    )
                                                    : ''
                                            }
                                        />
                                        : null}
                                </CardFlip>
                                {/* PASSWORD INPUT */}
                                <EDRTLTextInput
                                    textstyle={styles.textStyle}
                                    type={TextFieldTypes.password}
                                    identifier={'password'}
                                    icon="lock"
                                    placeholder={strings('loginPassword')}
                                    onChangeText={this.textFieldTextDidChangeHandler}
                                    initialValue={this.state.objLoginDetails.password}
                                    errorFromScreen={
                                        this.state.shouldPerformValidation
                                            ? this.validationsHelper.checkForEmpty(
                                                this.state.objLoginDetails.password,
                                                strings('validationEmptyPassword'),
                                            )
                                            : ''
                                    }
                                />
                            </View>
                            {/* FORGOT PASSWORD */}
                            <EDRTLView style={styles.forgetView}>

                                {/* REMEMBER ME */}
                                <TouchableOpacity
                                    onPress={this.toggleRemeber}
                                    style={{ marginRight: isRTLCheck() ? 0 : 5, }}
                                >
                                    <EDRTLView style={styles.rememberViewStyle}>
                                        <Icon name={this.state.remember ? "check-square" : "square"} type={'feather'} color={EDColors.text} size={getProportionalFontSize(18)} />
                                        <EDRTLText title={strings("loginRemember")} style={styles.rememberText} numberOfLines={2} />
                                    </EDRTLView>
                                </TouchableOpacity>

                                {/* FORGOT PASSWORD */}
                                {/* <EDUnderlineButton
                                buttonStyle={styles.forgotPasswordButton}
                                textStyle={styles.forgotPasswordText}
                                onPress={this.buttonForgotPasswordPressed}
                                label={strings('loginForgotPassword')+"?"}
                            /> */}
                                <TouchableOpacity style={{ flex: 1 }} onPress={this.buttonForgotPasswordPressed} >
                                    <EDRTLText title={strings('loginForgotPassword') + "?"} style={[styles.forgotPasswordText, { textDecorationLine: "underline", textAlign: isRTLCheck() ? "left" : "right" }]}
                                    />
                                </TouchableOpacity>
                            </EDRTLView>

                            {/* LOGIN BUTTON */}
                            <EDThemeButton
                                style={styles.signInButton}
                                label={strings('loginTitle')}
                                isLoading={this.state.isLoading}
                                onPress={this.buttonLoginPressed}
                                isRadius={true}
                                textStyle={styles.buttonTextStyle}
                            />

                            {/* signIn with */}
                            <View style={styles.footerStyle}>

                                <EDUnderlineButton
                                    buttonStyle={styles.signInWithButton}
                                    textStyle={styles.forgotPasswordText}
                                    onPress={this.toggleView}
                                    label={this.state.useEmail ? strings('loginSignWithPhone') : strings('loginSignWithEmail')}
                                />
                            </View>
                        </View>
                    </View>
                </KeyboardAwareScrollView>
            </View>
        )
    }

    toggleView = () => {
        this.state.objLoginDetails.email = ""
        this.state.objLoginDetails.password = ""

        this.setState({ useEmail: !this.state.useEmail, shouldPerformValidation: false, phoneNumber: "" })
        this.cardView.flipX()
    }

    toggleRemeber = () => {
        this.setState({ remember: !this.state.remember })
    }

    /** RENDER LOGOUT DIALOGUE */
    renderForgotPasswordDialogue = () => {
        return (
            <EDPopupView isModalVisible={this.state.shouldShowForgotPasswordDialogue} onRequestClose={this.onDismissForgotPasswordHandler}>
                <EDForgotPassword
                    lan={this.props.lan}
                    onDismissHandler={this.onDismissForgotPasswordHandler} />
            </EDPopupView>
        );
    }
    //#endregion

    //#region FORGOT PASSWORD BUTTON EVENTS
    onDismissForgotPasswordHandler = () => {
        this.setState({ shouldShowForgotPasswordDialogue: false })
    }
    //#endregion

    //#region STATE
    state = {
        isLoading: false,
        shouldPerformValidation: false,
        objLoginDetails: {
            email: '',
            password: ''
        },
        phoneNumber: '',
        shouldShowForgotPasswordDialogue: false,
        remember: true,
        useEmail: false,
        languageModal: false
    }
    //#endregion

    //#region TEXT CHANGE EVENTS
    /**
     *
     * @param {Value of textfield whatever user type} value
     ** @param {Unique identifier for every text field} identifier
     */
    textFieldTextDidChangeHandler = (value, identifier) => {
        this.state.objLoginDetails[identifier] = value
        this.setState({ shouldPerformValidation: false })
    }
    //#endregion

    phoneNunberDidChange = (value) => {
        this.state.phoneNumber = value
        this.setState({ shouldPerformValidation: false })
    }

    //#region BUTTON EVENTS
    /**
     *
     * @param {Checking all conditions and redirect to home screen on success}
     */
    buttonLoginPressed = () => {
        // console.log('---------------------')
        this.setState({ shouldPerformValidation: true })
        if (this.state.useEmail) {
            if (
                this.validationsHelper.validateEmail(this.state.objLoginDetails.email.trim(),
                    strings('validationEmptyEmail')).length > 0 ||
                this.validationsHelper.checkForEmpty(this.state.objLoginDetails.password.trim(),
                    strings('validationEmptyPassword')).length > 0
            ) {
                return
            } else {
                this.callLoginApi()
            }
        } else {
            if (
                this.validationsHelper.validateLoginMobile(this.state.phoneNumber.trim(),
                    strings('validationEmptyPhone')).length > 0 ||
                this.validationsHelper.checkForEmpty(this.state.objLoginDetails.password.trim(),
                    strings('validationEmptyPassword')).length > 0
            ) {
                return
            } else {
                this.callLoginApi()
            }
        }
    }


    //#endregion

    /**
     * Navigate to home after login
     */

    navigateToHome = (dataToSave) => {
        this.props.saveUserDetailsInRedux(dataToSave)

        saveUserLoginDetails(
            dataToSave,
            successAsyncStore => {
                this.props.navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [{ name: isRTLCheck() ? 'homeRight' : 'home' }],
                        // actions: [NavigationActions.navigate({ routeName:  isRTLCheck() ? 'homeRight' : 'home' })],
                    }),
                )
            },
            errorAsyncStore => {
                showTopDialogue('Login fail, Please try again')
            },
        )

    }

    /** NETWORKS */
    /**
     * @param { on login success }
     */
    onLoginUserSuccessful = (onSuccess) => {
        if (onSuccess.data !== undefined && onSuccess.data.login !== undefined) {
            this.navigateToHome(onSuccess.data.login)

        }
        this.setState({ isLoading: false })

    }

    onLoginUserFailure = onFailure => {
        this.setState({ isLoading: false })
        showTopDialogue(onFailure.message, true, true,
            () => {
                this.setState({ shouldPerformValidation: false })
            })
    }

    /**
    * Api call for user to login
    */

    callLoginApi = () => {
        netStatus(status => {
            if (status) {
                this.setState({ isLoading: true })
                let loginParams = {
                    Email: this.state.objLoginDetails.email,
                    Password: this.state.objLoginDetails.password,
                    language_slug: this.props.lan,
                    phone_code: this.countryCode
                }
                loginParams[this.state.useEmail ? 'Email' : 'PhoneNumber'] = this.state.useEmail ? this.state.objLoginDetails.email : this.state.phoneNumber
                loginUser(loginParams, this.onLoginUserSuccessful, this.onLoginUserFailure, this.props)
            }
            else {
                showNoInternetAlert()
            }
        })
    }

    /**
     *
     * @param {Redirecting user to forgot screen on forgot button click}
     */
    buttonForgotPasswordPressed = () => {
        this.setState({ shouldShowForgotPasswordDialogue: true })
    }
}


//#region STYLES
const styles = StyleSheet.create({
    parentView: {
        flex: 1,
        backgroundColor: EDColors.white
    },
    mainViewStyle: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: EDColors.white,
    },
    textFieldStyle: {
        marginVertical: 50,
        marginHorizontal: 10,
    },
    textInputViewStyle: { marginHorizontal: 15 },
    rememberViewStyle: {
        alignItems: "center",
        marginHorizontal: 10
    },
    forgotPasswordButton: {
        borderBottomColor: EDColors.text,
        alignSelf: 'flex-end',
        marginHorizontal: 20,
        marginVertical: 15,
        flex: 1
    },
    forgotPasswordText: {
        color: EDColors.black,
        fontFamily: EDFonts.semibold,
        fontSize: getProportionalFontSize(14),
    },
    signInButton: {
        width: Metrics.screenWidth - 40,
        backgroundColor: EDColors.primary,
        marginTop: 40, height: Metrics.screenHeight * 0.07, borderRadius: 16
    },
    buttonTextStyle: { fontFamily: EDFonts.semibold, fontSize: getProportionalFontSize(16) },
    textStyle: { color: EDColors.black, fontSize: getProportionalFontSize(16), marginTop: 0, },
    forgetView: { alignItems: "center", marginTop: 30, justifyContent: "space-between", flex: 1 },
    footerStyle: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 25 },
    signInWithButton: {
        borderBottomColor: EDColors.text,
        alignSelf: 'center', color: EDColors.primary,
        marginHorizontal: 20,
        marginVertical: 15
    },
    rememberText: { fontFamily: EDFonts.semibold, fontSize: getProportionalFontSize(14), color: EDColors.text, marginHorizontal: 8 },
})
//#endregion


export default connect(
    state => {
        return {
            lan: state.userOperations.lan,
            countryData: state.userOperations.countryData || {},
            lan: state.userOperations.lan,
            languageArray: state.userOperations.languageArray || {},
        }
    },
    dispatch => {
        return {
            saveUserDetailsInRedux: detailsToSave => {
                dispatch(saveUserDetailsInRedux(detailsToSave))
            },
            saveLanguageRedux: userLan => {
                dispatch(saveLanguageInRedux(userLan))
            },
        }
    }
)(LoginContainer)
