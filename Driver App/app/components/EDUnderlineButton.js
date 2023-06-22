/* eslint-disable prettier/prettier */
import React, { Component } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { heightPercentageToDP } from 'react-native-responsive-screen';
import { EDColors } from '../utils/EDColors';
import { EDFonts } from '../utils/EDFontConstants';

export default class EDUnderlineButton extends Component {

    render() {
        return (
            <TouchableOpacity
                pointerEvents={this.props.pointerEvents || 'auto'}
                style={[stylesButton.themeButton, this.props.buttonStyle]}
                onPress={this.props.onPress} >
                <Text
                    style={[
                        stylesButton.themeButtonText,
                        this.props.textStyle,
                    ]}>
                    {this.props.label}
                </Text>
            </TouchableOpacity >

        );
    }
}

export const stylesButton = StyleSheet.create({
    themeButton: {
        justifyContent: 'center',
        alignSelf: 'center',
        borderBottomColor: EDColors.white,
        borderBottomWidth: 1
    },
    themeButtonText: {
        color: EDColors.white,
        fontFamily: EDFonts.bold,
        alignSelf: 'center',
        fontSize: heightPercentageToDP('1.8%')
    },
});
