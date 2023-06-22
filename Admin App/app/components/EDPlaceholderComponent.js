/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import EDRTLText from './EDRTLText';
import { EDColors } from '../utils/EDColors';
import { heightPercentageToDP } from 'react-native-responsive-screen';
import { EDFonts } from '../utils/EDFontConstants';
import Assets from '../assets';
import EDRTLImage from './EDRTLImage';
import EDButton, { style } from './EDButton';
import { strings } from '../locales/i18n';

export default class EDPlaceholderComponent extends Component {
    //#region LIFE CYCLE METHODS
    /** RENDER */
    render() {
        return (
            <View style={styles.mainContainer}>

                <View style={[styles.childContainer, { backgroundColor: this.props.backgroundColor || EDColors.white, borderColor: this.props.backgroundColor ? EDColors.white : EDColors.primary }]}>
                    <EDRTLImage source={this.props.icon || Assets.user_placeholder} style={styles.iconStyle}/>
                    {this.props.title
                        ? <EDRTLText title={this.props.title} style={[styles.titleText, { color: this.props.backgroundColor ? EDColors.white : EDColors.textAccount }]} />
                        : null}
                    {this.props.subTitle
                        ? <EDRTLText title={this.props.subTitle} style={[styles.messageText, { color: this.props.backgroundColor ? EDColors.white : EDColors.text, marginTop: this.props.title ? 0 : 10 }]} />
                        : null}
                    {this.props.onBrowseButtonHandler
                        ? <EDButton onPress={this.props.onBrowseButtonHandler} style={ styles.buttonStyle } label={strings('buttonTitlesBrowse')} />
                        : null}
                </View>

            </View>
        );
    }
    //#region 
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    childContainer: {
        borderRadius: 5,
        borderWidth: 1,
        padding: 20,
        paddingHorizontal: 20,
        width: '80%',
        alignItems: 'center',
        shadowOpacity: 0.25,
        shadowRadius: 5,
        shadowColor: EDColors.text,
        shadowOffset: { height: 0, width: 0 },
        marginTop: -40
    },
    titleText: {
        fontSize: heightPercentageToDP('2%'),
        fontFamily: EDFonts.semibold,
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 10
    },
    messageText: {
        fontSize: heightPercentageToDP('1.6%'),
        fontFamily: EDFonts.regular,
        textAlign: 'center'
    },
    iconStyle: {
        width: 100,
        height: 100
    },
    buttonStyle: { marginTop: 20, backgroundColor: EDColors.homeButtonColor }
});
