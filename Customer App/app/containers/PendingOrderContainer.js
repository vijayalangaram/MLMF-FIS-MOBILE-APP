import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, ScrollView, BackHandler, RefreshControl, Platform } from "react-native";
import BaseContainer from "./BaseContainer";
import { EDColors } from "../utils/EDColors";
import { RESPONSE_SUCCESS, funGetDateStr, capiString, debugLog, funGetFrench_Curr, getProportionalFontSize, isRTLCheck, CARD_BRANDS, RETURN_URL } from "../utils/EDConstants";
import { getPayLaterOrdersAPI, updatePendingOrdersAPI, applyCouponAPI, getPaymentList, getSavedCardsAPI, checkCardPayment, createPaymentMethod } from "../utils/ServiceManager";
import { showDialogue, showDialogueNew, showNoInternetAlert, showPaymentDialogue, showValidationAlert } from "../utils/EDAlert";
import PriceDetail from "../components/PriceDetail";
import metrics from "../utils/metrics";
import { connect } from "react-redux";
import { saveNavigationSelection } from "../redux/actions/Navigation";
import { netStatus } from "../utils/NetworkStatusConnection";
import { NavigationEvents } from "react-navigation";
import { strings } from "../locales/i18n";
import EDPlaceholderComponent from "../components/EDPlaceholderComponent";
import { EDFonts } from "../utils/EDFontConstants";
import EDRTLText from "../components/EDRTLText";
import EDRTLView from "../components/EDRTLView";
import { Icon } from "react-native-elements";
import EDButton from "../components/EDButton";
import { saveTableIDInRedux, saveResIDInRedux } from "../redux/actions/User";
import { SvgXml } from "react-native-svg";
import { discount_icon } from "../utils/EDSvgIcons";
import EDImage from "../components/EDImage";
import { CreditCardInput } from "react-native-credit-card-input";
import Assets from "../assets";
import WebView from "react-native-webview";
import EDPopupView from "../components/EDPopupView";
import { Spinner } from "native-base";
import RazorpayCheckout from "react-native-razorpay";

class PendingOrderContainer extends React.Component {
    //#region LIFE CYCLE METHODS

    constructor(props) {
        super(props);
        this.refreshing = false
        this.checkoutDetail = this.props.checkoutDetail;
        this.strOnScreenMessageInProcess = '';
        this.strOnScreenSubtitleinProcess = '';
        this.strOnScreenMessagePast = '';
        this.strOnScreenSubtitlePast = '';
        this.arrayUpcoming = [];
        this.receievedOrders = this.props.navigation.state !== undefined && this.props.navigation.state.params !== undefined && this.props.navigation.state.params.orderDetails !== undefined ? this.props.navigation.state.params.orderDetails : []
        this.currency_symbol = ""
        this.promoObj = {}
        this.used_coupons = []
        this.promoArray = []
        this.possible_creditcard_fee = 0
    }

    state = {
        isLoading: false,
        restaurant_id: "",
        totalPendingAmount: 0,
        online: true,
        paymentModal: false,
        discountedPrice: undefined,
        selectedOption: "",
        restaurant_id: '',
        showCardInput: false,
        isDefaultCard: false,
        noDefaultCard: false,
        defaultCard: undefined,
        isSavedCardLoading: false,
        isCardSave: false,
        url: undefined,
        countryCode: undefined,
        cardError: "",


    };

    componentWillReceiveProps = newProps => {
        if (this.props.screenProps.isRefresh !== newProps.screenProps.isRefresh) {
            this.networkConnectivityStatus()
        }
    }

    componentWillMount() {


    }

    async componentDidMount() {
        // this.checkUser()
        if (this.props.userID !== undefined && this.props.userID !== null && this.props.userID !== "") {
            this.networkConnectivityStatus()
        } else {
            showDialogueNew(strings("loginValidation"), [], strings("appName"), () => {
                this.props.navigation.navigate("LoginContainer", {
                    isCheckout: true
                });
            });
        }
        this.props.saveNavigationSelection("PendingOrders");

    }

    getPaymentOptionsAPI = () => {
        netStatus(isConnected => {
            if (isConnected) {
                this.setState({ isLoading: true })

                var params = {
                    language_slug: this.props.lan,
                    user_id: this.props.userID,
                    is_dine_in: '1',
                    restaurant_id: this.state.restaurant_id,
                    isLoggedIn: (this.props.userID !== undefined && this.props.userID !== null && this.props.userID !== "") ? 1 : 0
                }

                getPaymentList(params, this.onSuccessPaymentList, this.onFailurePaymentList, this.props)
            } else {
                showNoInternetAlert()
            }
        })
    }

    onSuccessPaymentList = onSuccess => {
        if (onSuccess.Payment_method !== undefined && onSuccess.Payment_method !== null && onSuccess.Payment_method.length !== 0) {
            this.paymentOptions = onSuccess.Payment_method

            //FETCH SAVED CARDS IN STRIPE PAYMENT IF SUPPORTED
            if (this.props.userID !== undefined && this.props.userID !== null && this.paymentOptions && this.paymentOptions.map(data =>
                data.payment_gateway_slug
            ).includes("stripe"))
                this.fetchCards()

            if (onSuccess.Payment_method[0].payment_gateway_slug == "razorpay") {
                this.razorpayDetails = onSuccess.Payment_method[0]
            }

            if (this.state.selectedOption !== "stripe")
                this.setState({ selectedOption: onSuccess.Payment_method[0].payment_gateway_slug })
            this.forceUpdate();
        }
        this.setState({ isLoading: false })

    }

    onFailurePaymentList = onFailure => {
        console.log('::::::::::: PAYMENT FALURE', onFailure)
        // showValidationAlert(onFailure.message)
        showValidationAlert("Payment Method Error");
        this.setState({ isLoading: false })
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



    /**
   * Start Stripe Payment
   */
    startStripePayment = (final_total) => {
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
                            amount: final_total * 100,
                            // amount: parseFloat(this.checkoutDetail.total),
                            currency: this.arrayUpcoming[0].currency_code,
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
                            amount: final_total * 100,
                            currency: this.arrayUpcoming[0].currency_code,
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
                // this.placeOrder(onSuccess.stripe_response.id, "stripe")
                this.updatePendingOrders(this.txn_id, "stripe")
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


    onOptionSelection = (data) => {


        this.setState({ selectedOption: data.payment_gateway_slug })
        if (data.payment_gateway_slug == "razorpay") {
            this.razorpayDetails = data
        }
        // this.forceUpdate()
    }
    createPaymentList = item => {

        let display_name = `display_name_${this.props.lan}`
        return (

            <View>
                <TouchableOpacity style={[styles.paymentBtn]}
                    activeOpacity={1}
                    onPress={() => this.onOptionSelection(item.item)}>
                    <EDRTLView>
                        <EDRTLView style={{ alignItems: 'center', flex: 1 }}>

                            <Icon name={
                                item.item.payment_gateway_slug === 'applepay' ? 'apple-pay'
                                    :
                                    item.item.payment_gateway_slug === 'paypal' ? 'paypal' : item.item.payment_gateway_slug === 'cod' ? 'account-balance-wallet' : 'credit-card'}
                                type={
                                    item.item.payment_gateway_slug === 'applepay' ? 'fontisto' :
                                        item.item.payment_gateway_slug === 'paypal' ? 'entypo' : item.item.payment_gateway_slug === 'cod' ? 'material' : 'material'}
                                size={20} color={this.state.selectedOption == item.item.payment_gateway_slug ? EDColors.primary : EDColors.text}
                                style={styles.paymentIconStyle} />

                            <EDRTLText style={[styles.paymentMethodTitle, { color: this.state.selectedOption == item.item.payment_gateway_slug ? EDColors.black : EDColors.blackSecondary }]} title={
                                item.item[display_name]} />
                        </EDRTLView>
                        <Icon name={"check"} size={getProportionalFontSize(16)} selectionColor={EDColors.primary} color={this.state.selectedOption == item.item.payment_gateway_slug ? EDColors.primary : EDColors.white} style={{ margin: 10 }} />
                    </EDRTLView>
                    {this.state.selectedOption == "stripe" && item.item.payment_gateway_slug == "stripe" ?
                        <>
                            {!this.state.showCardInput ?
                                this.state.defaultCard !== undefined ?
                                    <>
                                        <EDRTLView style={[styles.cardView]}>
                                            <EDRTLView style={styles.cardSubView}>
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
                                                        <EDRTLText title={this.state.defaultCard.card.last4} style={styles.last4Text} />
                                                    </EDRTLView>
                                                    {(new Date().setFullYear(this.state.defaultCard.card.exp_year, this.state.defaultCard.card.exp_month, 1) < new Date()) ?
                                                        <EDRTLText title={strings("expired")} style={styles.expiredText} /> : null}
                                                </View>
                                                <EDRTLText title={strings("change")} style={styles.changeCard} onPress={this.changeCard} />
                                                <EDRTLText title={
                                                    strings("homeNew")} style={styles.changeCard} onPress={this.addCard} />

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
                                                    <EDRTLText title={strings("setNow")} style={[styles.changeCard, { marginLeft: 7.5 }]} onPress={this.changeCard} />}
                                                <EDRTLText title={strings("homeNew")} style={styles.changeCard} onPress={this.addCard} />
                                            </EDRTLView>
                                        </>


                                : null}
                            {this.state.showCardInput ?
                                < View style={{}}>
                                    {this.state.defaultCard !== undefined || this.state.noDefaultCard ?
                                        <EDRTLText title={
                                            strings("dialogCancel")} style={[styles.changeCard, { textAlign: 'left', marginLeft: 0 }]} onPress={this.addCard} /> : null}
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
                                        cvcStyle={{ width: metrics.screenWidth / 2 - 50, marginLeft: 15 }}
                                        expiryStyle={{ width: metrics.screenWidth / 2 - 50 }}
                                        errorLeftPadding={metrics.screenWidth / 2 - 35}
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



    // getIconName=(iconName)=>{
    //     if(iconName === 'paypal')

    // }
    //#region 
    /** NETWORK CONNECTIVITY */
    networkConnectivityStatus = () => {
        if (this.receievedOrders !== undefined && this.receievedOrders !== null && this.receievedOrders.length !== 0) {
            this.arrayUpcoming = this.receievedOrders
            this.updateData(this.receievedOrders)
            this.getPaymentOptionsAPI()
        }
        else
            this.getPendingOrderData();
    }
    //#endregion

    //#region ON BLUR EVENT
    onDidFocusContainer = () => {

        if (this.receievedOrders !== undefined && this.receievedOrders !== null && this.receievedOrders.length !== 0) {
            BackHandler.addEventListener('hardwareBackPress', this.onBackPressed);
            this.arrayUpcoming = this.receievedOrders
            this.updateData(this.receievedOrders)
        }
        else
            this.checkUser()
        this.props.saveNavigationSelection("PendingOrders");
    }


    componentWillUnmount = () => {
        BackHandler.removeEventListener('hardwareBackPress', this.onBackPressed)
    }

    onBackPressed = () => {
        this.props.navigation.goBack();
        return true;
    }
    //#endregion

    //#region 
    /** ON LEFT PRESSED */
    onBackPressedEvent = () => {
        if (this.receievedOrders.length !== 0)
            this.props.navigation.goBack();
        else
            this.props.navigation.openDrawer();

    }
    //#endregion

    navigateToPaymentGateway = () => {
        if (this.state.selectedOption == "paypal")
            this.props.navigation.navigate("PaymentGatewayContainer",
                {
                    isPending: true,
                    pendingTotal: (this.state.discountedPrice !== undefined ? this.state.discountedPrice : this.state.totalPendingAmount) + (this.state.selectedOption == "cod" ? 0 : Number(this.possible_creditcard_fee)),
                    currency_code: this.arrayUpcoming[0].currency_code,
                    promoObj: this.promoObj,
                    order_id: this.arrayUpcoming[0].order_id,
                    creditcard_feeval: this.creditcard_details.creditcard_feeval,
                    creditcard_fee_typeval: this.creditcard_details.creditcard_fee_typeval

                })
        else if (this.state.selectedOption == "stripe") {
            // this.props.navigation.navigate("StripePaymentContainer",
            //     {
            //         isPending: true,
            //         pendingTotal: (this.state.discountedPrice !== undefined ? this.state.discountedPrice : this.state.totalPendingAmount),
            //         currency_code: this.arrayUpcoming[0].currency_code,
            //         promoObj: this.promoObj,
            //         order_id: this.arrayUpcoming[0].order_id
            //     })
            let pendingTotalAmount = this.state.discountedPrice !== undefined ? this.state.discountedPrice : this.state.totalPendingAmount

            this.startStripePayment(pendingTotalAmount + (this.state.selectedOption == "cod" ? 0 : Number(this.possible_creditcard_fee)))
        }

        else if (this.state.selectedOption == "razorpay") {
            // this.props.navigation.navigate("StripePaymentContainer",
            //     {
            //         isPending: true,
            //         pendingTotal: (this.state.discountedPrice !== undefined ? this.state.discountedPrice : this.state.totalPendingAmount),
            //         currency_code: this.arrayUpcoming[0].currency_code,
            //         promoObj: this.promoObj,
            //         order_id: this.arrayUpcoming[0].order_id
            //     })
            let pendingTotalAmount = this.state.discountedPrice !== undefined ? this.state.discountedPrice : this.state.totalPendingAmount

            this.startRazorPayment(pendingTotalAmount + (this.state.selectedOption == "cod" ? 0 : Number(this.possible_creditcard_fee)))
        }


    }

    startRazorPayment = (final_total) => {


        this.merchant_order_id = Date.now()
        var options = {
            description: 'Paying MLMF',
            image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASMAAAEkCAYAAABkJVeVAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAACVRSURBVHgB7d0JfBTl/T/w7zOzm4QbRYGQDUqlrVJvjgTUirVazyq11h5/e1nxQDAHClqUIFYskAOo1qq1aq2tRw+Plp9alfpTIAE8qYqiAjk4RIQQybE7z/P/PLOzm03IhULrj3zevJadnZmdnd3MfOf7HDMjQkRERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERET0eaSEaA+YIgnhaSAeQ/DoLY4YiUqtxKRK5shWbFBGiD4FBiPqlJkoYcmWU8WTs7HFnIpw8wWMTvfDTmILUrIT/7+McY/i+VFVJJuEaA8wGFGHkAmdgwAzD1vKcDxewfAzeH5dtKwXFwEoipm0DJA0+SKmfRWvThebMYncjml/Rub0iWyWD9SdskuIOsBgRLtBALLFsOPxOAUBphBbyRPIjWbK9fKGUh0Xw/De3pj/B5hrJl5mSrzYZrOm/8XjHjweR9YUE6JWGIzIZ0qkB2p+foDBn+FxnB2FreN9/F+GsHJXZ0Fot+XNlAje/1e86wm8fBvDF+LZZllvIaP6kbpR3hCiFAxGJOYmGYkgcT8eh+DlXxAsHkY19UvygdSheBWVT8nPkkQWIphdYoOZmSGHYbm3Y6sbjdzobDVblglRwBHq1swv5Gi/HsigDkjkSBShfqhukCfVdfIxClmT5DPAsuoQdJ6UWX5xTdTN8h6ezsVnPY2g9HuTj2yMKMBg1I2Za1GUiskjCA7LpUbOQ/BYl5xms2YlX5LPajaKatLcsobPaMLTFHzAIOknE4QowGDUTaEI9XXphSBkZAiylMt2K44VobCm5FDTxaK8uVBcM97v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Fyf75CgUioxMQuvXP9r+nJz7MP2HeIxFAOr0/LfPk4LIqAtQ4/IofqOr8RstFNqvMRj9B7S+PK2tAA2HmypsmoEAMWwPF+dnArW1vZH2+5fhiDNyrxeV0gVbyl+3t5EO9VJF8XovOR2V6qtKqyrGy/8htqK4lxt6Cet/QKOYkWyB2v8xGP0HoDj1tHFkOCp016NFJYS6lCNRke3pJif3s7SuXD0k95towl4gKvUKlLY1T9m6I7+ZGn/gGi+mTvi8X3sZRcZfYV0vQFF0jbK1TfZ8L6P6aFedUbZh+T65qQF9vjAY7WP2om3KkRZ1J9jTXnd07KLijav2qFdxW2zfGJ2W9mPUqNsrMLbKstRqtPdfYE9elc+xwuxxo43xKlLHoSVzjWP0JfNqVr4k1C0wGO1jfpN42JyFnWsgjvoNqLx9Odbro3/tixMl/fokV59ve1Z6jvNGQyz2TJunqnzOxK8C6ZyDyupDUdyMxpS8ecAu9eysbeW1QkREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREe+r/A6oAvqKJBlvwAAAAAElFTkSuQmCC',
            currency: this.arrayUpcoming[0].currency_code,
            key: this.razorpayDetails.enable_live_mode == "1" ? this.razorpayDetails.live_publishable_key : this.razorpayDetails.test_publishable_key, // Your api key
            amount: (Number(final_total).toFixed(2) * 100).toFixed(0),
            name: "MLMF",
            // order_id : 
            prefill: {
                email: this.props.email,
                contact: this.props.token,
                name:
                    this.props.firstName + " " + this.props.lastName
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
            this.txn_id = data.razorpay_payment_id;
            // this.placeOrder(onSuccess.stripe_response.id, "stripe")
            this.updatePendingOrders(this.txn_id, "razorpay")
        }).catch((error) => {

            // handle failure
            debugLog("Payment failure ::::::", error);
            if (error.code !== 0)
                setTimeout(() => {
                    showValidationAlert(error.description)

                }, 500)
        });
    }


    startPayment = () => {

        if (this.state.selectedOption == "stripe" && (this.state.defaultCard == undefined || this.state.showCardInput)) {

            if (!this.validateCard())
                return;
        }

        this.setState({ paymentModal: false })
        if (this.state.selectedOption !== "") {
            if (this.state.selectedOption == "cod")
                this.updatePendingOrders()
            else
                this.navigateToPaymentGateway()
        }
        else
            showValidationAlert(strings("choosePaymentError"))
    }

    updatePendingOrders = (txn_id = "", payment_option = "cod") => {
        netStatus(status => {
            if (status) {
                let pendingTotalAmount = this.state.discountedPrice !== undefined ? this.state.discountedPrice : this.state.totalPendingAmount
                let param = {
                    user_id: parseInt(this.props.userID) || 0,
                    // token: this.props.token,
                    language_slug: this.props.lan,
                    order_id: this.arrayUpcoming[0].order_id,
                    total_rate: Number(pendingTotalAmount) + Number(this.possible_creditcard_fee),
                    coupon_id: this.promoObj.coupon_id,
                    coupon_discount: this.promoObj.coupon_discount,
                    coupon_name: this.promoObj.coupon_name,
                    coupon_amount: this.promoObj.coupon_amount,
                    coupon_type: this.promoObj.coupon_type,
                    payment_option: payment_option,
                    coupon_array: JSON.stringify(this.promoObj.coupon_arrayapply)
                }
                if (payment_option == "razorpay") {
                    param.razorpay_payment_id = this.razorpay_payment_id
                    param.merchant_order_id = this.merchant_order_id
                    param.transaction_id = txn_id

                }
                else if (txn_id !== '')
                    param.transaction_id = txn_id

                if (payment_option !== "cod") {
                    param.creditcard_feeval = this.creditcard_details ? this.creditcard_details.creditcard_feeval : ""
                    param.creditcard_fee_typeval = this.creditcard_details ? this.creditcard_details.creditcard_fee_typeval : ""
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
            showDialogueNew(this.txn_id !== undefined && this.txn_id !== null && this.txn_id !== "" ? strings("payPendingSuccess") : strings("payPendingSuccessCod"), [], strings("appName"), () => {
                this.props.navigation.popToTop();
                this.props.navigation.navigate("Home");
            });
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

    //Apply promo

    applyPromo = data => {
        debugLog("APPLY PROMO :::::", data)
        this.promoArray = data
        netStatus(status => {
            if (status) {
                this.setState({ isLoading: true })
                let promoParams = {
                    user_id: this.props.userID,
                    // token: this.props.token,
                    // coupon: data,
                    order_delivery: "DineIn",
                    total: this.arrayUpcoming[0].price.filter(data => data.label_key === "Total")[0].value,
                    subtotal: this.arrayUpcoming[0].price.filter(data => data.label_key === "Sub Total")[0].value,
                    language_slug: this.props.lan,
                    coupon_array: JSON.stringify(this.promoArray),
                    // restaurant_id: this.state.restaurant_id,
                    restaurant_id: this.arrayUpcoming[0].restaurant_content_id
                }

                if (this.arrayUpcoming[0].price.map(data => data.label_key).includes("Wallet Deduction")) {
                    promoParams['wallet_amount'] = this.arrayUpcoming[0].price.filter(data => data.label_key === "Wallet Deduction")[0].value
                }

                applyCouponAPI(promoParams, this.onSuccessApplyCoupon, this.onFailureApplyCoupon, this.props)
            }
            else
                showNoInternetAlert()
        })
    }

    onSuccessApplyCoupon = onSuccess => {
        this.setState({ isLoading: false })
        debugLog("On success coupon :::::", onSuccess)
        if (onSuccess.status == RESPONSE_SUCCESS) {
            this.prmoApplied = true
            this.promoObj = onSuccess
            this.setState({ discountedPrice: onSuccess.total_rate })
            // showValidationAlert(onSuccess.message)
        }
        else
            showValidationAlert(onSuccess.message)
    }

    onFailureApplyCoupon = onFailure => {
        this.setState({ isLoading: false })
        this.promoArray = []
        showValidationAlert(strings("generalWebServiceError"))
        debugLog("On failure coupon :::::", onFailure)
    }

    removeCoupon = () => {
        this.setState({ discountedPrice: undefined })

        this.prmoApplied = false
        this.promoObj = {}
        this.promoArray = []

    }


    /** NAVIGATE TO PROMO CODE CONTAINER */
    navigateToPromoCode = () => {
        this.setState({ paymentModal: false })
        this.props.navigation.navigate("PromoCodeFromSideBar", {
            getData: this.applyPromo,
            subTotal: this.arrayUpcoming[0].price.filter(data => data.label_key === "Sub Total")[0].value,
            resId: this.arrayUpcoming[0].restaurant_id,
            order_delivery: "DineIn",
            used_coupons:
                this.promoObj !== undefined && this.promoObj !== null ?
                    this.promoObj.coupon_arrayapply : [],
            promoArray: this.promoArray,

        });
    }
    //#endregion




    // Go to restaurant
    goToRestaurant = () => {
        this.props.saveTableID(this.arrayUpcoming[0].table_id);
        this.props.saveResID(this.arrayUpcoming[0].restaurant_id);
        this.props.navigation.navigate("RestaurantContainer", {
            restId: this.arrayUpcoming[0].restaurant_id,
            content_id: this.arrayUpcoming[0].restaurant_content_id,
            currency: this.arrayUpcoming[0].currency_symbol
        }
        );
    }

    onPullToRefreshHandler = () => {
        this.strOnScreenMessageInProcess = ""
        this.checkUser()
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
                this.updatePendingOrders(this.txn_id, "stripe")
                // this.placeOrder(onSuccess.stripe_response.id, "stripe")
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
        // debugLog("PROPS IN PENDIGN ::::", this.props.navigation)
        return (
            <BaseContainer
                title={strings("activeDineInOrder")}
                left={
                    this.props.navigation.state !== undefined && this.props.navigation.state.params !== undefined && this.props.navigation.state.params.orderDetails !== undefined ?
                        (isRTLCheck() ? 'arrow-forward' : 'arrow-back') : "menu"}
                right={[]}
                onLeft={this.onBackPressedEvent}
                onConnectionChangeHandler={this.networkConnectivityStatus}
                loading={this.state.isLoading}
            >

                {this.render3DVerificationModal()}

                {/* FOCUS EVENTS */}
                <NavigationEvents onDidFocus={this.onDidFocusContainer} />



                {/* MAIN VIEW */}
                <View style={styles.mainContainer}>

                    <View style={styles.orderParentView}>
                        {console.log("ARRAY UPCOMING ::::::", this.arrayUpcoming)}
                        {this.arrayUpcoming != undefined && this.arrayUpcoming != null && this.arrayUpcoming.length > 0 ? (
                            <View style={{ flex: 1 }}>
                                <ScrollView
                                    style={{ flex: 1 }}
                                    showsVerticalScrollIndicator={false}
                                    refreshControl={
                                        <RefreshControl
                                            refreshing={this.refreshing || false}
                                            colors={[EDColors.primary]}
                                            onRefresh={this.onPullToRefreshHandler}
                                        />}
                                >

                                    {this.renderPendingOrder(this.arrayUpcoming[0])}
                                    {/* </ScrollView> */}
                                    {this.receievedOrders !== undefined && this.receievedOrders !== null && this.receievedOrders.length !== 0 ?
                                        null : <>
                                            {this.arrayUpcoming[0].order_status.toLowerCase() !== "complete" && this.arrayUpcoming[0].order_status.toLowerCase() !== 'delivered' ?

                                                <EDRTLView style={{ marginHorizontal: 10 }}>
                                                    <TouchableOpacity
                                                        onPress={this.goToRestaurant}
                                                        style={[styles.BtnStyle, {
                                                            flexDirection: isRTLCheck() ? 'row-reverse' : 'row',
                                                        }]}
                                                    >
                                                        <Text style={styles.btnText} >
                                                            {strings("orderMore")}
                                                        </Text>
                                                        <Icon
                                                            name={isRTLCheck() ? "leftcircleo" : "rightcircleo"}
                                                            type={'ant-design'}
                                                            size={getProportionalFontSize(15)}
                                                            color={EDColors.white}
                                                        />
                                                    </TouchableOpacity>
                                                </EDRTLView>
                                                : null}
                                            <View style={styles.promoView} >
                                                {this.prmoApplied == true ? (


                                                    <>

                                                        <View style={styles.promoResponse} >
                                                            <View style={{ flex: 1, alignItems: 'center' }}>
                                                                <EDRTLView>
                                                                    <Text style={[styles.promoResponseTextStyle, { flex: 1 }]} >
                                                                        {this.promoObj.coupon_arrayapply.length + strings("couponApplied")}
                                                                    </Text>
                                                                    <TouchableOpacity
                                                                        style={styles.coupenBtn}
                                                                        onPress={this.removeCoupon}>
                                                                        <Icon
                                                                            name={"close"}
                                                                            size={getProportionalFontSize(28)}
                                                                            color={EDColors.black}
                                                                        />
                                                                    </TouchableOpacity>
                                                                </EDRTLView>
                                                                <EDRTLView style={styles.discountView}>
                                                                    <SvgXml xml={discount_icon} />
                                                                    <Text
                                                                        style={styles.promoCode}
                                                                        onPress={this.navigateToPromoCode}>
                                                                        {strings("applyMore")}
                                                                    </Text>
                                                                </EDRTLView>
                                                            </View>
                                                        </View>
                                                    </>
                                                ) : (
                                                    (this.props.userID != undefined && this.props.userID != "") ?
                                                        <EDRTLView style={styles.discountView}>
                                                            <SvgXml xml={discount_icon} />
                                                            <Text
                                                                style={styles.promoCode}
                                                                onPress={this.navigateToPromoCode}>
                                                                {strings("haveAPromo")}
                                                            </Text>
                                                        </EDRTLView>
                                                        : null)}
                                            </View>


                                            <View >
                                                {this.paymentOptions !== undefined && this.paymentOptions !== null && this.paymentOptions.length !== 0 ?
                                                    <EDRTLView style={styles.methodStyle}>
                                                        <Text style={styles.methodText}>
                                                            {strings("choosePaymentOption")}
                                                        </Text>
                                                    </EDRTLView>
                                                    : null}
                                                <EDRTLView style={styles.subContainer}>

                                                    {this.paymentOptions !== undefined && this.paymentOptions !== null && this.paymentOptions.length !== 0 ?
                                                        <FlatList
                                                            data={this.paymentOptions}
                                                            extraData={this.state}
                                                            renderItem={this.createPaymentList}
                                                        /> : null}
                                                </EDRTLView>
                                                <EDButton label={strings("payNow")}
                                                    style={styles.btnView}
                                                    onPress={this.startPayment}

                                                    numberOfLines={2}
                                                />

                                            </View>
                                        </>
                                    }
                                </ScrollView>
                            </View>
                        )
                            :
                            (this.strOnScreenMessageInProcess || '').trim().length > 0 ? (
                                <ScrollView
                                    style={{ flex: 1 }}
                                    contentContainerStyle={{ flex: 1, justifyContent: "center" }}
                                    refreshControl={
                                        <RefreshControl
                                            refreshing={this.refreshing || false}
                                            colors={[EDColors.primary]}
                                            onRefresh={this.onPullToRefreshHandler}
                                        />}
                                >
                                    <EDPlaceholderComponent
                                        // title={this.strOnScreenMessageInProcess}
                                        title={this.strOnScreenMessageInProcess}
                                    />
                                </ScrollView>
                            ) : null}
                    </View>
                </View>
            </BaseContainer>
        );
    }
    //#endregion

    renderPendingOrder = (data) => {
        let coupon_arrayapply = [{
            coupon_name: "TEST"
        },
        {
            coupon_name: "TEST2"
        }
        ]
        return (
            <TouchableOpacity style={styles.pendingContainer}
                activeOpacity={1}
            >
                <View style={styles.pendingSubContainer}>
                    <EDRTLView style={styles.pendingSubView}>
                        <View style={{ justifyContent: 'space-evenly', flex: 2.5 }}>
                            <View>
                                <EDRTLText style={styles.pastOrderText}
                                    title={funGetDateStr(data.order_date, "MMMM DD,YYYY, hh:mm A")} />
                            </View>
                            <View style={styles.topView}>
                                <EDRTLText style={styles.nameText} title={data.restaurant_name} />
                            </View>
                            <EDRTLView style={styles.topView}>
                                <Text style={styles.statusTextString}>{strings("orderStatus2") + ": "}</Text>
                                <Text style={styles.statusText}>{data.order_status_display}</Text>
                            </EDRTLView>
                            {data.table_number !== null && data.table_number !== undefined ?
                                <EDRTLView style={styles.topView} >
                                    <Text style={styles.statusTextString}>{strings("tableNo") + ": "}</Text>
                                    <Text style={styles.statusText}>{isRTLCheck() ? (data.table_number) : (+ data.table_number)}</Text>
                                </EDRTLView> : null}

                        </View>
                        <View style={{ flex: 1 }} >
                            {/* <Image source={Assets.user_placeholder} style={styles.pendingIcon} /> */}
                            <EDImage style={styles.pendingIcon}
                                source={data.restaurant_image}
                                resizeMode="cover"

                            />
                        </View>
                    </EDRTLView>

                    <View style={styles.detailView} >
                        <EDRTLView>
                            <Text style={styles.titleText}> {strings('orderDetails') + " (#" + data.order_id + ")"} </Text>
                        </EDRTLView>
                        <FlatList
                            style={styles.priceListStyle}
                            contentContainerStyle={styles.listStyle}
                            showsVerticalScrollIndicator={false}
                            data={data.items}
                            listKey={(item, index) => "D" + index.toString()}
                            renderItem={({ item, index }) => {
                                return (
                                    <>
                                        <EDRTLView style={styles.textStylePrice}>
                                            <EDRTLText title={capiString(item.name) + (Number(item.quantity > 1) ? " (x" + item.quantity + ")" : "")} style={styles.itemTextStyle} />
                                            <EDRTLText style={styles.itemTextStyle} title={data.currency_symbol + funGetFrench_Curr(item.itemTotal, 1, data.currency_symbol)} />
                                        </EDRTLView>

                                        {(item.is_customize == 1 || item.is_customize == "1") && item.addons_category_list !== undefined && item.addons_category_list !== null ?
                                            item.addons_category_list.map(
                                                category => {
                                                    return (
                                                        <View style={styles.addonView}>

                                                            {category.addons_list.map(
                                                                addons => {
                                                                    return (
                                                                        <EDRTLView style={[{ marginVertical: 3, justifyContent: "space-between" }, isRTLCheck() ? { marginLeft: 5 } : { marginRight: 5 }]}>
                                                                            <EDRTLText style={styles.addonItemText} title={capiString(addons.add_ons_name) + (Number(item.quantity > 1) ? " (x" + item.quantity + ")" : "")} />
                                                                            <EDRTLText style={styles.addonItemPrice} title={data.currency_symbol + funGetFrench_Curr(addons.add_ons_price, item.quantity, this.props.lan)} />
                                                                        </EDRTLView>
                                                                    )
                                                                }
                                                            )}
                                                        </View>)
                                                }
                                            )
                                            : null}
                                    </>
                                );
                            }}
                            keyExtractor={(item, index) => item + index}
                        />
                        <View style={styles.nextedView} />
                        <FlatList

                            scrollEnabled={true}
                            // data={this.state.discountedPrice !== undefined ? data.price.filter(p => p.value != 0 && p.label_key !== "Total").concat([{
                            //     label: strings("discount") + "(" + this.promoObj.coupon_name + ")",
                            //     label_key: "Discount",
                            //     value: this.promoObj.coupon_discount
                            // }]) : data.price.filter(p => p.value != 0 && p.label_key !== "Total")}
                            data={this.state.discountedPrice !== undefined ?
                                data.price.filter(p => p.value != 0 && p.label_key !== "Total").concat([{
                                    label: strings("discount") + "(" + (this.promoObj !== undefined && this.promoObj !== null && this.promoObj.coupon_arrayapply !== undefined ? this.promoObj.coupon_arrayapply.map(data => data.coupon_name).join(", ") : "") + ")",
                                    label_key: "Discount",
                                    value: this.promoObj.coupon_discount
                                }])
                                : data.price.filter(p => p.value != 0 && p.label_key !== "Total")

                            }
                            listKey={(item, index) => "Q" + index.toString()}
                            renderItem={item => this.renderPriceView(item.item, data.currency_symbol)}
                            keyExtractor={(item, index) => item + index}
                        />
                        <View style={[styles.nextedView, { marginVertical: 5 }]} />
                        <View style={styles.totalView}>
                            <PriceDetail
                                title={strings("total")}
                                style={{ marginRight: 5, marginLeft: 5 }}
                                titleStyle={styles.itemTextStyle}
                                priceStyle={styles.itemTextStyle}
                                price={this.arrayUpcoming[0].currency_symbol + funGetFrench_Curr(
                                    ((this.state.discountedPrice !== undefined ? this.state.discountedPrice : this.state.totalPendingAmount)
                                        +
                                        (this.state.selectedOption == "cod" ? 0 : Number(this.possible_creditcard_fee))), 1, this.arrayUpcoming[0].currency_symbol)}
                            />
                            {this.state.selectedOption !== "" &&
                                this.state.selectedOption !== "cod" &&
                                this.possible_creditcard_fee !== undefined &&
                                this.possible_creditcard_fee !== null &&
                                this.possible_creditcard_fee !== 0 ?
                                <EDRTLText title={"(" + strings("creditFreeIncluded") + " " + this.arrayUpcoming[0].currency_symbol +
                                    funGetFrench_Curr(this.possible_creditcard_fee, 1, this.arrayUpcoming[0].currency_symbol)
                                    + ")"}
                                    style={{
                                        marginHorizontal: 5,
                                        marginTop: 10,
                                        color: EDColors.black,
                                        fontFamily: EDFonts.semiBold,
                                        fontSize: getProportionalFontSize(12)
                                    }} /> : null

                            }
                        </View>
                        {data.extra_comment !== "" && data.extra_comment !== null ?
                            <>
                                <View style={styles.conmmentView} />
                                <View style={[styles.commentContainer, { flexDirection: isRTLCheck() ? "row-reverse" : "row" }]}>
                                    <Text style={{ color: EDColors.black }}>{strings("orderComment") + ': ' + data.extra_comment}</Text>
                                    {/* <Text style={{ color: EDColors.black }}>{data.extra_comment}</Text> */}
                                </View>
                            </> : null}

                    </View>
                </View>
            </TouchableOpacity>

        )
    }


    //#region 
    /** VIEW FOR PRICES */
    renderPriceView = (item, currency_symbol) => {
        return (
            <View style={{ flex: 1, paddingHorizontal: 2 }}>
                <PriceDetail
                    showToolTip={item.showToolTip}
                    taxable_fields={this.taxable_fields.filter(data => { return data.value !== "" && data.value != "0.00" && data.value != 0 })}
                    currency={this.arrayUpcoming.length !== 0 ? this.arrayUpcoming[0].currency_symbol : ""}

                    key={item.label}
                    title={item.label != undefined ? capiString(item.label) : ""}
                    price={
                        item.value != undefined
                            ? item.label_key.includes("Discount")
                                ? "- " + currency_symbol + funGetFrench_Curr(item.value, 1, currency_symbol)
                                : (item.label_key.includes("Delivery") || item.label_key.includes("Service")) ? (item.value.toString().includes("%") ? "+ " + item.value :
                                    "+ " + currency_symbol + funGetFrench_Curr(item.value, 1, currency_symbol))
                                    :
                                    currency_symbol + funGetFrench_Curr(item.value, 1, currency_symbol)
                            : ""
                    }
                    label_key={item.label_key}
                    titleStyle={styles.itemTextStyle}
                    priceStyle={styles.itemTextStyle}
                    style={{ marginRight: 5, marginLeft: 5 }}
                />
            </View>
        );
    }
    //#endregion

    //#region  NETWORK
    /** CHECK USER DEATILS */
    checkUser() {
        if (this.props.userID !== "" && this.props.userID !== undefined && this.props.userID !== null) {
            if (!this.state.isLoading)
                this.getPendingOrderData();
        } else {
            showDialogue(strings("loginValidation"), [], strings("appName"), () => {
                this.props.navigation.navigate("LoginContainer")
            });
        }
    }
    //#endregion

    //#region 
    /**
    * @param { Success Reponse Object } onSuccess
    */
    onSuccessOrderListing = (onSuccess) => {
        debugLog("ORDER DETAIL LIST ::::::::::::: ", onSuccess)
        if (onSuccess != undefined && onSuccess.status == RESPONSE_SUCCESS) {
            if (onSuccess.dineIn.length > 0) {
                this.arrayUpcoming = onSuccess.dineIn;
                this.updateData(this.arrayUpcoming);
                if (onSuccess.creditcard_apply !== undefined && onSuccess.creditcard_apply !== null &&
                    onSuccess.creditcard_apply.creditcard_fee_cal !== undefined &&
                    onSuccess.creditcard_apply.creditcard_fee_cal !== null &&
                    onSuccess.creditcard_apply.creditcard_fee_cal !== ""
                ) {
                    this.possible_creditcard_fee = onSuccess.creditcard_apply.creditcard_fee_cal
                    this.creditcard_details = onSuccess.creditcard_apply || {}
                }
            } else {
                this.strOnScreenMessageInProcess = strings('noDineIn')
            }
            // this.setState({ isLoading: false });
            this.getPaymentOptionsAPI()
        } else {
            console.log('NOT GETTING ORDER LIST')
            this.strOnScreenMessagePast = strings("generalWebServiceError")
            this.strOnScreenMessageInProcess = strings("generalWebServiceError")
            this.setState({ isLoading: false });
        }
    }


    /**
     * @param { Failure Response Object } onFailure
     */
    onFailureOrderListing = (onFailure) => { // ERROR 405
        console.log(':::::::::: FAILED TO GET ORDER', onFailure)
        this.strOnScreenMessagePast = strings("generalWebServiceError")
        this.strOnScreenMessageInProcess = strings("generalWebServiceError")
        this.setState({ isLoading: false });
    }

    /** GET PENDING ORDER API */
    getPendingOrderData() {
        netStatus(isConnected => {
            if (isConnected) {
                this.arrayUpcoming = []
                this.setState({ isLoading: true });
                let param = {
                    user_id: parseInt(this.props.userID) || 0,
                    // token: this.props.token,
                    language_slug: this.props.lan,
                    // unpaid_orders: this.unpaid_orders
                }
                getPayLaterOrdersAPI(param, this.onSuccessOrderListing, this.onFailureOrderListing, this.props);
            } else {
                this.setState({ isLoading: false })
                this.strOnScreenMessagePast = this.strOnScreenMessageInProcess = strings('noInternetTitle');
                this.strOnScreenSubtitlePast = this.strOnScreenSubtitleinProcess = strings('noInternet');
            }
        })
    }

    //#region 
    /** UPDATE DATA */
    updateData(arrayItems) {
        let totalPending = 0
        var arrayFinal = [];
        arrayItems.map((item, index) => {
            arrayFinal[index] = {
                isShow: true,
            };
            totalPending = totalPending + parseFloat(item.total)
        });
        this.isShowArray = arrayFinal;

        this.arrayUpcoming[0].price = this.arrayUpcoming[0].price.filter(data => { return data.label_key !== undefined })
        if (!this.isForPastOrder && this.arrayUpcoming[0].price !== undefined && this.arrayUpcoming[0].price !== null && this.arrayUpcoming[0].price instanceof Array) {
            this.taxable_fields = this.arrayUpcoming[0].price.filter(data => { return data.label_key !== undefined && (data.label_key.toLowerCase().includes("fee") || data.label_key.toLowerCase().includes("tax")) && data.value !== "" && data.value != "0.00" && data.value != 0 })
            let taxable_fields = this.taxable_fields
            this.arrayUpcoming[0].price = this.arrayUpcoming[0].price.filter(function (data) {
                return !taxable_fields.includes(data);
            });
            let total_taxes = 0
            if (taxable_fields.length !== 0) {
                taxable_fields.map(data => {
                    total_taxes = total_taxes + Number(data.value)
                })
            }
            this.arrayUpcoming[0].price.splice(
                this.arrayUpcoming[0].price.length - 1, 0, {
                label: strings("taxes&Fees") + " ",
                value: total_taxes,
                label_key: "Tax and Fee",
                showToolTip: true
            }
            )


            this.setState({ totalPendingAmount: totalPending, restaurant_id: arrayItems[0].restaurant_id })
        }
    }
    //#endregion
}

const styles = StyleSheet.create({
    pendingContainer: { flexDirection: "column", marginBottom: 10 },
    commentContainer: { marginHorizontal: 10, flexDirection: "row", marginTop: 5, marginBottom: 10 },
    pendingSubContainer: {
        flex: 1,
        margin: 5,
        padding: 5
        //  backgroundColor: EDColors.white, borderRadius: 6, shadowColor: EDColors.black,
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.8,
        // shadowRadius: 2,
    },
    pendingIcon: { height: metrics.screenWidth * 0.25, width: metrics.screenWidth * 0.25, borderRadius: 8 },
    textStyle: {
        // flex: 1,
        color: EDColors.black,
        fontSize: getProportionalFontSize(20),
        fontFamily: EDFonts.regular,
        marginHorizontal: 10
    },
    nextedView: {
        backgroundColor: "#F6F6F6",
        height: 0.5,
        marginHorizontal: 0,
        marginBottom: 0
    },
    topView: { marginTop: 5 },
    nameText: { color: EDColors.black, fontFamily: EDFonts.semiBold, fontSize: getProportionalFontSize(16) },
    conmmentView: { borderColor: EDColors.black, borderWidth: .5, marginTop: 10 },
    pendingSubView: { justifyContent: "space-between", backgroundColor: EDColors.white, borderRadius: 16, padding: 8 },
    addonText: { fontSize: getProportionalFontSize(12), fontFamily: EDFonts.regular, color: EDColors.black, textDecorationLine: 'underline' },
    pastOrderText: {
        color: EDColors.text,
        fontSize: getProportionalFontSize(12),
        fontFamily: EDFonts.medium,

    },
    listStyle: { marginVertical: 0, borderTopColor: '#F6F6F6', borderTopWidth: 1 },
    totalView: { flex: 1, paddingBottom: 10, paddingHorizontal: 3 },
    detailView: { backgroundColor: EDColors.white, borderRadius: 16, padding: 5, marginTop: 10 },
    coupenBtn: { alignSelf: "center", marginRight: 10 },
    methodText: { fontFamily: EDFonts.semiBold, fontSize: getProportionalFontSize(16), color: EDColors.black },
    methodStyle: { marginHorizontal: 10, marginTop: 10 },
    itemTextStyle: { color: EDColors.black, fontFamily: EDFonts.medium, fontSize: getProportionalFontSize(12) },
    titleText: { fontFamily: EDFonts.semiBold, fontSize: getProportionalFontSize(16), color: EDColors.black, marginVertical: 8, },
    addonItemText: { fontFamily: EDFonts.regular, fontSize: getProportionalFontSize(12), color: EDColors.text, },
    textStylePrice: { alignItems: "center", justifyContent: 'space-between', marginTop: 10, marginHorizontal: 0 },
    statusText: { color: EDColors.black, fontFamily: EDFonts.semiBold, fontSize: getProportionalFontSize(12) },
    statusTextString: { color: EDColors.text, marginHorizontal: 0, fontFamily: EDFonts.regular, fontSize: getProportionalFontSize(12) },
    addonItemPrice: { textAlign: 'right', marginRight: -5, fontSize: getProportionalFontSize(12), fontFamily: EDFonts.regular, color: EDColors.text },
    mainContainer: { flex: 1, margin: 10 },
    orderParentView: { flex: 1, alignContent: 'center' },
    priceListStyle: { marginTop: 0, marginBottom: 10, marginHorizontal: 5 },
    discountView: { justifyContent: 'center', alignItems: 'center', },
    BtnStyle: {
        width: '100%',
        height: metrics.screenHeight * 0.070,
        borderRadius: 16,
        backgroundColor: EDColors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10
    },
    btnText: {
        fontSize: getProportionalFontSize(14),
        fontFamily: EDFonts.medium,
        color: EDColors.white,
        marginHorizontal: 10
    },
    subContainer: {
        margin: 10,
        paddingVertical: 5,
        marginTop: 5,
    },
    paymentMethodTitle: {
        // flex: 1,
        fontFamily: EDFonts.medium,
        fontSize: getProportionalFontSize(14),
        padding: 10,
        marginHorizontal: 0,
        marginEnd: 5,
        // maxWidth: metrics.screenWidth * .25
    },
    addonView: {
        marginHorizontal: 0,
        marginVertical: 2
    },
    paymentContainer: {
        backgroundColor: EDColors.offWhite,
        borderRadius: 6,
        padding: 10,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        margin: 15,
    },
    btnView: {
        width: '95%',
        height: metrics.screenHeight * 0.070,
        borderRadius: 16,
        backgroundColor: EDColors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 10
    },
    paymentBtn: {
        width: '100%',
        borderRadius: 16,
        backgroundColor: EDColors.white,
        justifyContent: 'space-between',
        // alignItems:'center',
        marginVertical: 10
    },
    paymentBtnView: { justifyContent: 'space-between', flex: 1, paddingHorizontal: 10, alignItems: 'center' },
    promoView: {
        borderRadius: 16,
        marginLeft: 10,
        marginRight: 10,
        backgroundColor: "#fff",
        marginVertical: 5
    },
    promoResponse: {
        flexDirection: isRTLCheck() ? "row-reverse" : 'row',
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
        // height: 20
        marginVertical: 10
    },
    promoCode: {
        alignSelf: "center",
        color: EDColors.text,
        fontFamily: EDFonts.medium,
        fontSize: getProportionalFontSize(14),
        marginTop: 15,
        marginBottom: 15,
        paddingHorizontal: 5
    },
    subContainer: {
        margin: 10,
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 10,
        paddingHorizontal: 15,
        marginHorizontal: 15

    },
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
    }
})

export default connect(
    state => {
        return {
            titleSelected: state.navigationReducer.selectedItem,
            checkoutDetail: state.checkoutReducer.checkoutDetail,
            lan: state.userOperations.lan,
            userID: state.userOperations.userIdInRedux,
            token: state.userOperations.phoneNumberInRedux,
            firstName: state.userOperations.firstName,
            lastName: state.userOperations.lastName
        };
    },
    dispatch => {
        return {
            saveNavigationSelection: dataToSave => {
                dispatch(saveNavigationSelection(dataToSave));
            },
            saveTableID: table_id => {
                dispatch(saveTableIDInRedux(table_id))
            },
            saveResID: table_id => {
                dispatch(saveResIDInRedux(table_id))
            }
        };
    }
)(PendingOrderContainer);