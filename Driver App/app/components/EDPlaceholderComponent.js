/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, { Component } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { heightPercentageToDP } from 'react-native-responsive-screen';
import Assets from '../assets';
import { strings } from '../locales/i18n';
import { EDColors } from '../utils/EDColors';
import { EDFonts } from '../utils/EDFontConstants';
import EDButton from './EDButton';
import EDRTLText from './EDRTLText';

export default class EDPlaceholderComponent extends Component {
    //#region LIFE CYCLE METHODS
    /** RENDER */
    render() {
        return (
            <View style={styles.mainContainer}>

                <View style={[styles.childContainer, { backgroundColor: this.props.backgroundColor || '#F6F6F6', borderColor: this.props.backgroundColor ? EDColors.white : EDColors.primary }]}>
                    <Image source={this.props.icon || Assets.bg_error} style={styles.iconStyle} />
                    {this.props.title
                        ? <EDRTLText title={this.props.title} style={[styles.titleText, { color: this.props.backgroundColor ? EDColors.white : EDColors.textAccount }]} />
                        : null}
                    {this.props.subTitle
                        ? <EDRTLText title={this.props.subTitle} style={[styles.messageText, { color: this.props.backgroundColor ? EDColors.white : EDColors.text, marginTop: this.props.title ? 0 : 10 }]} />
                        : null}
                    {this.props.onBrowseButtonHandler
                        ? <EDButton onPress={this.props.onBrowseButtonHandler} style={{ marginTop: 20, backgroundColor: EDColors.homeButtonColor }} label={strings('browse')} />
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
        // borderWidth: 1,
        padding: 20,
        paddingHorizontal: 20,
        width: '75%',
        alignItems: 'center',
        shadowOpacity: 0.25,
        shadowRadius: 5,
        shadowColor: EDColors.text,
        shadowOffset: { height: 0, width: 0 },
        marginTop: -40
    },
    titleText: {
        fontSize: heightPercentageToDP('2%'),
        fontFamily: EDFonts.semiBold,
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
    }
});
