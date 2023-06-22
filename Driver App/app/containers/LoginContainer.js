/* eslint-disable react-native/no-inline-styles */
/* eslint-disable semi */
/* eslint-disable prettier/prettier */
import React from 'react';
import {Linking, Platform, StyleSheet, View} from 'react-native';
import CardFlip from 'react-native-card-flip/CardFlip';
import {default as I18n} from 'i18n-js';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import RNRestart from 'react-native-restart';
import {connect} from 'react-redux';
import EDCheckButton from '../components/EDCheckButton';
import EDForgotPassword from '../components/EDForgotPassword';
import EDLanguageSelect from '../components/EDLanguageSelect';
import EDPopupView from '../components/EDPopupView';
import EDRTLTextInput from '../components/EDRTLTextInput';
import EDRTLView from '../components/EDRTLView';
import EDThemeButton from '../components/EDThemeButton';
import EDThemeHeader from '../components/EDThemeHeader';
import EDUnderlineButton from '../components/EDUnderlineButton';
import {strings} from '../locales/i18n';
import {
  rememberLoginInRedux,
  saveCountryDataInRedux,
  saveLanguageInRedux,
  saveOnlineStatus,
  saveUserDetailsInRedux,
} from '../redux/actions/User';
import {
  saveLanguage,
  saveUserLoginDetails,
  saveUserStatus,
} from '../utils/AsyncStorageHelper';
import {
  showMailDialogue,
  showNoInternetAlert,
  showTopDialogue,
} from '../utils/EDAlert';
import {EDColors} from '../utils/EDColors';
import {
  debugLog,
  getProportionalFontSize,
  isRTLCheck,
  TextFieldTypes,
} from '../utils/EDConstants';
import {EDFonts} from '../utils/EDFontConstants';
import Metrics from '../utils/metrics';
import {netStatus} from '../utils/NetworkStatusConnection';
import {getCoutryCodeListAPI, loginUser} from '../utils/ServiceManager';
import Validations from '../utils/Validations';
import {CommonActions} from '@react-navigation/native';

class LoginContainer extends React.Component {
  //#region LIFE CYCLE METHODS
  constructor(props) {
    super(props);
    this.validationsHelper = new Validations();
  }

  componentDidMount = () => {
    if (
      this.props.countryData !== undefined &&
      this.props.countryData !== null &&
      this.props.countryData.length == 0
    ) {
      this.fetchCountryCodes();
    }
    if (
      this.props.countryData !== undefined &&
      this.props.countryData !== null &&
      this.props.countryData[0] !== undefined &&
      this.props.countryData[0].phonecode !== undefined
    ) {
      this.setState({countryCode: this.props.countryData[0].phonecode});
    }
  };
  /** CALL FETCH COUNTRY CODE API */
  fetchCountryCodes = (lan) => {
    netStatus((isConnected) => {
      if (isConnected) {
        getCoutryCodeListAPI({}, this.onSuccessHandler, this.onFailureHandler);
      }
    });
  };

  onSuccessHandler = (onSuccess) => {
    if (
      onSuccess.data !== undefined &&
      onSuccess.data !== null &&
      onSuccess.data.country_list.length !== 0
    ) {
      this.props.saveCountryCode(onSuccess.data.country_list);
      this.setState({countryCode: onSuccess.data.country_list[0].phonecode});
    }
  };

  onFailureHandler = (onFailure) => {};

  render() {
    return (
      <View style={styles.parentView}>
        <KeyboardAwareScrollView
          style={styles.parentView}
          bounces={false}
          keyboardShouldPersistTaps="always"
          behavior="padding"
          showsVerticalScrollIndicator={false}
          enableOnAndroid
          enabled>
          {/* MAIN VIEW */}
          <View
            pointerEvents={this.state.isLoading ? 'none' : 'auto'}
            style={styles.mainViewStyle}>
            {/* FORGOT PASSWORD DIALOGUE */}
            {this.renderForgotPasswordDialogue()}

            {/* CHANGE LANGUAGE DIALOGUE */}
            {this.renderLanguageSelectDialogue()}

            {/* HEADER IMAGE */}
            <EDThemeHeader
              onLeftButtonPress={this.buttonBackPressed}
              title={strings('loginTitle')}
              onLanguagePress={this._onChangeLanguagePressed}
              lan={this.props.lan}
              languages={this.props.arrayLanguages}
              showLogo={true}
            />

            {/* FIELDS VIEW */}
            <View style={styles.textFieldStyle}>
              {/* CARD FLIP USED FOR FLIPING THE EMAIL AND PHONE NUMBER FIELDS */}
              <CardFlip
                clickable={false}
                flip={this.state.useEmail}
                useNativeDriver={true}
                flipHorizontal
                ref={(ref) => (this.cardView = ref)}>
                {/* Phone INPUT */}
                {this.state.useEmail ? null : (
                  <EDRTLTextInput
                    // containerStyle={{ marginBottom: -this.state.height - 10 }}
                    type={TextFieldTypes.phone}
                    countryData={this.props.countryData}
                    onCountrySelect={this.onCountrySelect}
                    identifier={'phone'}
                    icon="call"
                    // prefix={this.state.countryCode}
                    placeholder={strings('phoneNumber')}
                    onChangeText={this.textFieldTextDidChangeHandler}
                    initialValue={this.state.objLoginDetails.phone}
                    errorFromScreen={
                      this.state.shouldPerformValidation
                        ? this.validationsHelper.checkForEmpty(
                            this.state.objLoginDetails.phone,
                            strings('emptyNumber'),
                            this.state.countryCode,
                          )
                        : ''
                    }
                  />
                )}

                {/* Email INPUT */}
                {this.state.useEmail ? (
                  <EDRTLTextInput
                    type={TextFieldTypes.email}
                    countryData={this.props.countryData}
                    onCountrySelect={this.onCountrySelect}
                    identifier={'email'}
                    icon="email"
                    multiline={true}
                    placeholder={strings('email')}
                    onChangeText={this.textFieldTextDidChangeHandler}
                    initialValue={this.state.objLoginDetails.email}
                    errorFromScreen={
                      this.state.shouldPerformValidation
                        ? this.validationsHelper.validateEmail(
                            this.state.objLoginDetails.email,
                            strings('emptyEmail'),
                            this.state.countryCode,
                          )
                        : ''
                    }
                  />
                ) : null}
              </CardFlip>

              {/* PASSWORD INPUT */}
              <EDRTLTextInput
                type={TextFieldTypes.password}
                identifier={'password'}
                icon="lock"
                placeholder={strings('password')}
                onChangeText={this.textFieldTextDidChangeHandler}
                initialValue={this.state.objLoginDetails.password}
                errorFromScreen={
                  this.state.shouldPerformValidation
                    ? this.validationsHelper.checkForEmpty(
                        this.state.objLoginDetails.password,
                        strings('emptyPassword'),
                      )
                    : ''
                }
              />
              <EDRTLView style={styles.buttonGroup}>
                {/* REMEMBER ME */}
                <EDCheckButton
                  label={strings('rememberMe')}
                  isChecked={this.state.remember}
                  onPress={this.toggleRemeber}
                />

                {/* FORGOT PASSWORD */}
                <EDUnderlineButton
                  buttonStyle={styles.forgotPasswordButton}
                  textStyle={[
                    styles.forgotPasswordText,
                    {
                      fontFamily: EDFonts.semiBold,
                      fontSize: getProportionalFontSize(14),
                      color: EDColors.black,
                    },
                  ]}
                  onPress={this.buttonForgotPasswordPressed}
                  label={strings('forgotPassword') + '?'}
                />
              </EDRTLView>

              {/* LOGIN BUTTON */}
              <EDThemeButton
                style={[
                  styles.signInButton,
                  {height: Metrics.screenHeight * 0.075, borderRadius: 16},
                ]}
                label={strings('loginTitle')}
                isLoading={this.state.isLoading}
                onPress={this.buttonLoginPressed}
                isRadius={true}
                textStyle={{
                  fontFamily: EDFonts.semiBold,
                  fontSize: getProportionalFontSize(16),
                }}
              />

              <EDUnderlineButton
                buttonStyle={styles.toggleLogin}
                textStyle={styles.loginMethod}
                onPress={this.toggleView}
                label={
                  this.state.useEmail
                    ? strings('loginWithPhone')
                    : strings('loginWithEmail')
                }
              />
            </View>
          </View>
        </KeyboardAwareScrollView>
      </View>
    );
  }
  toggleView = () => {
    this.state.objLoginDetails.email = '';
    this.state.objLoginDetails.phone = '';
    this.state.objLoginDetails.password = '';

    this.setState({
      useEmail: !this.state.useEmail,
      shouldPerformValidation: false,
    });
    this.cardView.flipX();
  };
  toggleRemeber = () => {
    this.setState({remember: !this.state.remember});
  };

  //#region STATE
  state = {
    isLoading: false,
    shouldPerformValidation: false,
    objLoginDetails: {
      phone: '',
      email: '',
      password: '',
    },
    remember: true,
    shouldShowForgotPasswordDialogue: false,
    languageModal: false,
    useEmail: false,
    height: 0,
    countryCode: '',
  };
  //#endregion

  //#region TEXT CHANGE EVENTS
  /**
   *
   * @param {Value of textfield whatever user type} value
   ** @param {Unique identifier for every text field} identifier
   */
  textFieldTextDidChangeHandler = (value, identifier) => {
    var newText = value;
    if (identifier == 'phone') {
      newText = value.replace(/[^0-9\\]/g, '');
    }
    this.state.objLoginDetails[identifier] = newText;
    this.setState({shouldPerformValidation: false});
  };
  //#endregion

  onCountrySelect = (country) => {
    this.state.countryCode = country.callingCode[0];
  };

  //#region BUTTON EVENTS
  /**
   *
   * @param {Checking all conditions and redirect to home screen on success}
   */
  buttonLoginPressed = () => {
    this.setState({shouldPerformValidation: true});
    if (
      (this.state.useEmail
        ? this.validationsHelper
            .validateEmail(
              this.state.objLoginDetails.email.trim(),
              strings('emptyEmail'),
              this.state.countryCode,
            )
            .trim() !== ''
        : this.validationsHelper
            .checkForEmpty(
              this.state.objLoginDetails.phone.trim(),
              strings('emptyNumber'),
              this.state.countryCode,
            )
            .trim() !== '') ||
      this.validationsHelper.checkForEmpty(
        this.state.objLoginDetails.password.trim(),
        strings('emptyPassword'),
      ).length > 0
    ) {
      return;
    } else {
      this.callLoginApi();
    }
  };

  //#endregion

  /**
   * Navigate to home after login
   */

  navigateToHome = (dataToSave) => {
    this.props.saveUserDetail(dataToSave);
    this.props.saveStatus(dataToSave.availabilityStatus);
    saveUserStatus(
      dataToSave.availabilityStatus,
      (onSuccess) => {},
      (onFailure) => {},
    );
    this.props.rememberLogin(this.state.remember);
    if (this.state.remember)
      saveUserLoginDetails(
        dataToSave,
        (successAsyncStore) => {
          this.props.navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{name: isRTLCheck() ? 'homeRight' : 'home'}],
            }),
            // StackActions.reset({
            //     index: 0,
            //     actions: [NavigationActions.navigate({ routeName: isRTLCheck() ? 'homeRight' : 'home' })],
            // }),
          );
        },
        (errorAsyncStore) => {},
      );
    else
      this.props.navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{name: isRTLCheck() ? 'homeRight' : 'home'}],
        }),
        // StackActions.reset({
        //     index: 0,
        //     actions: [NavigationActions.navigate({ routeName: isRTLCheck() ? 'homeRight' : 'home' })],
        // }),
      );
  };

  /** NETWORKS */
  /**
   * @param { on login success }
   */
  onLoginUserSuccessful = (onSuccess) => {
    if (onSuccess.data !== undefined && onSuccess.data.login !== undefined) {
      this.navigateToHome(onSuccess.data.login);
    } else showTopDialogue(onSuccess.message, true);
    this.setState({isLoading: false});
  };

  
  onLoginUserFailure = (onFailure) => {
    this.setState({isLoading: false});
    if (onFailure.data.status == 2) {
      console.log('====================================');
      console.log("Failure message" , onFailure.data.message);
      console.log('====================================');
      showMailDialogue(
        onFailure.data.message,
        [{text: strings('cancel'), onPress: () => {}, key: 1}],
        strings('appName'),
        () => {
          this.state.objLoginDetails['phone'] = '';
          this.state.objLoginDetails['password'] = '';
          this.state.objLoginDetails['email'] = '';

          this.setState({shouldPerformValidation: false});
          console.log('====================================');
          console.log("onFailure.data.email : ",onFailure.data.email);
          console.log('====================================');
          this.sendEmail(onFailure.data.email);
        },
      );
    } else {
      // showDialogue(onFailure.message, "", [],
      //     () => {
      //         this.state.objLoginDetails['phone'] = ''
      //         this.state.objLoginDetails['password'] = ''
      //         this.setState({ shouldPerformValidation: false })
      //     })
      showTopDialogue(onFailure.message, true);
      this.state.objLoginDetails['phone'] = '';
      this.state.objLoginDetails['password'] = '';
      this.setState({shouldPerformValidation: false});
    }
  };

  sendEmail = (email) => {
    Linking.openURL('mailto:' + email)
      .then((supported) => {
        if (!supported) console.log('unable to handle url');
        else Linking.openURL('mailto:' + email);
      })
      .catch((error) => console.log(error));
  };

  /**
   * Api call for user to login
   */

  callLoginApi = () => {
    netStatus((status) => {
      if (status) {
        this.setState({isLoading: true});
        let loginParams = {
          Password: this.state.objLoginDetails.password,
          firebase_token: '',
          language_slug: this.props.lan,
        };
        this.state.useEmail
          ? (loginParams['Email'] = this.state.objLoginDetails.email)
          : ((loginParams['PhoneNumber'] = this.state.objLoginDetails.phone),
            (loginParams['phone_code'] = this.state.countryCode));
        loginUser(
          loginParams,
          this.onLoginUserSuccessful,
          this.onLoginUserFailure,
          this.props,
        );
      } else {
        showNoInternetAlert();
      }
    });
  };

  /**
   *
   * @param {Redirecting user to forgot screen on forgot button click}
   */
  buttonForgotPasswordPressed = () => {
    // this.props.navigation.navigate("forgotPassword")
    this.setState({shouldShowForgotPasswordDialogue: true});
  };

  /** RENDER LOGOUT DIALOGUE */
  renderForgotPasswordDialogue = () => {
    return (
      <EDPopupView
        isModalVisible={this.state.shouldShowForgotPasswordDialogue}
        onRequestClose={this.onDismissForgotPasswordHandler}>
        <EDForgotPassword
          lan={this.props.lan}
          countryData={this.props.countryData}
          onDismissHandler={this.onDismissForgotPasswordHandler}
        />
      </EDPopupView>
    );
  };
  //#endregion

  //#region FORGOT PASSWORD BUTTON EVENTS
  onDismissForgotPasswordHandler = () => {
    this.setState({shouldShowForgotPasswordDialogue: false});
  };
  //#endregion

  /**
   * LANGUAGE CHANGE PRESSED
   */
  _onChangeLanguagePressed = () => {
    this.setState({languageModal: true});
  };

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
    );
  };
  //#endregion

  onDismissHandler = () => {
    this.setState({languageModal: false});
  };

  //#region FORGOT PASSWORD BUTTON EVENTS
  onChangeLanguageHandler = (lan) => {
    this.setState({languageModal: false});
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
    this.props.saveLanguageRedux(lan);
    saveLanguage(
      lan,
      (success) => {
        RNRestart.Restart();
      },
      (error) => {},
    );
  };
  //#endregion
}

//#region STYLES
const styles = StyleSheet.create({
  parentView: {
    flex: 1,
    backgroundColor: EDColors.white,
  },
  mainViewStyle: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: EDColors.white,
  },
  textFieldStyle: {
    marginVertical: 50,
    marginHorizontal: 15,
  },
  forgotPasswordButton: {
    borderBottomColor: EDColors.text,
    alignSelf: 'flex-end',
  },
  toggleLogin: {
    borderBottomColor: EDColors.transparent,
    alignSelf: 'center',
    marginTop: 20,
  },
  forgotPasswordText: {
    color: EDColors.text,
    fontFamily: EDFonts.semiBold,
    fontSize: getProportionalFontSize(14),
  },
  signInButton: {
    width: '100%',
    backgroundColor: EDColors.primary,
    marginTop: 40,
    // height: 40,
  },
  buttonGroup: {alignItems: 'center', marginTop: 15, paddingVertical: 15},
  toggleLogin: {
    borderBottomColor: EDColors.transparent,
    alignSelf: 'center',
    marginTop: 20,
  },
  loginMethod: {
    color: EDColors.black,
    fontFamily: EDFonts.semiBold,
    fontSize: getProportionalFontSize(15),
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginTop: 20,
  },
  language: {alignSelf: 'center', marginBottom: 20, alignItems: 'center'},
});
//#endregion

export default connect(
  (state) => {
    return {
      lan: state.userOperations.lan,
      countryData: state.userOperations.countryData,
      arrayLanguages: state.userOperations.arrayLanguages || [],
    };
  },
  (dispatch) => {
    return {
      saveUserDetail: (detailsToSave) => {
        dispatch(saveUserDetailsInRedux(detailsToSave));
      },
      rememberLogin: (data) => {
        dispatch(rememberLoginInRedux(data));
      },
      saveStatus: (dataStatus) => {
        dispatch(saveOnlineStatus(dataStatus));
      },
      saveLanguageRedux: (language) => {
        dispatch(saveLanguageInRedux(language));
      },
      saveCountryCode: (code) => {
        dispatch(saveCountryDataInRedux(code));
      },
    };
  },
)(LoginContainer);
