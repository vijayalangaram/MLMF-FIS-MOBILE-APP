/* eslint-disable prettier/prettier */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import { EDColors } from '../utils/EDColors';
import { getProportionalFontSize, isRTLCheck } from '../utils/EDConstants';
import { EDFonts } from '../utils/EDFontConstants';

export default class EDButton extends React.PureComponent {
    //#region LIFE CYCLE METHODS
    /** RENDER */
    render() {
        return (
            <TouchableOpacity
                activeOpacity={this.props.activeOpacity}
                onLayout={this.props.onLayout}
                style={[style.buttonStyle, this.props.style, { flexDirection: isRTLCheck() ? "row-reverse" : 'row', }]}
                onPress={this.props.onPress}>
                {this.props.icon !== undefined ?
                    <Icon name={this.props.icon} size={18} color={this.props.iconColor || EDColors.white} /> : null}
                <Text style={[style.textStyle, this.props.textStyle]}>
                    {this.props.label}
                </Text>
            </TouchableOpacity>
        );
    }
    //#endregion
}

//#region STYLES
export const style = StyleSheet.create({
    buttonStyle: {
        marginHorizontal: 20,
        backgroundColor: EDColors.homeButtonColor,
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: isRTLCheck() ? "row-reverse" : 'row',

    },
    textStyle: {
        alignSelf: 'center',
        color: EDColors.white,
        fontSize: getProportionalFontSize(16),
        fontFamily: EDFonts.medium,
    },
});
//#endregion
