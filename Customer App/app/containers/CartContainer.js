import React from "react";
import { Platform } from "react-native";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Icon } from "react-native-elements";
import { heightPercentageToDP } from "react-native-responsive-screen";
import { initialWindowMetrics } from "react-native-safe-area-context";
import { NavigationEvents } from "react-navigation";
import { connect } from "react-redux";
import CartItem from "../components/CartItem";
import { EDCookingInfo } from "../components/EDCookingInfo";
import EDPlaceholderComponent from "../components/EDPlaceholderComponent";
import EDPopupView from "../components/EDPopupView";
import EDRTLText from "../components/EDRTLText";
import EDRTLTextInput from "../components/EDRTLTextInput";
import EDRTLView from "../components/EDRTLView";
import EDThemeButton from "../components/EDThemeButton";
import { strings } from "../locales/i18n";
import {
  saveCartCount,
  saveCartPrice,
  saveCheckoutDetails,
  saveIsCheckoutScreen,
} from "../redux/actions/Checkout";
import {
  clearCurrency_Symbol,
  getCartList,
  saveCartData,
} from "../utils/AsyncStorageHelper";
import { EDColors } from "../utils/EDColors";
import { EDFonts } from "../utils/EDFontConstants";
import metrics from "../utils/metrics";
import BaseContainer from "./BaseContainer";
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

import {
  saveCurrentLocation,
  saveFoodType,
  saveLanguageInRedux,
  saveMapKeyInRedux,
  saveMinOrderAmount,
  save_delivery_dunzo__details,
  save_dunzodelivery_amount,
  save_slot_Master_details,
} from "../../app/redux/actions/User";

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
import axios from "axios";
import {
  showDialogue,
  showNoInternetAlert,
  showPaymentDialogue,
  showProceedDialogue,
  showValidationAlert,
} from "../utils/EDAlert";

export class CartContainer extends React.PureComponent {
  //#region  LIFE CYCLE EMTHODS

  /**CONSTRUCTOR */
  constructor(props) {
    super(props);

    this.cartData = [];
    this.deleteIndex = -1;
    this.cart_id = 0;
    this.cartResponse = undefined;
    this.itemRateToDelete = 0;

    this.isview =
      this.props.navigation.state.params != undefined &&
      this.props.navigation.state.params.isview != undefined &&
      this.props.navigation.state.params.isview != null
        ? this.props.navigation.state.params.isview
        : false;
  }

  /** STATE */
  state = {
    key: 1,
    isLoading: false,
    isAsyncSync: false,
    cartData: "",
    value: 0,
    curr_latitude: 0.0,
    curr_longitude: 0.0,
    showInfoModal: false,
  };

  componentDidMount() {
    // debugLog(
    //   "****************************** Vijay ******************************  this.props.navigation.state.params",
    //   this.props
    // );
    // debugLog(
    //   "****************************** Vijay ******************************  this.props.userID",
    //   this.props.selected_Res_Id
    // );

    // debugLog(
    //   "****************************** Vijay ****************************** CartContainer this.props.dunzo_Delivery_Amount",
    //   this.props.dunzo_Delivery_Amount
    // );

    debugLog(
      "******************************  CartContainer this.state.cartData",
      this.state.cartData
    );

    debugLog(
      "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@******************************",
      this.props.selected_category_id_home_cont
    );

    // debugLog(
    //   "****************************** CartContainer this.state.cartData.items",
    //   this.state.cartData.items
    // );

    // debugLog(
    //   "********************************** CartContainer this.props.selected_Res_Id ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ ",
    //   this.props.selected_Res_Id
    // );

    // debugLog(
    //   " ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ ",
    //   this.props.selected_Slot_ID
    // );

    // debugLog(
    //   " ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ ",
    //   this.props.selected_category_id
    // );

    // debugLog(
    //   "****************************** Vijay ****************************** Number(this.props.dunzo_Delivery_Details)",
    //   this.props.dunzo_Delivery_Details
    // );
    // this.props.save_delivery_dunzo__details();
    // this.props.save_dunzodelivery_amount();
    //   this.getAddressList();
    if (this.props.dunzo_Delivery_Amount == undefined) {
      this.getAddressList();
    }
    if (this.props.selected_Slot_ID == undefined) {
      this.getSlotMAster();
    }
  }

  cartTotalPrice = (price) => {};
  navigateToRestaurant = () => {
    this.props.navigation.push("RestaurantContainer", {
      restId: this.res_id,
      content_id: this.content_id,
    });
  };

  getSlotMAster = async () => {
    // debugLog("666666666666666666666666666", this.props.selected_Res_Id);
    // debugLog("777777777777777777777777", this.props.selected_category_id);
    let splitres_name =
      this.props?.selected_Res_Id && this.props?.selected_Res_Id.split("-");

    let getDeliveryChargeAPICall = await axios.get(
      `https://fis.clsslabs.com/FIS/api/auth/getDeliverySlot?outletId=${splitres_name[0]}&menuCategoryId=${this.props.selected_category_id}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    // debugLog(
    //   "666666666666666666666666666",
    //   getDeliveryChargeAPICall?.data?.data
    // );
    // localStorage.setItem("Slot_Master_Rest_Category", Slot_Master);
    // localStorage.setItem(
    //   "Slot_Master_Rest_Category",
    //   JSON.stringify(getDeliveryChargeAPICall?.data?.data)
    // );
    this.props.save_slot_Master_details(
      getDeliveryChargeAPICall?.data?.data || []
    );
  };

  /** GET ADDRESS API */
  getAddressList = () => {
    let param = {
      language_slug: this.props.lan,
      user_id: this.props.userID || 0,
      showonly_main: 1,
    };
    getAddressListAPI(
      param,
      this.onSuccessLoadAddress,
      this.onFailureLoadAddress,
      this.props
    );
    // showValidationAlert(strings("noInternet"));
  };

  onSuccessLoadAddress = async (onSuccess) => {
    // debugLog(
    //   "datas.status *************************** 00000000000000 onSuccessLoadAddress ~~~~~~~~~~~~~~~~~~~~~~~",
    //   onSuccess.address[0]
    // );

    // this.props.selected_Res_Id

    // debugLog(
    //   "datas.status *************************** this.props.selected_Res_Id ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ ",
    //   this.props.selected_Res_Id
    // );

    let splitres_name =
      this.props?.selected_Res_Id && this.props?.selected_Res_Id.split("-");

    // debugLog(
    //   "datas.status *************************** this.props.selected_Res_Id ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ ",
    //   splitres_name
    // );

    if (onSuccess != undefined) {
      if (onSuccess.status == RESPONSE_SUCCESS) {
        if (onSuccess.address !== undefined && onSuccess.address.length > 0) {
          let datas = {
            // restuarant_id: this.res_id,
            restuarant_id: this.res_id || splitres_name[0],
            customer_id: this.props.userID || 0,
            address_id: onSuccess?.address[0].address_id || 0,
            restuarantName: splitres_name[1] || "",
          };
          // debugLog(
          //   "datas.status *************************** 00000000000000",
          //   datas
          // );
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
          //   "getDeliveryChargeAPICall.status *************************** 00000000000000",
          //   getDeliveryChargeAPICall.status
          // );

          if (getDeliveryChargeAPICall.status === 200) {
            // debugLog(
            //   "getDeliveryChargeAPICall.status ************************** 2222222222222222222222222",
            //   getDeliveryChargeAPICall?.data[0]
            // );
            // debugLog(
            //   "getDeliveryChargeAPICall.status *************************** 00000000000000",
            //   getDeliveryChargeAPICall.status
            // );
            this.props.save_delivery_dunzo__details(
              getDeliveryChargeAPICall?.data[0]
            );
            this.props.save_dunzodelivery_amount(
              getDeliveryChargeAPICall?.data[0]?.directPointDelivery?.amount
            );
          } else {
            // debugLog(
            //   "getDeliveryChargeAPICall.status *************************** else ifffff ",
            //   getDeliveryChargeAPICall.status
            // );
            this.props.save_delivery_dunzo__details();
            this.props.save_dunzodelivery_amount();
          }
        } else {
        }
      } else {
      }
    } else {
    }
  };

  onFailureLoadAddress = (onFailure) => {
    showValidationAlert("Unable to Process Dunzo Delivery");
  };

  // RENDER METHOD
  render() {
    let { cartData } = this.state;
    debugLog(
      "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",
      this.state.cartData
    );

    return (
      <BaseContainer
        title={this.resName || ""}
        left={isRTLCheck() ? "arrow-forward" : "arrow-back"}
        right={[]}
        onLeft={this.onBackEventHandler}
        loading={this.state.isLoading}
      >
        {this.renderCookingInfo()}
        {/* NAVIGATION EVENTS */}
        <NavigationEvents onWillFocus={this.onWillFocusEvents} />

        {/* DISPLAY MAIN VIEW */}
        {this.state.cartData != "" && this.state.cartData.items.length > 0 ? (
          <View style={{ flex: 1, paddingBottom: 5 }}>
            <FlatList
              data={this.state.cartData != "" ? this.state.cartData.items : []}
              keyExtractor={(item, index) => item + index}
              showsVerticalScrollIndicator={false}
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
                    totalRate={this.cartTotalPrice}
                    showCookingInfo={this.showCookingInfo}
                    removeCookingInfo={this.removeCookingInfo}
                  />
                );
              }}
            />

            {/* NEXT VIEW */}
            <View style={{}}>
              {this.isview === true ? (
                <View />
              ) : (
                <>
                  {/* <EDRTLView style={style.checkOutContainer}>

                                        <TouchableOpacity style={style.roundButton} onPress={this.props.userID != undefined && this.props.userID != '' ? this.onNextEventHandler : this.navigateToLogin}>
                                            <Text style={[style.button, { fontFamily: EDFonts.medium, fontSize: getProportionalFontSize(16) }]}>
                                                {this.props.userID != undefined && this.props.userID != '' ? strings('next') : strings('loginTitle')}
                                            </Text>
                                        </TouchableOpacity>
                                    </EDRTLView> */}
                  <View style={{ marginHorizontal: 10 }}>
                    {this.props.userID != undefined &&
                    this.props.userID != "" ? null : (
                      <EDThemeButton
                        style={[
                          {
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
                          {
                            backgroundColor: EDColors.white,
                            borderColor: EDColors.separatorColorNew,
                            borderWidth: 1.5,
                            marginBottom: 0,
                          },
                        ]}
                        textStyle={[
                          style.themeButtonText,
                          { color: EDColors.black },
                        ]}
                        label={strings("guestCheckout")}
                        onPress={this.onNextEventHandler}
                      />
                    )}
                    {/* {this.state.dunzo_Delivery_Point_Amount_DirectAMOUNT > 0 ? ( */}
                    <EDThemeButton
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
                      label={
                        this.props.userID != undefined &&
                        this.props.userID != ""
                          ? strings("next")
                          : strings("loginTitle")
                      }
                      onPress={
                        this.props.userID != undefined &&
                        this.props.userID != ""
                          ? this.onNextEventHandler
                          : this.navigateToLogin
                      }
                    />
                    {/* ) : (
                      <EDThemeButton
                        style={[
                          {
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
                          {
                            marginBottom:
                              (Platform.OS == "ios"
                                ? initialWindowMetrics.insets.bottom
                                : 0) + 5,
                          },
                        ]}
                        textStyle={style.themeButtonText}
                        label={"Loading"}
                      />
                    ) */}
                    {/* } */}
                  </View>
                  {/* TEMPORARY */}
                  {/* <EDRTLView style={style.checkOutContainer}>

                                        <TouchableOpacity style={style.roundButton} onPress={this.onNextEventHandler}>
                                            <Text style={[style.button, { fontFamily: EDFonts.medium, fontSize: getProportionalFontSize(16) }]}>
                                                {strings('next')}
                                            </Text>
                                        </TouchableOpacity>
                                    </EDRTLView> */}
                </>
              )}
            </View>
          </View>
        ) : this.state.cartData != "" &&
          this.state.cartData.items.length <= 0 ? (
          <View style={{ flex: 1, height: metrics.screenHeight * 0.9 }}>
            <EDPlaceholderComponent
              title={strings("emptyCartMsg")}
              // subTitle={this.strOnScreenSubtitle}
            />
          </View>
        ) : null}
      </BaseContainer>
    );
  }
  //#endregion

  //#region
  /** BACK EVENT HANDLER */
  onBackEventHandler = () => {
    this.props.navigation.goBack();
  };
  //#endregion

  showCookingInfo = (index) => {
    this.selectedIndex = index;
    this.comment = this.state.cartData.items[index].comment;
    this.setState({ showInfoModal: true });
  };

  removeCookingInfo = (index) => {
    var array = this.state.cartData;
    array.items[index].comment = "";
    this.updateUI(array);
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
        // style={{ justifyContent: 'flex-end' }}
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
    var array = this.state.cartData;
    if (
      instruction !== undefined &&
      instruction !== null &&
      instruction.trim().length !== 0
    ) {
      array.items[this.selectedIndex].comment = instruction;
      this.updateUI(array);
    }
    this.hideCookingInfo();
  };

  //#region
  /** ON PLUS CLICKED */
  onPlusEventHandler = (value, index) => {
    if (value > 0) {
      this.state.cartData.items[index].quantity = value;
      this.updateUI(this.state.cartData);
    }
  };
  //#endregion

  //#region
  /** ONMINUS CLICKED */
  onMinusEventHandler = (value, index) => {
    if (value > 0) {
      this.state.cartData.items[index].quantity = value;
      this.updateUI(this.state.cartData);
    } else if (value == 0) {
    }
  };
  //#endregion

  //#region
  /** ON DLEETE CLICKED */
  onDeletEventHandler = (index, rate) => {
    this.itemRateToDelete = rate;
    this.deleteIndex = index;
    // this.setState({ isDeleteVisible: true });
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
  // /** NEXT BUTTON EVENT  */ TO BE USED DURING GUEST CHECKOUT
  onNextEventHandler = () => {
    // debugLog(
    //   "***************************************** 0000000000",
    //   this.state.cartData
    // );

    // debugLog(
    //   "***************************************** 1111111111111",
    //   this.props
    // );

    // debugLog(
    //   "***************************************** 22222222222222222",
    //   this.props.navigation.state.params
    // );

    // debugLog(
    //   "*****************************************  3333333333333",
    //   this.props.navigation.state
    // );

    // if (this.props.userID != undefined && this.props.userID != '') {
    saveCartData(
      this.state.cartData,
      (onSuccess) => {
        this.props.navigation.navigate("AddressListContainer", {
          isSelectAddress: true,
          resId: this.res_id,
          cartItems: this.state.cartData.items,
        });
      },
      (onfalilure) => {}
    );
  };

  //#endregion
  navigateToLogin = () => {
    this.props.saveIsCheckoutScreen(true);
    this.props.navigation.navigate("LoginContainer", {
      isCheckout: true,
    });
  };

  //#region
  /** BUTTON PRESSED EVENTS */
  onYesEventHandler = () => {
    var array = this.state.cartData.items;
    if (
      this.props.cartPrice != undefined &&
      this.props.cartPrice !== null &&
      Number(this.props.cartPrice) >= Number(this.itemRateToDelete)
    ) {
      var price = Number(this.props.cartPrice) - Number(this.itemRateToDelete);
      this.props.saveCartPrice(price);
    }
    array.splice(this.deleteIndex, 1);
    this.updateUI(this.state.cartData);
  };

  onNoEventHandler = () => {
    this.deleteIndex = -1;
  };
  //#endregion

  //#region NETWORK
  //#region CART LIST
  /** GET CART LIST FROM ASYNC */
  getCartDataList = () => {
    this.setState({ isLoading: true });
    getCartList(
      (success) => {
        var cartArray = success;
        this.promoCode = success.coupon_name;
        this.promoArray = success.coupon_array;
        // debugLog("PROMO ARRAY :::::", this.promoArray);
        this.res_id = success.resId;
        this.content_id = success.content_id;
        this.cart_id = success.cart_id;
        this.resName = success.resName;
        this.state.isAsyncSync = true;
        if (success.items.length == 0) {
          this.props.navigation.goBack();
        }
        this.setState({
          cartData: cartArray,
          key: this.state.key + 1,
          isLoading: false,
        });
      },
      (emptyList) => {
        this.cartResponse = { items: [] };
        this.setState({ isAsyncSync: true, isLoading: false });
      },
      (error) => {
        this.cartResponse = { items: [] };
        this.setState({ isAsyncSync: true, isLoading: false });
      }
    );
  };
  //#endregion

  //#region UPDATE UI
  updateUI(response) {
    this.cart_id = response.cart_id;
    this.res_id = response.resId;
    this.content_id = response.content_id;
    var updatedCart = {
      resId: response.resId,
      content_id: response.content_id,
      items: response.items,
      coupon_name: response.coupon_name,
      coupon_array: response.coupon_array,
      cart_id: response.cart_id,
      resName: response.resName,
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
      this.props.navigation.goBack();
    } else {
      this.updateCount(response.items);
    }
    this.setState({
      cartData: response,
      key: this.state.key + 1,
    });
  }
  //#endregion

  updateCount(data) {
    var count = 0;
    var price = 0;
    var array = [];
    var subArray = [];
    data.map((item, index) => {
      count = count + item.quantity;
      price =
        item.offer_price !== undefined && item.offer_price !== ""
          ? Number(price) + item.quantity * Number(item.offer_price)
          : Number(price) + item.quantity * Number(item.price);
      if (
        item.addons_category_list != undefined &&
        item.addons_category_list != []
      ) {
        array = item.addons_category_list;
        array.map((data) => {
          subArray = data.addons_list;
          subArray.map((innerData) => {
            price =
              Number(price) + item.quantity * Number(innerData.add_ons_price);
          });
        });
      }
    });
    this.props.saveCartCount(count);
    this.props.saveCartPrice(price);
  }

  //#region
  onWillFocusEvents = (payload) => {
    this.getCartDataList();
  };
  //#endregion
}

//#region STYLES
export const style = StyleSheet.create({
  checkOutContainer: {
    margin: 10,
    borderRadius: 16,
    alignSelf: "center",
    backgroundColor: EDColors.primary,
    width: "90%",
    alignItems: "center",
    justifyContent: "center",
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
  addMoreText: {
    fontFamily: EDFonts.regular,
    fontSize: getProportionalFontSize(16),
    alignSelf: "center",
    backgroundColor: EDColors.white,
    borderRadius: 16,
    padding: 10,
    paddingVertical: 15,
    width: metrics.screenWidth - 20,
    flex: 1,
    marginHorizontal: 10,
    textAlign: "center",
    color: EDColors.black,
    borderColor: EDColors.separatorColorNew,
    borderWidth: 1,
    textAlignVertical: "center",
  },
  totalPrice: {
    flex: 1,
    fontFamily: EDFonts.regular,
    fontSize: getProportionalFontSize(22),
    alignSelf: "center",
    marginLeft: 10,
  },
  roundButton: {
    alignSelf: "center",
    margin: 10,
    borderRadius: 16,
    alignSelf: "center",
    backgroundColor: EDColors.primary,
    width: "90%",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    paddingTop: 10,
    paddingRight: 20,
    paddingLeft: 20,
    paddingBottom: 10,
    color: "#fff",
    fontFamily: EDFonts.regular,
  },
});
//#endregion

export default connect(
  (state) => {
    return {
      userID: state.userOperations.userIdInRedux,
      token: state.userOperations.phoneNumberInRedux,
      cartCount: state.checkoutReducer.cartCount,
      lan: state.userOperations.lan,
      currency: state.checkoutReducer.currency_symbol,
      cartPrice: state.checkoutReducer.cartPrice,
      res_id: state.userOperations.res_id,
      selected_Res_Id: state.userOperations.selected_Res_Id,
      dunzo_Delivery_Amount: state.userOperations.dunzo_Delivery_Amount,
      dunzo_Delivery_Details: state.userOperations.dunzo_Delivery_Details,
      selected_Slot_ID: state.userOperations.selected_Slot_ID,
      selected_category_id: state.userOperations.selected_category_id,
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
      saveCartPrice: (data) => {
        dispatch(saveCartPrice(data));
      },
      saveIsCheckoutScreen: (data) => {
        dispatch(saveIsCheckoutScreen(data));
      },

      save_delivery_dunzo__details: (data) => {
        dispatch(save_delivery_dunzo__details(data));
      },
      save_dunzodelivery_amount: (data) => {
        dispatch(save_dunzodelivery_amount(data));
      },
      save_slot_Master_details: (table_id) => {
        dispatch(save_slot_Master_details(table_id));
      },
    };
  }
)(CartContainer);
