/* eslint-disable prettier/prettier */
import React, { Component } from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { EDColors } from '../utils/EDColors';
import { EDFonts } from '../utils/EDFontConstants';
import { heightPercentageToDP } from 'react-native-responsive-screen';
import Metrics from '../utils/metrics';
import { Spinner } from 'native-base';
import { getProportionalFontSize } from '../utils/EDConstants';

export default class EDThemeButton extends Component {

  //#region LIFE CYCLE METHODS
  /** RENDER */
  render() {
    return (
      <TouchableOpacity
        activeOpacity={this.props.activeOpacity}
        pointerEvents={this.props.isLoading ? 'none' : 'auto'}
        style={[this.props.isTransparent ? stylesButton.themeButtonTransparent : stylesButton.themeButton, this.props.style]}
        onPress={this.props.onPress}>
        {this.props.isLoading
          ? <Spinner style={stylesButton.spinner} color={EDColors.white} size={"small"} />
          : <Text style={[stylesButton.themeButtonText, this.props.textStyle]}>
            {this.props.label}
          </Text>
        }
      </TouchableOpacity>
    );
  }
  //#endregion
}

//#region STYLES
export const stylesButton = StyleSheet.create({
  themeButton: {
    backgroundColor: EDColors.primary,
    borderRadius: heightPercentageToDP('6%') / 2,
    width: Metrics.screenWidth * 0.65,
    height: heightPercentageToDP('6%'),
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 20,
  },
  themeButtonTransparent: {
    backgroundColor: EDColors.transparentWhite,
    borderRadius: heightPercentageToDP('6%') / 2,
    borderColor: EDColors.white,
    borderWidth: 1,
    width: Metrics.screenWidth * 0.65,
    height: heightPercentageToDP('6%'),
    alignSelf: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  themeButtonText: {
    color: EDColors.white,
    textAlign: 'center',
    paddingLeft: 15,
    paddingRight: 15,
    fontFamily: EDFonts.medium,
    alignSelf: 'center',
    fontSize: getProportionalFontSize(16),
  },
  spinner: {
    flex: 1,
    alignSelf: 'center',
    zIndex: 1000,
  },
});
//#endregion
