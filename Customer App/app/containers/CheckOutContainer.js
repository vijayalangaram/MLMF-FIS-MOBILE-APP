import moment from "moment";
import { Spinner } from "native-base";
import React from "react";
import { TextInput } from "react-native";
import { Platform } from "react-native";
import {
  BackHandler,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Icon } from "react-native-elements";
import { heightPercentageToDP } from "react-native-responsive-screen";
import { initialWindowMetrics } from "react-native-safe-area-context";
import SeeMore from "react-native-see-more-inline";
import { SvgXml } from "react-native-svg";
import WebView from "react-native-webview";
import {
  NavigationActions,
  NavigationEvents,
  StackActions,
} from "react-navigation";
import { connect } from "react-redux";
import CartItem from "../components/CartItem";
import EDButton from "../components/EDButton";
import EDCategoryOrder from "../components/EDCategoryOrder";
import { EDCookingInfo } from "../components/EDCookingInfo";
import EDImage from "../components/EDImage";
import EDItemDetails from "../components/EDItemDetails";
import EDPlaceholderComponent from "../components/EDPlaceholderComponent";
import EDPopupView from "../components/EDPopupView";
import EDRTLText from "../components/EDRTLText";
import EDRTLView from "../components/EDRTLView";
import EDThemeButton from "../components/EDThemeButton";
import PriceDetail from "../components/PriceDetail";
import ProductComponent from "../components/ProductComponent";
import { strings } from "../locales/i18n";
import {
  saveCartCount,
  saveCartPrice,
  saveCheckoutDetails,
  saveIsCheckoutScreen,
  save_selected_category_home_cont,
} from "../redux/actions/Checkout";
import {
  clearCartData,
  clearCurrency_Symbol,
  getCartList,
  saveCartData,
} from "../utils/AsyncStorageHelper";
import {
  showDialogue,
  showNoInternetAlert,
  showPaymentDialogue,
  showProceedDialogue,
  showValidationAlert,
} from "../utils/EDAlert";
import { EDColors } from "../utils/EDColors";
import {
  validateTwoDecimal,
  capiString,
  COUPON_ERROR,
  debugLog,
  funGetFrench_Curr,
  getProportionalFontSize,
  isRTLCheck,
  RESPONSE_SUCCESS,
  RESTAURANT_ERROR,
  RETURN_URL,
} from "../utils/EDConstants";
import { EDFonts } from "../utils/EDFontConstants";
import { discount_icon } from "../utils/EDSvgIcons";
import metrics from "../utils/metrics";
import { netStatus } from "../utils/NetworkStatusConnection";
import {
  addOrder,
  addToCart,
  checkCardPayment,
  createPaymentMethod,
  getWalletHistoryAPI,
} from "../utils/ServiceManager";
import BaseContainer from "./BaseContainer";
import * as RNLocalize from "react-native-localize";
import RazorpayCheckout from "react-native-razorpay";
import Assets from "../assets";
import axios from "axios";

export class CheckOutContainer extends React.PureComponent {
  //#region LIFE CYCLE METHODS

  constructor(props) {
    super(props);
    this.isRefresh = false;
    this.cartData = [];
    this.deleteIndex = -1;
    this.cart_id = 0;
    this.cartResponse = undefined;
    this.delivery_charges = "";
    this.promoCode = "";
    this.promoArray = [];
    this.resId = "";
    this.resName = "";
    this.minimum_subtotal = "";
    this.featured_items = undefined;
    this.unpaid_orders_status = true;
    this.featured_items_image = [];
    this.selectedItem = "";
    this.comment = "";
    this.placeOrderFromCheckout = false;
    this.cartTotal = "";
    this.count = 0;
    this.payment_option =
      this.props.navigation.state.params !== undefined &&
      this.props.navigation.state.params.payment_option !== undefined
        ? this.props.navigation.state.params.payment_option
        : "cod";

    this.selectedCard =
      this.props.navigation.state.params !== undefined &&
      this.props.navigation.state.params.selectedCard !== undefined
        ? this.props.navigation.state.params.selectedCard
        : undefined;

    this.cardData =
      this.props.navigation.state.params !== undefined &&
      this.props.navigation.state.params.cardData !== undefined
        ? this.props.navigation.state.params.cardData
        : undefined;

    this.razorpayDetails =
      this.props.navigation.state.params !== undefined &&
      this.props.navigation.state.params.razorpayDetails !== undefined
        ? this.props.navigation.state.params.razorpayDetails
        : undefined;

    this.isDefaultCard =
      this.props.navigation.state.params !== undefined &&
      this.props.navigation.state.params.isDefaultCard !== undefined
        ? this.props.navigation.state.params.isDefaultCard
        : false;

    this.isCardSave =
      this.props.navigation.state.params !== undefined &&
      this.props.navigation.state.params.isCardSave !== undefined
        ? this.props.navigation.state.params.isCardSave
        : false;

    this.countryCode =
      this.props.navigation.state.params !== undefined &&
      this.props.navigation.state.params.countryCode !== undefined
        ? this.props.navigation.state.params.countryCode
        : "";

    this.publishable_key =
      this.props.navigation.state.params !== undefined &&
      this.props.navigation.state.params.publishable_key !== undefined
        ? this.props.navigation.state.params.publishable_key
        : "";

    this.tipsArray = [];
    this.tip = "";
    this.forCartFetch = false;
    this.isCustom = false;
    this.isPreOrder =
      this.props.navigation.state.params !== undefined &&
      this.props.navigation.state.params.isPreOrder !== undefined
        ? this.props.navigation.state.params.isPreOrder
        : false;

    this.allowPreOrder =
      this.props.navigation.state.params !== undefined &&
      this.props.navigation.state.params.allowPreOrder !== undefined
        ? this.props.navigation.state.params.allowPreOrder
        : false;
    this.taxable_fields = [];
  }

  state = {
    key: 1,
    isLoading: false,
    isAsyncSync: false,
    value: 0,
    walletApplied: false,
    visible: false,
    isCategory: false,
    isParcel: false,
    tip: "",
    customTip: "",
    noTip: true,
    tipView: false,
    showInfoModal: false,
    descriptionVisible: true,
    url: undefined,
    loggedInUserwalletBalance: "",
    // save_order_payload: localStorage.getItem("save_order_payload"),
  };

  componentDidMount() {
    this.getWalletHistoryAPIREQ();
    this.backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      this.handleBackPress
    );
    if (
      this.props.navigation.state.params?.delivery_status !== "PickUp" &&
      this.props.navigation.state.params?.default_tip_percent_val !==
        undefined &&
      this.props.navigation.state.params?.default_tip_percent_val !== null &&
      this.props.navigation.state.params?.default_tip_percent_val !== ""
    ) {
      this.tip = this.props.navigation.state.params?.default_tip_percent_val;
      this.isCustom = false;
      this.setState({
        tipView: true,
        tip: this.props.navigation.state.params?.default_tip_percent_val,
        noTip: false,
      });
    }
    this.getcartDataList();

    // debugLog(
    //   "****************************** Vijay ****************************** save_order_payload",
    //   this.state.save_order_payload
    // );

    // debugLog(
    //   " ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ ",
    //   this.props.selected_Slot_ID
    // );

    // debugLog(
    //   "****************************** Vijay ****************************** dunzo_Delivery_Amount",
    //   this.props.dunzo_Delivery_Amount
    // );

    // debugLog(
    //   "****************************** Vijay ****************************** dunzo_Delivery_Amount",
    //   this.props.dunzo_Delivery_Amount
    // );
    // debugLog(
    //   "****************************** Vijay ****************************** Number(this.props.dunzo_Delivery_Details)",
    //   this.props.dunzo_Delivery_Details
    // );
    // debugLog(
    //   "****************************** ******************  this.props.navigation.state.params.payment_option",
    //   this.props.navigation.state.params.payment_option
    // );
  }

  componentWillUnmount() {
    this.backHandler.remove();
  }

  getWalletHistoryAPIREQ = () => {
    let param = {
      language_slug: this.props.lan,
      user_id: parseInt(this.props.userID) || 0,
      count: 10,
      page_no: 1,
    };
    getWalletHistoryAPI(
      param,
      this.onSuccessFetchWallet,
      this.onFailureFetchWallet,
      this.props,
      true
    );
  };

  onSuccessFetchWallet = (onSuccess) => {
    this.setState({ loggedInUserwalletBalance: onSuccess.wallet_money });
  };

  onFailureFetchWallet = (onFailure) => {};

  onDidFocus = () => {
    // debugLog("IS REFRESH :::::", this.isRefresh);
    if (this.isRefresh) this.getcartDataList();
  };

  /**
   * Toggle wallet
   */

  toggleWallet = () => {
    if (!this.state.walletApplied) {
      if (parseInt(this.max_used_QR) > parseInt(this.wallet_money)) {
        showValidationAlert(
          strings("minimum") +
            this.props.currency +
            this.max_used_QR +
            " " +
            strings("walletRedeemError")
        );
      } else if (parseInt(this.minimum_subtotal) > parseInt(this.subTotal)) {
        showValidationAlert(
          strings("minSubtotalError") +
            this.props.currency +
            this.minimum_subtotal
        );
      } else {
        // debugLog(
        //   "****************************** Vijay ****************************** 4444"
        // );
        this.getcartDataList();
        this.setState({ walletApplied: true });
      }
    } else {
      this.getcartDataList();
      this.setState({ walletApplied: false });
    }
  };

  toggleTip = () => {
    if (this.state.tipView) {
      const newArr1 = this.tipsArray.map((v) => ({ ...v, selected: false }));
      this.tipsArray = newArr1;
      this.setState({ noTip: true, tip: "", customTip: "", tipView: false });
      this.tip = "";
      this.isCustom = false;
      this.getcartDataList();
    } else {
      if (
        this.props.navigation.state.params?.delivery_status !== "PickUp" &&
        this.props.navigation.state.params?.default_tip_percent_val !==
          undefined &&
        this.props.navigation.state.params?.default_tip_percent_val !== null &&
        this.props.navigation.state.params?.default_tip_percent_val !== ""
      ) {
        this.tip = this.props.navigation.state.params?.default_tip_percent_val;
        this.isCustom = false;
        const newArr1 = this.tipsArray.map((v) => ({
          ...v,
          selected:
            this.props.navigation.state.params?.default_tip_percent_val ==
            v.value
              ? true
              : false,
        }));
        this.tipsArray = newArr1;
        this.setState({
          tipView: true,
          tip: this.props.navigation.state.params?.default_tip_percent_val,
          noTip: false,
        });
      }
      this.getcartDataList();
    }
  };

  showCookingInfo = (index) => {
    this.selectedIndex = index;
    this.comment = this.cartResponse.items[index].comment;
    this.setState({ showInfoModal: true });
  };

  removeCookingInfo = (index) => {
    var array = this.cartResponse;
    array.items[index].comment = "";
    this.getCartData(array.items);
  };

  hideCookingInfo = () => {
    this.selectedIndex = -1;
    this.setState({ showInfoModal: false });
  };

  renderCookingInfo = () => {
    return (
      <EDPopupView
        isModalVisible={this.state.showInfoModal}
        shouldDismissModalOnBackButton
        onRequestClose={this.hideCookingInfo}
      >
        <EDCookingInfo
          hideCookingInfo={this.hideCookingInfo}
          saveComment={this.saveInstruction}
          comment={this.comment}
        />
      </EDPopupView>
    );
  };

  saveInstruction = (instruction) => {
    var array = this.cartResponse;
    if (
      instruction !== undefined &&
      instruction !== null &&
      instruction.trim().length !== 0
    ) {
      array.items[this.selectedIndex].comment = instruction;
      this.getCartData(array.items);
    }
    this.hideCookingInfo();
  };

  navigateToRestaurant = () => {
    this.isRefresh = true;
    this.props.navigation.push("RestaurantContainer", {
      restId: this.resId,
      content_id: this.content_id,
    });
  };

  toggleDescription = () => {
    this.setState({ descriptionVisible: !this.state.descriptionVisible });
  };

  /**
   * Webview Navigation change
   */
  navigationChange = (resp) => {
    // debugLog("NAVIGATION CHANGE CALLED :::::::::::", resp)
    if (resp.url.includes(RETURN_URL + "/?payment_intent")) {
      this.setState({ url: undefined });
      this.checkCardPayment();
    }
  };

  checkCardPayment = () => {
    netStatus((status) => {
      if (status) {
        this.setState({ isLoading: true });
        var params = {
          trans_id: this.txn_id,
          language_slug: this.props.lan,
        };
        checkCardPayment(
          params,
          this.onCheckCardPaymentSuccess,
          this.onCheckCardPaymentFailure,
          this.props
        );
      } else {
        showNoInternetAlert();
        this.setState({ isLoading: false });
      }
    });
  };

  /**
   * On check card payment success
   */
  onCheckCardPaymentSuccess = (onSuccess) => {
    if (onSuccess.status == RESPONSE_SUCCESS) {
      if (
        onSuccess.stripe_response.error !== undefined &&
        onSuccess.stripe_response.error.message !== undefined
      ) {
        showValidationAlert(
          strings("paymentFail") +
            "\n\n" +
            onSuccess.stripe_response.error.message
        );
        this.setState({ isLoading: false });
      } else if (onSuccess.stripe_response.status == "succeeded") {
        // debugLog("Payment Sucessful with 3d secure authentication ::::::");
        this.setState({ isLoading: true });
        this.txn_id = onSuccess.stripe_response.id;

        this.placeOrder(onSuccess.stripe_response.id, "stripe");
      } else {
        // debugLog("PAYMENT FAILED ::::");
        showValidationAlert(strings("paymentFail"));
        this.setState({ isLoading: false });
      }
    } else {
      this.setState({ isLoading: false });
      showValidationAlert(strings("paymentFail"));
    }
  };
  /**
   * On check card payment failure
   */
  onCheckCardPaymentFailure = (onFailure) => {
    // debugLog("FAILURE :::::", onFailure);
    showValidationAlert(
      strings("paymentFail") +
        "\n\n" +
        (onSuccess.stripe_response.error !== undefined
          ? onSuccess.stripe_response.error.message
          : "")
    );
    this.setState({ isLoading: false });
  };
  onWebViewCloseHandler = () => {
    showPaymentDialogue(
      strings("cancelConfirm"),
      [
        {
          text: strings("dialogYes"),
          onPress: () => {
            this.setState({ url: undefined });
          },
        },
        { text: strings("dialogNo"), onPress: () => {}, isNotPreferred: true },
      ],
      strings("warning")
    );
  };

  render3DVerificationModal = () => {
    return (
      <EDPopupView
        isModalVisible={this.state.url !== undefined}
        shouldDismissModalOnBackButton
        onRequestClose={this.onWebViewCloseHandler}
      >
        <View
          style={{
            margin: 20,
            marginVertical: 80,
            borderRadius: 16,
            flex: 1,
            overflow: "hidden",
            backgroundColor: EDColors.white,
          }}
        >
          <WebView
            onLoad={() => this.setState({ isLoading: false })}
            // onLoadStart={() => this.setState({ isLoading: false })}
            style={{ width: "100%", height: "100%", borderRadius: 16 }}
            source={{ uri: this.state.url }}
            javaScriptEnabled={true}
            startInLoadingState
            renderLoading={() => {
              return <Spinner size="small" color={EDColors.primary} />;
            }}
            allowsBackForwardNavigationGestures={true}
            onNavigationStateChange={this.navigationChange}
          />
        </View>
      </EDPopupView>
    );
  };

  // RENDER METHOD
  render() {
    // debugLog(
    //   "this.cartResponse ********************************************************************",
    //   this.cartResponse
    // );

    // debugLog(
    //   "************************************************************************************************"
    // );

    if (
      (this.state.tip == 0 || this.state.tip == "") &&
      (this.state.customTip == 0 || this.state.customTip == "")
    ) {
      this.setState({ noTip: true });
    }
    return (
      <BaseContainer
        // title={strings("doCheckout")}
        title={this.resName || ""}
        left={isRTLCheck() ? "arrow-forward" : "arrow-back"}
        right={[]}
        onLeft={this.onLeftPressEvent}
        loading={this.state.isLoading}
      >
        <NavigationEvents onDidFocus={this.onDidFocus} />

        {this.render3DVerificationModal()}

        {/* CATEGORY MODAL */}
        {this.renderCategoryOrder()}

        {this.renderCookingInfo()}

        {/* ITEM DETAILS */}
        {this.renderItemDetails()}

        {/* MAIN VIEW */}
        {this.cartResponse != undefined &&
        this.cartResponse.items.length > 0 ? (
          <View
            style={{
              flex: 1,
              paddingBottom: 5,
              backgroundColor: EDColors.radioSelected,
              marginHorizontal: 10,
            }}
          >
            <ScrollView
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent: "space-between",
              }}
              showsVerticalScrollIndicator={false}
            >
              {/* DISPLAY CART CARD LIST */}
              {/* <FlatList
                data={
                  this.cartResponse != undefined ? this.cartResponse.items : []
                }
                showsVerticalScrollIndicator={false}
                style={{ marginVertical: 10 }}
                keyExtractor={(item, index) => item + index}
                ListFooterComponent={() => {
                  return (
                    <EDRTLText
                      title={strings("addMore")}
                      style={style.addMoreText}
                      onPress={this.navigateToRestaurant}
                    />
                  );
                }}
                renderItem={({ item, index }) => {
                  return (
                    <CartItem
                      key={this.state.key}
                      index={index}
                      items={item}
                      currency={this.props.currency}
                      price={
                        item.offer_price !== "" &&
                        item.offer_price !== undefined &&
                        item.offer_price !== null
                          ? item.offer_price
                          : item.price
                      }
                      addonsItems={
                        item.addons_category_list === undefined
                          ? []
                          : item.addons_category_list
                      }
                      iscounts={
                        item.addons_category_list === undefined ? true : false
                      }
                      quantity={item.quantity}
                      onPlusClick={this.onPlusEventHandler}
                      onMinusClick={this.onMinusEventHandler}
                      deleteClick={this.onDeletEventHandler}
                      lan={this.props.lan}
                      showCookingInfo={this.showCookingInfo}
                      removeCookingInfo={this.removeCookingInfo}
                    />
                  );
                }}
              /> */}

              {/* FEATUED ITEMS */}
              {this.featured_items !== undefined &&
              this.featured_items !== null &&
              this.featured_items.length !== 0 ? (
                <View>
                  <EDRTLText
                    title={strings("peopleAlsoOrdered")}
                    style={[style.alsoOrderedText]}
                  />
                  <FlatList
                    style={{ marginVertical: 5, marginBottom: 10 }}
                    // showsHorizontalScrollIndicator={false}
                    data={this.featured_items}
                    renderItem={this.renderFeaturedItems}
                    extraData={this.state}
                    // horizontal
                  />
                </View>
              ) : null}

              {/* BOTTOM VIEW */}
              <View style={{}}>
                {/* Tip */}
                {this.props.navigation.state.params?.delivery_status ==
                "Delivery" ? (
                  <View>
                    {/* <EDRTLView style={[style.walletContainer, {}]}> */}
                    {/* <TouchableOpacity onPress={this.toggleTip}> */}
                    {/* <EDRTLView style={{ alignItems: "center", marginHorizontal: 15, marginVertical: 10 }}> */}
                    {/* <Icon name="account-balance-wallet" size={25} /> */}
                    {/* <Icon name={this.state.tipView ? "checkbox-outline" : "square-outline"} type={'ionicon'} color={EDColors.primary} size={getProportionalFontSize(22)} onPress={this.toggleTip} /> */}
                    {/* <EDRTLText style={[style.walletText, { marginTop: 5, marginHorizontal:0 }]} title={strings("driverTip")} /> */}
                    {/* </EDRTLView> */}
                    {/* </TouchableOpacity> */}
                    {/* </EDRTLView> */}

                    {this.state.tipView ? (
                      <>
                        <View
                          style={{
                            backgroundColor: "#fff",
                            borderRadius: 16,
                            // marginTop: -40,
                            paddingTop: 10,
                            margin: 10,
                            // paddingHorizontal: 20,
                            paddingBottom: 10,
                          }}
                        >
                          <EDRTLText
                            style={[
                              style.walletText,
                              { marginTop: 0, marginHorizontal: 10 },
                            ]}
                            title={strings("driverTip")}
                          />
                          {/* Tip Buttons */}

                          <ScrollView
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                            containerStyle={{
                              flexDirection: "row",
                              justifyContent: "space-evenly",
                            }}
                          >
                            {this.tipsArray.map((item, key) => {
                              return (
                                <TouchableOpacity
                                  key={key}
                                  style={[
                                    style.roundButton,
                                    {
                                      borderWidth: 1,
                                      borderColor: item.selected
                                        ? EDColors.primary
                                        : EDColors.separatorColor,
                                      backgroundColor: EDColors.white,
                                      borderRadius: 8,
                                    },
                                  ]}
                                  onPress={() => {
                                    for (
                                      let i = 0;
                                      i < this.tipsArray.length;
                                      i++
                                    )
                                      if (i == key)
                                        this.tipsArray[i].selected = true;
                                      else this.tipsArray[i].selected = false;
                                    this.isCustom = false;
                                    this.setState({
                                      tip: item.value,
                                      customTip: "",
                                      noTip: false,
                                    });
                                  }}
                                >
                                  <Text
                                    style={[
                                      style.button,
                                      {
                                        color: item.selected
                                          ? EDColors.primary
                                          : EDColors.blackSecondary,
                                      },
                                    ]}
                                  >
                                    {item.value + "%"}
                                  </Text>
                                </TouchableOpacity>
                              );
                            })}
                          </ScrollView>

                          {/* <View style={{
                                                        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
                                                        borderColor: 'yellow', borderWidth: 1
                                                    }}> */}
                          <EDRTLView
                            style={[
                              style.roundButton,
                              {
                                width: "100%",
                                flex: 1,
                                marginHorizontal: 10,
                                justifyContent: "space-between",
                                backgroundColor: EDColors.white,
                                paddingHorizontal: 10,
                                alignItems: "center",
                                alignSelf: "center",
                              },
                            ]}
                          >
                            <EDRTLView
                              style={{ alignItems: "center", flex: 1 }}
                            >
                              <EDRTLView
                                style={{
                                  borderBottomWidth: 1,
                                  borderColor: "#EDEDED",
                                  flex: 1,
                                }}
                              >
                                <Text
                                  style={{
                                    textAlignVertical: "center",
                                    fontSize: 16,
                                  }}
                                >
                                  {this.props.currency}
                                </Text>
                                <TextInput
                                  style={style.customTipInput}
                                  placeholder={strings("customTip")}
                                  multiline={false}
                                  keyboardType={"number-pad"}
                                  selectionColor={EDColors.primary}
                                  onChangeText={(value) => {
                                    const newArr1 = this.tipsArray.map((v) => ({
                                      ...v,
                                      selected: false,
                                    }));
                                    this.tipsArray = newArr1;
                                    const customTip = value.replace(
                                      /[- #*;,+<>N()\{\}\[\]\\\/]/gi,
                                      ""
                                    );
                                    if (customTip <= 999) {
                                      if (!validateTwoDecimal(customTip)) {
                                        this.isCustom = true;
                                        this.setState({
                                          customTip: customTip,
                                          tip: "",
                                          noTip: false,
                                        });
                                      }
                                    }
                                  }}
                                  value={this.state.customTip}
                                />
                              </EDRTLView>
                              {/* <TouchableOpacity
                                                                style={{ alignSelf: "center" }}
                                                                onPress={() => { this.setState({ customTip: '', noTip: true }) }} >
                                                                <Icon name={"close"} size={getProportionalFontSize(18)} />
                                                            </TouchableOpacity> */}
                            </EDRTLView>
                            <EDRTLView
                              style={{
                                alignItems: "center",
                                justifyContent: "flex-end",
                              }}
                            >
                              <EDButton
                                style={[
                                  style.roundButton,
                                  {
                                    borderColor: EDColors.primary,
                                    borderWidth: 1,
                                    borderRadius: 8,
                                    alignItems: "center",
                                    textAlign: "center",
                                    padding: 0,
                                    margin: 0,
                                    marginHorizontal: 10,
                                    backgroundColor: "white",
                                  },
                                ]}
                                onPress={() => {
                                  const newArr1 = this.tipsArray.map((v) => ({
                                    ...v,
                                    selected: false,
                                  }));
                                  this.tipsArray = newArr1;
                                  this.setState({
                                    noTip: true,
                                    tip: "",
                                    customTip: "",
                                  });
                                  this.tip = "";
                                  this.isCustom = false;
                                  this.getcartDataList();
                                }}
                                textStyle={[
                                  style.button,
                                  {
                                    color: EDColors.primary,
                                    fontSize: getProportionalFontSize(13),
                                    alignSelf: "center",
                                    textAlign: "center",
                                  },
                                ]}
                                label={strings("clearTip")}
                              />
                              <EDButton
                                style={[
                                  style.roundButton,
                                  {
                                    borderRadius: 8,
                                    alignItems: "center",
                                    textAlign: "center",
                                    padding: 0,
                                    margin: 0,
                                    marginHorizontal: 0,
                                  },
                                ]}
                                disabled={
                                  (Number(this.state.customTip) == 0 ||
                                    this.state.customTip.toString().trim() ===
                                      "") &&
                                  this.state.tip.toString().trim() === ""
                                }
                                onPress={() => {
                                  this.tip =
                                    this.state.customTip.toString().trim() !=
                                      "" &&
                                    this.state.customTip.toString().trim() != ""
                                      ? this.state.customTip
                                      : this.state.tip;
                                  // this.isCustom = this.state.customTip?.trim() != ""
                                  this.getcartDataList();
                                }}
                                textStyle={[
                                  style.button,
                                  {
                                    fontSize: getProportionalFontSize(13),
                                    alignSelf: "center",
                                    textAlign: "center",
                                  },
                                ]}
                                label={strings("submitButton")}
                              />
                            </EDRTLView>
                          </EDRTLView>
                        </View>
                        {/* </View> */}
                      </>
                    ) : null}
                  </View>
                ) : null}
                {/* WALLET BALANCE  */}

                {this.unpaid_orders_status &&
                this.wallet_money !== undefined &&
                this.wallet_money !== null &&
                this.wallet_money !== "0.00" &&
                this.props.userID != undefined &&
                this.props.userID != "" ? (
                  <>
                    <TouchableOpacity
                    // onPress={this.toggleWallet}
                    >
                      {/* <View style={style.priceContainer}>
                  <EDRTLText
                    style={[
                      style.title,
                      {
                        marginVertical: 5,
                        marginHorizontal: 20,
                        fontFamily: EDFonts.semiBold,
                      },
                    ]}
                    title="Wallet Detail"
                  />
                  </View> */}

                      <EDRTLView style={style.walletContainer}>
                        <EDRTLView
                          style={{
                            alignItems: "center",
                            marginHorizontal: 15,
                            marginVertical: 10,
                          }}
                        >
                          {/* <Icon name="account-balance-wallet" size={25} /> */}
                          {/* {100 <
                          parseInt(this.state.loggedInUserwalletBalance) && (
                          <Icon
                            name={
                              this.state.walletApplied
                                ? "checkbox-outline"
                                : "square-outline"
                            }
                            type={"ionicon"}
                            color={EDColors.primary}
                            size={getProportionalFontSize(22)}
                            // onPress={this.toggleWallet}
                          />
                        )} */}

                          {Number(this.props.minOrderAmount) <
                          parseInt(this.state.loggedInUserwalletBalance) ? (
                            <EDRTLText
                              style={style.walletText}
                              title={
                                strings("applyWallet") +
                                "(" +
                                this.props.currency +
                                " " +
                                this.wallet_money +
                                ")"
                              }
                            />
                          ) : (
                            <EDRTLText
                              style={style.walletText}
                              title={`Low Wallet Balance:₹ ${parseInt(
                                this.state.loggedInUserwalletBalance
                              )}`}
                              color="orange"
                            />
                          )}
                        </EDRTLView>
                        {/* <Icon name={this.state.walletApplied ? "check-box" : "check-box-outline-blank"} color={EDColors.primary} size={25} onPress={this.toggleWallet} /> */}
                      </EDRTLView>
                    </TouchableOpacity>
                  </>
                ) : null}

                {this.props.navigation.state.params == undefined ||
                (this.props.navigation.state.params !== undefined &&
                  this.props.navigation.state.params.isDineOrder !==
                    undefined &&
                  this.props.navigation.state.params.isDineOrder == true) ? (
                  <TouchableOpacity onPress={this.toggleParcel}>
                    <EDRTLView
                      style={[style.walletContainer, { marginTop: 5 }]}
                    >
                      <EDRTLView
                        style={{
                          alignItems: "center",
                          marginHorizontal: 15,
                          marginVertical: 10,
                        }}
                      >
                        {/* <Icon name="account-balance-wallet" size={25} /> */}
                        <Icon
                          name={
                            this.state.isParcel
                              ? "checkbox-outline"
                              : "square-outline"
                          }
                          type={"ionicon"}
                          color={EDColors.primary}
                          size={getProportionalFontSize(22)}
                          onPress={this.toggleParcel}
                        />
                        <EDRTLText
                          style={style.walletText}
                          title={strings("isParcel")}
                        />
                      </EDRTLView>
                    </EDRTLView>
                  </TouchableOpacity>
                ) : null}

                {/* PRICE DETAILS */}
                <View style={style.priceContainer}>
                  <EDRTLText
                    style={[
                      style.title,
                      {
                        marginVertical: 5,
                        marginHorizontal: 20,
                        fontFamily: EDFonts.semiBold,
                      },
                    ]}
                    title={strings("priceDetail")}
                    // title="Price Detail"
                  />
                  <View style={style.divider} />
                  {this.cartResponse.price != undefined ? (
                    this.cartResponse.price
                      .filter(
                        (data) =>
                          data.label_key !== undefined &&
                          data.label_key !== "Wallet Discount" &&
                          data.label_key !== "Total" &&
                          data.label_key !== "Delivery Charge"
                      )
                      .map((item, index) => {
                        // debugLog(
                        //   "item.label_key::::::::::::::::::::::::",
                        //   item.label_key
                        // );
                        return (
                          <PriceDetail
                            key={item.label}
                            title={
                              item.label != undefined
                                ? capiString(item.label)
                                : ""
                            }
                            subtitle={
                              item.label2 != undefined
                                ? capiString(item.label2)
                                : ""
                            }
                            titleStyle={style.priceLabel}
                            priceStyle={style.priceLabel}
                            priceDetailsView={style.priceDetailView}
                            currency={this.props.currency}
                            price={
                              item.value != undefined
                                ? item.label_key.includes("Wallet Deduction")
                                  ? isRTLCheck()
                                    ? this.props.currency + item.value + " -"
                                    : "- " +
                                      this.props.currency +
                                      funGetFrench_Curr(
                                        item.value,
                                        1,
                                        this.props.currency
                                      )
                                  : item.label_key.includes("Tip") ||
                                    item.label_key.includes("Credit") ||
                                    // item.label_key.includes(
                                    //   "Delivery Charge"
                                    // ) ||
                                    item.label_key.includes(
                                      "Delivery Charge"
                                    ) ||
                                    item.label_key.includes("Service") ||
                                    item.label_key.includes("Fee")
                                  ? item.value.toString().includes("%")
                                    ? isRTLCheck()
                                      ? item.value + " +"
                                      : "+ " + item.value
                                    : isRTLCheck()
                                    ? this.props.currency + item.value + " +"
                                    : "+ " +
                                      this.props.currency +
                                      funGetFrench_Curr(
                                        item.value,
                                        1,
                                        this.props.currency
                                      )
                                  : this.props.currency +
                                    funGetFrench_Curr(
                                      item.value,
                                      1,
                                      this.props.currency
                                    )
                                : ""
                            }
                            label_key={item.label_key}
                            showToolTip={item.showToolTip}
                            taxable_fields={this.taxable_fields}
                            deleteCoupon={this.deleteCoupon}
                            coupon_name={item.coupon_name}
                          />
                        );
                      })
                  ) : (
                    <View />
                  )}
                </View>

                {/* PROMO CODE VIEW */}
                {this.props.navigation.state.params == undefined ||
                (this.props.navigation.state.params !== undefined &&
                  this.props.navigation.state.params.isDineOrder !==
                    undefined &&
                  this.props.navigation.state.params.isDineOrder ==
                    true) ? null : (
                  <View style={style.walletContainer}>
                    {this.cartResponse.is_apply == true ? (
                      <>
                        <View style={style.cartResponse}>
                          <EDRTLView
                            style={{ alignItems: "center", marginVertical: 10 }}
                          >
                            <Text
                              style={[style.cartResponseTextStyle, { flex: 1 }]}
                            >
                              {this.cartResponse.coupon_arrayapply.length +
                                strings("couponApplied")}
                            </Text>
                            <Icon //TEMP
                              onPress={this.clearPromo}
                              name={"close"}
                              size={getProportionalFontSize(26)}
                              color={EDColors.black}
                            />
                          </EDRTLView>
                        </View>
                        <View
                          style={{
                            height: 1,
                            backgroundColor: EDColors.separatorColorNew,
                            width: "95%",
                            alignSelf: "center",
                          }}
                        />
                        <EDRTLView style={{ alignItems: "center" }}>
                          {/* <Icon name={"local-offer"} size={16} color={EDColors.blackSecondary} style={style.discountIcon} /> */}
                          <SvgXml
                            xml={discount_icon}
                            style={{ marginHorizontal: 5 }}
                          />
                          <Text
                            style={style.promoCode}
                            onPress={this.navigateToPromoCode}
                          >
                            {strings("applyMore")}
                          </Text>
                        </EDRTLView>
                      </>
                    ) : (
                      <EDRTLView style={{ alignItems: "center" }}>
                        {/* <Icon name={"local-offer"} size={16} color={EDColors.blackSecondary} style={style.discountIcon} />
                        <SvgXml
                          xml={discount_icon}
                          style={{ marginHorizontal: 5 }}
                        />
                        <Text
                          style={style.promoCode}
                          onPress={this.navigateToPromoCode}
                        >
                          {strings("haveAPromo")}
                        </Text> */}
                      </EDRTLView>
                    )}
                  </View>
                )}

                {this.props.minOrderAmount !== undefined &&
                this.props.navigation.state.params != undefined &&
                this.props.navigation.state.params.isDineOrder !== true ? (
                  (this.cartTotal !== undefined &&
                    this.cartTotal >= Number(this.props.minOrderAmount)) ||
                  (this.props.navigation.state.params.delivery_status !==
                    undefined &&
                    this.props.navigation.state.params.delivery_status.toLowerCase() ==
                      "pickup") ? null : (
                    <View
                      style={{
                        backgroundColor: EDColors.offWhite,
                        alignItems: "center",
                        margin: 10,
                        marginBottom: 8,
                        paddingBottom: 8,
                        borderBottomColor: EDColors.separatorColorNew,
                        borderBottomWidth: 1,
                        borderRadius: 16,
                      }}
                    >
                      <Text
                        style={{
                          color: EDColors.black,
                          fontSize: getProportionalFontSize(14),
                          marginVertical: 5,
                          marginHorizontal: 5,
                          fontFamily: EDFonts.medium,
                          textAlign: "center",
                        }}
                      >
                        {isRTLCheck()
                          ? strings("minOrderMsg") +
                            this.props.currency +
                            this.props.minOrderAmount +
                            strings("minOrderMsg2")
                          : strings("minOrderMsg") +
                            this.props.currency +
                            this.props.minOrderAmount +
                            strings("minOrderMsg2")}
                      </Text>
                    </View>
                  )
                ) : null}
              </View>
            </ScrollView>

            {/* <TouchableOpacity
                            onPress={this.toggleDescription}
                            style={{ backgroundColor: EDColors.offWhite,  margin: 10, borderRadius: 16, marginTop: 0 }}> */}

            {/* <EDRTLText style={{ color: EDColors.black, fontSize: getProportionalFontSize(13), marginVertical: 5, marginHorizontal: 5, fontFamily: EDFonts.medium, }}
                                title={strings("note") + " "} /> */}
            {/* <EDRTLText */}
            <View
              style={{
                marginTop: 10,
                marginHorizontal: 10,
                marginBottom: 4,
              }}
            >
              <SeeMore
                numberOfLines={1}
                style={style.disclaimer}
                linkColor={EDColors.primary}
                linkStyle={[
                  style.disclaimer,
                  {
                    fontFamily: EDFonts.bold,
                  },
                ]}
              >
                {strings("orderDisclaimer")}
              </SeeMore>
            </View>

            {/* 
                        </TouchableOpacity> */}

            {/* CHECK OUT VIEW */}
            {/* <EDRTLView style={style.checkOutContainer}> */}
            {/* <EDRTLText style={style.totalPrice}
                                title={this.props.currency + funGetFrench_Curr(this.cartResponse.total, 1, this.props.currency)}
                            /> */}
            {/* <TouchableOpacity
                                style={style.checkoutButtonView}
                                onPress={this.fetchUpdatedCart}>
                                <Text style={style.checkoutText}>{this.placeOrderFromCheckout ? strings("placeOrder") + " (" + this.props.currency + funGetFrench_Curr(this.cartResponse.total, 1, this.props.currency) + ")" : strings("doCheckout") + " (" + this.props.currency + funGetFrench_Curr(this.cartResponse.total, 1, this.props.currency) + ")"}</Text>
                            </TouchableOpacity> */}
            {/* </EDRTLView> */}
            <EDThemeButton
              onPress={this.fetchUpdatedCart}
              label={
                this.placeOrderFromCheckout
                  ? strings("placeOrder") +
                    " (" +
                    this.props.currency +
                    funGetFrench_Curr(
                      this.cartResponse.total,
                      1,
                      this.props.currency
                    ) +
                    ")"
                  : strings("doCheckout") +
                    " (" +
                    this.props.currency +
                    funGetFrench_Curr(
                      this.cartResponse.total,
                      1,
                      this.props.currency
                    ) +
                    ")"
              }
              style={[
                style.themeButton,
                {
                  marginBottom:
                    (Platform.OS == "ios"
                      ? initialWindowMetrics.insets.bottom
                      : 0) + 5,
                },
              ]}
              textStyle={style.themeButtonText}
            />
          </View>
        ) : this.cartResponse != undefined &&
          this.cartResponse.items.length <= 0 ? (
          <View style={{ flex: 1, height: metrics.screenHeight * 0.9 }}>
            <EDPlaceholderComponent title={strings("emptyCartMsg")} />
          </View>
        ) : null}
      </BaseContainer>
    );
  }
  //#endregion

  toggleParcel = () => {
    this.setState({ isParcel: !this.state.isParcel });
  };

  onProductPress = (item) => {
    // this.selectedItem = data
    // this.setState({
    //     visible: true
    // })

    let data = JSON.parse(JSON.stringify(item));

    let quantity = 1;
    if (data.is_customize == "0") {
      let count = 0;
      let same_item_incart = this.cartResponse.items.filter((item) => {
        return item.menu_id === data.menu_id;
      });
      if (
        same_item_incart !== undefined &&
        same_item_incart !== null &&
        same_item_incart.length !== 0
      ) {
        same_item_incart.map((data) => {
          count = count + data.quantity;
        });
      }
      quantity = count;
    }
    this.props.navigation.navigate("CategoryDetailContainer", {
      refreshScreen: this.getcartDataList,
      subCategoryArray: data,
      resid: this.resId,
      content_id: this.content_id,
      currency_symbol: this.props.currency,
      ItemName: data.name,
      restaurantDetails: {
        timings: this.cartResponse.restaurant_timings,
        allow_scheduled_delivery: this.cartResponse.allow_scheduled_delivery,
      },
      quantity: quantity,
      takeToCheckout:
        this.props.navigation.state.params == undefined ||
        (this.props.navigation.state.params !== undefined &&
          this.props.navigation.state.params.isDineOrder !== undefined &&
          this.props.navigation.state.params.isDineOrder == true),
    });
  };

  //#region
  /** FEATURED ITEMS */
  renderFeaturedItems = (item) => {
    return (
      // <View style={style.featuredProductView} >
      <ProductComponent
        shouldLoadImage={true}
        currency={this.props.currency}
        data={item.item}
        allowPreOrder={this.allowPreOrder}
        addons_category_list={
          item.item.addons_category_list === undefined
            ? []
            : item.item.addons_category_list
        }
        cartData={
          this.cartResponse !== undefined &&
          this.cartResponse.items.length !== 0
            ? this.cartResponse.items
            : []
        }
        // isLoading={this.props.isLoading}
        isOpen={true}
        plusAction={() => this.onPressAddtoCartItemHandler(item.item, 1)}
        // minusItems={this.props.minusItems}
        addData={() => this.onPressAddtoCartItemHandler(item.item, 1)}
        addOneData={() => this.onPressAddtoCartItemHandler(item.item, 1)}
        onProductPress={() => this.onProductPress(item.item)}
        style={{ marginHorizontal: 5 }}
      />
      // </View>
    );
  };
  onFeaturedPress = (item) => {
    // // // OPEN THE MODAL FOR PRODUCTS DETAILS
    // debugLog("FEATURE PRESS ::::", item);
    this.selectedItem = item;
    this.setState({
      visible: true,
    });
  };

  onPressAddtoCartItemHandler = (item, qty) => {
    // this.setState({ cartLoading: true })
    console.log("onAddPress::", item);
    if (item.is_customize === "0") {
      this.storeData(item, qty);
    } else {
      if (
        this.cartResponse.items !== undefined &&
        this.cartResponse.items.length > 0
      ) {
        var repeatItem = this.cartResponse.items.filter((items) => {
          return items.menu_id == item.menu_id;
        });

        if (repeatItem.length > 0) {
          this.selectedItem = item;
          this.setState({
            isCategory: true,
            visible: false,
          });
        } else {
          this.setState({ visible: false });
          this.onResDetailsAddEvent(item);
        }
      } else {
        this.setState({ visible: false });
        this.onResDetailsAddEvent(item);
      }
    }
  };
  //#endregion

  onNewButtonHandler = () => {
    this.setState({
      isCategory: false,
    });
    this.onResDetailsAddEvent(this.selectedItem);
  };

  onRepeatButtonHandler = () => {
    this.setState({
      isCategory: false,
    });

    this.selectedArray = this.cartResponse.items.filter((items) => {
      return items.menu_id === this.selectedItem.menu_id;
    });
    this.lastSelectedData = this.selectedArray[this.selectedArray.length - 1];
    this.storeData(this.lastSelectedData, 1);
  };

  onResDetailsAddEvent = (addData) => {
    this.props.navigation.navigate("CategoryDetailContainer", {
      subCategoryArray: addData,
      resid: this.resId,
      content_id: this.content_id,
      currency_symbol: this.props.currency,
      refreshScreen: this.getcartDataList,
      restaurantDetails: {
        timings: this.cartResponse.restaurant_timings,
        allow_scheduled_delivery: this.cartResponse.allow_scheduled_delivery,
      },
      ItemName: addData.name,
      takeToCheckout:
        this.props.navigation.state.params == undefined ||
        (this.props.navigation.state.params !== undefined &&
          this.props.navigation.state.params.isDineOrder !== undefined &&
          this.props.navigation.state.params.isDineOrder == true),
    });
  };

  onDismissHandler = () => {
    this.setState({
      isCategory: false,
    });
  };

  /** RENDER CATEGORY MODEL */
  renderCategoryOrder = () => {
    return (
      <EDPopupView isModalVisible={this.state.isCategory}>
        <EDCategoryOrder
          onDismissHandler={this.onDismissHandler}
          categoryName={this.selectedItem.name}
          newButtomHandler={this.onNewButtonHandler}
          repeatButtonHandler={this.onRepeatButtonHandler}
        />
      </EDPopupView>
    );
  };

  //#region ON CLOSE EVENT HANDLER
  onDismissItemDetailHandler = () => {
    this.setState({ visible: false });
  };
  //#endregion

  //#region ITEM DETAILS
  renderItemDetails = () => {
    return (
      <EDPopupView isModalVisible={this.state.visible}>
        <EDItemDetails
          data={this.selectedItem}
          onDismissHandler={this.onDismissItemDetailHandler}
          onPress={this.onPressAddtoCartItemHandler}
          isOpen={true}
          cartData={
            this.cartResponse !== undefined &&
            this.cartResponse.items.length !== 0
              ? this.cartResponse.items
              : []
          }
          navigateToCart={this.onDismissItemDetailHandler}
          // key={this.state.key}
        />
      </EDPopupView>
    );
  };

  //#region STORE
  /** STORE DATA */
  storeData = (data, qty) => {
    var cartArray = [];
    var cartData = {};

    //demo changes
    getCartList(
      (success) => {
        // debugLog("SUCCESS ::::::", success);
        if (success != undefined) {
          cartArray = success.items;
          if (cartArray.length > 0) {
            if (success.resId == this.resId) {
              var repeatArray = cartArray.filter((item) => {
                return item.menu_id == data.menu_id;
              });

              if (repeatArray.length > 0) {
                repeatArray[repeatArray.length - 1].quantity =
                  repeatArray[repeatArray.length - 1].quantity + qty;
              } else {
                data.quantity = 1;
                cartArray.push(data);
              }

              cartData = {
                resId: this.resId,
                content_id: this.content_id,
                items: cartArray.filter((data) => data.quantity !== 0),
                coupon_name:
                  success.coupon_name.length > 0 ? success.coupon_name : "",
                cart_id: success.cart_id,
                table_id:
                  success.table_id !== undefined
                    ? success.table_id
                    : this.props.table_id,
                resName: this.resName,
                coupon_array: success.coupon_array,
              };
              // if (this.props.table_id !== undefined && this.props.table_id !== "")
              //     cartData.table_id = this.props.table_id;
              this.updateCount(cartData.items, repeatArray.length == 0);
              this.saveData(cartData);
              this.setState({
                cartData: cartData.items,
                key: this.state.key + 1,
              });
            } else {
              showValidationAlert(strings("pendingItems"));
              this.setState({
                visible: false,
              });
            }
          } else if (cartArray.length == 0) {
            //cart empty
            data.quantity = 1;
            cartData = {
              resId: this.resId,
              content_id: this.content_id,
              items: [data],
              coupon_name: "",
              cart_id: 0,
              resName: this.resName,
              coupon_array: [],
            };
            if (this.props.table_id !== undefined && this.props.table_id !== "")
              cartData.table_id = this.props.table_id;
            this.updateCount(cartData.items, true);
            this.saveData(cartData);
            this.setState({
              cartData: cartData.items,
              // visible: false,
              key: this.state.key + 1,
            });
          }
        } else {
          //cart has no data
          data.quantity = 1;
          cartData = {
            resId: this.resId,
            content_id: this.content_id,
            items: [data],
            coupon_name: "",
            cart_id: 0,
            resName: this.resName,
            coupon_array: [],
          };
          if (this.props.table_id !== undefined && this.props.table_id !== "")
            cartData.table_id = this.props.table_id;
          this.updateCount(cartData.items, true);
          this.saveData(cartData);
          this.setState({
            cartData: cartData.items,
            // visible: false,
            key: this.state.key + 1,
          });
        }
        // this.props.navigation.state.params.categoryArray = undefined
      },
      (onCartNotFound) => {
        //first time insert data
        // debugLog("onCartNotFound", onCartNotFound);
        data.quantity = 1;
        cartData = {
          resId: this.resId,
          content_id: this.content_id,
          items: [data],
          coupon_name: "",
          cart_id: 0,
          resName: this.resName,
          coupon_array: [],
        };
        if (this.props.table_id !== undefined && this.props.table_id !== "")
          cartData.table_id = this.props.table_id;
        this.updateCount(cartData.items, true);
        this.saveData(cartData);
        this.setState({
          // visible: false
          cartData: cartData.items,
          key: this.state.key + 1,
        });
      },
      (error) => {
        // debugLog("onCartNotFound", error);
      }
    );
    this.setState({ visible: false });

    // this.getcartDataList()
  };

  saveData(data) {
    // debugLog("CALLED FROM CART DATA TO SAVE :::", data);
    saveCartData(
      data,
      (success) => {},
      (fail) => {}
    );
    this.getCartData(data.items);
  }

  //#region
  /** ON PLUS CLICKED */
  onPlusEventHandler = (value, index) => {
    this.promoCode = "";
    this.promoArray = [];
    if (value > 0) {
      this.cartResponse.items[index].quantity = value;
      this.getCartData(this.cartResponse.items);
    }
  };
  //#endregion

  //#region
  /** ONMINUS CLICKED */
  onMinusEventHandler = (value, index) => {
    this.promoCode = "";
    this.promoArray = [];
    if (value > 0) {
      this.cartResponse.items[index].quantity = value;
      this.getCartData(this.cartResponse.items);
    } else if (value == 0) {
      var array = this.cartResponse.items;
      array.splice(index, 1);
      this.getCartData(array);
    }
  };
  //#endregion

  //#region
  /** ON DLEETE CLICKED */
  onDeletEventHandler = (index) => {
    this.promoCode = "";
    this.promoArray = [];
    this.deleteIndex = index;
    showDialogue(
      strings("deleteFromCart"),
      [
        {
          text: strings("dialogYes"),
          onPress: this.onYesEventHandler,
          buttonColor: EDColors.offWhite,
        },
      ],
      "",
      this.onNoEventHandler,
      strings("dialogNo"),
      true
    );
  };
  //#endregion

  //#region
  /** ON CLOASE BUTTON */
  onCloseEventHandler = () => {
    this.promoCode = "";
    this.promoArray = [];
    this.getCartData(this.cartResponse.items);
  };
  //#endregion

  //#region
  /** LEFT PRESS EVENT */
  onLeftPressEvent = () => {
    this.promoCode = "";
    this.promoArray = [];

    this.props.navigation.goBack();
  };
  //#endregion

  //#region
  /** BUTTON PRESSED EVENTS */
  onYesEventHandler = () => {
    var array = this.cartResponse.items;
    array.splice(this.deleteIndex, 1);
    this.getCartData(array);
  };

  onNoEventHandler = () => {
    this.deleteIndex = -1;
  };
  //#endregion

  //#region
  /** NAVIGATE TO PROMO CODE CONTAINER */
  navigateToPromoCode = () => {
    this.props.navigation.navigate("PromoCodeContainer", {
      promoArray: this.promoArray,
      used_coupons: this.cartResponse.coupon_arrayapply,
      getData: this.passCurrentData,
      subTotal: this.cartResponse.subtotal,
      resId: this.resId,
      order_delivery:
        this.props.navigation.state.params == undefined ||
        (this.props.navigation.state.params !== undefined &&
          this.props.navigation.state.params.isDineOrder !== undefined &&
          this.props.navigation.state.params.isDineOrder == true)
          ? "DineIn"
          : this.props.navigation.state.params.delivery_status || "",
    });
  };
  //#endregion

  clearPromo = () => {
    this.promoArray = [];
    this.getCartData(this.cartResponse.items);
  };

  fetchUpdatedCart = () => {
    this.getCartData(this.cartResponse.items, true);
  };

  //#region
  /** CHECKOUT EVENT HANDLER */
  onCheckOutEventHandler = () => {
    debugLog(
      "****************************** Vijay ****************************** onCheckOutEventHandler "
    );
    // debugLog(
    //   "****************************** Vijay ******************************   this.props.navigation.state.params.payment_option",
    //   this.props.navigation.state.params.payment_option
    // );
    // debugLog(
    //   "****************************** Vijay ******************************  this.cartResponse.price",
    //   this.cartResponse.price
    // );
    // debugLog(
    //   "****************************** Vijay ******************************  this.state.walletApplied",
    //   this.state.walletApplied
    // );

    // let tempArray =
    //   this.cartResponse.price &&
    //   this.cartResponse.price.filter((data) => {
    //     return data.label_key != "Wallet Deduction";
    //   });

    // debugLog(
    //   "****************************** Vijay ******************************  tempArray",
    //   tempArray
    // );

    // this.cartResponse.price && this.cartResponse.price.push(tempArray);
    // this.cartResponse.price = tempArray;

    // let walletDiscounttotal = this.cartResponse.price.filter((item) => {
    //   return item.label_key == "Total" && item.value;
    // });

    let walletDiscounttotal =
      this.cartResponse.price.length > 0 &&
      this.cartResponse.price.filter((item) => {
        return item.label_key == "Wallet Deduction" ? item.value : 0;
      });

    // debugLog(
    //   "****************************** Vijay ******************************  walletDiscounttotal",
    //   walletDiscounttotal
    // );
    //    debugLog(
    //     "****************************** Vijay ****************************** walletDiscounttotal",
    //     walletDiscounttotal[0].value
    //   );

    if (
      this.props.userID !== undefined &&
      this.props.userID !== null &&
      (this.props.userID !== "") &
        (this.props.phoneNumberInRedux == undefined ||
          this.props.phoneNumberInRedux == null ||
          this.props.phoneNumberInRedux == "")
    ) {
      this.props.saveIsCheckoutScreen(true);
      this.props.navigation.navigate("PhoneNumberInput", {
        social_media_id: this.props.social_media_id,
        isFacebook:
          this.props.social_media_id !== undefined &&
          this.props.social_media_id !== null &&
          this.props.social_media_id !== "",
        user_id: this.props.userID,
      });
      return;
    }
    if (this.is_unpaid) {
      if (this.props.res_id == this.resId) {
        var checkoutData = {
          address_id:
            this.props.navigation.state.params !== undefined
              ? this.props.navigation.state.params.address_id
              : 0,
          subtotal: this.cartResponse.subtotal,
          items: '{"items": ' + JSON.stringify(this.cartResponse.items) + "}",
          coupon_id: this.cartResponse.coupon_id,
          coupon_type: this.cartResponse.coupon_type,
          coupon_amount: this.cartResponse.coupon_amount,
          user_id: this.props.userID,
          // token: this.props.token,
          restaurant_id: this.resId,
          total: this.cartResponse.total,
          coupon_name: this.cartResponse.coupon_name,
          coupon_discount: this.cartResponse.coupon_discount,
          order_date: "",
          order_delivery:
            this.props.navigation.state.params == undefined ||
            (this.props.navigation.state.params !== undefined &&
              this.props.navigation.state.params.isDineOrder !== undefined &&
              this.props.navigation.state.params.isDineOrder == true)
              ? "DineIn"
              : this.props.navigation.state.params.delivery_status,
          language_slug: this.props.lan,
          // delivery_charge: this.delivery_charges,
          delivery_charge:
            this.cartResponse?.delivery_charge || this.delivery_charges,
          delivery_flag: this.props.save_order_payload?.flag,
          address_id: this.props.save_order_payload?.id,

          delivery_flag: this.props.save_order_payload?.flag,
          address_id: this.props.save_order_payload?.id,

          delivery_instructions:
            this.props.navigation !== undefined &&
            this.props.navigation.state !== undefined &&
            this.props.navigation.state.params !== undefined
              ? this.props.navigation.state.params.delivery_instructions
              : "",
          extra_comment:
            this.props.navigation !== undefined &&
            this.props.navigation.state !== undefined &&
            this.props.navigation.state.params !== undefined
              ? this.props.navigation.state.params.comment
              : "",
          is_wallet_applied: this.state.walletApplied ? 1 : 0,
          // wallet_balance:
          //   parseFloat(this.wallet_money) - parseFloat(this.wallet_discount),
          // debited_amount: this.wallet_discount,
          wallet_balance:
            parseFloat(this.wallet_money) -
            parseFloat(
              walletDiscounttotal.length > 0 ? walletDiscounttotal[0].value : 0
            ),
          debited_amount: parseFloat(
            walletDiscounttotal.length > 0 ? walletDiscounttotal[0].value : 0
          ),
          is_parcel_order: this.state.isParcel ? "1" : "0",
          driver_tip: this.cartResponse.driver_tip,
          tip_percent_val: this.cartResponse.tip_percent_val,
          is_creditcard:
            this.props.navigation.state.params !== undefined &&
            this.props.navigation.state.params.payment_option !== undefined &&
            this.props.navigation.state.params.payment_option !== "cod"
              ? "yes"
              : "no",
          is_creditcard_fee_applied:
            this.cartResponse.is_creditcard_fee_applied,
          is_service_fee_applied: this.cartResponse.is_service_fee_applied,
          service_feeval: this.cartResponse.service_feeval,
          service_fee_typeval: this.cartResponse.service_fee_typeval,
          creditcard_feeval: this.cartResponse.creditcard_feeval,
          creditcard_fee_typeval: this.cartResponse.creditcard_fee_typeval,
          service_tax_typeval: this.cartResponse.service_tax_typeval,
          service_taxval: this.cartResponse.service_taxval,
          coupon_array: JSON.stringify(this.cartResponse.coupon_arrayapply),
        };

        if (this.isPreOrder == true) {
          checkoutData.scheduled_date =
            this.props.navigation.state.params.scheduled_date;
          checkoutData.slot_open_time =
            this.props.navigation.state.params.slot_open_time;
          checkoutData.slot_close_time =
            this.props.navigation.state.params.slot_close_time;
        }

        if (this.table_id !== undefined && this.table_id !== "") {
          checkoutData.table_id = this.table_id;
          checkoutData.order_delivery = "DineIn";
        }
        this.props.saveCheckoutDetails(checkoutData);
        if (
          this.props.navigation.state.params !== undefined &&
          this.props.navigation.state.params.payment_option !== undefined
        ) {
          this.comment = this.props.navigation.state.params.comment;

          // if (this.props.navigation.state.params.payment_option == "cod")
          //   this.placeOrder();
          // else
          //   this.navigateToPaymentGateway(
          //     this.props.navigation.state.params.payment_option
          //   );

          if (
            parseInt(this.state.loggedInUserwalletBalance) >
              Number(this.props.minOrderAmount) &&
            parseInt(this.state.loggedInUserwalletBalance) >
              parseInt(this.cartResponse.total)
          ) {
            this.placeOrder();
          } else if (
            parseInt(this.state.loggedInUserwalletBalance) >
              Number(this.props.minOrderAmount) &&
            parseInt(this.state.loggedInUserwalletBalance) <
              parseInt(this.cartResponse.total)
          ) {
            this.placeOrder();
            this.payment_option == "razorpay";
            this.navigateToPaymentGateway("razorpay");
          } else {
            this.payment_option == "razorpay";
            this.navigateToPaymentGateway("razorpay");
          }
        } else
          this.props.navigation.navigate("PaymentContainer", {
            currency_code: this.currency_code,
            allowPayLater: this.allowPayLater,
            addToCartData: this.addToCartData,
            resContentId: this.content_id,
          });
      } else {
        showProceedDialogue(
          strings("payPending2"),
          [
            {
              text: strings("dialogCancel"),
              onPress: () => {},
              isNotPreferred: true,
            },
          ],
          strings("appName"),
          this.navigatetoPending
        );
      }
    } else {
      debugLog(
        "****************************** Vijay ****************************** else part this.cartResponse ****************************** ",
        this.cartResponse?.delivery_charge
      );

      // debugLog(
      //   "****************************** Vijay ****************************** else part this.cartResponse ",
      //   this.cartResponse.price
      // );

      let filterForactualTotalsubtotalTaxes =
        this.cartResponse &&
        this.cartResponse.price.filter((data) => {
          return (
            // data.label_key === "Sub Total" &&
            // data.label_key === "Delivery Charge" &&
            // data.label_key === "Tax and Fee"
            data.label_key === "Sum Total"
          );
        });

      debugLog(
        "**************************************  this.delivery_charges *******************************",
        this.delivery_charges
      );

      // let actualTotalsubtotalTaxes =
      //   filterForactualTotalsubtotalTaxes &&
      //   filterForactualTotalsubtotalTaxes.reduce(function (
      //     accumulator,
      //     currentValue
      //   ) {
      //     return accumulator + parseInt(currentValue.value);
      //   },
      //   0);

      // debugLog(
      //   "***********************************  parseInt(actualTotalsubtotalTaxes) *****************************************",
      //   parseInt(actualTotalsubtotalTaxes)
      // );

      // return false;

      var checkoutData = {
        address_id:
          this.props.navigation.state.params !== undefined
            ? this.props.navigation.state.params.address_id
            : 0,
        subtotal: this.cartResponse.subtotal,
        items: '{"items": ' + JSON.stringify(this.cartResponse.items) + "}",
        coupon_id: this.cartResponse.coupon_id,
        coupon_type: this.cartResponse.coupon_type,
        coupon_amount: this.cartResponse.coupon_amount,
        user_id: this.props.userID,
        // token: this.props.token,
        restaurant_id: this.resId,
        total: this.cartResponse.total,
        coupon_name: this.cartResponse.coupon_name,
        coupon_discount: this.cartResponse.coupon_discount,
        order_date: "",
        order_delivery:
          this.props.navigation.state.params == undefined ||
          (this.props.navigation.state.params !== undefined &&
            this.props.navigation.state.params.isDineOrder !== undefined &&
            this.props.navigation.state.params.isDineOrder == true)
            ? "DineIn"
            : this.props.navigation.state.params.delivery_status,
        language_slug: this.props.lan,
        delivery_charge:
          this.cartResponse?.delivery_charge || this.delivery_charges,
        extra_comment:
          this.props.navigation !== undefined &&
          this.props.navigation.state !== undefined &&
          this.props.navigation.state.params !== undefined
            ? this.props.navigation.state.params.comment
            : "",
        delivery_instructions:
          this.props.navigation !== undefined &&
          this.props.navigation.state !== undefined &&
          this.props.navigation.state.params !== undefined
            ? this.props.navigation.state.params.delivery_instructions
            : "",
        is_wallet_applied: this.state.walletApplied ? 1 : 0,
        // wallet_balance:
        //   parseFloat(this.wallet_money) - parseFloat(this.wallet_discount),
        // debited_amount: this.wallet_discount,
        wallet_balance:
          parseFloat(this.wallet_money) -
          parseFloat(
            walletDiscounttotal.length > 0 ? walletDiscounttotal[0].value : 0
          ),
        debited_amount: parseFloat(
          walletDiscounttotal.length > 0 ? walletDiscounttotal[0].value : 0
        ),
        is_parcel_order: this.state.isParcel ? "1" : "0",
        driver_tip: this.cartResponse.driver_tip,
        tip_percent_val: this.cartResponse.tip_percent_val,
        is_creditcard:
          this.props.navigation.state.params !== undefined &&
          this.props.navigation.state.params.payment_option !== undefined &&
          this.props.navigation.state.params.payment_option !== "cod"
            ? "yes"
            : "no",
        is_creditcard_fee_applied: this.cartResponse.is_creditcard_fee_applied,
        is_service_fee_applied: this.cartResponse.is_service_fee_applied,
        service_feeval: this.cartResponse.service_feeval,
        service_fee_typeval: this.cartResponse.service_fee_typeval,
        creditcard_feeval: this.cartResponse.creditcard_feeval,
        creditcard_fee_typeval: this.cartResponse.creditcard_fee_typeval,
        service_tax_typeval: this.cartResponse.service_tax_typeval,
        service_taxval: this.cartResponse.service_taxval,
        coupon_array: JSON.stringify(this.cartResponse.coupon_arrayapply),
      };
      if (this.table_id !== undefined && this.table_id !== "") {
        checkoutData.table_id = this.table_id;
        checkoutData.order_delivery = "DineIn";
      }

      if (this.isPreOrder == true) {
        checkoutData.scheduled_date =
          this.props.navigation.state.params.scheduled_date;
        checkoutData.slot_open_time =
          this.props.navigation.state.params.slot_open_time;
        checkoutData.slot_close_time =
          this.props.navigation.state.params.slot_close_time;
      }

      this.props.saveCheckoutDetails(checkoutData);
      // debugLog(
      //   "HERE  :::::",
      //   this.props.navigation.state.params !== undefined &&
      //     this.props.navigation.state.params.payment_option !== undefined
      // );
      if (
        this.props.navigation.state.params !== undefined &&
        this.props.navigation.state.params.payment_option !== undefined
      ) {
        this.comment = this.props.navigation.state.params.comment;
        // if (this.props.navigation.state.params.payment_option == "cod")
        //   this.placeOrder();
        // else
        //   this.navigateToPaymentGateway(
        //     this.props.navigation.state.params.payment_option
        //   );

        // debugLog(
        //   "********************************************************* else part this.payment_option",
        //   this.payment_option
        // );

        // debugLog(
        //   "********************************************************* else part this.payment_option",
        //   typeof this.payment_option
        // );

        // debugLog(
        //   "********************************************************* else part B0000000000 ",
        //   parseInt(this.state.loggedInUserwalletBalance)
        // );
        // debugLog(
        //   "********************************************************* else part B11111111111",
        //   Number(this.props.minOrderAmount)
        // );
        // debugLog(
        //   "********************************************************* else part B22222222222",
        //   filterForactualTotalsubtotalTaxes[0]?.value
        // );

        // return false;

        if (
          parseInt(this.state.loggedInUserwalletBalance) >
            Number(this.props.minOrderAmount) &&
          parseInt(this.state.loggedInUserwalletBalance) >
            filterForactualTotalsubtotalTaxes[0]?.value
        ) {
          debugLog(
            "***************************************************** else part 00000 COD paymett $$$$$$$$$$$$$$$$"
          );
          // return false;
          this.placeOrder();
        } else if (
          parseInt(this.state.loggedInUserwalletBalance) >
            Number(this.props.minOrderAmount) &&
          parseInt(this.state.loggedInUserwalletBalance) <
            filterForactualTotalsubtotalTaxes[0]?.value
        ) {
          debugLog(
            "******************************************************* else part 111111 razorpay paymett $$$$$$$$$$$"
          );
          // return false;
          this.payment_option == "razorpay";
          this.navigateToPaymentGateway("razorpay");
        } else if (
          parseInt(this.state.loggedInUserwalletBalance) >
            Number(this.props.minOrderAmount) &&
          this.payment_option == "cod"
        ) {
          this.placeOrder();
        } else if (
          parseInt(this.state.loggedInUserwalletBalance) <
            Number(this.props.minOrderAmount) ||
          this.payment_option == "razorpay"
        ) {
          debugLog(
            "************************************************** else part 22222 razorpay paymett $$$$$$$$$$$$$$$$"
          );
          // return false;
          this.payment_option == "razorpay";
          this.navigateToPaymentGateway("razorpay");
        } else {
          showDialogue("Unable To Process Payment, Try Later ");
        }
      } else
        this.props.navigation.navigate("PaymentContainer", {
          currency_code: this.currency_code,
          allowPayLater: this.allowPayLater,
          addToCartData: this.addToCartData,
          resContentId: this.content_id,
        });
    }
    // }
    //  else {
    //     this.props.navigation.navigate('PhoneNumberInput', {
    //         isAppleLogin: true
    //     })
    // }
  };

  //#endregion

  //#region ADD ORDER
  /**
   * @param { Success Reponse Object } onSuccess
   */
  onSuccessAddOrder = async (onSuccess) => {
    // debugLog("ORDER SUCCESS ::::::::::::: ", onSuccess);

    localStorage.removeItem("save_storeavailabilityData");
    localStorage.removeItem("save_order_payload");
    localStorage.removeItem("Slot_Master_Rest_Category");

    if (onSuccess.error != undefined) {
      showValidationAlert(
        onSuccess.error.message != undefined
          ? onSuccess.error.message
          : strings("generalWebServiceError")
      );
    } else {
      if (onSuccess.status == RESPONSE_SUCCESS) {
        this.resObj = onSuccess.restaurant_detail;
        this.props.saveCartCount(0);
        clearCartData(
          (response) => {
            this.props.navigation.popToTop();
            this.props.navigation.navigate("OrderConfirm", {
              isForDineIn: false,
              resObj: onSuccess.restaurant_detail,
              cashback: onSuccess.earned_wallet_money,
            });
          },
          (error) => {}
        );
      } else if (onSuccess.status == RESTAURANT_ERROR) {
        this.props.saveCartCount(0);
        clearCurrency_Symbol(
          (onSuccess) => {},
          (onfailure) => {}
        );
        clearCartData(
          (response) => {},
          (error) => {}
        );
        showDialogue(onSuccess.message, [], strings("appName"), () =>
          this.props.navigation.dispatch(
            StackActions.reset({
              index: 0,
              actions: [
                NavigationActions.navigate({
                  routeName: isRTLCheck()
                    ? "MainContainer_Right"
                    : "MainContainer",
                }),
              ],
            })
          )
        );
      } else {
        showValidationAlert(onSuccess.message);
      }
    }

    if (onSuccess.order_id != undefined) {
      let base64 = require("base-64");
      let username = "OMS_ORDER";
      let password = "OMSORDER$&";

      let dataforsaveorder = {
        order_id: onSuccess.order_id,
        // delivery_flag: this.props.save_order_payload?.flag,
        // address_id: this.props.save_order_payload?.id,
      };

      debugLog(
        ":::::::::::::::::::::::::::::::::::::::::::::::::::::::saveOrder ::::::::::onSuccess.order_id",
        dataforsaveorder
      );

      let getDeliveryChargeAPICall = await axios.post(
        "https://fis.clsslabs.com/FIS/api/auth/saveOrder",
        onSuccess.order_id,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Basic " + base64.encode(username + ":" + password),
          },
        }
      );

      if (getDeliveryChargeAPICall.status === 200) {
        debugLog(
          ":::::::::::::::::::::::::::::::::::::::::::::::::::::::saveOrder ",
          getDeliveryChargeAPICall.status
        );
        this.props.save_selected_category_home_cont(undefined);
      } else {
      }
    }

    this.setState({ isLoading: false });
  };
  //#endregion

  /**
   * @param { Failure Response Object } onFailure
   */
  onFailureAddOrder = (onfailure) => {
    showValidationAlert(strings("generalWebServiceError"));
    this.setState({ isLoading: false });
  };

  //#region
  /** PLACE ORDER API */
  placeOrder = (txn_id, payment_option = "cod") => {
    netStatus((status) => {
      let addOrderParams = this.props.checkoutDetail;
      // addOrderParams.extra_comment = this.comment
      // addOrderParams.delivery_instructions = this.driver_comment
      addOrderParams.order_date = moment(
        new Date().toLocaleString("en-US", {
          timeZone: RNLocalize.getTimeZone(),
        })
      ).format("DD-MM-YYYY hh:mm A");

      if (payment_option == "razorpay") {
        addOrderParams.transaction_id = this.razorpay_payment_id;
        addOrderParams.payment_option = payment_option;
        addOrderParams.razorpay_payment_id = this.razorpay_payment_id;
        addOrderParams.merchant_order_id = this.merchant_order_id;
      } else if (txn_id !== undefined && txn_id !== null) {
        addOrderParams.transaction_id = txn_id;
        addOrderParams.payment_option = payment_option;
      } else addOrderParams.payment_option = "cod";

      addOrderParams.isLoggedIn =
        this.props.userID !== undefined &&
        this.props.userID !== null &&
        this.props.userID !== ""
          ? 1
          : 0;

      if (
        this.props.userID == undefined ||
        this.props.userID == null ||
        this.props.userID == ""
      ) {
        addOrderParams.first_name = this.props.guestDetails.first_name;
        addOrderParams.last_name = this.props.guestDetails.last_name;
        addOrderParams.phone_number = this.props.guestDetails.phone_number;
        addOrderParams.phone_code = this.props.guestDetails.phone_code;
        addOrderParams.email = this.props.guestDetails.email;

        if (addOrderParams.order_delivery == "Delivery") {
          addOrderParams.address_input = this.props.guestAddress.address;
          addOrderParams.landmark = this.props.guestAddress.landmark;
          addOrderParams.latitude = this.props.guestAddress.latitude;
          addOrderParams.longitude = this.props.guestAddress.longitude;
          addOrderParams.zipcode = this.props.guestAddress.zipcode;
          addOrderParams.city = this.props.guestAddress.city;
          addOrderParams.state = this.props.guestAddress.state;
          addOrderParams.country = this.props.guestAddress.country;
          addOrderParams.address_label = this.props.guestAddress.address_label;
          addOrderParams.business = this.props.guestAddress.business;
        }
      }

      let startTimeendTime =
        this.props?.selected_Slot_ID?.name &&
        this.props?.selected_Slot_ID?.name.split("-");

      // let startTimes =
      //   startTimeendTime &&
      //   startTimeendTime[0] &&
      //   startTimeendTime[0].replace(/[a-zA-Z]/g, "");
      // let endstartTimes =
      //   startTimeendTime &&
      //   startTimeendTime[1] &&
      //   startTimeendTime[1].replace(/[a-zA-Z]/g, "");

      // let startTimestrimmed = startTimes && startTimes.trim();
      // let endstartTimestrimmed = endstartTimes && endstartTimes.trim();

      addOrderParams.delivery_point = this.props.save_order_payload?.id;
      addOrderParams.delivery_flag = this.props.save_order_payload?.flag;
      addOrderParams.table_id = this.props.selected_Slot_ID?.slotId;
      // addOrderParams.slot_open_time =
      //   this.props.selected_Slot_ID?.formatStartTime;
      // addOrderParams.slot_close_time =
      //   this.props.selected_Slot_ID?.formatEndTime;

      // debugLog(
      //   "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ this.props.selected_Slot_ID~~~~~~~~~~~~~~~",
      //   this.props.selected_Slot_ID
      // );

      // debugLog(
      //   "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~addOrderParams~~~~~~~~~~~~~~~ 00",
      //   this.props.save_order_payload?.id
      // );

      // debugLog(
      //   "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~addOrderParams~~~~~~~~~~~~~~~ 11",
      //   this.props.save_order_payload?.flag
      // );

      // console.log("CheckOut request :::::::::: ", JSON.stringify(addOrderParams), addOrderParams.items)
      // return;
      debugLog(
        "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~addOrderParams~~~~~~~~~~~~~~~",
        addOrderParams
      );
      // return false;

      if (status) {
        this.setState({ isLoading: true });
        addOrder(
          addOrderParams,
          this.onSuccessAddOrder,
          this.onFailureAddOrder,
          this.props,
          true
        );
      } else {
        showValidationAlert(strings("noInternet"));
      }
    });
  };
  //#endregion

  /**
   * Start Razorpay Payment
   */

  startRazorPayment = () => {
    // debugLog(
    //   "****************************** Vijay ****************************** this.razorpayDetails 6666",
    //   this.razorpayDetails
    // );

    this.merchant_order_id = Date.now();
    var options = {
      description: "Paying MLMF",
      image:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASMAAAEkCAYAAABkJVeVAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAACVRSURBVHgB7d0JfBTl/T/w7zOzm4QbRYGQDUqlrVJvjgTUirVazyq11h5/e1nxQDAHClqUIFYskAOo1qq1aq2tRw+Plp9alfpTIAE8qYqiAjk4RIQQybE7z/P/PLOzm03IhULrj3zevJadnZmdnd3MfOf7HDMjQkRERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERET0eaSEaA+YIgnhaSAeQ/DoLY4YiUqtxKRK5shWbFBGiD4FBiPqlJkoYcmWU8WTs7HFnIpw8wWMTvfDTmILUrIT/7+McY/i+VFVJJuEaA8wGFGHkAmdgwAzD1vKcDxewfAzeH5dtKwXFwEoipm0DJA0+SKmfRWvThebMYncjml/Rub0iWyWD9SdskuIOsBgRLtBALLFsOPxOAUBphBbyRPIjWbK9fKGUh0Xw/De3pj/B5hrJl5mSrzYZrOm/8XjHjweR9YUE6JWGIzIZ0qkB2p+foDBn+FxnB2FreN9/F+GsHJXZ0Fot+XNlAje/1e86wm8fBvDF+LZZllvIaP6kbpR3hCiFAxGJOYmGYkgcT8eh+DlXxAsHkY19UvygdSheBWVT8nPkkQWIphdYoOZmSGHYbm3Y6sbjdzobDVblglRwBHq1swv5Gi/HsigDkjkSBShfqhukCfVdfIxClmT5DPAsuoQdJ6UWX5xTdTN8h6ezsVnPY2g9HuTj2yMKMBg1I2Za1GUiskjCA7LpUbOQ/BYl5xms2YlX5LPajaKatLcsobPaMLTFHzAIOknE4QowGDUTaEI9XXphSBkZAiylMt2K44VobCm5FDTxaK8uVBcM97v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Fyf75CgUioxMQuvXP9r+nJz7MP2HeIxFAOr0/LfPk4LIqAtQ4/IofqOr8RstFNqvMRj9B7S+PK2tAA2HmypsmoEAMWwPF+dnArW1vZH2+5fhiDNyrxeV0gVbyl+3t5EO9VJF8XovOR2V6qtKqyrGy/8htqK4lxt6Cet/QKOYkWyB2v8xGP0HoDj1tHFkOCp016NFJYS6lCNRke3pJif3s7SuXD0k95towl4gKvUKlLY1T9m6I7+ZGn/gGi+mTvi8X3sZRcZfYV0vQFF0jbK1TfZ8L6P6aFedUbZh+T65qQF9vjAY7WP2om3KkRZ1J9jTXnd07KLijav2qFdxW2zfGJ2W9mPUqNsrMLbKstRqtPdfYE9elc+xwuxxo43xKlLHoSVzjWP0JfNqVr4k1C0wGO1jfpN42JyFnWsgjvoNqLx9Odbro3/tixMl/fokV59ve1Z6jvNGQyz2TJunqnzOxK8C6ZyDyupDUdyMxpS8ecAu9eysbeW1QkREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREe+r/A6oAvqKJBlvwAAAAAElFTkSuQmCC",
      currency: this.currency_code,
      key:
        this.razorpayDetails.enable_live_mode == "1"
          ? this.razorpayDetails.live_publishable_key
          : this.razorpayDetails.test_publishable_key, // Your api key
      amount: (Number(this.cartResponse.total).toFixed(2) * 100).toFixed(0),
      name: "MLMF",
      // order_id :
      prefill: {
        email:
          this.props.userID == undefined ||
          this.props.userID == null ||
          this.props.userID == ""
            ? this.props.guestDetails.email
            : this.props.email,
        contact:
          this.props.userID == undefined ||
          this.props.userID == null ||
          this.props.userID == ""
            ? this.props.guestDetails.phone_number
            : this.props.phoneNumber,
        name:
          this.props.userID == undefined ||
          this.props.userID == null ||
          this.props.userID == ""
            ? this.props.guestDetails.first_name +
              " " +
              this.props.guestDetails.last_name
            : this.props.firstName + " " + this.props.lastName,
      },
      theme: { color: EDColors.primary },
      note: {
        merchant_order_id: this.merchant_order_id,
      },
    };
    RazorpayCheckout.open(options)
      .then((data) => {
        // handle success
        // debugLog("Payment success ::::::", data);
        this.razorpay_payment_id = data.razorpay_payment_id;
        this.placeOrder(data.razorpay_payment_id, "razorpay");
      })
      .catch((error) => {
        // handle failure

        if (error.code !== 0) {
          setTimeout(() => {
            showValidationAlert(error.description);
          }, 500);
        }
        // alert(JSON.parse(error.description).error.description)
        // debugLog(
        //   "Payment failure ::::::",
        //   JSON.parse(error.description).error.description
        // );
      });
  };

  /**
   * Start Stripe Payment
   */
  startStripePayment = () => {
    netStatus((status) => {
      if (status) {
        var params = {};
        this.setState({ isLoading: true });
        if (this.cardData !== undefined) {
          params = {
            language_slug: this.props.lan,
            exp_month: this.cardData.values.expiry.substring(0, 2),
            exp_year: this.cardData.values.expiry.substring(3, 5),
            card_number: this.cardData.values.number,
            cvc: this.cardData.values.cvc,
            amount: parseFloat(this.cartResponse.total).toFixed(2) * 100,
            // amount: parseFloat(this.checkoutDetail.total),
            currency: this.currency_code,
            user_id: this.props.userID,
            payment_method: "stripe",
            save_card_flag: this.isCardSave ? 1 : 0,
            is_default_card: this.isDefaultCard ? 1 : 0,
            country_code: this.countryCode,
            zipcode: this.cardData.values.postalCode,
            isLoggedIn:
              this.props.userID !== undefined &&
              this.props.userID !== null &&
              this.props.userID !== ""
                ? 1
                : 0,
          };
        } else if (this.selectedCard !== undefined) {
          params = {
            language_slug: this.props.lan,
            amount: parseFloat(this.cartResponse.total).toFixed(2) * 100,
            currency: this.currency_code,
            payment_method: "stripe",
            user_id: this.props.userID,
            payment_method_id: this.selectedCard.id,
            isLoggedIn: 1,
          };
        } else {
          this.setState({ isLoading: false });
          showValidationAlert(strings("generalWebServiceError"));
          return;
        }
        createPaymentMethod(
          params,
          this.onPaymentMethodSuccess,
          this.onPaymentMethodFailure,
          this.props
        );
      } else {
        showNoInternetAlert();
      }
    });
  };
  /**
   * On payment method success
   */
  onPaymentMethodSuccess = (onSuccess) => {
    // debugLog("ONSUCCESS::::::::", onSuccess);
    if (onSuccess.status == RESPONSE_SUCCESS) {
      if (onSuccess.stripe_response.error !== undefined) {
        showValidationAlert(
          (onSuccess.message !== undefined
            ? onSuccess.message
            : strings("paymentFail")) +
            "\n\n" +
            onSuccess.stripe_response.error.message
        );
        this.setState({ isLoading: false });
      } else if (onSuccess.stripe_response.status == "succeeded") {
        // debugLog("Payment Sucessful without 3d secure authentication ::::::");
        this.txn_id = onSuccess.stripe_response.id;
        this.placeOrder(onSuccess.stripe_response.id, "stripe");
        this.setState({ isLoading: false });
      } else if (
        onSuccess.stripe_response.next_action.redirect_to_url.url !== undefined
      ) {
        // debugLog("Redirecting for 3d secure authentication ::::::");
        this.txn_id = onSuccess.stripe_response.id;
        this.setState({
          url: onSuccess.stripe_response.next_action.redirect_to_url.url,
          isLoading: false,
        });
      }
    } else {
      this.setState({ isLoading: false });
      showDialogue(onSuccess.message, [], "", () => {});
    }
  };
  /**
   * On payment method failure
   */
  onPaymentMethodFailure = (onFailure) => {
    // debugLog("FAILURE :::::", onFailure);
    showDialogue(strings("paymentFail"), [], "", () => {
      if (this.isWithSavedCard) {
        this.onYesClick();
      }
    });

    this.setState({ isLoading: false });
  };

  navigateToPaymentGateway = (valuefromDynamicPricde) => {
    // debugLog(
    //   "****************************** Vijay ****************************** this.payment_option 55555",
    //   valuefromDynamicPricde
    // );

    // if (this.payment_option == "stripe") {
    if (valuefromDynamicPricde == "stripe") {
      // if (this.props.userID !== undefined && this.props.userID !== null && this.props.userID !== "")
      //     this.props.navigation.navigate("savedCards", {
      //         "currency_code": this.currency_code,
      //         isPendingAdded: false,
      //         pendingTotalPayment: this.cartResponse.total,
      //         extra_comment: this.comment,
      //         delivery_instructions: this.driver_comment,
      //         completeAddress: this.props.navigation.state.params.completeAddress,
      //         isForSelection: true

      //     })
      // else
      //     this.props.navigation.navigate("StripePaymentContainer", {
      //         "currency_code": this.currency_code,
      //         isPendingAdded: false,
      //         pendingTotalPayment: this.cartResponse.total,
      //         extra_comment: this.comment,
      //         delivery_instructions: this.driver_comment,
      //         completeAddress: this.props.navigation.state.params.completeAddress,
      //         isWithSavedCard: false,
      //         isForSelection: true
      //     })
      this.startStripePayment();
      // } else if (this.payment_option == "razorpay") {
    } else if (valuefromDynamicPricde == "razorpay") {
      // debugLog(
      //   "****************************** Vijay ****************************** this.payment_option 444",
      //   this.payment_option
      // );

      this.startRazorPayment();
      // } else if (this.payment_option == "paypal")
    } else if (valuefromDynamicPricde == "paypal")
      this.props.navigation.navigate("PaymentGatewayContainer", {
        currency_code: this.currency_code,
        isPendingAdded: false,
        pendingTotalPayment: this.cartResponse.total,
        extra_comment: this.comment,
        delivery_instructions: this.driver_comment,
      });
  };

  //#region
  /** BACK PRESS EVENT */
  handleBackPress = () => {
    this.promoCode = "";
    this.promoArray = [];

    this.getCartData(this.cartResponse.items);
    this.props.navigation.goBack();
    return true;
  };
  //#endregion

  //#region ADD TO CART API
  /**
   *
   * @param {Success Response Object } onSuccess
   */
  onSuccessAddCart = (onSuccess) => {
    debugLog(
      "********************************** onSuccess ********************************** 1111111111111111 onSuccessAddCart",
      onSuccess
    );

    // debugLog(
    //   "********************************** onSuccess ********************************** 333333333333  onSuccessAddCart",
    //   onSuccess.total
    // );

    if (onSuccess.error != undefined) {
      showValidationAlert(
        onSuccess.error.message != undefined
          ? onSuccess.error.message
          : strings("generalWebServiceError")
      );
    } else {
      if (onSuccess.status == RESPONSE_SUCCESS) {
        this.props.saveCartPrice(onSuccess.subtotal);
        this.setTipArray(
          onSuccess.tip_percent_val,
          onSuccess.driver_tip,
          onSuccess.driver_tiparr
        );

        this.wallet_money = onSuccess.wallet_money;
        this.isRedeem = onSuccess.is_redeem;
        this.subTotal = onSuccess.subtotal;
        this.max_used_QR = onSuccess.min_redeem_point_order;
        this.minimum_subtotal = onSuccess.minimum_subtotal;

        let tempArray = onSuccess.price.filter((data) => {
          return data.label_key == "Wallet Deduction";
        });

        let walletDiscounttotal = onSuccess.price.filter((item) => {
          return item.label_key == "Total" && item.value;
        });

        if (tempArray.length !== 0) {
          // debugLog(
          //   "****************************** Vijay ****************************** tempArray.length ",
          //   tempArray.length
          // );
          this.wallet_discount = tempArray[0].value;
          // this.wallet_discount =  walletDiscounttotal[0].value;
        } else {
          // debugLog(
          //   "****************************** Vijay ****************************** tempArray.length ",
          //   tempArray.length
          // );
          this.setState({ walletApplied: false });
          this.wallet_discount = 0;
        }

        this.delivery_charges = onSuccess.delivery_charge;
        this.currency_code = onSuccess.currency_code;
        this.table_id = onSuccess.table_id;
        this.allowPayLater = onSuccess.pay_later;

        let deliveryJson = onSuccess;

        if (deliveryJson) {
          let deliveryPrice = deliveryJson.price;

          let total =
            deliveryPrice &&
            deliveryPrice.filter((item) => {
              return item.label_key == "Total";
            });
          let subtotal =
            deliveryPrice &&
            deliveryPrice.filter((item) => {
              return item.label_key == "Sub Total";
            });
          let ServiceTaxtotal =
            deliveryPrice &&
            deliveryPrice.filter((item) => {
              return item.label_key == "Service Tax";
            });

          let price_delivery_charge =
            deliveryPrice &&
            deliveryPrice.filter((item) => {
              return item?.label_key == "Delivery Charge";
            });

          if (ServiceTaxtotal && ServiceTaxtotal.length > 0) {
            ServiceTaxtotal[0].value = Math.round(ServiceTaxtotal[0].value);
          }

          // push individual Delivery Charge

          let findmenucount = [
            ...new Set(onSuccess?.items.map((item) => item.menu_avail)),
          ];
          let findmenucount222 = [
            ...new Set(findmenucount.flatMap((s) => s.split(","))),
          ];

          // old  delivery balane based on indivdual order

          // findmenucount222 &&
          //   findmenucount222.map((items) => {
          //     onSuccess.price &&
          //       onSuccess.price.push({
          //         label: `${items} Delivery Charge`,
          //         label_key: `${items} Delivery Charge`,
          //         value: this.props.dunzo_Delivery_Amount,
          //       });
          //   });

          findmenucount222 &&
            findmenucount222.map((items, i) => {
              i == 0 &&
                onSuccess.price &&
                onSuccess.price.push({
                  label: `${this?.props?.selected_category_id_home_cont?.categoryName} Delivery Charge`,
                  label_key: `${this?.props?.selected_category_id_home_cont?.categoryName} Delivery Charge`,
                  // label: "Delivery Charge",
                  // label_key: "Delivery Charge",
                  value: this?.props?.dunzo_Delivery_Amount,
                });
            });

          // debugLog(
          //   "****************************** Vijay ****************************** price_delivery_charge 00000",
          //   price_delivery_charge
          // );

          let menuAvailabilityArray = [
            ...new Set(deliveryJson.items.map((item) => item?.menu_avail)),
          ];

          // array string to object
          // let menuAvailabilityArrayObj = menuAvailabilityArray.map((name) => ({
          //   label: `Delivery Charge for ${name}`,
          //   label_key: `Delivery Charge for ${name}`,
          //   value: price_delivery_charge[0].value,
          // }));
          // deliveryPrice.push(...menuAvailabilityArrayObj);

          // debugLog(
          //   "****************************** Vijay ****************************** if this.props.dunzo_Delivery_Amount",
          //   this.props.dunzo_Delivery_Amount
          // );

          if (this.props.dunzo_Delivery_Amount >= 0) {
            debugLog(
              "****************************** Vijay ****************************** if block this.props.dunzo_Delivery_Amount",
              this.props.dunzo_Delivery_Amount
            );

            price_delivery_charge[0].value =
              menuAvailabilityArray.length > 0
                ? this.props.dunzo_Delivery_Amount *
                  // menuAvailabilityArray.length
                  1
                : this.props.dunzo_Delivery_Amount;

            deliveryJson["delivery_charge"] =
              menuAvailabilityArray.length > 0
                ? this.props.dunzo_Delivery_Amount *
                  // menuAvailabilityArray.length
                  1
                : this.props.dunzo_Delivery_Amount;

            this.delivery_charges =
              menuAvailabilityArray.length > 0
                ? this.props.dunzo_Delivery_Amount *
                  // menuAvailabilityArray.length
                  1
                : this.props.dunzo_Delivery_Amount;

            // deliveryJson?.delivery_charge =   menuAvailabilityArray.length > 0
            // ? this.props.dunzo_Delivery_Amount *
            //   menuAvailabilityArray.length
            // : this.props.dunzo_Delivery_Amount;
          } else {
            debugLog(
              "****************************** Vijay ****************************** else .dunzo_Delivery_Amount",
              price_delivery_charge
            );

            price_delivery_charge[0].value =
              menuAvailabilityArray.length > 0
                ? price_delivery_charge[0].value * 1
                : //  menuAvailabilityArray.length
                  price_delivery_charge[0].value;
          }

          // total[0].value =
          //   subtotal[0].value +
          //   ServiceTaxtotal[0].value +
          //   price_delivery_charge[0].value;

          // debugLog(
          //   "****************************** Vijay ****************************** else .33333333333",
          //   price_delivery_charge
          // );

          let intialTotalCountvalue =
            subtotal[0].value +
            ServiceTaxtotal[0].value +
            price_delivery_charge[0].value;

          if (
            parseInt(this.state.loggedInUserwalletBalance) >
              Number(this.props.minOrderAmount) &&
            parseInt(this.state.loggedInUserwalletBalance) >
              parseInt(intialTotalCountvalue)
          ) {
            total[0].value = parseInt(intialTotalCountvalue);
          } else if (
            parseInt(this.state.loggedInUserwalletBalance) >
              Number(this.props.minOrderAmount) &&
            parseInt(this.state.loggedInUserwalletBalance) <
              parseInt(intialTotalCountvalue)
          ) {
            let loggedInUserwalletBalanceint =
              parseInt(intialTotalCountvalue) -
              parseInt(this.state.loggedInUserwalletBalance);
            total[0].value = parseInt(loggedInUserwalletBalanceint);
          } else {
            total[0].value = parseInt(intialTotalCountvalue);
          }

          // gather if  label_key Wallet Discount available in array

          // let WalletDiscounttotal =
          // parseInt(this.state.loggedInUserwalletBalance) > Number(this.props.minOrderAmount) &&
          // deliveryPrice.filter((item) => {
          //   return item.label_key == "Wallet Deduction";
          // });
          // if (WalletDiscounttotal.length > 0) {
          //   let walletvaluebasedonActualTotal =
          //     subtotal[0].value +
          //     ServiceTaxtotal[0].value +
          //     price_delivery_charge[0].value;
          //   if (
          //     parseInt(this.state.loggedInUserwalletBalance) <
          //     parseInt(walletvaluebasedonActualTotal)
          //   ) {
          //     WalletDiscounttotal[0].value = parseInt(
          //       this.state.loggedInUserwalletBalance
          //     );
          //   } else {
          //     WalletDiscounttotal[0].value = parseInt(
          //       walletvaluebasedonActualTotal
          //     );
          //   }

          //   // let loggedInUserwalletBalanceint = parseInt(
          //   //   this.state.loggedInUserwalletBalance
          //   // );
          //   // let totaintialvalue = parseInt(
          //   //   subtotal[0].value +
          //   //     ServiceTaxtotal[0].value +
          //   //     price_delivery_charge[0].value
          //   // );
          //   // WalletDiscounttotal[0].value =
          //   //   loggedInUserwalletBalanceint - totaintialvalue;
          // }

          // deliveryJson.total = total[0].value;
          if (
            // parseInt(total[0].value)
            Number(this.props.minOrderAmount) <
            parseInt(this.state.loggedInUserwalletBalance)
          ) {
            deliveryJson.total = total[0].value;
            // deliveryJson.total = 0;
            // this.getcartDataList();
            this.setState({ walletApplied: true });
          } else if (
            // parseInt(total[0].value) >
            // parseInt(this.state.loggedInUserwalletBalance)
            Number(this.props.minOrderAmount) >
            parseInt(this.state.loggedInUserwalletBalance)
          ) {
            deliveryJson.total = total[0].value;
            this.setState({ walletApplied: false });
          }

          if (tempArray.length == 0) {
            // debugLog(
            //   "****************************** Vijay ****************************** tempArray.length",
            //   tempArray.length
            // );
            if (
              parseInt(this.state.loggedInUserwalletBalance) >
                Number(this.props.minOrderAmount) &&
              parseInt(this.state.loggedInUserwalletBalance) >
                parseInt(intialTotalCountvalue)
            ) {
              const pushtoPriceForwallet = {
                label: "Wallet Deduction",
                label_key: "Wallet Deduction",
                value: parseInt(intialTotalCountvalue),
              };
              onSuccess.price && onSuccess.price.push(pushtoPriceForwallet);
              this.wallet_discount = parseInt(intialTotalCountvalue);
              this.setState({ walletApplied: true });
              onSuccess.is_redeem == true;
            } else if (
              parseInt(this.state.loggedInUserwalletBalance) >
                Number(this.props.minOrderAmount) &&
              parseInt(this.state.loggedInUserwalletBalance) <
                parseInt(intialTotalCountvalue)
            ) {
              const pushtoPriceForwallet = {
                label: "Wallet Deduction",
                label_key: "Wallet Deduction",
                value: parseInt(this.state.loggedInUserwalletBalance),
              };
              onSuccess.price && onSuccess.price.push(pushtoPriceForwallet);
              this.wallet_discount = parseInt(
                this.state.loggedInUserwalletBalance
              );
              this.setState({ walletApplied: true });
              onSuccess.is_redeem == true;
            } else {
              this.setState({ walletApplied: false });
              onSuccess.is_redeem == false;
              let tempArray = onSuccess.price.filter((data) => {
                return data.label_key != "Wallet Deduction";
              });
              onSuccess.price = tempArray;
              // const pushtoPriceForwallet = {
              //   label: "Wallet Deduction",
              //   label_key: "Wallet Deduction",
              //   value: 0,
              // };
              // onSuccess.price && onSuccess.price.push(pushtoPriceForwallet);
            }
          }

          const uitotal = {
            label: "Sum Total",
            label_key: "Sum Total",
            value: parseInt(intialTotalCountvalue),
          };

          if (
            parseInt(this.state.loggedInUserwalletBalance) <
            Number(this.props.minOrderAmount)
          ) {
            // onSuccess.price && onSuccess.price.push(uitotal);
            onSuccess.price &&
              onSuccess.price.splice(onSuccess.price.length, 0, uitotal);
          } else {
            // onSuccess.price && onSuccess.price.push(uitotal);
            onSuccess.price &&
              onSuccess.price.splice(onSuccess.price.length - 1, 0, uitotal);
          }

          // debugLog(
          //   "********************************** onSuccess ********************************** onSuccess?.items ",
          //   onSuccess?.items
          // );

          debugLog(
            "********************************** onSuccess ********************************** deliveryJson",
            deliveryJson
          );
          // push Wallet Discount to price array
          this.updateUI(deliveryJson);
        }
      } else if (onSuccess.status !== COUPON_ERROR) {
        this.updateUI(onSuccess);
        showValidationAlert(onSuccess.message);
      } else {
        showValidationAlert(onSuccess.message);
      }
    }
    this.setState({ isLoading: false, key: this.state.key + 1 });
  };

  /**
   *
   * @param {Failure REsponse Object} onFailure
   */
  onFailureAddCart = (onFailure) => {
    this.setState({ isLoading: false, key: this.state.key + 1 });
    if (onFailure.status == RESTAURANT_ERROR) {
      this.props.saveCartCount(0);
      clearCurrency_Symbol(
        (onSuccess) => {},
        (onfailure) => {}
      );
      clearCartData(
        (response) => {},
        (error) => {}
      );
      showDialogue(onFailure.message, [], strings("appName"), () =>
        this.props.navigation.dispatch(
          StackActions.reset({
            index: 0,
            actions: [
              NavigationActions.navigate({
                routeName: isRTLCheck()
                  ? "MainContainer_Right"
                  : "MainContainer",
              }),
            ],
          })
        )
      );
    } else
      showValidationAlert(
        onFailure.message != undefined
          ? onFailure.message
          : strings("generalWebServiceError")
      );
  };

  /**
   *
   * @param { Item to be added to Cart } items
   */
  getCartData = (items, forCartFetch = false) => {
    // debugLog(
    //   "***************************************getCartData  items",
    //   items
    // );

    // return false;

    netStatus((status) => {
      if (status) {
        this.forCartFetch = forCartFetch;
        this.setState({ isLoading: true });

        var objItems = { items: items };
        this.cartLength = items.length;

        let objAddToCart = {
          language_slug: this.props.lan,
          user_id: this.props.userID || "",
          restaurant_id: this.resId,
          items: objItems,
          cart_id: this.cart_id,
          // coupon: this.promoCode,
          coupon_array: this.promoArray,
          order_delivery:
            this.props.navigation.state.params == undefined ||
            (this.props.navigation.state.params !== undefined &&
              this.props.navigation.state.params.isDineOrder !== undefined &&
              this.props.navigation.state.params.isDineOrder == true)
              ? "DineIn"
              : this.props.navigation.state.params.delivery_status,
          latitude:
            this.props.navigation.state.params == undefined
              ? this.latitude
              : this.props.navigation.state.params.latitude,
          longitude:
            this.props.navigation.state.params == undefined
              ? this.longitude
              : this.props.navigation.state.params.longitude,
          is_wallet_applied: this.state.walletApplied ? 1 : 0,
          earning_points: this.wallet_money,
          driver_tip: this.tip !== 0 && this.isCustom ? this.tip : "",
          tip_percent_val: this.tip !== 0 && !this.isCustom ? this.tip : "",
          is_creditcard:
            this.props.navigation.state.params !== undefined &&
            this.props.navigation.state.params.payment_option !== undefined &&
            this.props.navigation.state.params.payment_option !== "cod"
              ? "yes"
              : "no",
          isLoggedIn:
            this.props.userID !== undefined &&
            this.props.userID !== null &&
            this.props.userID !== ""
              ? 1
              : 0,
        };

        if (this.table_id !== undefined && this.table_id !== "")
          objAddToCart.table_id = this.table_id;

        if (this.isPreOrder == true) {
          objAddToCart.scheduled_date =
            this.props.navigation.state.params.scheduled_date;
          objAddToCart.slot_open_time =
            this.props.navigation.state.params.slot_open_time;
          objAddToCart.slot_close_time =
            this.props.navigation.state.params.slot_close_time;
        }

        let tempArray =
          objAddToCart.price &&
          objAddToCart.price.filter((data) => {
            return data.label_key != "Wallet Deduction";
          });

        // objAddToCart.price = tempArray;

        this.addToCartData = objAddToCart;

        debugLog(
          "***************************************  11111111111111  this.addToCartData",
          this.addToCartData
        );

        // debugLog(
        //   "***************************************  4444444444444444444  objAddToCart",
        //   objAddToCart
        // );

        // debugLog(
        //   "***************************************  00000000000000000 is_wallet_applied",
        //   this.state.walletApplied
        // );

        // return false;
        addToCart(
          objAddToCart,
          this.onSuccessAddCart,
          this.onFailureAddCart,
          this.props
        );
      } else {
        showValidationAlert(strings("noInternet"));
      }
    });
  };
  //#endregion
  setTipArray = (driver_tip_percentage, driver_tip, driver_tiparr) => {
    this.tipsArray = driver_tiparr.map((v) => ({
      value: v,
      selected: driver_tip_percentage == v ? true : false,
    }));
    if (
      driver_tip_percentage !== undefined &&
      driver_tip_percentage !== null &&
      driver_tip_percentage == ""
    ) {
      this.setState({ customTip: driver_tip });
    }
  };
  //#region

  /** PASS DATA FUNCTION */
  passCurrentData = (data) => {
    this.promoArray = data;
    this.promoCode = data;
    this.getCartData(this.cartResponse.items);
  };
  //#endregion

  /** DELETE ONE COUPON */
  deleteCoupon = (coupon_name) => {
    this.promoArray = this.promoArray.filter((data) => data !== coupon_name);
    this.getCartData(this.cartResponse.items);
  };
  //#endregion

  //#region
  /** GET LIST FROM ASYNC */
  getcartDataList = () => {
    this.setState({ isLoading: true });
    if (
      this.props.navigation.state.params !== undefined &&
      this.props.navigation.state.params.payment_option !== undefined
    ) {
      this.placeOrderFromCheckout = true;
    }
    getCartList(
      (success) => {
        this.resId = success.resId;
        this.resName = success.resName;
        this.content_id = success.content_id;
        this.promoCode = success.coupon_name;
        this.promoArray = success.coupon_array;
        this.cart_id = success.cart_id;
        this.table_id = success.table_id;
        this.state.isAsyncSync = true;
        this.cartLength = success.items.length;
        this.oldItems = success.items.map((data) => data.name);
        this.getCartData(success.items);
        this.setState({ isLoading: false });
      },
      (emptyList) => {
        this.cartResponse = { items: [] };
        this.setState({ isAsyncSync: true, isLoading: false });
        showDialogue(strings("emptyCartMsg"), [], "", () => {
          this.props.navigation.dispatch(
            StackActions.reset({
              index: 0,
              actions: [
                NavigationActions.navigate({
                  routeName: isRTLCheck()
                    ? "MainContainer_Right"
                    : "MainContainer",
                }),
              ],
            })
          );
        });
      },
      (error) => {
        this.cartResponse = { items: [] };
        this.setState({ isAsyncSync: true, isLoading: false });
        showDialogue(strings("emptyCartMsg"), [], "", () => {
          this.props.navigation.dispatch(
            StackActions.reset({
              index: 0,
              actions: [
                NavigationActions.navigate({
                  routeName: isRTLCheck()
                    ? "MainContainer_Right"
                    : "MainContainer",
                }),
              ],
            })
          );
        });
      }
    );
  };
  //#endregion

  navigatetoPending = () => {
    this.props.navigation.popToTop();
    this.props.navigation.navigate("PendingOrders");
  };

  //#region
  /** UPDATE UI */
  updateUI(response) {
    this.cartResponse = response;
    this.cartResponse.price = this.cartResponse.price.filter((data) => {
      return data.label_key !== undefined;
    });
    if (
      this.cartResponse.price !== undefined &&
      this.cartResponse.price !== null &&
      this.cartResponse.price instanceof Array
    ) {
      this.taxable_fields = this.cartResponse.price.filter((data) => {
        return (
          data.label_key !== undefined &&
          (data.label_key.toLowerCase().includes("fee") ||
            data.label_key.toLowerCase().includes("tax"))
        );
      });
      let taxable_fields = this.taxable_fields;
      this.cartResponse.price = this.cartResponse.price.filter(function (data) {
        return !taxable_fields.includes(data);
      });
      let total_taxes = 0;
      if (taxable_fields.length !== 0) {
        taxable_fields.map((data) => {
          total_taxes = total_taxes + Number(data.value);
        });
      }
      // this.cartResponse.price.splice(this.cartResponse.price.length - 2, 0, {
      //   label: strings("taxes&Fees"),
      //   value: total_taxes.toFixed(2),
      //   label_key: "Tax and Fee",
      //   showToolTip: true,
      // });

      if (
        parseInt(this.state.loggedInUserwalletBalance) <
        Number(this.props.minOrderAmount)
      ) {
        this.cartResponse.price.splice(this.cartResponse.price.length - 1, 0, {
          label: strings("taxes&Fees"),
          value: total_taxes.toFixed(2),
          label_key: "Tax and Fee",
          showToolTip: true,
        });
      } else {
        this.cartResponse.price.splice(this.cartResponse.price.length - 2, 0, {
          label: strings("taxes&Fees"),
          value: total_taxes.toFixed(2),
          label_key: "Tax and Fee",
          showToolTip: true,
        });
      }
    }
    this.cart_id = response.cart_id;
    this.table_id = response.table_id;
    this.cartLength_updated = response.items.length;
    this.cartTotal = response.subtotal;
    if (response.unpaid_orders == "1") this.is_unpaid = true;
    else this.is_unpaid = false;

    if (response.unpaid_orders_status == "1") this.unpaid_orders_status = false;
    else this.unpaid_orders_status = true;

    // FEATURED ITEMS TO BE SHOWN
    if (
      response.menu_suggestion !== undefined &&
      response.menu_suggestion !== null &&
      response.menu_suggestion.length !== 0
    ) {
      let featured_items = response.menu_suggestion;
      this.featured_items = response.menu_suggestion;
      this.featured_items.map((data) => {
        this.featured_items_image.push({ image: data.image });
      });
      this.featured_items = featured_items.filter((data) => {
        return !response.items
          .map((itemToIterate) => itemToIterate.menu_id)
          .includes(data.menu_id);
      });
    } else {
      this.featured_items = [];
    }

    if (
      this.cartLength_updated !== 0 &&
      this.cartLength !== this.cartLength_updated
    ) {
      let newItems = response.items.map((data) => data.name);
      this.removedItems = this.oldItems.filter(
        (item_name) => !newItems.includes(item_name)
      );
      showValidationAlert(strings("cartUpdated"));
    }

    var updatedCart = {
      resId: this.resId,
      content_id: this.content_id,
      items: response.items,
      coupon_name: response.coupon_name,
      cart_id: response.cart_id,
      table_id: response.table_id,
      resName: this.resName,
      coupon_array: response.coupon_array,
    };

    saveCartData(
      updatedCart,
      (success) => {},
      (fail) => {}
    );
    if (response.items.length == 0) {
      this.props.saveCartCount(0);
      clearCurrency_Symbol(
        (onSuccess) => {},
        (onfailure) => {}
      );
      clearCartData(
        (response) => {},
        (error) => {}
      );
      if (this.cartLength !== 0) {
        showDialogue(
          strings("itemsUnavailable"),
          [],
          strings("appName"),
          () => {
            this.props.navigation.dispatch(
              StackActions.reset({
                index: 0,
                actions: [
                  NavigationActions.navigate({
                    routeName: isRTLCheck()
                      ? "MainContainer_Right"
                      : "MainContainer",
                  }),
                ],
              })
            );
          }
        );
      } else {
        this.props.navigation.dispatch(
          StackActions.reset({
            index: 0,
            actions: [
              NavigationActions.navigate({
                routeName: isRTLCheck()
                  ? "MainContainer_Right"
                  : "MainContainer",
              }),
            ],
          })
        );
      }
    } else {
      if (this.forCartFetch) {
        if (this.totalPrice == response.total) this.onCheckOutEventHandler();
        else
          showDialogue(
            strings("cartUpdatedPrice"),
            [
              {
                text: strings("placeOrder"),
                onPress: this.onCheckOutEventHandler,
                buttonColor: EDColors.offWhite,
              },
            ],
            "",
            () => {},
            strings("reviewCart"),
            true
          );
      }
      this.forCartFetch = false;
      this.totalPrice = response.total;
      this.updateCount(response.items);
    }
  }
  //#endregion

  updateCount(data) {
    var count = 0;
    data.map((item, index) => {
      count = count + item.quantity;
    });
    this.props.saveCartCount(count);
  }
}

export default connect(
  (state) => {
    return {
      userID: state.userOperations.userIdInRedux,
      token: state.userOperations.phoneNumberInRedux,
      cartCount: state.checkoutReducer.cartCount,
      lan: state.userOperations.lan,
      currency: state.checkoutReducer.currency_symbol,
      table_id: state.userOperations.table_id,
      res_id: state.userOperations.res_id,
      checkoutDetail: state.checkoutReducer.checkoutDetail,
      phoneNumberInRedux: state.userOperations.phoneNumberInRedux,
      social_media_id: state.userOperations.social_media_id,
      minOrderAmount: state.userOperations.minOrderAmount,
      guestDetails: state.checkoutReducer.guestDetails,
      guestAddress: state.checkoutReducer.guestAddress,
      countryArray: state.userOperations.countryArray,
      firstName: state.userOperations.firstName,
      lastName: state.userOperations.lastName,
      email: state.userOperations.email,
      phoneCode: state.userOperations.phoneCode,
      phoneNumber: state.userOperations.phoneNumberInRedux,
      dunzo_Delivery_Amount: state.userOperations.dunzo_Delivery_Amount,
      dunzo_Delivery_Details: state.userOperations.dunzo_Delivery_Details,
      save_order_payload: state.userOperations.save_order_payload,
      selected_Slot_ID: state.userOperations.selected_Slot_ID,
      selected_category_id_home_cont:
        state.userOperations.selected_category_id_home_cont,
    };
  },
  (dispatch) => {
    return {
      saveCheckoutDetails: (checkoutData) => {
        dispatch(saveCheckoutDetails(checkoutData));
      },
      saveCartCount: (data) => {
        dispatch(saveCartCount(data));
      },
      saveIsCheckoutScreen: (data) => {
        dispatch(saveIsCheckoutScreen(data));
      },
      saveCartPrice: (data) => {
        dispatch(saveCartPrice(data));
      },

      save_selected_category_home_cont: (data) => {
        dispatch(save_selected_category_home_cont(data));
      },
    };
  }
)(CheckOutContainer);

export const style = StyleSheet.create({
  priceContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    margin: 10,
    paddingBottom: 10,
    shadowColor: "rgba(0, 0, 0, 0.05)",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  themeButton: {
    backgroundColor: EDColors.homeButtonColor,
    borderRadius: 16,
    width: "100%",
    height:
      Platform.OS == "android"
        ? heightPercentageToDP("6%")
        : heightPercentageToDP("6.0%"),
    justifyContent: "center",
    alignSelf: "center",
    flexDirection: "row",
    marginBottom: 20,
    alignItems: "center",
    paddingHorizontal: 10,
  },
  themeButtonText: {
    color: EDColors.white,
    textAlign: "center",
    fontFamily: EDFonts.semiBold,
    fontSize: getProportionalFontSize(17),
  },
  checkoutButtonView: {
    alignSelf: "center",
    borderRadius: 16,
    alignSelf: "center",
    backgroundColor: EDColors.primary,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    height: heightPercentageToDP("6%"),
  },
  disclaimer: {
    color: EDColors.black,
    fontSize: getProportionalFontSize(13),
    marginVertical: 5,
    marginHorizontal: 5,
    fontFamily: EDFonts.regular,
  },
  checkoutText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: EDFonts.medium,
  },
  title: {
    fontFamily: EDFonts.semibold,
    color: "#000",
    fontSize: getProportionalFontSize(16),
  },
  walletText: {
    fontFamily: EDFonts.medium,
    color: "#000",
    fontSize: getProportionalFontSize(14),
    marginTop: 10,
    marginHorizontal: 10,
    marginBottom: 5,
  },
  customTipInput: {
    textAlign: "center",
    textAlignVertical: "center",
    marginHorizontal: 10,
    fontSize: getProportionalFontSize(14),
  },
  divider: {
    marginVertical: 5,
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: EDColors.radioSelected,
    height: 1,
    fontFamily: EDFonts.regular,
  },
  discountIcon: {
    alignSelf: "center",
    marginVertical: 20,
    marginHorizontal: 5,
  },
  promoCode: {
    alignSelf: "center",
    color: EDColors.blackSecondary,
    fontFamily: EDFonts.medium,
    fontSize: 14,
    marginVertical: 20,
    marginHorizontal: 5,
  },
  checkOutContainer: {
    margin: 10,
    // borderRadius: 6,
    alignItems: "center",
    // backgroundColor: "#fff"
  },
  totalPrice: {
    flex: 1,
    fontFamily: EDFonts.regular,
    fontSize: getProportionalFontSize(14),
    marginHorizontal: 10,
  },
  roundButton: {
    // alignSelf: "center",
    margin: 10,
    backgroundColor: EDColors.primary,
    borderRadius: 4,
  },
  button: {
    paddingTop: 10,
    paddingRight: 20,
    paddingLeft: 20,
    paddingBottom: 10,
    color: "#fff",
    fontFamily: EDFonts.regular,
  },
  cartResponseView: {
    borderRadius: 16,
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: "#fff",
  },
  cartResponse: {
    // flexDirection: "row",
    alignItems: "center",
    padding: 5,
  },
  featuredProductView: {
    flex: 1,
    width: "100%",
    marginHorizontal: 10,
  },
  cartResponseTextStyle: {
    // flex: 1,
    fontFamily: EDFonts.regular,
    fontSize: getProportionalFontSize(16),
    alignSelf: "center",
    color: EDColors.black,
    textAlign: "center",
    marginHorizontal: 10,
    // height: 22,
    marginVertical: 4,
  },
  walletContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginVertical: 15,
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 10,
    paddingRight: 10,
    shadowColor: "rgba(0, 0, 0, 0.05)",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  priceBold: {
    fontFamily: EDFonts.bold,
    fontSize: getProportionalFontSize(14),
    color: EDColors.black,
  },
  addBtn: {
    // flex: 1,
    padding: 5,
    borderRadius: 6,
    backgroundColor: EDColors.primary,
    textAlign: "center",
    textAlignVertical: "center",
    color: EDColors.white,
    width: metrics.screenWidth * 0.3 - 10,
    marginBottom: 5,
    marginHorizontal: 5,
  },
  price: {
    fontFamily: EDFonts.regular,
    marginHorizontal: 5,
    marginVertical: 5,
  },
  priceDetailView: {},
  priceLabel: {
    fontFamily: EDFonts.medium,
    fontSize: 14,
    color: EDColors.black,
    marginVertical: 2,
    marginHorizontal: 10,
  },
  alsoOrderedText: {
    color: EDColors.black,
    fontFamily: EDFonts.semiBold,
    fontSize: 16,
    marginTop: 10,
    marginHorizontal: 10,
    marginBottom: 5,
  },
  featuredtitle: {
    fontSize: getProportionalFontSize(14),
    fontFamily: EDFonts.bold,
    marginHorizontal: 5,
    marginTop: 5,
    color: EDColors.black,
  },
  addMoreText: {
    fontFamily: EDFonts.regular,
    fontSize: getProportionalFontSize(16),
    alignSelf: "center",
    backgroundColor: EDColors.white,
    borderRadius: 14,
    padding: 10,
    paddingVertical: 15,
    width: metrics.screenWidth - 40,
    flex: 1,
    marginHorizontal: 10,
    textAlign: "center",
    color: EDColors.black,
    borderColor: EDColors.separatorColorNew,
    borderWidth: 1,
    textAlignVertical: "center",
  },
});
