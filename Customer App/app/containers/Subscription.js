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
    selected_restaurant: "",
    selected_restaurantCategory: "",

    selectedDependence: "",
    selectedDays: [],
    startDate: "",
    amount: "",
    endDate: "",
    isSubmitEnabled: false,
    summary: null,
    showSummary: false,

    selectedOption: null,
    selectMenuOption: "",

    foodMenu: [],
    selectPlandays: [],
    planAmount: {},

    subscriptionPlan: [
      {
        value: "Breakfast",
        name: "Breakfast",
        planId: "999",
        selectPlandays: [
          { value: "5", name: "5", amount: { value: "300", name: "300" } },
        ],
      },
    ],

    showPicker: false,
    selectedDate: new Date(),

    dateTimePickerVisible: false,
    dateOrTimeValue: new Date(),

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
    selectedRestaurant: "",
    selectedMenu: {},
    // selecteddate: "",
    selcecteddays: "",
    selectedPlan: "",
    isFocus: false,
    selected_user_subscription_list: [],
    subscription_Master_list: [],
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
  }

  subscription_Master_listapi = async () => {
    let generate_order_id = await axios.get(
      `http://52.77.35.146:8080/FIS/api/auth/getMlmfSchemePlanDetails?outletId=${this.props.navigation.state.params.restId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Basic" +
            "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbkBjbHNzbGFicy5jb20iLCJpYXQiOjE2OTg0ODMxNzYsImV4cCI6MTY5ODU2OTU3Nn0.ciUQO7o9RCX22xHfQ5TdyC4sugaZMSn6veH0f0wuXb2AN2kbcUMNxzN-RmsXFqSCovXPMlm53n1NAdWSVm3s3w",
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
      // this.startRazorPayment(generate_order_id.data?.id);
    } else {
      this.setState({ subscription_Master_list: [] });
      // showValidationAlert("Unable to generate order id");
    }
  };

  get_subscription_List = async () => {
    let generate_order_id = await axios.get(
      `http://52.77.35.146:8080/FIS/api/auth/getMlmfSchemeSubscriptionDetails?outletId=${this.props.navigation.state.params.restId}&customerId=${this.props.userID}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Basic" +
            "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbkBjbHNzbGFicy5jb20iLCJpYXQiOjE2OTg0ODMxNzYsImV4cCI6MTY5ODU2OTU3Nn0.ciUQO7o9RCX22xHfQ5TdyC4sugaZMSn6veH0f0wuXb2AN2kbcUMNxzN-RmsXFqSCovXPMlm53n1NAdWSVm3s3w",
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
    this.setState({
      isPaymentModalVisible: !this.state.isPaymentModalVisible,
      selectedAmount: "",
      selcecteddays: "",
      selectedPlan: "",
    });
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

  ////DATE DateTimePicker
  handleButtonPress = () => {
    this.setState({ showPicker: true });
  };

  handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      this.setState({
        showPicker: Platform.OS === "ios",
        selecteddate: selectedDate,
      });
    } else {
      this.setState({ showPicker: false });
    }
  };

  handleSumaryPress = () => {
    let { selectedRestaurant, selectedPlan, selcecteddays, selectedAmount } =
      this.state;
    let localsubsobje = {
      selectedRestaurant,
      selectedPlan,
      selcecteddays,
      selectedAmount,
    };

    debugLog("localsubsobje ********************", localsubsobje);

    save_subscription_Cart(localsubsobje);
    this.setState({ isSummaryModalVisible: true });
  };

  add_subscription_fun = () => {
    this.setState({ isPaymentModalVisible: true });
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
      selectedMenu,
      selecteddate,
      selcecteddays,
      subscriptionPlan,
      isFocus,
      selectedPlan,
      selected_user_subscription_list,
      subscription_Master_list,
    } = this.state;

    return (
      <>
        <View style={styles.container}>
          <Text style={styles.title}>
            {selectedRestaurant
              ? `${selectedRestaurant}`
              : "Restaurant Order Flow"}
          </Text>

          <ScrollView>
            <TouchableOpacity
              onPress={() => {
                this.add_subscription_fun();
              }}
              style={[styles.button, styles.restaurantButton]}
            >
              <Text style={styles.buttonText}>+Add</Text>
            </TouchableOpacity>
          </ScrollView>

          <ScrollView horizontal={true} showsHorizontalScrollIndicator={true}>
            {selected_user_subscription_list &&
              selected_user_subscription_list.length > 0 &&
              selected_user_subscription_list.map((items) => {
                return (
                  <Card
                    containerStyle={{
                      backgroundColor: "#85e6e4",
                      height: 100,
                      width: 300,
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
                      {items?.planName} - RS.{items?.totalAmount}
                    </Text>
                    <Text
                      style={{
                        fontSize: 18,
                        color: "black",
                        fontWeight: "400",
                        textAlign: "center",
                      }}
                    >
                      END DATE - {items?.endDate}
                    </Text>
                  </Card>
                );
              })}
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
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Select Subscription Plan</Text>

                {/* Add payment information and UI */}
                <View>
                  {/* <ScrollView
                    horizontal={false}
                    showsVerticalScrollIndicator={true}
                  > */}
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
                    })}
                  {/* </ScrollView> */}

                  {/* <View style={styles.containerDrop}>
                    <Dropdown
                      style={[
                        styles.dropdownDrop,
                        isFocus && { borderColor: "blue" },
                      ]}
                      placeholderStyle={styles.placeholderStyleDrop}
                      selectedTextStyle={styles.selectedTextStyleDrop}
                      inputSearchStyle={styles.inputSearchStyleDrop}
                      iconStyle={styles.iconStyleDrop}
                      data={this.state?.subscriptionPlan}
                      // search
                      maxHeight={200}
                      labelField="name"
                      valueField="value"
                      placeholder={!isFocus ? "Select Plan" : "..."}
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
                          selectPlandays: item?.selectPlandays,
                          isFocus: !isFocus,
                        });

                        debugLog(
                          "selectedPlan%%%%%%%%%@@@@!!!!!!",
                          selectedPlan
                        );
                        debugLog("foodMenu%%%%%%%%%@@@@!!!!!!", foodMenu);

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
                  </View> */}
                  {subscriptionPlan && selectPlandays && (
                    <View style={styles.containerDrop}>
                      <Text style={styles.modalTitle}>Select Days</Text>
                      {/* <Dropdown
                        style={[
                          styles.dropdownDrop,
                          isFocus && { borderColor: "blue" },
                        ]}
                        placeholderStyle={styles.placeholderStyleDrop}
                        selectedTextStyle={styles.selectedTextStyleDrop}
                        inputSearchStyle={styles.inputSearchStyleDrop}
                        iconStyle={styles.iconStyleDrop}
                        data={this.state?.selectPlandays}
                        // search
                        maxHeight={200}
                        labelField="name"
                        valueField="value"
                        placeholder={!isFocus ? "Count" : "..."}
                        searchPlaceholder="Search..."
                        //value={selected_Slot_value}
                        // onFocus={() => setIsFocus(true)}
                        // onBlur={() => setIsFocus(false)}
                        onChange={(item, i) => {
                          // setValue(item.value);
                          //this.slot_Master_against_category_Call(item);
                          this.setState({
                            selcecteddays: item?.value,
                            planAmount: item?.amount,
                            selectedAmount: item?.amount.value,
                            isFocus: !isFocus,
                          });
                        }}
                        renderLeftIcon={() => (
                          <AntDesign
                            style={styles.iconDrop}
                            color={isFocus ? "blue" : "black"}
                            name="Safety"
                            size={20}
                          />
                        )}
                      /> */}
                      <EDThemeButton
                        label="5"
                        style={{
                          width: "10%",
                          backgroundColor: "green",
                          marginLeft: 15,
                        }}
                        textStyle={{
                          fontSize: getProportionalFontSize(14),
                          paddingLeft: 7,
                          paddingRight: 7,
                        }}
                      />
                    </View>
                  )}

                  {/* {selectPlandays && (
                    <View style={styles.containerDrop}>
                      <Text style={styles.modalTitle}> Total Amount</Text>

                      <TextInput
                        style={[
                          styles.dropdownDrop,
                          isFocus && { borderColor: "blue" },
                        ]}
                        value={planAmount.value}
                        placeholder="Total Amount"
                        editable={false}
                        //keyboardType="numeric"
                      />
                    </View>
                  )} */}

                  {/* <View>
                    <Text style={styles.modalTitle}>choose Plan Date</Text>
                    <View>
                      <TouchableOpacity
                        onPress={() =>
                          this.setState({ dateTimePickerVisible: true })
                        }
                      >
                        <TextInput
                          style={styles.dropdownDrop}
                          label="Shift Starts At"
                          placeholder={"01/01/2023"}
                          editable={false}
                          value={this.state.dateOrTimeValue.toDateString()}
                        />
                      </TouchableOpacity>

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
                </View>

                <View style={{ flexDirection: "row", marginTop: 10 }}>
                  <TouchableOpacity
                    onPress={this.handleSumaryPress}
                    style={[
                      styles.button,
                      styles.modalButton,
                      styles.closeButton,
                    ]}
                  >
                    <Text style={styles.buttonText}>PAY-{selectedAmount}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={this.togglePaymentModal}
                    style={[
                      styles.button,
                      styles.modalButton,
                      styles.closeButton,
                    ]}
                  >
                    <Text style={styles.buttonText}>Close</Text>
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
              style={[styles.button, styles.modalButton, styles.closeButton]}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </Modal>
        </View>
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
  //DropDown styles

  containerDrop: {
    backgroundColor: "white",
    padding: 16,
  },
  dropdownDrop: {
    height: 50,
    borderColor: "gray",
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
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
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  cardTextsum: {
    fontSize: 16,
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
    fontWeight: "bold",
    marginBottom: 20,
  },
  button: {
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
  restaurantButton: {
    backgroundColor: "#28d439",
    marginLeft: 180,
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
  },
  modalItem: {
    fontSize: 18,
    marginVertical: 10,
  },
  modalButton: {
    padding: 10,
    borderRadius: 10,
    margin: 5,
    width: 100,
    alignItems: "center",
  },
  closeButton: {
    backgroundColor: "#ff0048",
  },
  paymentText: {
    fontSize: 16,
    marginBottom: 10,
  },
});
