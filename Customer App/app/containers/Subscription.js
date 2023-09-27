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
  SafeAreaView,Modal,
  TouchableHighlight,
} from "react-native";

import { Icon, Card, ListItem } from "react-native-elements";
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
import Carousel, { Pagination } from "react-native-snap-carousel";
import { data } from "currency-codes";


export class Subscription extends React.PureComponent {
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
    selected_restaurant: "",
    selected_restaurantCategory:"",
    data: [
      {
        id: "1",
        text: " a2b ",
        flag: false,
        ressubsmenu: [
          { id: "12233", name: "breakfastsubs-500 RS" },
          { id: "23123423", name: "lunch_subscript-700 RS" },
          { id: "12232343", name: "dinner_astsubs-800 RS" },
        ],
      },

      {
        id: "2",
        text: "My bhojan",
        flag: false,

        ressubsmenu: [
          { id: "12233", name: "breakfastsubs-500 RS" },
          { id: "23123423", name: "lunch_subscript-700 RS" },
          { id: "12232343", name: "dinner_astsubs-800 RS" },
        ],
      },

      {
        id: "3",
        text: "My bhojan",
        flag: false,

        ressubsmenu: [
          { id: "12233", name: "breakfastsubs-500 RS" },
          { id: "23123423", name: "lunch_subscript-700 RS" },
          { id: "12232343", name: "dinner_astsubs-800 RS" },
        ],
      },
      {
        id: "4",
        text: "My bhojan",
        flag: false,

        ressubsmenu: [
          { id: "12233", name: "breakfastsubs-500 RS" },
          { id: "23123423", name: "lunch_subscript-700 RS" },
          { id: "12232343", name: "dinner_astsubs-800 RS" },
        ],
      },

      // { id: '2', text: 'My bhojan',flag: false, itemSlot:{id:"1",category:"Lunch", } },
      // { id: '3', text: 'Card 3',flag: false, itemSlot:{id:"1",category:"Dinner", } },
      // Add more data items as needed
    ],

    // save_order_payload: localStorage.getItem("save_order_payload"),
    restaurants: [
      { name: ' My BhoJan', categories: ['Shcool-Breakfast 1','Office-Lunch 2','-Dinner 9', 'Snacks 10'] },
      { name: 'A2B', categories: ['Breakfast 3', 'Lunch 4','Dinner 11', 'Snacks 12'] },
      { name: ' Hotel Adyar', categories: ['Breakfast 5', 'Lunch 6','Dinner 13', 'Snacks 14'] },
      { name: 'Komala’s Restaurant ', categories: ['Breakfast 7', 'Lunch 8','Dinner 15', 'Snacks 16'] },
      // Add more restaurants and categories as needed
    ],
    selectedRestaurant: null,
    selectedCategory: null,
    isRestaurantModalVisible: false,
    isCategoryModalVisible: false,
    isPaymentModalVisible: false,




  };

  componentDidMount() {
    debugLog(
      "****************************** RAJA ****************************** save_order_payload"
    );
  }


 
 
  toggleRestaurantModal = () => {
    this.setState({ isRestaurantModalVisible: !this.state.isRestaurantModalVisible });
  };

  toggleCategoryModal = () => {
    this.setState({ isCategoryModalVisible: !this.state.isCategoryModalVisible });
  };

  togglePaymentModal = () => {
    this.setState({ isPaymentModalVisible: !this.state.isPaymentModalVisible });
  };

  selectRestaurant = (restaurant) => {
    this.setState({ selectedRestaurant: restaurant, selectedCategory: null });
    this.toggleCategoryModal();
  };

  selectCategory = (category) => {
    this.setState({ selectedCategory: category });
    this.togglePaymentModal();
  };

  


  // RENDER METHOD
  render() {
    let { data, restaurants,
      selectedRestaurant,
      selectedCategory,
      isRestaurantModalVisible,
      isCategoryModalVisible,
      isPaymentModalVisible,   } = this.state;

    return (
      <BaseContainer title={"My Subscription"} left={"menu"}>
      
      <View style={styles.container}>
        <Text style={styles.title}>Restaurant Order Flow</Text>

        {selectedRestaurant ? (
          <TouchableOpacity
            onPress={this.toggleCategoryModal}
            style={[styles.button, styles.categoryButton]}
          >
            <Text style={styles.buttonText}>
              {selectedCategory ? `Selected Category: ${selectedCategory}` : 'Select a Category'}
            </Text>
          </TouchableOpacity>
        ) : (
          <ScrollView>
            {restaurants.map((restaurant, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => this.selectRestaurant(restaurant.name)}
                style={[styles.button, styles.restaurantButton]}
              >
                <Text style={styles.buttonText}>{restaurant.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

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
          <ScrollView>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Select a Restaurant</Text>
              {restaurants.map((restaurant, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => this.selectRestaurant(restaurant.name)}
                  style={[styles.button, styles.modalButton, styles.restaurantButton]}
                >
                  <Text style={styles.buttonText}>{restaurant.name}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                onPress={this.toggleRestaurantModal}
                style={[styles.button, styles.modalButton, styles.closeButton]}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Modal>

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
                  .find((restaurant) => restaurant.name === selectedRestaurant)
                  .categories.map((category, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => this.selectCategory(category)}
                      style={[styles.button, styles.modalButton, styles.categoryButton]}
                    >
                      <Text style={styles.buttonText}>{category}</Text>
                    </TouchableOpacity>
                  ))}
              <TouchableOpacity
                onPress={this.toggleCategoryModal}
                style={[styles.button, styles.modalButton, styles.closeButton]}
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
              <Text style={styles.modalTitle}>Payment Page</Text>
              <Text style={styles.paymentText}>Selected Restaurant: {selectedRestaurant}</Text>
              <Text style={styles.paymentText}>Selected Category: {selectedCategory}</Text>
              {/* Add payment information and UI */}
              <TouchableOpacity
                onPress={this.togglePaymentModal}
                style={[styles.button, styles.modalButton, styles.closeButton]}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Modal>
      </View> 
      


      </BaseContainer>
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
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    margin: 10,
    width: 300,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
  },
  restaurantButton: {
    backgroundColor: '#E57373',
  },
  categoryButton: {
    backgroundColor: '#64B5F6',
  },
  paymentButton: {
    backgroundColor: '#81C784',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalItem: {
    fontSize: 18,
    marginVertical: 10,
  },
  modalButton: {
    padding: 15,
    borderRadius: 10,
    margin: 10,
    width: 200,
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: '#FFD700',
  },
  paymentText: {
    fontSize: 16,
    marginBottom: 10,
  },
});



