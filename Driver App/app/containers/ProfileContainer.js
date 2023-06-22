import React from 'react';
import {StyleSheet, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {connect} from 'react-redux';
import EDProfilePicture from '../components/EDProfilePicture';
import EDRTLTextInput from '../components/EDRTLTextInput';
import EDThemeButton from '../components/EDThemeButton';
import {strings} from '../locales/i18n';
import {saveUserDetailsInRedux} from '../redux/actions/User';
import {
  getUserLoginDetails,
  saveUserLoginDetails,
} from '../utils/AsyncStorageHelper';
import {showNoInternetAlert, showTopDialogue} from '../utils/EDAlert';
import {EDColors} from '../utils/EDColors';
import {
  getProportionalFontSize,
  isRTLCheck,
  TextFieldTypes,
} from '../utils/EDConstants';
import {EDFonts} from '../utils/EDFontConstants';
import Metrics from '../utils/metrics';
import {netStatus} from '../utils/NetworkStatusConnection';
import {editProfile} from '../utils/ServiceManager';
import Validations from '../utils/Validations';
import BaseContainer from './BaseContainer';
import NavigationEvents from '../components/NavigationEvents';

class ProfileContainer extends React.Component {
  validationsHelper = new Validations();
  avatarSource = undefined;
  state = {
    isLoading: false,
    objProfileDetails: this.props.userDetails || {},
    isNotificationAllowed: this.props.userDetails.notification === '1',
  };

  getUserProfile = () => {
    getUserLoginDetails(
      success => {
        this.props.saveUserDetailsInRedux(success);
      },
      () => {},
    );
  };

  //#region TEXT CHANGE EVENTS
  /**
   *
   * @param {Value of textfield whatever user type} value
   ** @param {Unique identifier for every text field} identifier
   */
  textFieldTextDidChangeHandler = (value, identifier) => {
    this.state.objProfileDetails[identifier] = value;
    this.forceUpdate();
  };
  //#endregion

  /**
   *
   * @param {The image response received from image picker} imageSource
   */
  onImageSelectionHandler = imageSource => {
    this.avatarSource = imageSource;
  };

  /**
   *
   * @param {Checking all conditions and redirect to home screen on success}
   */
  buttonSavePressed = () => {
    if (
      this.validationsHelper.checkForEmpty(
        this.state.objProfileDetails.FirstName,
        strings('emptyFirstName'),
      ).length > 0
    ) {
      showTopDialogue(strings('emptyFirstName'), true);
      return;
    } else if (
      this.validationsHelper.checkForEmpty(
        this.state.objProfileDetails.LastName,
        strings('emptyLastName'),
      ).length > 0
    ) {
      showTopDialogue(strings('emptyLastName'), true);
      return;
    }

    this.callEditProfileAPI();
  };

  //#region NETWORK METHODS

  /**
   *
   * @param {The success response object} objSuccess
   */
  onEditProfileSuccess = objSuccess => {
    this.setState({isLoading: false});
    if (this.props.isLoginRemembered)
      if (objSuccess !== undefined && objSuccess.profile !== undefined) {
        this.props.saveUserDetailsInRedux(objSuccess.profile);
        saveUserLoginDetails(
          objSuccess.profile,
          onSuccess => {},
          onFailure => {},
        );
      }
    // showDialogue(objSuccess.message || strings('profileUpdate'), '', [], () => {
    //     this.props.navigation.goBack()
    // })
    showTopDialogue(objSuccess.message || strings('profileUpdate'));
    setTimeout(() => {
      this.props.navigation.goBack();
    }, 3000);
  };

  /**
   *
   * @param {The failure response object} objFailure
   */
  onEditProfileFailure = objFailure => {
    this.setState({isLoading: false});
    showTopDialogue(objFailure.message, true);
  };

  /** REQUEST EDIT PROFILE */
  callEditProfileAPI = () => {
    netStatus(isConnected => {
      if (isConnected) {
        let objEditProfileDetails = {
          user_id: this.state.objProfileDetails.UserID || 0,
          first_name: this.state.objProfileDetails.FirstName,
          last_name: this.state.objProfileDetails.LastName,
          language_slug: this.props.lan,
          image: this.avatarSource,
          token: this.state.objProfileDetails.PhoneNumber,
          phone_code: this.state.objProfileDetails.objProfileDetails,
          driver_temperature: this.state.objProfileDetails.driver_temperature,
        };

        this.setState({isLoading: true});
        editProfile(
          objEditProfileDetails,
          this.onEditProfileSuccess,
          this.onEditProfileFailure,
          this.props,
        );
      } else {
        showNoInternetAlert();
      }
    });
  };
  //#endregion

  render() {
    return (
      <BaseContainer
        title={strings('profileTitle')}
        left={isRTLCheck() ? 'arrow-forward' : 'arrow-back'}
        right={'lock'}
        onRight={this.navigateToChangePass}
        onLeft={this.buttonBackPressed}>
        <NavigationEvents
          onFocus={this.getUserProfile}
          navigationProps={this.props}
        />

        <KeyboardAwareScrollView
          style={{flex: 1}}
          bounces={false}
          keyboardShouldPersistTaps="always"
          behavior="padding"
          enabled>
          <View
            pointerEvents={this.state.isLoading ? 'none' : 'auto'}
            style={{marginTop: 10}}>
            {/* PROFILE IMAGE COMPONENT */}
            <EDProfilePicture
              imagePath={this.props.userDetails.image}
              onImageSelectionHandler={this.onImageSelectionHandler}
            />

            {/* TEXT INPUTS CONTAINER */}
            <View style={styles.textInputsContainer}>
              {/* FIRST NAME FIELD - EDITABLE */}
              <EDRTLTextInput
                type={TextFieldTypes.default}
                icon="person"
                identifier={'FirstName'}
                initialValue={this.state.objProfileDetails.FirstName}
                placeholderTextStyle={{
                  fontFamily: EDFonts.semiBold,
                  fontSize: getProportionalFontSize(16),
                }} //Vikrant 19-07-21
                onChangeText={this.textFieldTextDidChangeHandler}
                placeholder={strings('firstName')}
                customIcon={'edit-3'}
                customIconFamily={'feather'}
                focusOnPress={true}
              />
              {/* LAST NAME */}

              <EDRTLTextInput
                type={TextFieldTypes.default}
                icon="person"
                identifier={'LastName'}
                initialValue={this.state.objProfileDetails.LastName}
                placeholderTextStyle={{
                  fontFamily: EDFonts.semiBold,
                  fontSize: getProportionalFontSize(16),
                }} //Vikrant 19-07-21
                onChangeText={this.textFieldTextDidChangeHandler}
                placeholder={strings('lastName')}
                customIcon={'edit-3'}
                customIconFamily={'feather'}
                focusOnPress={true}
              />

              {/* EMAIL FIELD - UNEDITABLE */}

              <EDRTLTextInput
                type={TextFieldTypes.email}
                countryData={this.props.countryData}
                icon="email"
                editableBox={false}
                initialValue={this.state.objProfileDetails.Email}
                placeholderTextStyle={{
                  fontFamily: EDFonts.semiBold,
                  fontSize: getProportionalFontSize(16),
                }} //Vikrant 19-07-21
                placeholder={strings('email')}
              />

              {/* PHONE NUMBER FIELD - UNEDITABLE */}

              <EDRTLTextInput
                type={TextFieldTypes.phone}
                countryData={this.props.countryData}
                dialCode={
                  this.state.objProfileDetails.phone_code.includes('+')
                    ? this.state.objProfileDetails.phone_code.substring(1)
                    : this.state.objProfileDetails.phone_code
                }
                icon="call"
                editableBox={false}
                initialValue={this.state.objProfileDetails.PhoneNumber}
                placeholderTextStyle={{
                  fontFamily: EDFonts.bold,
                  fontSize: getProportionalFontSize(16),
                }} //Vikrant 19-07-21
                placeholder={strings('phoneNumber')}
              />

              {/* TEMPARETURE */}
              {this.state.objProfileDetails.driver_temperature !== undefined &&
              this.state.objProfileDetails.driver_temperature !== null &&
              this.state.objProfileDetails.driver_temperature !== '' ? (
                // </View>
                <EDRTLTextInput
                  type={TextFieldTypes.default}
                  editableBox={false}
                  isForTemperature={true}
                  initialValue={this.state.objProfileDetails.driver_temperature}
                  placeholderTextStyle={{
                    fontFamily: EDFonts.bold,
                    fontSize: getProportionalFontSize(16),
                  }} //Vikrant 19-07-21
                  placeholder={strings('temperature')}
                  // multiline={true}
                />
              ) : null}

              {/* LOGIN BUTTON */}
              <EDThemeButton
                style={styles.signInButton}
                label={strings('save')}
                isLoading={this.state.isLoading}
                onPress={this.buttonSavePressed}
              />
            </View>
          </View>
        </KeyboardAwareScrollView>
      </BaseContainer>
    );
  }

  // Button back press

  buttonBackPressed = () => {
    this.props.navigation.goBack();
  };

  // CHange pass

  navigateToChangePass = () => {
    this.props.navigation.navigate('changePassword');
  };
}

const styles = StyleSheet.create({
  imageStyle: {
    alignSelf: 'center',
    height: Metrics.screenHeight * 0.45,
    width: Metrics.screenWidth * 0.65,
  },
  signInButton: {
    width: '100%',
    backgroundColor: EDColors.primary,
    // marginTop: 40,
    height: Metrics.screenHeight * 0.075,
    alignItems: 'center',
    borderRadius: 16,
    marginTop: 25,
  },
  header: {
    alignItems: 'center',
    paddingBottom: 5,
    borderBottomColor: EDColors.separatorColor,
    borderBottomWidth: 1,
    justifyContent: 'space-between',
  },
  textInputsContainer: {
    padding: 5,
    margin: 15,
    backgroundColor: EDColors.white,
    borderRadius: 16,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,

    elevation: 1,
    paddingBottom: 30,
  },
});

export default connect(
  state => {
    return {
      lan: state.userOperations.lan,
      userDetails: state.userOperations.userData || {},
      countryData: state.userOperations.countryData,

      isLoginRemembered: state.userOperations.isLoginRemembered,
    };
  },
  dispatch => {
    return {
      saveUserDetailsInRedux: detailsToSave => {
        dispatch(saveUserDetailsInRedux(detailsToSave));
      },
    };
  },
)(ProfileContainer);
