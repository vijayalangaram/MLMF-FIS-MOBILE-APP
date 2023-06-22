import React, { Component } from 'react';
import { EDColors } from '../utils/EDColors'
import { EDFonts } from '../utils/EDFontConstants'
import { strings } from '../locales/i18n';
import { getProportionalFontSize, isRTLCheck } from '../utils/EDConstants';
import { View, StyleSheet, TextInput, Text } from 'react-native';
import EDRTLText from './EDRTLText';
import EDRTLView from './EDRTLView';
import EDButton from './EDButton';
import { RadioGroup, RadioButton } from 'react-native-flexi-radio-button';
import { showNoInternetAlert } from '../utils/EDAlert';
import { netStatus } from '../utils/NetworkStatusConnection';
import Metrics from '../utils/metrics';
import EDRTLTextInput from './EDRTLTextInput';

export default class   CancelReasonsList extends Component {

    constructor(props) {
        super(props);
        this.otherReason = [{ reason: strings('orderCancellationReasonsOther'), }]
        // this.arrayCancellationReasons = this.props.reasonList
        // Vikrant 15-07-21 reason list

    }

    state = {
        selectedIndex: this.props.selectedCancelReasonIndex || -1,
        strCancellationReason: '',
        shouldPerformValidation: false,
        isOtherSelected: false
    }

    componentWillMount() {
        this.arrayCancellationReasons =
            this.props.title !== undefined ?
                this.props.reasonList != undefined && this.props.reasonList != null ? [...this.props.reasonList] : undefined
                :
                this.props.reasonList != undefined && this.props.reasonList != null ? [...this.props.reasonList, { reason: strings('orderCancellationReasonsOther'), }]
                    : undefined

    }

    render() {
        console.log("TEST ::::", this.arrayCancellationReasons)
        return (
            <View style={styles.parentView}>
                <View style={styles.productsSummaryContainer}>

                    <EDRTLText
                        style={styles.modalTitle}
                        title={this.props.title !== undefined ? this.props.title : this.props.isCancel != undefined && this.props.isCancel == true ? strings('orderCancellationReasonsSelectReason') : strings('orderCancellationReasonsSelectRejectReason')} />
                    
                    <RadioGroup
                        color={EDColors.text}
                        onSelect={this.onSelectionIndexChangeHandler}
                        style={styles.radioGroupStyle}
                        selectedIndex={this.state.selectedIndex}
                        thickness={2}
                        size={16}
                        activeColor={EDColors.primary}
                    >
                        {this.arrayCancellationReasons !== undefined ?
                            this.arrayCancellationReasons.map((reasonListToIterate) => {
                                return (
                                    <RadioButton
                                        style={[styles.radioButtonStyle, { flexDirection: isRTLCheck() ? 'row-reverse' : 'row' }]}
                                        key={reasonListToIterate.reason}
                                        value={reasonListToIterate.reason}
                                        color={EDColors.primary}
                                    >
                                        <EDRTLText title={reasonListToIterate.reason} style={styles.itemPrice} />

                                    </RadioButton>
                                )
                            }) :
                            //  null }
                            // {
                            this.otherReason.map(index => {
                                return (
                                    <RadioButton
                                        style={[styles.radioButtonStyle, { flexDirection: isRTLCheck() ? 'row-reverse' : 'row' }]}
                                        key={index.reason}
                                        value={index.reason}
                                        color={EDColors.primary}
                                    >
                                        <EDRTLText title={index.reason} style={styles.itemPrice} />

                                    </RadioButton>
                                )
                            })}
                    </RadioGroup>

                    <View style={styles.horizontalView}>
                        {this.state.isOtherSelected
                            ? <EDRTLTextInput
                                defaultValue={this.state.strCancellationReason}
                                value={this.state.strCancellationReason}
                                placeholder={strings('orderCancellationReasonsEnterReason')}
                                autoCorrect={false}
                                autoFocus={true}
                                onChangeText={this.onTextDidChangeHandler}
                                maxLength={250}
                                errorFromScreen={
                                    this.state.shouldPerformValidation
                                        ? this.state.isOtherSelected && this.state.strCancellationReason.trim().length == 0
                                            ? <EDRTLText style={styles.errorTextStyle}
                                                title={this.props.isCancel != undefined && this.props.isCancel == true ? strings('orderCancellationReasonsEmptyReason') : strings('orderCancellationReasonsEmptyRejectReason')} />
                                            : null
                                        : ''
                                }
                            />
                            : null}
                        {this.state.isOtherSelected ?
                            <Text style={[styles.counterStyle, { textAlign: isRTLCheck() ? "left" : "right" }]} >
                                {this.state.strCancellationReason.length}/250
                    </Text> : null
                        }

                        {this.state.shouldPerformValidation
                            ? this.state.selectedIndex == -1
                                ? <EDRTLText style={styles.errorTextStyle}
                                    title={this.props.validationMsg !== undefined ? this.props.validationMsg : (this.props.isCancel != undefined && this.props.isCancel == true ? strings('orderCancellationReasonsPleaseSelectReason') : strings('orderCancellationReasonsPleaseSelectRejectReason'))} />
                                : null
                            : null}

                        {this.props.noteText !== undefined &&
                            this.props.noteText !== null &&
                            this.props.noteText !== ''
                            ? <EDRTLText style={styles.noteTextStyle}
                                title={this.props.noteText} />
                            : null}

                    </View>
                    <EDRTLView style={styles.buttonView}>
                        <EDButton
                            style={styles.dismissButton}
                            label={strings('generalSubmit')}
                            onPress={this.buttonSavePressed} />
                        <EDButton
                            style={styles.dismissButtonTransparent}
                            textStyle={styles.transparentButtonTextStyle}
                            label={strings('dialogCancel')}
                            onPress={this.buttonDismissPressed} />
                    </EDRTLView>
                </View>
            </View>
        )
    }

    onSelectionIndexChangeHandler = (selectedIndexRadioButton, selectedValue) => {
        // console.log("SELECTEDVALUE::::::: ", selectedValue)
        this.setState({
            selectedIndex: selectedIndexRadioButton,
            strCancellationReason: selectedValue == strings('orderCancellationReasonsOther')
                ? ''
                : selectedValue,
            shouldPerformValidation: false,
            isOtherSelected: selectedValue == strings('orderCancellationReasonsOther') ? true : false
        })
    }

    onTextDidChangeHandler = (reason) => {
        this.setState({ strCancellationReason: reason })
    }

    buttonDismissPressed = () => {
        if (this.props.onDismissCancellationReasonDialogueHandler !== undefined) {
            this.props.onDismissCancellationReasonDialogueHandler()
        }
    }

    buttonSavePressed = () => {
        netStatus(isConnected => {
            if (isConnected) {
                this.setState({ shouldPerformValidation: true })
                if (this.state.isOtherSelected && this.state.strCancellationReason.trim().length == 0) {
                    return;
                }

                if (this.state.selectedIndex == -1) {
                    return;
                }

                if (this.props.onDismissCancellationReasonDialogueHandler !== undefined) {
                    this.props.onDismissCancellationReasonDialogueHandler(this.state.strCancellationReason, this.state.selectedIndex)
                }
            } else {
                showNoInternetAlert();
            }
        });
    }
}

// Vikrant 15-07-21
const styles = StyleSheet.create({
    parentView: { flex: 1, justifyContent: 'flex-end' },
    horizontalView: { marginHorizontal: 15 },
    transparentButtonTextStyle: { color: EDColors.black },
    productsSummaryContainer: { borderRadius: 24, marginBottom: 50, marginHorizontal: 20, padding: 10, backgroundColor: EDColors.white, shadowOpacity: 0.25, shadowRadius: 5, shadowColor: EDColors.text, shadowOffset: { height: 0, width: 0 } },
    modalTitle: { paddingVertical: 15, marginHorizontal: 10, color: EDColors.primary, fontSize: getProportionalFontSize(16), fontFamily: EDFonts.semibold, fontWeight: '500', borderBottomColor: "#F6F6F6", borderBottomWidth: 1 },
    itemPrice: { textAlignVertical: "center", marginHorizontal: 5, color: EDColors.text, fontSize: getProportionalFontSize(14), fontFamily: EDFonts.medium, fontWeight: '500' },
    dismissButton: {
        paddingHorizontal: 0, alignSelf: 'center', marginTop: 20, marginBottom: 10, marginHorizontal: 10,
        fontSize: getProportionalFontSize(16),
        height: Metrics.screenHeight * 0.073,
        width: Metrics.screenWidth * 0.37,
        justifyContent: 'center',
        fontFamily: EDFonts.medium, borderRadius: 16
    },
    textFieldStyle: {
        marginBottom: 5
    },
    dismissButtonTransparent: {
        paddingHorizontal: 0, alignSelf: 'center', marginTop: 20, marginBottom: 10, marginHorizontal: 10,
        fontSize: getProportionalFontSize(16),
        height: Metrics.screenHeight * 0.073,
        width: Metrics.screenWidth * 0.37,
        justifyContent: 'center', backgroundColor: EDColors.radioSelected,
        fontFamily: EDFonts.medium, borderRadius: 16
    },
    counterStyle: {
        marginHorizontal: 20,
        marginTop: 5,
        fontSize: getProportionalFontSize(12),
        color: EDColors.text
    },
    errorTextStyle: {
        fontSize: getProportionalFontSize(12),
        fontFamily: EDFonts.regular,
        color: EDColors.error,
        marginHorizontal: 20,
    },
    noteTextStyle: {
        fontSize: getProportionalFontSize(14),
        fontFamily: EDFonts.regular,
        color: EDColors.black,
        marginHorizontal: 0,
        marginVertical: 10
    },
    radioGroupStyle: { margin: 5, backgroundColor: EDColors.transparent },
    radioButtonStyle: { alignItems: "center" },
    buttonView: { justifyContent: 'center', marginTop: 5 }
})

