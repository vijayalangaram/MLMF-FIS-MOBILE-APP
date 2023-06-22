import bigDecimal from 'js-big-decimal';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { RadioButton, RadioGroup } from 'react-native-flexi-radio-button';
import { connect } from 'react-redux';
import { globalStore } from '../../App';
import EDRTLView from '../components/EDRTLView';
import { strings } from '../locales/i18n';
import { saveAlertData } from '../redux/actions/UserActions';
import { EDColors } from '../utils/EDColors';
import { debugLog, funGetFrench_Curr, getProportionalFontSize, isRTLCheck, TextFieldTypes, validateTwoDecimal } from '../utils/EDConstants';
import { EDFonts } from '../utils/EDFontConstants';
import Metrics from '../utils/metrics';
import EDButton from './EDButton';
import EDPopupView from './EDPopupView';
import EDRTLText from './EDRTLText';
import EDRTLTextInput from './EDRTLTextInput';


export default class EDRefundAlert extends React.Component {
    constructor(props) {
        super(props)
        this.arrayRefundTypes = [
            { title: strings("estimateOrderTime") }, { title: strings('partialRefund') }]
    }


    state = {
        refundReason: '',
        shouldShowValidation: '',
        selectedIndex: 0,
        refundAmount: '',

    }


    hidePopUp = () => {
        this.props.saveAlertData({})
    }

    textFieldTextDidChangeHandler = (text) => {
        this.setState({ shouldShowValidation: false, refundReason: text })
    }

    amountFieldTextDidChangeHandler = (text) => {
        let refundAmount = text.replace(/[- #*;,+<>N()A-Za-z\{\}\[\]\\\/]/gi, "");
        if (!validateTwoDecimal(refundAmount)) {
            this.setState({ shouldShowValidation: false, refundAmount: refundAmount })
        }

    }

    onSelectionIndexChangeHandler = index => {

        this.setState({ selectedIndex: index })
    }

    processRefund = () => {
        let total_refund_limit = bigDecimal.subtract(this.props.orderToRefund.total,this.props.orderToRefund.refunded_amount)
        this.setState({ shouldShowValidation: true })
        if (this.state.selectedIndex == 1 &&
            (this.state.refundAmount.trim().length == 0 || (Number(this.state.refundAmount) > total_refund_limit))
        )
            return;
        else if (this.state.refundReason.trim().length == 0)
            return;
        this.setState({ shouldShowValidation: false })
        this.props.processRefund(this.state.refundReason, this.state.refundAmount, this.state.selectedIndex);
        this.state.refundReason = ''
        this.state.refundAmount = ''
        this.state.selectedIndex = 0
    }

    hideRefundModal = () =>{
        this.state.refundReason = ''
        this.state.refundAmount = ''
        this.state.selectedIndex = 0
        this.props.hideRefundModal()
    }

    render() {
        // this.arrayRefundTypes.map((item, index) => {
        //     this.arrayRefundTypes[index].color = EDColors.primary
        //     this.arrayRefundTypes[index].size = 16
        // })
        return (
            <EDPopupView
                animationType={"none"}
                isModalVisible={this.props.shouldShowAlert}
            >

                <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>

                    <View style={{ width: Metrics.screenWidth * 0.90, borderRadius: 24, backgroundColor: EDColors.white, marginBottom: 30, padding: 10 }}>

                    <EDRTLView style={{ width: '100%', padding: 15 ,justifyContent: 'flex-end'}}>
                            {/* <Icon
                                name={'info'}
                                size={getProportionalFontSize(15)}
                                color={EDColors.text}
                                type={'ant-design'}
                                style={{ borderWidth: 1, borderColor: EDColors.text, borderRadius: 5, padding: 2 }}
                            /> */}
                            <Icon
                                name={'close'}
                                size={getProportionalFontSize(20)}
                                color={EDColors.text}
                                style={{  padding: 2 ,}}
                                onPress={this.hideRefundModal}
                            />
                        </EDRTLView>

                        <EDRTLView style={styles.titleViewStyle}>
                            <Text style={styles.titleTextStyle}>
                                {strings("loginAppName")}</Text>
                        </EDRTLView>
                        {/* MIDDLE TEXT VIEW */}
                        <EDRTLView >
                            <Text style={styles.middleTextStyle}>{strings("refundConfirm")}</Text>
                        </EDRTLView>

                        {/* REFUND REASON INPUT */}

                        <RadioGroup
                            color={EDColors.text}
                            onSelect={this.onSelectionIndexChangeHandler}
                            // style={{ flexDirection: 'row' }}
                            selectedIndex={this.state.selectedIndex}
                            thickness={2}
                            size={16}
                            activeColor={EDColors.primary}
                        >


                            <RadioButton
                                key={strings('fullRefund')}
                                value={strings('fullRefund')}
                                color={EDColors.primary}
                                style={[{ flexDirection: isRTLCheck() ? 'row-reverse' : 'row' }]}
                            >
                                <EDRTLText title={strings('fullRefund')} />

                            </RadioButton>
                            <RadioButton
                                key={strings('partialRefund')}
                                value={strings('partialRefund')}
                                color={EDColors.primary}
                                style={[{ flexDirection: isRTLCheck() ? 'row-reverse' : 'row' }]}
                            >
                                <EDRTLText title={strings('partialRefund')} />

                            </RadioButton>
                        </RadioGroup>
                        {/* <RadioGroup
                                    layout='column'
                                    radioButtons={this.arrayRefundTypes}
                                    onPress={this.onSelectionIndexChangeHandler}

                                /> */}
                        {this.state.selectedIndex == 1 ?
                            <EDRTLTextInput
                                containerStyle={styles.textStyle}
                                type={TextFieldTypes.amount}
                                placeholder={strings('amount')}
                                onChangeText={this.amountFieldTextDidChangeHandler}
                                initialValue={this.state.refundAmount}
                                errorFromScreen={this.state.shouldShowValidation ?
                                    this.state.refundAmount.length == 0 ?
                                        strings("amountEmpty") :
                                        Number(this.state.refundAmount) >bigDecimal.subtract(this.props.orderToRefund.total,this.props.orderToRefund.refunded_amount)
                                            ?
                                            (strings("amountError") + " " + this.props.orderToRefund.currency_symbol + funGetFrench_Curr((Number(this.props.orderToRefund.total) - Number(this.props.orderToRefund.refunded_amount)), 1, this.props.lan)) : '' : ''}
                            /> : null}
                        <EDRTLTextInput
                            containerStyle={styles.textStyle}
                            type={TextFieldTypes.default}
                            placeholder={strings('refundReason')}
                            onChangeText={this.textFieldTextDidChangeHandler}
                            initialValue={this.state.refundReason}
                            errorFromScreen={this.state.shouldShowValidation &&
                                this.state.refundReason.trim().length == 0 ?
                                strings("refundReasonError") : ""
                            }
                        />


                        {/* <EDRTLView style={styles.bottomButtonView}> */}
                        <EDRTLView style={{ alignItems: 'center', marginBottom: 10, marginTop: 5, }}>
                            <EDButton
                                style={[styles.btnStyle, { backgroundColor: EDColors.primary }]}
                                textStyle={[styles.OkTextStyle, { color: EDColors.white }]}
                                label={strings("dialogNo")}
                                onPress={this.hideRefundModal}

                            />
                            <EDButton
                                style={[styles.btnStyle, { backgroundColor: EDColors.offWhite }]}
                                textStyle={[styles.OkTextStyle, { color: EDColors.black }]}
                                label={strings("dialogYes")}
                                onPress={this.processRefund}


                            />
                        </EDRTLView>
                    </View>
                </View>
            </EDPopupView>
        )
    }
}


const styles = StyleSheet.create({
    //Main top view
    mainViewStyle: {
        justifyContent: 'center',
        flexDirection: 'column',
        margin: 15,
        borderRadius: 24,
        height: Metrics.screenHeight * 0.7
    },
    titleViewStyle: {
        padding: 10,
        backgroundColor: EDColors.white,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
    },
    titleTextStyle: {
        color: EDColors.black,
        fontFamily: EDFonts.semibold,
        textAlign: 'left',
        fontSize: getProportionalFontSize(16),
    },
    middleTextView: {
        backgroundColor: EDColors.white,
    },
    middleTextStyle: {
        color: EDColors.text,
        fontFamily: EDFonts.medium,
        textAlign: 'left',
        fontSize: getProportionalFontSize(14),
        paddingHorizontal: 10,
    },
    bottomButtonView: {
        backgroundColor: EDColors.white,
        paddingBottom: 15,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        alignItems: 'flex-end'
    },
    btnStyle: { flex: 1, borderRadius: 16, marginHorizontal: 5, marginTop: 15 },
    textStyle: {
        marginHorizontal: 10
    },
    OkTextStyle: { color: EDColors.white, fontSize: getProportionalFontSize(16), fontFamily: EDFonts.medium, marginVertical: 8 }
})



