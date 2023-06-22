/* eslint-disable prettier/prettier */
import currencyFormatter from 'currency-formatter';
import moment from 'moment';
import { Dimensions } from 'react-native';
import { default as i18n, default as I18n } from "i18n-js";
//API URL CONSTANTS


export const BASE_URL = "https://mylifemyfood.com/v1/driver_api/"; //LIVE
export const GENERAL_BASE_URL = "https://mylifemyfood.com/v1/general_api/"; //LIVE


// export const BASE_URL = "https://mlmf.evdpl.com/v1/driver_api/"; //DEV
// export const GENERAL_BASE_URL = "https://mlmf.evdpl.com/v1/general_api/"; //DEV

export const CMS_PAGE = GENERAL_BASE_URL + 'getCMSPage';
export const LOGIN_URL = BASE_URL + "login";
export const SIGN_UP_URL = BASE_URL + "registration";
export const GET_ALL_ORDER = BASE_URL + "getallOrder";
export const ACCEPT_ORDER = BASE_URL + "acceptOrder";
export const PICKUP_ORDER = BASE_URL + "collect_order";
export const CANCEL_ORDER = BASE_URL + "cancel_order";
export const DRIVER_TRACKING = BASE_URL + "driverTracking";
export const GET_ORDERS_STATUS = BASE_URL + "get_order_detail";
export const CHANGE_TOKEN = BASE_URL + "updateDeviceToken";;
export const DELIVER_ORDER = BASE_URL + "deliverOrder";
export const GET_EARNING_ORDER = BASE_URL + "getCommissionList";
export const REVIEW_API = BASE_URL + "addReview";
export const LOGOUT_URL = BASE_URL + "logout";
export const FORGOT_PASSWORD = BASE_URL + "forgotpassword";
export const CHANGE_USER_LANGUAGE = BASE_URL + "changeUserLanguage";
export const CHANGE_PASSWORD = BASE_URL + "changePassword";
export const UPDATE_PROFILE = BASE_URL + "editProfile";
export const FETCH_DRIVER_LANGUAGE = GENERAL_BASE_URL + "language_list";
export const CHANGE_DRIVER_STATUS = BASE_URL + "change_driver_availability_status";
export const GET_CANCEL_REASON_LIST = GENERAL_BASE_URL + "cancel_reject_reason_list";
export const GET_COUTRY_CODE = GENERAL_BASE_URL + 'country_code_list';
export const GET_APP_VERSION = GENERAL_BASE_URL + 'getAppVersion'

//APP NAME
export const APP_NAME = 'MLMF Driver'

// GOOGLE API KEY
export const GOOGLE_API_KEY = "AIzaSyDGloG6w-mcnKSQmZaXXGa13ToYvGPJXLg"

// export const GOOGLE_API_KEY = "AIzaSyALUTQ6N8UJo6I8wvKbqPAMsRRGzNgbobQ"


//UNIT MODE
export const DISTANCE_IN_MILES = true

// NOTIFICATION_TYPE
export const ORDER_TYPE = 'order';

// REDUX CONSTANTS
export const RESPONSE_SUCCESS = 1;

// EXCEL TO JASON CONSTANTS
export const EXCEL_FILE_NAME = '/translations.xlsx';
export const BINARY_TYPE = 'binary';
export const ASCII_TYPE = 'ascii';

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
    decimal = ","
    thousand = "."
  }
  else {
    decimal = "."
    thousand = ","
  }
  // return xValue
  if (y === undefined) {
    var zValue = parseFloat(x);
    return currencyFormatter.format(zValue, {
      symbol: '',
      decimal: '.',
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
  return fontSizeToReturnVertical;
}

export const funGetDateFormat = (date, format) => {
  return moment(date, "YYYY-MM-DD HH:mm A").format(format || "dddd MMM DD, YYYY")

}