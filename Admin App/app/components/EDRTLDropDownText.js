import React, {Component} from 'react';
import {StyleSheet, TouchableOpacity, View, Text, Image} from 'react-native';
import {EDColors} from '../utils/EDColors';
import {EDFonts} from '../utils/EDFontConstants';
import {getProportionalFontSize} from '../utils/EDConstants';
import EDRTLView from './EDRTLView';
import {isRTLCheck} from '../utils/EDConstants';
import EDRTLText from './EDRTLText';
import EDText from './EDText';
import {Icon} from 'react-native-elements';
import EDThemeButton from './EDThemeButton';

// TEXT FIELD TYPES

export default class EDRTLDropDownText extends Component {
  //#region LIFE CYCLE METHODS
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <View style={styles.mainView}>
        <EDText
          style={[styles.EDTextStyle]}
          textStyle={[styles.textStyle, this.props.textStyle]}
          isMandatory={this.props.isMandatory}
          title={this.props.title || ''}></EDText>
        {this.props.extraButtonLabel ? (
          <EDThemeButton
            label={this.props.extraButtonLabel}
            style={[styles.btnStyle, this.props.containerStyle]}
            onPress={this.props.onExtraButtonPress}
          />
        ) : null}
        <TouchableOpacity
          style={[styles.touchableStyle, this.props.containerStyle]}
          onPress={this.touchMethodEvent}>
          <View>
            <EDRTLView style={styles.buttonViewStyle}>
              <Text
                style={[
                  styles.textFieldStyle,
                  this.props.containerTextStyle,
                  {
                    textAlign: isRTLCheck() ? 'right' : 'left',
                  },
                ]}>
                {this.props.label}
              </Text>
              <Icon
                name={this.props.iconName}
                size={getProportionalFontSize(this.props.size || 20)}
                color={this.props.iconColor || EDColors.text}
                type={this.props.iconType || 'ant-design'}
              />
            </EDRTLView>
          </View>
        </TouchableOpacity>
        {/* ERROR MESSAGE */}
        {this.props.errorFromScreen ? (
          <EDRTLText
            style={styles.errorTextStyle}
            title={this.props.errorFromScreen}
          />
        ) : null}
      </View>
    );
  }
  //#endregion

  //#region STATE
  state = {
    showPassword: false,
  };
  //#endregion

  //#region UIBUTTON METHODS
  touchMethodEvent = () => {
    if (this.props.touchMethodEvent !== undefined) {
      this.props.touchMethodEvent();
    }
  };
}
//#endregion
const styles = StyleSheet.create({
  textFieldStyle: {
    // flex: 1,
    fontFamily: EDFonts.regular,
    fontSize: getProportionalFontSize(14),
    color: EDColors.text,
    paddingVertical: 5,
    // tintColor: EDColors.primary,
  },
  errorTextStyle: {
    fontSize: getProportionalFontSize(12),
    fontFamily: EDFonts.regular,
    color: EDColors.error,
    marginVertical: 5,
  },
  mainView: {marginBottom: 5},
  EDTextStyle: {marginLeft: 0, marginTop: 5, marginHorizontal: 0},
  textStyle: {fontSize: getProportionalFontSize(13)},
  touchableStyle: {
    backgroundColor: EDColors.white,
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowColor: EDColors.text,
    shadowOffset: {height: 0, width: 0},
    marginTop: 5,
    paddingHorizontal: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: EDColors.borderColor,
  },
  btnStyle: {
    backgroundColor: EDColors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowColor: EDColors.text,
    shadowOffset: {height: 0, width: 0},
    marginTop: 5,
    paddingHorizontal: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: EDColors.borderColor,
    width: '100%',
    marginBottom: 10,
  },
  buttonViewStyle: {
    alignItems: 'center',
    paddingVertical: 5,
    justifyContent: 'space-evenly',
  },
});
