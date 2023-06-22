/* eslint-disable semi */
/* eslint-disable prettier/prettier */
import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { EDColors } from '../utils/EDColors';
import { capiString, debugLog, funGetDateStr, getProportionalFontSize, isRTLCheck } from '../utils/EDConstants';
import { EDFonts } from '../utils/EDFontConstants';
import { strings } from '../locales/i18n';
import EDAcceptRejectButtons from './EDAcceptRejectButtons';
import EDRTLView from '../components/EDRTLView'
import EDTextIcon from './EDTextIcon';
import Metrics from '../utils/metrics';
import EDButton from './EDButton';
import EDRTLText from './EDRTLText';
import EDImage from './EDImage';
import { Icon } from 'react-native-elements';
import moment from "moment"
import Assets from '../assets';

export default class EDOrderDetailCard extends Component {
    /** LIFE CYCLE METHODS */
    constructor(props) {
        super(props)
    }

    /** RENDER METHOD */
    render() {
        return (


            <EDRTLView style={[style.rootView]}>

                {/* PARENT VIEW */}
                <EDRTLView style={[style.parentView, { backgroundColor: this.props.order.item.is_delayed == "1" ? EDColors.delayed : EDColors.white }]}>


                    {/* HEADER ITEMS */}

                    <EDRTLView style={style.headerTextView}>
                        <View style={style.flexView}>
                            <EDRTLText style={[style.parentHeaderText, { alignSelf: isRTLCheck() ? 'flex-end' : "flex-start" }]}
                                title={strings("orderId") + this.props.order.item.order_id}
                                numberOfLines={2}
                            />
                            <EDRTLText style={[style.parentHeaderText1, { alignSelf: isRTLCheck() ? 'flex-end' : "flex-start" }]}
                                title={strings("orderDate") + funGetDateStr(this.props.order.item.order_date, "MMM DD YYYY, hh:mm A")}
                                numberOfLines={2}
                            />
                        </View>
                        <View style={style.flexView} >
                            {this.props.order.item.is_delayed == "1" ?
                                <EDRTLText
                                    style={[style.delayedText, { alignSelf: isRTLCheck() ? 'flex-start' : "flex-end" }]}
                                    numberOfLines={2}
                                    title={strings("orderDelayed")} /> : null}
                            <EDRTLText
                                style={[style.headerText, { alignSelf: isRTLCheck() ? 'flex-start' : "flex-end" }]}
                                numberOfLines={2}
                                title={strings("orderStatus") + this.props.order.item.order_status_display} />


                            <EDRTLText
                                style={[style.headerText1, { alignSelf: isRTLCheck() ? 'flex-start' : "flex-end" }]}
                                numberOfLines={2}
                                title={strings("orderAmount") + this.props.order.item.currency_symbol + this.props.order.item.total} />

                        </View>
                    </EDRTLView>
                    {this.props.order.item.refund_status !== undefined && this.props.order.item.refund_status !== null && this.props.order.item.refund_status !== "" ?
                        <EDRTLView style={style.headerTextView}>
                            <View style={{ maxWidth: "50%" }}>
                                {this.props.order.item.refund_status !== undefined && this.props.order.item.refund_status !== null && this.props.order.item.refund_status !== "" ?
                                    <EDRTLView style={{ alignItems: "center", flexWrap: "wrap", marginTop: 5 }}>
                                        <EDRTLText style={[style.parentHeaderText1, { alignSelf: isRTLCheck() ? 'flex-end' : "flex-start", marginTop: 0, flex: undefined, paddingRight: 0, fontFamily: EDFonts.bold, }]}
                                            title={strings("refundStatus") + ": "}
                                            numberOfLines={2}
                                        />
                                        <EDRTLText style={[style.parentHeaderText1, { alignSelf: isRTLCheck() ? 'flex-end' : "flex-start", marginTop: 0, flex: undefined, fontFamily: EDFonts.bold, color: EDColors.error }]}
                                            title={capiString(this.props.order.item.refund_status)}
                                            numberOfLines={2}
                                        />
                                    </EDRTLView>
                                    : null}
                                {this.props.order.item.tips_refund_status !== undefined && this.props.order.item.tips_refund_status !== null && this.props.order.item.tips_refund_status !== "" ?
                                    <EDRTLView style={{ alignItems: "center", flexWrap: "wrap", marginTop: 5 }}>
                                        <EDRTLText style={[style.parentHeaderText1, { alignSelf: isRTLCheck() ? 'flex-end' : "flex-start", marginTop: 0, flex: undefined, paddingRight: 0, fontFamily: EDFonts.bold, }]}
                                            title={strings("tipRefundStatus") + ": "}
                                            numberOfLines={2}
                                        />
                                        <EDRTLText style={[style.parentHeaderText1, { alignSelf: isRTLCheck() ? 'flex-end' : "flex-start", marginTop: 0, flex: undefined, fontFamily: EDFonts.bold, color: EDColors.error }]}
                                            title={capiString(this.props.order.item.tips_refund_status)}
                                            numberOfLines={2}
                                        />
                                    </EDRTLView>
                                    : null}
                            </View>
                            {this.props.order.item.refunded_amount !== undefined &&
                                this.props.order.item.refunded_amount !== null &&
                                this.props.order.item.refunded_amount !== "" &&
                                this.props.order.item.refunded_amount !== "0" &&
                                this.props.order.item.refunded_amount !== 0
                                ?
                                <EDRTLText
                                    style={[style.headerText1, { alignSelf: "flex-start", fontFamily: EDFonts.bold, maxWidth: "50%" }]}
                                    numberOfLines={2}
                                    title={strings("refundedAmount") + ": " + this.props.order.item.currency_symbol + this.props.order.item.refunded_amount} />
                                : null}
                        </EDRTLView> : null}


                    {/* SCHEDULED ORDER */}

                    {this.props.order.item.scheduled_date != undefined &&
                        this.props.order.item.scheduled_date != null &&
                        this.props.order.item.scheduled_date != ""
                        ?
                        <EDRTLView style={style.scheduled}>
                            <Icon name="schedule" size={getProportionalFontSize(18)} color={
                                this.props.order.item.is_delayed == "1" ? EDColors.text :
                                    EDColors.primary} />
                            <EDRTLText
                                title={strings("orderScheduled") + " " +
                                    moment(this.props.order.item.scheduled_date, "YYYY-MM-DD").format("MMMM D, YYYY") + ", " +
                                    this.props.order.item.slot_open_time + " - " + this.props.order.item.slot_close_time
                                } style={[style.schedulingText]} />
                        </EDRTLView> : null}

                    <View style={{ height: 1, backgroundColor: EDColors.radioSelected, marginTop: 10 }} />




                    {/* PARENT MIDDDLE VIEW */}
                    <EDRTLView style={style.mainView}>

                        {/* MIDDLE CONTENT */}
                        <EDRTLView style={style.middleView}>
                            {/* {RESTUARANT NAME} */}
                            <EDRTLView>
                                <EDRTLText style={style.restaurantHeaderText}
                                    title={this.props.order.item.restaurant_name} />
                            </EDRTLView>

                            {/* USER NAME */}
                            {this.props.order.item.users.first_name !== undefined && this.props.order.item.users.first_name !== null && this.props.order.item.users.first_name.trim().length !== 0 ?
                                <EDTextIcon
                                    is_delayed={this.props.order.item.is_delayed == "1"}
                                    icon={'person-outline'}
                                    text={this.props.order.item.users.first_name}
                                    textStyle={[style.nameText, { color: this.props.order.item.is_delayed == "1" ? EDColors.black : EDColors.text }]}
                                    style={style.textIconStyle}
                                /> : null}
                            {/* PHONE NUMBER */}
                            {this.props.order.item.users.mobile_number !== undefined && this.props.order.item.users.mobile_number !== null && this.props.order.item.users.mobile_number.trim().length !== 0 ?
                                <EDTextIcon
                                    is_delayed={this.props.order.item.is_delayed == "1"}
                                    icon={'phone'}
                                    isTouchable={true}
                                    type={'feather'}
                                    size={15}
                                    onPress={this.onPhoneNumberPressed}
                                    text={this.props.order.item.users.mobile_number}
                                    textStyle={[style.phoneText, { color: this.props.order.item.is_delayed == "1" ? EDColors.black : EDColors.text }]}
                                    style={{ marginHorizontal: 2 }}
                                />
                                : null}

                            {/* ADDRESS */}
                            {/* {
                                this.props.order.item.delivery_flag == "pickup" ? null :
                                    (this.props.order.item.users.address !== undefined && this.props.order.item.users.address !== null && this.props.order.item.users.address.trim().length !== 0 ?
                                        <EDTextIcon
                                            is_delayed={this.props.order.item.is_delayed == "1"}
                                            icon={'location-pin'}
                                            type={'simple-line-icon'}
                                            size={15}
                                            numberOfLines={2}
                                            text={
                                                (this.props.order.item.users.landmark !== undefined && this.props.order.item.users.landmark !== null && this.props.order.item.users.landmark.trim().length !== 0 ?
                                                    (this.props.order.item.users.landmark + " , ") : '') + this.props.order.item.users.address}
                                            textStyle={[style.addressText, { color: this.props.order.item.is_delayed == "1" ? EDColors.black : EDColors.text }]} /> : null)} */}


                        </EDRTLView>
                        {/* CUTOMER ICON */}
                        {/* <EDRTLView style={style.imageView}>
                                <View style={style.imageViewStyle}>
                                    <EDImage source={this.props.order.item.users.image} style={style.imageStyle}
                                    
                                    placeholder={Assets.logo_placeholder}/>
                                </View>
                            </EDRTLView> */}

                    </EDRTLView>
                    {/* VIEW BUTTON */}
                    <EDRTLView style={style.bottomView}>
                        <EDRTLView style={style.orderButtons}>
                            <EDButton textStyle={style.buttonTextStyle} style={style.buttonStyle} label={strings('generalView')} onPress={this.onOrderViewPressed} />

                            {/* ACCEPT OR REJCT */}
                            {!this.props.order.item.order_accepted && this.props.order.item.order_status !== "Cancel" && this.props.order.item.order_status !== "Rejected" && this.props.order.item.order_status !== "Complete" ? (

                                <EDAcceptRejectButtons
                                    buttonStyle={{ marginLeft: 3 }}
                                    style={{ justifyContent: "flex-end", flex: 1 }}
                                    isShowAcceptButton={!this.props.order.item.order_accepted}
                                    onAcceptPressed={this.onOrderAcceptPressed}
                                    onRejectPressed={this.onOrderRejectPressed}
                                    onRefundPressed={this.onRefundPressed}
                                    isShowRefundButton={this.props.order.item.order_type !== "cod" &&
                                        (!this.props.order.item.refund_flag || this.props.order.item.tips_refund_flag == false)}
                                />
                            ) : null}
                            {this.props.order.item.order_accepted && this.props.order.item.order_type !== "cod" &&
                                (!this.props.order.item.refund_flag || this.props.order.item.tips_refund_flag == false)
                                ? (
                                    <EDRTLView style={[style.orderButtons, { justifyContent: "flex-end" }]}>
                                        <EDButton textStyle={style.buttonTextStyle} style={style.rejectButtonStyle} label={strings('refund')} onPress={this.onRefundPressed} />
                                    </EDRTLView>
                                ) : null}
                        </EDRTLView>
                    </EDRTLView>
                </EDRTLView>
            </EDRTLView>
        )
    }
    //#region BUTTON EVENTS
    onPhoneNumberPressed = () => {
        if (this.props.onPhoneNumberPressed != undefined) {
            this.props.onPhoneNumberPressed(this.props.order.item.users.mobile_number)
        }
    }

    onOrderViewPressed = () => {
        if (this.props.onOrderViewPressed != undefined) {
            this.props.onOrderViewPressed(this.props.order.item)
        }
    }

    onOrderAcceptPressed = () => {
        if (this.props.onOrderAcceptPressed != undefined) {
            this.props.onOrderAcceptPressed(this.props.order.item)
        }
    }

    onOrderRejectPressed = () => {
        if (this.props.onOrderRejectPressed != undefined) {
            this.props.onOrderRejectPressed(this.props.order.item)
        }
    }

    onRefundPressed = () => {
        if (this.props.onRefundPressed != undefined) {
            // this.props.onRefundPressed(this.props.order.item.order_id, Number(this.props.order.item.total) - Number(this.props.order.item.refunded_amount))
            this.props.onRefundPressed(this.props.order.item)

        }
    }
    //#endregion
}


const style = StyleSheet.create({
    rootView: {
        backgroundColor: EDColors.white, borderRadius: 16,
        shadowColor: EDColors.shadowColor,
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.44,
        shadowRadius: 10.32,

        elevation: 16,
        margin: 10, marginVertical: 5, marginTop: 10
    },
    bottomView: { justifyContent: 'space-between', marginTop: 0 },
    flexView: { flex: 1 },
    textIconStyle: { justifyContent: 'space-between', marginTop: 4, alignItems: "center", alignContent: "center" },
    parentView: { backgroundColor: EDColors.white, flex: 1, flexDirection: 'column', padding: 10, borderRadius: 16, },
    headerTextView: { flex: 1, justifyContent: 'space-between', },
    headerText: { fontSize: getProportionalFontSize(12), fontFamily: EDFonts.medium },
    delayedText: { fontSize: getProportionalFontSize(16), fontFamily: EDFonts.semibold, color: EDColors.error, marginBottom: 5 },

    headerText1: { marginTop: 5, fontSize: getProportionalFontSize(12), fontFamily: EDFonts.medium },
    preOrderText: { alignSelf: 'flex-start', fontSize: getProportionalFontSize(13), fontFamily: EDFonts.bold, color: EDColors.primary, marginLeft: 2.5 },
    parentHeaderText: { fontSize: getProportionalFontSize(12), fontFamily: EDFonts.medium, flex: 1, paddingRight: 10 },
    parentHeaderText1: { marginTop: 5, fontSize: getProportionalFontSize(12), fontFamily: EDFonts.medium, flex: 1, paddingRight: 10 },
    restaurantHeaderText: { alignSelf: 'flex-start', fontFamily: EDFonts.semibold, fontSize: getProportionalFontSize(16) },
    mainView: { flex: 1, justifyContent: 'space-evenly', marginTop: 5, },
    imageView: { flexDirection: 'column', marginTop: 5, overflow: 'hidden' },
    imageViewStyle: {},
    imageStyle: { alignSelf: 'center', width: Metrics.screenWidth * 0.25, height: Metrics.screenWidth * 0.26, overflow: 'hidden', borderRadius: 8 },
    middleView: {
        flexDirection: 'column',
        flex: 1, paddingTop: 5
    },
    phoneText: { alignSelf: 'center', flex: 1, color: EDColors.text, fontSize: getProportionalFontSize(12), fontFamily: EDFonts.semibold, },
    addressText: { textAlignVertical: "center", alignSelf: 'center', flex: 1, color: EDColors.text, fontSize: getProportionalFontSize(12), fontFamily: EDFonts.semibold, marginBottom: 2 },
    nameText: { textAlignVertical: "center", alignSelf: 'center', flex: 1, color: EDColors.text, fontSize: getProportionalFontSize(12), fontFamily: EDFonts.semibold, marginTop: 5, marginBottom: 2 },
    viewButtonContainer: { alignSelf: 'center', flexDirection: 'column' },
    viewButton: { backgroundColor: EDColors.primary, borderRadius: 8, padding: 5, alignItems: 'center' },
    orderButtons: { justifyContent: 'space-between', marginTop: 5, flex: 1 },
    buttonStyle: { marginHorizontal: 0, marginVertical: 0, padding: 0, borderRadius: 16, alignItems: 'center', marginHorizontal: 5, marginTop: 7, justifyContent: "center", alignContent: "center" },
    marginView: { marginTop: 5 },
    buttonTextStyle: { fontSize: getProportionalFontSize(12), fontFamily: EDFonts.medium, marginHorizontal: 15, marginVertical: 5 },
    rejectButtonStyle: { marginHorizontal: 3, marginVertical: 0, padding: 0, borderRadius: 16, alignItems: 'center', backgroundColor: EDColors.reject },
    scheduled: {
        alignItems: 'center',
        flex: 1,
        marginTop: 5,

    },
    schedulingText: {
        marginHorizontal: 5,
        color: EDColors.black,
        flex: 1,
        fontFamily: EDFonts.semibold, fontSize: getProportionalFontSize(13)
    },
})
