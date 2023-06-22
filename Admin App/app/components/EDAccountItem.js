/* eslint-disable jsx-quotes */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, { Component } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { EDFonts } from '../utils/EDFontConstants';
import EDRTLText from './EDRTLText';
import { EDColors } from '../utils/EDColors';
import EDRTLView from './EDRTLView';
import { RadioGroup, RadioButton } from 'react-native-flexi-radio-button';
import { debugLog, getProportionalFontSize, isRTLCheck } from '../utils/EDConstants';
import { saveLanguage } from '../utils/AsyncStorageHelper';
import I18n from "i18n-js";
import RNRestart from 'react-native-restart'; // Import package from node modules
import { userLanguage } from '../utils/ServiceManager';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { Icon } from 'react-native-elements';
import { netStatus } from '../utils/NetworkStatusConnection';
import { showNoInternetAlert } from '../utils/EDAlert';

export default class EDAccountItem extends Component {

    //#region LANGUAGE SELECTION
    /**
     * 
     * @param {The index of the language selected from the list} index
     * @param {The value assigned to each radio button to get the selected value} value
     */
    onLanguageSelection = (index, value) => {
        netStatus(status => {

            if (status) {
                I18n.locale = value;
                saveLanguage(value, this.onSuccessLanguageSelection, this.onFailureLanguageSelection);
                this.setUserLanguage(value)
            }
            else
                showNoInternetAlert()
        })
    }

    onSuccessLanguageSelection = () => {
        // RNRestart.Restart()
    }

    onFailureLanguageSelection = () => {

    }
    //#endregion

    //#region LIFE CYCLE METHODS
    constructor(props) {
        super(props);
        this.selectedLanguageIndex = this.props.languageArray !== undefined &&
            this.props.languageArray !== null &&
            this.props.languageArray.length !== 0 ?
            this.props.languageArray.map(data => data.language_slug).indexOf(this.props.lan) : -1;

        this.arrayLanguages = this.props.languageArray || []
    }
    /** DID MOUNT */
    componentDidMount() {

    }

    /** RENDER METHOD */
    render() {

        return (
            //  PARENT CONTAINER
            <View style={styles.mainContainer}>
                {/* TOUCHABLE CONTAINER  */}
                <TouchableOpacity onPress={this.onPressHandler} disabled={this.props.isForLanguage} style={styles.touchableContainer}>
                    {/* RTL CONTAINER */}
                    <EDRTLView style={styles.childContainer}>
                        <Icon
                            style={[this.props.iconStyle, { transform: [{ rotateY: isRTLCheck() ? '180deg' : '0deg' }] }]}
                            name={this.props.icon}
                            size={getProportionalFontSize(this.props.size || 20)}
                            color={EDColors.text}
                            type={this.props.iconType || "material"}
                        />
                        {/* TITLE */}
                        <EDRTLText style={styles.textStyle} title={this.props.title} />
                        {/* HIDE ARROW FOR LANGUAGE */}
                        {this.props.isForLanguage ? null :
                            <MaterialIcon size={getProportionalFontSize(25)} color={EDColors.text} name={'keyboard-arrow-right'} style={{ transform: [{ rotateY: isRTLCheck() ? '180deg' : '0deg' }] }} />
                        }
                    </EDRTLView>
                </TouchableOpacity>
                {/* RENDER LANGUAGES */}
                {this.props.isForLanguage &&
                    this.props.languageArray !== undefined &&
                    this.props.languageArray !== null &&
                    this.props.languageArray.length > 1
                    ? <EDRTLView style={[styles.languageContainer, { alignSelf: isRTLCheck() ? 'flex-end' : 'flex-start' }]}>
                        <RadioGroup style={styles.widthStyle} color={EDColors.text} size={15} activeColor={EDColors.black} thickness={2} highlightColor={EDColors.offWhite} onSelect={this.onLanguageSelection} selectedIndex={this.selectedLanguageIndex}
                        >
                            {this.props.languageArray.map((languageToIterate) => (
                                <RadioButton color={EDColors.primary} style={[styles.radioButtonStyle, { flexDirection: isRTLCheck() ? 'row-reverse' : 'row' }]} value={languageToIterate.language_slug} key={languageToIterate.id} >
                                    <EDRTLText style={styles.languageTextStyle} title={languageToIterate.language_name} />
                                </RadioButton>
                            ))}
                        </RadioGroup>
                    </EDRTLView>
                    : null
                }
            </View >
        );
    }
    //#endregion

    /**
     *
     * @param {The call API for get Product data}
     */
    setUserLanguage = (value) => {
        let objUserLanguageParams = {
            user_id: this.props.UserID,
            language_slug: value,
            token: this.props.token
        };

        userLanguage(
            objUserLanguageParams,
            this.onSuccessUserLanguage,
            this.onFailureUserLanguage,
            this.props,
        )
    }

    //#region NETWORK METHODS
    /**
    *
    * @param {The success response object} objSuccess
    */
    onSuccessUserLanguage = (onSuccess) => {
        RNRestart.Restart();
    }

    /**
    *
    * @param {The failure response object} objFailure
    */
    onFailureUserLanguage = (onFailure) => {
        RNRestart.Restart();
    }
    //#region
    /** BUTTON EVENTS */
    onPressHandler = () => {
        if (this.props.onPress !== undefined) {
            this.props.onPress(this.props.title);
        }
    }
    //#endregion
}


export const styles = StyleSheet.create({
    mainContainer: {
        borderColor: EDColors.shadow,
        // borderWidth: 1,
        borderRadius: 16,
        marginTop: 15,
        alignItems: 'center',
        backgroundColor: EDColors.white,
        elevation: 4,
        shadowColor: EDColors.shadowColor, shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.44,
        shadowRadius: 10.32,
    },
    widthStyle: { width: '100%' },
    touchableContainer: { alignItems: 'center' },
    childContainer: { padding: 15, alignItems: 'center' },
    languageContainer: {
        marginHorizontal: 15,
        flexDirection: 'row',
        marginVertical: 10,
        borderTopWidth: 1, borderTopColor: EDColors.secondaryBorderColor, width: '90%', paddingTop: 10
    },
    radioButtonStyle: { borderRadius: 16, paddingVertical: 15, alignItems: 'center' },
    languageTextStyle: {
        marginHorizontal: 10,
        color: EDColors.text,
        fontFamily: EDFonts.medium,
        fontSize: getProportionalFontSize(16),
        fontWeight: '500',

    },
    textStyle: {
        marginHorizontal: 10,
        flex: 1,
        color: EDColors.text,
        fontFamily: EDFonts.medium,
        fontSize: getProportionalFontSize(16)
    },
});