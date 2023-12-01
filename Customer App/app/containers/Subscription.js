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
  SafeAreaView,
  Modal,
  TouchableHighlight,
  Button,
  Input,
  Alert,
  ActivityIndicator,
  Image,
  ImageBackground,
} from "react-native";

import { Icon, Card, ListItem, CheckBox } from "react-native-elements";
import { heightPercentageToDP } from "react-native-responsive-screen";
import { initialWindowMetrics } from "react-native-safe-area-context";
import SeeMore from "react-native-see-more-inline";
import { SvgXml } from "react-native-svg";
import WebView from "react-native-webview";
import {
  NavigationActions,
  NavigationEvents,
  StackActions,
  withNavigation,
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
} from "../redux/actions/Checkout";

import {
  saveCurrentLocation,
  saveFoodType,
  saveLanguageInRedux,
  saveMapKeyInRedux,
  saveMinOrderAmount,
  saveOrderMode,
  savePaymentDetailsInRedux,
  saveResIDInRedux,
  saveSocialURL,
  saveStoreURL,
  saveTableIDInRedux,
  saveUserFCMInRedux,
  saveWalletMoneyInRedux,
  save_delivery_dunzo__details,
  save_dunzodelivery_amount,
  save_selected_Res_ID,
  save_today_tomorrow_details,
  save_selected_category_home_cont,
} from "../redux/actions/User";

import {
  save_subscription_Cart,
  get_save_subscription_Cart,
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
  getPaymentList,
} from "../utils/ServiceManager";
import BaseContainer from "./BaseContainer";
import * as RNLocalize from "react-native-localize";
import RazorpayCheckout from "react-native-razorpay";
import Assets from "../assets";
import axios from "axios";
import Carousel, { Pagination } from "react-native-snap-carousel";
import { data } from "currency-codes";
import SelectDropdown from "react-native-select-dropdown";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { style } from "./AboutStoreContainer";
import { Dropdown } from "react-native-element-dropdown";
import AntDesign from "@expo/vector-icons/AntDesign";
//import Ionicons from "@expo/vector-icons/Ionicons";
import { FloatingAction } from "react-native-floating-action";
import HandleBack from "./HandleBack";

export class Subscription extends React.PureComponent {
  //#region LIFE CYCLE METHODS

  constructor(props) {
    super(props);

    this.restId =
      this.props.navigation.state.params !== undefined &&
      this.props.navigation.state.params.restId !== undefined
        ? this.props.navigation.state.params.restId
        : false;

    this.restname =
      this.props.navigation.state.params !== undefined &&
      this.props.navigation.state.params.restname !== undefined
        ? this.props.navigation.state.params.restname
        : false;
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
    symbol: "",
    selected_restaurant: "",
    selected_restaurantCategory: "",

    selectedDependence: "",
    startDate: moment(new Date()).format("DD/MM/YYYY"),

    amount: "",

    isSubmitEnabled: false,
    summary: null,
    showSummary: false,

    selectedOption: null,
    selectMenuOption: "",

    foodMenu: [],
    // selectPlandays: [
    //   { value: "5", name: "5", }, { value: "10", name: "10",}, { value: "15", name: "15"},
    // ],
    planAmount: "",
    Apicall: false,
    selectedCards: new Set(),

    selectPlandays: [
      { id: 1, text: "05", selected: false },
      { id: 2, text: "10", selected: false },
      { id: 3, text: "15", selected: false },
      { id: 4, text: "20", selected: false },
    ],

    // save_order_payload: localStorage.getItem("save_order_payload"),
    restaurants: [
      {
        name: " My BhoJan",
        categories: [
          "Shcool-Breakfast 1",
          "Office-Lunch 2",
          "-Dinner 9",
          "Snacks 10",
        ],
      },
      {
        name: "A2B",
        categories: ["Breakfast 3", "Lunch 4", "Dinner 11", "Snacks 12"],
      },
      {
        name: " Hotel Adyar",
        categories: ["Breakfast 5", "Lunch 6", "Dinner 13", "Snacks 14"],
      },
      {
        name: "Komala’s Restaurant ",
        categories: ["Breakfast 7", "Lunch 8", "Dinner 15", "Snacks 16"],
      },
      // Add more restaurants and categories as needed
    ],

    selectedCategory: null,
    isRestaurantModalVisible: false,
    isCategoryModalVisible: false,
    isPaymentModalVisible: false,
    isSummaryModalVisible: false,

    selectedAmount: "",
    selectedPlanname: "",
    selectedRestaurant: "",
    selectedMenu: {},
    selectedboolean: false,
    // selecteddate: "",
    selcecteddays: "",
    selectedPlan: "",
    isFocus: false,
    selected_user_subscription_list: [],
    subscription_Master_list: [],
    plan_Master: {},
    selectedplanname: "",
    selected_Subscription_Plan: "",
    isPaymentLoading: false,
    razorpayDetails: [],
    effctivecount: "",
    endDate: "",
    //isLoading: false,
  };

  componentDidMount() {
    // debugLog(
    //   "****************************** RAJA ****************************** save_order_payload"
    // );
    // debugLog(
    //   "****************************** restID ****************************** save_order_payload",
    //   this.props,
    //   this.props.navigation.state.params
    // );
    // return false;
    // debugLog(
    //   "****************************** restName ****************************** save_order_payload",
    //   this.restname
    // );
    this.setState({ selectedRestaurant: this.restname });
    this.get_save_subscription_Cart_fund();
    this.get_subscription_List();
    this.subscription_Master_listapi();
    this.getPaymentOptionsAPI();
    this.getWalletHistoryAPIREQ();

    // BackHandler.addEventListener("hardwareBackPress", this.onBack);
  }

  // componentWillUnmount() {
  //   // Remove the back button event listener when the component unmounts.
  //   BackHandler.removeEventListener("hardwareBackPress", this.onBack);
  // }

  // onBack = () => {
  //   debugLog(
  //     "****************************** RAJA ****BackHandle************************** "
  //   );

  //   if (this.state.isLoading) {
  //     Alert.alert(
  //       "You're still editing!",
  //       "Are you sure you want to go home with your edits not saved?",
  //       [
  //         { text: "Keep Payment", onPress: () => {}, style: "cancel" },
  //         {
  //           text: "Go to home Page",
  //           onPress: () => this.props.navigation.goBack(),
  //         },
  //       ],
  //       { cancelable: false }
  //     );
  //     return true;
  //   }
  //   return false;
  // };

  subscription_Master_listapi = async () => {
    let generate_order_id = await axios.get(
      `https://fis.clsslabs.com/FIS/api/auth/getMlmfSchemePlanMasterDetailsForMobile?outletId=${this.props.navigation.state.params.restId}&customerId=${this.props.userID}`,
      {
        headers: {
          "Content-Type": "application/json",
          //   Authorization:
          //     "Basic" +
          //     "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbkBjbHNzbGFicy5jb20iLCJpYXQiOjE2OTg2Mzk5OTMsImV4cCI6MTY5ODcyNjM5M30.zzonG2TpfIF-ARvnViVrJhkKjSj3EBaO6HWHKOVqWdNYlynVg-qDI-Cfw9QHCX72ts74ZkcZRLcQq6hBmqgp6g",
        },
      }
    );
    if (generate_order_id.status === 200) {
      debugLog(
        "****************************** rest*****************************",
        generate_order_id.data.data
      );
      this.setState({
        subscription_Master_list: generate_order_id.data.data,
      });
      let planlist =
        generate_order_id.data.data &&
        generate_order_id.data.data.map(
          ({
            amount,
            planId,
            planName,
            imageUrl,
            deliveryType,
            availableDays,
          }) => ({
            planName: planName,
            planId: planId,
            amount: amount,
            imageUrl: imageUrl,
            flag: false,
            availableDays: availableDays,
            deliveryType: deliveryType,
          })
        );

      this.setState({
        plan_Master: planlist,
      });
      // this.startRazorPayment(generate_order_id.data?.id);
    } else {
      this.setState({ subscription_Master_list: [] });
      // showValidationAlert("Unable to generate order id");
    }
  };

  get_subscription_List = async () => {
    let generate_order_id = await axios.get(
      `https://fis.clsslabs.com/FIS/api/auth/getMlmfSchemeSubscriptionDetails?outletId=${this.props.navigation.state.params.restId}&customerId=${this.props.userID}`,
      {
        headers: {
          "Content-Type": "application/json",
          // Authorization:
          //   "Basic" +
          //   "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbkBjbHNzbGFicy5jb20iLCJpYXQiOjE2OTg2Mzk5OTMsImV4cCI6MTY5ODcyNjM5M30.zzonG2TpfIF-ARvnViVrJhkKjSj3EBaO6HWHKOVqWdNYlynVg-qDI-Cfw9QHCX72ts74ZkcZRLcQq6hBmqgp6g",
        },
      }
    );
    if (generate_order_id.status === 200) {
      debugLog(
        "****************************** rest*****************************",
        generate_order_id.data.data
      );
      this.setState({
        selected_user_subscription_list: generate_order_id.data.data,
      });
      // this.startRazorPayment(generate_order_id.data?.id);
    } else {
      this.setState({ selected_user_subscription_list: [] });
      // showValidationAlert("Unable to generate order id");
    }
  };

  //Address container ref Id

  getPaymentOptionsAPI = () => {
    let { isPaymentLoading } = this.state;
    this.setState({ isLoading: true });
    // this.setState({ isPaymentLoading: true });

    netStatus((isConnected) => {
      if (isConnected) {
        var params = {
          language_slug: this.props.lan,
          user_id: this.props.userID,
          is_dine_in: "0",
          restaurant_id: this.restId,
          isLoggedIn:
            this.props.userID !== undefined &&
            this.props.userID !== null &&
            this.props.userID !== ""
              ? 1
              : 0,
        };
        getPaymentList(
          params,
          this.onSuccessPaymentList,
          this.onFailurePaymentList,
          this.props
        );
      } else {
        showNoInternetAlert();
      }
    });
  };

  onSuccessPaymentList = (onSuccess) => {
    debugLog(
      "*****************************************  onSuccess  ###################################################################### ",
      onSuccess
    );

    let { razorpayDetails } = this.state;

    let refKey = onSuccess.Payment_method[1];
    debugLog(
      "*****************************************  refKey  ###################################################################### ",
      refKey
    );

    this.setState({ razorpayDetails: refKey });

    // return false;
    // this.togglePaymentModal();

    // this.setState({ Apicall: false });

    return false;
    let {
      isPaymentLoading,
      dunzo_Point_DeliveryFlag,
      // loader_Flag_dunzo_CallResponse,
    } = this.state;

    if (onSuccess.allow_scheduled_delivery == "1") {
      this.allowPreOrder = true;
      let permitted_dates = Object.keys(onSuccess.datetimeslot_arr);
      if (permitted_dates.length > 0) {
        let temp = permitted_dates;

        if (this.isScheduleMandatory) {
          temp = temp && temp.slice(1, temp.length);
        }
        temp.map((data) => {
          this.allowedDates[data] = {
            selected: false,
            marked: false,
            dotColor: EDColors.black,
            disabled: false,
            testDate: data,
          };
        });

        let timeslots = onSuccess.datetimeslot_arr;
        if (this.isScheduleMandatory) {
          if (permitted_dates.length > 1) {
            let temp = onSuccess.datetimeslot_arr;
            delete temp[Object.keys(temp)[0]];
            timeslots = temp;
          } else
            showDialogue(
              strings("noTimeSlot"),
              [],
              "",
              this.onBackEventHandler
            );
        }
        this.min_scheduled_date = moment(
          permitted_dates[this.isScheduleMandatory ? 1 : 0],
          "YYYY-MM-DD"
        ).toDate();
        this.max_scheduled_date = moment(
          permitted_dates[permitted_dates.length - 1],
          "YYYY-MM-DD"
        ).toDate();
        this.setState({
          eventDate: moment(this.min_scheduled_date.toString()).format(
            "MMM DD, YYYY"
          ),
          currentDate: this.min_scheduled_date,
          arrTimeSlots: timeslots,
          startTime: Object.values(timeslots)[0][0].start,
          endTime: Object.values(timeslots)[0][0].end,
        });
      } else
        showDialogue(
          strings("resNotAccepting"),
          [],
          "",
          this.onBackEventHandler
        );
    } else this.allowPreOrder = false;
    if (
      onSuccess.Payment_method !== undefined &&
      onSuccess.Payment_method !== null &&
      onSuccess.Payment_method.length !== 0
    ) {
      // debugLog(
      //   "################################################################################ 66666666666666666",
      //   this.state.cartItems
      // );

      let currentPriceTotal =
        this.state.cartItems &&
        this.state.cartItems.reduce(function (accumulator, currentValue) {
          // debugLog(
          //   "################################################################################ Number(currentValue.price)",
          //   Number(currentValue.price)
          // );
          // debugLog(
          //   "################################################################################ currentValue.quantity",
          //   currentValue.quantity
          // );
          let some = Number(currentValue.price) * currentValue.quantity;
          // debugLog(
          //   "################################################################################ some",
          //   some
          // );
          return accumulator + some;
        }, 0);

      // debugLog(
      //   "################################################################################ this.state.cartItems",
      //   this.state.cartItems
      // );

      let findmenucount = [
        ...new Set(
          this?.state?.cartItems != undefined &&
            this?.state?.cartItems.map(
              (item) => item.menu_avail || item.availability
            )
        ),
      ];

      // debugLog(
      //   "################################################################################ findmenucount",
      //   findmenucount
      // );

      // debugLog(
      //   "################################################################################ findmenucount",
      //   findmenucount.length
      // );

      debugLog(
        "################################################################################ 0000000000",
        currentPriceTotal
      );

      debugLog(
        "########################################################################### 111111",
        this.state.dunzo_Direct_Delivery_Amt
      );

      let dunzo_Delivery_Point_AmountbasedonMenucate =
        findmenucount &&
        findmenucount.length *
          // Number(this.state?.dunzo_Direct_Delivery_Amt || 1);
          this.state?.dunzo_Direct_Delivery_Amt;

      let taxesintialcalc = currentPriceTotal / 20;

      debugLog(
        "############################################################################ dunzo_Delivery_Point_AmountbasedonMenucate",
        dunzo_Delivery_Point_AmountbasedonMenucate
      );

      debugLog(
        "############################################################################ taxesintialcalc",
        taxesintialcalc
      );

      let PriceandTotalPrice =
        currentPriceTotal +
        dunzo_Delivery_Point_AmountbasedonMenucate +
        taxesintialcalc;

      debugLog(
        "############################################################################ 222222",
        PriceandTotalPrice
      );

      let { currentTotalSumValue } = this.state;
      this.setState({
        currentTotalSumValue: Math.round(currentPriceTotal),
      });

      if (
        parseInt(this.state.loggedInUserwalletBalance) <
        Number(this.props.minOrderAmount)
      ) {
        debugLog(
          "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ razorpay  111111111111111111111111111111111111"
        );
        let filteredvalue =
          onSuccess.Payment_method &&
          onSuccess.Payment_method.filter(
            (items) => items.payment_gateway_slug == "razorpay"
          );
        this.paymentOptions = filteredvalue;
        this.onOptionSelection(filteredvalue[0]);
      } else if (
        parseInt(this.state.loggedInUserwalletBalance) >=
          Number(this.props.minOrderAmount) &&
        parseInt(this.state.loggedInUserwalletBalance) >= PriceandTotalPrice
      ) {
        debugLog(
          "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ cod 2222222222222222222222222222222222"
        );
        let filteredvalue =
          onSuccess.Payment_method &&
          onSuccess.Payment_method.filter(
            (items) => items.payment_gateway_slug == "cod"
          );
        this.paymentOptions = filteredvalue;
        this.onOptionSelection(filteredvalue[0]);
      } else if (
        parseInt(this.state.loggedInUserwalletBalance) >
          Number(this.props.minOrderAmount) &&
        parseInt(this.state.loggedInUserwalletBalance) < PriceandTotalPrice
      ) {
        debugLog(
          "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ razorpay  333333333333333333333"
        );
        let filteredvalue =
          onSuccess.Payment_method &&
          onSuccess.Payment_method.filter(
            (items) => items.payment_gateway_slug == "razorpay"
          );
        this.paymentOptions = filteredvalue;
        this.onOptionSelection(filteredvalue[0]);
      } else {
        debugLog(
          "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ razorpay 444444444444444444444444"
        );
        let filteredvalue =
          onSuccess.Payment_method &&
          onSuccess.Payment_method.filter(
            (items) => items.payment_gateway_slug == "razorpay"
          );
        this.paymentOptions = filteredvalue;
        this.onOptionSelection(filteredvalue[0]);
      }

      // if (
      //   parseInt(this.state.loggedInUserwalletBalance) >
      //  PriceandTotalPrice
      // ) {
      //   let filteredvalue =
      //     onSuccess.Payment_method &&
      //     onSuccess.Payment_method.filter(
      //       (items) => items.payment_gateway_slug == "cod"
      //     );
      //   this.paymentOptions = filteredvalue;
      //   this.onOptionSelection(filteredvalue[0]);
      // } else if (
      //   parseInt(this.state.loggedInUserwalletBalance) <
      //   parseInt(currentPriceTotal)
      // ) {
      //   let filteredvalue =
      //     onSuccess.Payment_method &&
      //     onSuccess.Payment_method.filter(
      //       (items) => items.payment_gateway_slug == "razorpay"
      //     );
      //   this.paymentOptions = filteredvalue;
      //   this.onOptionSelection(filteredvalue[0]);
      // }

      //FETCH SAVED CARDS IN STRIPE PAYMENT IF SUPPORTED
      if (
        this.props.userID !== undefined &&
        this.props.userID !== null &&
        this.paymentOptions
          .map((data) => data.payment_gateway_slug)
          .includes("stripe")
      )
        this.fetchCards();

      if (this.state.selectedOption !== "stripe")
        this.setState({
          selectedOption: onSuccess.Payment_method[0].payment_gateway_slug,
        });

      if (onSuccess.Payment_method[0].payment_gateway_slug == "razorpay") {
        this.razorpayDetails = onSuccess.Payment_method[0];
      }
      this.forceUpdate();
    }
    if (
      onSuccess.orderMode !== undefined &&
      onSuccess.orderMode !== null &&
      onSuccess.orderMode !== ""
    ) {
      let orderModes = onSuccess.orderMode.split(",");
      if (orderModes.length == 1) {
        if (orderModes.includes("Delivery") && this.state.value == 0) {
          this.setState({ value: 1 });
        }
        if (orderModes.includes("PickUp") && this.state.value == 1) {
          this.setState({ value: 0 });
        }
      }
      this.setState({ availableOrderModes: orderModes });
    } else {
      this.setState({ value: -1 });
    }

    this.setState({
      // loader_Flag_dunzo_CallResponse: false,
      isPaymentLoading: false,
      isLoading: false,
    });
  };

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
    debugLog(
      "******************Wallet bal********************** 1111",
      onSuccess
    );
    this.setState({
      loggedInUserwalletBalance: onSuccess.wallet_money,
      symbol: onSuccess.currency,
    });
  };

  onFailurePaymentList = (onFailure) => {
    let {
      isPaymentLoading,
      dunzo_Point_DeliveryFlag,
      // loader_Flag_dunzo_CallResponse,
    } = this.state;

    console.log("::::::::::: PAYMENT FALURE", onFailure);
    // showValidationAlert(onFailure.message);
    showValidationAlert("Payment Method Error, Try again later");
    this.setState({
      // loader_Flag_dunzo_CallResponse: false,
      isPaymentLoading: false,
      isLoading: false,
    });
  };

  //PayMent Razorpay call

  startRazorPayment_Get_Order_ID = async () => {
    // return false;

    let { Apicall, isPaymentModalVisible, isLoading } = this.state;
    this.setState({ Apicall: true });
    this.setState({ isLoading: true });
    // debugLog(
    //   "%%%%%%%%   this.state.razorpayDetails   %%%5%%%%",
    //   this.state.razorpayDetails
    // );

    let base64 = require("base-64");

    let username1 =
      this.state.razorpayDetails.enable_live_mode == "1"
        ? this.state.razorpayDetails.live_publishable_key
        : this.state.razorpayDetails.test_publishable_key;

    let password1 =
      this.state.razorpayDetails.enable_live_mode == "1"
        ? this.state.razorpayDetails.live_secret_key
        : this.state.razorpayDetails.test_secret_key;

    let currentdate = new Date().toISOString();

    let dataforgenraeorder = {
      amount: (Number(this.state.planAmount).toFixed(2) * 100).toFixed(0),
      currency: "INR",
      receipt: `${this.restId}~${currentdate}`,
      notes: {
        user_id: this.props.userID,
        mobile_no: this.props.token,
      },
      payment_capture: true,
    };

    // debugLog("%%%%%%%%   dataforgenraeorder   %%%5%%%%", dataforgenraeorder);
    // debugLog("%%%%%%%%   dataforgenraeorder   %%%5%%%%", username1);
    // debugLog("%%%%%%%%   dataforgenraeorder   %%%5%%%%", password1);

    //  return false;
    try {
      let generate_order_id = await axios.post(
        "https://api.razorpay.com/v1/orders",
        dataforgenraeorder,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Basic " + base64.encode(username1 + ":" + password1),
          },
        }
      );
      if (generate_order_id.status === 200) {
        // debugLog(
        //   "****************************** Vijay ****************************** generate_order_id.data?.id ",
        //   generate_order_id.data
        // );
        this.startRazorPayment(generate_order_id.data?.id);
        this.setState({ isLoading: false });
      } else {
        showValidationAlert("Unable to generate order id");
        this.setState({ Apicall: false });
        this.setState({ isLoading: false });
      }
    } catch (error) {
      this.setState({ isLoading: false });
    }
  };

  startRazorPayment = (valueoforderid) => {
    let { isPaymentModalVisible, isLoading } = this.state;

    // debugLog(
    //   "****************************** Vijay ****************************** this.razorpayDetails , valueoforderid 1111",
    //   this.state.razorpayDetails,
    //   valueoforderid
    // );
    // return false;
    this.setState({ isLoading: true });
    // this.setState({ isLoading: true });
    this.setState({ isPaymentModalVisible: false });

    let merchant_order_id = Date.now();
    var options = {
      description: "Paying MLMF",
      image:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASMAAAEkCAYAAABkJVeVAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAACVRSURBVHgB7d0JfBTl/T/w7zOzm4QbRYGQDUqlrVJvjgTUirVazyq11h5/e1nxQDAHClqUIFYskAOo1qq1aq2tRw+Plp9alfpTIAE8qYqiAjk4RIQQybE7z/P/PLOzm03IhULrj3zevJadnZmdnd3MfOf7HDMjQkRERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERET0eaSEaA+YIgnhaSAeQ/DoLY4YiUqtxKRK5shWbFBGiD4FBiPqlJkoYcmWU8WTs7HFnIpw8wWMTvfDTmILUrIT/7+McY/i+VFVJJuEaA8wGFGHkAmdgwAzD1vKcDxewfAzeH5dtKwXFwEoipm0DJA0+SKmfRWvThebMYncjml/Rub0iWyWD9SdskuIOsBgRLtBALLFsOPxOAUBphBbyRPIjWbK9fKGUh0Xw/De3pj/B5hrJl5mSrzYZrOm/8XjHjweR9YUE6JWGIzIZ0qkB2p+foDBn+FxnB2FreN9/F+GsHJXZ0Fot+XNlAje/1e86wm8fBvDF+LZZllvIaP6kbpR3hCiFAxGJOYmGYkgcT8eh+DlXxAsHkY19UvygdSheBWVT8nPkkQWIphdYoOZmSGHYbm3Y6sbjdzobDVblglRwBHq1swv5Gi/HsigDkjkSBShfqhukCfVdfIxClmT5DPAsuoQdJ6UWX5xTdTN8h6ezsVnPY2g9HuTj2yMKMBg1I2Za1GUiskjCA7LpUbOQ/BYl5xms2YlX5LPajaKatLcsobPaMLTFHzAIOknE4QowGDUTaEI9XXphSBkZAiylMt2K44VobCm5FDTxaK8uVBcM97v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Fyf75CgUioxMQuvXP9r+nJz7MP2HeIxFAOr0/LfPk4LIqAtQ4/IofqOr8RstFNqvMRj9B7S+PK2tAA2HmypsmoEAMWwPF+dnArW1vZH2+5fhiDNyrxeV0gVbyl+3t5EO9VJF8XovOR2V6qtKqyrGy/8htqK4lxt6Cet/QKOYkWyB2v8xGP0HoDj1tHFkOCp016NFJYS6lCNRke3pJif3s7SuXD0k95towl4gKvUKlLY1T9m6I7+ZGn/gGi+mTvi8X3sZRcZfYV0vQFF0jbK1TfZ8L6P6aFedUbZh+T65qQF9vjAY7WP2om3KkRZ1J9jTXnd07KLijav2qFdxW2zfGJ2W9mPUqNsrMLbKstRqtPdfYE9elc+xwuxxo43xKlLHoSVzjWP0JfNqVr4k1C0wGO1jfpN42JyFnWsgjvoNqLx9Odbro3/tixMl/fokV59ve1Z6jvNGQyz2TJunqnzOxK8C6ZyDyupDUdyMxpS8ecAu9eysbeW1QkREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREe+r/A6oAvqKJBlvwAAAAAElFTkSuQmCC",
      currency: "INR",
      key:
        this.state.razorpayDetails.enable_live_mode == "1"
          ? this.state.razorpayDetails.live_publishable_key
          : this.state.razorpayDetails.test_publishable_key, // Your api key
      amount: (Number(this.state.planAmount).toFixed(2) * 100).toFixed(0),
      name: "MLMF",
      order_id: valueoforderid,
      // prefill: {
      //   email:
      //     this.props.userID == undefined ||
      //     this.props.userID == null ||
      //     this.props.userID == ""
      //       ? this.props.guestDetails.email
      //       : this.props.email,
      //   contact:
      //     this.props.userID == undefined ||
      //     this.props.userID == null ||
      //     this.props.userID == ""
      //       ? this.props.guestDetails.phone_number
      //       : this.props.phoneNumber,
      //   name:
      //     this.props.userID == undefined ||
      //     this.props.userID == null ||
      //     this.props.userID == ""
      //       ? this.props.guestDetails.first_name +
      //         " " +
      //         this.props.guestDetails.last_name
      //       : this.props.firstName + " " + this.props.lastName,
      // },
      // theme: { color: EDColors.primary },
      note: {
        merchant_order_id: merchant_order_id,
      },
    };
    debugLog(
      "****************************** Vijay ******************************  order_id 00000",
      options
    );
    // return false;

    try {
      RazorpayCheckout.open(options)
        .then((data) => {
          // handle success
          // debugLog("Payment success ::::::", data);
          debugLog(
            "******************************response ******************************  data 3245345435",
            data
          );
          // return false;
          // this.razorpay_payment_id = data.razorpay_payment_id;
          this.save_Subscription_List_Api(data);
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
          this.setState({ isLoading: false });
        });
    } catch (error) {
      this.setState({ isLoading: false });
    }
  };

  save_Subscription_List_Api = async (data) => {
    let { Apicall, isLoading } = this.state;
    this.setState({ isLoading: true });
    debugLog(
      "****************************** save_Subscription_List_Api ******************************  data 3245345435",
      data
    );

    // let plan = this.state.plan_Master.name.split("-");
    // let planname = plan[0];
    let date = moment(new Date()).format("YYYY/MM/DD");

    let subscripdetail = {
      outletCode: this.restId,
      customerId: this.props.userID,
      plantId: this.state.selectedPlan,
      weekDays: "",
      totalAmount: this.state.planAmount,
      deliveryType: "SelfPickup",
      actualCount: this.state.selcecteddays,
      planName: this.state.selectedPlanname,
      paymentId: data.razorpay_payment_id,
      paymentDate: date,
      paymentMode: "UPI",
      razorpayOrderId: data.razorpay_order_id,
      razorpayPaymentId: data.razorpay_payment_id,
      razorpaySignature: data.razorpay_signature,
      planAmount: this.state.selectedAmount,
    };

    debugLog(
      "****************************** Vijay ****************************** subscripdetail ",
      subscripdetail
    );

    //return false
    try {
      let generate_order_id = await axios.post(
        "https://fis.clsslabs.com/FIS/api/auth/saveMlmfSchemeSubscriptionDataForMobile",
        subscripdetail,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (generate_order_id.status === 200) {
        debugLog(
          "****************************** Vijay ****************************** generate_order_id.data?.id ",
          generate_order_id.data
        );
        showValidationAlert(" subscription Added Successfully");
        this.setState({ isLoading: false });
         this.togglePaymentModal();
      } else {
        showValidationAlert("Unable to generate order id");
      }
      this.togglePaymentModal();
      this.setState({ Apicall: false });
      this.setState({ isLoading: false });
    } catch {
      this.setState({ isLoading: false });
    }
  };

  toggleRestaurantModal = () => {
    this.setState({
      isRestaurantModalVisible: !this.state.isRestaurantModalVisible,
    });
  };

  toggleCategoryModal = () => {
    this.setState({
      isCategoryModalVisible: !this.state.isCategoryModalVisible,
    });
  };

  togglePaymentModal = () => {
    let {
      isPaymentModalVisible,
      selectedAmount,
      selectedPlanname,
      planAmount,
      selectedPlan,
      selcecteddays,
      selectPlandays,
    } = this.state;
    let newData = this.state.selectPlandays.map((item, i) => {
      if (item.selected === true) {
        item.selected = false;
      } else {
        item.selected = false;
      }
      return item;
    });
    this.setState(
      {
        isPaymentModalVisible: !this.state.isPaymentModalVisible,
        selectedAmount: "",
        selectedPlanname: "",
        planAmount: "",
        selectedPlan: [],
        selcecteddays: "",
        selectPlandays: newData,
      },
      () => {
        this.get_subscription_List();
        this.get_save_subscription_Cart_fund();
        this.subscription_Master_listapi();
        this.getPaymentOptionsAPI();
        this.getWalletHistoryAPIREQ();
      }
    );
  };

  toggleHalf_cut_PaymentModal = () => {
    let {
      isPaymentModalVisible,
      selectedAmount,
      selectedPlanname,
      planAmount,
      selectedPlan,
      selcecteddays,
      selectPlandays,
    } = this.state;
    let newData = this.state.selectPlandays.map((item, i) => {
      if (item.selected === true) {
        item.selected = false;
      } else {
        item.selected = false;
      }
      return item;
    });
    this.setState(
      {
        isPaymentModalVisible: !this.state.isPaymentModalVisible,
        selectedAmount: "",
        selectedPlanname: "",
        planAmount: "",
        selectedPlan: "",
        selcecteddays: "",
        selectPlandays: newData,
      }
      // () => {
      //   this.get_subscription_List();
      //   this.get_save_subscription_Cart_fund();
      //   this.subscription_Master_listapi();
      //   this.getPaymentOptionsAPI();
      //   this.getWalletHistoryAPIREQ();
      // }
    );
  };

  toggleSumaryModal = () => {
    this.setState({ isSummaryModalVisible: !this.state.isSummaryModalVisible });
  };

  // selectRestaurant = (restaurant) => {
  //   this.setState({ selectedRestaurant: restaurant, selectedCategory: null });
  //   // AsyncStorage.setItem("subscription",restaurant);
  //   this.toggleCategoryModal();
  // };

  selectCategory = (category) => {
    this.setState({ selectedCategory: category });
    this.togglePaymentModal();
  };

  handleOptionSelect = (value) => {
    this.setState({ selectedOption: value });
  };

  // handlePlanChange = (plan) => {
  //   this.setState({ selectedPlan: plan });
  // };

  handleDependenceChange = (dependence) => {
    this.setState({ selectedDependence: dependence });
  };

  handleSumaryPress = () => {
    let {
      selectedRestaurant,
      selectedPlan,
      selcecteddays,
      selectedAmount,
      selectedPlanname,
    } = this.state;
    let localsubsobje = {
      selectedRestaurant,
      selectedPlan,
      selcecteddays,
      selectedAmount,
      selectedPlanname,
    };

    debugLog("localsubsobje ********************", localsubsobje);

    save_subscription_Cart(localsubsobje);
    this.setState({ isSummaryModalVisible: true });
  };

  add_subscription_fun = () => {
    this.setState({ isPaymentModalVisible: true });
    this.setState({ Apicall: false });
  };

  get_save_subscription_Cart_fund = () => {
    // let { cartDatafromstore } = this.state;
    get_save_subscription_Cart((success) => {
      debugLog("successget_save_subscription_Cart_fund", success);
      //   var cartArray = success;
      //   this.setState({
      //     cartDatafromstore: cartArray,
      //   });
    });
  };

  total_amounT = () => {
    const { selectedAmount, selcecteddays, planAmount } = this.state;
    let total = selectedAmount * selcecteddays;
    this.setState({ planAmount: total });
  };

  //flatlist

  // toggleCardSelection = (card) => {
  //   const { selectedCards } = this.state;
  //   const updatedSelectedCards = new Set(selectedCards);

  //   if (updatedSelectedCards.has(card.id)) {
  //     updatedSelectedCards.delete(card.id);
  //   } else {
  //     updatedSelectedCards.add(card.id);
  //   }

  //   this.setState({ selectedCards: updatedSelectedCards });
  //   debugLog("successget_save_subscription_Cart_fund", selectedCards);
  // };

  toggleItemSelection = (id) => {
    let {
      selcecteddays,
      selectedAmount,
      planAmount,
      selectedboolean,
      endDate,
      effctivecount,
      startDate,
    } = this.state;
    const newData = this.state.selectPlandays.map((item, i) => {
      // debugLog("toggle selected ======== === === ", item);
      if (item.id === id) {
        item.selected = true;
      } else {
        item.selected = false;
      }
      return item;
    });

    let filterflagtrue =
      this.state.selectPlandays &&
      this.state.selectPlandays.filter((item, i) => {
        if (item?.selected == true) {
          return item;
        }
      });
    let total = filterflagtrue[0].text * selectedAmount;
    debugLog("filterflagtrue filterflagtrue ", filterflagtrue[0].text);
    this.setState({ selectPlandays: newData });
    this.setState({ selcecteddays: filterflagtrue[0].text });

    // this.total_amounT();
    let efftiveCount = Number(filterflagtrue[0].text) + 5;
    let enddate = moment(startDate, "DD/MM/YYYY").add(
      Number(efftiveCount),
      "days"
    );
    let endate = moment(enddate).utc().format("DD/MM/YYYY");
    debugLog(" efftiveCount---efftiveCount---efftiveCount", efftiveCount);
    debugLog(" enddate---enddate---enddate", endate);
    this.setState({ planAmount: total });
    this.setState({ effctivecount: efftiveCount, endDate: endate });
    debugLog(" total---total---total", total);
  };

  //flatlist

  // renderCard = ({ item }) => {
  //   return (
  //     <TouchableOpacity
  //       onPress={() => this.toggleCardSelection(item)}
  //       style={[
  //         styles.cardFlat,
  //         {
  //           backgroundColor: this.state.selectedCards.has(item.id) ? 'blue' : 'white',
  //         },
  //       ]}
  //     >
  //       <Text style={{ color: this.state.selectedCards.has(item.id) ? 'white' : 'black' }}>
  //         {item.title}
  //       </Text>
  //     </TouchableOpacity>
  //   );
  // };

  renderItem = ({ item }) => {
    debugLog("seleced id+++++====++++++items())))(())()(()()()))", item);

    return (
      <TouchableOpacity
        onPress={() => this.toggleItemSelection(item.id)}
        style={[
          styles.cardFlat,
          { backgroundColor: item.selected ? "#721C37" : "white" },
        ]}
      >
        <Text style={{ color: item.selected ? "white" : "black" }}>
          {item.text}
        </Text>
      </TouchableOpacity>
    );
  };

  onDrawerOpen = () => {
    this.props.navigation.openDrawer();
  };

  onBackHome = () => {
    this.setState({ isPaymentModalVisible: false });
    this.props.navigation.navigate("MainContainer");
    // NavigationActions.navigate({
    //   routeName: isRTLCheck() ? "MainContainer_Right" : "MainContainer",
    // });
  };

  //#region
  /** NETWORK CONNECTIVITY */
  networkConnectivityStatus = () => {
    this.state.notificationList = undefined;
    debugLog("Called from WILL networkConnectivityStatus ::::");

    this.getNotificationList();
  };

  changeflagcategorymenu = async (items) => {
    let {
      plan_Master,
      selected_Subscription_Plan,
      selectedAmount,
      selectedPlanname,
      planAmount,
      selcecteddays,
      selectedPlan,
    } = this.state;

    let filterstatesMastervalues =
      plan_Master &&
      plan_Master.map((item, i) => {
        if (item?.planId == items?.planId) {
          item.flag = true;
        } else {
          item.flag = false;
        }
        return item;
      });

    let filterflagtrue =
      plan_Master &&
      plan_Master.filter((item, i) => {
        if (item?.flag == true) {
          return item;
        }
      });

    debugLog("filterflagtrue filterflagtrue ", filterflagtrue);

    let planamt = Number(filterflagtrue[0].amount) * Number(selcecteddays);
    debugLog("planamt planamt planamt ", planamt);
    this.setState({
      plan_Master: filterstatesMastervalues,
      selected_Subscription_Plan: filterflagtrue,
      selectedPlanname: filterflagtrue[0].planName,
      selectedAmount: filterflagtrue[0].amount,
      planAmount: planamt,
      selectedPlan: filterflagtrue[0].planId,
      // selected_restaurantCategory
    });
  };

  callRes_container = async (item) => {
    let {
      selectedAmount,
      selectedPlanname,
      planAmount,
      plan_Master,
      selcecteddays,
    } = this.state;

    // debugLog(
    //   "this.props.selected_category_id_home_cont error ",
    //   this.props.selected_category_id_home_cont
    // );
    // return false;

    let filterflagtrue =
      plan_Master &&
      plan_Master.filter((item, i) => {
        if (item?.flag == true) {
          return item;
        }
      });
    debugLog("filterflagtrue[0]()(------)()", filterflagtrue.amount);
    let planamt = filterflagtrue.amount * selcecteddays;

    this.setState({
      selectedPlanname: filterflagtrue.planName,
      selectedAmount: filterflagtrue.amount,
      planAmount: planamt,
    });
  };

  onHomeIconPress = () => {
    // Your custom function to handle the press
    console.log("Home icon pressed!");
    // You can add your logic here
  };
  //  //Alert Msg
  //   createTwoButtonAlert = () =>{
  //   Alert.alert('select you plan and Supscription days', '', [

  //     {text: 'OK', onPress: () => console.log('OK Pressed')},
  //   ]);}

  // RENDER METHOD
  render() {
    let {
      data,
      restaurants,
      selectedRestaurant,
      selectedCategory,
      isRestaurantModalVisible,
      isCategoryModalVisible,
      isPaymentModalVisible,
      isSummaryModalVisible,
      options,
      selectPlandays,
      foodMenu,
      planAmount,
      showPicker,
      selectedDate,
      dateTimePickerVisible,
      dateOrTimeValue,
      selectedAmount,
      selectedPlanname,
      selectedMenu,
      selecteddate,
      selcecteddays,
      subscriptionPlan,
      isFocus,
      selectedPlan,
      selected_user_subscription_list,
      subscription_Master_list,
      plan_Master,
      loggedInUserwalletBalance,
      symbol,
      Apicall,
      isLoading,
    } = this.state;

    return (
      <>
        <BaseContainer
          title={"Subscription"}
          left={"menu"}
          right={[]}
          onLeft={this.onDrawerOpen}
          onConnectionChangeHandler={this.networkConnectivityStatus}
          //loading={this.state.isLoading}
        >
          <View style={styles.container}>
            <ScrollView>
              <View
                style={{
                  backgroundColor: EDColors.white,
                  borderRadius: 16,
                  padding: 10,
                  elevation: 1,
                  marginBottom: 2,
                  marginTop: 10,
                }}
              >
                {/* VIKRANT 30-07-21 */}
                <EDRTLView style={style.header}>
                  <View style={style.walletView}>
                    <EDRTLView style={{ alignItems: "center" }}>
                      <Text style={style.walletHeader}>
                        {strings("yourWalletBalance")}
                      </Text>
                    </EDRTLView>

                    <Text
                      style={[
                        style.walletText,
                        {
                          fontFamily: EDFonts.bold,
                          textAlign: isRTLCheck() ? "right" : "left",
                        },
                      ]}
                    >
                      {this.state.symbol +
                        " " +
                        this.state.loggedInUserwalletBalance}
                    </Text>
                  </View>
                  {/* <Image source={this.props.image !== undefined && this.props.image !== null && this.props.image.trim() !== "" ? { uri: this.props.image } : Assets.user_placeholder} style={style.headerImage} /> */}
                  <TouchableOpacity
                    onPress={() => {
                      this.toggleHalf_cut_PaymentModal();
                      this.add_subscription_fun();
                    }}
                    style={[styles.buttonAdd, styles.restaurantButton]}
                  >
                    <Text style={styles.buttonTextAdd}>Add Subscription</Text>
                  </TouchableOpacity>
                </EDRTLView>
              </View>

              {/* <View
                style={{
                  flexDirection: "row",
                  marginTop: 20,
                  marginBottom: 30,
                  alignItems: "center",
                }}
              >
                <Text style={styles.title}>
                  {this.state.symbol +
                    " " +
                    this.state.loggedInUserwalletBalance}
                </Text>

                <TouchableOpacity
                  onPress={() => {
                    this.add_subscription_fun();
                  }}
                  style={[styles.buttonAdd, styles.restaurantButton]}
                >
                  {/* <Icon
              name="add"
              type="add"
              //  onPress={() => {
              //      // this.add_subscription_fun();
              //     }}
              size={30}
              color="white"
            /> 
                  <Text style={styles.buttonTextAdd}>Add Subscription</Text>
                </TouchableOpacity>
              </View> */}

              <ScrollView>
                {selected_user_subscription_list &&
                selected_user_subscription_list.length == 0 ? (
                  <Card
                    containerStyle={{
                      backgroundColor: "#b5b0b0",
                      height: 50,
                      width: 200,
                      borderRadius: 30,
                      marginLeft: 50,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: "black",
                        fontWeight: "400",
                        textAlign: "center",
                      }}
                    >
                      Currently No active Plan
                    </Text>
                  </Card>
                ) : (
                  selected_user_subscription_list &&
                  selected_user_subscription_list.map((items) => {
                    return (
                      <Card
                        containerStyle={{
                          backgroundColor: "#fffcfc", //#9f1982 #fffcfc
                          height: 90,
                          width: 300,
                          borderRadius: 20,
                          //borderColor:"#c7c3c3",
                          //boxShadow: "rgba(255, 0, 0, 0.24) 0px 3px 8px",
                          shadowColor: "black",
                          shadowOffset: { width: 0, height: 5 },
                          shadowOpacity: 0.8,
                          shadowRadius: 6,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 18,
                            color: "black",
                            fontWeight: "bold",
                            textAlign: "center",
                          }}
                        >
                          {items?.planName} - RS.{items?.totalAmount}
                        </Text>
                        <Text
                          style={{
                            fontSize: 15,
                            color: "black",
                            fontWeight: "200",
                            textAlign: "center",
                          }}
                        >
                          END DATE - {items?.endDate}
                        </Text>
                        <Text
                          style={{
                            fontSize: 13,
                            color: "black",
                            fontWeight: "180",
                            textAlign: "center",
                          }}
                        >
                          COUNT - {items?.actualCount}
                        </Text>
                      </Card>
                    );
                  })
                )}
              </ScrollView>

              <ScrollView>
                {selectedCategory && (
                  <TouchableOpacity
                    onPress={this.togglePaymentModal}
                    style={[styles.button, styles.paymentButton]}
                  >
                    <Text style={styles.buttonText}>Proceed to Payment</Text>
                  </TouchableOpacity>
                )}
                {/* Restaurant Modal */}
              </ScrollView>

              {/* Payment Modal */}
              <Modal
                visible={isPaymentModalVisible}
                animationType="slide"
                transparent={false}
                onRequestClose={this.togglePaymentModal}
              >
                <ScrollView>
                  <View
                    style={{
                      backgroundColor: EDColors.white,
                      borderRadius: 16,
                      padding: 10,
                      elevation: 1,
                      marginBottom: 2,
                      marginTop: 20,
                    }}
                  >
                    {/* VIKRANT 30-07-21 */}
                    <EDRTLView style={style.header}>
                      <View style={style.walletView}>
                        <EDRTLView style={{ alignItems: "center" }}>
                          <Text style={style.walletHeader}>
                            {strings("yourWalletBalance")}
                          </Text>
                        </EDRTLView>

                        <Text
                          style={[
                            style.walletText,
                            {
                              fontFamily: EDFonts.bold,
                              textAlign: isRTLCheck() ? "right" : "left",
                            },
                          ]}
                        >
                          {this.state.symbol +
                            " " +
                            this.state.loggedInUserwalletBalance}
                        </Text>
                      </View>
                      {/* <Image source={this.props.image !== undefined && this.props.image !== null && this.props.image.trim() !== "" ? { uri: this.props.image } : Assets.user_placeholder} style={style.headerImage} /> */}
                      <TouchableOpacity
                        onPress={this.togglePaymentModal}
                        style={[styles.buttonAdd, styles.restaurantButtonG1]}
                      >
                        <Text style={styles.buttonTextAdd}>Current Plan</Text>
                      </TouchableOpacity>

                      <TouchableOpacity>
                        <Text
                          style={
                            {
                              marginLeft: 50,
                            }
                            // styles.buttonTextAdd,
                            // styles.restaurantButtonG2,
                          }
                        >
                          <Icon
                            name="home"
                            type="material"
                            size={30}
                            color="#721C37"
                            onPress={this.onBackHome}
                          />
                        </Text>
                      </TouchableOpacity>
                    </EDRTLView>
                  </View>

                  <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>
                      {plan_Master && plan_Master.length > 0
                        ? "Select Subscription Plan"
                        : "Curently no plan available"}
                    </Text>

                    {/* Add payment information and UI */}

                    {/* <ScrollView
                    horizontal={false}
                    showsVerticalScrollIndicator={true}
                  > 
                   {subscription_Master_list &&
                    subscription_Master_list.length > 0 &&
                    subscription_Master_list.map((items) => {
                      return (
                        <Card
                          containerStyle={{
                            backgroundColor: "#85e6e4",
                            height: 60,
                            width: 280,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 18,
                              color: "black",
                              fontWeight: "400",
                              textAlign: "center",
                            }}
                          >
                            {items?.planName} - RS.{items?.amount}
                          </Text>
                        </Card>
                      );
                    })} */}
                    {/* </ScrollView> */}

                    {/* {plan_Master && plan_Master.length > 0 && (
                      <View style={styles.containerDrop}>
                        <Dropdown
                          style={[
                            styles.dropdownDrop,
                            isFocus && { borderColor: "blue" },
                          ]}
                          placeholderStyle={styles.placeholderStyleDrop}
                          selectedTextStyle={styles.selectedTextStyleDrop}
                          inputSearchStyle={styles.inputSearchStyleDrop}
                          iconStyle={styles.iconStyleDrop}
                          data={plan_Master}
                          // search
                          maxHeight={200}
                          labelField="name"
                          valueField="value"
                          placeholder={"Select Subscription Plan"}
                          searchPlaceholder="Search..."
                          //value={selected_Slot_value}
                          // onFocus={() => setIsFocus(true)}
                          // onBlur={() => setIsFocus(false)}
                          onChange={(item, i) => {
                            debugLog("item", item);
                            //debugLog("i", i);
                            // setValue(item.value);
                            //this.slot_Master_against_category_Call(item);
                            this.setState({
                              selectedPlan: item?.value,

                              isFocus: !isFocus,
                            });
                            let val = item.name.split("-");
                            let name = val[0];
                            let amount = val[1];

                            this.setState({
                              selectedAmount: amount,
                              selectedPlanname: name,
                            });
                            let planAmt = amount * selcecteddays;
                            this.setState({ planAmount: planAmt });
                            //this.total_amounT();
                            debugLog(
                              "amount amount amount amount %%%%%%%%%@@@@!!!!!!",
                              amount
                            );
                            debugLog("foodMenu%%%%%%%%%@@@@!!!!!!", name);

                            // setIsFocus(false);
                          }}
                          renderLeftIcon={() => (
                            <AntDesign
                              style={styles.iconDrop}
                              color={isFocus ? "blue" : "black"}
                              name="Safety"
                              size={20}
                            />
                          )}
                        />
                      </View>
                    )} */}
                    <ScrollView
                      horizontal={true}
                      showsHorizontalScrollIndicator={true}
                    >
                      {plan_Master &&
                        plan_Master.length > 0 &&
                        plan_Master.map((item) => {
                          debugLog(
                            "card image%%%%%%%%%%%%%%%**********Image**************",
                            item
                          );

                          return (
                            <Card
                              containerStyle={{
                                // backgroundColor: "#fffcfc", //#9f1982 #fffcfc
                                backgroundColor: item?.flag ? "green" : "white",
                                height: 200,
                                width: 200,
                                borderRadius: 20,
                                //borderColor:"#c7c3c3",
                                //boxShadow: "rgba(255, 0, 0, 0.24) 0px 3px 8px",
                                shadowColor: "black",
                                shadowOffset: { width: 0, height: 5 },
                                shadowOpacity: 0.8,
                                shadowRadius: 6,
                              }}
                            >
                              <TouchableOpacity
                                onPress={() => {
                                  this.changeflagcategorymenu(item);
                                }}
                              >
                                <Image
                                  source={{
                                    uri: item.imageUrl,
                                    // 'https://source.unsplash.com/user/c_v_r/100x100'
                                  }}
                                  style={styles.image}
                                />
                              </TouchableOpacity>
                            </Card>
                          );
                        })}
                    </ScrollView>

                    <>
                      <Text style={styles.modalTitle}>
                        Select Subscription Count{" "}
                      </Text>

                      <View style={styles.containerFlat}>
                        <FlatList
                          data={this.state.selectPlandays}
                          renderItem={this.renderItem}
                          keyExtractor={(item) => item.id.toString()}
                          horizontal={true}
                        />
                      </View>
                    </>

                    {this.state.selcecteddays == "" ? null : (
                      <View style={styles.summaryCardsum}>
                        <Text style={styles.walletHeaderSum}>Description*</Text>
                        <Text style={styles.cardTextsum}>
                          Selected Plan Name : {this.state.selectedPlanname}
                        </Text>
                        <Text style={styles.cardTextsum}>
                          Meal Price : ₹ {this.state.selectedAmount}
                          {/* ( ₹.
                          {this.state.selectedAmount} *{" "}
                          {this.state.selcecteddays} Days) */}
                        </Text>
                        <Text style={styles.cardTextsum}>
                          Plan Validity : {this.state.startDate} to{" "}
                          {this.state.endDate}
                        </Text>
                        <Text style={styles.cardTextsum}>
                          Total Price : ( ₹ {this.state.selectedAmount} ×{" "}
                          {this.state.selcecteddays} Days) = ₹ 
                          {this.state.planAmount}
                        </Text>
                      </View>
                    )}

                    {/* {this.state.dateTimePickerVisible && (
                        <DateTimePicker
                          mode={"datetime"} // THIS DOES NOT WORK ON ANDROID. IT DISPLAYS ONLY A DATE PICKER.
                          display="default" // Android Only
                          is24Hour={false} // Android Only
                          value={dateOrTimeValue}
                          onChange={(event, value) => {
                            this.setState({
                              dateOrTimeValue: value,
                              selecteddate:dateOrTimeValue,
                              dateTimePickerVisible:
                                Platform.OS === "ios" ? true : false,
                            });

                            if (event.type === "set")
                              console.log("value:", value);
                          }}
                        />
                      )} 
                    </View>
                  </View> */}

                    <View style={{ flexDirection: "row", marginTop: 10 }}>
                      <TouchableOpacity
                        onPress={this.startRazorPayment_Get_Order_ID}
                        // onPress={() => {
                        //   this.startRazorPayment_Get_Order_ID
                        // }}
                        style={
                          planAmount == "" || Apicall == true
                            ? [
                                // styles.button,
                                styles.modalButtonPay,
                                styles.payButtonDis,
                              ]
                            : [
                                // styles.button,
                                styles.modalButtonPay,
                                styles.payButton,
                                // styles.closeButton={backgroundColor:"#73ff00"},
                              ]
                        }
                        disabled={planAmount == "" || Apicall == true}
                      >
                        <Text style={styles.buttonText}>PAY- {planAmount}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={this.toggleResetModal}
                        // onPress={() => {
                        //   this.togglePaymentModal();
                        // }}
                        style={[
                          //styles.button,
                          styles.modalButtonPay,
                          styles.closeButton,
                        ]}
                      >
                        <Text style={styles.buttonText}>Reset</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>
              </Modal>

              <Modal
                visible={isSummaryModalVisible}
                animationType="slide"
                transparent={false}
                onRequestClose={this.toggleSumaryModal}
              >
                <View style={styles.summaryCardsum}>
                  <Text style={styles.cardTextsum}>
                    Selected Restaurant: {this.state.selectedRestaurant}
                  </Text>
                  <Text style={styles.cardTextsum}>
                    Selected Plan Name: {this.state.selectedPlan}
                  </Text>
                  <Text style={styles.cardTextsum}>
                    Selected Days: {this.state.selcecteddays}
                  </Text>
                  <Text style={styles.cardTextsum}>
                    Selected Amount: {this.state.selectedAmount}
                  </Text>
                  {/* <Text style={styles.cardTextsum}>
                Selected Date: {this.state.selecteddate}
              </Text> */}
                  {/* You can display more details about the selected option here */}
                </View>

                <Button
                  title="Pay Now"
                  onPress={() => {
                    // Handle payment logic here
                  }}
                />

                <TouchableOpacity
                  onPress={this.toggleSumaryModal}
                  style={[
                    styles.button,
                    styles.modalButton,
                    styles.closeButton,
                  ]}
                >
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
              </Modal>
            </ScrollView>
          </View>
        </BaseContainer>
      </>
    );
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
      type_today_tomorrow__date: state.userOperations.type_today_tomorrow__date,
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
)(Subscription);

export const styles = StyleSheet.create({
  //Flatlist
  containerFlat: {
    flex: 1,
    padding: 16,
  },
  cardFlat: {
    margin: 10,
    padding: 16,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#721C37",
  },

  //DropDown styles

  containerDrop: {
    backgroundColor: "white",
    padding: 16,
  },
  dropdownDrop: {
    height: 80,
    width: 260,
    borderColor: "gray",
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 5,
  },
  iconDrop: {
    marginRight: 5,
  },
  labelDrop: {
    position: "absolute",
    backgroundColor: "white",
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyleDrop: {
    fontSize: 16,
  },
  selectedTextStyleDrop: {
    fontSize: 16,
  },
  iconStyleDrop: {
    width: 20,
    height: 20,
  },
  inputSearchStyleDrop: {
    height: 40,
    fontSize: 16,
  },

  ///summary card
  containersum: {
    flex: 1,
    padding: 20,
  },
  selectContainersum: {
    marginBottom: 20,
  },
  labelsum: {
    fontSize: 16,
    marginBottom: 5,
  },

  summaryCardsum: {
    backgroundColor: "#721C37",
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  cardTextsum: {
    fontSize: 14,
    color: "#fcfcfc",
    backgroundColor: "#721C37",
  },
  walletHeaderSum: {
    fontFamily: EDFonts.semiBold,
    fontSize: getProportionalFontSize(18),
    color: "#fcfcfc",
  },
  containerpic: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  datePickerpic: {
    width: 300,
    backgroundColor: "#fff",
    marginTop: 20,
  },
  selectedDateTextpic: {
    marginTop: 20,
    fontSize: 18,
  },

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  title: {
    fontSize: 24,
    color: "#ff0048",
    fontWeight: "bold",
    marginBottom: 10,
    alignItems: "center",
  },
  button: {
    padding: 10,
    borderRadius: 10,
    margin: 5,
    width: 200,
    alignItems: "center",
    backgroundColor: "#38a832",
  },
  buttonAdd: {
    padding: 10,
    borderRadius: 10,
    margin: 5,
    width: 200,
    alignItems: "center",
    backgroundColor: "#38a832",
  },

  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 18,
  },
  buttonTextAdd: {
    color: "white",
    textAlign: "center",
    fontSize: 10,
  },

  restaurantButton: {
    backgroundColor: "#721C37",
    marginLeft: 60,
    width: 120,
  },
  restaurantButtonG1: {
    backgroundColor: "#721C37",
    marginLeft: 40,
    width: 80,
  },

  restaurantButtonG2: {
    backgroundColor: "#721C37",
    marginLeft: 3,
    width: 90,
  },
  categoryButton: {
    backgroundColor: "#64B5F6",
  },
  paymentButton: {
    backgroundColor: "#81C784",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    marginLeft: 15,
    marginTop: 30,
  },
  modalItem: {
    fontSize: 18,
    marginVertical: 10,
  },
  modalButtonPay: {
    padding: 10,
    borderRadius: 10,
    margin: 5,
    width: 120,
    alignItems: "center",
  },
  closeButton: {
    backgroundColor: "#ed4a4a",
  },
  payButton: {
    backgroundColor: "#721C37",
  },
  payButtonDis: {
    backgroundColor: "#e1e6e4",
  },

  paymentText: {
    fontSize: 16,
    marginBottom: 10,
  },

  header: {
    marginBottom: 5,
    justifyContent: "space-between",
    // alignItems: "center"
  },
  walletView: {
    padding: 5,
    flex: 1,
  },

  walletHeader: {
    fontFamily: EDFonts.semiBold,
    fontSize: getProportionalFontSize(18),
    color: EDColors.black,
    // textAlign: isRTLCheck() ? 'right' : 'left'
  },

  walletText: {
    fontFamily: EDFonts.semiBold,
    fontSize: getProportionalFontSize(32),
    color: EDColors.black,
    marginRight: 5,
    // marginTop: 5
    // textAlign: isRTLCheck() ? 'right' : 'left'
  },

  image: {
    width: "100%",
    height: "100%",
    // resizeMode: "cover",
    // borderTopLeftRadius: 10,
    // borderTopRightRadius: 10,
  },
});
