/* eslint-disable no-trailing-spaces */
/* eslint-disable semi */
/* eslint-disable comma-dangle */
/* eslint-disable prettier/prettier */
import {
    LOGIN_URL,
    LOGOUT_URL,
    RequestKeys,
    // debugLog,
    FORGOT_PASSWORD,
    CHANGE_PASSWORD,
    CMS_PAGE,
    UPDATE_PROFILE,
    UPDATE_DEVICE_TOKEN,
    SET_USER_LANGUAGE,
    ORDER_DETAIL,
    DRIVER_LIST,
    ACCEPT_ORDER,
    REJECT_ORDER,
    ASSIGN_DRIVER,
    UPDATE_ORDER_STATUS,
    LANGUAGE_ARRAY,
    REASON_LIST,
    COUNTRY_CODE_LIST,
    APP_VERSION,
    PRINT_ORDER,
    PAY_ORDER,
    debugLog,
    PROCESS_REFUND,
    EDIT_ORDER,
    GET_ASSIGNED_RESTAURANTS,
    UPDATE_RESTAURANT_MODE
} from '../utils/EDConstants';
import { Platform, Keyboard } from 'react-native';
import { strings } from '../locales/i18n';
import { showDialogue } from './EDAlert';
import { clearLogin } from './AsyncStorageHelper';
// import { StackActions, NavigationActions } from 'react-navigation';
import { CommonActions } from "@react-navigation/native"

import aes from 'crypto-js/aes'
import encHex from 'crypto-js/enc-hex'
import padZeroPadding from 'crypto-js/pad-zeropadding'

import base64 from 'base-64'

let key = encHex.parse("5126b6af4f15d73a20c60676b0f226b2");
let iv = encHex.parse("a8966e4702bb84f4ef37640cd4b46aa2");

const isEncryptionActive = true

import * as RNLocalize from "react-native-localize";
var CurrentTimeZone = RNLocalize.getTimeZone()

const RequestType = {
    post: 'POST',
    get: 'GET',
    patch: 'PATCH',
    put: 'PUT',
}

/**
 *
 * @param {Props of the screen from which the API is getting called} propsReceived
 * @param {Optional request url argument in case of any exception needed in future} requestString
 */
function getRequestHeader(propsReceived) {
    var objHeader = propsReceived
        ? { [RequestKeys.contentType]: RequestKeys.json }
        : { [RequestKeys.contentType]: RequestKeys.json };
              
    return objHeader;
}


/**
 *
 * @param {The input parameters for login request call} loginParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function loginUser(loginParams, onSuccess, onFailure, propsFromContainer) {
    callAPI(LOGIN_URL, loginParams, onSuccess, onFailure, RequestType.post, getRequestHeader(propsFromContainer), propsFromContainer);
}


/**
 *
 * @param {The input parameters for forgot password request call} forgotPasswordParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function forgotPassword(forgotPasswordParams, onSuccess, onFailure, propsFromContainer) {
    callAPI(FORGOT_PASSWORD, forgotPasswordParams, onSuccess, onFailure, RequestType.post, getRequestHeader(propsFromContainer), propsFromContainer);
}

/**
 *
 * @param {The input parameters for logout request call} logoutParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function logoutUser(logoutParams, onSuccess, onFailure, propsFromContainer) {
    // debugLog('LOGOUT PARAMS ::: ' + JSON.stringify(logoutParams))
    callAPI(LOGOUT_URL, logoutParams, onSuccess, onFailure, RequestType.post, getRequestHeader(propsFromContainer), propsFromContainer);
}

/**
 *
 * @param {The input parameters for change password request call} changePasswordParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function changePassword(changePasswordParams, onSuccess, onFailure, propsFromContainer) {
    callAPI(CHANGE_PASSWORD, changePasswordParams, onSuccess, onFailure, RequestType.post, getRequestHeader(propsFromContainer), propsFromContainer);
}

/**
 *
 * @param {The input parameters for change password request} editProfile
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function editProfile(editProfileParams, onSuccess, onFailure, propsFromContainer) {
    callAPIForFileUpload(UPDATE_PROFILE, editProfileParams, onSuccess, onFailure, RequestType.post, propsFromContainer);
}

/**
 *
 * @param {The input parameters for updating device token request call} changeTokenParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function changeTOKEN(changeTokenParams, onSuccess, onFailure, propsFromContainer) {
    callAPI(UPDATE_DEVICE_TOKEN, changeTokenParams, onSuccess, onFailure, RequestType.post, getRequestHeader(propsFromContainer), propsFromContainer);
}

/**
 *
 * @param {The input parameters for updating user language request call} userLanguage Params
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function userLanguage(userLanguageParams, onSuccess, onFailure, propsFromContainer) {
    callAPI(SET_USER_LANGUAGE, userLanguageParams, onSuccess, onFailure, RequestType.post, getRequestHeader(propsFromContainer), propsFromContainer);
}

/**
 *
 * @param {The input parameters for get CMS page details request call} cmsPageParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function getCMSPageDetails(cmsPageParams, onSuccess, onFailure, propsFromContainer) {
    callAPI(CMS_PAGE, cmsPageParams, onSuccess, onFailure, RequestType.post, getRequestHeader(propsFromContainer), propsFromContainer);
}



/**
 *
 * @param {The input parameters for get CMS page details request call} languageArray
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function fetchLanguageArray(languageArrayParams, onSuccess, onFailure, propsFromContainer) {
  callAPI(LANGUAGE_ARRAY, languageArrayParams, onSuccess, onFailure, RequestType.post, getRequestHeader(propsFromContainer), propsFromContainer);
}

/**
 *
 * @param {The input parameters for get CMS page details request call} reasonList
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
 export function fetchReasonList(reasonListParams, onSuccess, onFailure, propsFromContainer) {
  callAPI(REASON_LIST, reasonListParams, onSuccess, onFailure, RequestType.post, getRequestHeader(propsFromContainer), propsFromContainer);
}

/**
 *
 * @param {The input parameters for get CMS page details request call} countryCodeList
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
 export function fetchCountryCodes(countryCodeListParams, onSuccess, onFailure, propsFromContainer) {
  callAPI(COUNTRY_CODE_LIST, countryCodeListParams, onSuccess, onFailure, RequestType.post, getRequestHeader(propsFromContainer), propsFromContainer);
}

/**
 *
 * @param {The input parameters for get all Orders request call} ordersParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function getOrderDetail(ordersParams, onSuccess, onFailure, propsFromContainer) {
    callAPI(ORDER_DETAIL, ordersParams, onSuccess, onFailure, RequestType.post, getRequestHeader(propsFromContainer), propsFromContainer);
}

/**
 *
 * @param {The input parameters for get driver lsit request call} driverListParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function getDriverListAPI(driverListParams, onSuccess, onFailure, propsFromContainer) {
    callAPI(DRIVER_LIST, driverListParams, onSuccess, onFailure, RequestType.post, getRequestHeader(propsFromContainer), propsFromContainer);
}

/**
 *
 * @param {The input parameters for token param } tokenParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
 export function getAPPVersionAPI(params, onSuccess, onFailure, propsFromContainer) {
    callAPI(APP_VERSION , params, onSuccess, onFailure, RequestType.post, getRequestHeader(propsFromContainer), propsFromContainer);
}


/**
 *
 * @param {The input parameters to accept/reject order request call} orderParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function acceptNRejectOrderAPI(orderParams, onSuccess, onFailure, propsFromContainer) {
    callAPI(propsFromContainer[1].accept ? ACCEPT_ORDER : REJECT_ORDER, orderParams, onSuccess, onFailure, RequestType.post, getRequestHeader(propsFromContainer), propsFromContainer);
}

/**
 *
 * @param {The input parameters to assign driver request call} driverParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function assignDriverAPI(driverParams, onSuccess, onFailure, propsFromContainer) {
    callAPI(ASSIGN_DRIVER, driverParams, onSuccess, onFailure, RequestType.post, getRequestHeader(propsFromContainer), propsFromContainer);
}

/**
 *
 * @param {The input parameters to process refund request call} driverParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
 export function initiateRefundAPI(refundParams, onSuccess, onFailure, propsFromContainer) {
  callAPI(PROCESS_REFUND, refundParams, onSuccess, onFailure, RequestType.post, getRequestHeader(propsFromContainer), propsFromContainer);
}

/**
 *
 * @param {The input parameters to update order status request call} orderParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function updateOrderStatusAPI(orderParams, onSuccess, onFailure, propsFromContainer) {
    callAPI(UPDATE_ORDER_STATUS, orderParams, onSuccess, onFailure, RequestType.post, getRequestHeader(propsFromContainer), propsFromContainer);
}

/**
 *
 * @param {The input parameters for PrintOrder param } PrintOrderParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
 export function printOrder(PrintOrderParams, onSuccess, onFailure, propsFromContainer) {
  callAPI(PRINT_ORDER, PrintOrderParams, onSuccess, onFailure, RequestType.post, getRequestHeader(propsFromContainer), propsFromContainer);
}

/**
 *
 * @param {The input parameters for edit order param } orderParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
 export function editOrder(orderParams, onSuccess, onFailure, propsFromContainer) {
  callAPI(EDIT_ORDER, orderParams, onSuccess, onFailure, RequestType.post, getRequestHeader(propsFromContainer), propsFromContainer);
}

/**
 *
 * @param {The input parameters for PrintOrder param } PayOrderParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
 export function payOrder(PayOrderParams, onSuccess, onFailure, propsFromContainer) {
  callAPI(PAY_ORDER, PayOrderParams, onSuccess, onFailure, RequestType.post, getRequestHeader(propsFromContainer), propsFromContainer);
}

/**
 *
 * @param {The input parameters for getRestaurantListAPI param } restParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
 export function getRestaurantListAPI(restParams, onSuccess, onFailure, propsFromContainer) {
  callAPI(GET_ASSIGNED_RESTAURANTS, restParams, onSuccess, onFailure, RequestType.post, getRequestHeader(propsFromContainer), propsFromContainer);
}

/**
 *
 * @param {The input parameters for updateRestaurantModeAPI param } sechduleParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
 export function updateRestaurantModeAPI(sechduleParams, onSuccess, onFailure, propsFromContainer) {
  callAPI(UPDATE_RESTAURANT_MODE, sechduleParams, onSuccess, onFailure, RequestType.post, getRequestHeader(propsFromContainer), propsFromContainer);
}


/**
 * Genric function to make api calls with method post
 * @param {apiPost} url  API end point to call
 * @param {apiPost} responseSuccess  Call-back function to get success response from api call
 * @param {apiPost} responseErr  Call-back function to get error response from api call
 * @param {apiPost} requestHeader  Request header to be send to api
 * @param {apiPost} body data to be send through api
 */
async function callAPI(url, body, responseSuccess, responseErr, methodType = RequestType.post, requestHeader = { 'Content-Type': 'application/json' }, propsFromContainer) {

    body['user_timezone'] = CurrentTimeZone  
    let encryptedData = aes.encrypt(JSON.stringify(body), key, {
      iv: iv,
      padding: padZeroPadding
    }).toString()
  
    var finalParams = {
      encryptedData: encryptedData,
      isEncryptionActive: true
    }
  
    var params =
      methodType === RequestType.post
        ? {
          method: methodType,
          headers: requestHeader,
          body: isEncryptionActive ? ((propsFromContainer !== undefined && propsFromContainer.body_stringify == false) ? body : (propsFromContainer !== undefined && propsFromContainer.forOrder == true) ? JSON.stringify(body) : JSON.stringify(finalParams)) : JSON.stringify(body),
        }
        : {
          method: methodType,
          headers: requestHeader
        }
    // debugLog("PROPRS :::::::::::::::: ", propsFromContainer)
    debugLog('===== URL =====', url);
    debugLog('===== Body =====', JSON.stringify(params));
    debugLog('===== NON ENCRYPTED Body =====', body);
  
  
    fetch(url, params)
      .then(errorHandler)
      .then(response => {
        // debugLog('::: RESPONSE HERE :::', response)
        // // debugLog('::: RESPONSE JSON :::', response.json())
        return response.json()
      })
      .then(encrypted_json => {
        // debugLog("Encrypted response :::::", encrypted_json)
  
        let json = undefined
        if (encrypted_json.isEncryptionActive == true)
          json = JSON.parse(base64.decode(encrypted_json.encryptedResponse))
        else
          json = encrypted_json
  
        debugLog('json', json);
        if (json.status === 1) {
          responseSuccess({ data: json || {}, message: json.message || '' });
        } else if (json.status === "OK") {
          responseSuccess({ data: json || {}, message: json.message || '' });
        } else if (json.status === 2) {
          responseErr({ data: json || {}, message: json.message || strings('generalWebServiceError') });
        }
        else if (json.status === "CREATED" || json.status === "COMPLETED") {
          responseSuccess(json);
        }
        else if (json.status === 1000 || json.status === -1) {
          if (!url.match(/login/)) {
            showDialogue(json.message !== undefined && json.message.trim().length > 0
              ? json.message
              : strings('generalWebServiceError'), "", [],
              () => {
                clearLogin(
                  _response => {
  
                    // TAKE THE USER TO INITIAL SCREEN
                    if (propsFromContainer !== undefined && propsFromContainer.navigation !== undefined) {
                      propsFromContainer.navigation.dispatch(
                        CommonActions.reset({
                          index: 0,
                          routes: [{ name: "splash" }]
                          // actions: [
                          //   NavigationActions.navigate({ routeName: 'splash' })
                          // ]
                        })
                      )
                    }
                  },
                  _error => { }
                );
              })
          } else {
            responseErr({ data: json || {}, message: json.message || strings('generalWebServiceError') });
          }
        }
        else {
          responseErr({ data: json || {}, message: json.message || strings('generalWebServiceError') });
        }
      })
      .catch(err => {
        // debugLog('ERROR HERE :: ', err);
        // if (err instanceof SyntaxError) {
        return responseErr({ name: err.name, message: strings('generalWebServiceError') })
        // } else {
        //   return responseErr(err)
        // }
      });
  }

var printError = function (error, explicit) {
    // debugLog(`[${explicit ? 'EXPLICIT' : 'INEXPLICIT'}] ${error.name}: ${error.message}`);
}

/**
 * Genric function to make api calls with method post
 * @param {apiPost} url  API end point to call
 * @param {apiPost} body  Parameters for form-data request
 * @param {apiPost} responseSuccess  Call-back function to get success response from api call
 * @param {apiPost} responseErr  Call-back function to get error response from api call
 * @param {apiPost} requestHeader  Request header to be send to api
 */
async function callAPIForFileUpload(url, body, responseSuccess, responseErr, methodType = RequestType.post, propsFromContainer) {
  body['user_timezone'] = CurrentTimeZone    
  const formdata = new FormData();
  
    if (isEncryptionActive)
      Object.keys(body || {}).map(keyToCheck => {
        if (keyToCheck !== 'image') {
          if (keyToCheck === 'items') {
            let items = body[keyToCheck]
            delete body[keyToCheck]
            body[keyToCheck] = JSON.stringify(items)
          }
        }
      })
    else
      Object.keys(body || {}).map(keyToCheck => {
        if (keyToCheck !== 'image') {
          if (keyToCheck === 'items') {
            formdata.append(keyToCheck, JSON.stringify(body[keyToCheck]))
          } else {
            formdata.append(keyToCheck, body[keyToCheck])
          }
        }
      })
  
    // debugLog(' ::: formdata :::: ' + JSON.stringify(formdata))
  
    if (body.image !== undefined && body.image.uri !== undefined && body.image.uri !== null) {
      const imageDetails = body.image
      const uriParts = imageDetails.fileName ? imageDetails.fileName.split('.') : imageDetails.uri.split('.')
      const strURIToUse = Platform.OS === 'ios' ? imageDetails.uri.replace('file:/', '') : imageDetails.uri
      // const strURIToUse = Platform.OS === 'ios' ? imageDetails.uri : imageDetails.uri
  
      const finalImageDetails = {
        uri: strURIToUse,
        name: imageDetails.fileName || (Math.round(new Date().getTime() / 1000) + '.' + uriParts[uriParts.length - 1]),
        type: `image/${uriParts[uriParts.length - 1]}`
      }
  
      var strImageKeyName = 'image'
      formdata.append(strImageKeyName, finalImageDetails);
      if (isEncryptionActive)
        delete body['image']
      // debugLog(' ::: IMAGE URI 12345 :::: ' + JSON.stringify(finalImageDetails))
    }
  
    let encryptedData = aes.encrypt(JSON.stringify(body), key, {
      iv: iv,
      padding: padZeroPadding
    }).toString()
  
  
    if (isEncryptionActive) {
      formdata.append("encryptedData", encryptedData)
      formdata.append("isEncryptionActive", true)
    }
  
    const finalParams = {
      method: methodType,
      body: formdata,
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      }
    }
    // debugLog(' ::: url :::: ' + url)
    // debugLog("NO ENCRYPTED BODY :::::", body)
    // debugLog(' ::: finalParams :::: ' + JSON.stringify(finalParams))
  
    fetch(url, finalParams)
      .then(errorHandler)
      .then(response => response.json())
      .then(encrypted_json => {
        // debugLog("Encrypted response :::::", encrypted_json)
  
        let json = undefined
        if (encrypted_json.isEncryptionActive == true)
          json = JSON.parse(base64.decode(encrypted_json.encryptedResponse))
        else
          json = encrypted_json
  
        // debugLog('json123', json);
        if (json.status === 1) {
          responseSuccess({ data: json || {}, message: json.message || '' });
        } else if (json.status === 1000) {
          showDialogue(json.message, "", [],
            () => {
  
              clearLogin(
                _response => {
  
                  // TAKE THE USER TO INITIAL SCREEN
                  propsFromContainer.navigation.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [{ name: "splash" }]
                      // actions: [
                      //   NavigationActions.navigate({ routeName: 'splash' })
                      // ]
                    })
                  )
                },
                _error => { }
              );
            })
        } else {
          responseErr({ data: json || {}, message: json.message || strings('generalWebServiceError') });
        }
      })
      .catch(err => {
        // debugLog('ERROR HERE true:: ', printError(err, true));
        // debugLog('ERROR HERE false:: ', printError(err, false));
        if (err == undefined) {
  
        }
        else if (err instanceof SyntaxError) {
          return responseErr({ name: err.name, message: strings('generalWebServiceError') })
        } else {
          return responseErr(err)
        }
      });
}

/**
 *
 * @param {errorHandler} response Generic function to handle error occur in api
 */
const errorHandler = response => {
    if (
        (response.status >= 200 && response.status < 300) ||
        response.status === 400
    ) {
        if (response.status === 204) {
            response.body = { success: 'Saved' };
        }
        return Promise.resolve(response);
    } else {
        var errorMessage =
            response.error != undefined && response.error.message != undefined
                ? response.error.message
                : strings('generalWebServiceError');
        var error = new Error(errorMessage);
        error.response = response;
        // debugLog('error else', response.json());
        return Promise.reject(error);
    }
};
