/* eslint-disable react/no-string-refs */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {Icon} from 'react-native-elements';
import {strings} from '../locales/i18n';
import {showNoInternetAlert, showTopDialogue} from '../utils/EDAlert';
import {EDColors} from '../utils/EDColors';
import {
  getProportionalFontSize,
  isRTLCheck,
  RESPONSE_SUCCESS,
  TextFieldTypes,
} from '../utils/EDConstants';
import {EDFonts} from '../utils/EDFontConstants';
import Metrics from '../utils/metrics';
import {netStatus} from '../utils/NetworkStatusConnection';
import {forgotPassword} from '../utils/ServiceManager';
import Validations from '../utils/Validations';
import EDRTLText from './EDRTLText';
import EDRTLTextInput from './EDRTLTextInput';
import EDRTLView from './EDRTLView';
import EDThemeButton from './EDThemeButton';
export default class EDForgotPassword extends React.Component {
  //#region LIFE CYCLE METHODS
  constructor(props) {
    super(props);
    this.validationsHelper = new Validations();
  }

  render() {
    return (
      <View
        style={styles.modalContainer}
        pointerEvents={this.state.isLoading ? 'none' : 'auto'}>
        <View style={[styles.modalSubContainer, {borderRadius: 24}]}>
          <EDRTLView
            style={{alignItems: 'center', justifyContent: 'space-between'}}>
            <EDRTLText
              title={strings('forgotPassword')}
              style={{
                fontFamily: EDFonts.semiBold,
                color: EDColors.black,
                fontSize: getProportionalFontSize(16),
              }}
            />
            <TouchableOpacity
              onPress={this.props.onDismissHandler}
              style={{
                padding: 10,
                alignSelf: isRTLCheck() ? 'flex-start' : 'flex-end',
              }}>
              <Icon name={'close'} size={18} color={EDColors.text} />
            </TouchableOpacity>
          </EDRTLView>

          {/* PHONE INPUT */}
          <EDRTLTextInput
            containerStyle={{marginTop: 0, marginBottom: 10}}
            type={TextFieldTypes.email}
            identifier={'phone'}
            icon="email"
            autoFocus={true}
            placeholder={strings('email')}
            initialValue={this.state.phone}
            onChangeText={this.textFieldTextDidChangeHandler}
            errorFromScreen={
              this.state.shouldPerformValidation
                ? this.validationsHelper.validateEmail(
                    this.state.phone,
                    strings('emptyEmail'),
                  )
                : ''
            }
          />

          {/* SUBMIT BUTTON */}
          <EDThemeButton
            label={strings('submit')}
            isLoading={this.state.isLoading}
            onPress={this.onSubmitButtonHandler}
            isRadius={true}
            style={{
              margin: 5,
              width: '100%',
              borderRadius: 16,
              height: Metrics.screenHeight * 0.075,
            }}
            textStyle={{
              fontFamily: EDFonts.medium,
              fontSize: getProportionalFontSize(16),
            }}
          />
        </View>
      </View>
    );
  }

  state = {
    shouldPerformValidation: false,
    isLoading: false,
    phone: '',
  };

  //#region TEXT CHANGE EVENTS
  textFieldTextDidChangeHandler = value => {
    this.state.phone = value;
    this.setState({shouldPerformValidation: false});
  };
  //#endregion

  //#region BUTTON EVENTS
  onSubmitButtonHandler = () => {
    this.setState({shouldPerformValidation: true});
    if (
      this.validationsHelper
        .validateEmail(this.state.phone.trim(), strings('emptyEmail'))
        .trim().length > 0
    ) {
      return;
    }
    this.callForgotPasswordAPI();
  };
  //#endregion

  //#region NETWORK
  /**
   *
   * @param {The success response object} objSuccess
   */
  onForgotPasswordSuccess = objSuccess => {
    this.setState({isLoading: false});
    if (
      objSuccess.data !== undefined &&
      objSuccess.data.status == RESPONSE_SUCCESS
    ) {
      if (this.props.onDismissHandler !== undefined) {
        this.props.onDismissHandler();
      }
      showTopDialogue(objSuccess.message);
    } else showTopDialogue(objSuccess.message, true);
  };

  /**
   *
   * @param {The success response object} objSuccess
   */
  onForgotPasswordFailure = objFailure => {
    this.setState({isLoading: false});
    showTopDialogue(objFailure.message, true);
  };

  callForgotPasswordAPI = () => {
    netStatus(isConnected => {
      if (isConnected) {
        let objForgotPasswordParams = {
          language_slug: this.props.lan,
          Email: this.state.phone,
        };
        this.setState({isLoading: true});
        forgotPassword(
          objForgotPasswordParams,
          this.onForgotPasswordSuccess,
          this.onForgotPasswordFailure,
          this.props,
        );
      } else {
        showNoInternetAlert();
      }
    });
  };
  //#endregion
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: EDColors.transparent,
    // backgroundColor: 'rgba(0,0,0,0.25)',
  },
  modalSubContainer: {
    backgroundColor: EDColors.white,
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 6,
    marginTop: 20,
    marginBottom: 20,
    paddingBottom: 20,
  },
  submit: {width: 150},
});
