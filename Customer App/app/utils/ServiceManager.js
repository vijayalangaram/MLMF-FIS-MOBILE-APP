import base64 from "base-64";
import aes from "crypto-js/aes";
import encHex from "crypto-js/enc-hex";
import padZeroPadding from "crypto-js/pad-zeropadding";
import jstz from "jstz";
import { Keyboard } from "react-native";
import { NavigationActions, StackActions } from "react-navigation";
import { globalStore } from "../../App";
import { strings } from "../locales/i18n";
import { saveResIDInRedux, saveTableIDInRedux } from "../redux/actions/User";
import {
  ADD_ADDRESS,
  ADD_NEW_CARD,
  UPDATE_CARD,
  ADD_ORDER,
  ADD_ORDER_REVIEW,
  ADD_REVIEW,
  ADD_TO_CART,
  APPLY_COUPON,
  APP_VERSION,
  BOOKING_EVENT,
  BOOKING_HISTORY,
  BOOKING_TABLE,
  CANCEL_ORDER,
  CHANGE_TOKEN,
  CHECK_BOOKING_AVAIL,
  CHECK_CARD_PAYMENT,
  CHECK_ORDER_URL,
  CHECK_TABLE_AVAIL,
  CMS_PAGE,
  CONTACT_US,
  COUNTRY_CODE_LIST,
  COUNTRY_CODE_URL,
  CREATE_PAYMENT_METHOD,
  CREATE_PAYMENT_ONLINE,
  debugLog,
  DELETE_ACCOUNT,
  DELETE_ADDRESS,
  DUNZO_DELIVERY_AMOUNTAPI,
  DELETE_CARD,
  DELETE_EVENT,
  DRIVER_TRACKING,
  FAQ_URL,
  FORGOT_PASSWORD,
  GET_ADDRESS,
  GET_CANCEL_REASON_LIST,
  GET_FOOD_TYPE,
  GET_NOTIFICATION,
  GET_QR_POINTS,
  GET_RECIPE_LIST,
  GET_RESTAURANT_DETAIL,
  GET_RESTAURANT_MENU,
  GET_REVIEW,
  GET_SAVED_CARDS,
  GET_USER_LANGUAGE,
  LANGUAGE_LIST,
  LOGIN_URL,
  LOGOUT_URL,
  ORDER_LISTING,
  PAYMENT_LIST,
  PENDING_ORDER,
  PROMO_CODE_LIST,
  QR_SCAN,
  REGISTRATION_HOME,
  REGISTRATION_URL,
  RequestKeys,
  RESET_PASSWORD_REQ_URL,
  SEND_OTP_API,
  SOCIAL_URL,
  UPDATE_PENDING_ORDER,
  UPDATE_PROFILE,
  VERIFY_OTP_API,
  WALLET_HISTORY,
  TIP_DRIVER,
  WALLET_TOPUP,
  VALIDATE_SCHEDULING,
  REPORT_ERROR,
} from "../utils/EDConstants";
import { flushAllData } from "./AsyncStorageHelper";
import { showDialogue } from "./EDAlert";
import * as RNLocalize from "react-native-localize";
import { HOME_CATEGORIES } from "./EDConstants";
// const CurrentTimeZone = jstz.determine().name();
var CurrentTimeZone = RNLocalize.getTimeZone();

let key = encHex.parse("5126b6af4f15d73a20c60676b0f226b2");
let iv = encHex.parse("a8966e4702bb84f4ef37640cd4b46aa2");

const RequestType = {
  post: "POST",
  get: "GET",
  patch: "PATCH",
  put: "PUT",
};

/**
 *
 * @param {Props of the screen from which the API is getting called} propsReceived
 * @param {Optional request url argument in case of any exception needed in future} requestString
 */
function getRequestHeader(propsReceived, requestString = "") {
  var objHeader = propsReceived
    ? { [RequestKeys.contentType]: RequestKeys.json }
    : { [RequestKeys.contentType]: RequestKeys.json };

  if (propsReceived !== undefined && propsReceived.contentType !== undefined)
    objHeader[RequestKeys.contentType] = propsReceived.contentType;

  if (propsReceived !== undefined && propsReceived.authorization !== undefined)
    objHeader[RequestKeys.authorization] = propsReceived.authorization;
  return objHeader;
}

/**
 *
 * @param {The input parameters for login request call} loginParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function loginUser(
  loginParams,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    LOGIN_URL,
    loginParams,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for social Login } socialParam
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function socialAPI(
  socialParam,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callSocialAPI(
    SOCIAL_URL,
    socialParam,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for contacting } contactParam
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function contactAPI(
  contactParam,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    CONTACT_US,
    contactParam,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for countryCode request call} countryCodeParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function getCountryCode(
  countryCodeParams,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    COUNTRY_CODE_URL,
    countryCodeParams,
    onSuccess,
    onFailure,
    RequestType.get,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for paymentListParams request call} paymentListParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function getPaymentList(
  paymentListParams,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    PAYMENT_LIST,
    paymentListParams,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for register request call} registerParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function registerUser(
  registerParams,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPIFormData(
    REGISTRATION_URL,
    registerParams,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for home data } homeParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function homedata(homeParams, onSuccess, onFailure, propsFromContainer) {
  callAPI(
    REGISTRATION_HOME,
    homeParams,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for language param } langParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function saveUserLanguageinDB(
  langParams,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    GET_USER_LANGUAGE,
    langParams,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for driver tip } tipParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function driverTipAPI(
  tipParams,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    TIP_DRIVER,
    tipParams,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for token param } tokenParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function changeToken(
  tokenParams,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    CHANGE_TOKEN,
    tokenParams,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for token param } tokenParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function getAPPVersionAPI(
  params,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    APP_VERSION,
    params,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for checking boking param } bookingParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function checkTable(
  bookingParams,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    CHECK_TABLE_AVAIL,
    bookingParams,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for booking param } bookEventParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function bookTable(
  bookEventParams,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    BOOKING_TABLE,
    bookEventParams,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for checking boking param } bookingParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function checkBooking(
  bookingParams,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    CHECK_BOOKING_AVAIL,
    bookingParams,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for booking param } bookEventParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function bookEvent(
  bookEventParams,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    BOOKING_EVENT,
    bookEventParams,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for restaurant param } resParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function ResDetails(
  resParams,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    GET_RESTAURANT_DETAIL,
    resParams,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for restaurant param } resParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function getRestaurantMenu(
  resParams,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  let restaurant_idvalue = resParams["restaurant_id"].toString();
  let userStrCon = propsFromContainer?.userID.toString();
  let restaurant_user = restaurant_idvalue.concat("-", userStrCon);
  // debugLog(
  //   "vijaygetRestaurantMenu  ***************************************************************** 3333333333 ====>",
  //   restaurant_user
  // );
  resParams["restaurant_id"] = restaurant_user;
  debugLog(
    "vijaygetRestaurantMenu  ***************************************************************** 4444444444444 ",
    resParams
  );
  callAPI(
    GET_RESTAURANT_MENU,
    resParams,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for review param } reviewParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function addReviewAPI(
  reviewParams,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    ADD_REVIEW,
    reviewParams,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for review param } reviewParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function getReviewsAPI(
  reviewParams,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    GET_REVIEW,
    reviewParams,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for order param } orderParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function checkOrder(
  orderParams,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    CHECK_ORDER_URL,
    orderParams,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for order param } orderParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function checkScheduleDelivery(
  orderParams,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    VALIDATE_SCHEDULING,
    orderParams,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for address param } addressParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function getAddressListAPI(
  addressParams,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    GET_ADDRESS,
    addressParams,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for address param } dunzoParam
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function getDunzoDeliveryAmountAPI(
  dunzoParam,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  debugLog(
    "****************************** Vijay ******************************    tdunzoParam",
    dunzoParam
  );

  debugLog(
    "****************************** Vijay ******************************    propsFromContainer",
    propsFromContainer
  );

  callAPI(
    DUNZO_DELIVERY_AMOUNTAPI,
    dunzoParam,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for Delete address param } delAddressParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function deleteAddress(
  delAddressParams,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    DELETE_ADDRESS,
    delAddressParams,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for Add address param } addAddressParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function addAddress(
  addAddressParams,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    ADD_ADDRESS,
    addAddressParams,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for change PAssword param } passwordParam
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function changePassword(
  passwordParam,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    RESET_PASSWORD_REQ_URL,
    passwordParam,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for Add Order param } addOrderParam
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function addOrder(
  addOrderParam,
  onSuccess,
  onFailure,
  propsFromContainer,
  isStringify
) {
  let finalParams = addOrderParam;
  finalParams.order_timestamp = new Date().valueOf();
  callAPI(
    ADD_ORDER,
    addOrderParam,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer,
    isStringify
  );
}

/**
 *
 * @param {The input parameters for CMS param } cmsParam
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function getCMSPage(cmsParam, onSuccess, onFailure, propsFromContainer) {
  callAPI(
    CMS_PAGE,
    cmsParam,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for FAQS param } faqsParam
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function getFaqsApi(
  faqsParam,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    FAQ_URL,
    faqsParam,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for food type param } foodParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function getFoodType(
  foodParams,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    GET_FOOD_TYPE,
    foodParams,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for wallet param } walletHistoryParam
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function getWalletHistoryAPI(
  walletHistoryParam,
  onSuccess,
  onFailure,
  propsFromContainer,
  isStringify
) {
  callAPI(
    WALLET_HISTORY,
    walletHistoryParam,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer,
    isStringify
  );
}

/**
 *
 * @param {The input parameters for wallet param } transactionParam
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function rechargeWalletAPI(
  transactionParam,
  onSuccess,
  onFailure,
  propsFromContainer,
  isStringify
) {
  callAPI(
    WALLET_TOPUP,
    transactionParam,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer,
    isStringify
  );
}

/**
 *
 * @param {The input parameters for review param } reviewParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function addOrderReviewAPI(
  reviewParams,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    ADD_ORDER_REVIEW,
    reviewParams,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for add to cart param } addtoCartParam
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function qrPoints(qrParam, onSuccess, onFailure, propsFromContainer) {
  callAPI(
    GET_QR_POINTS,
    qrParam,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for booking param } bookHistoryParam
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function getBookingHistory(
  bookHistoryParam,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    BOOKING_HISTORY,
    bookHistoryParam,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for Delete event param } delEventParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function deleteEvent(
  delEventParams,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    DELETE_EVENT,
    delEventParams,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for booking param } orderListParam
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function getOrderListingAPI(
  orderListParam,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    ORDER_LISTING,
    orderListParam,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for get cancel reason list request call} reasonParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function getCancelReasonList(
  reasonParams,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    GET_CANCEL_REASON_LIST,
    reasonParams,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for cancel order call} cancelParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function cancelOrderAPI(
  cancelParams,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    CANCEL_ORDER,
    cancelParams,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for Notification param } notiParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function getNotification(
  notiParams,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    GET_NOTIFICATION,
    notiParams,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for Notification param } countryParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function getCountryList(
  countryParams,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    COUNTRY_CODE_LIST,
    countryParams,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for Notification param } languageParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function getLanguageList(
  languageParams,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    LANGUAGE_LIST,
    languageParams,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for Promo param } promoParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function promoCodeList(
  promoParams,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    PROMO_CODE_LIST,
    promoParams,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for Promo param } orderParam
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function OrderConfirm(
  url,
  orderParam,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    url,
    orderParam,
    onSuccess,
    onFailure,
    RequestType.get,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for Recipe param } recipeParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function getRecipe(
  recipeParams,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    GET_RECIPE_LIST,
    recipeParams,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for Driver param } driverParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function driverTrackingAPI(
  driverParams,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    DRIVER_TRACKING,
    driverParams,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for param } timeParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function getTrackTime(
  timeParams,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    timeParams,
    "",
    onSuccess,
    onFailure,
    RequestType.get,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for param } polylineParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function getPolyline(
  polylineParams,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    polylineParams,
    "",
    onSuccess,
    onFailure,
    RequestType.get,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for password param } forgotPasswordParam
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function forgotPassword(
  forgotPasswordParam,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    FORGOT_PASSWORD,
    forgotPasswordParam,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for add to cart param } addtoCartParam
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function addToCart(
  restaurantDetailParam,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPIFormData(
    ADD_TO_CART,
    restaurantDetailParam,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}
/**
 *
 * @param {The input parameters for update profile param } updateProfileParam
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function updateProfile(
  updateProfileParam,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPIFormData(
    UPDATE_PROFILE,
    updateProfileParam,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for delete account request call} deleteParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function deleteUser(
  deleteParams,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    DELETE_ACCOUNT,
    deleteParams,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for password param } logoutParam
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function logoutAPI(
  logoutParam,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    LOGOUT_URL,
    logoutParam,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for OTP param } OTPParam
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function resendOTPAPI(
  OTPParam,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    SEND_OTP_API,
    OTPParam,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for OTP param } OTPParam
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function verifyOTPAPI(
  OTPParam,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    VERIFY_OTP_API,
    OTPParam,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for booking param } pendingOrderParam
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function getPayLaterOrdersAPI(
  pendingOrderParam,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    PENDING_ORDER,
    pendingOrderParam,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for updating pending orders } pendingOrderParam
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function updatePendingOrdersAPI(
  pendingOrderParam,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    UPDATE_PENDING_ORDER,
    pendingOrderParam,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for change user language request call} errorParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function reportErrorAPI(
  errorParams,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    REPORT_ERROR,
    errorParams,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for applying a coupon } couponParam
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function applyCouponAPI(
  couponParam,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    APPLY_COUPON,
    couponParam,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for qrcode data } qrParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function addRequestQR(
  qrParams,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    QR_SCAN,
    qrParams,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for generating paypal access token } accessTokenParam
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function generateAccessTokenAPI(
  accessTokenParam,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    (propsFromContainer.paymentDetails.use_sandbox
      ? propsFromContainer.paymentDetails.SANDBOX_PAYPAL_URL_V1
      : propsFromContainer.paymentDetails.LIVE_PAYPAL_URL_V1) + "oauth2/token",
    accessTokenParam,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for generating paypal auth ID } authIDParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function paypalOrderAPI(
  authIDParams,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    (propsFromContainer.paymentDetails.use_sandbox
      ? propsFromContainer.paymentDetails.SANDBOX_PAYPAL_URL_V2
      : propsFromContainer.paymentDetails.LIVE_PAYPAL_URL_V2) +
      "checkout/orders" +
      (propsFromContainer.order_id !== undefined
        ? "/" + propsFromContainer.order_id
        : ""),
    authIDParams,
    onSuccess,
    onFailure,
    propsFromContainer.order_id !== undefined
      ? RequestType.get
      : RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for generating paypal auth ID } authIDParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function paypalCaptureAPI(
  authIDParams,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    (propsFromContainer.paymentDetails.use_sandbox
      ? propsFromContainer.paymentDetails.SANDBOX_PAYPAL_URL_V2
      : propsFromContainer.paymentDetails.LIVE_PAYPAL_URL_V2) +
      "checkout/orders/" +
      propsFromContainer.order_id +
      "/capture",
    authIDParams,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for change user language request call} checkCardPaymentParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function checkCardPayment(
  checkCardPaymentParams,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    CHECK_CARD_PAYMENT,
    checkCardPaymentParams,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for change user language request call} createPaymentMethodParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function createPaymentMethod(
  createPaymentMethodParams,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    CREATE_PAYMENT_METHOD,
    createPaymentMethodParams,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for change user language request call} createOnlinePaymentParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function createOnlinePaymentMethod(
  createOnlinePaymentParams,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    CREATE_PAYMENT_ONLINE,
    createOnlinePaymentParams,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for saved card call} userParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function getSavedCardsAPI(
  userParams,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    GET_SAVED_CARDS,
    userParams,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for adding new card } cardParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function addNewCard(
  cardParams,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    cardParams.isForEditing ? UPDATE_CARD : ADD_NEW_CARD,
    cardParams,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for adding new card } cardParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function deleteCardAPI(
  cardParams,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    DELETE_CARD,
    cardParams,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 *
 * @param {The input parameters for fetching filter } filterParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function getHomeFiltersAPI(
  filterParams,
  onSuccess,
  onFailure,
  propsFromContainer
) {
  callAPI(
    HOME_CATEGORIES,
    filterParams,
    onSuccess,
    onFailure,
    RequestType.post,
    getRequestHeader(propsFromContainer),
    propsFromContainer
  );
}

/**
 * Genric function to make api calls with method post
 * @param {callAPI} url  API end point to call
 * @param {callAPI} responseSuccess  Call-back function to get success response from api call
 * @param {callAPI} responseErr  Call-back function to get error response from api call
 * @param {callAPI} requestHeader  Request header to be send to api
 * @param {callAPI} body data to be send through api
 */
export async function callAPI(
  url,
  body,
  responseSuccess,
  responseErr,
  methodType,
  requestHeader = { "Content-Type": "application/json" },
  propsFromContainer,
  isStringify
) {
  // if (url !== REGISTRATION_HOME)
  Keyboard.dismiss();
  body["user_timezone"] = CurrentTimeZone;

  let filtered_body = {};

  debugLog(":::::: BODY BEFORE ENCRYPTION", body);

  Object.keys(body || {}).map((keyToCheck) => {
    if (keyToCheck !== "image") {
      if (keyToCheck === "items" && isStringify !== true) {
        filtered_body[keyToCheck] = JSON.stringify(body[keyToCheck]);
      } else {
        filtered_body[keyToCheck] = body[keyToCheck];
      }
    }
  });
  let encryptedData = aes
    .encrypt(JSON.stringify(filtered_body), key, {
      iv: iv,
      padding: padZeroPadding,
    })
    .toString();

  var finalParams = {
    encryptedData: encryptedData,
    isEncryptionActive: true,
  };

  debugLog("ENCRYPTED DATA :::::", finalParams.encryptedData);
  debugLog("NON ENCRYPTED BODY ::::::", body);

  var params =
    methodType === RequestType.post
      ? {
          method: methodType,
          headers: requestHeader,
          body:
            propsFromContainer !== undefined &&
            propsFromContainer.body_stringify == false
              ? body
              : propsFromContainer !== undefined &&
                propsFromContainer.forOrder == true
              ? JSON.stringify(body)
              : JSON.stringify(finalParams),
        }
      : {
          method: methodType,
          headers: requestHeader,
        };

  debugLog("===== URL ===============================================", url);
  debugLog("===== Body =====", JSON.stringify(params));

  debugLog("request", JSON.stringify(body));
  fetch(url, params)
    .then(errorHandler)
    .then((response) => response.json())
    .then((encrypted_json) => {
      let json = undefined;
      if (encrypted_json.isEncryptionActive)
        json = JSON.parse(base64.decode(encrypted_json.encryptedResponse));
      else json = encrypted_json;

      debugLog(
        "JSON API CALL  @@@@@@@@@@@@@@@@@@@@@@@@@@@@PPPPPPPPPPIIIIIIIIIIIII@@@@@@@@@@@11",
        json,
        url
      );
      if (json.status === -1 || json.status === "-1") {
        if (
          !url.match(/login/) &&
          !url.match(/changeUserLanguage/) &&
          !url.match(/changeToken/)
        ) {
          showDialogue(
            json.message !== undefined && json.message.trim().length > 0
              ? json.message
              : strings("loginError"),
            [],
            "",
            () => {
              debugLog(
                "PRESSED SIGNOUT match:::::",
                propsFromContainer,
                !url.match(/login/)
              );

              flushAllData(
                (_response) => {
                  // TAKE THE USER TO INITIAL SCREEN
                  if (
                    propsFromContainer !== undefined &&
                    propsFromContainer.navigation !== undefined
                  ) {
                    globalStore.dispatch(saveTableIDInRedux(undefined));
                    globalStore.dispatch(saveResIDInRedux(undefined));
                    propsFromContainer.navigation.popToTop();
                    propsFromContainer.navigation.dispatch(
                      StackActions.reset({
                        index: 0,
                        actions: [
                          NavigationActions.navigate({
                            routeName: "SplashContainer",
                          }),
                        ],
                      })
                    );
                  }
                },
                (_error) => {}
              );
            }
          );
        }
      } else {
        responseSuccess(json);
      }
    })
    .catch((err) => responseErr(err));
}

/**
 * Genric function to make api calls with method post
 * @param {callAPI} url  API end point to call
 * @param {callAPI} responseSuccess  Call-back function to get success response from api call
 * @param {callAPI} responseErr  Call-back function to get error response from api call
 * @param {callAPI} requestHeader  Request header to be send to api
 * @param {callAPI} body data to be send through api
 */
export async function callSocialAPI(
  url,
  body,
  responseSuccess,
  responseErr,
  methodType,
  requestHeader = { "Content-Type": "application/json" },
  propsFromContainer,
  isStringify
) {
  Keyboard.dismiss();
  body["user_timezone"] = CurrentTimeZone;

  debugLog("NON ENCRYPTED BODY ::::::", body);

  var params =
    methodType === RequestType.post
      ? {
          method: methodType,
          headers: requestHeader,
          body: JSON.stringify(body),
        }
      : {
          method: methodType,
          headers: requestHeader,
        };

  debugLog(
    "===== URL ====================================================",
    url
  );
  debugLog("===== Body =====", JSON.stringify(params));

  debugLog("request", JSON.stringify(body));
  fetch(url, params)
    .then(errorHandler)
    .then((response) => response.json())
    .then((encrypted_json) => {
      let json = undefined;
      if (encrypted_json.isEncryptionActive)
        json = JSON.parse(base64.decode(encrypted_json.encryptedResponse));
      else json = encrypted_json;

      debugLog(
        "JSON API CALL  @@@@@@@@@@@@@@@@@@@@@@@@@@@@PPPPPPPPPPIIIIIIIIIIIII@@@@@@@@@@@22",
        json,
        url
      );
      if (json.status === -1 || json.status === "-1") {
        if (
          !url.match(/login/) &&
          !url.match(/getUserLanguage/) &&
          !url.match(/changeToken/)
        ) {
          showDialogue(
            json.message !== undefined && json.message.trim().length > 0
              ? json.message
              : strings("loginError"),
            [],
            "",
            () => {
              debugLog(
                "PRESSED SIGNOUT match:::::",
                propsFromContainer,
                !url.match(/login/)
              );

              flushAllData(
                (_response) => {
                  // TAKE THE USER TO INITIAL SCREEN
                  if (
                    propsFromContainer !== undefined &&
                    propsFromContainer.navigation !== undefined
                  ) {
                    propsFromContainer.navigation.popToTop();
                    propsFromContainer.navigation.dispatch(
                      StackActions.reset({
                        index: 0,
                        actions: [
                          NavigationActions.navigate({
                            routeName: "SplashContainer",
                          }),
                        ],
                      })
                    );
                  }
                },
                (_error) => {}
              );
            }
          );
        }
      } else {
        responseSuccess(json);
      }
    })
    .catch((err) => responseErr(err));
}

/**
 * Genric function to make api calls with method post
 * @param {callAPI} url  API end point to call
 * @param {callAPI} responseSuccess  Call-back function to get success response from api call
 * @param {callAPI} responseErr  Call-back function to get error response from api call
 * @param {callAPI} requestHeader  Request header to be send to api
 * @param {callAPI} body data to be send through api
 */
export async function callAPIFormData(
  url,
  body,
  responseSuccess,
  responseError,
  methodType = RequestType.post,
  requestHeader = { "Content-Type": "multipart/form-data" },
  propsFromContainer
) {
  Keyboard.dismiss();
  body["user_timezone"] = CurrentTimeZone;
  const formdata = new FormData();

  Object.keys(body || {}).map((keyToCheck) => {
    if (keyToCheck !== "image") {
      if (keyToCheck === "items") {
        let items = body.items;
        delete body["items"];
        body.items = JSON.stringify(items);
      }
    }
  });
  debugLog(" ::: tempdata :::: " + "BODY ::::::", body);
  let encryptedData = aes
    .encrypt(JSON.stringify(body), key, {
      iv: iv,
      padding: padZeroPadding,
    })
    .toString();

  formdata.append("encryptedData", encryptedData);
  formdata.append("isEncryptionActive", true);

  // debugLog(' ::: formdata :::: ' + JSON.stringify(formdata))

  if (
    body.image !== undefined &&
    body.image.uri !== undefined &&
    body.image.uri !== null
  ) {
    const imageDetails = body.image;
    const uriParts = imageDetails.fileName
      ? imageDetails.fileName.split(".")
      : imageDetails.uri.split(".");
    const strURIToUse =
      Platform.OS === "ios" ? imageDetails.uri : imageDetails.uri;

    const finalImageDetails = {
      uri: strURIToUse,
      name:
        imageDetails.fileName ||
        Math.round(new Date().getTime() / 1000) +
          "." +
          uriParts[uriParts.length - 1],
      type: `image/${uriParts[uriParts.length - 1]}`,
    };

    var strImageKeyName = "image";
    formdata.append(strImageKeyName, finalImageDetails);
    debugLog(" ::: IMAGE URI 12345 :::: " + JSON.stringify(finalImageDetails));
  }

  const finalParams = {
    method: methodType,
    body: formdata,
    headers: {
      Accept: "application/json",
      "Content-Type": "multipart/form-data",
    },
  };
  // debugLog(' ::: url :::: ' + url)
  // debugLog(' ::: finalParams :::: ' + JSON.stringify(finalParams))

  fetch(url, finalParams)
    .then(errorHandler)
    .then((response) => response.json())
    .then((encrypted_json) => {
      let json = undefined;
      if (encrypted_json.isEncryptionActive)
        json = JSON.parse(base64.decode(encrypted_json.encryptedResponse));
      else json = encrypted_json;

      debugLog("json123", json);
      if (json.status === 1) {
        responseSuccess(json);
      } else if (json.status === -1 || json.status === "-1") {
        if (
          !url.match(/login/) &&
          !url.match(/getUserLanguage/) &&
          !url.match(/changeToken/)
        ) {
          showDialogue(
            json.message !== undefined && json.message.trim().length > 0
              ? json.message
              : strings("loginError"),
            [],
            "",
            () => {
              flushAllData(
                (_response) => {
                  // TAKE THE USER TO INITIAL SCREEN
                  if (
                    propsFromContainer !== undefined &&
                    propsFromContainer.navigation !== undefined
                  ) {
                    propsFromContainer.navigation.popToTop();

                    propsFromContainer.navigation.dispatch(
                      StackActions.reset({
                        index: 0,
                        actions: [
                          NavigationActions.navigate({
                            routeName: "SplashContainer",
                          }),
                        ],
                      })
                    );
                  }
                },
                (_error) => {}
              );
            }
          );
        } else {
          responseError({
            data: json || {},
            message: json.message || strings("generalWebServiceError"),
          });
        }
      } else {
        responseError(json);
      }
    })
    .catch((err) => {
      if (err == undefined) {
      } else if (err instanceof SyntaxError) {
        return responseError({
          name: err.name,
          message: strings("generalWebServiceError"),
        });
      } else {
        return responseError(err);
      }
    });
}

//Error Handler
/**
 *
 * @param {errorHandler} response Generic function to handle error occur in api
 */
const errorHandler = (response) => {
  debugLog("Response ==>", response);
  if (
    (response.status >= 200 && response.status < 300) ||
    response.status == 401 ||
    response.status == 400
  ) {
    if (response.status == 204) {
      response.body = { success: "Saved" };
    }
    return Promise.resolve(response);
  } else {
    var error = new Error(response.statusText || response.status);
    error.response = response;
    return Promise.reject(error);
  }
};
