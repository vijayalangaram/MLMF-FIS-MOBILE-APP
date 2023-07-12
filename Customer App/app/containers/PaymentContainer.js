import Moment from "moment";
import React from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View, FlatList, Platform } from "react-native";
import { Icon } from "react-native-elements";
import { NavigationActions, StackActions, NavigationEvents } from "react-navigation";
import { connect } from "react-redux";
import EDRTLText from "../components/EDRTLText";
import EDRTLView from "../components/EDRTLView";
import ProgressLoader from "../components/ProgressLoader";
import { strings } from "../locales/i18n";
import { saveCartCount, saveCheckoutDetails } from "../redux/actions/Checkout";
import { clearCartData, clearCurrency_Symbol } from "../utils/AsyncStorageHelper";
import { showDialogue, showValidationAlert, showNoInternetAlert, showPaymentDialogue } from "../utils/EDAlert";
import { EDColors } from "../utils/EDColors";
import { debugLog, funGetFrench_Curr, getProportionalFontSize, isRTLCheck, RESPONSE_SUCCESS, RESTAURANT_ERROR, PAYMENT_TYPES, TextFieldTypes, CARD_BRANDS, RETURN_URL, COUPON_ERROR } from "../utils/EDConstants";
import { EDFonts } from "../utils/EDFontConstants";
import { netStatus } from "../utils/NetworkStatusConnection";
import { addOrder, getPayLaterOrdersAPI, updatePendingOrdersAPI, applyCouponAPI, getPaymentList, getSavedCardsAPI, createPaymentMethod, checkCardPayment, addToCart } from "../utils/ServiceManager";
import BaseContainer from "./BaseContainer";
import { saveWalletMoneyInRedux, saveTableIDInRedux, saveResIDInRedux } from "../redux/actions/User";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SvgXml } from "react-native-svg";
import { discount_icon, paylater_icon } from "../utils/EDSvgIcons";
import EDThemeButton from "../components/EDThemeButton";
import metrics from "../utils/metrics";
import { CreditCardInput } from "react-native-credit-card-input";
import Assets from "../assets";
import EDPopupView from "../components/EDPopupView";
import { Spinner } from "native-base";
import WebView from "react-native-webview";
import * as RNLocalize from "react-native-localize";
import RazorpayCheckout from "react-native-razorpay";

export class PaymentContainer extends React.PureComponent {
    //#region LIFE CYCLE METHODS

    constructor(props) {
        super(props);

        this.checkoutDetail = this.props.checkoutDetail;
        this.currecy_code = this.props.navigation.getParam("currency_code")

        this.isPendingAdded = this.props.navigation.state.params != undefined
            && this.props.navigation.state.params.isPendingAdded != undefined
            && this.props.navigation.state.params.isPendingAdded !== null
            ? this.props.navigation.state.params.isPendingAdded : ''

        this.pendingTotalPayment = this.props.navigation.state.params != undefined
            && this.props.navigation.state.params.pendingTotalPayment != undefined
            && this.props.navigation.state.params.pendingTotalPayment !== null
            ? this.props.navigation.state.params.pendingTotalPayment : ''

        this.resContentId = this.props.navigation.state.params != undefined
            && this.props.navigation.state.params.resContentId != undefined
            && this.props.navigation.state.params.resContentId !== null
            ? this.props.navigation.state.params.resContentId : ''

        this.extra_comment = this.props.navigation.state.params != undefined
            && this.props.navigation.state.params.extra_comment != undefined
            && this.props.navigation.state.params.extra_comment !== null
            ? this.props.navigation.state.params.extra_comment : ''

        this.addToCartData = this.props.navigation.state.params != undefined
            && this.props.navigation.state.params.addToCartData != undefined
            && this.props.navigation.state.params.addToCartData !== null
            ? this.props.navigation.state.params.addToCartData : {}

        this.allowPayLater = "1"
        this.oldOrderID = undefined
        this.promoCode = undefined
        this.promoObj = {}
        this.oldTotal = "0.00"
        this.oldSubtotal = 0
        this.promoArray = []
        this.used_coupons = []
        this.old_credit_fee = 0
    }

    state = {
        isLoading: false,
        strComment: "",
        later: false,
        cashOn: false,
        online: false,
        showPayLater: false,
        pendingOrderArray: undefined,
        totalPendingAmount: 0,
        payPending: this.props.checkoutDetail.order_delivery == "DineIn" ? false : true,
        totalPrice: 0,
        order_delivery: this.props.checkoutDetail.order_delivery,
        disableToggle: this.props.checkoutDetail.order_delivery == "DineIn" ? false : true,
        discountedPrice: undefined,
        selectedOption: '',
        showCardInput: true,
        isDefaultCard: false,
        noDefaultCard: false,
        defaultCard: undefined,
        isSavedCardLoading: false,
        isCardSave: false,
        url: undefined,
        countryCode: undefined,
        cardError: "",
        isPaymentLoading: false,
        promoLoading: false


    };

    /**
 * @param { Success Reponse Object } onSuccess
 */
    onSuccessOrderListing = (onSuccess) => {
        debugLog("ORDER DETAIL LIST ::::::::::::: ", onSuccess)
        if (onSuccess != undefined && onSuccess.status == RESPONSE_SUCCESS) {
            if (onSuccess.dineIn.length > 0) {
                let pending = onSuccess.dineIn
                this.oldOrderID = pending[0].order_id
                this.oldSubtotal = pending[0].price.filter(data => data.label_key === "Sub Total")[0].value
                this.oldTotal = pending[0].price.filter(data => data.label_key === "Total")[0].value

                let totalPending = this.oldSubtotal
                // pending.map(data => {
                //     debugLog("TEST :::::", data)
                //     totalPending = totalPending + parseFloat(data.total)
                // })
                debugLog("TOTAL PENDING AMOUNT :::::", totalPending)
                this.setState({
                    pendingOrderArray: pending, totalPendingAmount: totalPending, totalPrice: this.state.totalPrice + parseFloat(totalPending),
                    payPending: true, later: false
                })
            } else {
                debugLog("NO PENDING ORDERS FOUND :::::")
            }
            this.setState({ isLoading: false });
        } else {
            debugLog('NOT GETTING ORDER LIST')
            this.setState({ isLoading: false });
        }
    }


    /**
     * @param { Failure Response Object } onFailure
     */
    onFailureOrderListing = (onFailure) => { // ERROR 405
        debugLog(':::::::::: FAILED TO GET ORDER', onFailure)
        this.setState({ isLoading: false });
    }

    /** GET PENDING ORDER API */
    getPendingOrderData() {
        netStatus(isConnected => {
            if (isConnected) {
                this.setState({ isLoading: true });
                let param = {
                    user_id: parseInt(this.props.userID) || 0,
                    // token: this.props.token,
                    language_slug: this.props.lan,
                }
                getPayLaterOrdersAPI(param, this.onSuccessOrderListing, this.onFailureOrderListing, this.props);
            } else {
                showNoInternetAlert()
            }
        })
    }

    onWillFocusPayment = () => {



        if (this.checkoutDetail.order_delivery == "DineIn" && this.allowPayLater !== undefined && this.allowPayLater === "1") {
            this.setState({ showPayLater: true })
        }
        this.setState({ totalPrice: this.checkoutDetail.total, payPending: false })
        this.getPaymentOptionsAPI()

        this.getPendingOrderData()

    }

    getPaymentOptionsAPI = () => {
        netStatus(isConnected => {
            if (isConnected) {
                this.setState({ isPaymentLoading: true })

                var params = {
                    language_slug: this.props.lan,
                    user_id: this.props.userID,
                    is_dine_in: '1',
                    restaurant_id: this.checkoutDetail.restaurant_id,
                    isLoggedIn: (this.props.userID !== undefined && this.props.userID !== null && this.props.userID !== "") ? 1 : 0
                }

                getPaymentList(params, this.onSuccessPaymentList, this.onFailurePaymentList, this.props)
            } else {
                showNoInternetAlert()
            }
        })
    }

    onSuccessPaymentList = onSuccess => {
        console.log(':::::::: PAYMENT SUCCESS', onSuccess)
        if (onSuccess.Payment_method !== undefined && onSuccess.Payment_method !== null && onSuccess.Payment_method.length !== 0) {
            this.paymentOptions = onSuccess.Payment_method


            //FETCH SAVED CARDS IN STRIPE PAYMENT IF SUPPORTED
            if (this.props.userID !== undefined && this.props.userID !== null &&  this.paymentOptions && this.paymentOptions.map(data =>
                data.payment_gateway_slug
            ).includes("stripe"))
                this.fetchCards()

            // if (this.state.selectedOption !== "stripe")
            // this.setState({ selectedOption: onSuccess.Payment_method[0].payment_gateway_slug })
            this.setState({
                selectedOption: onSuccess.Payment_method[0].payment_gateway_slug, cashOn:
                    onSuccess.Payment_method[0].payment_gateway_slug == "cod"
                , later: onSuccess.Payment_method[0].payment_gateway_slug == "paylater", online: false, disableToggle: false, payPending: false, totalPrice: this.state.totalPrice - parseFloat(this.state.totalPendingAmount)
            })

            if (onSuccess.Payment_method[0].payment_gateway_slug == "razorpay") {
				this.razorpayDetails = onSuccess.Payment_method[0]
			}

            this.forceUpdate();

            // this.setState({ selectedOption: onSuccess.Payment_method[0].payment_gateway_slug })
            // console.log(':::::::: calling SUCCESS', onSuccess.Payment_method[0])
            // this.onOptionSelection(onSuccess.Payment_method[0]);
            console.log(':::::::: called SUCCESS', onSuccess.Payment_method[0])
            if (this.props.checkoutDetail.order_delivery == "DineIn") {
                this.paymentOptions.push({
                    "PaymentMethod": null,
                    "client_id": null,
                    "client_secret": null,
                    "display_name_ar": "الدفع لاحقًا",
                    "display_name_en": "Pay Later",
                    "display_name_fr": "Payer plus tard",
                    "failure_url": RETURN_URL + "/payment_confirm",
                    "payment_gateway_slug": "paylater",
                    "payment_id": "999",
                    "payment_method": null,
                    "payment_url": null,
                    "return_url": RETURN_URL + "/payment_confirm",
                    "sorting": "1",
                    "status": "1",
                    "success_url": RETURN_URL + "/payment_success",
                    "valid_currency": "usd"
                })
            }
            this.forceUpdate();
        }
        if (this.paymentOptions !== undefined &&
            this.paymentOptions !== null &&
            this.paymentOptions.length !== 0
        )
            this.addToCartData.is_creditcard = (this.paymentOptions[0].payment_gateway_slug == "paylater" || this.paymentOptions[0].payment_gateway_slug == "cod") ? "no" : "yes"
        else
            this.addToCartData.is_creditcard = "no"
        this.getCartData()
        this.setState({ isPaymentLoading: false })

    }

    onFailurePaymentList = onFailure => {
        console.log('::::::::::: PAYMENT FALURE', onFailure)
        showValidationAlert(onFailure.message)
        this.setState({ isPaymentLoading: false })
    }



    togglePending = () => {
        if (!this.state.disableToggle) {
            this.setState({
                payPending: true, totalPrice: parseFloat(this.checkoutDetail.total) + parseFloat(this.state.totalPendingAmount), later: false,
                online:
                    this.paymentOptions !== null &&
                        this.paymentOptions.length !== 0 &&
                        this.paymentOptions[0].payment_gateway_slug !== "cod" ? false :
                        true,
                cashOn:
                    this.paymentOptions !== null &&
                    this.paymentOptions.length !== 0 &&
                    this.paymentOptions[0].payment_gateway_slug == "cod"
                , selectedOption:
                    this.paymentOptions !== undefined &&
                        this.paymentOptions !== null &&
                        this.paymentOptions.length !== 0 &&
                        this.paymentOptions[0].payment_gateway_slug !== "paylater" ?
                        this.paymentOptions[0].payment_gateway_slug : ''
            })
        }
        this.getCartData()
    }

    navigateToPendingOrders = () => {
        this.props.navigation.navigate("PendingOrdersFromCart", { orderDetails: this.state.pendingOrderArray })
    }


    myValidatePostalCode(postalCode) {
        return postalCode.match(/^\d{5,6}$/) ? "valid" :
            postalCode.length > 6 ? "invalid" :
                "incomplete";
    }

    /**
   * On Credit card input
   */
    onCCInput = (data) => {
        this.isCardError = false
        this.isExpiryError = false
        this.isCVCError = false
        this.isCountryError = false
        this.isPostalError = false

        this.setState({ cardError: "" })
        this.cardData = data
    }

    validateCard = () => {
        if (this.cardData !== undefined) {
            if (this.cardData.status.number == "valid") {
                if (this.cardData.status.expiry == "valid") {
                    if (this.isForEditing || this.cardData.status.cvc == "valid") {
                        if (this.selectedCountry !== undefined || this.state.countryCode !== undefined) {
                            if (this.cardData.status.postalCode == "valid") {
                                this.isCardError = false
                                this.isExpiryError = false
                                this.isCVCError = false
                                this.isCountryError = false
                                this.isPostalError = false
                                this.setState({ cardError: "" })

                            }
                            else {
                                this.isPostalError = true
                                this.setState({ cardError: strings("invalidPostal") })
                            }
                        }
                        else {
                            this.isCountryError = true
                            this.setState({ cardError: strings("noCountry") })
                        }
                    }
                    else {
                        this.isCVCError = true
                        console.log("Invalid CVC")
                        this.setState({ cardError: strings("invalidCVC") })
                    }
                }
                else {
                    this.isExpiryError = true
                    console.log("Invalid expiry date", this.state.cardError)
                    this.setState({ cardError: strings("invalidExpiry") })
                }
            }
            else {
                this.isCardError = true
                console.log("Invalid card number")
                this.setState({ cardError: this.cardData.values.number == '' ? strings("nocardData") : strings("invalidCard") })
            }
        }
        else {
            this.isCardError = true
            this.setState({ cardError: strings("nocardData") })
        }

        return this.isCardError === false &&
            this.isExpiryError === false &&
            this.isCVCError === false &&
            this.isCountryError === false &&
            this.isPostalError === false;
    }


    fetchCards = () => {
        this.state.defaultCard = undefined
        this.state.noDefaultCard = false
        netStatus(status => {
            if (status) {
                this.setState({ isSavedCardLoading: true })
                let userParams = {
                    language_slug: this.props.lan,
                    user_id: this.props.userID,
                    isLoggedIn: 1
                }
                getSavedCardsAPI(userParams, this.onSuccessFetchCards, this.onFailureFetchCards, this.props)
            }
            else {
                this.setState({ isSavedCardLoading: false });
            }
        })
    }

    onSuccessFetchCards = onSuccess => {
        this.noCards = false

        if (onSuccess.stripe_response !== undefined &&
            onSuccess.stripe_response !== null &&
            onSuccess.stripe_response.length !== 0
        ) {

            let valid_cards = []
            valid_cards = onSuccess.stripe_response.filter(cardData => { return new Date() < new Date().setFullYear(cardData.card.exp_year, cardData.card.exp_month, 1) })
            this.setState({
                noDefaultCard: !(valid_cards !== undefined && valid_cards !== null && valid_cards.length !== 0 && valid_cards[0].is_default_card == "1"),
                showCardInput: false,
                defaultCard: valid_cards !== undefined && valid_cards !== null && valid_cards.length !== 0 && valid_cards[0].is_default_card == "1" ? valid_cards[0] : undefined
            })
        }
        else {
            debugLog("NO CARDS ::::::")
            this.noCards = true

        }

        this.setState({ isSavedCardLoading: false });
    }

    onFailureFetchCards = onFailure => {
        this.setState({ isSavedCardLoading: false });
    }








    createPaymentList = item => {
        let display_name = `display_name_${this.props.lan}`
        return (

            <View>
                <TouchableOpacity style={[style.subContainer]}
                    activeOpacity={1}
                    onPress={() => this.onOptionSelection(item.item)}>
                    <EDRTLView>
                        <EDRTLView style={{ alignItems: 'center', flex: 1 }}>
                            {item.item.payment_gateway_slug === 'paylater' ?
                                <SvgXml xml={paylater_icon} fill={this.state.selectedOption == item.item.payment_gateway_slug ? EDColors.primary : EDColors.text} size={20} /> :
                                <Icon name={
                                    item.item.payment_gateway_slug === 'applepay' ? 'apple-pay'
                                        :
                                        item.item.payment_gateway_slug === 'paypal' ? 'paypal' : item.item.payment_gateway_slug === 'cod' ? 'account-balance-wallet' : 'credit-card'}
                                    type={
                                        item.item.payment_gateway_slug === 'applepay' ? 'fontisto' :
                                            item.item.payment_gateway_slug === 'paypal' ? 'entypo' : item.item.payment_gateway_slug === 'cod' ? 'material' : 'material'}
                                    size={20} color={this.state.selectedOption == item.item.payment_gateway_slug ? EDColors.primary : EDColors.text}
                                    style={style.paymentIconStyle} />}

                            <EDRTLText style={[style.paymentMethodTitle, { color: this.state.selectedOption == item.item.payment_gateway_slug ? EDColors.black : EDColors.blackSecondary }]} title={
                                item.item[display_name]} />
                        </EDRTLView>
                        <Icon name={"check"} size={getProportionalFontSize(16)} selectionColor={EDColors.primary} color={this.state.selectedOption == item.item.payment_gateway_slug ? EDColors.primary : EDColors.white} style={{ margin: 10 }} />
                    </EDRTLView>
                    {this.state.selectedOption == "stripe" && item.item.payment_gateway_slug == "stripe" ?
                        <>
                            {!this.state.showCardInput ?
                                this.state.defaultCard !== undefined ?
                                    <>
                                        <EDRTLView style={[style.cardView]}>
                                            <EDRTLView style={style.cardSubView}>
                                                <Icon
                                                    name={this.state.defaultCard.card.brand == CARD_BRANDS.visa ? "cc-visa" :
                                                        this.state.defaultCard.card.brand == CARD_BRANDS.mastercard ? "cc-mastercard" :
                                                            this.state.defaultCard.card.brand == CARD_BRANDS.amex ? "cc-amex" : "credit-card"
                                                    }
                                                    color={this.state.defaultCard.card.brand == CARD_BRANDS.visa ? EDColors.visa :
                                                        this.state.defaultCard.card.brand == CARD_BRANDS.mastercard ? EDColors.mastercard :
                                                            this.state.defaultCard.card.brand == CARD_BRANDS.amex ? EDColors.amex : EDColors.primary
                                                    }
                                                    size={20}
                                                    type="font-awesome"
                                                />
                                                <View style={{ marginHorizontal: 20, flex: 1 }}>
                                                    <EDRTLView style={{ alignItems: 'center' }}>
                                                        <Text style={{ color: EDColors.black }}>•••• </Text>
                                                        <EDRTLText title={this.state.defaultCard.card.last4} style={style.last4Text} />
                                                    </EDRTLView>
                                                    {(new Date().setFullYear(this.state.defaultCard.card.exp_year, this.state.defaultCard.card.exp_month, 1) < new Date()) ?
                                                        <EDRTLText title={strings("expired")} style={style.expiredText} /> : null}
                                                </View>
                                                <EDRTLText title={strings("change")} style={style.changeCard} onPress={this.changeCard} />
                                                <EDRTLText title={
                                                    strings("homeNew")} style={style.changeCard} onPress={this.addCard} />

                                            </EDRTLView>
                                        </EDRTLView>
                                        <EDRTLText title={strings("defaultCard")} style={{ fontFamily: EDFonts.regular, color: EDColors.textNew, marginHorizontal: 7.5, flex: 1, fontSize: getProportionalFontSize(14), marginTop: 10 }} />

                                    </> :

                                    this.state.isLoading || this.state.isPaymentLoading || this.state.isSavedCardLoading ? null :
                                        <>
                                            <EDRTLText title={
                                                this.noCards ?
                                                    strings("noCards") :
                                                    strings("noDefaultCard")} style={{ fontFamily: EDFonts.regular, color: EDColors.error, marginHorizontal: 7.5, flex: 1, fontSize: getProportionalFontSize(14), marginTop: 10 }} />
                                            <EDRTLView style={{ alignItems: 'center', marginTop: 10, }}>
                                                {this.noCards ? null :
                                                    <EDRTLText title={strings("setNow")} style={[style.changeCard, { marginLeft: 7.5 }]} onPress={this.changeCard} />}
                                                <EDRTLText title={strings("homeNew")} style={style.changeCard} onPress={this.addCard} />
                                            </EDRTLView>
                                        </>


                                : null}
                            {this.state.showCardInput ?
                                < View style={{}}>
                                    {this.state.defaultCard !== undefined || this.state.noDefaultCard ?
                                        <EDRTLText title={
                                            strings("dialogCancel")} style={[style.changeCard, { textAlign: 'left', marginLeft: 0 }]} onPress={this.addCard} /> : null}
                                    <CreditCardInput
                                        ref={ref => this.creditcardRef = ref}
                                        autoFocus={false}
                                        onChange={this.onCCInput}
                                        cardFontFamily={EDFonts.regular}
                                        cardImageFront={Assets.card_front}
                                        cardImageBack={Assets.card_back}
                                        errorMessage={this.state.cardError}
                                        isCardError={this.isCardError}
                                        isExpiryError={this.isExpiryError}
                                        isCVCError={this.isCVCError}
                                        isPostalError={this.isPostalError}
                                        isCountryError={this.isCountryError}
                                        onCountrySelect={this.onStripeCountrySelect}
                                        requiresPostalCode
                                        requiresCVC={true}
                                        // requiresCountry={this.order_delivery == "Delivery"}
                                        requiresCountry={true}
                                        dialCode={this.state.countryCode}
                                        isReadOnly={false}
                                        validatePostalCode={this.myValidatePostalCode}
                                        countryData={this.props.countryArray}
                                        cvcStyle={{ width: metrics.screenWidth / 2 - 40, marginLeft: 15 }}
                                        expiryStyle={{ width: metrics.screenWidth / 2 - 40 }}
                                        errorLeftPadding={metrics.screenWidth / 2 - 25}
                                    />
                                    {this.props.userID !== undefined && this.props.userID !== null && this.props.userID !== "" ?
                                        <TouchableOpacity onPress={this.toggleCardSave} activeOpacity={1}>
                                            <EDRTLView style={{ alignItems: 'center', marginTop: 10 }}>
                                                <Icon name={this.state.isCardSave ? "check-square-o" : "square-o"}
                                                    color={EDColors.primary}
                                                    size={20}
                                                    type="font-awesome"
                                                />
                                                <EDRTLText title={strings("askSaveCard")} style={{ fontFamily: EDFonts.medium, color: EDColors.black, marginHorizontal: 7.5, flex: 1, fontSize: getProportionalFontSize(14) }} />
                                            </EDRTLView>
                                        </TouchableOpacity> : null}

                                    {this.props.userID !== undefined && this.props.userID !== null && this.props.userID !== "" && this.state.isCardSave && !this.noCards ?
                                        <TouchableOpacity onPress={this.toggleCardDefault} activeOpacity={1}>
                                            <EDRTLView style={{ alignItems: 'center', marginTop: 10 }}>
                                                <Icon name={this.state.isDefaultCard ? "check-square-o" : "square-o"}
                                                    color={EDColors.primary}
                                                    size={20}
                                                    type="font-awesome"
                                                />
                                                <EDRTLText title={strings("setDefaultCard")} style={{ fontFamily: EDFonts.medium, color: EDColors.black, marginHorizontal: 7.5, flex: 1, fontSize: getProportionalFontSize(14) }} />
                                            </EDRTLView>
                                        </TouchableOpacity> : null}
                                </View> : null}</>

                        : null}
                </TouchableOpacity>
            </View >
        )
    }


    onStripeCountrySelect = country => {
        this.isCountryError = false
        this.selectedCountry = country
        debugLog("COUNTRY :::::", country)
        this.setState({ cardError: '', countryCode: undefined })
    }


    toggleCardSave = () => {
        this.setState({ isCardSave: !this.state.isCardSave, isDefaultCard: false })
    }

    toggleCardDefault = () => {
        this.setState({ isDefaultCard: !this.state.isDefaultCard })
    }

    changeCard = () => {
        this.props.navigation.push('savedCards', { isForAddressList: true, });

    }

    addCard = () => {
        this.setState({ showCardInput: !this.state.showCardInput })
    }

    refreshDefaultCard = (card) => {
        this.setState({ defaultCard: card })
    }


    onOptionSelection = data => {
        if (data.payment_gateway_slug == "cod") {

            {
                this.addToCartData.is_creditcard = "no"

                this.setState({ cashOn: true, online: false, later: false, selectedOption: data.payment_gateway_slug })
                if (this.state.totalPendingAmount !== 0)
                    this.setState({ payPending: true, totalPrice: parseFloat(this.checkoutDetail.total) + parseFloat(this.state.totalPendingAmount), later: false, disableToggle: true })
            }
            this.getCartData()

        }
        else if (data.payment_gateway_slug == "paylater") {



            this.promoArray = []
            this.setState({ selectedOption: data.payment_gateway_slug, cashOn: false, later: true, online: false, disableToggle: false, payPending: false, totalPrice: this.state.totalPrice - parseFloat(this.state.totalPendingAmount) })
            this.addToCartData.is_creditcard = "no"
            this.getCartData()
        }
        else {
            this.addToCartData.is_creditcard = "yes"
            this.getCartData()

            if (data.payment_gateway_slug == "razorpay") {
                this.razorpayDetails = data
            }
            this.setState({ cashOn: false, online: true, later: false, selectedOption: data.payment_gateway_slug })
            if (this.state.totalPendingAmount !== 0)
                this.setState({ payPending: true, totalPrice: parseFloat(this.checkoutDetail.total) + parseFloat(this.state.totalPendingAmount), later: false, disableToggle: true })
        }
    }




    /**
* Webview Navigation change
*/
    navigationChange = (resp) => {
        // debugLog("NAVIGATION CHANGE CALLED :::::::::::", resp)
        if (resp.url.includes(RETURN_URL + "/?payment_intent")) {
            this.setState({ url: undefined })
            this.checkCardPayment()
        }
    }

    checkCardPayment = () => {
        netStatus(
            status => {
                if (status) {
                    this.setState({ isLoading: true })
                    var params = {
                        trans_id: this.txn_id,
                        language_slug: this.props.lan
                    }
                    checkCardPayment(params, this.onCheckCardPaymentSuccess, this.onCheckCardPaymentFailure, this.props)
                }
                else {
                    showNoInternetAlert();
                    this.setState({ isLoading: false })
                }
            }
        )
    }

    /**
    * On check card payment success
    */
    onCheckCardPaymentSuccess = (onSuccess) => {
        if (onSuccess.status == RESPONSE_SUCCESS) {
            if (onSuccess.stripe_response.error !== undefined && onSuccess.stripe_response.error.message !== undefined) {
                showValidationAlert(strings("paymentFail") + "\n\n" + onSuccess.stripe_response.error.message)
                this.setState({ isLoading: false })

            }
            else if (onSuccess.stripe_response.status == "succeeded") {
                debugLog("Payment Sucessful with 3d secure authentication ::::::")
                this.setState({ isLoading: true, })
                this.txn_id = onSuccess.stripe_response.id;

                this.placeOrder(onSuccess.stripe_response.id, "stripe")
            }
            else {
                debugLog("PAYMENT FAILED ::::")
                showValidationAlert(strings("paymentFail"));
                this.setState({ isLoading: false })
            }
        } else {
            this.setState({ isLoading: false })
            showValidationAlert(strings("paymentFail"));
        }
    }
    /**
     * On check card payment failure
     */
    onCheckCardPaymentFailure = (onFailure) => {
        debugLog("FAILURE :::::", onFailure)
        showValidationAlert((strings("paymentFail") + "\n\n" + (
            onFailure.stripe_response !== undefined &&
                onFailure.stripe_response.error !== undefined ? onFailure.stripe_response.error.message : "")));
        this.setState({ isLoading: false })
    }
    onWebViewCloseHandler = () => {
        showPaymentDialogue(
            strings('cancelConfirm'),
            [{
                text: strings('dialogYes'), onPress: () => {
                    this.setState({ url: undefined })
                }
            },
            { text: strings('dialogNo'), onPress: () => { }, isNotPreferred: true }],
            strings('warning'),
        );

    }


    //#region ADD TO CART API
    /**
     * 
     * @param {Success Response Object } onSuccess 
     */
    onSuccessAddCart = (onSuccess) => {
        debugLog("ADD TO CART :::::", onSuccess)
        if (onSuccess.error != undefined) {
            showValidationAlert(
                onSuccess.error.message != undefined
                    ? onSuccess.error.message
                    : strings("generalWebServiceError")
            );
        } else {
            if (onSuccess.status == RESPONSE_SUCCESS) {
                this.updatedCartResponse = onSuccess
                this.checkoutDetail.subtotal = onSuccess.subtotal
                this.checkoutDetail.total = onSuccess.total
                this.checkoutDetail.is_creditcard = this.addToCartData.is_creditcard
                this.checkoutDetail.is_creditcard_fee_applied = onSuccess.is_creditcard_fee_applied
                this.checkoutDetail.creditcard_feeval = onSuccess.creditcard_feeval
                this.checkoutDetail.creditcard_fee_typeval = onSuccess.creditcard_fee_typeval
                // this.checkoutDetail.coupon_array = JSON.stringify(this.updatedCartResponse.coupon_arrayapply)

                // this.promoCode = onSuccess.coupon_name
                // this.promoObj = onSuccess
                // if (onSuccess.coupon_arrayapply !== undefined && onSuccess.coupon_arrayapply !== null && onSuccess.coupon_arrayapply.length !== 0)
                //     this.setState({ discountedPrice: onSuccess.total })
                // else
                //     this.setState({ discountedPrice: undefined })
                if (this.state.totalPendingAmount !== 0 && this.state.selectedOption == "paylater")
                    this.setState({ payPending: false, later: true, disableToggle: false })

                this.old_credit_fee = 0

                if (this.addToCartData.is_creditcard == "yes" && this.oldSubtotal !== undefined && this.oldSubtotal !== null && this.oldSubtotal !== "") {
                    if
                        (onSuccess.creditcard_fee_typeval == "Amount") { }
                    else
                        if (onSuccess.creditcard_fee_typeval == "Percentage") {
                            this.old_credit_fee = Number(this.oldSubtotal) * (Number(onSuccess.creditcard_feeval) / 100)
                        }
                }

                this.setState({ totalPrice: parseFloat(onSuccess.total) + (this.state.selectedOption == "paylater" ? 0 : parseFloat(this.state.totalPendingAmount)) })
            }

        }

        if (this.promoArray.length !== 0) {
            this.applyPromo()
        }

        this.setState({ isLoading: false });
    }

    /**
     * 
     * @param {Failure REsponse Object} onFailure 
     */
    onFailureAddCart = (onFailure) => {
        showValidationAlert(
            onFailure.message != undefined
                ? onFailure.message
                : strings("generalWebServiceError")
        );
        // if (onFailure.status == COUPON_ERROR) {
        //     this.promoArray = []
        // }
        this.setState({ isLoading: false });
    }

    /**
     * 
     * @param { Item to be added to Cart } items 
     */
    getCartData = () => {

        netStatus(status => {
            if (status) {
                this.setState({ isLoading: true });


                let objAddToCart = this.addToCartData
                objAddToCart.items = JSON.parse(this.addToCartData.items)
                // objAddToCart.coupon_array = this.promoArray,

                addToCart(objAddToCart, this.onSuccessAddCart, this.onFailureAddCart, this.props);
            } else {
                showValidationAlert(strings("noInternet"));
            }
        });
    }

    render3DVerificationModal = () => {
        return (
            <EDPopupView isModalVisible={this.state.url !== undefined}
                shouldDismissModalOnBackButton
                onRequestClose={this.onWebViewCloseHandler}>
                <View style={{ margin: 20, marginVertical: 80, borderRadius: 16, flex: 1, overflow: "hidden", backgroundColor: EDColors.white }}>
                    <WebView
                        onLoad={() => this.setState({ isLoading: false })}
                        // onLoadStart={() => this.setState({ isLoading: false })}
                        style={{ width: "100%", height: "100%", borderRadius: 16, }}
                        source={{ uri: this.state.url }}
                        javaScriptEnabled={true}
                        startInLoadingState
                        renderLoading={() => { return <Spinner size="small" color={EDColors.primary} /> }}
                        allowsBackForwardNavigationGestures={true}
                        onNavigationStateChange={this.navigationChange}
                    />
                </View>
            </EDPopupView>
        )
    }

    // RENDER METHOD
    render() {
        return (
            <BaseContainer
                title={strings("paymentTitle")}
                left={isRTLCheck() ? 'arrow-forward' : 'arrow-back'}
                right={[]}
                onLeft={this.onBackEventHandler}
                loading={this.state.isLoading || this.state.isSavedCardLoading || this.state.isPaymentLoading || this.state.promoLoading}
            >

                {this.render3DVerificationModal()}

                {/* Navigation Events */}
                <NavigationEvents onWillFocus={this.onWillFocusPayment} />

                <KeyboardAwareScrollView
                    pointerEvents={this.state.isLoading || this.state.isSavedCardLoading || this.state.isPaymentLoading || this.state.promoLoading ? 'none' : 'auto'}
                    enableResetScrollToCoords={true}
                    resetScrollToCoords={{ x: 0, y: 0 }}
                    style={{ flex: 1 }}
                    bounces={false}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="always"
                    behavior="padding"
                    enabled>
                    {/* MAIN VIEW */}
                    <View style={style.mainView}>
                        <View>

                            {this.state.pendingOrderArray !== undefined && this.state.pendingOrderArray.length !== 0 ?
                                <View style={style.pendingContainer}>
                                    <View style={[style.pendingSubContainer, { flexDirection: isRTLCheck() ? "row-reverse" : "row" }]}>
                                        <Text style={style.simpleText} onPress={this.togglePending}>
                                            {this.state.payPending ? strings("payPending") : strings("pendingOrderMsg")}
                                        </Text>
                                    </View>
                                    <View style={[{ marginTop: 10, flexDirection: isRTLCheck() ? "row-reverse" : "row" }]}>
                                        <Text style={[style.pendingText]}>
                                            {
                                                strings("pendingAmount")}
                                        </Text>
                                        <Text style={style.currencyStyle}>
                                            {this.props.currency + funGetFrench_Curr(this.state.totalPendingAmount, 1, this.props.currency)}
                                        </Text>

                                    </View>
                                    <EDRTLView style={style.checkBoxStyle} >
                                        <EDRTLView style={style.centerView}>
                                            <Icon name={this.state.payPending ? "check-box" : "check-box-outline-blank"} color={EDColors.primary} size={getProportionalFontSize(23)} onPress={this.togglePending} />
                                            <Text style={style.checkboxText} >
                                                {strings("addtoBill")}
                                            </Text>
                                        </EDRTLView>
                                        <Text onPress={this.navigateToPendingOrders} style={style.textStyle} >
                                            {strings("viewDetails")}
                                        </Text>
                                    </EDRTLView>
                                </View> : null}

                            {this.paymentOptions !== undefined && this.paymentOptions !== null && this.paymentOptions.length !== 0 ?
                                <EDRTLView style={style.methodStyle}>
                                    <Text style={style.methodText}>
                                        {strings("choosePaymentOption")}
                                    </Text>
                                </EDRTLView> : null}
                            {this.paymentOptions !== undefined && this.paymentOptions !== null && this.paymentOptions.length !== 0 ?

                                <FlatList
                                    data={this.paymentOptions}
                                    extraData={this.state}
                                    renderItem={this.createPaymentList}
                                /> : null}

                            {/* <View style={{ marginHorizontal: 10, marginBottom: 20, marginTop: 20 }}>
                                <EDRTLText style={style.titleText} title={strings("addCookingInstruction")} />
                                <EDRTLView style={style.footerStyle}>
                                    <Icon name={"edit"} type={"feather"} color={EDColors.black} size={getProportionalFontSize(20)} style={style.editIconStyle} />
                                    <TextInput
                                        style={{
                                            textAlign: isRTLCheck() ? 'right' : 'left',
                                            flexDirection: isRTLCheck() ? 'row-reverse' : 'row',
                                            fontFamily: EDFonts.medium,
                                            marginHorizontal: 10, flex: 1, marginVertical: 20, color: EDColors.grayNew
                                        }}
                                        placeholder={strings("bringCutlery")}
                                        value={this.state.strComment}
                                        onChangeText={this.onTextChangeHandler}
                                    />
                                </EDRTLView>
                            </View> */}
                        </View>


                    </View>
                </KeyboardAwareScrollView>

                <View>
                    {!this.state.later && this.state.order_delivery == "DineIn" ?
                        <View style={style.promoResponseView}>
                            {/* {this.promoCode !== undefined && this.promoCode !== null && this.promoCode.trim().length !== 0 ?
                                <Text style={style.promoText}>
                                    {strings("getDiscount") + this.props.currency + funGetFrench_Curr(this.promoObj.coupon_discount, 1, this.props.currency)}
                                </Text>
                                : null
                            }
                            <View style={style.promoResponseView} >
                                {this.promoCode !== undefined && this.promoCode !== null && this.promoCode.trim().length !== 0 ? (
                                    <View style={style.promoResponse} >
                                        <Text style={[style.promoResponseTextStyle, { flex: 1 }]} >
                                            {this.promoCode + " " + strings("promoApplied")}
                                        </Text>
                                        <TouchableOpacity
                                            style={{ alignSelf: "center", marginRight: 10 }}
                                            onPress={this.removeCoupon}>
                                            <Icon
                                                name={"close"}
                                                size={getProportionalFontSize(28)}
                                                color={EDColors.black}
                                            />
                                        </TouchableOpacity>
                                    </View>) : (
                                    (this.props.userID != undefined && this.props.userID != "") ?
                                        <EDRTLView style={style.discountView}>
                                            <SvgXml xml={discount_icon} style={style.iconStyle} />
                                            <Text
                                                style={style.promoCode}
                                                onPress={this.navigateToPromoCode}>
                                                {strings("haveAPromo")}
                                            </Text>
                                        </EDRTLView>
                                        : null)}
                            </View> */}


                            {this.promoObj !== undefined &&
                                this.promoObj !== null &&
                                this.promoObj.coupon_arrayapply !== undefined &&
                                this.promoObj.coupon_arrayapply !== null &&
                                this.promoObj.coupon_arrayapply.length !== 0

                                ? (
                                    <>
                                        <View style={style.cartResponse} >
                                            <EDRTLView style={{ alignItems: 'center', marginVertical: 10 }}>
                                                <Text style={[style.cartResponseTextStyle, { flex: 1 }]} >
                                                    {this.promoObj.coupon_arrayapply.length + strings("couponApplied")}
                                                </Text>
                                                <Icon //TEMP
                                                    // onPress={this.clearPromo}
                                                    onPress={this.removeCoupon}
                                                    name={"close"}
                                                    size={getProportionalFontSize(26)}
                                                    color={EDColors.black}
                                                />
                                            </EDRTLView>

                                        </View>
                                        <View style={{ height: 1, backgroundColor: EDColors.separatorColorNew, width: "95%", alignSelf: 'center' }} />
                                        <EDRTLView style={style.discountView}>
                                            {/* <Icon name={"local-offer"} size={16} color={EDColors.blackSecondary} style={style.discountIcon} /> */}
                                            <SvgXml xml={discount_icon} style={{ marginHorizontal: 5 }} />
                                            <Text
                                                style={style.promoCode}
                                                onPress={this.navigateToPromoCode}>
                                                {strings("applyMore")}
                                            </Text>
                                        </EDRTLView>
                                    </>
                                ) : (

                                    <EDRTLView style={style.discountView}>
                                        {/* <Icon name={"local-offer"} size={16} color={EDColors.blackSecondary} style={style.discountIcon} /> */}
                                        <SvgXml xml={discount_icon} style={{ marginHorizontal: 5 }} />
                                        <Text
                                            style={style.promoCode}
                                            onPress={this.navigateToPromoCode}>
                                            {strings("haveAPromo")}
                                        </Text>
                                    </EDRTLView>
                                )}
                        </View>
                        :
                        null
                    }

                </View>
                <EDThemeButton
                    isLoadingPermission={this.state.isLoading || this.state.isPaymentLoading || this.state.promoLoading || this.state.isSavedCardLoading}

                    label={isRTLCheck() ? strings("continue") + "- " + funGetFrench_Curr(((this.state.discountedPrice !== undefined ? this.state.discountedPrice : this.state.totalPrice) + this.old_credit_fee), 1, this.props.currency) + this.props.currency : strings("continue") + "- " + this.props.currency + funGetFrench_Curr(((this.state.discountedPrice !== undefined ? this.state.discountedPrice : this.state.totalPrice) + this.old_credit_fee), 1, this.props.currency)}
                    style={style.checkOutContainer}
                    textStyle={style.button}
                    onPress={this.onContinuePressedEventhandler}
                />

            </BaseContainer >
        );
    }
    //#endregion

    /** NAVIGATE TO PROMO CODE CONTAINER */
    navigateToPromoCode = () => {
        // debugLog("TYPE OF ::::", typeof this.checkoutDetail.subtotal, typeof this.oldSubtotal, this.oldSubtotal, this.checkoutDetail.subtotal)
        this.props.navigation.navigate("PromoCodeContainer", {
            getData: this.getPromo,
            subTotal: this.checkoutDetail.subtotal + Number(this.oldSubtotal),
            resId: this.checkoutDetail.restaurant_id,
            order_delivery: "DineIn",
            promoArray: this.promoArray,
            used_coupons: this.promoObj.coupon_arrayapply,

        });
    }
    //#endregion

    getPromo = data => {
        this.promoArray = data
        this.promoCode = data;
        // this.applyPromo()
        // this.getCartData()
    }

    clearPromo = () => {
        this.promoArray = []

        this.getCartData()

    }

    //Apply promo
    applyPromo = () => {

        netStatus(status => {
            if (status) {
                this.setState({ promoLoading: true })
                let promoParams = {
                    user_id: this.props.userID,
                    // token: this.props.token,
                    coupon_array: JSON.stringify(this.promoArray),
                    order_delivery: "DineIn",
                    total: this.checkoutDetail.total + Number(this.oldSubtotal) + Number(this.old_credit_fee),
                    subtotal: this.checkoutDetail.subtotal + Number(this.oldSubtotal),
                    language_slug: this.props.lan,
                    restaurant_id: this.resContentId
                }
                debugLog("APPLY PROMO :::::", promoParams)
                applyCouponAPI(promoParams, this.onSuccessApplyCoupon, this.onFailureApplyCoupon, this.props)
            }
            else
                showNoInternetAlert()
        })
    }

    onSuccessApplyCoupon = onSuccess => {
        debugLog("On success coupon :::::", onSuccess)
        if (onSuccess.status == RESPONSE_SUCCESS || onSuccess.status == COUPON_ERROR) {
            this.promoCode = onSuccess.coupon_name
            this.promoObj = onSuccess

            this.setState({ discountedPrice: Number(this.oldSubtotal) + this.updatedCartResponse.total - onSuccess.coupon_discount })
            if (onSuccess.status == COUPON_ERROR)
                showValidationAlert(onSuccess.message)
        }
        else
            showValidationAlert(onSuccess.message)
        this.setState({ promoLoading: false })
    }

    onFailureApplyCoupon = onFailure => {
        this.setState({ promoLoading: false })
        showValidationAlert(strings("generalWebServiceError"))
        debugLog("On failure coupon :::::", onFailure)
    }

    removeCoupon = () => {
        this.promoCode = undefined
        this.promoObj = {}
        this.promoArray = []
        this.setState({ discountedPrice: undefined })


    }

    //#region 
    onTextChangeHandler = (value) => {
        this.setState({ strComment: value })
    }
    //#endregion

    //#region 
    /** CONTINUE PRESSED EVENT */
    onContinuePressedEventhandler = () => {

        if (this.state.selectedOption == "stripe" && (this.state.defaultCard == undefined || this.state.showCardInput)) {

            if (!this.validateCard())
                return;
        }

        this.checkoutDetail.extra_comment = this.state.strComment

        if (this.state.order_delivery == "DineIn") {
            this.checkoutDetail.coupon_id = this.promoObj.coupon_id,
                this.checkoutDetail.coupon_discount = this.promoObj.coupon_discount,
                this.checkoutDetail.coupon_name = this.promoObj.coupon_name,
                this.checkoutDetail.coupon_amount = this.promoObj.coupon_amount,
                this.checkoutDetail.coupon_type = this.promoObj.coupon_type
            if (this.promoCode !== undefined)
                this.checkoutDetail.total = this.promoObj.total

        }
        this.checkoutDetail.order_date = Moment(new Date().toLocaleString('en-US', {
            timeZone: RNLocalize.getTimeZone()
        })).format("DD-MM-YYYY hh:mm A");

        debugLog("date 24", this.state.later, this.state.cashOn);
        if (this.state.later) {
            this.checkoutDetail.payment_option = "paylater"
            this.placeOrder();
        }
        else if (this.state.cashOn) {
            this.checkoutDetail.payment_option = "cod"
            this.placeOrder()
        }
        else {

            if (this.state.selectedOption == "stripe") {
                let pendingTotalAmount = this.state.discountedPrice !== undefined
                    ? this.state.discountedPrice : this.state.totalPendingAmount

                let final_total =
                    this.state.payPending && this.promoObj.coupon_arrayapply == undefined ?
                        parseFloat(this.checkoutDetail.total) + parseFloat(pendingTotalAmount) : this.checkoutDetail.total.toFixed(2).toString()
                // this.checkoutDetail.payment_option = "stripe"
                // this.props.saveCheckoutDetails(this.checkoutDetail)
                // this.props.navigation.navigate("StripePaymentContainer", {
                //     "currency_code": this.currecy_code,
                //     isPendingAdded: this.state.payPending,
                //     pendingTotalPayment: (this.state.discountedPrice !== undefined ? this.state.discountedPrice : this.state.totalPendingAmount),
                //     // pendingTotal: (this.state.discountedPrice !== undefined ? this.state.discountedPrice : this.state.totalPendingAmount),
                //     order_id: this.oldOrderID,
                //     promoObj: this.promoObj
                // })
                this.startStripePayment(final_total)
            }


            else if (this.state.selectedOption == "razorpay") {
                let pendingTotalAmount = this.state.discountedPrice !== undefined
                    ? this.state.discountedPrice : this.state.totalPendingAmount

                let final_total =
                    this.state.payPending && this.promoObj.coupon_arrayapply == undefined ?
                        parseFloat(this.checkoutDetail.total) + parseFloat(pendingTotalAmount) : this.checkoutDetail.total.toFixed(2).toString()
                // this.checkoutDetail.payment_option = "stripe"
                // this.props.saveCheckoutDetails(this.checkoutDetail)
                // this.props.navigation.navigate("StripePaymentContainer", {
                //     "currency_code": this.currecy_code,
                //     isPendingAdded: this.state.payPending,
                //     pendingTotalPayment: (this.state.discountedPrice !== undefined ? this.state.discountedPrice : this.state.totalPendingAmount),
                //     // pendingTotal: (this.state.discountedPrice !== undefined ? this.state.discountedPrice : this.state.totalPendingAmount),
                //     order_id: this.oldOrderID,
                //     promoObj: this.promoObj
                // })
                this.startRazorPayment(final_total)
            }
            else if (this.state.selectedOption == "paypal") {
                this.checkoutDetail.payment_option = "paypal"
                this.props.saveCheckoutDetails(this.checkoutDetail)
                this.props.navigation.navigate("PaymentGatewayContainer", {
                    "currency_code": this.currecy_code,
                    isPendingAdded: this.state.payPending,
                    pendingTotalPayment: ((this.state.discountedPrice !== undefined ? this.state.discountedPrice : this.state.totalPrice) + this.old_credit_fee),
                    order_id: this.oldOrderID,
                    promoObj: this.promoObj,
                    creditcard_feeval: this.checkoutDetail.creditcard_feeval,
                    creditcard_fee_typeval: this.checkoutDetail.creditcard_fee_typeval
                })
            }
            else {
                if (this.paymentOptions !== undefined && this.paymentOptions !== null && this.paymentOptions.length !== 0)
                    showValidationAlert(strings("choosePaymentError"))
                else
                    showValidationAlert(strings("noPaymentMethods"))
            }
        }
    }
    //#endregion

    //#region 
    onBackEventHandler = () => {
        this.props.navigation.goBack();
    }
    //#endregion

    startRazorPayment = (final_total) => {


        this.merchant_order_id = Date.now()
        var options = {
            description: 'Paying MLMF',
            image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASMAAAEkCAYAAABkJVeVAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAACVRSURBVHgB7d0JfBTl/T/w7zOzm4QbRYGQDUqlrVJvjgTUirVazyq11h5/e1nxQDAHClqUIFYskAOo1qq1aq2tRw+Plp9alfpTIAE8qYqiAjk4RIQQybE7z/P/PLOzm03IhULrj3zevJadnZmdnd3MfOf7HDMjQkRERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERET0eaSEaA+YIgnhaSAeQ/DoLY4YiUqtxKRK5shWbFBGiD4FBiPqlJkoYcmWU8WTs7HFnIpw8wWMTvfDTmILUrIT/7+McY/i+VFVJJuEaA8wGFGHkAmdgwAzD1vKcDxewfAzeH5dtKwXFwEoipm0DJA0+SKmfRWvThebMYncjml/Rub0iWyWD9SdskuIOsBgRLtBALLFsOPxOAUBphBbyRPIjWbK9fKGUh0Xw/De3pj/B5hrJl5mSrzYZrOm/8XjHjweR9YUE6JWGIzIZ0qkB2p+foDBn+FxnB2FreN9/F+GsHJXZ0Fot+XNlAje/1e86wm8fBvDF+LZZllvIaP6kbpR3hCiFAxGJOYmGYkgcT8eh+DlXxAsHkY19UvygdSheBWVT8nPkkQWIphdYoOZmSGHYbm3Y6sbjdzobDVblglRwBHq1swv5Gi/HsigDkjkSBShfqhukCfVdfIxClmT5DPAsuoQdJ6UWX5xTdTN8h6ezsVnPY2g9HuTj2yMKMBg1I2Za1GUiskjCA7LpUbOQ/BYl5xms2YlX5LPajaKatLcsobPaMLTFHzAIOknE4QowGDUTaEI9XXphSBkZAiylMt2K44VobCm5FDTxaK8uVBcM97v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Fyf75CgUioxMQuvXP9r+nJz7MP2HeIxFAOr0/LfPk4LIqAtQ4/IofqOr8RstFNqvMRj9B7S+PK2tAA2HmypsmoEAMWwPF+dnArW1vZH2+5fhiDNyrxeV0gVbyl+3t5EO9VJF8XovOR2V6qtKqyrGy/8htqK4lxt6Cet/QKOYkWyB2v8xGP0HoDj1tHFkOCp016NFJYS6lCNRke3pJif3s7SuXD0k95towl4gKvUKlLY1T9m6I7+ZGn/gGi+mTvi8X3sZRcZfYV0vQFF0jbK1TfZ8L6P6aFedUbZh+T65qQF9vjAY7WP2om3KkRZ1J9jTXnd07KLijav2qFdxW2zfGJ2W9mPUqNsrMLbKstRqtPdfYE9elc+xwuxxo43xKlLHoSVzjWP0JfNqVr4k1C0wGO1jfpN42JyFnWsgjvoNqLx9Odbro3/tixMl/fokV59ve1Z6jvNGQyz2TJunqnzOxK8C6ZyDyupDUdyMxpS8ecAu9eysbeW1QkREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREe+r/A6oAvqKJBlvwAAAAAElFTkSuQmCC',
            currency: this.currecy_code,
            key: this.razorpayDetails.enable_live_mode == "1" ? this.razorpayDetails.live_publishable_key : this.razorpayDetails.test_publishable_key, // Your api key
            amount: (Number(final_total).toFixed(2) * 100).toFixed(0),
            name: "MLMF",
            // order_id : 
            prefill: {
                email: this.props.userID == undefined || this.props.userID == null || this.props.userID == "" ? this.props.guestDetails.email : this.props.email,
                contact: this.props.userID == undefined || this.props.userID == null || this.props.userID == "" ? this.props.guestDetails.phone_number : this.props.phoneNumber,
                name: this.props.userID == undefined || this.props.userID == null || this.props.userID == "" ?
                    (this.props.guestDetails.first_name + " " + this.props.guestDetails.last_name) : (this.props.firstName + " " + this.props.lastName)
            },
            theme: { color: EDColors.primary },
            note: {
                merchant_order_id: this.merchant_order_id
            }
        }
        RazorpayCheckout.open(options).then((data) => {
            // handle success
            debugLog("Payment success ::::::", data);
            this.razorpay_payment_id = data.razorpay_payment_id
            this.txn_id = data.razorpay_payment_id
            this.placeOrder(data.razorpay_payment_id, "razorpay")
        }).catch((error) => {

            // handle failure
            debugLog("Payment failure ::::::", error);
            if (error.code !== 0)
                 setTimeout(() => {
                    showValidationAlert(error.description)
                
            },500)
        });
    }

    /**
   * Start Stripe Payment
   */
    startStripePayment = () => {
        debugLog("CARD DATA :::::", this.cardData)
        netStatus(
            status => {
                if (status) {
                    var params = {}
                    this.setState({ isLoading: true })
                    if (this.cardData !== undefined) {
                        params = {
                            language_slug: this.props.lan,
                            exp_month: this.cardData.values.expiry.substring(0, 2),
                            exp_year: this.cardData.values.expiry.substring(3, 5),
                            card_number: this.cardData.values.number,
                            cvc: this.cardData.values.cvc,
                            amount: ((this.state.discountedPrice !== undefined ? this.state.discountedPrice : this.state.totalPrice) + this.old_credit_fee) * 100,
                            // amount: parseFloat(this.checkoutDetail.total),
                            currency: this.currecy_code,
                            user_id: this.props.userID,
                            payment_method: 'stripe',
                            save_card_flag: this.state.isCardSave ? 1 : 0,
                            is_default_card: this.noCards || this.state.isDefaultCard ? 1 : 0,
                            country_code: this.state.countryCode || (this.selectedCountry !== undefined ? this.selectedCountry.cca2 : ''),
                            zipcode: this.cardData.values.postalCode,
                            isLoggedIn: this.props.userID !== undefined && this.props.userID !== null && this.props.userID !== "" ? 1 : 0
                        }
                    }
                    else if (this.state.defaultCard !== undefined) {
                        params = {
                            language_slug: this.props.lan,
                            amount: ((this.state.discountedPrice !== undefined ? this.state.discountedPrice : this.state.totalPrice) + this.old_credit_fee) * 100,
                            currency: this.currecy_code,
                            payment_method: 'stripe',
                            user_id: this.props.userID,
                            payment_method_id: this.state.defaultCard.id,
                            isLoggedIn: 1
                        }
                    }
                    else {
                        this.setState({ isLoading: false })
                        showValidationAlert(strings("generalWebServiceError"))
                        return;
                    }
                    createPaymentMethod(params, this.onPaymentMethodSuccess, this.onPaymentMethodFailure, this.props)
                }
                else {
                    showNoInternetAlert();
                }
            }
        )
    }
    /**
     * On payment method success
     */
    onPaymentMethodSuccess = (onSuccess) => {
        debugLog("ONSUCCESS::::::::", onSuccess)
        if (onSuccess.status == RESPONSE_SUCCESS) {
            if (onSuccess.stripe_response.error !== undefined) {
                showValidationAlert(((onSuccess.message !== undefined ? onSuccess.message : strings("paymentFail")) + "\n\n" + onSuccess.stripe_response.error.message))
                this.setState({ isLoading: false })

            }
            else if (onSuccess.stripe_response.status == "succeeded") {
                debugLog("Payment Sucessful without 3d secure authentication ::::::")
                this.txn_id = onSuccess.stripe_response.id;
                this.placeOrder(onSuccess.stripe_response.id, "stripe")
                this.setState({ isLoading: false })
            }
            else if (onSuccess.stripe_response.next_action.redirect_to_url.url !== undefined) {
                debugLog("Redirecting for 3d secure authentication ::::::")
                this.txn_id = onSuccess.stripe_response.id;
                this.setState({ url: onSuccess.stripe_response.next_action.redirect_to_url.url, isLoading: false })
            }
        } else {
            this.setState({ isLoading: false })
            showDialogue(onSuccess.message, [], '', () => { })
        }
    }
    /**
     * On payment method failure
     */
    onPaymentMethodFailure = (onFailure) => {
        debugLog("FAILURE :::::", onFailure)
        showValidationAlert(strings("paymentFail"))


        this.setState({ isLoading: false })

    }

    updatePendingOrders = () => {
        netStatus(status => {
            if (status) {
                let param = {
                    user_id: parseInt(this.props.userID) || 0,
                    // token: this.props.token,
                    language_slug: this.props.lan,
                    order_id: this.oldOrderID,
                    total_rate: ((this.state.discountedPrice !== undefined ? this.state.discountedPrice : this.state.totalPrice) + this.old_credit_fee),
                    coupon_id: this.promoObj.coupon_id,
                    coupon_discount: this.promoObj.coupon_discount,
                    coupon_name: this.promoObj.coupon_name,
                    coupon_amount: this.promoObj.coupon_amount,
                    coupon_type: this.promoObj.coupon_type,
                    payment_option: this.tempPayment_option !== undefined && this.tempPayment_option !== null && this.tempPayment_option !== "" ? this.tempPayment_option : "cod",
                    transaction_id: this.txn_id,

                    coupon_array: JSON.stringify(this.promoObj.coupon_arrayapply),


                }
                if (this.tempPayment_option == "razorpay") {
                    param.razorpay_payment_id = this.razorpay_payment_id
                    param.merchant_order_id = this.merchant_order_id
                }
                if (this.addToCartData.is_creditcard == "yes") {
                    param.creditcard_feeval = this.checkoutDetail.creditcard_feeval
                    param.creditcard_fee_typeval = this.checkoutDetail.creditcard_fee_typeval

                }
                this.setState({ isLoading: true });
                updatePendingOrdersAPI(param, this.onSuccessUpdateOrder, this.onFailureUpdateOrder, this.props)
            } else {
                this.setState({ isLoading: false });
                showValidationAlert(strings("noInternet"));
            }
        });
    }
    onSuccessUpdateOrder = onSuccess => {
        if (onSuccess.status == RESPONSE_SUCCESS) {
            this.setState({ isLoading: false });
            if (this.state.order_delivery == "DineIn") {
                this.props.saveTableID(undefined);
                this.props.saveResID(undefined);
            }
            this.props.navigation.popToTop();
            this.props.navigation.navigate("OrderConfirm", { isForDineIn: this.state.order_delivery == "DineIn" ? true : false, resObj: this.resObj, navigateToOrder: true, cashback: onSuccess.earned_wallet_money });
        }
        else {
            this.setState({ isLoading: false });
            showValidationAlert(onSuccess.message)
        }
    }
    onFailureUpdateOrder = (onfailure) => {
        this.setState({ isLoading: false });
        showValidationAlert(strings("generalWebServiceError"))
    }

    //#region ADD ORDER
    /**
     * @param { Success Reponse Object } onSuccess
     */
    onSuccessAddOrder = (onSuccess) => {
        if (onSuccess.error != undefined) {
            showValidationAlert(
                onSuccess.error.message != undefined
                    ? onSuccess.error.message
                    : strings("generalWebServiceError")
            );
        } else {
            if (onSuccess.status == RESPONSE_SUCCESS) {
                this.props.saveCartCount(0);
                this.props.saveWalletMoney(onSuccess.wallet_money)

                clearCartData(
                    response => {

                        if (this.state.payPending) {
                            this.updatePendingOrders();
                        }
                        else {
                            if (this.state.order_delivery == "DineIn" && !this.state.later) {
                                this.props.saveTableID(undefined);
                                this.props.saveResID(undefined);
                            }
                            this.props.navigation.popToTop();
                            this.props.navigation.navigate("OrderConfirm", { isForDineIn: this.state.order_delivery == "DineIn" ? true : false, resObj: onSuccess.restaurant_detail, navigateToOrder: !this.state.later, cashback: onSuccess.earned_wallet_money });
                        }

                        // if (this.state.cashOn) {
                        //     this.props.navigation.popToTop();
                        //     this.props.navigation.navigate("OrderConfirm", { currecy_code: this.props.currency, cashback: onSuccess.earned_wallet_money });
                        // } else {
                        //     this.props.navigation.navigate("PaymentGatewayContainer", { "currency_code": this.currecy_code, order_id: onSuccess.order_id })
                        // }
                    },
                    error => { }
                );
            }

            else if (onSuccess.status == RESTAURANT_ERROR) {
                this.props.saveCartCount(0);
                clearCurrency_Symbol(onSuccess => { }, onfailure => { })
                clearCartData(
                    response => {
                    },
                    error => { }
                );
                showDialogue(onSuccess.message, [], strings("appName"),
                    () =>
                        this.props.navigation.dispatch(
                            StackActions.reset({
                                index: 0,
                                actions: [
                                    NavigationActions.navigate({ routeName: isRTLCheck() ? "MainContainer_Right" : "MainContainer" })
                                ]
                            })
                        ));
            }
            else {
                showValidationAlert(onSuccess.message);
            }
        }
        this.setState({ isLoading: false });
    }
    //#endregion

    /**
     * @param { Failure Response Object } onFailure
     */
    onFailureAddOrder = (onfailure) => {
        showValidationAlert(strings("generalWebServiceError"));
        this.setState({ isLoading: false });
    }

    //#region 
    /** PLACE ORDER API */
    placeOrder = (txn_id, payment_option = '') => {
        netStatus(status => {
            // this.checkoutDetail.extra_comment = this.state.strComment

            if (this.oldOrderID !== undefined)
                this.checkoutDetail.order_id = this.oldOrderID

            let params = {
                ...this.checkoutDetail,
                isLoggedIn: (this.props.userID !== undefined && this.props.userID !== null && this.props.userID !== "") ? 1 : 0,
                phone_number: this.props.phoneNumber,
                first_name: this.props.firstName,
                last_name: this.props.lastName,
                email: this.props.email,
                phone_code: this.props.phoneCode

            }
            this.tempPayment_option = ""

            if (payment_option == "razorpay") {
                params.transaction_id = this.razorpay_payment_id;
                params.payment_option = payment_option
                params.razorpay_payment_id = this.razorpay_payment_id
                params.merchant_order_id = this.merchant_order_id
            }

            else if (txn_id !== undefined && txn_id !== null) {
                params.transaction_id = txn_id;
                params.payment_option = payment_option
                this.tempPayment_option = payment_option
            }
            console.log("CheckOut request :::::::::: ", JSON.stringify(params))
            // return;
            if (status) {
                this.setState({ isLoading: true });
                addOrder(params, this.onSuccessAddOrder, this.onFailureAddOrder, this.props, true)
            } else {
                showValidationAlert(strings("noInternet"));
            }
        });
    }
    //#endregion
}

export const style = StyleSheet.create({
    subContainer: {
        margin: 10,
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 10,
        paddingHorizontal: 15,
        marginHorizontal: 15

    },
    titleText: {
        color: EDColors.black,
        fontSize: getProportionalFontSize(15),
        fontFamily: EDFonts.semiBold,
        marginHorizontal: 10,
        flex: 1,
    },
    editIconStyle: { marginHorizontal: 15 },
    footerStyle: { marginTop: 20, marginHorizontal: 10, backgroundColor: EDColors.white, borderWidth: 2, borderColor: EDColors.separatorColorNew, borderRadius: 16, alignItems: "center" },
    totalPrice: {
        flex: 1,
        fontFamily: EDFonts.medium,
        fontSize: getProportionalFontSize(14),
        alignSelf: "center",
        marginHorizontal: 10,
        color: EDColors.white
    },
    centerView: { alignItems: 'center' },
    simpleText: {
        fontFamily: EDFonts.medium,
        fontSize: getProportionalFontSize(14),
        color: EDColors.blackSecondary
    },
    checkboxText: {
        fontFamily: EDFonts.medium,
        fontSize: getProportionalFontSize(14),
        color: EDColors.blackSecondary,
        marginHorizontal: 5
    },
    currencyStyle: {
        fontFamily: EDColors.medium,
        fontSize: getProportionalFontSize(14),
        color: EDColors.nonVeg
    },
    textStyle: {
        fontFamily: EDFonts.semiBold,
        fontSize: getProportionalFontSize(12),
        color: EDColors.black
    },
    checkOutContainer: {
        borderRadius: 16,
        backgroundColor: EDColors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        width: '90%',
        height: metrics.screenHeight * 0.07,
        marginHorizontal: 10,
        marginBottom: 8
    },
    paymentMethodTitle: {
        // flex: 1,
        fontFamily: EDFonts.medium,
        fontSize: getProportionalFontSize(14),
        color: "#000000",
        margin: 10
    },
    iconStyle: {
        marginHorizontal: 5
    },
    button: {
        paddingTop: 10,
        paddingRight: 20,
        paddingLeft: 20,
        paddingBottom: 10,
        color: "#fff",
        fontFamily: EDFonts.medium,
        fontSize: getProportionalFontSize(16)
    },
    pendingContainer: {
        borderRadius: 16,
        padding: 15,
        backgroundColor: EDColors.white,
        margin: 10,
        marginBottom: 10,
    },
    pendingSubContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    checkBoxStyle: {
        alignItems: "center",
        justifyContent: "space-between",
        borderTopColor: EDColors.radioSelected,
        borderTopWidth: 1,
        paddingTop: 10,
        marginTop: 10
    },
    pendingText: {
        fontFamily: EDFonts.medium,
        fontSize: getProportionalFontSize(14),
        color: EDColors.black,
        // flex: 1
    },
    promoResponseView: {
        borderRadius: 16,
        marginLeft: 15,
        marginRight: 15,
        backgroundColor: "#fff",
        // marginVertical: 5,
        paddingVertical: 5
    },
    promoResponse: {
        flexDirection: "row",
        alignItems: "center",
        padding: 5,
    },
    promoResponseTextStyle: {
        // flex: 1,
        fontFamily: EDFonts.regular,
        fontSize: getProportionalFontSize(16),
        alignSelf: "center",
        color: EDColors.black,
        textAlign: "center",
        marginHorizontal: 10,
        height: 20
    },
    promoText: {
        marginHorizontal: 10,
        color: "green",
        fontSize: getProportionalFontSize(14),
        textAlign: 'center',
        fontFamily: EDFonts.medium,
        marginBottom: 5
    },
    methodStyle: { marginHorizontal: 15, marginTop: 15 },
    methodText: { fontFamily: EDFonts.semiBold, fontSize: getProportionalFontSize(16), color: EDColors.black },
    discountView: { justifyContent: 'center', alignItems: 'center', paddingVertical: 10 },
    promoCode: {
        alignSelf: "center",
        color: EDColors.black,
        fontFamily: EDFonts.regular,
        fontSize: 15,
    },
    mainView: { flex: 1, justifyContent: "space-between" },
    cardView: {
        alignItems: "center",
        justifyContent: "space-between",
        flex: 1,
        borderTopColor: EDColors.separatorColorNew,
        borderTopWidth: 1,
        paddingTop: 15,
        marginTop: 5,
        paddingHorizontal: 10
    },
    cardSubView: {
        alignItems: "center",
        flex: 1,

    },
    last4Text: {
        fontFamily: EDFonts.medium,
        fontSize: getProportionalFontSize(14),
        color: EDColors.black
    },
    expiredText: {
        fontFamily: EDFonts.regular,
        fontSize: getProportionalFontSize(13),
        color: EDColors.mastercard
    },
    changeCard: {
        fontFamily: EDFonts.semiBold,
        fontSize: getProportionalFontSize(13),
        color: EDColors.primary,
        // flex: 1,
        textAlign: "right",
        textDecorationLine: "underline",
        marginLeft: 10
    },
    cartResponseTextStyle: {
        // flex: 1,
        fontFamily: EDFonts.regular,
        fontSize: getProportionalFontSize(16),
        alignSelf: "center",
        color: EDColors.black,
        textAlign: "center",
        marginHorizontal: 10,
        height: 22,
        marginVertical: 4,
    }
});

export default connect(
    state => {
        return {
            checkoutDetail: state.checkoutReducer.checkoutDetail,
            lan: state.userOperations.lan,
            currency: state.checkoutReducer.currency_symbol,
            email: state.userOperations.email,
            firstName: state.userOperations.firstName,
            phoneNumber: state.userOperations.phoneNumberInRedux,
            userID: state.userOperations.userIdInRedux,
            token: state.userOperations.phoneNumberInRedux,
            lastName: state.userOperations.lastName,
            phoneCode: state.userOperations.phoneCode,
            email: state.userOperations.email,
            guestDetails: state.checkoutReducer.guestDetails,

        };
    },
    dispatch => {
        return {
            saveCheckoutDetails: checkoutData => {
                dispatch(saveCheckoutDetails(checkoutData));
            },
            saveCartCount: data => {
                dispatch(saveCartCount(data));
            },
            saveWalletMoney: token => {
                dispatch(saveWalletMoneyInRedux(token))
            },
            saveTableID: table_id => {
                dispatch(saveTableIDInRedux(table_id))
            },
            saveResID: table_id => {
                dispatch(saveResIDInRedux(table_id))
            }
        };
    }
)(PaymentContainer);