/* eslint-disable react-native/no-inline-styles */
/* eslint-disable semi */
/* eslint-disable prettier/prettier */
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { isRTLCheck, getProportionalFontSize } from '../utils/EDConstants';
import { EDColors } from '../utils/EDColors';
import { EDFonts } from '../utils/EDFontConstants';

export default class EDRTLText extends React.Component {
    //#region LIFE CYCLE METHODS
    /** RENDER */
    render() {
        return (
            <Text numberOfLines={this.props.numberOfLines}
                style={[styles.textStyle, { textAlign: isRTLCheck() ? 'right' : 'left' }, this.props.style]} >
                {this.props.title}
            </Text>
        )
    }
    //#endregion
}

//#region STYLES
const styles = StyleSheet.create({
    textStyle: {
        color: EDColors.black,
        fontSize: getProportionalFontSize(14),
        fontFamily: EDFonts.regular,
    },
})
//#endregion
