/* eslint-disable eqeqeq */
/* eslint-disable semi */
/* eslint-disable no-unused-vars */
/* eslint-disable consistent-this */
/* eslint-disable no-extend-native */
/* eslint-disable quotes */
/* eslint-disable prettier/prettier */
import Moment from 'moment';
import I18n from "i18n-js";
import currencyFormatter from 'currency-formatter';

//API URL CONSTANTS

export const BASE_URL = "https://mylifemyfood.com/v1/branch_admin_api/"    // LIVE
export const BASE_URL_GENERAL = "https://mylifemyfood.com/v1/general_api/";   // LIVE
export const BASE_IP = "https://mylifemyfood.com";// LIVE

// export const BASE_URL = "https://mlmf.evdpl.com/v1/branch_admin_api/"    // DEV
// export const BASE_URL_GENERAL = "https://mlmf.evdpl.com/v1/general_api/";   // DEV
// export const BASE_IP = "https://mlmf.evdpl.com";// DEV


export const CMS_PAGE = BASE_URL_GENERAL + 'getCMSPage';
export const LOGIN_URL = BASE_URL + 'login';
export const LOGOUT_URL = BASE_URL + 'logout';
export const FORGOT_PASSWORD = BASE_URL + 'forgotpassword';
export const CHANGE_PASSWORD = BASE_URL + 'changePassword';
export const UPDATE_PROFILE = BASE_URL + 'editProfile';
export const UPDATE_DEVICE_TOKEN = BASE_URL + 'updateDeviceToken';
export const SET_USER_LANGUAGE = BASE_URL + 'changeUserLanguage';
export const ORDER_DETAIL = BASE_URL + 'orderListing';
export const DRIVER_LIST = BASE_URL + 'getOrderHistory';
export const ACCEPT_ORDER = BASE_URL + 'acceptOrder';
export const REJECT_ORDER = BASE_URL + 'rejectOrder';
export const ASSIGN_DRIVER = BASE_URL + 'assignDriver';
export const UPDATE_ORDER_STATUS = BASE_URL + 'updateOrderStatus';
export const LANGUAGE_ARRAY = BASE_URL_GENERAL + 'language_list';
export const REASON_LIST = BASE_URL_GENERAL + 'cancel_reject_reason_list'
export const COUNTRY_CODE_LIST = BASE_URL_GENERAL + 'country_code_list'
export const APP_VERSION = BASE_URL_GENERAL + "getAppVersion"
export const PRINT_ORDER = BASE_URL + "printOrderReceipt";
export const PAY_ORDER = BASE_URL + "pay_order"
export const PROCESS_REFUND = BASE_URL + 'initiateRefund';
export const EDIT_ORDER = BASE_URL + 'edit_order';
export const GET_ASSIGNED_RESTAURANTS = BASE_URL + 'getAssignedRestaurants';
export const UPDATE_RESTAURANT_MODE = BASE_URL + 'updateRestaurantMode';




// REQUESTS CONSTANTS
export const RequestKeys = {
  contentType: 'Content-Type',
  json: 'application/json',
  authorization: 'Authorization',
  bearer: 'Bearer',
};

// STORAGE CONSTANTS
export const StorageKeys = {
  userDetails: 'UserDetails',
};

//DELIVERY METHODS
export const THIRD_PARTY_DELIVERY = "thirdparty_delivery"

// NOTIFICATION_TYPE
export const ORDER_TYPE = 'order';
export const DEFAULT_TYPE = 'default';

// REDUX CONSTANTS
export const RESPONSE_SUCCESS = 1;

// CMS PAGE
export const ABOUT_US = 'about-us';

export function debugLog(a) {
  for (var i = 0; i < arguments.length; i++) {
    console.log(arguments[i]);
  }
}


export function isRTLCheck() {
  return I18n.currentLocale().indexOf('ar') === 0;
}

String.prototype.replaceAll = function (search, replacement) {
  var target = this;
  return target.split(search).join(replacement);
};

export function funGetDateStr(date, formats) {
  if (formats == undefined) {
    formats = "MMM DD, YYYY hh:mm A";
  }

  var d = new Date("" + date.replaceAll("-", "/"));

  return Moment(d).format(formats);
}

export function funGetDateStrNew(date, formats) {
  if (formats == undefined) {
    formats = "MMM DD, YYYY hh:mm A";
  }
  return Moment(date).format(formats);
}


export const funGetDate = date => {
  // var d = new Date(date);
  return Moment(date).format("MM-DD-YYYY");
};

export const funGetTomorrowDate = () => {
  var d = new Date();
  return new Date(d);
};

export function capiString(str) {
  var splitStr = str.split(' ');
  for (var i = 0; i < splitStr.length; i++) {
    // You do not need to check if i is larger than splitStr length, as your for does that for you
    // Assign it back to the array
    splitStr[i] =
      splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
  }
  // Directly return the joined string
  return splitStr.join(' ');
}


export function funGetFrench_Curr(x, y, lan) {
  let decimal
  let thousand

  if (lan == "fr") {
    decimal = " ,"
    thousand = " ."
  }
  else {
    decimal = " ."
    thousand = " ,"
  }
  // return xValue
  if (y === undefined) {
    var zValue = parseFloat(x);
    return currencyFormatter.format(zValue, {
      symbol:  ' ',
      decimal: ' .',
      thousand: sym,
      precision: 2,
    });
  } else {
    var xValue = parseFloat(x) * parseFloat(y);
    return currencyFormatter.format(xValue, {
      symbol: ' ',
      decimal: decimal,
      thousand: thousand,
      precision: 2,
    });
  }
}

// TEXT FIELD TYPES
export const TextFieldTypes = {
  email: 'email',
  password: 'password',
  phone: 'phone',
  datePicker: 'datePicker',
  default: 'default',
  action: 'action',
  picker: 'picker',
  amount: 'amount',
  countryPicker: 'countryPicker',
};

import { Dimensions } from 'react-native';
import { Platform } from 'react-native';
const { width, height } = Dimensions.get('window');

const guidelineBaseWidth = 360;
const guidelineBaseHeight = 760;
const scale = size => width / guidelineBaseWidth * size;
const verticalScale = size => height / guidelineBaseHeight * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

// CHANGE FONT SIZE IN ANDROID
export function getProportionalFontSize(baseFontSize) {
  var intialFontSize = baseFontSize || 14;
  var fontSizeToReturnModerate = moderateScale(intialFontSize);
  var fontSizeToReturnVertical = verticalScale(intialFontSize);
  return Platform.OS == "ios" ? fontSizeToReturnVertical : fontSizeToReturnVertical;
}

export const PAGE_COUNT = 20;

//decimal validation
export const validateTwoDecimal = value => {
  var rgx = /^[0-9]*\.[0-9]{3}$/;
  return value.match(rgx);
}
//#endregion