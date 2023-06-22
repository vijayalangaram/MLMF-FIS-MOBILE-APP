/* eslint-disable react-native/no-inline-styles */
/* eslint-disable semi */
/* eslint-disable prettier/prettier */
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { EDColors } from '../utils/EDColors';
import { getProportionalFontSize, isRTLCheck } from '../utils/EDConstants';
import { EDFonts } from '../utils/EDFontConstants';

export default class EDRTLText extends React.Component {
    //#region LIFE CYCLE METHODS
    /** RENDER */
    render() {
        return (
            <Text numberOfLines={this.props.numberOfLines}
                selectable={this.props.selectable}
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
