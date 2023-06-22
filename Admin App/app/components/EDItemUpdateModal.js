/* eslint-disable react-native/no-inline-styles */
/* eslint-disable semi */
/* eslint-disable prettier/prettier */
import React, { Component } from 'react';
import { Alert, FlatList } from 'react-native';
import { Platform } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { TextInput } from 'react-native';
import { StyleSheet, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { initialWindowMetrics } from 'react-native-safe-area-context';
import { strings } from '../locales/i18n';
import { showDialogue, showTopDialogue } from '../utils/EDAlert';
import { EDColors } from '../utils/EDColors';
import { debugLog, getProportionalFontSize, TextFieldTypes } from '../utils/EDConstants';
import { EDFonts } from '../utils/EDFontConstants';
import { default as metrics } from '../utils/metrics';
import EDCartItem from './EDCartItem';
import EDImage from './EDImage';
import EDRTLText from './EDRTLText';
import EDRTLTextInput from './EDRTLTextInput';
import EDRTLView from './EDRTLView';
import EDThemeButton from './EDThemeButton';


export default class EDItemUpdateModal extends Component {

    /** CONSTRUCTOR */
    constructor(props) {
        super(props);
        this.orderDataUpdated = JSON.parse(JSON.stringify(this.props.orderData))
        this.orderData = JSON.parse(JSON.stringify(this.props.orderData))
    }

    state = {

        isLoading: false,
        key: 1,
        reason: '',
        shouldShowError: false
    }

    renderCartItem = ({ item, index }) => {
        return <EDCartItem item={item} index={index} updateQty={this.updateQty}
            onDeletePress={this.onDeletePress}
            hideDeleteIcon={this.orderDataUpdated.items.length == 1}
        />
    }

    updateQty = (qty, index) => {
        this.orderDataUpdated.items[index].quantity = qty
    }

    onDeletePress = (index) => {
        if (this.orderDataUpdated.items.length == 1) {
            showTopDialogue(strings("deleteError"),true)
            return;
        }

        Platform.OS == "ios" ?
            Alert.alert(strings("confirmDelete"), "", [{ text: strings("dialogNo"), onPress: () => { } },
            {
                text: strings("dialogYes"), onPress: () => {
                    this.orderDataUpdated.items.splice(index, 1)
                    this.orderData.items.splice(index, 1)
                    this.setState({ key: this.state.key + 1 })
                }, style: 'destructive'
            }])
            :
            showDialogue(strings("confirmDelete"), "", [{
                text: strings("dialogNo"), onPress: () => { }
            }], () => {
                this.orderDataUpdated.items.splice(index, 1)
                this.orderData.items.splice(index, 1)
                this.setState({ key: this.state.key + 1 })
            }, strings("dialogYes"), true)

    }

    buttonSubmitPressed = () => {
        if (this.state.reason.trim().length == 0) {
            this.setState({ shouldShowError: true })
            return;
        }
        if (this.props.buttonSubmitPressed)
            this.props.buttonSubmitPressed(this.orderDataUpdated.items, this.state.reason)
    }

    textFieldTextDidChangeHandler = (text) => {
        this.setState({ reason: text, shouldShowError: false })
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <TouchableOpacity style={{ flex: 1 }} onPress={this.props.onDismiss} activeOpacity={0} />
                <View style={{ maxHeight: "90%", justifyContent: "flex-end" }}>

                    <View pointerEvents={this.state.isLoading ? 'none' : 'auto'} style={[styles.container, { paddingBottom: Platform.OS == "ios" ? initialWindowMetrics.insets.bottom + 10 : 10 }]} >
                        <View style={styles.lineView}>
                            <View style={styles.line}></View>
                        </View>
                        <EDRTLView style={styles.rtlView}>
                            <EDRTLText
                                style={styles.titleText}
                                title={strings('updateCart')} />
                            <Icon onPress={this.props.onDismiss} containerStyle={{ marginHorizontal: 5 }} type={'material'} size={getProportionalFontSize(25)} name={'close'} color={EDColors.text} />
                        </EDRTLView>
                        <FlatList
                            key={this.state.key}
                            keyExtractor={(item, index) => item + index}
                            data={this.orderData.items}
                            style={{ marginVertical: 5 }}
                            renderItem={this.renderCartItem}

                        />
                        <EDRTLTextInput placeholder={strings("orderCancellationReasonsEnterReason")}
                            type={TextFieldTypes.default}
                            onChangeText={this.textFieldTextDidChangeHandler}
                            initialValue={this.state.reason}
                            errorFromScreen={this.state.shouldShowError ? this.state.reason.trim().length == 0 ?
                                strings("validationRequiredField") : '' : ""
                            }
                        />

                        {/* SUBMIT REVIEW BUTTON */}
                        <EDThemeButton
                            isLoadingPermission={this.state.isLoading}
                            style={styles.btnStyle}
                            textStyle={styles.btnText}
                            label={strings('generalSubmit')}
                            onPress={this.buttonSubmitPressed}
                            isRadius={true}
                        />
                    </View>
                </View>
            </View>
        )
    }
    //#endregion
}

const styles = StyleSheet.create({
    lineView: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    line: {
        width: metrics.screenWidth * 0.25,
        height: metrics.screenWidth * 0.01,
        backgroundColor: "#F6F6F6",
        marginVertical: 8
    },

    rtlView: {
        justifyContent: 'space-between', marginTop: 5,
    },
    btnStyle: {
        width: '100%',
        // height: metrics.screenHeight * 0.075,
        borderRadius: 16
    },
    btnText: {
        fontFamily: EDFonts.medium,
        fontSize: getProportionalFontSize(16),
        color: EDColors.white
    },
    container: { paddingVertical: 10, overflow: 'scroll', borderRadius: 5, paddingHorizontal: 20, borderTopLeftRadius: 32, borderTopRightRadius: 32, backgroundColor: EDColors.white, shadowOpacity: 0.25, shadowRadius: 5, shadowColor: EDColors.text, shadowOffset: { height: 0, width: 0 } },
    titleText: { marginHorizontal: 5, color: EDColors.primary, fontSize: getProportionalFontSize(16), fontFamily: EDFonts.bold, textAlign: 'center' },
    imageRecipeStyle: { marginHorizontal: 5, borderRadius: 8, height: getProportionalFontSize(35), width: getProportionalFontSize(35) },

})
