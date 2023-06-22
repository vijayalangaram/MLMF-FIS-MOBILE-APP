/* eslint-disable prettier/prettier */
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { EDColors } from '../utils/EDColors';
import { EDFonts } from '../utils/EDFontConstants';
import { getProportionalFontSize } from '../utils/EDConstants';
import EDRTLText from './EDRTLText';

export default class EDButton extends React.PureComponent {
    //#region LIFE CYCLE METHODS
    /** RENDER */
    render() {
        return (
            <TouchableOpacity
                style={[style.menuBorder, this.props.style]}
                onPress={this.props.onPress}
                disabled={this.props.disabled || false}
                >
                <EDRTLText style={[style.textStyle, this.props.textStyle]}
                    title={this.props.label}
                />
            </TouchableOpacity>
        );
    }
    //#endregion
}

//#region STYLESz
export const style = StyleSheet.create({
    menuBorder: {
        marginHorizontal: 20,
        backgroundColor: EDColors.primary,
        padding: 10,
        borderRadius: 5,
    },
    textStyle: {
        alignSelf: 'center',
        color: EDColors.white,
        fontSize: getProportionalFontSize(16),
        fontFamily: EDFonts.medium
    },
});
//#endregion
