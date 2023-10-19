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

export class Subscription extends React.PureComponent {
  //#region LIFE CYCLE METHODS

  constructor(props) {
    super(props);
   
  

    this.resId =this.props.navigation.state.params !== undefined && 
    this.props.navigation.state.params.rest !== undefined
        ? this.props.navigation.state.params.allowPreOrder
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

    selectedPlan: "",
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

    foodMenu: ["Pongal", "Masal Dosa", "Idly", "Poori"],
    selectPlandays: ["5", "10", "15", "20"],
    Amount: ["300", "500", "1000", "2000"],
    subscriptionPlan: ["Breakfast 3", "Lunch 4", "Dinner 11", "Snacks 12"],
    showPicker: false,
    selectedDate: new Date(),

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
    selectedRestaurant: null,
    selectedCategory: null,
    isRestaurantModalVisible: false,
    isCategoryModalVisible: false,
    isPaymentModalVisible: false,
    isSummaryModalVisible: false,

    selectedAmount: "",
    selectedMenu: "",
    selecteddate: "",
    selcecteddays: "",
  };

  componentDidMount() {
    debugLog(
      "****************************** RAJA ****************************** save_order_payload"
    );
    this.get_save_subscription_Cart_fund();
  }

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
    this.setState({ isPaymentModalVisible: !this.state.isPaymentModalVisible });
  };

  toggleSumaryModal = () => {
    this.setState({ isSummaryModalVisible: !this.state.isSummaryModalVisible });
  };

  selectRestaurant = (restaurant) => {
    this.setState({ selectedRestaurant: restaurant, selectedCategory: null });
    // AsyncStorage.setItem("subscription",restaurant);
    this.toggleCategoryModal();
  };

  selectCategory = (category) => {
    this.setState({ selectedCategory: category });
    this.togglePaymentModal();
  };

  handleOptionSelect = (value) => {
    this.setState({ selectedOption: value });
  };

  handlePlanChange = (plan) => {
    this.setState({ selectedPlan: plan });
  };

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
    let {
      selectedRestaurant,
      selectedCategory,
      selectedMenu,
      selcecteddays,
      selectedAmount,
    } = this.state;
    let localsubsobje = {
      selectedRestaurant,
      selectedCategory,
      selectedMenu,
      selcecteddays,
      selectedAmount,
    };

    debugLog("localsubsobje ********************", localsubsobje);

    save_subscription_Cart(localsubsobje);
    this.setState({ isSummaryModalVisible: true });
  };

  add_subscription_fun = ( ) =>{
  this.setState({isPaymentModalVisible :true}) ; 

  }

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
      Amount,
      showPicker,
      selectedDate,

      selectedAmount,
      selectedMenu,
      selecteddate,
      selcecteddays,
      subscriptionPlan
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
                   this.add_subscription_fun()
                  }}
                  style={[styles.button, styles.restaurantButton]}
                >
                  <Text style={styles.buttonText}>Add Subscription</Text>
                </TouchableOpacity>
            
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
            <Modal
              visible={isRestaurantModalVisible}
              animationType="slide"
              transparent={false}
              onRequestClose={this.toggleRestaurantModal}
            >
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Select a Restaurant</Text>
                {restaurants.map((restaurant, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      this.selectRestaurant(restaurant.name);
                    }}
                    style={[
                      styles.button,
                      styles.modalButton,
                      styles.restaurantButton,
                    ]}
                  >
                    <Text style={styles.buttonText}>{restaurant.name}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  onPress={this.toggleRestaurantModal}
                  style={[
                    styles.button,
                    styles.modalButton,
                    styles.closeButton,
                  ]}
                >
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </Modal>
          </ScrollView>
          {/* Category Modal */}
          <Modal
            visible={isCategoryModalVisible}
            animationType="slide"
            transparent={false}
            onRequestClose={this.toggleCategoryModal}
          >
            <ScrollView>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Select a Category</Text>
                {selectedRestaurant &&
                  restaurants
                    .find(
                      (restaurant) => restaurant.name === selectedRestaurant
                    )
                    .categories.map((category, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => this.selectCategory(category)}
                        style={[
                          styles.button,
                          styles.modalButton,
                          styles.categoryButton,
                        ]}
                      >
                        <Text style={styles.buttonText}>{category}</Text>
                      </TouchableOpacity>
                    ))}
                <TouchableOpacity
                  onPress={this.toggleCategoryModal}
                  style={[
                    styles.button,
                    styles.modalButton,
                    styles.closeButton,
                  ]}
                >
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Modal>

          {/* Payment Modal */}
          <Modal
            visible={isPaymentModalVisible}
            animationType="slide"
            transparent={false}
            onRequestClose={this.togglePaymentModal}
          >
            <ScrollView>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle }>New Subscription</Text>
               
               
                {/* Add payment information and UI */}
                <View>
                <View>
                    <Text style={styles.modalTitle}>choose your plan</Text>
                    <SelectDropdown
                      data={subscriptionPlan}
                      onSelect={(selectedItem, index) => {
                        this.setState({ subscriptionPlan: selectedItem });
                        console.log(selectedItem, index);
                      }}
                      buttonTextAfterSelection={(selectedItem, index) => {
                        // text represented after item is selected
                        // if data array is an array of objects then return selectedItem.property to render after item is selected
                        return selectedItem;
                      }}
                      rowTextForSelection={(item, index) => {
                        // text represented for each item in dropdown
                        // if data array is an array of objects then return item.property to represent item in dropdown
                        return item;
                      }}
                    />
                  </View>

                  <View>
                    <Text style={styles.modalTitle}>choose your menu</Text>
                    <SelectDropdown
                      data={foodMenu}
                      onSelect={(selectedItem, index) => {
                        this.setState({ selectedMenu: selectedItem });
                        console.log(selectedItem, index);
                      }}
                      buttonTextAfterSelection={(selectedItem, index) => {
                        // text represented after item is selected
                        // if data array is an array of objects then return selectedItem.property to render after item is selected
                        return selectedItem;
                      }}
                      rowTextForSelection={(item, index) => {
                        // text represented for each item in dropdown
                        // if data array is an array of objects then return item.property to represent item in dropdown
                        return item;
                      }}
                    />
                  </View>

                  <View>
                    <Text style={styles.modalTitle}>choose plan days</Text>
                    <SelectDropdown
                      data={selectPlandays}
                      onSelect={(selectedItem, index) => {
                        this.setState({ selcecteddays: selectedItem });
                        console.log(selectedItem, index);
                      }}
                      buttonTextAfterSelection={(selectedItem, index) => {
                        // text represented after item is selected
                        // if data array is an array of objects then return selectedItem.property to render after item is selected
                        return selectedItem;
                      }}
                      rowTextForSelection={(item, index) => {
                        // text represented for each item in dropdown
                        // if data array is an array of objects then return item.property to represent item in dropdown
                        return item;
                      }}
                    />
                  </View>

                  <View>
                    <Text style={styles.modalTitle}>choose Plan Date</Text>
                    <Button
                      title={this.state.selectedDate.toDateString()}
                      onPress={this.handleButtonPress}
                      styles={{ backgroundColor: "white" }}
                    />
                    {this.state.showPicker && (
                      <DateTimePicker
                        value={this.state.selectedDate}
                        mode="date"
                        display="default"
                        onChange={this.handleDateChange}
                        style={styles.datePickerpic}
                      />
                    )}
                  </View>

                  <View>
                    <Text style={styles.modalTitle}>Plan Amount</Text>
                    <SelectDropdown
                      data={Amount}
                      onSelect={(selectedItem, index) => {
                        console.log(selectedItem, index);
                        this.setState({ selectedAmount: selectedItem });
                      }}
                      buttonTextAfterSelection={(selectedItem, index) => {
                        // text represented after item is selected
                        // if data array is an array of objects then return selectedItem.property to render after item is selected
                        return selectedItem;
                      }}
                      rowTextForSelection={(item, index) => {
                        // text represented for each item in dropdown
                        // if data array is an array of objects then return item.property to represent item in dropdown
                        return item;
                      }}
                    />
                  </View>
                </View>

               
                <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity
                  onPress={this.handleSumaryPress}
                  style={[styles.button,
                    styles.modalButton,
                    styles.closeButton,]}
                >
                  <Text style={styles.buttonText}>Submit</Text>
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
                Selected Plan Name: {this.state.subscriptionPlan}
              </Text>
              <Text style={styles.cardTextsum}>
                Selected Menu: {this.state.selectedMenu}
              </Text>
              <Text style={styles.cardTextsum}>
                Selected Days: {this.state.selcecteddays}
              </Text>
              <Text style={styles.cardTextsum}>
                Selected Amount: {this.state.selectedAmount}
              </Text>
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
    marginBottom: 20,
    marginLeft:20,
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
