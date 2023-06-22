/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import React, { Component } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { EDColors } from '../utils/EDColors';
import { EDFonts } from '../utils/EDFontConstants';
import { isRTLCheck, getProportionalFontSize } from '../utils/EDConstants';

export default class EDText extends Component {
  render() {
    return (
      <View
        style={[
          styles.container,
          this.props.style,
          { alignItems: isRTLCheck() ? 'flex-end' : 'flex-start' },
        ]}>
        <Text style={[styles.mainText, this.props.textStyle]}>
          {this.props.title}
          {this.props.isMandatory === undefined ? (
            <Text style={styles.asterisk}>*</Text>
          ) : null}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 10,
  },
  mainText: {
    color: EDColors.placeholder,
    fontFamily: EDFonts.regular,
    fontSize: getProportionalFontSize(15),
  },
  asterisk: {
    color: EDColors.error,
    fontFamily: EDFonts.regular,
    padding: 10,
  },
});
