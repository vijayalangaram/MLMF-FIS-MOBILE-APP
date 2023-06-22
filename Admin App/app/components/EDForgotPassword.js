/* eslint-disable react/no-string-refs */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { EDColors } from '../utils/EDColors';
import { strings } from '../locales/i18n';
import EDRTLTextInput from './EDRTLTextInput';
import { TextFieldTypes, isRTLCheck, getProportionalFontSize } from '../utils/EDConstants';
import EDThemeButton from './EDThemeButton';
import Validations from '../utils/Validations';
import { showNoInternetAlert, showTopDialogue } from '../utils/EDAlert';
import { netStatus } from '../utils/NetworkStatusConnection';
import EDRTLView from './EDRTLView';
import { Icon } from 'react-native-elements';
import { forgotPassword } from '../utils/ServiceManager';
import Metrics from '../utils/metrics';
import { EDFonts } from '../utils/EDFontConstants';
import EDRTLText from './EDRTLText';

export default class EDForgotPassword extends React.Component {
    //#region LIFE CYCLE METHODS
    constructor(props) {
        super(props);
        this.validationsHelper = new Validations();
    }

    render() {
        return (
            <View style={styles.modalContainer} pointerEvents={this.state.isLoading ? 'none' : 'auto'}>
                <View style={styles.modalSubContainer}>
                    <EDRTLView style={styles.buttonViewStyle}>
                        <EDRTLText title={strings("loginForgotPassword")} style={{
                            fontFamily: EDFonts.bold,
                            color: EDColors.black,
                            fontSize: getProportionalFontSize(16)
                        }} />
                        <TouchableOpacity
                            onPress={this.props.onDismissHandler}
                            style={[styles.buttonStyle, { alignSelf: isRTLCheck() ? 'flex-start' : 'flex-end' }]}>
                            <Icon name={'close'} size={getProportionalFontSize(17)} color={EDColors.text} />
                        </TouchableOpacity>
                    </EDRTLView>
                    {/* EMAIL INPUT */}
                    <EDRTLTextInput
                        type={TextFieldTypes.email}
                        identifier={'email'}
                        errorMessageStyle={styles.errorMessageStyle}
                        icon="email"
                        placeholder={strings('loginEmail')}
                        onChangeText={this.textFieldTextDidChangeHandler}
                        initialValue={this.state.email}
                        autoFocus={true}
                        errorFromScreen={
                            this.state.shouldPerformValidation
                                ? this.validationsHelper.validateEmail(
                                    this.state.email,
                                    strings('validationEmptyEmail'),
                                )
                                : ''
                        }
                    />
                    {/* SUBMIT BUTTON */}
                    <EDThemeButton
                        label={strings('generalSubmit')}
                        isLoading={this.state.isLoading}
                        onPress={this.onSubmitButtonHandler}
                        isRadius={true}
                        style={styles.themeButtonStyle}
                        textStyle={styles.buttonTextStyle}
                    />
                </View>
            </View>
        );
    }

    state = {
        shouldPerformValidation: false,
        isLoading: false,
        email: '',
    }

    //#region TEXT CHANGE EVENTS
    textFieldTextDidChangeHandler = (newEmail) => {
        this.state.email = newEmail;
        this.setState({ shouldPerformValidation: false });
    }
    //#endregion

    //#region BUTTON EVENTS
    onSubmitButtonHandler = () => {
        this.setState({ shouldPerformValidation: true });
        if (
            this.validationsHelper.validateEmail(this.state.email.trim(),
                strings('validationEmptyEmail')).length > 0) {
            return;
        }
        this.callForgotPasswordAPI();
    }
    //#endregion

    //#region NETWORK
    /**
    *
    * @param {The success response object} objSuccess
    */
    onForgotPasswordSuccess = objSuccess => {
        // console.log(this.props.onDismissHandler());
        this.setState({ isLoading: false });
        if (this.props.onDismissHandler !== undefined) {
            this.props.onDismissHandler();
        }
        showTopDialogue(objSuccess.message, false, true, () => {
            if (this.props.onDismissHandler !== undefined) {
                this.props.onDismissHandler();
            }
        });
    }

    /**
    *
    * @param {The success response object} objSuccess
    */
    onForgotPasswordFailure = objFailure => {
        this.setState({ isLoading: false });
        showTopDialogue(objFailure.message, true);
    }


    callForgotPasswordAPI = () => {
        netStatus(isConnected => {
            if (isConnected) {
                let objForgotPasswordParams = {
                    language_slug: this.props.lan,
                    Email: this.state.email,
                };
                this.setState({ isLoading: true });
                forgotPassword(objForgotPasswordParams, this.onForgotPasswordSuccess, this.onForgotPasswordFailure, this.props);
            } else {
                showNoInternetAlert();
            }
        });
    }
    //#endregion
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: EDColors.transparent,
        marginTop: 40
    },
    modalSubContainer: {
        backgroundColor: EDColors.white,
        padding: 10,
        marginHorizontal: 20,
        borderRadius: 24,
        marginTop: 20,
        marginBottom: 20,
        paddingBottom: 20,
    },
    buttonViewStyle: { alignItems: 'center', justifyContent: 'space-between', },
    buttonStyle: { padding: 10 },
    errorMessageStyle: { marginHorizontal: 15 },
    themeButtonStyle: { height: Metrics.screenHeight * 0.07, borderRadius: 16, width: '90%', marginVertical: 5 },
    buttonTextStyle: { fontFamily: EDFonts.medium, fontSize: getProportionalFontSize(16) }
});
