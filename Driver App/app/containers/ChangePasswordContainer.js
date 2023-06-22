/* eslint-disable react-native/no-inline-styles */
/* eslint-disable semi */
/* eslint-disable prettier/prettier */
import React from 'react'
import { Image, StyleSheet, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { connect } from 'react-redux'
import Assets from '../assets'
import EDRTLTextInput from '../components/EDRTLTextInput'
import EDThemeButton from '../components/EDThemeButton'
import { strings } from '../locales/i18n'
import { saveNavigationSelection } from '../redux/actions/Navigation'
import { saveLanguageInRedux, saveUserDetailsInRedux, saveUserFCMInRedux } from '../redux/actions/User'
import { showNoInternetAlert, showTopDialogue } from '../utils/EDAlert'
import { EDColors } from '../utils/EDColors'
import { isRTLCheck, RESPONSE_SUCCESS, TextFieldTypes } from '../utils/EDConstants'
import Metrics from '../utils/metrics'
import { netStatus } from '../utils/NetworkStatusConnection'
import { changePassword } from '../utils/ServiceManager'
import Validations from '../utils/Validations'
import BaseContainer from './BaseContainer'

class ChangePasswordContainer extends React.Component {
    //#region LIFE CYCLE METHODS
    constructor(props) {
        super(props)
        this.validationsHelper = new Validations()
    }

    render() {
        return (

            <BaseContainer
                title={strings('changePassword')}
                left={isRTLCheck() ? "arrow-forward" : 'arrow-back'}
                onLeft={this.buttonBackPressed}
            // loading={this.state.isLoading || this.state.isLoadingInProgressOrders}
            // connection={this.onConnectionChangeHandler}
            >
                <KeyboardAwareScrollView
                    enableResetScrollToCoords={true}
                    resetScrollToCoords={{ x: 0, y: 0 }}
                    style={styles.scrollContainer}
                    bounces={false}
                    keyboardShouldPersistTaps='always'
                    behavior='padding'
                    // enableAutomaticScroll={false}
                    enableOnAndroid
                    enabled>
                    <View
                        pointerEvents={this.state.isLoading ? 'none' : 'auto'}
                        style={styles.mainViewStyle}>
                       
                        <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 30 }}>
                            <Image source={Assets.bg_password} />
                        </View>
                        {/* TEXT INPUTS CONTAINER */}
                        <View style={styles.textInputsContainer}>


                            {/* OLD PASSWORD INPUT */}
                            <EDRTLTextInput
                                type={TextFieldTypes.password}
                                identifier={'oldPassword'}
                                icon="lock"
                                placeholder={strings('oldPassword')}
                                onChangeText={this.textFieldTextDidChangeHandler}
                                initialValue={this.state.objChangePasswordDetails.oldPassword}
                                errorFromScreen={
                                    this.state.shouldPerformValidation
                                        ? this.validationsHelper.checkForEmpty(
                                            this.state.objChangePasswordDetails.oldPassword,
                                            strings('oldPasswordMsg'),
                                        )
                                        : ''
                                }
                            />

                            {/* NEW PASSWORD INPUT */}
                            <EDRTLTextInput
                                type={TextFieldTypes.password}
                                icon="lock"

                                identifier={'newPassword'}
                                placeholder={strings('newPassword')}
                                onChangeText={this.textFieldTextDidChangeHandler}
                                initialValue={this.state.objChangePasswordDetails.newPassword}
                                errorFromScreen={
                                    this.state.shouldPerformValidation
                                        ? this.validationsHelper.validatePassword(
                                            this.state.objChangePasswordDetails.newPassword,
                                            strings('newPasswordMsg'),
                                        )
                                        : ''
                                }
                            />

                            {/* CONFIRM PASSWORD INPUT */}
                            <EDRTLTextInput
                                type={TextFieldTypes.password}
                                icon="lock"

                                identifier={'confirmPassword'}
                                placeholder={strings('confirmPassword')}
                                onChangeText={this.textFieldTextDidChangeHandler}
                                initialValue={this.state.objChangePasswordDetails.confirmPassword}
                                errorFromScreen={
                                    this.state.shouldPerformValidation
                                        ? this.validationsHelper.validateConfirmPassword(
                                            this.state.objChangePasswordDetails.newPassword,
                                            this.state.objChangePasswordDetails.confirmPassword,
                                            strings('samePasswordMsg'),
                                        )
                                        : ''
                                }
                            />
                            {/* SAVE BUTTON */}
                            <EDThemeButton
                                style={styles.button}
                                label={strings('save')}
                                isLoading={this.state.isLoading}
                                onPress={this.buttonSavePressed}
                                isRadius={true}
                            />
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
        objChangePasswordDetails: {
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
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
        if (
            this.validationsHelper.checkForEmpty(
                this.state.objChangePasswordDetails.oldPassword,
                strings('emptyOldPassword'),
            ).length > 0 ||
            this.validationsHelper.validatePassword(
                this.state.objChangePasswordDetails.newPassword,
                this.state.objChangePasswordDetails.confirmPassword,
                strings('emptyNewPassword'),
            ).length > 0 ||
            this.validationsHelper.validateConfirmPassword(
                this.state.objChangePasswordDetails.newPassword,
                this.state.objChangePasswordDetails.confirmPassword,
                strings('emptyConfirmPassword'),
            ).length > 0
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
        this.setState({ isLoading: false })
        if (objSuccess.data !== undefined && objSuccess.data.status == RESPONSE_SUCCESS) {
            // showDialogue(
            //     objSuccess.message || strings('generalNew.passwordSuccess'),
            //     '',
            //     [],
            //     () => {
            //         this.buttonBackPressed()
            //         // this.props.navigation.goBack()
            //     },
            // )
            showTopDialogue(objSuccess.message || strings('changePassword'))
            setTimeout(() => {
                this.buttonBackPressed();
            }, 3000)
        }
        else
            showTopDialogue(objSuccess.message, true)
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
                    old_password: this.state.objChangePasswordDetails.oldPassword,
                    password: this.state.objChangePasswordDetails.newPassword,
                    confirm_password: this.state.objChangePasswordDetails.confirmPassword,
                }
                this.setState({ isLoading: true })
                changePassword(
                    objChangePasswordParams,
                    this.onChangePasswordSuccess,
                    this.onChangePasswordFailure,
                    this.props,
                )
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
    scrollContainer: {
        flex: 1,
        // backgroundColor: EDColors.white
    },
    mainViewStyle: {
        flex: 1,
        flexDirection: 'column',
        // backgroundColor: EDColors.white,
    },
    textInputsContainer: {
        marginVertical: 44,
        marginHorizontal: 15,
        shadowColor: 'rgba(0, 0, 0, 0.05)',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,

        elevation: 3,
        backgroundColor: EDColors.white,
        padding: 10,
        borderRadius: 16,
        paddingTop: 25
    },
    button: {
        width: "100%",
        backgroundColor: EDColors.primary,
        marginTop: 40,
        height: Metrics.screenHeight * 0.075,
        marginBottom: 10,
        borderRadius: 16
    }
})
//#endregion

export default connect(
    state => {
        return {
            lan: state.userOperations.lan,
            userDetails: state.userOperations.userData || {},
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
            },
            saveNavigationSelection: dataToSave => {
                dispatch(saveNavigationSelection(dataToSave));
            },
        }
    },
)(ChangePasswordContainer)
