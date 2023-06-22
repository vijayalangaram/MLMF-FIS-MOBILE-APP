/* eslint-disable prettier/prettier */
import React, { Component } from 'react';
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { heightPercentageToDP } from 'react-native-responsive-screen';
import { EDColors } from '../utils/EDColors';
import { getProportionalFontSize } from '../utils/EDConstants';
import { EDFonts } from '../utils/EDFontConstants';

export default class cEDThemeButton extends Component {

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
          ? <ActivityIndicator style={stylesButton.spinner} size={'small'} color={EDColors.white} />
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
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 20,
    padding: 10,
    height: heightPercentageToDP('6.2%'),
  },
  themeButtonTransparent: {
    backgroundColor: EDColors.transparentWhite,
    borderRadius: heightPercentageToDP('6%') / 2,
    borderColor: EDColors.white,
    borderWidth: 1,
    alignSelf: 'center',
    justifyContent: 'center',
    marginTop: 20,
    padding: 10,
    height: heightPercentageToDP('6.2%'),

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
