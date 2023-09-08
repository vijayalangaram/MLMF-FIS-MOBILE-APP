import I18n from "i18n-js";
import { Spinner } from "native-base";
import React from "react";
import { RNCamera } from "react-native-camera";
import deviceInfoModule from "react-native-device-info";
import { Card, ListItem, Icon } from "react-native-elements";
import { PERMISSIONS, RESULTS } from "react-native-permissions";
import QRCodeScanner from "react-native-qrcode-scanner";
import RNRestart from "react-native-restart";
import { NavigationEvents } from "react-navigation";
import { connect } from "react-redux";
import Assets from "../assets";
import BannerImages from "../components/BannerImages";
import EDHomeSearchBar from "../components/EDHomeSearchBar";
import EDLanguageSelect from "../components/EDLanguageSelect";
import EDLocationModel from "../components/EDLocationModel";
import EDPlaceholderComponent from "../components/EDPlaceholderComponent";
import EDPopupView from "../components/EDPopupView";
import EDResCategoryFlatList from "../components/EDResCategoryFlatList";
import EDRestaurantDeatilsFlatList from "../components/EDRestaurantDetailsFlatList";
import EDRTLText from "../components/EDRTLText";
import EDRTLView from "../components/EDRTLView";
import RadioGroupWithHeader from "../components/RadioGroupWithHeader";
import { strings } from "../locales/i18n";
import {
  saveCartCount,
  saveCartPrice,
  saveCurrencySymbol,
} from "../redux/actions/Checkout";
import { saveNavigationSelection } from "../redux/actions/Navigation";
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
  getCartList,
  getLanguage,
  saveLanguage,
} from "../utils/AsyncStorageHelper";
import { showDialogue, showValidationAlert } from "../utils/EDAlert";
import { EDColors } from "../utils/EDColors";
import {
  API_PAGE_SIZE,
  debugLog,
  getProportionalFontSize,
  GOOGLE_API_KEY,
  isRTLCheck,
  RESPONSE_SUCCESS,
} from "../utils/EDConstants";
import { EDFonts } from "../utils/EDFontConstants";
import { checkFirebasePermission } from "../utils/FirebaseServices";
import {
  getAddress,
  getCurrentLocation,
} from "../utils/LocationServiceManager";
import metrics from "../utils/metrics";
import { netStatus } from "../utils/NetworkStatusConnection";
import {
  checkPermission,
  requestNotificationPermission,
} from "../utils/PermissionServices";
import {
  addRequestQR,
  changeToken,
  getAddressListAPI,
  getFoodType,
  getPayLaterOrdersAPI,
  homedata,
  saveUserLanguageinDB,
} from "../utils/ServiceManager";
import BaseContainer from "./BaseContainer";
import axios from "axios";
import EDThemeButton from "../components/EDThemeButton";
import Modal from "react-native-modal";
import {
  Button,
  AppState,
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Pressable,
  FlatList,
  TextInput,
} from "react-native";

class MainContainer extends React.Component {
  distance = "";
  distanceForPickUp = "";
  foodTypes = [];
  sortType = 0;
  resType = 0;
  arrayCategories = undefined;
  arrayRestaurants = undefined;
  arraySlider = undefined;
  strOnScreenMessage = "";
  strOnScreenSubtitle = "";
  shouldLoadMore = false;
  availType = 0;
  getintialAddress = "";

  homeSectionData = [
    {
      index: 0,
      title: strings("nearByRestaurant"),
      data: [
        {
          arrayRestaurants: [],
        },
      ],
    },
  ];
  allOrderModes = [
    {
      label: strings("deliveryOrder"),
      size: 15,
      selected: 1,
    },
    // {
    //   label: strings("pickUpOrder"),
    //   size: 15,
    //   selected: 0,
    // },
  ];
  is_filter = false;
  locationError = false;
  isFreeDelivery = false;
  table_id = undefined;
  orderMode = this.props.orderModeInRedux == 1 ? 1 : 0;
  selectedFoodTypes = [];
  apiKeyCount = 0;
  selectedCategories = [];
  state = {
    locationError: false,
    isPermissionLoading: false,
    isLoading: false,
    isMoreLoading: false,
    strSearch: "",
    appState: AppState.currentState,
    languageModal: false,
    isShowLanguageIcon: false,
    languages: undefined,
    floatVisible: false,
    cameraModal: false,
    isShowReview: false,
    isListLoading: false,
    isAddressLoading: false,
    today: new Date(),
    tomorrow: new Date() + 1,
    today_tomorrow_Flag: false,
    restaurant_restaurantName: "",
    modal_Pop_Up: false,
    userOption: null,
    restaurantCategoryMAster: [],
    selected_restaurantCategory: "",
    restObjModelvalue: "",
  };

  /** DID MOUNT */
  async componentDidMount() {
    if (
      this.props.userIdFromRedux !== undefined &&
      this.props.userIdFromRedux !== null &&
      this.props.userIdFromRedux !== ""
    ) {
      if (
        this.props.token === undefined ||
        this.props.token === null ||
        this.props.token === ""
      ) {
        if (
          Platform.OS == "android" &&
          (await deviceInfoModule.getApiLevel()) >= 33
        ) {
          requestNotificationPermission(
            (onSuccess) => {
              console.log(
                "notification permission success :::::::: ",
                onSuccess
              );
              checkFirebasePermission(
                (onSuccess) => {
                  this.props.saveToken(onSuccess);
                  this.changeTokenAPI();
                },
                (error) => {
                  console.log("Firebase Error :::::::: ", error);
                }
              );
            },
            (error) => {
              console.log("notification permission error :::::::: ", error);
              showDialogue(strings("notificationPermission"), [], "", () => {
                Linking.openSettings();
              });
            }
          );
        } else {
          checkFirebasePermission(
            (onSuccess) => {
              this.props.saveToken(onSuccess);
              this.changeTokenAPI();
            },
            (error) => {
              console.log("Firebase Error :::::::: ", error);
            }
          );
        }
      } else {
        // this.changeTokenAPI();
        if (
          Platform.OS == "android" &&
          (await deviceInfoModule.getApiLevel()) >= 33
        ) {
          requestNotificationPermission(
            (onSuccess) => {
              this.changeTokenAPI();
            },
            (error) => {
              this.changeTokenAPI();
              showDialogue(strings("notificationPermission"), [], "", () => {
                Linking.openSettings();
              });
            }
          );
        } else this.changeTokenAPI();
      }
    }
    this.setState({ isLoading: true });
    this.props.save_delivery_dunzo__details();
    this.props.save_dunzodelivery_amount();
    this.loading = true;
    this.getRestaurantData();
    this.getUserLanguage();
    this.getCartList();
    this.getAddressList();
    AppState.addEventListener("change", this._handleAppStateChange);
    this.dateIntialCall();
    debugLog(
      "&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&",
      this.props.selected_category_id_home_cont?.category
    );
  }

  dateIntialCall() {
    let { today, tomorrow, today_tomorrow_Flag } = this.state;

    var today__date = new Date();
    var today__date2 = new Date(today__date);
    today__date2.setDate(today.getDate() + 1);
    today__date2.toLocaleDateString();

    // let dormat_today = new Date().toLocaleDateString();
    // let dormat_tomorrow = new Date(today__date2).toLocaleDateString();

    let setfromDate = new Date();
    let setdate1 =
      setfromDate.getDate() +
      "-" +
      (setfromDate.getMonth() + 1) +
      "-" +
      setfromDate.getFullYear();
    let settoDate = new Date(today__date2);
    let setdate2 =
      settoDate.getDate() +
      "-" +
      (settoDate.getMonth() + 1) +
      "-" +
      settoDate.getFullYear();

    this.setState({
      today: setdate1,
      tomorrow: setdate2,
    });

    let todayreverreverse =
      setfromDate.getFullYear() +
      "-" +
      (setfromDate.getMonth() + 1) +
      "-" +
      setfromDate.getDate();

    // debugLog(
    // "****************************** Vijay ****************************** todayreverreverse  ",
    // todayreverreverse
    // );

    this.props.save_today_tomorrow_details(todayreverreverse);
  }

  /** GET PENDING ORDER API */
  getPendingOrderData() {
    netStatus((isConnected) => {
      if (isConnected) {
        let param = {
          user_id: this.props.userIdFromRedux,
          language_slug: this.props.lan,
        };
        getPayLaterOrdersAPI(
          param,
          this.onSuccessOrderListing,
          this.onFailureOrderListing,
          this.props
        );
      } else {
        debugLog("NO INTERNET ::::");
      }
    });
  }

  /**
   * @param { Success Reponse Object } onSuccess
   */
  onSuccessOrderListing = (onSuccess) => {
    let T_ID = undefined;
    let R_ID = undefined;
    debugLog("ORDER DETAIL LIST ::::::::::::: ", onSuccess);
    if (onSuccess != undefined && onSuccess.status == RESPONSE_SUCCESS) {
      if (onSuccess.dineIn.length > 0) {
        if (
          onSuccess.dineIn[0].order_status.toLowerCase() !== "complete" &&
          onSuccess.dineIn[0].order_status.toLowerCase() !== "delivered"
        ) {
          T_ID = onSuccess.dineIn[0].table_id;
          R_ID = onSuccess.dineIn[0].restaurant_id;
        }
      }
    } else {
      console.log("NOT GETTING ORDER LIST");
    }
    this.props.saveTableID(T_ID);
    this.props.saveResID(R_ID);
  };

  /**
   * @param { Failure Response Object } onFailure
   */
  onFailureOrderListing = (onFailure) => {
    console.log(":::::::::: FAILED TO GET ORDER", onFailure);
  };

  //#region CHANGE TOKEN
  /** CALL CHANGE TOKEN API */
  changeTokenAPI = () => {
    let params = {
      language_slug: this.props.lan,
      // token: this.props.phoneNumber,
      user_id: this.props.userIdFromRedux,
      firebase_token: this.props.token,
    };
    changeToken(
      params,
      (success) => {
        debugLog("Change Token success ::::::::::: ", success);
      },
      (failure) => {
        debugLog("Change Token failure ::::::::::: ", failure);
      }
    );
  };
  //#endregion
  /**
   * @param { Applications status Active or Background } nextAppState
   */
  _handleAppStateChange = (nextAppState) => {
    if (nextAppState == "active") {
    }
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === "active" &&
      this.props.navigation.isFocused()
    ) {
      debugLog("FOCUSED ::::::");
      if (Platform.OS === "android" && this.isAndroidPermission === true) {
        this.setState({ isPermissionLoading: false });
      } else {
        if (this.isAllowPermission === false) {
          this.arrayRestaurants = undefined;
          this.getRestaurantData();
        }
      }
    }
    this.setState({ appState: nextAppState });
  };
  //#endregion

  /** WILL MOUNT */
  componentWillUnmount = () => {
    AppState.removeEventListener("change", this._handleAppStateChange);
  };

  //#region GET USER LANGUAGE API
  /**
   * @param { on Success response object } success
   */
  onSuccessLanguage = (success) => {
    console.log("::: LANG CHANGED SUCCESS", success);
  };

  /**
   * @param { on Failure repsonse object } failure
   */
  onFailureLanguage = (failure) => {
    console.log("::: LANG CHANGED FAILED", failure);
  };
  /** CALL API FOR LANGUAGE
   *
   */
  getUserLanguage = () => {
    let lan = "en";
    getLanguage(
      (success) => {
        lan = success != undefined && success !== null ? success : "en";
        let params = {
          language_slug: lan,
          // token: this.props.phoneNumber,
          user_id: this.props.userIdFromRedux,
        };
        saveUserLanguageinDB(
          params,
          this.onSuccessLanguage,
          this.onFailureLanguage
        );
      },
      (failure) => {
        let params = {
          language_slug: lan,
          // token: this.props.phoneNumber,
          user_id: this.props.userIdFromRedux,
        };
        saveUserLanguageinDB(
          params,
          this.onSuccessLanguage,
          this.onFailureLanguage
        );
      }
    );
  };
  //#endregion

  onLocationBtnPressed = () => {
    this.props.navigation.navigate("searchLocation");
  };

  onGPSPressed = () => {
    this.currentCity = undefined;
    this.currentAddress = undefined;
    this.props.saveCurrentLocation(undefined);
    this.onPullToRefreshHandler();
  };

  //#region
  /** SEARCH TEXT CHANGE */
  onTextChangeHandler = (text) => {
    // this.shouldLoadMore = false
    // this.arrayRestaurants = undefined
    this.setState({ strSearch: text });
    // this.getRestaurantData(text, false, true)
  };
  //#endregion

  //#region On Search Pressed
  onSearchPressed = () => {
    if (this.state.strSearch == "" || !/\S/.test(this.state.strSearch)) {
      return;
    } else {
      this.setState({ isLoading: true });
      this.arrayRestaurants = [];
      this.getRestaurantData();
    }
  };
  //#endregion

  //#region RENDER RIGHT TOP HEADER
  /**
   * @param { Index Number for Cart or Filter Tag } index
   */
  renderRightTopHeader = (index) => {
    if (this.props.cartCount > 0) {
      if (index == 0) {
        {
          this._onChangeLanguagePressed();
        }
      } else if (index == 1) {
        this.props.navigation.navigate("Filter", {
          getFilterDetails: this.getFilter,
          filterType: "Main",
          distance: this.orderMode == 0 ? this.distance : "",
          distanceForPickUp: this.orderMode == 0 ? this.distanceForPickUp : "",
          foodArray: this.foodTypes,
          catArray: this.selectedCategories,
          sortType: this.sortType,
          selectedRestType: this.resType,
          // minFilterDistance: this.minFilterDistance,
          // maxFilterDistance: this.maxFilterDistance,
          isShowReview: this.state.isShowReview,
          // arrayCategories: this.arrayCategories,
          isFreeDelivery: this.isFreeDelivery,
          availType: this.availType,
          orderMode: this.orderMode,
        });
      } else {
        if (this.table_id !== undefined && this.table_id !== "")
          this.props.navigation.navigate("CheckOutContainer");
        else {
          this.props.navigation.navigate("CartContainer", { isview: false });
        }
      }
    } else {
      if (index == 0) {
        this._onChangeLanguagePressed();
      }
      if (index == 1) {
        this.props.navigation.navigate("Filter", {
          getFilterDetails: this.getFilter,
          filterType: "Main",
          catArray: this.selectedCategories,
          foodArray: this.foodTypes,
          distance: this.orderMode == 0 ? this.distance : "",
          distanceForPickUp: this.orderMode == 0 ? this.distanceForPickUp : "",
          sortType: this.sortType,
          selectedRestType: this.resType,
          // minFilterDistance: this.minFilterDistance,
          // maxFilterDistance: this.maxFilterDistance,
          isShowReview: this.state.isShowReview,
          // arrayCategories: this.arrayCategories,
          availType: this.availType,
          isFreeDelivery: this.isFreeDelivery,
          orderMode: this.orderMode,
        });
      }
    }
  };
  //#endregion

  /** NETWORK CONNECTIVITY */
  networkConnectivityStatus = () => {
    this.arrayCategories = undefined;
    this.arrayRestaurants = undefined;
    this.getRestaurantData();
  };
  //#endregion

  //#region filter FUNCTION
  /**
   * @param { } data
   */
  getFilter = (data) => {
    if (this.filter) {
      return;
    } else {
      this.distance = data.distance;
      this.distanceForPickUp = data.distanceForPickUp;
      this.filter = true;
      this.arrayCategories = undefined;
      this.arrayRestaurants = undefined;
      this.foodTypes = data.foodArray;
      this.selectedCategories = data.catArray;
      this.isFreeDelivery = data.isFreeDelivery;
      this.sortType = data.sortType;
      this.resType = data.selectedRestType;
      this.is_filter = data.applied;
      this.availType = data.availType;
      this.props.saveFoodTypeInRedux(undefined);
      this.getRestaurantData();
    }
  };
  //#endregion

  //#region LOAD ADDRESS
  /**
   * @param { Success Response Object } onSuccess
   */
  onSuccessLoadAddress = (onSuccess) => {
    if (onSuccess != undefined) {
      if (onSuccess.status == RESPONSE_SUCCESS) {
        if (onSuccess.address !== undefined && onSuccess.address.length > 0) {
          this.saveAddressFromList(onSuccess.address[0]);
        }

        this.setState({ isAddressLoading: false, isCMSLoading: false });
      } else {
        this.setState({ isAddressLoading: false, isCMSLoading: false });
      }
    } else {
      this.setState({ isAddressLoading: false, isCMSLoading: false });
    }
  };

  /**
   * @param { FAilure Response Objetc } onfailure
   */
  onFailureLoadAddress = (onFailure) => {
    this.setState({ isAddressLoading: false });
  };

  /** GET ADDRESS API */
  getAddressList = () => {
    if (
      this.props.userIdFromRedux !== undefined &&
      this.props.userIdFromRedux !== null &&
      this.props.userIdFromRedux.trim().length !== 0
    ) {
      this.setState({ isAddressLoading: true });
      this.addressAPICount = 1;

      netStatus((status) => {
        if (status) {
          let param = {
            language_slug: this.props.lan,
            user_id: this.props.userIdFromRedux || 0,
            // token: this.props.token
          };
          getAddressListAPI(
            param,
            this.onSuccessLoadAddress,
            this.onFailureLoadAddress,
            this.props
          );
        } else {
          this.setState({ isAddressLoading: false });
        }
      });
    } else {
      this.setState({ isAddressLoading: false });
    }
  };
  //#endregion

  saveAddressFromList = (address) => {
    let { getintialAddress } = this.state;
    let addressData = {
      latitude: address.latitude,
      longitude: address.longitude,
      areaName:
        address.address_label !== undefined &&
        address.address_label !== null &&
        address.address_label.trim().length !== 0
          ? address.address_label
          : address.address.split(",")[0],
      address: address.address,
      address_id: address.address_id,
    };

    this.setState({ getintialAddress: address.address_id });
    this.currentAddress = address.address;
    this.currentCity =
      address.address_label !== undefined &&
      address.address_label !== null &&
      address.address_label.trim().length !== 0
        ? address.address_label
        : address.address.split(",")[0];
    this.props.saveCurrentLocation(addressData);
    if (!this.loading) this.getRestaurantData();
    // }
  };

  /**
   *
   * @param { Lattitude } lat
   * @param { Longitude } long
   * @param { Searched Text } searchText
   */
  getRestaurantData = (
    searchData,
    isForRefresh = false,
    showLoader = false
  ) => {
    this.strOnScreenMessage = "";
    this.strOnScreenSubtitle = "";
    this.locationError = false;

    if (this.arrayRestaurants === undefined) {
      this.arrayRestaurants = [];
    }
    netStatus((isConnected) => {
      if (isConnected) {
        if (
          this.props.currentLocation !== undefined &&
          this.props.currentLocation !== null &&
          this.props.currentLocation.latitude !== undefined
        ) {
          let param = {
            user_id: this.props.userIdFromRedux,
            language_slug: this.props.lan,
            latitude: this.props.currentLocation.latitude,
            longitude: this.props.currentLocation.longitude,
            itemSearch: searchData || this.state.strSearch,
            category_id: "" + this.selectedCategories.join(),
            orderMode: this.props.orderModeInRedux,
            offersFreeDelivery: this.isFreeDelivery ? 1 : 0,
            // token: this.props.phoneNumber,
            food: "" + this.selectedFoodTypes.join(),
            // distance: "" + this.distance,
            distance:
              this.orderMode == 0 ? this.distance : this.distanceForPickUp,

            count: API_PAGE_SIZE,
            sortBy: this.sortType,
            availability: this.availType,
            restaurant_type: this.resType,
            page_no:
              this.arrayRestaurants && !isForRefresh
                ? parseInt(this.arrayRestaurants.length / API_PAGE_SIZE) + 1
                : 1,
          };
          if (showLoader) {
            this.setState({ isListLoading: true });
          } else if (
            searchData !== undefined &&
            searchData.trim().length !== 0 &&
            !showLoader
          ) {
            this.setState({ isLoading: true });
          } else if (!isForRefresh) {
            this.setState({
              isLoading:
                !showLoader &&
                (this.arrayRestaurants === undefined ||
                  this.arrayRestaurants.length === 0),
              isMoreLoading:
                this.arrayRestaurants !== undefined &&
                this.arrayRestaurants.length !== 0,
            });
          }
          homedata(
            param,
            this.onSuccessResData,
            this.onFailureResData,
            this.props
          );
        } else {
          var paramPermission =
            Platform.OS === "ios"
              ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
              : PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION;
          checkPermission(
            paramPermission,
            () => {
              getCurrentLocation(
                (onSucces) => {
                  this.getCurrentAddress(onSucces.latitude, onSucces.longitude);
                  this.latitude = onSucces.latitude;
                  this.longitude = onSucces.longitude;
                  this.isAllowPermission = false;
                  this.setState({ locationError: false });
                  let param = {
                    user_id: this.props.userIdFromRedux,
                    language_slug: this.props.lan,
                    latitude: onSucces.latitude,
                    longitude: onSucces.longitude,
                    itemSearch: searchData || this.state.strSearch,
                    category_id: "" + this.selectedCategories.join(),
                    orderMode: this.props.orderModeInRedux,
                    food: "" + this.selectedFoodTypes.join(),
                    offersFreeDelivery: this.isFreeDelivery ? 1 : 0,
                    // distance: "" + this.distance,
                    distance:
                      this.orderMode == 0
                        ? this.distance
                        : this.distanceForPickUp,
                    availability: this.availType,
                    sortBy: this.sortType,
                    restaurant_type: this.resType,
                    count: API_PAGE_SIZE,
                    page_no:
                      this.arrayRestaurants && !isForRefresh
                        ? parseInt(
                            this.arrayRestaurants.length / API_PAGE_SIZE
                          ) + 1
                        : 1,
                  };
                  if (showLoader) {
                    this.setState({ isListLoading: true });
                  } else if (
                    searchData !== undefined &&
                    searchData.trim().length !== 0 &&
                    !showLoader
                  ) {
                    this.setState({ isLoading: true });
                  } else if (!isForRefresh) {
                    this.setState({
                      isLoading:
                        !showLoader &&
                        (this.arrayRestaurants === undefined ||
                          this.arrayRestaurants.length === 0),
                      isMoreLoading:
                        this.arrayRestaurants !== undefined &&
                        this.arrayRestaurants.length !== 0,
                    });
                  }
                  homedata(
                    param,
                    this.onSuccessResData,
                    this.onFailureResData,
                    this.props
                  );
                },
                (onFailure) => {
                  this.loading = false;
                  this.locationError = true;
                  if (onFailure == RESULTS.BLOCKED)
                    this.permissionBlocked = true;
                  this.isAllowPermission = true;
                  if (onFailure.code == 1)
                    this.strOnScreenMessage = strings("allowLocationSettings");
                  else
                    this.strOnScreenMessage = strings("currentLocationError");
                  this.setState({
                    isListLoading: false,
                    isLoading: false,
                    isPermissionLoading: false,
                    locationError: false,
                    floatVisible: false,
                  });
                  if (this.apiKeyCount == 0) this.getAddressList();
                  else this.setState({ isAddressLoading: false });
                },
                GOOGLE_API_KEY
              );
            },
            (onFailure) => {
              this.loading = false;
              if (onFailure == RESULTS.BLOCKED) this.permissionBlocked = true;
              this.isAllowPermission = true;
              this.setState({
                isLoading: false,
                isListLoading: false,
                locationError: true,
                isPermissionLoading: false,
                floatVisible: false,
              });
            }
          );
        }
      } else {
        this.strOnScreenMessage = strings("noInternetTitle");
        this.strOnScreenSubtitle = strings("noInternet");
        this.arrayRestaurants = [];
        this.setState({
          isListLoading: false,
          isLoading: false,
          isPermissionLoading: false,
          locationError: false,
        });
      }
    });
  };
  //#endregion

  //#region GET RESTAURANT DATA API
  /**
   * @param { on Success response object } onSuccess
   */
  onSuccessResData = (onSuccess) => {
    this.loading = false;
    this.strOnScreenMessage = "";
    this.filter = false;
    if (onSuccess != undefined) {
      if (onSuccess.status == RESPONSE_SUCCESS) {
        // this.arrayCategories = onSuccess.category;
        this.arraySlider = [Assets.header_placeholder, ...onSuccess.slider];
        this.social_links = onSuccess.social_details;
        this.setState({ floatVisible: true });

        if (
          onSuccess.enable_review !== undefined &&
          onSuccess.enable_review !== null &&
          onSuccess.enable_review == "1"
        ) {
          this.setState({ isShowReview: true });
        } else {
          this.setState({ isShowReview: false });
        }

        if (
          onSuccess.lanugages != undefined &&
          onSuccess.lanugages.length > 1
        ) {
          this.setState({
            languages: onSuccess.lanugages,
            isShowLanguageIcon: true,
          });
        } else {
          this.setState({
            languages: onSuccess.lanugages,
            isShowLanguageIcon: false,
          });
        }

        if (
          onSuccess.minimum_order_amount !== undefined &&
          onSuccess.minimum_order_amount !== null
        ) {
          this.props.saveMinOrderAmount(onSuccess.minimum_order_amount);
        }

        if (
          this.props.userIdFromRedux !== undefined &&
          this.props.userIdFromRedux !== null
        )
          this.props.saveWalletMoney(onSuccess.wallet_money);
        else this.props.saveWalletMoney(undefined);
        if (
          onSuccess.currency != undefined &&
          onSuccess.currency != null &&
          onSuccess.currency !== ""
        )
          this.props.saveCurrencySymbol(onSuccess.currency);
        if (
          this.props.storeURL == undefined ||
          this.props.storeUR == null ||
          this.props.storeURL.length == 0
        ) {
          let storeURL = {
            app_store_url: onSuccess.app_store_url,
            play_store_url: onSuccess.play_store_url,
          };
          this.props.saveStoreURLInRedux(storeURL);
        }
        if (this.props.socialURL == undefined || this.props.socialURL == null) {
          this.props.saveSocialURLInRedux({
            facebook: onSuccess.social_details.facebook,
            linkedin: onSuccess.social_details.linkedin,
            twitter: onSuccess.social_details.twitter,
          });
        }
        this.props.savePaymentDetails(onSuccess.payment_details);
        this.props.saveMapKey(onSuccess.google_map_api_key);

        // this.minFilterDistance = onSuccess.minFilterDistance
        // this.maxFilterDistance = onSuccess.maxFilterDistance

        if (
          onSuccess.restaurant != undefined &&
          onSuccess.restaurant.length > 0
        ) {
          let arrRest = onSuccess.restaurant || [];
          let totalRecordCount = onSuccess.total_restaurant || 0;
          this.shouldLoadMore =
            this.arrayRestaurants.length + arrRest.length < totalRecordCount;
          this.arrayRestaurants = [...this.arrayRestaurants, ...arrRest];
        } else {
          if (
            this.arrayRestaurants == undefined ||
            this.arrayRestaurants.length === 0
          ) {
            this.strOnScreenMessage = strings("noResMsg");
            this.arrayRestaurants = [];
          }
        }
        if (!this.state.isMoreLoading) {
          this.props.saveFoodTypeInRedux(undefined);
        }
        if (
          onSuccess.food_types != undefined &&
          onSuccess.food_types.length > 0
        ) {
          let food_types = this.props.foodType || [];
          var ids = new Set(food_types.map((d) => d.food_type_id));
          var final_food_type = [
            ...food_types,
            ...onSuccess.food_types.filter((d) => !ids.has(d.food_type_id)),
          ];
          this.props.saveFoodTypeInRedux(final_food_type);
        }

        this.homeSectionData = [
          {
            index: 0,
            title: "tetsdt",
            data: [
              {
                arrayRestaurants: this.arrayRestaurants,
              },
            ],
          },
        ];
        this.setState({
          isListLoading: false,
          isLoading: false,
          isPermissionLoading: false,
          isMoreLoading: false,
        });
      } else {
        this.setState({
          isListLoading: false,
          isLoading: false,
          isPermissionLoading: false,
          isMoreLoading: false,
        });
      }
    } else {
      this.strOnScreenMessage = strings("noResMsg");
      this.setState({
        isListLoading: false,
        isLoading: false,
        isPermissionLoading: false,
        isMoreLoading: false,
      });
    }
  };

  /**
   * @param { on Failure Response Object } onFailure
   */
  onFailureResData = (onFailure) => {
    debugLog("onFailure Home :::::", onFailure);
    this.loading = false;
    this.filter = false;
    this.strOnScreenMessage = strings("generalWebServiceError");
    this.setState({
      isListLoading: false,
      isLoading: false,
      isMoreLoading: false,
    });
  };

  //Get Current Address
  getCurrentAddress = (lat, long) => {
    getAddress(
      lat,
      long,
      (onSuccess) => {
        this.currentAddress = onSuccess.localArea;
        this.currentCity = onSuccess.strAddress;
        let addressData = {
          latitude: lat,
          longitude: long,
          areaName: onSuccess.strAddress,
          address: onSuccess.localArea,
        };
        this.props.saveCurrentLocation(addressData);
      },
      this.onFailureGetAddress,
      GOOGLE_API_KEY
    );
  };

  onFailureGetAddress = (onFailure) => {};

  onDidFocusMainContainer = () => {
    this.orderMode = this.props.orderMode == 1 ? 1 : 0;
    if (
      this.props.userIdFromRedux !== undefined &&
      this.props.userIdFromRedux !== null &&
      this.props.userIdFromRedux.trim().length !== 0
    ) {
      this.getPendingOrderData();
    }
    if (
      this.props.languageArray !== undefined &&
      this.props.languageArray.length > 1
    ) {
      this.setState({ isShowLanguageIcon: true });
    } else {
      this.setState({ isShowLanguageIcon: false });
    }

    if (!this.is_filter) this.foodTypes = [];
    if (
      this.props.currentLocation !== undefined &&
      this.props.currentLocation !== null &&
      this.props.currentLocation.latitude !== undefined
    ) {
      if (
        this.currentAddress !== this.props.currentLocation.address &&
        this.loading == false
      ) {
        this.onPullToRefreshHandler();
      }
      this.currentAddress = this.props.currentLocation.address;
      this.currentCity = this.props.currentLocation.areaName;
    } else {
      this.currentAddress = undefined;
      this.currentCity = undefined;
      this.onPullToRefreshHandler();
    }
    this.props.saveNavigationSelection("Home");

    this.getCartList();
    // this.getFoodType()
  };

  /** CALL FOOD TYPE API */
  getFoodType = () => {
    if (
      this.props.foodType == undefined ||
      this.props.foodType == null ||
      this.props.foodType.length == 0
    ) {
      netStatus((isConnected) => {
        if (isConnected) {
          let objFoodParams = {
            language_slug: this.props.lan,
          };
          getFoodType(
            objFoodParams,
            this.onSuccessFoodType,
            this.onFailureFoodType
          );
        }
      });
    }
  };

  onSuccessFoodType = (onSuccess) => {
    if (onSuccess !== undefined && onSuccess.food_type !== undefined) {
      this.props.saveFoodTypeInRedux(onSuccess.food_type);
    }
  };

  onFailureFoodType = (onFailure) => {};

  onPullToRefreshHandler = () => {
    this.strOnScreenMessage = "";
    this.strOnScreenSubtitle = "";
    this.refreshing = false;
    this.latitude = undefined;
    this.longitude = undefined;
    this.shouldLoadMore = false;
    this.selectedFoodTypes = [];
    this.arrayRestaurants = undefined;
    this.props.saveFoodTypeInRedux(undefined);
    this.setState({ isLoading: true, strSearch: "" });
    this.getRestaurantData();
    if (
      this.props.userIdFromRedux !== undefined &&
      this.props.userIdFromRedux !== null &&
      this.props.userIdFromRedux.trim().length !== 0
    ) {
      this.getPendingOrderData();
    }
  };

  onLoadMore = () => {
    if (
      this.shouldLoadMore &&
      !this.state.isMoreLoading &&
      !this.state.isLoading
    ) {
      this.getRestaurantData();
    }
  };
  /** GET LIST OF CART ITEMS */
  getCartList = () => {
    getCartList(
      this.onSuccessCartList,
      (onCartNotFound) => {
        this.props.saveCartCount(0);
      },
      (error) => {}
    );
    this.props.saveNavigationSelection("Home");
  };

  //#region GET CART ITEMS
  /**
   * @param { Success Response Object } success
   */
  onSuccessCartList = (success) => {
    if (success != undefined) {
      let cartData = success.items;
      this.table_id = success.table_id;
      debugLog("TABEL ID :::", this.table_id);
      if (cartData.length > 0) {
        let count = 0;
        let price = 0;
        cartData.map((item, index) => {
          count = count + Number(item.quantity);
          price = Number(price) + item.quantity * Number(item.price);
          if (
            item.addons_category_list != undefined &&
            item.addons_category_list != []
          ) {
            array = item.addons_category_list;
            array.map((data) => {
              subArray = data.addons_list;
              subArray.map((innerData) => {
                price = Number(price) + Number(innerData.add_ons_price);
              });
            });
          }
        });
        this.props.saveCartPrice(price);
        this.props.saveCartCount(count);
      } else if (cartData.length == 0) {
        this.props.saveCartPrice(0);
        this.props.saveCartCount(0);
      }
    } else {
    }
  };
  //#endregion
  //#endregion

  /** CATEGORY PRESSED EVENT */
  onFoodTypePressed = (item) => {
    this.arrayRestaurants = [];
    if (this.selectedFoodTypes.includes(item.item.food_type_id)) {
      let arr = this.selectedFoodTypes.filter((data) => {
        return data !== item.item.food_type_id;
      });
      this.selectedFoodTypes = arr;

      this.getRestaurantData();
    } else {
      this.selectedFoodTypes.push(item.item.food_type_id);
      this.getRestaurantData();
    }
    debugLog("SELECTED :::::", this.selectedFoodTypes);
  };
  //#endregion

  onClose = () => this.setState({ modal_Pop_Up: false });
  /** ON POPULAR RES EVENT */
  onPopularResEvent = async (restObjModel) => {
    let { getintialAddress, today_tomorrow_Flag, restaurant_restaurantName } =
      this.state;
    this.intialDunzoCall(
      restObjModel.restuarant_id,
      this.props.userIdFromRedux,
      getintialAddress,
      restObjModel.name
    );
    this.props.save_selected_Res_ID(
      `${restObjModel.restuarant_id}-${restObjModel.name}`
    );

    this.setState({
      restaurant_restaurantName: `${restObjModel.restuarant_id}-${restObjModel.name}`,
    });

    let planDate = !this.state.today_tomorrow_Flag
      ? this.state.today
      : this.state.tomorrow;

    // debugLog("planDate", planDate);

    let reversedate = planDate && planDate.split("-").reverse().join("-");
    let getRestaurantCategoryAPI = await axios
      .get(
        `https://fis.clsslabs.com/FIS/api/auth/getRestaurantCategory?restaurantId=${restObjModel.restuarant_id}&planDate=${reversedate}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        if (response.status === 200) {
          // debugLog(
          //   "888888888888888888888899999999999999999",
          //   response?.data?.data
          // );
          let { restaurantCategoryMAster } = this.state;
          let apiresponseofcatemaster = response?.data?.data;

          let filterstatesMastervalues =
            apiresponseofcatemaster &&
            apiresponseofcatemaster.map(({ category, categoryName }) => ({
              category,
              flag: false,
              categoryName,
            }));

          let filterstatesMastervalueszeroth;

          debugLog(
            "77777777777777777777777777777777777777777777777",
            filterstatesMastervalues
          );

          debugLog(
            "8888888888888888888888888888888888888888888888888888888",
            this?.props?.selected_category_id_home_cont
          );

          if (
            this?.props?.selected_category_id_home_cont?.category == "" &&
            this?.props?.selected_category_id_home_cont?.category == undefined
          ) {
            debugLog(
              "77777777777777777  filterstatesMastervalues  777777777777777777777777777777",
              filterstatesMastervalues
            );

            filterstatesMastervalueszeroth =
              filterstatesMastervalues &&
              filterstatesMastervalues.map((item, index) => {
                if (index == 0) {
                  item.flag = true;
                } else {
                  item.flag = false;
                }
                return item;
              });
          } else {
            debugLog(
              "9999999999999999999999999999999999999999999999999999999",
              this.props.selected_category_id_home_cont?.category
            );
            filterstatesMastervalueszeroth =
              filterstatesMastervalues &&
              filterstatesMastervalues.map((item, i) => {
                if (
                  Number(item?.category) ==
                  this.props.selected_category_id_home_cont?.category
                ) {
                  item.flag = true;
                } else {
                  item.flag = false;
                }
                return item;
              });
          }
          // debugLog(
          //   "lterstatesMastervalueszeroth[0]",
          //   filterstatesMastervalueszeroth
          // );
          this.setState(
            {
              restaurantCategoryMAster: filterstatesMastervalueszeroth,
            },
            () => {
              this.props.save_selected_category_home_cont(
                filterstatesMastervalueszeroth[0]
              );
            }
          );

          // this.setState({
          //   restaurantCategoryMAster: [
          //     {
          //       category: "191",
          //       categoryName: "Breakfast",
          //     },
          //     {
          //       category: "188",
          //       categoryName: "Lunch",
          //     },
          //     {
          //       category: "189",
          //       categoryName: "Dinner",
          //     },
          //     {
          //       category: "192",
          //       categoryName: "Snacks and Chats",
          //     },
          //     {
          //       category: "188",
          //       categoryName: "Lunch",
          //     },
          //     {
          //       category: "189",
          //       categoryName: "Dinner",
          //     },
          //     {
          //       category: "192",
          //       categoryName: "Snacks and Chats",
          //     },
          //     {
          //       category: "188",
          //       categoryName: "Lunch",
          //     },
          //     {
          //       category: "189",
          //       categoryName: "Dinner",
          //     },
          //     {
          //       category: "192",
          //       categoryName: "Snacks and Chats",
          //     },
          //   ],
          // });
        }
      })
      .then((data) => {})
      .catch((error) => {
        // debugLog("888888888888888888888899999999999999999 error ", error);
        // showValidationAlert(`Category not available`);
        let { restaurantCategoryMAster } = this.state;
        this.setState({
          restaurantCategoryMAster: [],
        });
        // this.props.save_slot_Master_details(undefined);
        // this.props.save_selected_category(undefined);
        // return false;
      });

    let { modal_Pop_Up, restObjModelvalue } = this.state;

    this.setState({
      modal_Pop_Up: !this.state.modal_Pop_Up,
      restObjModelvalue: restObjModel,
    });

    // this.props.navigation.navigate("RestaurantContainer", {
    //   restId:restObjModel.restuarant_id,
    //   content_id: restObjModel.content_id,
    //   currency: restObjModel.currency_symbol,
    //   isDineIn: false,
    //   isShowReview: this.state.isShowReview,
    //   resObj:restObjModel,
    //   today_tomorrow_Flag: this.state.today_tomorrow_Flag,
    //   // selected_restaurantCategory: this.state.selected_restaurantCategory,
    // });
  };

  callRes_container = async () => {
    let {
      modal_Pop_Up,
      restObjModelvalue,
      selected_restaurantCategory,
      restaurantCategoryMAster,
    } = this.state;

    this.setState({
      modal_Pop_Up: !this.state.modal_Pop_Up,
    });

    // debugLog(
    //   "this.props.selected_category_id_home_cont error ",
    //   this.props.selected_category_id_home_cont
    // );
    // return false;

    let filterflagtrue =
      restaurantCategoryMAster &&
      restaurantCategoryMAster.filter((item, i) => {
        if (item?.flag == true) {
          return item;
        }
      });
    debugLog("filterflagtrue[0]", filterflagtrue[0]);
    debugLog(
      "this.props.selected_category_id_home_cont?.category",
      this.props.selected_category_id_home_cont?.category
    );
    // return false;
    this.props.save_selected_category_home_cont(filterflagtrue[0]);
    this.props.navigation.navigate("RestaurantContainer", {
      // selected_restaurantCategory:
      //   this.props.selected_category_id_home_cont?.category,
      selected_restaurantCategory: filterflagtrue[0]?.category,
      restId: this.state?.restObjModelvalue?.restuarant_id,
      content_id: this.state?.restObjModelvalue?.content_id,
      currency: this.state?.restObjModelvalue?.currency_symbol,
      isDineIn: false,
      isShowReview: this.state.isShowReview,
      resObj: this.state?.restObjModelvalue,
      today_tomorrow_Flag: this.state.today_tomorrow_Flag,
    });
  };

  changeflagcategorymenu = async (items) => {
    debugLog(
      "333333333333333333333333333333333333333333333333333333 changeflagcategorymenu",
      items?.category
    );

    debugLog(
      "22222222222222222222222222222222222222222222222222222222222222222222",
      this?.props?.selected_category_id_home_cont
    );

    let { restaurantCategoryMAster, selected_restaurantCategory } = this.state;
    let filterstatesMastervalues =
      restaurantCategoryMAster &&
      restaurantCategoryMAster.map((item, i) => {
        if (item?.category == items?.category) {
          item.flag = true;
        } else {
          item.flag = false;
        }
        return item;
      });

    let filterflagtrue =
      restaurantCategoryMAster &&
      restaurantCategoryMAster.filter((item, i) => {
        if (item?.flag == true) {
          return item;
        }
      });

    // debugLog("filterflagtrue filterflagtrue ", filterflagtrue[0]);

    if (
      this?.props?.selected_category_id_home_cont?.category != "" &&
      this?.props?.selected_category_id_home_cont?.category != undefined
    ) {
      debugLog(
        "22222222222222222222222222222222222222222222222222222222222222222222",
        this?.props?.selected_category_id_home_cont?.category
      );
      debugLog(
        "333333333333333333333333333333333333333333333333333333",
        items?.category
      );

      if (
        this?.props?.selected_category_id_home_cont?.category != items?.category
      ) {
        showValidationAlert(
          `Are you sure want to proceed  with ${items?.categoryName}?,\nNote:All items from cart will be removed !`
        );
      }
    }
    this.setState(
      {
        restaurantCategoryMAster: filterstatesMastervalues,
        selected_restaurantCategory: filterflagtrue[0],
        // selected_restaurantCategory
      },
      () => {
        // this.props.save_selected_category_home_cont(filterflagtrue[0]);
      }
    );
  };

  intialDunzoCall = async (
    restuarant_id,
    customer_id,
    address_id,
    restuarantName
  ) => {
    let datas = {
      restuarant_id: restuarant_id,
      customer_id: customer_id,
      address_id: address_id,
      restuarantName: restuarantName,
    };

    // debugLog(
    //   "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ 00000000000000",
    //   datas
    // );

    let getDeliveryChargeAPICall = await axios.post(
      // "https://fis.clsslabs.com/FIS/api/auth/getDeliveryCharge",
      "http://52.77.35.146:8080/FIS/api/auth/getDeliveryCharge",
      datas,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (getDeliveryChargeAPICall.status === 200) {
      // debugLog(
      //   " getDeliveryChargeAPICall?.data[0]  ************************** 2222222222222222222222222",
      //   getDeliveryChargeAPICall?.data[0]
      // );
      // debugLog(
      //   " getDeliveryChargeAPICall?.data[0] ************************** 2222222222222222222222222",
      //   getDeliveryChargeAPICall?.data[0]?.directPointDelivery?.amount
      // );
      this.props.save_delivery_dunzo__details(
        getDeliveryChargeAPICall?.data[0]
      );
      this.props.save_dunzodelivery_amount(
        getDeliveryChargeAPICall?.data[0]?.directPointDelivery?.amount
      );
    }
  };

  //#endregion

  onOrderModeSelect = (value) => {
    this.orderMode = value;
    this.props.saveOrderModeInRedux(value);
    this.onPullToRefreshHandler();
  };

  onSearchBarLayout = (e) => {};

  // Section Header
  renderSectionHeader = () => {
    return (
      <View style={{ flex: 1 }}>
        {this.currentCity !== undefined || this.locationError ? (
          <View
            style={{
              flex: 1,
              backgroundColor: EDColors.primary,
              paddingVertical: 10,
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={this.onLocationBtnPressed}
            >
              <EDRTLView
                style={[
                  styles.locationStrap,
                  { marginBottom: 0, alignItems: "center" },
                ]}
              >
                <Icon
                  name={"location-pin"}
                  type={"simple-line-icon"}
                  size={getProportionalFontSize(18)}
                  color={EDColors.black}
                />
                <View
                  style={{
                    marginHorizontal: 5,
                    width: "55%",
                    alignItems: "center",
                  }}
                >
                  <EDRTLText
                    style={{
                      color: EDColors.black,
                      fontFamily:
                        this.currentCity == undefined
                          ? EDFonts.regular
                          : EDFonts.semiBold,
                      fontSize:
                        this.currentCity == undefined
                          ? getProportionalFontSize(11)
                          : getProportionalFontSize(15),
                      textAlign: "center",
                    }}
                    numberOfLines={this.currentCity == undefined ? 3 : 1}
                    title={
                      (this.currentCity !== undefined
                        ? ""
                        : strings("locationNotDetected")) +
                      (this.currentCity ? this.currentCity.split(",")[0] : "")
                    }
                    onPress={this.onLocationBtnPressed}
                  />
                  {/* {this.currentCity == undefined ?
                                        <EDRTLText  
                                            numberOfLines={2}
                                            style={{
                                                color: EDColors.black,
                                                fontFamily: EDFonts.regular,
                                                fontSize: getProportionalFontSize(13),
                                                marginTop: 2,
                                                textAlign: 'center'
                                            }}
                                            onPress={this.onLocationBtnPressed}
                                            title={strings('manuallyChooseLocation')}
                                        /> : null} */}
                </View>
                <Icon
                  name={"gps-fixed"}
                  size={getProportionalFontSize(20)}
                  onPress={this.onGPSPressed}
                  color={EDColors.black}
                  containerStyle={{ alignSelf: "center" }}
                />
              </EDRTLView>
            </TouchableOpacity>
          </View>
        ) : null}
        {/* <RadioGroupWithHeader
                    selected={this.props.orderMode}
                    activeColor={EDColors.white}
                    forHome={true}
                    Texttitle={strings('selectMode')}
                    titleStyle={{ color: EDColors.white }}
                    viewStyle={styles.radioViewStyle}
                    radioColor={EDColors.white}
                    style={{ flexDirection: isRTLCheck() ? 'row-reverse' : 'row' }}
                    lableStyle={{ fontFamily: EDFonts.semiBold }}
                    data={this.allOrderModes}
                    onSelected={this.onOrderModeSelect}
                /> */}
        {/* BANNER IMAGES */}
        {/* <BannerImages images={this.arraySlider} /> */}
        {/* TITLE MESSAGE */}

        {/* <EDRTLText title={strings("bannerMessage")} style={{ fontFamily: EDFonts.medium, color: EDColors.black, fontSize: getProportionalFontSize(18), textAlign: 'center', marginVertical: 15 }} /> */}

        {/* SEARCH BAR */}
        <EDHomeSearchBar
          onLayout={this.onSearchBarLayout}
          value={this.state.strSearch}
          style={{ marginBottom: 10, marginTop: 10 }}
          placeholder={strings("homeSearch")}
          onChangeValue={this.onTextChangeHandler}
          disabled={this.state.isLoading || this.state.isMoreLoading}
          onSearchPress={this.onSearchPressed}
        />

        {/* CATEGORIZED RES LIST */}
        <EDResCategoryFlatList
          arrayCategories={this.props.foodType}
          onCategoryPressed={this.onFoodTypePressed}
          modelSelected={this.selectedFoodTypes}
        />
      </View>
    );
  };

  // SECTION BODY
  renderBody = () => {
    return (
      <View style={{ flex: 1 }}>
        {/* POPULAR RESTAURANT LIST */}

        {/* <EDRTLView style={{ alignItems: "center", padding: 10 }}>
          <EDThemeButton
            label={`Today \n${this.state.today}`}
            style={{
              width: "40%",
              backgroundColor: !this.state.today_tomorrow_Flag
                ? "green"
                : "grey",
              marginLeft: 15,
              //   height: 40,
              //   borderRadius: 16,
              //   paddingVertical: 0,
              //   marginHorizontal: 3,
            }}
            textStyle={{
              fontSize: getProportionalFontSize(14),
              paddingLeft: 7,
              paddingRight: 7,
            }}
            onPress={this.onChange_today_tomorrow_Flag}
          />
          <EDThemeButton
            label={`Tomorrow ${this.state.tomorrow}`}
            style={{
              width: "45%",
              backgroundColor: this.state.today_tomorrow_Flag
                ? "green"
                : "grey",
              marginLeft: 15,
              //   height: 40,
              //   borderRadius: 16,
              //   paddingVertical: 0,
              //   marginHorizontal: 3,
              // }}
              // textStyle={{
              //   fontSize: getProportionalFontSize(14),
              //   paddingLeft: 7,
              //   paddingRight: 7,
            }}
            onPress={this.onChange_today_tomorrow_Flag}
          />
        </EDRTLView> */}

        {this.arrayRestaurants != undefined &&
        this.arrayRestaurants != null &&
        this.arrayRestaurants.length > 0 ? (
          <View>
            <EDRTLText
              title={strings("nearByRestaurant")}
              style={styles.title}
            />

            <EDRestaurantDeatilsFlatList
              arrayRestaurants={this.arrayRestaurants}
              social_links={
                this.social_links !== undefined && this.social_links !== null
                  ? this.social_links
                  : {}
              }
              openSocial={this.openSocialURL}
              refreshing={this.refreshing}
              onPopularResEvent={this.onPopularResEvent}
              onEndReached={this.onLoadMore}
              isShowReview={this.state.isShowReview}
              isLoading={this.state.isListLoading}
              useMile={this.props.useMile == "1"}
            />
          </View>
        ) : // DATA NOT AVAILABE
        (this.strOnScreenMessage || "").trim().length > 0 ? (
          <ScrollView
            contentContainerStyle={{
              width: metrics.screenWidth,
              paddingBottom: 70,
            }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={this.refreshing || false}
                colors={[EDColors.primary]}
                onRefresh={this.onPullToRefreshHandler}
              />
            }
          >
            <EDPlaceholderComponent
              style={{
                marginTop:
                  this.foodTypes !== undefined &&
                  this.foodTypes !== null &&
                  this.foodTypes.length !== 0
                    ? metrics.screenHeight * 0.08
                    : metrics.screenHeight * 0.125,
              }}
              title={this.strOnScreenMessage}
              subTitle={this.strOnScreenSubtitle}
            />
          </ScrollView>
        ) : null}
      </View>
    );
  };

  openSocialURL = (url) => {
    let strCallURL = url;
    if (
      strCallURL !== undefined &&
      strCallURL !== null &&
      strCallURL.trim().length !== 0
    ) {
      if (strCallURL.toString().toLowerCase()[0] !== "h")
        strCallURL = "https://" + strCallURL;
      if (Linking.canOpenURL(strCallURL)) {
        Linking.openURL(strCallURL).catch((error) => {
          // debugLog("ERROR :: ", error);
          showValidationAlert(strings("urlNotSupport"));
        });
      } else {
        showValidationAlert(strings("urlNotSupport"));
      }
    } else showValidationAlert(strings("urlNotSupport"));
  };

  //#region LOCATION BUTTON EVENTS
  onLocationEventHandler = () => {
    this.setState({ isLoading: true });
    if (this.permissionBlocked) {
      this.setState({ isPermissionLoading: true, isLoading: false });
      this.isAllowPermission = false;
      this.isAndroidPermission = false;
      if (Platform.OS == "android") Linking.openSettings();
      else Linking.openURL("app-settings:");
    } else {
      this.getRestaurantData();
    }
  };
  //#endregion

  renderLoader = () => {
    return this.state.isMoreLoading ? (
      <Spinner color={EDColors.primary} size="large" />
    ) : null;
  };

  _onSideMenuPressed = () => {
    this.props.navigation.openDrawer();
  };

  /**
   * LANGUAGE CHANGE PRESSED
   */
  _onChangeLanguagePressed = () => {
    if (this.state.isShowLanguageIcon) this.setState({ languageModal: true });
  };

  /** RENDER LOGOUT DIALOGUE */
  renderLanguageSelectDialogue = () => {
    return (
      <EDPopupView isModalVisible={this.state.languageModal}>
        <EDLanguageSelect
          languages={this.props.languageArray}
          lan={this.props.lan}
          onChangeLanguageHandler={this.onChangeLanguageHandler}
          onDismissHandler={this.onDismissLanguageHandler}
          title={strings("changeLanguage")}
        />
      </EDPopupView>
    );
  };
  //#endregion

  onDismissLanguageHandler = () => {
    this.setState({ languageModal: false });
  };

  //#region FORGOT PASSWORD BUTTON EVENTS
  onChangeLanguageHandler = (lan) => {
    this.setState({ languageModal: false });

    this.props.saveLanguageRedux(lan);
    clearCartData(
      () => {},
      () => {}
    );
    saveLanguage(
      lan,
      (success) => {
        RNRestart.Restart();
        this.arrayRestaurants = undefined;
      },
      (error) => {}
    );
  };

  //#region Floating scan button
  renderScanButton = () => {
    return (
      <TouchableOpacity
        style={styles.floatingBtn}
        onPress={this._onQRCameraPressed}
      >
        <EDRTLView style={{ alignItems: "center" }}>
          <View style={{ alignItems: "center" }}>
            <Icon
              name="md-scan-sharp"
              color={EDColors.white}
              size={getProportionalFontSize(28)}
              type={"ionicon"}
            />
            <View
              style={{
                height: 2,
                backgroundColor: EDColors.white,
                width: 30,
                borderRadius: 1,
                marginTop: -14,
                marginBottom: 14,
              }}
            />
          </View>
          <EDRTLText
            title={strings("scanQrCode")}
            style={[
              styles.title,
              {
                marginHorizontal: 10,
                color: EDColors.white,
                fontFamily: EDFonts.medium,
                fontSize: getProportionalFontSize(16),
              },
            ]}
          />
        </EDRTLView>
      </TouchableOpacity>
    );
  };
  showFloatingButton = () => {
    this.setState({ floatVisible: true });
  };
  hideFloatingButton = () => {
    this.setState({ floatVisible: false });
  };
  //#endregion

  //#region QR CMAERA REGION
  checkCameraPermission = () => {
    var paramPermission =
      Platform.OS === "ios"
        ? PERMISSIONS.IOS.CAMERA
        : PERMISSIONS.ANDROID.CAMERA;
    checkPermission(
      paramPermission,
      () => {
        this.setState({ cameraModal: true });
      },
      () => {
        showDialogue(
          strings("cameraPermissionError"),
          [{ text: strings("dialogCancel"), isNotPreferred: true }],
          "",
          () => {
            if (Platform.OS == "ios") Linking.openURL("app-settings:");
            else Linking.openSettings();
          }
        );
      }
    );
  };

  /**
   * LANGUAGE CAMERA MODAL
   */
  _onQRCameraPressed = () => {
    if (
      this.props.userIdFromRedux !== undefined &&
      this.props.userIdFromRedux !== null &&
      this.props.userIdFromRedux.trim().length !== 0
    ) {
      netStatus((isConnected) => {
        if (isConnected) {
          // this.setState({ isLoading: true })
          // if (this.props.currentLocation !== undefined && this.props.currentLocation !== null && this.props.currentLocation.latitude !== undefined) {
          //     this.latitude = this.props.currentLocation.latitude
          //     this.longitude = this.props.currentLocation.longitude
          //     // this.setState({ isLoading: false })
          //     this.checkCameraPermission()
          // }
          // else {
          var paramPermission =
            Platform.OS === "ios"
              ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
              : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
          checkPermission(
            paramPermission,
            () => {
              if (this.latitude !== "") {
                // this.setState({ isLoading: false })
                this.checkCameraPermission();
              } else
                getCurrentLocation(
                  (success) => {
                    AppState.removeEventListener(
                      "change",
                      this._handleAppStateChange
                    );
                    this.latitude = success.latitude;
                    this.longitude = success.longitude;
                    // this.setState({ isLoading: false })
                    this.checkCameraPermission();
                  },
                  () => {
                    this.setState({ isLoading: false });
                    showValidationAlert(strings("currentLocationError"));
                  },
                  GOOGLE_API_KEY
                );
            },
            () => {
              // this.setState({ isLoading: false })
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
          // }
        } else {
          showValidationAlert(strings("noInternet"));
        }
      });
    } else
      showDialogue(strings("loginValidation"), [], strings("appName"), () => {
        this.props.navigation.navigate("LoginContainer", {
          // isCheckout: true
        });
      });
  };

  onDismissQR = () => {
    this.setState({ cameraModal: false });
  };

  /** RENDER LOGOUT DIALOGUE */
  renderQRCameraDialogue = () => {
    return (
      <EDPopupView
        isModalVisible={this.state.cameraModal}
        onRequestClose={this.onDismissQR}
        shouldDismissModalOnBackButton={true}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* {this.topQrContent()} */}
          <QRCodeScanner
            containerStyle={styles.QRContainer}
            topContent={this.topQrContent()}
            bottomContent={this.bottomQrContent()}
            bottomViewStyle={{ flex: 0 }}
            topViewStyle={{ flex: 0 }}
            showMarker={true}
            markerStyle={{ borderColor: EDColors.primary, borderWidth: 2 }}
            cameraStyle={styles.camera}
            onRead={this.onSuccessQRRead}
            flashMode={RNCamera.Constants.FlashMode.auto}
          />
          {/* {this.bottomQrContent()} */}
        </View>
      </EDPopupView>
    );
  };

  topQrContent = () => {
    return (
      <EDRTLView style={{ marginBottom: 10 }}>
        <EDRTLText style={styles.qrfooterText} title={strings("pointQR")} />
      </EDRTLView>
    );
  };
  bottomQrContent = () => {
    return (
      <TouchableOpacity
        onPress={() => {
          this.setState({ cameraModal: false });
        }}
        style={{ marginTop: -getProportionalFontSize(40) }}
      >
        <Icon
          name="close"
          color={EDColors.black}
          size={getProportionalFontSize(25)}
          containerStyle={{
            backgroundColor: "#fff",
            padding: 15,
            borderRadius: 16,
          }}
          onPress={() => {
            this.setState({ cameraModal: false });
          }}
        />
      </TouchableOpacity>
    );
  };

  //#endregion
  onSuccessQRRead = (data) => {
    this.setState({ cameraModal: false, isQRLoading: true });
    if (data.data !== undefined && data.data.trim() !== "") {
      let params = {
        // token: this.props.phoneNumber,
        user_id: this.props.userIdFromRedux,
        table_id: data.data.trim(),
        // table_id : 7,
        language_slug: this.props.lan,
        latitude: this.props.currentLocation.latitude,
        longitude: this.props.currentLocation.longitude,
      };
      addRequestQR(params, this.onSuccesQrRequest, this.onFailureQrRequest);
    } else showValidationAlert(strings("qrcodeError"));
  };
  onDismissHandler = () => {
    this.setState({ cameraModal: false });
  };

  onSuccesQrRequest = (data) => {
    this.setState({ isQRLoading: false });
    // debugLog("SUCCESS DATA :::::", data);
    if (data.status !== undefined && data.status == RESPONSE_SUCCESS) {
      if (data.allow_dinein !== "1") {
        showDialogue(strings("dineInError"), [], "", () => {
          this.props.navigation.navigate("PendingOrders", {
            unpaid_orders: data.unpaid_orders,
          });
        });
      } else if (data.request_status == "approve") {
        console.log("TABLE AVAILABLE :::::::", data);
        clearCartData(
          () => {},
          () => {}
        );
        this.props.saveCartCount(0);
        this.props.navigation.navigate("RestaurantContainer", {
          restId: data.restuarant_id,
          content_id: data.content_id,
          table_id: data.table_id,
          isDineIn: true,
          isShowReview: this.state.isShowReview,
          today_tomorrow_Flag: this.state.today_tomorrow_Flag,
        });
        this.props.saveTableID(data.table_id);
        this.props.saveResID(data.restuarant_id);
      } else {
        showValidationAlert(strings("qrRejected"));
      }
    } else {
      showValidationAlert(data.message);
    }
  };

  onFailureQrRequest = (data) => {
    this.setState({ isQRLoading: false });
    showValidationAlert(strings("generalWebServiceError"));
    // debugLog("FAILURE DATA :::::", data);
  };
  //#endregion

  onChange_today_tomorrow_Flag = async () => {
    let { today, tomorrow, today_tomorrow_Flag } = this.state;

    this.setState({ today_tomorrow_Flag: !today_tomorrow_Flag }, async () => {
      let { today, tomorrow, today_tomorrow_Flag } = this.state;
      let todayrever = today && today.split("-").reverse().join("-");
      let tomorrowrev = tomorrow && tomorrow.split("-").reverse().join("-");
      if (today_tomorrow_Flag === false) {
        this.props.save_today_tomorrow_details(todayrever);
      } else {
        this.props.save_today_tomorrow_details(tomorrowrev);
      }

      let planDate = !this.state.today_tomorrow_Flag
        ? this.state.today
        : this.state.tomorrow;

      let restaurant_restaurantNamevalue =
        this.state.restaurant_restaurantName &&
        this.state.restaurant_restaurantName.split("-");

      let reversedate = planDate && planDate.split("-").reverse().join("-");
      let getRestaurantCategoryAPI = await axios
        .get(
          `https://fis.clsslabs.com/FIS/api/auth/getRestaurantCategory?restaurantId=${restaurant_restaurantNamevalue[0]}&planDate=${reversedate}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
        .then((response) => {
          if (response.status === 200) {
            let { restaurantCategoryMAster } = this.state;
            let apiresponseofcatemaster = response?.data?.data;

            let filterstatesMastervalues =
              apiresponseofcatemaster &&
              apiresponseofcatemaster.map(({ category, categoryName }) => ({
                category,
                flag: false,
                categoryName,
              }));
            let filterstatesMastervalueszeroth =
              filterstatesMastervalues &&
              filterstatesMastervalues.map((item, i) => {
                if (i == 0) {
                  item.flag = true;
                } else {
                  item.flag = false;
                }
                return item;
              });
            this.setState(
              {
                restaurantCategoryMAster: filterstatesMastervalueszeroth,
              },
              () => {
                // this.props.save_selected_category_home_cont(
                //   filterstatesMastervalueszeroth[0]
                // );
              }
            );
          }
        })
        .then((data) => {})
        .catch((error) => {
          let { restaurantCategoryMAster } = this.state;
          this.setState({
            restaurantCategoryMAster: [],
          });
        });
    });
  };

  toggleModal = () => {
    this.setState({ modal_Pop_Up: !this.state.modal_Pop_Up });
  };

  selectHandler = (value) => {
    this.setState({ modal_Pop_Up: false });
    onSelect(value);
  };

  _hideModal() {
    this.setState({
      modal_Pop_Up: false,
    });
  }
  //#endregion
  render() {
    let {
      today,
      tomorrow,
      today_tomorrow_Flag,
      modal_Pop_Up,
      selctedCategory,
      userOption,
      restaurantCategoryMAster,
      selected_restaurantCategory,
      restObjModelvalue,
    } = this.state;

    // debugLog(
    //   "this.state.restaurantCategoryMAster",
    //   this.state.restaurantCategoryMAster
    // );

    return (
      <>
        {modal_Pop_Up && (
          <View style={{ flex: 1 }}>
            <Modal
              isVisible={this.state.modal_Pop_Up}
              hasBackdrop={true}
              backdropOpacity={10}
              backdropColor={"#65242e"}
              transparent={true}
            >
              <View>
                <Text style={styles.option}> Choose Menu Date </Text>
              </View>

              <EDRTLView style={{ alignItems: "center", padding: 10 }}>
                <EDThemeButton
                  label={`Today \n${this.state.today}`}
                  style={{
                    width: "40%",
                    backgroundColor: !this.state.today_tomorrow_Flag
                      ? "green"
                      : "grey",
                    marginLeft: 15,
                  }}
                  textStyle={{
                    fontSize: getProportionalFontSize(14),
                    paddingLeft: 7,
                    paddingRight: 7,
                  }}
                  onPress={this.onChange_today_tomorrow_Flag}
                />
                <EDThemeButton
                  label={`Tomorrow ${this.state.tomorrow}`}
                  style={{
                    width: "45%",
                    backgroundColor: this.state.today_tomorrow_Flag
                      ? "green"
                      : "grey",
                    marginLeft: 15,
                  }}
                  onPress={this.onChange_today_tomorrow_Flag}
                />
              </EDRTLView>

              <View>
                <Text style={styles.option}> Choose Menu Category </Text>
              </View>

              {/* <View style={{ ...styles.card, ...this.props.styles }}> */}

              <View style={styles.cart_container_option}>
                {restaurantCategoryMAster &&
                  restaurantCategoryMAster.length > 0 &&
                  restaurantCategoryMAster.map((items) => {
                    // debugLog("cardviiiw", items);
                    return (
                      <Card
                        style={{
                          backgroundColor: items?.flag ? "red" : "white",
                        }}
                      >
                        {/* <Card.Divider /> */}
                        {/* <Card.Image source={require("../images/pic2.jpg")} /> */}
                        {/* <Button
                          // style={{ backgroundColor: "grey", color: "red" }}
                          // icon={<Icon name="code" color="red" style={{ backgroundColor: "grey", color: "red" }} />}
                          // buttonStyle={{
                          //   borderRadius: 0,
                          //   marginLeft: 0,
                          //   marginRight: 0,
                          //   marginBottom: 0,
                          // }}
                          title={items?.categoryName}
                          onPress={() => {
                            this.callRes_container(items);
                          }}
                        /> */}
                        <Text
                          style={styles.font_text_option}
                          // onPress={() => {
                          //   this.callRes_container(items);
                          // }}
                          onPress={() => {
                            this.changeflagcategorymenu(items);
                          }}
                        >
                          {" "}
                          {items?.categoryName}{" "}
                          <Icon
                            name={"check"}
                            color={items?.flag ? "green" : "white"}
                            // style={{ margin: 10 }}
                          />
                        </Text>
                      </Card>
                    );
                  })}
              </View>

              <EDRTLView style={{ alignItems: "center", padding: 10 }}>
                <EDThemeButton
                  label={`Back`}
                  style={{
                    width: "45%",
                    backgroundColor: this.state.today_tomorrow_Flag
                      ? "green"
                      : "grey",
                    marginLeft: 15,
                  }}
                  onPress={() => {
                    this.setState({ modal_Pop_Up: false });
                  }}
                />
                {restaurantCategoryMAster &&
                restaurantCategoryMAster.length > 0 ? (
                  <EDThemeButton
                    label={`Proceed`}
                    style={{
                      width: "40%",
                      backgroundColor: "#808000",
                      marginLeft: 15,
                      color: "black",
                    }}
                    textStyle={{
                      fontSize: getProportionalFontSize(14),
                      paddingLeft: 7,
                      paddingRight: 7,
                    }}
                    onPress={() => {
                      this.callRes_container();
                    }}
                  />
                ) : (
                  <EDThemeButton
                    label={`No Data`}
                    style={{
                      width: "40%",
                      backgroundColor: "orange",
                      marginLeft: 15,
                      color: "black",
                    }}
                    textStyle={{
                      fontSize: getProportionalFontSize(14),
                      paddingLeft: 7,
                      paddingRight: 7,
                    }}
                  />
                )}
              </EDRTLView>
            </Modal>
          </View>
        )}

        <BaseContainer
          title={"home"}
          isTitleIcon
          left={"menu"}
          // tabs={[strings("deliveryOrder"), strings("pickUpOrder")]}
          tabs={[strings("deliveryOrder")]}
          selectedIndex={this.props.orderModeInRedux}
          onSegmentIndexChangeHandler={this.onOrderModeSelect}
          // onLeftFC={this._onChangeLanguagePressed}
          // isLeftFC={this.state.isShowLanguageIcon}
          right={
            this.state.locationError && this.currentCity == undefined
              ? []
              : this.props.cartCount > 0
              ? [
                  this.state.isShowLanguageIcon
                    ? { url: "language", name: "language", type: "material" }
                    : {},
                  { url: "filter", name: "filter", type: "ant-design" },
                  {
                    url: "shopping-cart",
                    name: "Cart",
                    value: this.props.cartCount,
                    type: "ant-design",
                  },
                ]
              : [
                  this.state.isShowLanguageIcon
                    ? { url: "language", name: "language", type: "material" }
                    : {},
                  { url: "filter", name: "filter", type: "ant-design" },
                ]
          }
          onLeft={this._onSideMenuPressed}
          onRight={this.renderRightTopHeader}
          onConnectionChangeHandler={this.networkConnectivityStatus}
          isQRLoading={this.state.isQRLoading}
          loading={this.state.isLoading}
        >
          {/* NAVIGATION EVENTS */}
          <NavigationEvents onDidFocus={this.onDidFocusMainContainer} />

          {/* LANGUAGE SELECTION DIALOG */}
          {this.renderLanguageSelectDialogue()}

          {/* CAMERA FOR DIGITAL DINE IN */}
          {/* {this.state.floatVisible ? this.renderScanButton() : null}
        {this.renderQRCameraDialogue()} */}

          {/* LOCATION STRIP */}
          {this.state.locationError && this.currentCity == undefined ? (
            <View style={{ flex: 1, backgroundColor: EDColors.primary }}>
              <TouchableOpacity
                activeOpacity={1}
                onPress={this.onLocationBtnPressed}
              >
                <EDRTLView
                  style={[
                    styles.locationStrap,
                    { alignItems: "center", marginVertical: 10 },
                  ]}
                >
                  <Icon
                    name={"location-pin"}
                    type={"simple-line-icon"}
                    size={getProportionalFontSize(18)}
                    color={EDColors.black}
                  />
                  <View
                    style={{
                      width: "55%",
                      marginHorizontal: 5,
                      alignItems: "center",
                    }}
                  >
                    <EDRTLText
                      style={{
                        color: EDColors.black,
                        fontFamily: EDFonts.regular,
                        fontSize: getProportionalFontSize(13),
                        textAlign: "center",
                      }}
                      title={strings("locationNotDetected")}
                      onPress={this.onLocationBtnPressed}
                    />
                    {/* <EDRTLText
                                        numberOfLines={2}
                                        style={{
                                            color: EDColors.black,
                                            fontFamily: EDFonts.regular,
                                            fontSize: getProportionalFontSize(13),
                                            marginTop: 2,
                                            textAlign: 'center'
                                        }}
                                        onPress={this.onLocationBtnPressed}
                                        title={strings('manuallyChooseLocation')}
                                    /> */}
                  </View>
                  <Icon
                    name={"gps-fixed"}
                    size={getProportionalFontSize(20)}
                    onPress={this.onGPSPressed}
                    color={EDColors.black}
                    containerStyle={{ alignSelf: "center" }}
                  />
                </EDRTLView>
              </TouchableOpacity>
              <EDLocationModel
                isLoadingPermission={this.state.isPermissionLoading}
                onLocationEventHandler={this.onLocationEventHandler}
              />
            </View>
          ) : (
            <SectionList
              sections={this.homeSectionData}
              extraData={this.arrayRestaurants}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={this.refreshing || false}
                  colors={[EDColors.primary]}
                  onRefresh={this.onPullToRefreshHandler}
                />
              }
              renderItem={this.renderBody}
              renderSectionHeader={this.renderSectionHeader}
              ListFooterComponent={this.renderLoader}
              stickySectionHeadersEnabled={false}
            />
          )}
        </BaseContainer>
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  text: {
    fontSize: 16,
    fontWeight: "400",
    textAlign: "center",
  },
  font_text_option: {
    fontSize: 16,
    fontWeight: "400",
    textAlign: "center",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },

  loaderStyle: {
    backgroundColor: "white",
    marginHorizontal: 10,
    borderRadius: 5,
    marginBottom: 5,
    paddingLeft: 5,
  },
  categoryLoadingStyle: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  dataNotStyle: {
    marginTop: 0,
    height: metrics.screenHeight / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  imageStyle: {
    alignItems: "center",
    width: "100%",
    height: metrics.screenHeight * 0.25,
  },
  loaderView: {
    backgroundColor: "white",
    height: metrics.screenHeight * 0.09,
    width: metrics.screenWidth * 0.45,
    borderRadius: 5,
  },
  locationStrap: {
    // flexDirection: isRTLCheck() ? "row-reverse" : "row",
    backgroundColor: EDColors.white,
    padding: 10,
    paddingVertical: 5,
    justifyContent: "space-between",
    borderRadius: 20,
    alignSelf: "center",
    // alignItems:'center'
  },
  floatingBtn: {
    position: "absolute",
    zIndex: 1,
    bottom: 15.5,
    alignSelf: "center",
    marginHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,

    elevation: 1,
    backgroundColor: EDColors.primary,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  QRContainer: {
    backgroundColor: "rgba(0,0,0,.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  camera: {
    height: metrics.screenHeight * 0.6,
    width: metrics.screenWidth * 0.85,
    marginVertical: 10,
    borderRadius: 24,
    overflow: "hidden",
  },
  qrfooterText: {
    color: EDColors.primary,
    backgroundColor: "#fff",
    fontFamily: EDFonts.bold,
    padding: 20,
    borderRadius: 16,
  },
  title: {
    fontFamily: EDFonts.bold,
    fontSize: getProportionalFontSize(18),
    color: EDColors.black,
    marginVertical: 10,
    marginHorizontal: 15,
  },
  radioViewStyle: {
    paddingHorizontal: 5,
    paddingVertical: 10,
    margin: 0,
    backgroundColor: EDColors.primary,
    borderRadius: 0,
  },
  option: {
    fontSize: 20,
    color: "white",
    textAlign: "center",
  },
  cart_container_option: {
    // backgroundColor: "red",
    // color: "red",
    // bgcolor: "red",
    // display: "flex",
    // flexWrap: "nowrap",
    alignItems: "stretch",
    display: "flex",
    flexDirection: "column",
    // overflow: "auto",
    flexWrap: "nowrap",
    overflow: "hidden",
  },
  nestedcart_option: {
    backgroundColor: "red",
    // color: "red",
    // bgcolor: "red",
  },
  // flex-wrap: nowrap;
  // overflow-x: ;
  // overflow-y: hidden;
  unselected: {
    backgroundColor: "red",
    margin: 5,
  },
  selected: {
    backgroundColor: "blue",
    margin: 6,
    padding: 10,
    borderRadius: 10,
  },
});

export default connect(
  (state) => {
    return {
      userIdFromRedux: state.userOperations.userIdInRedux,
      token: state.userOperations.token,
      phoneNumber: state.userOperations.phoneNumberInRedux,
      lan: state.userOperations.lan,
      cartCount: state.checkoutReducer.cartCount,
      storeURL: state.userOperations.storeURL,
      currentLocation: state.userOperations.currentLocation,
      foodType: state.userOperations.foodType,
      notification: state.userOperations.notification,
      languageArray: state.userOperations.languageArray,
      orderModeInRedux: state.userOperations.orderMode,
      useMile: state.userOperations.useMile,
      selected_category_id_home_cont:
        state.userOperations.selected_category_id_home_cont,
    };
  },
  (dispatch) => {
    return {
      saveNavigationSelection: (dataToSave) => {
        dispatch(saveNavigationSelection(dataToSave));
      },
      saveLanguageRedux: (language) => {
        dispatch(saveLanguageInRedux(language));
      },
      saveCurrencySymbol: (symbol) => {
        dispatch(saveCurrencySymbol(symbol));
      },
      saveCartCount: (data) => {
        dispatch(saveCartCount(data));
      },
      saveToken: (token) => {
        dispatch(saveUserFCMInRedux(token));
      },
      saveStoreURLInRedux: (data) => {
        dispatch(saveStoreURL(data));
      },
      saveSocialURLInRedux: (data) => {
        dispatch(saveSocialURL(data));
      },
      saveCurrentLocation: (data) => {
        dispatch(saveCurrentLocation(data));
      },
      savePaymentDetails: (data) => {
        dispatch(savePaymentDetailsInRedux(data));
      },
      saveMapKey: (data) => {
        dispatch(saveMapKeyInRedux(data));
      },
      saveFoodTypeInRedux: (food_type) => {
        dispatch(saveFoodType(food_type));
      },
      saveWalletMoney: (token) => {
        dispatch(saveWalletMoneyInRedux(token));
      },
      saveCartPrice: (data) => {
        dispatch(saveCartPrice(data));
      },
      saveMinOrderAmount: (data) => {
        dispatch(saveMinOrderAmount(data));
      },
      saveTableID: (table_id) => {
        dispatch(saveTableIDInRedux(table_id));
      },
      saveResID: (table_id) => {
        dispatch(saveResIDInRedux(table_id));
      },
      saveOrderModeInRedux: (mode) => {
        dispatch(saveOrderMode(mode));
      },
      save_delivery_dunzo__details: (data) => {
        dispatch(save_delivery_dunzo__details(data));
      },
      save_today_tomorrow_details: (data) => {
        dispatch(save_today_tomorrow_details(data));
      },
      save_selected_category_home_cont: (data) => {
        dispatch(save_selected_category_home_cont(data));
      },
      save_dunzodelivery_amount: (data) => {
        dispatch(save_dunzodelivery_amount(data));
      },
      save_selected_Res_ID: (data) => {
        dispatch(save_selected_Res_ID(data));
      },
    };
  }
)(MainContainer);
