import moment from "moment";
import React from "react";
import {
  FlatList,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { CreditCardInput } from "react-native-credit-card-input";
import { Icon } from "react-native-elements";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { PERMISSIONS } from "react-native-permissions";
import { heightPercentageToDP } from "react-native-responsive-screen";
import { initialWindowMetrics } from "react-native-safe-area-context";
import { NavigationEvents } from "react-navigation";
import { connect } from "react-redux";
import Assets from "../assets";
import AddressComponent from "../components/AddressComponent";
import { EDCardComponent } from "../components/EDCardComponent";
import EDDatePicker from "../components/EDDatePicker";
import EDPopupView from "../components/EDPopupView";
import EDRTLText from "../components/EDRTLText";
import EDRTLTextInput from "../components/EDRTLTextInput";
import EDRTLView from "../components/EDRTLView";
import EDThemeButton from "../components/EDThemeButton";
import { EDTimeSlotPicker } from "../components/EDTimeSlotPicker";
import { strings } from "../locales/i18n";
import {
  saveCheckoutDetails,
  saveGuestAddress,
  saveGuestDetails,
} from "../redux/actions/Checkout";
import {
  showDialogue,
  showNoInternetAlert,
  showValidationAlert,
} from "../utils/EDAlert";
import { EDColors } from "../utils/EDColors";
import {
  CARD_BRANDS,
  debugLog,
  funGetDateStr,
  funGetTime,
  getProportionalFontSize,
  GOOGLE_API_KEY,
  isRTLCheck,
  PAYMENT_TYPES,
  RESPONSE_SUCCESS,
  TextFieldTypes,
} from "../utils/EDConstants";
import { EDFonts } from "../utils/EDFontConstants";
import { getCountryName } from "../utils/LocationServiceManager";
import metrics from "../utils/metrics";
import { netStatus } from "../utils/NetworkStatusConnection";
import { checkPermission } from "../utils/PermissionServices";
import {
  checkOrder,
  checkScheduleDelivery,
  deleteAddress,
  getAddress,
  getAddressListAPI,
  getDunzoDeliveryAmountAPI,
  getPaymentList,
  getSavedCardsAPI,
  getWalletHistoryAPI,
} from "../utils/ServiceManager";
import Validations from "../utils/Validations";
import BaseContainer from "./BaseContainer";
import axios from "axios";
import BASE_URL_FIS_IP from "../../app/utils/EDConstants";

import {
  saveCurrentLocation,
  saveFoodType,
  saveLanguageInRedux,
  saveMapKeyInRedux,
  saveMinOrderAmount,
  save_delivery_dunzo__details,
  save_dunzodelivery_amount,
  save_order_payload_req,
  save_selected_slot_Id,
} from "../../app/redux/actions/User";
import SelectDropdown from "react-native-select-dropdown";
import { Dropdown } from "react-native-element-dropdown";
import AntDesign from "@expo/vector-icons/AntDesign";

export class AddressListContainer extends React.PureComponent {
  //#region LIFE CYCLE METHODS
  constructor(props) {
    super(props);
    this.validationsHelper = new Validations();
    this.countryCode = "";
    this.noCards = false;
    this.strOnScreenMessage = "";
    this.strOnScreenSubtitle = "";
    this.isScheduleMandatory = false;
    this.allowPreOrder = false;
    this.allowedDates = {};
    this.state = {
      isPreOrder: false,
      isLoading: false,
      isPaymentLoading: false,
      isSavedCardLoading: false,
      isAsyncSync: false,
      cartData: "",
      addressLine1: "",
      addressLine2: "",
      value: this.props.orderModeInRedux == 1 ? 0 : 1,
      latitude: 0.0,
      longitude: 0.0,
      city: "",
      zipCode: "",
      addressId: "",
      isSelectAddress: this.props.navigation.state.params.isSelectAddress,
      cartItems: this.props.navigation.state.params.cartItems,
      selectedIndex: -1,
      strComment: "",
      strDriverComment: "",
      selectedOption: "",
      availableOrderModes: undefined,
      strFullName: "",
      strLastName: "",
      strPhone: "",
      strEmail: "",
      shouldPerformValidation: false,
      guestAddress: undefined,
      eventTime: funGetTime(new Date().toString()),
      // eventDate: funGetDateStr(new Date().toString(), 'MMM DD, YYYY'),
      // eventDate: moment(new Date().toString()).format('MMM DD, YYYY'),
      eventDate: "",
      startTime: "",
      endTime: "",
      currentDate: "",
      isDatePickerVisible: false,
      isTimePickerVisible: false,
      arrTimeSlots: [],
      dateIndex: 0,
      defaultCard: undefined,
      cardError: "",
      countryCode: undefined,
      isCardSave: false,
      showCardInput: true,
      isDefaultCard: false,
      noDefaultCard: false,
      selectedAddress: undefined,
      loggedInUserwalletBalance: "",
      currentTotalSumValue: "",
      defaultIntialAddress: "",
      // isGuestVerified: true,
      dunzoPointDelivery: "",
      dunzo_Point_DeliveryFlag: 1,
      dunzo_Direct_Delivery_Amt: "",
      // loader_Flag_dunzo_CallResponse: false,
      slot_Master_against_category: [],
      isFocus: false,
      selected_Slot_value: "",
    };
    this.checkoutData = this.props.checkoutDetail;
  }

  componentDidMount() {
    // debugLog(
    //   "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ AddressListContainer1111111111111111"
    // );

    // debugLog(
    //   "****************************** Vijay ****************************** dunzo_Delivery_Amount ******************************",
    //   this.props.dunzo_Delivery_Amount
    // );
    debugLog(
      "****************************** Vijay ****************************** Number(this.props.dunzo_Delivery_Details) ******************************",
      this.props.dunzo_Delivery_Details
    );

    // debugLog(
    //   "****************************** Vijay ******************************     this.state.addressId",
    //   this.state.address_id
    // );
    // debugLog(
    //   "****************************** Vijay ******************************   this.props.userID",
    //   this.props.userID
    // );
    // debugLog(
    //   "****************************** Vijay ******************************   this.state.isSelectAddress",
    //   this.state.isSelectAddress
    // );

    // debugLog(
    //   "****************************** Vijay ******************************    this.state.selectedAddress",
    //   this.state.selectedAddress
    // );

    // debugLog(
    //   "****************************** Vijay ******************************   this.props.checkoutDetail",
    //   this.props.checkoutDetail
    // );

    // debugLog(
    //   "****************************** Vijay ******************************    this.checkoutData ",
    //   this.checkoutData
    // );

    // debugLog(
    //   "****************************** Vijay ******************************   this.checkoutData.minOrderAmount ",
    //   this.checkoutData.minOrderAmount
    // );

    // debugLog(
    //   "****************************** Vijay ******************************   this.state.loggedInUserwalletBalance",
    //   this.state.loggedInUserwalletBalance
    // );

    // debugLog(
    //   "****************************** Vijay ******************************  this.props.navigation.state.params.isSelectAddress",
    //   this.props.navigation.state.params.isSelectAddress
    // );

    // debugLog(
    //   "****************************** Vijay ******************************   this.props.navigation.state.params.cartItems",
    //   this.props.navigation.state.params.cartItems
    // );
    this.getWalletHistoryAPIREQ();
    this.getAddressList();
    this.dunzoApiCall();
    this.slot_masterCall();

    this.props.save_order_payload_req(
      this.props.dunzo_Delivery_Details?.directRestaurantDelivery
    );

    localStorage.setItem(
      "save_order_payload",
      this.props.dunzo_Delivery_Details?.directRestaurantDelivery
    );
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

  slot_masterCall = () => {
    let localstrSlotMaster = localStorage.getItem("Slot_Master_Rest_Category");
    let { slot_Master_against_category } = this.state;
    let filterstatesMastervalues = [];
    // debugLog(
    //   "this.props.slot_Master_details ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~     this.props.slot_Master_details",
    //   this.props.slot_Master_details
    // );

    if (
      this.props.slot_Master_details != undefined &&
      this.props.slot_Master_details != null &&
      this.props.slot_Master_details.length > 0
    ) {
      // debugLog(
      //   "localstrSlotMaster ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ 000000000000 ",
      //   localstrSlotMaster
      // );

      filterstatesMastervalues = this.props.slot_Master_details.map(
        ({ startTime, endTime, slotId, formatStartTime, formatEndTime }) => ({
          name: ` ${" "} ${startTime} - ${endTime}${" "}`,
          flag: false,
          slotId,
          value: slotId,
          formatStartTime,
          formatEndTime,
        })
      );
    } else {
      showValidationAlert("Delivery Slots not available, Please try later");
    }

    let filterstatesMastervalueszeroth = filterstatesMastervalues.map(
      (item, i) => {
        if (i == 0) {
          item.flag = true;
        } else {
          item.flag = false;
        }
        return item;
      }
    );

    debugLog(
      "filterstatesMastervalues ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~  filterstatesMastervalues ",
      filterstatesMastervalueszeroth
    );

    this.setState({
      slot_Master_against_category: filterstatesMastervalueszeroth || [],
      selected_Slot_value: filterstatesMastervalues[0]?.value,
    });

    this.props.save_selected_slot_Id(filterstatesMastervalues[0]);
  };

  onSuccessFetchWallet = (onSuccess) => {
    this.setState({ loggedInUserwalletBalance: onSuccess.wallet_money });
  };

  onFailureFetchWallet = (onFailure) => {};

  onCountrySelect = (country) => {
    this.countryCode = country.callingCode[0];
  };

  onStripeCountrySelect = (country) => {
    this.isCountryError = false;
    this.selectedCountry = country;
    // debugLog("COUNTRY :::::", country);
    this.setState({ cardError: "", countryCode: undefined });
  };

  //#region
  onTextChangeHandler = (value) => {
    this.setState({
      strComment: value,
    });
  };
  onDriverTextChangeHandler = (value) => {
    this.setState({
      strDriverComment: value,
    });
  };
  //#endregion

  //#region TEXT CHANGE EVENTS
  /**
   * @param {Value of textfield whatever user type} value
   ** @param {Unique identifier for every text field} identifier
   */
  textFieldTextDidChangeHandler = (value, identifier) => {
    var newText = value;
    if (identifier == "strPhone") {
      newText = value.replace(/[^0-9\\]/g, "");
      // this.setState({ isGuestVerified: false })
    }
    this.state[identifier] = newText;
    this.forceUpdate();
    this.setState({ shouldPerformValidation: false });
  };
  //#endregion

  showInfo = (type) => {
    switch (type) {
      case PAYMENT_TYPES.cash:
        showValidationAlert(strings("payCashMsg"));
        break;
      case PAYMENT_TYPES.online:
        showValidationAlert(strings("payOnlineMsg"));
        break;
    }
  };

  renderCustomCalender = () => {
    return (
      <EDPopupView isModalVisible={this.state.isDatePickerVisible}>
        <EDDatePicker
          currentDate={this.state.currentDate}
          _handleDatePicked={this._handleDatePicked}
          confirmDate={this.confirmDate}
          _hideDatePicker={this._hideDatePicker}
          // minDate={this.min_scheduled_date}
          // maxDate={this.max_scheduled_date}
          disabledByDefault={true}
          markedDates={this.allowedDates}
        />
      </EDPopupView>
    );
  };

  renderCustomTimePicker = () => {
    let keys = Object.keys(this.state.arrTimeSlots);
    let dateIndex = 0;
    keys.map((data, index) => {
      if (data == moment(this.state.currentDate).format("YYYY-MM-DD"))
        dateIndex = index;
    });
    let slotsToLoad = Object.values(this.state.arrTimeSlots)[dateIndex];
    return (
      <EDPopupView
        isModalVisible={this.state.isTimePickerVisible}
        shouldDismissModalOnBackButton
        onRequestClose={this._hideTimePicker}
      >
        {/* <EDTimePicker
					onCancel={this._hideTimePicker}
					onConfirm={this._handleTimePicked}
					isShowInterval={false}
					value={this.state.eventTime}
				/> */}
        <EDTimeSlotPicker
          onDismiss={this._hideTimePicker}
          arrSlot={slotsToLoad}
          selectedTime={this.state.startTime}
          onTimePicked={this.onTimePicked}
        />
      </EDPopupView>
    );
  };

  onTimePicked = (slot) => {
    this.setState({ startTime: slot.start, endTime: slot.end });

    this._hideTimePicker();
  };

  /** SHOW DATE PICKER */
  _showDatePicker = () => {
    this.setState({ isDatePickerVisible: true });
  };

  /** HIDE DATE PICKER */
  _hideDatePicker = () => {
    this.setState({
      isDatePickerVisible: false,
      currentDate: this.state.eventDate,
    });
  };

  /** SHOW TIME PICKER */
  _showTimePicker = (value) =>
    this.setState({ isTimePickerVisible: true, forTime: value });

  /** HIDE TIME PICKER */
  _hideTimePicker = () => this.setState({ isTimePickerVisible: false });

  confirmDate = () => {
    // var datePicked = funGetDate(this.state.currentDate)
    let keys = Object.keys(this.state.arrTimeSlots);
    let dateIndex = 0;
    keys.map((data, index) => {
      if (data == moment(this.state.currentDate).format("YYYY-MM-DD"))
        dateIndex = index;
    });
    let slotsToLoad = Object.values(this.state.arrTimeSlots)[dateIndex];
    var datePicked = funGetDateStr(
      this.state.currentDate.toString(),
      "MMM DD, YYYY"
    );
    this.setState({
      eventDate: datePicked,
      isDatePickerVisible: false,
      startTime: slotsToLoad[0].start,
      endTime: slotsToLoad[0].end,
    });
  };

  /** DATE PICKER HANDLER */
  _handleDatePicked = (date) => {
    for (var key in this.allowedDates) {
      this.allowedDates[key].selected = key == date.dateString;
      this.allowedDates[key].marked = key == date.dateString;
      if (key == date.dateString)
        this.setState({ currentDate: date.dateString });
    }

    // this._hideDatePicker()
  };

  /** TIME PICKER HANDLER */
  _handleTimePicked = (time) => {
    this.setState({ eventTime: time });

    this._hideTimePicker();
  };

  togglePreOrder = () => {
    this.setState({ isPreOrder: !this.state.isPreOrder });
  };

  verifyPhoneNumber = (checkout_data) => {
    this.props.navigation.navigate("OTPVerificationFromAddressList", {
      isForGuest: true,
      phNo: this.state.strPhone,
      phoneCode: this.countryCode,
      // setVerified: this.setVerified,
      checkout_data: checkout_data,
      guest_first_name: this.state.strFullName,
      guest_email: this.state.strEmail,
    });
  };

  setVerified = () => {
    this.setState({ isGuestVerified: true });
  };

  dunzo_Point_DeliveryFlagCall = (value) => {
    let {
      dunzo_Point_DeliveryFlag,
      dunzo_Direct_Delivery_Amt,
      dunzoPointDelivery,
      isPaymentLoading,
      isLoading,
    } = this.state;

    // if (
    //   this?.state?.dunzo_Direct_Delivery_Amt <
    //   this.state?.dunzoPointDelivery?.directPointDelivery?.price
    // ) {
    //   return false;
    // }

    this.setState({ isLoading: true, isPaymentLoading: true });

    this.setState(
      {
        dunzo_Point_DeliveryFlag: value,
      },
      () => {
        let {
          dunzo_Point_DeliveryFlag,
          dunzo_Direct_Delivery_Amt,
          dunzoPointDelivery,
        } = this.state;

        // debugLog(
        //   "***************************************** dunzo_Point_DeliveryFlag",
        //   dunzo_Point_DeliveryFlag
        // );

        let calulatedunzodeliveryAMT =
          (dunzo_Point_DeliveryFlag == 0 && "0") ||
          (dunzo_Point_DeliveryFlag == 1 &&
            this.state?.dunzoPointDelivery?.directPointDelivery?.amount) ||
          (dunzo_Point_DeliveryFlag == 2 &&
            this.state?.dunzoPointDelivery?.directRestaurantDelivery?.amount);

        debugLog(
          "***************************************** 0000000000000000000000000000000",
          calulatedunzodeliveryAMT
        );

        // debugLog(
        //   "*****************************************    111111111111111111111111",
        //   this.state?.dunzoPointDelivery?.directPointDelivery?.price
        // );

        // debugLog(
        //   "***************************************** 222222222222222222222",
        //   this.state.dunzoPointDelivery?.directDelivery
        // );

        let dunzo_Delivery_Amount = Number(calulatedunzodeliveryAMT);

        debugLog(
          "***************************************** ***************************************** 3333333333333333333333333333333333333333333",
          dunzo_Delivery_Amount
        );

        this.props.save_dunzodelivery_amount(dunzo_Delivery_Amount);

        this.setState({
          dunzoPointDelivery: this.state.dunzoPointDelivery,
          // dunzo_Direct_Delivery_Amt:
          //   dunzo_Delivery_Amount || this.state.dunzo_Direct_Delivery_Amt,
          dunzo_Direct_Delivery_Amt: dunzo_Delivery_Amount,
        });

        if (dunzo_Point_DeliveryFlag == 0) {
          localStorage.setItem(
            "save_order_payload",
            this.state?.dunzoPointDelivery?.selfPickUp
          );

          this.props.save_order_payload_req(
            this.state?.dunzoPointDelivery?.selfPickUp
          );
        } else if (dunzo_Point_DeliveryFlag == 1) {
          localStorage.setItem(
            "save_order_payload",
            this.state?.dunzoPointDelivery?.directPointDelivery
          );

          this.props.save_order_payload_req(
            this.state?.dunzoPointDelivery?.directPointDelivery
          );
        } else if (dunzo_Point_DeliveryFlag == 2) {
          localStorage.setItem(
            "save_order_payload",
            this.state?.dunzoPointDelivery?.directRestaurantDelivery
          );

          this.props.save_order_payload_req(
            this.state?.dunzoPointDelivery?.directRestaurantDelivery
          );
        } else {
          localStorage.setItem("save_order_payload", {});
        }
      }
    );
    this.onWillFocus();
    this.setState({ isLoading: false, isPaymentLoading: false });
  };

  slot_Master_against_category_Call = (value) => {
    let { slot_Master_against_category, selected_Slot_value } = this.state;
    // let filterstatesMastervalues = slot_Master_against_category.map(
    //   (item, i) => {
    //     if (i == value) {
    //       item.flag = true;
    //     } else {
    //       item.flag = false;
    //     }
    //     return item;
    //   }
    // );
    let filterstatesMastervalues =
      slot_Master_against_category &&
      slot_Master_against_category.filter((item, i) => {
        if (item?.value == value?.value) {
          return item;
        }
      });
    // debugLog(
    //   "****************************** Vijay ****************************** filterstatesMastervalues",
    //   filterstatesMastervalues
    // );
    // debugLog(
    //   "****************************** Vijay ****************************** filterstatesMastervalues",
    //   filterstatesMastervalues[value]
    // );
    this.setState({
      // slot_Master_against_category: filterstatesMastervalues,
      selected_Slot_value: value?.value,
    });
    // this.props.save_selected_slot_Id(filterstatesMastervalues[value]);
    this.props.save_selected_slot_Id(filterstatesMastervalues[0]);
  };

  //#region
  /** RENDER METHOD */
  render() {
    let {
      dunzo_Point_DeliveryFlag,
      dunzo_Direct_Delivery_Amt,
      isSelectAddress,
      dunzoPointDelivery,
      slot_Master_against_category,
      isFocus,
      selected_Slot_value,
      // loader_Flag_dunzo_CallResponse,
    } = this.state;

    // debugLog(
    //   "this.props.dunzo_Delivery_Amount  **************************   render  props **********************",
    //   this.props.dunzo_Delivery_Amount
    // );
    // debugLog(
    //   "this.props.dunzo_Delivery_Details *****************************   render  props   ******************** ",
    //   this.props.dunzo_Delivery_Details
    // );

    // debugLog(
    //   "  this.state?.dunzoPointDelivery  ***********************  render state 11 **********************",
    //   this.state?.dunzoPointDelivery
    // );

    // debugLog(
    //   " this.state?.dunzo_Direct_Delivery_Amt  **************************** render  state  22  ******************** ",
    //   this.state?.dunzo_Direct_Delivery_Amt
    // );

    // debugLog(
    //   "dunzo_Point_DeliveryFlag ***********************render state 55 ********************",
    //   this?.state?.dunzo_Point_DeliveryFlag
    // );

    // debugLog(
    //   "this.state.dunzo_Point_DeliveryFlag *****************************   render  state 333  ******************** ",
    //   this?.state?.dunzo_Direct_Delivery_Amt >
    //     this.state?.dunzoPointDelivery?.directPointDelivery?.price
    // );

    debugLog(
      "this.state?.slot_Master_against_category.length **************************   render  this.state?.slot_Master_against_category.length **********************",
      this.state?.slot_Master_against_category
    );

    // debugLog(
    //   "Object.keys(this.state?.dunzoPointDelivery).length  ************************** Object.keys(this.state?.dunzoPointDelivery).length **********************",
    //   Object.keys(this.state?.dunzoPointDelivery).length
    // );

    return (
      <BaseContainer
        title={
          this.state.isSelectAddress
            ? strings("selectAddress")
            : strings("myAddress")
        }
        left={isRTLCheck() ? "arrow-forward" : "arrow-back"}
        right={[]}
        onLeft={this.onBackEventHandler}
        loading={
          this.state.isLoading ||
          this.state.isPaymentLoading ||
          this.state.isSavedCardLoading
        }
        onConnectionChangeHandler={this.onWillFocus}
      >
        {this.renderCustomCalender()}
        {this.renderCustomTimePicker()}

        {/* MAIN VIEW */}
        <KeyboardAwareScrollView
          style={{ flex: 1, backgroundColor: EDColors.radioSelected }}
          bounces={false}
          keyboardShouldPersistTaps="handled"
          behavior="padding"
          showsVerticalScrollIndicator={false}
          enabled
          enableAutoAutomaticScroll={false}
          enableOnAndroid={true}
        >
          <View
            pointerEvents={this.state.isLoading ? "none" : "auto"}
            style={{ flex: 1 }}
          >
            <NavigationEvents onWillFocus={this.onWillFocus} />
            {this.props.userID !== undefined &&
            this.props.userID !== null ? null : (
              <View style={style.contactView}>
                <EDRTLText
                  style={[
                    style.titleText,
                    {
                      marginHorizontal: 0,
                    },
                  ]}
                  title={strings("contactInfo")}
                />
                {/* USERNAME */}
                <EDRTLTextInput
                  textstyle={{ color: EDColors.black }}
                  icon="person"
                  type={TextFieldTypes.default}
                  identifier={"strFullName"}
                  placeholder={strings("firstName")}
                  onChangeText={this.textFieldTextDidChangeHandler}
                  initialValue={this.state.strFullName}
                  errorFromScreen={
                    this.state.shouldPerformValidation
                      ? this.validationsHelper.checkForEmpty(
                          this.state.strFullName,
                          strings("emptyName")
                        )
                      : ""
                  }
                />

                {/* LAST NAME */}
                <EDRTLTextInput
                  textstyle={{ color: EDColors.black }}
                  icon="person"
                  type={TextFieldTypes.default}
                  identifier={"strLastName"}
                  placeholder={strings("lastName")}
                  onChangeText={this.textFieldTextDidChangeHandler}
                  initialValue={this.state.strLastName}
                  errorFromScreen={
                    this.state.shouldPerformValidation
                      ? this.validationsHelper.checkForEmpty(
                          this.state.strLastName,
                          strings("emptyLastName")
                        )
                      : ""
                  }
                />
                {/* PHONE NUMBER */}
                <EDRTLTextInput
                  textstyle={{ color: EDColors.black }}
                  icon="call"
                  type={TextFieldTypes.phone}
                  countryData={this.props.countryArray}
                  dialCode={
                    this.countryCode !== ""
                      ? this.countryCode
                      : this.props.countryArray !== undefined &&
                        this.props.countryArray !== null &&
                        this.props.countryArray[0] !== undefined &&
                        this.props.countryArray[0].phonecode !== undefined
                      ? this.props.countryArray[0].phonecode
                      : undefined
                  }
                  identifier={"strPhone"}
                  onCountrySelect={this.onCountrySelect}
                  placeholder={strings("phoneNumber")}
                  onChangeText={this.textFieldTextDidChangeHandler}
                  initialValue={this.state.strPhone}
                  errorFromScreen={
                    this.state.shouldPerformValidation
                      ? this.validationsHelper.validateMobile(
                          this.state.strPhone,
                          strings("emptyPhone"),
                          this.countryCode
                        )
                      : ""
                  }
                />
                {/* {this.validationsHelper.validateMobile(
									this.state.strPhone,
									strings('emptyPhone'),
									this.countryCode
								).trim() == "" ?
									(this.state.isGuestVerified ?
										<EDRTLText title={strings("verified")} style={[style.verifiedText, { color: EDColors.veg, textAlign: "right" }]} />
										:
										<EDRTLView style={{ alignItems: "center", justifyContent: "space-between", flex: 1 }}>
											<EDRTLText title={strings("notVerified")} style={[style.verifiedText, { color: EDColors.error }]} />
											<EDRTLText title={strings("verifyNow")}
												onPress={this.verifyPhoneNumber}
												style={{
													color: EDColors.primary, textDecorationLine: "underline",
													fontFamily: EDFonts.bold, fontSize: getProportionalFontSize(13)
												}} />

										</EDRTLView>
									) : null} */}

                <EDRTLTextInput
                  icon="email"
                  textstyle={{ color: EDColors.black }}
                  type={TextFieldTypes.email}
                  identifier={"strEmail"}
                  placeholder={strings("email")}
                  onChangeText={this.textFieldTextDidChangeHandler}
                  initialValue={this.state.strEmail}
                  errorFromScreen={
                    this.state.shouldPerformValidation
                      ? this.validationsHelper.validateEmail(
                          this.state.strEmail,
                          strings("emptyEmail")
                        )
                      : ""
                  }
                />
              </View>
            )}

            {/* IF SELECT ADDRESS */}
            {this.state.isSelectAddress &&
            this.state.availableOrderModes !== undefined &&
            this.state.availableOrderModes !== null &&
            this.state.availableOrderModes.length !== 0 ? (
              <View>
                {/* {this.allowPreOrder ?
									<EDRTLView style={{ flex: 1, marginTop: 10, marginHorizontal: 10, padding: 10 }}>
										<EDRTLText
											onPress={this.isScheduleMandatory ? null : this.togglePreOrder}
											style={[style.orderView, { flex: 1, margin: 0, padding: 0 }]} title={
												this.isScheduleMandatory ? strings('scheduleMandatory') :
													strings('scheduleOptional')} />
										{this.isScheduleMandatory ? null :
											<Icon type="feather"
												color={EDColors.primary}
												name={this.state.isPreOrder ? "check-square" : "square"}
												onPress={this.togglePreOrder}
											/>
										}

									</EDRTLView>
									: null} */}
                {this.allowPreOrder &&
                (this.isScheduleMandatory || this.state.isPreOrder) ? (
                  <EDRTLView
                    style={{
                      alignItems: "center",
                      justifyContent: "space-between",
                      flex: 1,
                    }}
                  >
                    <View style={style.dateView}>
                      <EDRTLView style={[style.dataView]}>
                        <Icon
                          name={"calendar"}
                          color={EDColors.primary}
                          containerStyle={style.personIconStyle}
                          size={getProportionalFontSize(15)}
                          type={"ant-design"}
                        />
                        <EDRTLText
                          numberOfLines={1}
                          style={[style.dateTimeText]}
                          title={strings("selectDate")}
                        />
                        <Icon
                          name={"calendar"}
                          color={EDColors.transparent}
                          containerStyle={style.personIconStyle}
                          size={getProportionalFontSize(15)}
                          type={"ant-design"}
                        />
                      </EDRTLView>
                      <View style={style.datePickerView}>
                        <TouchableOpacity onPress={this._showDatePicker}>
                          <EDRTLView>
                            <EDRTLText
                              numberOfLines={1}
                              style={[
                                [style.datePickerText, { marginHorizontal: 3 }],
                              ]}
                              title={
                                this.state.eventDate !== "Invalid date"
                                  ? this.state.eventDate
                                  : moment(new Date().toString()).format(
                                      "MMM DD, YYYY"
                                    )
                              }
                            />
                            <Icon
                              name={"keyboard-arrow-down"}
                              size={getProportionalFontSize(15)}
                              color={"#C4C4C4"}
                              style={style.dateIcon}
                            />
                          </EDRTLView>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={style.dateView}>
                      <EDRTLView style={[style.dataView]}>
                        <Icon
                          name={"clockcircleo"}
                          color={EDColors.primary}
                          containerStyle={style.personIconStyle}
                          size={getProportionalFontSize(15)}
                          type={"ant-design"}
                        />
                        <EDRTLText
                          numberOfLines={1}
                          style={[style.dateTimeText]}
                          title={strings("selectTime")}
                        />
                        <Icon
                          name={"clockcircleo"}
                          color={EDColors.transparent}
                          containerStyle={style.personIconStyle}
                          size={getProportionalFontSize(15)}
                          type={"ant-design"}
                        />
                      </EDRTLView>

                      {/* SELECT TIME */}
                      <View style={style.datePickerView}>
                        <TouchableOpacity
                          onPress={() => this._showTimePicker("event")}
                        >
                          <EDRTLText
                            numberOfLines={1}
                            style={[style.timeTextStyle]}
                            title={
                              this.state.startTime + " - " + this.state.endTime
                            }
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </EDRTLView>
                ) : null}

                <EDRTLView style={style.walletContainer}>
                  {/* <Icon
                    name={"directions-bike"}
                    size={getProportionalFontSize(20)}
                    style={style.headerIconStyle}
                  /> */}

                  <EDRTLView
                    style={{
                      alignItems: "center",
                      marginHorizontal: 15,
                      marginVertical: 10,
                    }}
                  >
                    <EDRTLText
                      style={style.walletText}
                      title={` Available Wallet Balance  ₹ ${this.state.loggedInUserwalletBalance} \n Current Item Sum Total    ₹ ${this.state?.currentTotalSumValue}.00 
                      `}
                    />

                    {/* {Number(this.checkoutData.minOrderAmount) <
                      parseInt(this.state.loggedInUserwalletBalance) && (
                      <EDRTLText
                        style={style.walletText}
                        title={`Available balance  ₹. ${this.state.loggedInUserwalletBalance} `}
                      />
                    )}
                    {Number(this.checkoutData.minOrderAmount) >
                      parseInt(this.state.loggedInUserwalletBalance) && (
                      <EDRTLText
                        style={style.walletText}
                        title={`Low Wallet Balance: ${parseInt(
                          this.state.loggedInUserwalletBalance
                        )}`}
                      />
                    )} */}
                  </EDRTLView>
                </EDRTLView>

                {/* <EDRTLView style={style.walletContainer}>
                  <EDRTLView
                    style={{
                      alignItems: "center",
                      marginHorizontal: 15,
                      marginVertical: 10,
                    }}
                  >
                    <EDRTLText
                      style={style.walletText}
                      title={`Current Item Sum Total  ₹  ${this.state?.currentTotalSumValue} `}
                    />
                  </EDRTLView>
                </EDRTLView> */}

                {/* <EDRTLText
                  style={style.orderView}
                  title={strings("orderType")}
                /> */}

                {/* <View style={style.deliveryOptionView}>
                  {this.state.availableOrderModes.includes("Delivery") ? (
                    <TouchableOpacity
                      onPress={this.selectCod}
                      style={[
                        style.touchableView,
                        {
                          flexDirection: isRTLCheck() ? "row-reverse" : "row",
                          marginBottom: 20,
                        },
                      ]}
                    >
                      <EDRTLView style={style.childDeliveryOptionView}>
                        <Icon
                          name={"directions-bike"}
                          size={getProportionalFontSize(20)}
                          style={style.headerIconStyle}
                          color={
                            this.state.value == 1
                              ? EDColors.primary
                              : EDColors.text
                          }
                        />
                        <EDRTLText
                          style={[
                            style.deliveryTextStyle,
                            {
                              color:
                                this.state.value == 1
                                  ? EDColors.black
                                  : EDColors.text,
                            },
                          ]}
                          title={strings("byDelivery")}
                        ></EDRTLText>
                      </EDRTLView>
                      {this.state.value == 1 ? (
                        <Icon
                          name={"done"}
                          size={getProportionalFontSize(18)}
                          color={EDColors.primary}
                        />
                      ) : null}
                    </TouchableOpacity>
                  ) : null}
                  {this.state.availableOrderModes.includes("PickUp") ? (
                    <TouchableOpacity
                      onPress={this.selectPickUp}
                      style={[
                        style.touchableView,
                        {
                          flexDirection: isRTLCheck() ? "row-reverse" : "row",
                          marginTop: 20,
                        },
                      ]}
                    >
                      <EDRTLView style={style.childDeliveryOptionView}>
                        <Icon
                          name={"directions-walk"}
                          size={getProportionalFontSize(20)}
                          style={style.headerIconStyle}
                          color={
                            this.state.value == 0
                              ? EDColors.primary
                              : EDColors.text
                          }
                        />
                        <EDRTLText
                          style={[
                            style.deliveryTextStyle,
                            {
                              color:
                                this.state.value == 0
                                  ? EDColors.black
                                  : EDColors.text,
                            },
                          ]}
                          title={strings("selfPickup")}
                        />
                      </EDRTLView>
                      {this.state.value == 0 ? (
                        <Icon
                          name={"done"}
                          size={getProportionalFontSize(18)}
                          color={EDColors.primary}
                        />
                      ) : null}
                    </TouchableOpacity>
                  ) : null}
                </View> */}
              </View>
            ) : null}
            {this.state.value == 1 ? (
              <>
                {/* ADD ADDRESS */}
                {/* <EDRTLView style={style.addView}>
                  <EDRTLText
                    style={style.titleText}
                    title={strings("addressTitle")}
                  />
                  <EDThemeButton
                    icon={
                      this.props.userID !== undefined &&
                      this.props.userID !== null &&
                      this.props.userID !== ""
                        ? this.state.selectedAddress != undefined &&
                          this.state.selectedAddress != null
                          ? "edit"
                          : "add"
                        : this.state.guestAddress == undefined
                        ? "add"
                        : "edit"
                    }
                    label={
                      this.props.userID !== undefined &&
                      this.props.userID !== null &&
                      this.props.userID !== ""
                        ? this.state.selectedAddress &&
                          this.state.selectedAddress != null
                          ? strings("changeAddress")
                          : strings("addAddress")
                        : this.state.guestAddress == undefined
                        ? strings("addAddress")
                        : strings("changeAddress")
                    }
                    style={{
                      flex: 1,
                      marginTop: 0,
                      height: 40,
                      borderRadius: 16,
                      paddingVertical: 0,
                      marginHorizontal: 3,
                    }}
                    textStyle={{
                      fontSize: getProportionalFontSize(14),
                      paddingLeft: 7,
                      paddingRight: 7,
                    }}
                    onPress={this.onAddAddressEventHandler}
                  />
                </EDRTLView> */}

                {/* ADDRESS LIST */}
                {/* {this.props.userID !== undefined &&
                this.props.userID !== null &&
                this.props.userID !== "" ? (
                  this.state.selectedAddress != undefined &&
                  this.state.selectedAddress != null &&
                  this.state.selectedAddress.address !== undefined ? (
                    <AddressComponent
                      data={this.state.selectedAddress}
                      index={0}
                      isSelectedAddress={this.state.isSelectAddress}
                      isAddressList={true}
                      onPress={this.addressSelectionAction}
                      deleteAddress={this.onDeleteAddressEventHandler}
                      editAddress={this.navigateTomap}
                    />
                  ) : this.state.isLoading ? null : (
                    <EDRTLText
                      title={strings("noAddressMsg")}
                      style={style.noAddress}
                    />
                  )
                ) : null} */}
                {/* {this.props.userID == undefined ||                
                this.props.userID == null ||
                this.props.userID == "" ? (
                  this.state.guestAddress !== undefined ? (
                    <AddressComponent
                      data={this.state.guestAddress}
                      index={0}
                      isSelectedAddress={true}
                      isAddressList={true}
                      onPress={this.addressSelectionAction}
                      deleteAddress={this.onDeleteAddressEventHandler}
                      editAddress={this.navigateTomap}
                    />
                  ) : this.state.isLoading || this.state.value !== 1 ? null : (
                    <EDRTLText
                      title={strings("guestAddressError")}
                      style={style.noAddress}
                    />
                  )
                ) : null} */}
              </>
            ) : null}

            {/* {this.state.dunzo_Direct_Delivery_Amt > 0 ? ( */}
            <View style={{ flex: 1 }}>
              <EDRTLText
                title={"Delivery Address"}
                style={style.paymentHeader}
              />
            </View>
            {/* ) : null} */}

            {/* {this.state?.dunzo_Direct_Delivery_Amt > 0 ? ( */}
            <EDRTLView style={style.walletContainer}>
              <EDRTLView
                style={{
                  alignItems: "center",
                  marginHorizontal: 15,
                  marginVertical: 10,
                }}
              >
                <Icon
                  name={"home-filled"}
                  color={EDColors.primary}
                  containerStyle={{ marginRight: 20 }}
                />

                {this.props?.currentLocation?.address &&
                this.props?.currentLocation?.address.length > 0 ? (
                  <EDRTLText
                    // title={`${this.props?.currentLocation?.address }`}
                    title={`${this.props?.currentLocation?.address.slice(
                      0,
                      30
                    )}.. `}
                    // title={this.props?.currentLocation?.address.substring(
                    //   this.props?.currentLocation?.address.indexOf(",") + 2
                    // )}
                    // style={style.currentLocationSubText}
                    style={style.dunzoDeliveryHeader}
                  />
                ) : null}
              </EDRTLView>
            </EDRTLView>
            {/* ) : null} */}

            {this.state?.slot_Master_against_category &&
            this.state?.slot_Master_against_category.length > 0 ? (
              <View style={{ flex: 1 }}>
                <EDRTLText
                  title={`Choose Delivery Slot (${
                    this.props?.type_today_tomorrow__date
                      ? this.props?.type_today_tomorrow__date
                          .split("-")
                          .reverse()
                          .join("-")
                      : null
                  })`}
                  style={style.paymentHeader}
                />
              </View>
            ) : null}

            <View style={styles.container}>
              <Dropdown
                style={[styles.dropdown, isFocus && { borderColor: "blue" }]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={this.state?.slot_Master_against_category}
                // search
                maxHeight={300}
                labelField="name"
                valueField="value"
                placeholder={!isFocus ? "Select Slots" : "..."}
                searchPlaceholder="Search..."
                value={selected_Slot_value}
                // onFocus={() => setIsFocus(true)}
                // onBlur={() => setIsFocus(false)}
                onChange={(item, i) => {
                  debugLog("item", item);
                  debugLog("i", i);
                  // setValue(item.value);
                  this.slot_Master_against_category_Call(item);
                  this.setState({
                    selected_Slot_value: item?.value,
                    isFocus: !isFocus,
                  });
                  // setIsFocus(false);
                }}
                renderLeftIcon={() => (
                  <AntDesign
                    style={styles.icon}
                    color={isFocus ? "blue" : "black"}
                    name="Safety"
                    size={20}
                  />
                )}
              />
            </View>

            {/* {this.state?.slot_Master_against_category.length > 0 &&
              this.state?.slot_Master_against_category.map(
                (slot_Master_against_categoryitems, index) => {
                  return (
                    <EDRTLView style={style.walletContainer}>
                      <EDRTLView
                        style={{
                          alignItems: "center",
                          marginHorizontal: 15,
                          marginVertical: 10,
                        }}
                      >
                        <Icon
                          name="clockcircleo"
                          color={EDColors.black}
                          size={getProportionalFontSize(13)}
                          type={"ant-design"}
                          style={{ color: "red" }}
                        />

                        <EDRTLText
                          title={`${slot_Master_against_categoryitems?.name}`}
                          style={style.dunzoDeliveryHeader}
                        />
                        <Icon
                          name={
                            slot_Master_against_categoryitems?.flag
                              ? "check-box"
                              : "check-box-outline-blank"
                          }
                          color={EDColors.primary}
                          onPress={() => {
                            this.slot_Master_against_category_Call(index);
                          }}
                        />
                      </EDRTLView>
                    </EDRTLView>
                  );
                }
              )} */}

            {this.state.dunzo_Direct_Delivery_Amt >= 0 ? (
              // ||
              // this.props.dunzo_Delivery_Amount > 0
              <View style={{ flex: 1 }}>
                <EDRTLText
                  title={"Choose Delivery Option"}
                  style={style.paymentHeader}
                />
              </View>
            ) : null}

            {this.state?.dunzoPointDelivery?.selfPickUp?.amount >= 0 ? (
              <EDRTLView style={style.walletContainer}>
                <EDRTLView
                  style={{
                    alignItems: "center",
                    marginHorizontal: 15,
                    marginVertical: 10,
                  }}
                >
                  {/* <Icon
                    name={"business"}
                    color={EDColors.primary}
                    containerStyle={{ marginRight: 20 }}
                  /> */}

                  {this.state?.dunzoPointDelivery?.selfPickUp?.name &&
                  this.state?.dunzoPointDelivery?.selfPickUp?.name.length >=
                    0 ? (
                    <EDRTLText
                      title={`${this.state?.dunzoPointDelivery?.selfPickUp?.name.slice(
                        0,
                        20
                      )} (₹ ${
                        this.state?.dunzoPointDelivery?.selfPickUp?.amount
                      } - ${
                        this.state?.dunzoPointDelivery?.selfPickUp?.distance ||
                        0
                      } K.M )`}
                      style={style.dunzoDeliveryHeader}
                    />
                  ) : null}

                  {/* <EDRTLText
                    title={`(₹ ${
                      this.state?.dunzoPointDelivery?.selfPickUp?.amount
                    } - ${
                      this.state?.dunzoPointDelivery?.selfPickUp?.distance || 0
                    } K.M )`}
                    style={{
                      fontSize: getProportionalFontSize(16),
                      fontFamily: EDFonts.bold,
                      color: EDColors.black,
                      // textAlign: "justify",
                      // marginHorizontal: 15,
                      // marginTop: 20,
                      // marginLeft: "auto",
                      marginLeft: -150,
                      // marginRight: 150,
                      // alignItems: "left",
                      // textAlign: "left",
                      // margin: "auto",
                      // paddingRight: "right",
                      // Right: 610,
                    }}
                  /> */}
                  <Icon
                    name={
                      this.state?.dunzo_Point_DeliveryFlag === 0
                        ? "check-box"
                        : "check-box-outline-blank"
                    }
                    color={EDColors.primary}
                    onPress={(e) => {
                      this.dunzo_Point_DeliveryFlagCall(0);
                    }}
                  />
                </EDRTLView>
              </EDRTLView>
            ) : null}

            {this.state?.dunzoPointDelivery?.directPointDelivery?.amount >=
            0 ? (
              <EDRTLView style={style.walletContainer}>
                <EDRTLView
                  style={{
                    alignItems: "center",
                    marginHorizontal: 15,
                    marginVertical: 10,
                  }}
                >
                  {/* <Icon
                    name={"business"}
                    color={EDColors.primary}
                    containerStyle={{ marginRight: 20 }}
                  /> */}

                  {this.state?.dunzoPointDelivery?.directPointDelivery?.name &&
                  this.state?.dunzoPointDelivery?.directPointDelivery?.name
                    .length >= 0 ? (
                    <EDRTLText
                      title={`${this.state?.dunzoPointDelivery?.directPointDelivery?.name.slice(
                        0,
                        20
                      )} (₹ ${
                        this.state?.dunzoPointDelivery?.directPointDelivery
                          ?.amount
                      } - ${
                        this.state?.dunzoPointDelivery?.directPointDelivery
                          ?.distance
                      } K.M )`}
                      style={style.dunzoDeliveryHeader}
                    />
                  ) : null}

                  <Icon
                    name={
                      this.state?.dunzo_Point_DeliveryFlag === 1
                        ? "check-box"
                        : "check-box-outline-blank"
                    }
                    color={EDColors.primary}
                    onPress={(e) => {
                      this.dunzo_Point_DeliveryFlagCall(1);
                    }}
                  />
                  {/* <EDRTLText
                    title={`\n (₹ ${
                      this.state?.dunzoPointDelivery?.directPointDelivery
                        ?.amount
                    } - ${
                      this.state?.dunzoPointDelivery?.directPointDelivery
                        ?.distance || 0
                    } K.M )`}
                    style={{
                      // style.dunzoDeliveryHeader}
                      fontSize: getProportionalFontSize(16),
                      fontFamily: EDFonts.bold,
                      color: EDColors.black,
                      // marginHorizontal: 15,
                      // marginTop: 20,
                      // marginLeft: "auto",
                      // textAlign: "justify",
                      marginLeft: -150,
                      // marginRight: 150,
                      // alignItems: "left",
                      // textAlign: "left",
                      // margin: "auto",
                      // paddingRight: "right",
                      // Right: 610,
                    }}
                  /> */}
                </EDRTLView>
              </EDRTLView>
            ) : null}

            {this.state?.dunzoPointDelivery?.directRestaurantDelivery?.amount >=
            0 ? (
              <EDRTLView style={style.walletContainer}>
                <EDRTLView
                  style={{
                    alignItems: "center",
                    marginHorizontal: 15,
                    marginVertical: 10,
                  }}
                >
                  {/* <Icon
                    name={"business"}
                    color={EDColors.primary}
                    containerStyle={{ marginRight: 20 }}
                  /> */}

                  {this.state?.dunzoPointDelivery?.directRestaurantDelivery
                    ?.name &&
                  this.state?.dunzoPointDelivery?.directRestaurantDelivery?.name
                    .length >= 0 ? (
                    <EDRTLText
                      title={`${
                        this.state?.dunzoPointDelivery?.directRestaurantDelivery?.name.slice(
                          0,
                          20
                        ) || "My Bhojan"
                      } (₹ ${
                        this.state?.dunzoPointDelivery?.directRestaurantDelivery
                          ?.amount
                      } - ${
                        this.state?.dunzoPointDelivery?.directRestaurantDelivery
                          ?.distance
                      } K.M )`}
                      style={style.dunzoDeliveryHeader}
                    />
                  ) : (
                    <EDRTLText
                      title={`${"My Bhojan"} (₹ ${
                        this.state?.dunzoPointDelivery?.directRestaurantDelivery
                          ?.amount
                      } - ${
                        this.state?.dunzoPointDelivery?.directRestaurantDelivery
                          ?.distance
                      } K.M )`}
                      style={style.dunzoDeliveryHeader}
                    />
                  )}

                  {/* <EDRTLText
                    title={`Direct Restaurant Deliveryasdfasdfasdf \n `}
                    style={style.dunzoDeliveryHeader}
                  /> */}

                  <Icon
                    name={
                      this.state?.dunzo_Point_DeliveryFlag === 2
                        ? "check-box"
                        : "check-box-outline-blank"
                    }
                    color={EDColors.primary}
                    onPress={(e) => {
                      this.dunzo_Point_DeliveryFlagCall(2);
                    }}
                  />
                  {/* <EDRTLText
                    title={`\n (₹ ${
                      this.state?.dunzoPointDelivery?.directRestaurantDelivery
                        ?.amount
                    } - ${
                      this.state?.dunzoPointDelivery?.directRestaurantDelivery
                        ?.distance || 0
                    } K.M )`}
                    style={{
                      // style.dunzoDeliveryHeader}
                      fontSize: getProportionalFontSize(16),
                      fontFamily: EDFonts.bold,
                      color: EDColors.black,
                      // alignItems:"center",
                      // marginHorizontal: 15,
                      // marginTop: 20,
                      // marginLeft: "auto",
                      //textAlign: "justify",
                      // marginLeft: -70,
                      // marginRight: 150,
                      // alignItems: "left",
                      // textAlign: "left",
                      // margin: "auto",
                      // paddingRight: "right",
                      // Right: 610,
                    }}
                  /> */}
                </EDRTLView>
              </EDRTLView>
            ) : null}

            {/* {this.state?.dunzo_Direct_Delivery_Amt >= 0 ? (
              <EDRTLView style={style.walletContainer}>
                <EDRTLView
                  style={{
                    alignItems: "center",
                    marginHorizontal: 15,
                    marginVertical: 10,
                  }}
                >
                  <Icon
                    name={"business"}
                    color={EDColors.primary}
                    containerStyle={{ marginRight: 20 }}
                  />
                  <EDRTLText
                    title={`Direct Delivery (₹ ${this.state?.dunzo_Direct_Delivery_Amt} - `}
                    style={style.dunzoDeliveryHeader}
                  />

                  <EDRTLText
                    title={`${
                      this.state?.dunzoPointDelivery?.directDistance || 0
                    } K.M )`}
                    style={style.dunzoDeliveryHeader}
                  />

                  <Icon
                    name={
                      this.state?.dunzo_Point_DeliveryFlag === 1
                        ? "check-box"
                        : "check-box-outline-blank"
                    }
                    color={EDColors.primary}
                    onPress={(e) => {
                      this.dunzo_Point_DeliveryFlagCall(1);
                    }}
                  />
                </EDRTLView>
              </EDRTLView>
            ) : null} */}

            {/* {this.state?.dunzoPointDelivery?.directPointDelivery?.price > 0 ? (
              <EDRTLView style={style.walletContainer}>
                <EDRTLView
                  style={{
                    alignItems: "center",
                    marginHorizontal: 15,
                    marginVertical: 10,
                  }}
                >
                  <Icon
                    name={"business"}
                    color={EDColors.primary}
                    containerStyle={{ marginRight: 17 }}
                  />

                  <EDRTLText
                    title={`${this.state?.dunzoPointDelivery?.directPointDelivery?.deliveryPointName.slice(
                      0,
                      12
                    )}.. (₹ ${
                      this.state?.dunzoPointDelivery?.directPointDelivery?.price
                    } - `}
                    style={style.dunzoDeliveryHeader}
                  />

                  <EDRTLText
                    title={`${
                      this.state?.dunzoPointDelivery?.directPointDelivery
                        ?.distance || 0
                    } K.M )`}
                    style={style.dunzoDeliveryHeader}
                  />

                  <Icon
                    name={
                      this.state?.dunzo_Point_DeliveryFlag === 2
                        ? "check-box"
                        : "check-box-outline-blank"
                    }
                    color={EDColors.primary}
                    containerStyle={style.dunzoDeliveryView}
                    onPress={(e) => {
                      this.dunzo_Point_DeliveryFlagCall(2);
                    }}
                  />
                </EDRTLView>
              </EDRTLView>
            ) : null} */}

            {this.state.isSelectAddress ? (
              <View style={{ flex: 1 }}>
                {this.paymentOptions !== undefined &&
                this.paymentOptions !== null &&
                this.paymentOptions.length !== 0 ? (
                  <EDRTLText
                    title={strings("choosePaymentOption")}
                    style={style.paymentHeader}
                  />
                ) : null}
                {this.paymentOptions !== undefined &&
                this.paymentOptions !== null &&
                this.paymentOptions.length !== 0 ? (
                  <FlatList
                    data={this.paymentOptions}
                    extraData={this.state}
                    renderItem={this.createPaymentList}
                  />
                ) : null}
              </View>
            ) : null}
          </View>
        </KeyboardAwareScrollView>

        {/* IF SELECT ADDRESS */}

        {/* {this.state.loader_Flag_dunzo_CallResponse === true && (
          <View style={{ marginHorizontal: 10 }}>
            <EDThemeButton
              isLoading={this.state.isLoading}
              label="Processing"
              style={[
                style.undeliverablethemeButton,
                {
                  marginBottom:
                    (Platform.OS == "ios"
                      ? initialWindowMetrics.insets.bottom
                      : 0) + 10,
                },
              ]}
              textStyle={style.themeButtonText}
            />
          </View>
        )} */}

        {this.state?.slot_Master_against_category.length > 0 &&
        Object.keys(this.state?.dunzoPointDelivery).length > 0 ? (
          // this.state.dunzo_Direct_Delivery_Amt >= 0 &&
          // this.state.dunzo_Direct_Delivery_Amt != undefined
          <View style={{ marginHorizontal: 10 }}>
            <EDThemeButton
              isLoading={this.state.isLoading}
              onPress={this.onContinueEventHandler}
              label={strings("continue")}
              style={[
                style.themeButton,
                {
                  marginBottom:
                    (Platform.OS == "ios"
                      ? initialWindowMetrics.insets.bottom
                      : 0) + 10,
                },
              ]}
              textStyle={style.themeButtonText}
            />
          </View>
        ) : (
          <View style={{ marginHorizontal: 10 }}>
            <EDThemeButton
              isLoading={this.state.isLoading}
              label="Delivery Partner/Slot Unavailable"
              style={[
                style.undeliverablethemeButton,
                {
                  marginBottom:
                    (Platform.OS == "ios"
                      ? initialWindowMetrics.insets.bottom
                      : 0) + 10,
                },
              ]}
              textStyle={style.themeButtonText}
            />
          </View>
        )}
      </BaseContainer>
    );
  }
  //#endregion

  changeCard = () => {
    this.props.navigation.push("savedCards", { isForAddressList: true });
  };

  addCard = () => {
    this.setState({ showCardInput: !this.state.showCardInput });
  };

  refreshDefaultCard = (card) => {
    this.setState({ defaultCard: card });
  };

  onOptionSelection = (data) => {
    // debugLog(
    //   "|||||||||||||||||||||||||||||||||||||||",
    //   data.payment_gateway_slug
    // );
    this.setState({ selectedOption: data.payment_gateway_slug });
    if (data.payment_gateway_slug == "applepay") {
      this.publishable_key =
        data.enable_live_mode == "1"
          ? data.live_publishable_key
          : data.test_publishable_key;
    } else if (data.payment_gateway_slug == "razorpay") {
      this.razorpayDetails = data;
    }
  };

  myValidatePostalCode(postalCode) {
    return postalCode.match(/^\d{5,6}$/)
      ? "valid"
      : postalCode.length > 6
      ? "invalid"
      : "incomplete";
  }

  /**
   * On Credit card input
   */
  onCCInput = (data) => {
    this.isCardError = false;
    this.isExpiryError = false;
    this.isCVCError = false;
    this.isCountryError = false;
    this.isPostalError = false;

    this.setState({ cardError: "" });
    this.cardData = data;
  };

  validateCard = () => {
    if (this.cardData !== undefined) {
      if (this.isForEditing || this.cardData.status.number == "valid") {
        if (this.cardData.status.expiry == "valid") {
          if (this.isForEditing || this.cardData.status.cvc == "valid") {
            if (
              this.selectedCountry !== undefined ||
              this.state.countryCode !== undefined
            ) {
              if (this.cardData.status.postalCode == "valid") {
                this.isCardError = false;
                this.isExpiryError = false;
                this.isCVCError = false;
                this.isCountryError = false;
                this.isPostalError = false;
                this.setState({ cardError: "" });
              } else {
                this.isPostalError = true;
                this.setState({ cardError: strings("invalidPostal") });
              }
            } else {
              this.isCountryError = true;
              this.setState({ cardError: strings("noCountry") });
            }
          } else {
            this.isCVCError = true;
            console.log("Invalid CVC");
            this.setState({ cardError: strings("invalidCVC") });
          }
        } else {
          this.isExpiryError = true;
          console.log("Invalid expiry date", this.state.cardError);
          this.setState({ cardError: strings("invalidExpiry") });
        }
      } else {
        this.isCardError = true;
        console.log("Invalid card number");
        this.setState({
          cardError:
            this.cardData.values.number == ""
              ? strings("nocardData")
              : strings("invalidCard"),
        });
      }
    } else {
      this.isCardError = true;
      this.setState({ cardError: strings("nocardData") });
    }
    return this.state.cardError;
  };

  createPaymentList = (item) => {
    let display_name = `display_name_${this.props.lan}`;
    return (
      <View>
        <TouchableOpacity
          style={[style.subContainer]}
          activeOpacity={1}
          // onPress={() => this.onOptionSelection(item.item)}
        >
          <EDRTLView>
            <EDRTLView style={{ alignItems: "center", flex: 1 }}>
              <Icon
                name={
                  item.item.payment_gateway_slug === "applepay"
                    ? "apple-pay"
                    : item.item.payment_gateway_slug === "paypal"
                    ? "paypal"
                    : item.item.payment_gateway_slug === "cod"
                    ? "account-balance-wallet"
                    : "credit-card"
                }
                type={
                  item.item.payment_gateway_slug === "applepay"
                    ? "fontisto"
                    : item.item.payment_gateway_slug === "paypal"
                    ? "entypo"
                    : item.item.payment_gateway_slug === "cod"
                    ? "material"
                    : "material"
                }
                size={20}
                color={
                  //   this.state.selectedOption == item.item.payment_gateway_slug
                  //     ?
                  EDColors.primary
                  // : EDColors.text
                }
                style={style.paymentIconStyle}
              />
              <EDRTLText
                style={[
                  style.paymentMethodTitle,
                  {
                    color:
                      //   this.state.selectedOption ==
                      //   item.item.payment_gateway_slug ?
                      EDColors.black,
                    // : EDColors.blackSecondary,
                  },
                ]}
                title={item.item[display_name]}
              />
            </EDRTLView>
            <Icon
              name={"check"}
              size={getProportionalFontSize(16)}
              selectionColor={EDColors.primary}
              color={
                // this.state.selectedOption == item.item.payment_gateway_slug
                //   ?
                EDColors.primary
                //   : EDColors.white
              }
              style={{ margin: 10 }}
            />
          </EDRTLView>
          {this.state.selectedOption == "stripe" &&
          item.item.payment_gateway_slug == "stripe" ? (
            <>
              {!this.state.showCardInput ? (
                this.state.defaultCard !== undefined ? (
                  <>
                    <EDRTLView style={[style.cardView]}>
                      <EDRTLView style={style.cardSubView}>
                        <Icon
                          name={
                            this.state.defaultCard.card.brand ==
                            CARD_BRANDS.visa
                              ? "cc-visa"
                              : this.state.defaultCard.card.brand ==
                                CARD_BRANDS.mastercard
                              ? "cc-mastercard"
                              : this.state.defaultCard.card.brand ==
                                CARD_BRANDS.amex
                              ? "cc-amex"
                              : "credit-card"
                          }
                          color={
                            this.state.defaultCard.card.brand ==
                            CARD_BRANDS.visa
                              ? EDColors.visa
                              : this.state.defaultCard.card.brand ==
                                CARD_BRANDS.mastercard
                              ? EDColors.mastercard
                              : this.state.defaultCard.card.brand ==
                                CARD_BRANDS.amex
                              ? EDColors.amex
                              : EDColors.primary
                          }
                          size={20}
                          type="font-awesome"
                        />
                        <View style={{ marginHorizontal: 20, flex: 1 }}>
                          <EDRTLView style={{ alignItems: "center" }}>
                            <Text style={{ color: EDColors.black }}>•••• </Text>
                            <EDRTLText
                              title={this.state.defaultCard.card.last4}
                              style={style.last4Text}
                            />
                          </EDRTLView>
                          {new Date().setFullYear(
                            this.state.defaultCard.card.exp_year,
                            this.state.defaultCard.card.exp_month,
                            1
                          ) < new Date() ? (
                            <EDRTLText
                              title={strings("expired")}
                              style={style.expiredText}
                            />
                          ) : null}
                        </View>
                        <EDRTLText
                          title={strings("change")}
                          style={style.changeCard}
                          onPress={this.changeCard}
                        />
                        <EDRTLText
                          title={strings("homeNew")}
                          style={style.changeCard}
                          onPress={this.addCard}
                        />
                      </EDRTLView>
                    </EDRTLView>
                    <EDRTLText
                      title={strings("defaultCard")}
                      style={{
                        fontFamily: EDFonts.regular,
                        color: EDColors.textNew,
                        marginHorizontal: 7.5,
                        flex: 1,
                        fontSize: getProportionalFontSize(14),
                        marginTop: 10,
                      }}
                    />
                  </>
                ) : this.state.isLoading ||
                  this.state.isPaymentLoading ||
                  this.state.isSavedCardLoading ? null : (
                  <>
                    <EDRTLText
                      title={
                        this.noCards
                          ? strings("noCards")
                          : strings("noDefaultCard")
                      }
                      style={{
                        fontFamily: EDFonts.regular,
                        color: EDColors.error,
                        marginHorizontal: 7.5,
                        flex: 1,
                        fontSize: getProportionalFontSize(14),
                        marginTop: 10,
                      }}
                    />
                    <EDRTLView style={{ alignItems: "center", marginTop: 10 }}>
                      {this.noCards ? null : (
                        <EDRTLText
                          title={strings("setNow")}
                          style={[style.changeCard, { marginLeft: 7.5 }]}
                          onPress={this.changeCard}
                        />
                      )}
                      <EDRTLText
                        title={strings("homeNew")}
                        style={style.changeCard}
                        onPress={this.addCard}
                      />
                    </EDRTLView>
                  </>
                )
              ) : null}
              {this.state.showCardInput ? (
                <View style={{}}>
                  {this.state.defaultCard !== undefined ||
                  this.state.noDefaultCard ? (
                    <EDRTLText
                      title={strings("dialogCancel")}
                      style={[
                        style.changeCard,
                        { textAlign: "left", marginLeft: 0 },
                      ]}
                      onPress={this.addCard}
                    />
                  ) : null}
                  <CreditCardInput
                    ref={(ref) => (this.creditcardRef = ref)}
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
                    cvcStyle={{
                      width: metrics.screenWidth / 2 - 40,
                      marginLeft: 15,
                    }}
                    expiryStyle={{ width: metrics.screenWidth / 2 - 40 }}
                    errorLeftPadding={metrics.screenWidth / 2 - 25}
                  />
                  {this.props.userID !== undefined &&
                  this.props.userID !== null &&
                  this.props.userID !== "" ? (
                    <TouchableOpacity
                      onPress={this.toggleCardSave}
                      activeOpacity={1}
                    >
                      <EDRTLView
                        style={{ alignItems: "center", marginTop: 10 }}
                      >
                        <Icon
                          name={
                            this.state.isCardSave
                              ? "check-square-o"
                              : "square-o"
                          }
                          color={EDColors.primary}
                          size={20}
                          type="font-awesome"
                        />
                        <EDRTLText
                          title={strings("askSaveCard")}
                          style={{
                            fontFamily: EDFonts.medium,
                            color: EDColors.black,
                            marginHorizontal: 7.5,
                            flex: 1,
                            fontSize: getProportionalFontSize(14),
                          }}
                        />
                      </EDRTLView>
                    </TouchableOpacity>
                  ) : null}

                  {this.props.userID !== undefined &&
                  this.props.userID !== null &&
                  this.props.userID !== "" &&
                  this.state.isCardSave &&
                  !this.noCards ? (
                    <TouchableOpacity
                      onPress={this.toggleCardDefault}
                      activeOpacity={1}
                    >
                      <EDRTLView
                        style={{ alignItems: "center", marginTop: 10 }}
                      >
                        <Icon
                          name={
                            this.state.isDefaultCard
                              ? "check-square-o"
                              : "square-o"
                          }
                          color={EDColors.primary}
                          size={20}
                          type="font-awesome"
                        />
                        <EDRTLText
                          title={strings("setDefaultCard")}
                          style={{
                            fontFamily: EDFonts.medium,
                            color: EDColors.black,
                            marginHorizontal: 7.5,
                            flex: 1,
                            fontSize: getProportionalFontSize(14),
                          }}
                        />
                      </EDRTLView>
                    </TouchableOpacity>
                  ) : null}
                </View>
              ) : null}
            </>
          ) : null}
        </TouchableOpacity>
      </View>
    );
  };

  toggleCardSave = () => {
    this.setState({ isCardSave: !this.state.isCardSave, isDefaultCard: false });
  };

  toggleCardDefault = () => {
    this.setState({ isDefaultCard: !this.state.isDefaultCard });
  };

  //#region
  /** BACK EVENT HANDLER */
  onBackEventHandler = () => {
    this.props.navigation.goBack();
  };
  //#endregion

  //#region
  /** GET DATA */
  getData = () => {
    this.getAddressList();
  };
  //#endregion

  //#region
  /** INDEX SELECTION */
  onSelectedIndex = (value) => {
    this.setState({ value: value });
  };
  //#endregion
  selectPickUp = () => {
    // this.state.value = 0;
    this.setState({ value: 0 });
  };

  selectCod = () => {
    // this.state.value = 1;
    this.setState({ value: 1 });
  };

  navigateToCheckout = (isDelivery = false, onSuccess) => {
    let checkout_data = isDelivery
      ? {
          publishable_key: this.publishable_key,
          delivery_status: this.state.value === 1 ? "Delivery" : "PickUp",
          latitude:
            this.state.guestAddress !== undefined
              ? this.state.guestAddress.latitude
              : this.state.selectedAddress.latitude,
          longitude:
            this.state.guestAddress !== undefined
              ? this.state.guestAddress.longitude
              : this.state.selectedAddress.longitude,
          address_id:
            this.state.guestAddress !== undefined
              ? undefined
              : this.state.selectedAddress.address_id,
          is_cod: this.state.cash,
          comment: this.state.strComment,
          delivery_instructions: this.state.strDriverComment,
          payment_option: this.state.selectedOption,
          selectedCard: this.state.defaultCard,
          cardData: this.cardData,
          default_tip_percent_val: onSuccess.default_tip_percent_val,
          completeAddress:
            this.state.guestAddress !== undefined
              ? this.state.guestAddress
              : this.state.selectedAddress,
          isPreOrder:
            this.allowPreOrder &&
            (this.isScheduleMandatory || this.state.isPreOrder),
          scheduled_date: moment(this.state.currentDate).format("DD-MM-YYYY"),
          slot_open_time: this.state.startTime,
          slot_close_time: this.state.endTime,
          allowPreOrder: this.allowPreOrder,
          countryCode:
            this.state.countryCode ||
            (this.selectedCountry !== undefined
              ? this.selectedCountry.cca2
              : ""),
          isCardSave: this.state.isCardSave,
          isDefaultCard: this.noCards || this.state.isDefaultCard,
          razorpayDetails: this.razorpayDetails,
        }
      : {
          publishable_key: this.publishable_key,
          delivery_status: "PickUp",
          latitude: "",
          longitude: "",
          address_id: "",
          payment_option: this.state.selectedOption,
          comment: this.state.strComment,
          delivery_instructions: this.state.strDriverComment,
          completeAddress: this.props.currentLocation,
          isPreOrder:
            this.allowPreOrder &&
            (this.isScheduleMandatory || this.state.isPreOrder),
          scheduled_date: moment(this.state.currentDate).format("DD-MM-YYYY"),
          slot_open_time: this.state.startTime,
          slot_close_time: this.state.endTime,
          allowPreOrder: this.allowPreOrder,
          selectedCard: this.state.defaultCard,
          cardData: this.cardData,
          countryCode:
            this.state.countryCode ||
            (this.selectedCountry !== undefined
              ? this.selectedCountry.cca2
              : ""),
          isCardSave: this.state.isCardSave,
          isDefaultCard: this.noCards || this.state.isDefaultCard,
          razorpayDetails: this.razorpayDetails,
        };
    if (this.props.userID !== undefined && this.props.userID !== null) {
      this.props.navigation.navigate("CheckOutContainer", checkout_data);
    } else this.verifyPhoneNumber(checkout_data);
  };

  proceedToCheckout = () => {
    if (this.state.selectedOption !== "") {
      if (this.state.value == 0) {
        this.props.saveCheckoutDetails(this.checkoutData);
        this.state.strFullName !== ""
          ? this.props.saveGuestDetails({
              first_name: this.state.strFullName,
              last_name: this.state.strLastName,
              phone_number: this.state.strPhone,
              phone_code: this.countryCode,
              email: this.state.strEmail,
            })
          : null;
        this.navigateToCheckout();
      } else if (this.state.value == -1) {
        showValidationAlert(strings("noDeliveryOption"));
      } else {
        if (
          this.props.userID !== undefined &&
          this.props.userID !== null &&
          this.props.userID !== ""
        ) {
          if (this.state.selectedIndex === -1)
            showValidationAlert(strings("noAddressMsg"));
          else this.checkOrderAPI();
        } else {
          if (this.state.guestAddress === undefined)
            showValidationAlert(strings("guestAddressError"));
          else this.checkOrderAPI();
        }
      }
    } else {
      if (this.paymentOptions !== undefined)
        showValidationAlert(strings("choosePaymentError"));
      else showValidationAlert(strings("noPaymentMethods"));
    }
  };

  //#region
  /** CONTINUE EVENT HANDLER */
  onContinueEventHandler = () => {
    netStatus((status) => {
      if (status) {
        if (this.props.userID === undefined || this.props.userID === null) {
          this.setState({ shouldPerformValidation: true });
          if (
            this.state.strFullName.trim().length > 0 &&
            this.state.strLastName.trim().length > 0 &&
            this.validationsHelper
              .validateMobile(
                this.state.strPhone,
                strings("emptyPhone"),
                this.countryCode
              )
              .trim() == "" &&
            this.validationsHelper
              .validateEmail(this.state.strEmail, strings("emptyEmail"))
              .trim() == ""
          ) {
          } else {
            return;
          }
        }
        if (
          this.state.selectedOption == "stripe" &&
          (this.state.defaultCard == undefined || this.state.showCardInput)
        ) {
          // debugLog("VALIDATE CARD :::::", this.validateCard());
          if (this.validateCard() !== "") return;
        }
        if (
          this.allowPreOrder &&
          (this.state.isPreOrder || this.isScheduleMandatory)
        )
          this.validateScheduling();
        else {
          if (this.isScheduleMandatory)
            showValidationAlert(strings("noTimeSlot"));
          else this.proceedToCheckout();
        }
      } else {
        this.strOnScreenMessage = strings("noInternetTitle");
      }
    });
  };
  //#endregion

  setGuestAddress = (address) => {
    this.props.saveGuestAddress(address);
    this.setState({ guestAddress: address });
  };

  setSelectedAddress = async (address) => {
    let {
      isPaymentLoading,
      dunzo_Point_DeliveryFlag,
      loader_Flag_dunzo_CallResponse,
      isLoading,
    } = this.state;

    this.setState({ isLoading: true, isPaymentLoading: true });

    // debugLog(
    //   " setSelectedAddress  ************************** setSelectedAddress **********************",
    //   this.state.loader_Flag_dunzo_CallResponse
    // );

    if (
      address !== undefined &&
      address !== null &&
      address !== {} &&
      address.address !== undefined
    ) {
      this.isAddressChanged = true;
    }
    this.setState({ selectedAddress: address });

    let splitres_name =
      this.props?.selected_Res_Id && this.props?.selected_Res_Id.split("-");

    let datas = {
      restuarant_id:
        this.props.res_id ||
        this.props.navigation.state.params.resId ||
        splitres_name[0],
      customer_id: this.props.userID || 0,
      address_id: address?.address_id,
      restuarantName: splitres_name[1] || 0,
    };

    let getDeliveryChargeAPICall = await axios.post(
      "https://fis.clsslabs.com/FIS/api/auth/getDeliveryCharge",
      datas,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // debugLog(
    //   "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ datas",
    //   datas
    // );

    if (getDeliveryChargeAPICall.status === 200) {
      let {
        isPaymentLoading,
        dunzoPointDelivery,
        dunzo_Direct_Delivery_Amt,
        dunzo_Point_DeliveryFlag,
      } = this.state;

      this.props.save_delivery_dunzo__details(
        getDeliveryChargeAPICall?.data[0]
      );
      this.props.save_dunzodelivery_amount(
        getDeliveryChargeAPICall?.data[0]?.directPointDelivery?.amount
      );
      this.setState(
        {
          dunzo_Direct_Delivery_Amt:
            getDeliveryChargeAPICall?.data?.directDelivery,
          dunzoPointDelivery: getDeliveryChargeAPICall?.data,
          dunzo_Point_DeliveryFlag: 0,
        },
        () => {
          let {
            isPaymentLoading,
            dunzoPointDelivery,
            dunzo_Direct_Delivery_Amt,
            dunzo_Point_DeliveryFlag,
          } = this.state;
          // this.getPaymentOptionsAPI();
          if (
            getDeliveryChargeAPICall?.data?.directPointDelivery
              ?.deliveryPointName.length > 12
          ) {
            let { dunzoPointDelivery } = this.state;
            let nameSlice =
              getDeliveryChargeAPICall?.data?.directPointDelivery
                ?.deliveryPointName &&
              getDeliveryChargeAPICall?.data?.directPointDelivery
                ?.deliveryPointName.length > 0
                ? `${getDeliveryChargeAPICall?.data?.directPointDelivery?.deliveryPointName.slice(
                    0,
                    12
                  )}...`
                : "";
            // debugLog(
            //   "****************************** 22 this.props.dunzoPointDelivery?.directPointDelivery?.deliveryPointName",
            //   this.props?.dunzo_Delivery_Details?.directPointDelivery
            //     ?.deliveryPointName
            // );

            this.setState({
              dunzoPointDelivery: {
                ...this.state.dunzoPointDelivery,
                directPointDelivery: {
                  ...this.state.dunzoPointDelivery.directPointDelivery,
                  deliveryPointName: nameSlice,
                },
              },
            });
            // if (getDeliveryChargeAPICall.data.directDelivery > 0) {
            // this.setState({});
            // }
            //  else {
            //   this.setState({
            //     dunzo_Point_DeliveryFlag: true,
            //   });
            // }
          }
          // this.dunzo_Point_DeliveryFlagCall();
        }
      );
    } else {
      // showValidationAlert("Dunzo , Drop Location is not serviceable");
      // this.props.save_delivery_dunzo__details();
      // this.props.save_dunzodelivery_amount();
    }

    // debugLog(
    //   "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    //   getDeliveryChargeAPICall.status
    // );
    this.setState({ isLoading: false, isPaymentLoading: false });
  };
  //#region ADD ADDRESS
  onAddAddressEventHandler = () => {
    if (
      this.props.userID !== undefined &&
      this.props.userID !== null &&
      this.props.userID !== ""
    )
      this.props.navigation.navigate("DetailedAddressListContainer", {
        isSelectAddress: true,
        resId: this.props.navigation.state.params.resId,
        setSelectedAddress: this.setSelectedAddress,
        selectedAddress: this.state.selectedAddress,
      });
    else this.navigateTomap("", 3);
  };
  //#endregion

  //#region
  /** on EDIT PRESS */

  navigateTomap = (item, index) => {
    netStatus((isConnected) => {
      if (isConnected) {
        var paramPermission =
          Platform.OS === "ios"
            ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
            : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
        checkPermission(
          paramPermission,
          () => {
            switch (index) {
              case 1:
                this.props.navigation.navigate("AddressMapContainer", {
                  getData: this.getData,
                  totalCount: this.arrayAddress.length,
                  isEdit: index,
                });
              case 2:
                var sendData = {
                  addressId: item.address_id,
                  addressLine2: item.landmark,
                  addressLine1: item.address,
                  latitude: item.latitude,
                  longitude: item.longitude,
                  city: item.city,
                  is_main: item.is_main,
                  zipCode: item.zipcode,
                  address_label: item.address_label,
                  business: item.business,
                  state: item.state,
                  country: item.country,
                };
                this.props.navigation.navigate("AddressMapContainer", {
                  getDataAll: sendData,
                  getData: this.getData,
                  totalCount: this.arrayAddress.length,
                  isEdit: index,
                });
              case 3:
                this.props.navigation.navigate("AddressMapContainer", {
                  getGuestAddress: this.setGuestAddress,
                  totalCount: 0,
                  isGuest: true,
                  isEdit: index,
                });
                break;
            }
          },
          () => {
            showDialogue(
              strings("locationPermission"),
              [{ text: strings("dialogCancel"), isNotPreferred: true }],
              "",
              () => {
                if (Platform.OS == "ios") Linking.openURL("app-settings:");
                else Linking.openSettings();
              }
            );
          }
        );
      } else {
        showNoInternetAlert();
      }
    });
  };

  //#region
  /** ADDRESS ID EVENT HANDLER */
  onDeleteAddressEventHandler = (address_id) => {
    showDialogue(
      strings("deleteAddressConfirm"),
      [
        {
          text: strings("dialogCancel"),
          isNotPreferred: true,
        },
      ],
      "",
      () => this.deleteAddress(address_id)
    );
  };
  //#endregion

  //#region
  /** CREATE ADDRESS LIST */
  renderAddressList = ({ item, index }) => {
    return (
      <AddressComponent
        data={item}
        index={index}
        isSelectedAddress={this.state.isSelectAddress}
        isSelected={this.state.selectedIndex === index ? true : false}
        onPress={this.addressSelectionAction}
        deleteAddress={this.onDeleteAddressEventHandler}
        editAddress={this.navigateTomap}
      />
    );
  };
  //#endregion

  //#region CHECK ORDER
  /**
   * @param { Success Response Object } onSuccess
   */
  onSucessCheckOrder = (onSuccess) => {
    if (onSuccess.status === 0) {
      this.setState({ isLoading: false });
      showValidationAlert(onSuccess.message);
    } else {
      this.state.strFullName !== ""
        ? this.props.saveGuestDetails({
            first_name: this.state.strFullName,
            last_name: this.state.strLastName,
            phone_number: this.state.strPhone,
            phone_code: this.countryCode,
            email: this.state.strEmail,
          })
        : null;
      this.navigateToCheckout(true, onSuccess);
    }
  };

  /**
   * @param { Failure Response Object } onFailure
   */
  onFailureCheckOrder = (onfailure) => {
    this.setState({ isLoading: false });
  };

  /** CALL API FOR CHECK ORDER */
  checkOrderAPI = () => {
    let param = {
      language_slug: this.props.lan,
      // token: this.props.token,
      user_id: this.props.userID,
      order_delivery: "Delivery",
      users_latitude:
        this.state.guestAddress !== undefined
          ? this.state.guestAddress.latitude
          : this.state.selectedAddress.latitude,
      users_longitude:
        this.state.guestAddress !== undefined
          ? this.state.guestAddress.longitude
          : this.state.selectedAddress.longitude,
      restaurant_id: this.props.navigation.state.params.resId,
      isLoggedIn:
        this.props.userID !== undefined &&
        this.props.userID !== null &&
        this.props.userID !== ""
          ? 1
          : 0,
    };
    this.setState({ isLoading: true });
    netStatus((status) => {
      if (status) {
        checkOrder(
          param,
          this.onSucessCheckOrder,
          this.onFailureCheckOrder,
          this.props
        );
      } else {
        this.setState({ isLoading: false });
        this.strOnScreenMessage = strings("noInternetTitle");
      }
    });
  };
  //#endregion

  /**
   * @param { Success Response Object } onSuccess
   */
  onSucessSchdeule = (onSuccess) => {
    // debugLog("CHECK SCHEDULING SUCCESS ::::::: ", onSuccess);
    this.setState({ isLoading: false });
    if (onSuccess.status === RESPONSE_SUCCESS) {
      this.proceedToCheckout();
    } else {
      showDialogue(onSuccess.message, [], "");
    }
  };

  /**
   * @param { Failure Response Object } onFailure
   */
  onFailureSchedule = (onfailure) => {
    this.setState({ isLoading: false });
  };

  /** CALL API FOR CHECKING SCHEDULING TIME AND DATE */
  validateScheduling = () => {
    let param = {
      language_slug: this.props.lan,
      // token: this.props.token,
      restaurant_id: this.props.navigation.state.params.resId,
      scheduled_date: moment(this.state.currentDate).format("DD-MM-YYYY"),
      slot_open_time: this.state.startTime,
      slot_close_time: this.state.endTime,
    };
    this.setState({ isLoading: true });
    netStatus((status) => {
      if (status) {
        checkScheduleDelivery(
          param,
          this.onSucessSchdeule,
          this.onFailureSchedule,
          this.props
        );
      } else {
        this.setState({ isLoading: false });
        this.strOnScreenMessage = strings("noInternetTitle");
      }
    });
  };
  //#endregion

  //#region LOAD ADDRESS
  /**
   * @param { Success Response Object } onSuccess
   */
  onSuccessLoadAddress = (onSuccess) => {
    console.log("LOAD ADDRESS SUCCCESS", onSuccess);
    this.strOnScreenMessage = "";

    if (onSuccess != undefined) {
      if (onSuccess.status == RESPONSE_SUCCESS) {
        if (onSuccess.address !== undefined && onSuccess.address.length > 0) {
          this.setState({
            selectedIndex: 0,
            selectedAddress: onSuccess.address[0],
          });
          getCountryName(
            onSuccess.address[0].latitude,
            onSuccess.address[0].longitude,
            (success) => {
              if (success[0].short_name !== undefined)
                this.setState({ countryCode: success[0].short_name });
            },
            (failure) => {
              // debugLog("COUNTRY CODE FAILURE :::::", failure);
            },
            this.props.googleMapKey || GOOGLE_API_KEY
          );
          this.forceUpdate();
          // console.log("Address Array[][][][]", this.arrayAddress);
          // this.dunzoApiCall();
        } else {
          this.strOnScreenMessage = strings("noDataFound");
        }

        this.setState({ isLoading: false });
      } else {
        // showValidationAlert(onSuccess.message);
        this.strOnScreenMessage = strings("noDataFound");
        this.setState({ isLoading: false });
      }
    } else {
      console.log("onSuccess.status", onSuccess.status);
      // showValidationAlert(strings("generalWebServiceError"));
      this.strOnScreenMessage = strings("generalWebServiceError");
      this.setState({ isLoading: false });
    }
  };

  /**
   * @param { FAilure Response Objetc } onfailure
   */
  onFailureLoadAddress = (onFailure) => {
    console.log("[]][][][]]]][][][][ LOAD ADDRESS FAILURE", onFailure);
    this.strOnScreenMessage = "";
    this.strOnScreenSubtitle = "";
    this.strOnScreenMessage = strings("generalWebServiceError");
    this.setState({ isLoading: false });
    // showValidationAlert(strings("noInternet"));
  };

  dunzoApiCall = async () => {
    let { dunzoPointDelivery } = this.state;

    // debugLog(
    //   "****************************** dunzoApiCall ******************** dunzo_Delivery_Amount *********************",
    //   this.props.dunzo_Delivery_Amount
    // );
    // debugLog(
    //   "****************************** dunzoApiCall **********************  this.props.dunzo_Delivery_Details  *********************",
    //   this.props.dunzo_Delivery_Details
    // );
    // debugLog(
    //   "****************************** dunzoApiCall ****************************** dunzo_Delivery_Amount > 0 ******************************",
    //   this.props.dunzo_Delivery_Amount > 0
    // );
    // debugLog(
    //   "****************************** dunzoApiCall ********************** Number(this.props.dunzo_Delivery_Details > 0)  > 0",
    //   this.props?.dunzo_Delivery_Details?.directPointDelivery.price
    // );
    // debugLog(
    //   "****************************** this.props.dunzoPointDelivery?.directPointDelivery?.deliveryPointName",
    //   this.props?.dunzo_Delivery_Details?.directPointDelivery?.deliveryPointName.length
    // );

    // return false;
    if (
      this.props.dunzo_Delivery_Amount >= 0
      // ||      this.props?.dunzo_Delivery_Details?.directPointDelivery.price > 0
    ) {
      this.setState(
        {
          dunzoPointDelivery: this.props.dunzo_Delivery_Details,
          dunzo_Direct_Delivery_Amt: this.props.dunzo_Delivery_Amount,
        },
        () => {
          this.getPaymentOptionsAPI();
          // return false;
          // if (
          //   this.props?.dunzo_Delivery_Details?.directPointDelivery
          //     ?.deliveryPointName.length > 9
          // ) {
          // debugLog(
          //   "****************************** this.props.dunzoPointDelivery?.directPointDelivery?.deliveryPointName",
          //   this.props?.dunzo_Delivery_Details?.directPointDelivery
          //     ?.deliveryPointName.length
          // );
          // let { dunzoPointDelivery } = this.state;
          // let nameSlice = `${this.props?.dunzo_Delivery_Details?.directPointDelivery?.deliveryPointName.slice(
          //   0,
          //   12
          // )} ...`;
          // debugLog(
          //   "****************************** nameSlice ******************************",
          //   nameSlice
          // );

          // this.setState({
          //   dunzoPointDelivery: {
          //     ...this.state.dunzoPointDelivery,
          //     directPointDelivery: {
          //       ...this.state.dunzoPointDelivery.directPointDelivery,
          //       deliveryPointName: nameSlice,
          //     },
          //   },
          // });

          // let { dunzo_Point_DeliveryFlag } = this.state;

          // if (this.props.dunzo_Delivery_Amount > 0) {
          //   this.setState({
          //     dunzo_Point_DeliveryFlag: true,
          //   });
          // } else {
          //   this.setState({
          //     dunzo_Point_DeliveryFlag: false,
          //   });
          // }
          // }
        }
      );
      this.dunzo_Point_DeliveryFlagCall(1);
      // return false;
    } else {
      showValidationAlert(
        // "Drop Location was not serviceable, Please change Address"
        "Delivery Partner not available, Please try later"
      );
    }

    let splitres_name =
      this.props?.selected_Res_Id && this.props?.selected_Res_Id.split("-");

    let data = {
      restuarant_id:
        splitres_name[0] || this.props.navigation.state.params.resId,
      customer_id: this.props.userID || 0,
      address_id: this.state.selectedAddress.address_id,
      restuarantName: splitres_name[1] || 0,
    };

    let getDeliveryChargeAPICall = await axios.post(
      "https://fis.clsslabs.com/FIS/api/auth/getDeliveryCharge",
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (getDeliveryChargeAPICall.status === 200) {
      let { dunzoPointDelivery } = this.state;

      // getDeliveryChargeAPICall.data.directDelivery;

      this.props.save_delivery_dunzo__details(
        getDeliveryChargeAPICall?.data[0]
      );

      this.props.save_dunzodelivery_amount(
        getDeliveryChargeAPICall?.data[0]?.directPointDelivery?.amount
      );

      this.setState({
        dunzoPointDelivery: getDeliveryChargeAPICall.data,
        dunzo_Direct_Delivery_Amt: getDeliveryChargeAPICall.data.directDelivery,
      });
    } else {
      showValidationAlert("Unable to process, Delivery Charge ");
      this.props.save_delivery_dunzo__details();
    }
  };

  // onSuccessgetDunzoDeliveryAmountAPI = (onSuccess) => {};

  // onFailuregetDunzoDeliveryAmountAPI = (onFailure) => {
  //   console.log("[]][][][]]]][][][][ LOAD ADDRESS FAILURE", onFailure);
  //   this.setState({ isLoading: false });
  //   showValidationAlert("Unable to process, Delivery Charge ");
  // };

  fetchCards = () => {
    this.state.defaultCard = undefined;
    this.state.noDefaultCard = false;
    netStatus((status) => {
      if (status) {
        this.setState({ isSavedCardLoading: true });
        let userParams = {
          language_slug: this.props.lan,
          user_id: this.props.userID,
          isLoggedIn: 1,
        };
        getSavedCardsAPI(
          userParams,
          this.onSuccessFetchCards,
          this.onFailureFetchCards,
          this.props
        );
      } else {
        this.setState({ isSavedCardLoading: false });
      }
    });
  };

  onSuccessFetchCards = (onSuccess) => {
    this.noCards = false;

    if (
      onSuccess.stripe_response !== undefined &&
      onSuccess.stripe_response !== null &&
      onSuccess.stripe_response.length !== 0
    ) {
      let valid_cards = [];
      valid_cards = onSuccess.stripe_response.filter((cardData) => {
        return (
          new Date() <
          new Date().setFullYear(
            cardData.card.exp_year,
            cardData.card.exp_month,
            1
          )
        );
      });
      this.setState({
        noDefaultCard: !(
          valid_cards !== undefined &&
          valid_cards !== null &&
          valid_cards.length !== 0 &&
          valid_cards[0].is_default_card == "1"
        ),
        showCardInput: false,
        defaultCard:
          valid_cards !== undefined &&
          valid_cards !== null &&
          valid_cards.length !== 0 &&
          valid_cards[0].is_default_card == "1"
            ? valid_cards[0]
            : undefined,
      });
    } else {
      // debugLog("NO CARDS ::::::");
      this.noCards = true;
    }

    this.setState({ isSavedCardLoading: false });
  };

  onFailureFetchCards = (onFailure) => {
    this.setState({ isSavedCardLoading: false });
  };

  onWillFocus = () => {
    // debugLog(
    //   "1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111"
    // );

    this.setState({ isLoading: true, isPaymentLoading: true });

    if (
      this?.state?.cartItems != undefined &&
      this?.state?.cartItems.map((data) => data.in_stock).includes("0")
    )
      this.isScheduleMandatory = true;
    if (
      this.props.countryArray !== undefined &&
      this.props.countryArray !== null &&
      this.props.countryArray[0] !== undefined &&
      this.props.countryArray[0].phonecode !== undefined
    ) {
      if (this.countryCode == "")
        this.countryCode = this.props.countryArray[0].phonecode;
      if (this.state.countryCode == "")
        this.state.countryCode = this.props.countryArray[0].phonecode;
    }
    // this.setState({ isLoading: false, isPaymentLoading: false });
    if (
      this.props.userID !== undefined &&
      this.props.userID !== null &&
      this.props.userID !== "" &&
      this.isAddressChanged !== true
    )
      this.getAddressList();
    this.getPaymentOptionsAPI();
  };

  /** GET ADDRESS API */
  getAddressList = () => {
    this.strOnScreenMessage = "";
    this.strOnScreenSubtitle = "";
    this.setState({ isLoading: true, selectedIndex: -1 });
    netStatus((status) => {
      if (status) {
        let param = {
          language_slug: this.props.lan,
          user_id: this.props.userID || 0,
          // token: this.props.token,
          showonly_main: 1,
        };
        getAddressListAPI(
          param,
          this.onSuccessLoadAddress,
          this.onFailureLoadAddress,
          this.props
        );
      } else {
        // showValidationAlert(strings("noInternet"));
        this.strOnScreenMessage = strings("noInternetTitle");
        this.strOnScreenSubtitle = strings("noInternet");
        this.setState({ isLoading: false });
      }
    });
  };
  //#endregion

  getPaymentOptionsAPI = () => {
    let { isPaymentLoading } = this.state;

    // this.setState({ isPaymentLoading: true });

    netStatus((isConnected) => {
      if (isConnected) {
        var params = {
          language_slug: this.props.lan,
          user_id: this.props.userID,
          is_dine_in: "0",
          restaurant_id: this.props.navigation.state.params.resId,
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
    // debugLog(
    //   "*****************************************  onSuccess  ###################################################################### ",
    //   onSuccess
    // );
    // return;
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
        parseInt(this.state.loggedInUserwalletBalance) >
          Number(this.props.minOrderAmount) &&
        parseInt(this.state.loggedInUserwalletBalance) > PriceandTotalPrice
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

  //#region DELETE ADDRESS
  /**
   *
   * @param { Success Response Object } onSuccess
   */
  onSuccessDeleteAddress = (onSuccess) => {
    console.log("Address Delete response ::::: ", onSuccess);
    if (onSuccess != undefined) {
      if (onSuccess.status == RESPONSE_SUCCESS) {
        this.getAddressList();
      } else {
        showValidationAlert(onSuccess.message);
        this.setState({ isLoading: false });
      }
    } else {
      this.strOnScreenMessage = strings("generalWebServiceError");
      // showValidationAlert(strings("generalWebServiceError"));
      this.setState({ isLoading: false });
    }
  };

  /**
   *
   * @param {Fauilre Response Objewtc} onFailure
   */
  onFailureDeleteAddress = (onFailure) => {
    this.setState({ isLoading: false });
    this.strOnScreenMessage = strings("noInternet");
  };

  /** DELETE API */
  deleteAddress(addId) {
    netStatus((status) => {
      if (status) {
        this.setState({ isLoading: true });
        let param = {
          language_slug: this.props.lan,
          user_id: this.props.userID,
          address_id: addId,
          // token: this.props.token,
        };
        deleteAddress(
          param,
          this.onSuccessDeleteAddress,
          this.onFailureDeleteAddress,
          this.props
        );
      } else {
        this.strOnScreenMessage = strings("noInternetTitle");
        this.strOnScreenSubtitle = strings("noInternet");
      }
    });
  }
  //#endregion

  addressSelectionAction = (index) => {
    // debugLog(
    //   "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~1111111111111111111111111111111~~~~~~~~~~~~~~~",
    //   index
    // );
    // console.log(
    //   "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~2222222222222222222222222222222~~~~~~~~~~",
    //   index
    // );

    this.setState({ selectedIndex: index });
  };
}
//#endregion

//#region STYLES
const style = StyleSheet.create({
  dataView: {
    flex: 1,
    marginHorizontal: 10,
    alignItems: "center",
    marginBottom: 5,
    justifyContent: "space-between",
  },
  selected: {
    flex: 1,
    alignItems: "center",
    backgroundColor: EDColors.white,
    borderRadius: 5,
    padding: 5,
    borderWidth: 1,
    borderColor: EDColors.primary,
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10,
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
  undeliverablethemeButton: {
    backgroundColor: "grey",
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
  deliveryTextStyle: {
    color: EDColors.primary,
    textAlignVertical: "center",
    marginTop: 2,
    marginHorizontal: 5,
  },
  touchableView: {
    marginVertical: 15,
    justifyContent: "space-between",
    marginHorizontal: 15,
  },
  headerIconStyle: { marginHorizontal: 15 },
  deliveryOptionView: {
    marginHorizontal: 20,
    backgroundColor: EDColors.white,
    borderWidth: 2,
    borderRadius: 16,
    borderColor: EDColors.white,
    marginBottom: 10,
    shadowColor: "rgba(0, 0, 0, 0.05)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  childDeliveryOptionView: {},

  walletText: {
    fontFamily: EDFonts.medium,
    color: "#000",
    fontSize: getProportionalFontSize(14),
    marginTop: 10,
    marginHorizontal: 10,
    marginBottom: 5,
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

  footerStyle: {
    marginTop: 20,
    marginHorizontal: 10,
    backgroundColor: EDColors.white,
    borderWidth: 2,
    borderColor: EDColors.separatorColorNew,
    borderRadius: 16,
    alignItems: "center",
  },
  editIconStyle: { marginHorizontal: 15 },
  continueStyle: {
    width: "100%",
    height: metrics.screenHeight * 0.08,
    backgroundColor: EDColors.backgroundLight,
    marginBottom: 10,
  },
  counterStyle: {
    marginHorizontal: 20,
    marginTop: 5,
    fontSize: getProportionalFontSize(12),
    color: EDColors.text,
  },
  contButtonStyle: {
    alignSelf: "center",
    backgroundColor: EDColors.primary,
    justifyContent: "center",
    marginTop: 5,
    marginBottom: 5,
    width: "90%",
    borderRadius: 16,
    height: heightPercentageToDP("7.5%"),
    textAlignVertical: "center",
    paddingVertical: 0,
  },

  addView: {
    alignItems: "center",
    padding: 10,
  },
  titleText: {
    color: EDColors.black,
    fontSize: getProportionalFontSize(15),
    fontFamily: EDFonts.semiBold,
    marginHorizontal: 10,
    flex: 1,
  },
  noAddress: {
    color: EDColors.error,
    fontSize: getProportionalFontSize(15),
    fontFamily: EDFonts.regular,
    marginHorizontal: 15,
    marginVertical: 10,
  },
  textStyle: {
    fontSize: getProportionalFontSize(14),
    fontFamily: EDFonts.regular,
    flex: 1,
    padding: 5,
  },
  orderView: {
    fontSize: getProportionalFontSize(15),
    padding: 10,
    margin: 10,
    fontFamily: EDFonts.semiBold,
    color: EDColors.black,
  },
  orderText: { fontSize: getProportionalFontSize(16) },
  separatorView: {
    marginHorizontal: 10,
    borderColor: EDColors.placeholder,
    borderWidth: 0.5,
  },
  subContainer: {
    // flexDirection: "row",
    margin: 10,
    backgroundColor: EDColors.transparentBackground,
    // borderRadius: 6,
    padding: 10,
    // justifyContent: "center",
    marginHorizontal: 20,
    backgroundColor: EDColors.white,
    borderWidth: 2,
    borderRadius: 16,
    borderColor: EDColors.white,
    shadowColor: EDColors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  paymentMethodTitle: {
    // flex: 1,
    fontFamily: EDFonts.medium,
    fontSize: getProportionalFontSize(14),
    color: "#000",
    marginVertical: 10,
    marginStart: 10,
  },
  verifiedText: {
    flex: 1,
    fontFamily: EDFonts.medium,
    fontSize: getProportionalFontSize(13),
  },
  paymentIconStyle: { marginHorizontal: 10 },
  paymentHeader: {
    fontSize: getProportionalFontSize(16),
    fontFamily: EDFonts.bold,
    color: EDColors.black,
    marginHorizontal: 15,
    marginTop: 20,
  },
  dunzoDeliveryHeader: {
    fontSize: getProportionalFontSize(16),
    fontFamily: EDFonts.bold,
    color: EDColors.black,
    // marginHorizontal: 15,
    // marginTop: 20,
  },

  currentLocationSubText: {
    fontSize: getProportionalFontSize(13),
    fontFamily: EDFonts.regular,
    color: EDColors.blackSecondary,
  },

  contactView: {
    marginVertical: 10,
    marginHorizontal: 15,
  },
  cardView: {
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
    borderTopColor: EDColors.separatorColorNew,
    borderTopWidth: 1,
    paddingTop: 15,
    marginTop: 5,
    paddingHorizontal: 10,
  },
  cardSubView: {
    alignItems: "center",
    flex: 1,
  },
  last4Text: {
    fontFamily: EDFonts.medium,
    fontSize: getProportionalFontSize(14),
    color: EDColors.black,
  },
  expiredText: {
    fontFamily: EDFonts.regular,
    fontSize: getProportionalFontSize(13),
    color: EDColors.mastercard,
  },
  changeCard: {
    fontFamily: EDFonts.semiBold,
    fontSize: getProportionalFontSize(13),
    color: EDColors.primary,
    // flex: 1,
    textAlign: "right",
    textDecorationLine: "underline",
    marginLeft: 10,
  },
  datePickerView: {
    marginBottom: 10,
    paddingHorizontal: 10,
    alignItems: "center",
    marginHorizontal: 10,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EDEDED",
  },
  dayPickerView: {
    backgroundColor: EDColors.white,
    alignItems: "center",
    alignSelf: "center",
    marginHorizontal: 10,
    height: 30,
    width: metrics.screenWidth * 0.3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EDEDED",
  },
  dateTimeText: {
    color: "#000",
    marginHorizontal: 5,
    fontSize: getProportionalFontSize(13),
    fontFamily: EDFonts.semiBold,
  },
  dateView: {
    flex: 2,
    margin: 5,
    marginTop: 5,
    borderRadius: 16,
    backgroundColor: EDColors.white,
  },
  timeTextStyle: {
    fontSize: getProportionalFontSize(13),
    fontFamily: EDFonts.medium,
    color: EDColors.black,
    marginTop: 7,
    paddingHorizontal: 10,
  },
  pickerView: {
    alignItems: "center",
    marginHorizontal: 10,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EDEDED",
  },
  timeView: {
    flex: 2,
    margin: 5,
    marginTop: 5,
    borderRadius: 16,
    backgroundColor: EDColors.white,
  },
  countText: {
    marginHorizontal: 10,
    fontSize: getProportionalFontSize(14),
    fontFamily: EDFonts.medium,
    color: EDColors.black,
  },
  datePickerText: {
    fontSize: getProportionalFontSize(13),
    fontFamily: EDFonts.medium,
    color: EDColors.black,
    marginTop: 7,
  },
  dayPickerText: {
    paddingHorizontal: 4,
    textAlign: "center",
    flex: 0,
    fontSize: getProportionalFontSize(13),
    fontFamily: EDFonts.medium,
    color: EDColors.black,
  },
  packText: {
    margin: 5,
    fontSize: getProportionalFontSize(18),
    fontFamily: EDFonts.semiBold,
    color: EDColors.newColor,
  },
  themBtnStyle: {
    alignSelf: "center",
    margin: 10,
    width: metrics.screenWidth * 0.9,
    height: metrics.screenHeight * 0.075,
    backgroundColor: EDColors.primary,
    borderRadius: 16,
  },
  dateIcon: { marginTop: 7 },
  thenBtnText: {
    fontSize: getProportionalFontSize(16),
    fontFamily: EDFonts.semiBold,
  },
  personIconStyle: { margin: 5 },
  dateText: {
    marginHorizontal: 5,
    fontSize: getProportionalFontSize(14),
    fontFamily: EDFonts.semiBold,
    color: "#000",
  },
  countView: {
    marginTop: 10,
    marginHorizontal: 10,
    alignItems: "center",
    alignSelf: "center",
    borderRadius: 8,
    width: 80,
    height: 30,
    justifyContent: "flex-end",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#EDEDED",
  },

  dunzoDeliveryView: {
    // alignItems: "right",
    // alignSelf: "right",
    justifyContent: "flex-end",
    alignSelf: "flex-end",
    alignItems: "center",
    alignSelf: "center",
  },
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: 16,
  },
  dropdown: {
    height: 50,
    borderColor: "gray",
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: "absolute",
    backgroundColor: "white",
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});
//#endregion

export default connect(
  (state) => {
    return {
      userID: state.userOperations.userIdInRedux,
      token: state.userOperations.phoneNumberInRedux,
      cartCount: state.checkoutReducer.cartCount,
      checkoutDetail: state.checkoutReducer.checkoutDetail,
      lan: state.userOperations.lan,
      orderModeInRedux: state.userOperations.orderMode,
      countryArray: state.userOperations.countryArray,
      currentLocation: state.userOperations.currentLocation || {},
      googleMapKey: state.userOperations.googleMapKey,
      minOrderAmount: state.userOperations.minOrderAmount,
      selected_Res_Id: state.userOperations.selected_Res_Id,
      dunzo_Delivery_Amount: state.userOperations.dunzo_Delivery_Amount,
      dunzo_Delivery_Details: state.userOperations.dunzo_Delivery_Details,
      slot_Master_details: state.userOperations.slot_Master_details,
      type_today_tomorrow__date: state.userOperations.type_today_tomorrow__date,
    };
  },
  (dispatch) => {
    return {
      saveCheckoutDetails: (checkoutData) => {
        dispatch(saveCheckoutDetails(checkoutData));
      },
      saveGuestAddress: (checkoutData) => {
        dispatch(saveGuestAddress(checkoutData));
      },
      saveGuestDetails: (checkoutData) => {
        dispatch(saveGuestDetails(checkoutData));
      },
      save_delivery_dunzo__details: (data) => {
        dispatch(save_delivery_dunzo__details(data));
      },
      save_dunzodelivery_amount: (data) => {
        dispatch(save_dunzodelivery_amount(data));
      },
      save_order_payload_req: (data) => {
        dispatch(save_order_payload_req(data));
      },
      save_selected_slot_Id: (data) => {
        dispatch(save_selected_slot_Id(data));
      },
    };
  }
)(AddressListContainer);
