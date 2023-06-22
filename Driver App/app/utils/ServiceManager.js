/* eslint-disable no-trailing-spaces */
/* eslint-disable semi */
/* eslint-disable comma-dangle */
/* eslint-disable prettier/prettier */
import base64 from 'base-64';
import aes from 'crypto-js/aes';
import encHex from 'crypto-js/enc-hex';
import padZeroPadding from 'crypto-js/pad-zeropadding';
import { Keyboard, Platform } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { strings } from '../locales/i18n';
import { ACCEPT_ORDER, CANCEL_ORDER, CHANGE_DRIVER_STATUS, CHANGE_PASSWORD, CHANGE_TOKEN, CHANGE_USER_LANGUAGE, CMS_PAGE, debugLog, DELIVER_ORDER, DRIVER_TRACKING, FETCH_DRIVER_LANGUAGE, FORGOT_PASSWORD, GET_ALL_ORDER, GET_EARNING_ORDER, GET_ORDERS_STATUS, LOGIN_URL, LOGOUT_URL, ORDER_DETAIL, PICKUP_ORDER, REVIEW_API, UPDATE_PROFILE, GET_CANCEL_REASON_LIST, GET_COUTRY_CODE, GET_APP_VERSION, DISTANCE_IN_MILES } from '../utils/EDConstants';
import { clearLogin } from './AsyncStorageHelper';
import { showDialogue } from './EDAlert';
import * as RNLocalize from "react-native-localize";
var CurrentTimeZone = RNLocalize.getTimeZone()
let key = encHex.parse("5126b6af4f15d73a20c60676b0f226b2");
let iv = encHex.parse("a8966e4702bb84f4ef37640cd4b46aa2");

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
function getRequestHeader() {
    let objHeader = {}
    objHeader['Content-Type'] = 'application/json'
    objHeader['timezone'] = CurrentTimeZone
    return objHeader
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
 * @param {The input parameters for updating device token request call} updateDeviceTokenParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function updateDeviceTokenAPI(updateDeviceTokenParams, onSuccess, onFailure, propsFromContainer) {
    callAPI(CHANGE_TOKEN, updateDeviceTokenParams, onSuccess, onFailure, RequestType.post, getRequestHeader(propsFromContainer), propsFromContainer);
}

/**
 *
 * @param {The input parameters for updating user language request call} userLanguage Params
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function userLanguage(userLanguageParams, onSuccess, onFailure, propsFromContainer) {
    callAPI(CHANGE_USER_LANGUAGE, userLanguageParams, onSuccess, onFailure, RequestType.post, getRequestHeader(propsFromContainer), propsFromContainer);
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
 * @param {The input parameters for get driver current language in server request call} driverParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function fetchDriverLanguage(driverParams, onSuccess, onFailure, propsFromContainer) {
    callAPI(FETCH_DRIVER_LANGUAGE, driverParams, onSuccess, onFailure, RequestType.post, getRequestHeader(propsFromContainer), propsFromContainer);
}

/**
 *
 * @param {The input parameters for update driver location request} trackingParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function updateDriverLocation(trackingParams, onSuccess, onFailure, propsFromContainer) {
    callAPI(DRIVER_TRACKING, trackingParams, onSuccess, onFailure, RequestType.post, getRequestHeader(propsFromContainer), propsFromContainer);
}

/**
*
* @param {The input parameters for get polyLine request call} polyLineParams
* @param {Callback function for handling success response} onSuccess
* @param {Callback function for handling failure response} onFailure
* @param {Props of the screen from which the API is getting called} propsFromContainer
*/
export function displayPolyLine(userPolyLineParams, onSuccess, onFailure, propsFromContainer, googleMapsAPIKey, useMile = true) {

    if (googleMapsAPIKey == undefined || googleMapsAPIKey == null) {
        onFailure({ data: {}, message: strings('webServiceError') })
        return;
    }

    let urlToCall = `https://maps.googleapis.com/maps/api/directions/json?origin=${[userPolyLineParams.destinationLatitude, userPolyLineParams.destinationLongitude]}&destination=${[userPolyLineParams.sourceLatitude, userPolyLineParams.sourceLongitude]}&key=${googleMapsAPIKey}&mode=driving&units=${useMile?"imperial":"metrics"}`;

    callAPI(urlToCall, {}, onSuccess, onFailure, RequestType.get, getRequestHeader(propsFromContainer), propsFromContainer);
}

/**
 *
 * @param {The input parameters for get Orders status request call} ordersStatusParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function checkOrderStatus(ordersStatusParams, onSuccess, onFailure, propsFromContainer) {
    callAPI(GET_ORDERS_STATUS, ordersStatusParams, onSuccess, onFailure, RequestType.post, getRequestHeader(propsFromContainer), propsFromContainer);
}


/**
*
* @param {The input parameters for update driver location request} trackingParams
* @param {Callback function for handling success response} onSuccess
* @param {Callback function for handling failure response} onFailure
* @param {Props of the screen from which the API is getting called} propsFromContainer
*/
export function cancelOrder(trackingParams, onSuccess, onFailure, propsFromContainer) {
    callAPI(CANCEL_ORDER, trackingParams, onSuccess, onFailure, RequestType.post, getRequestHeader(propsFromContainer), propsFromContainer);
}

/**
 *
 * @param {The input parameters for update driver location request} trackingParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function acceptOrder(trackingParams, onSuccess, onFailure, propsFromContainer) {
    callAPI(ACCEPT_ORDER, trackingParams, onSuccess, onFailure, RequestType.post, getRequestHeader(propsFromContainer), propsFromContainer);
}

/**
*
* @param {The input parameters for update driver location request} trackingParams
* @param {Callback function for handling success response} onSuccess
* @param {Callback function for handling failure response} onFailure
* @param {Props of the screen from which the API is getting called} propsFromContainer
*/
export function pickupOrderAPI(trackingParams, onSuccess, onFailure, propsFromContainer) {
    callAPI(PICKUP_ORDER, trackingParams, onSuccess, onFailure, RequestType.post, getRequestHeader(propsFromContainer), propsFromContainer);
}


/**
 *
 * @param {The input parameters for Orders deliver request call} orderDeliverParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function ordersDeliver(ordersParams, onSuccess, onFailure, propsFromContainer) {
    callAPI(DELIVER_ORDER, ordersParams, onSuccess, onFailure, RequestType.post, getRequestHeader(propsFromContainer), propsFromContainer);
}

/**
*
* @param {The input parameters for Driver status request call} driverStatusParams
* @param {Callback function for handling success response} onSuccess
* @param {Callback function for handling failure response} onFailure
* @param {Props of the screen from which the API is getting called} propsFromContainer
*/
export function addReview(addReviewParams, onSuccess, onFailure, propsFromContainer) {
    callAPI(REVIEW_API, addReviewParams, onSuccess, onFailure, RequestType.post, getRequestHeader(propsFromContainer), propsFromContainer);
}

/**
*
* @param {The input parameters for get all Orders request call} ordersParams
* @param {Callback function for handling success response} onSuccess
* @param {Callback function for handling failure response} onFailure
* @param {Props of the screen from which the API is getting called} propsFromContainer
*/
export function getAllOrders(ordersParams, onSuccess, onFailure, propsFromContainer) {
    callAPI(GET_ALL_ORDER, ordersParams, onSuccess, onFailure, RequestType.post, getRequestHeader(propsFromContainer), propsFromContainer);
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
 * @param {The input parameters for get all Orders request call} ordersParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function getEarnings(earningsParams, onSuccess, onFailure, propsFromContainer) {
    callAPI(GET_EARNING_ORDER, earningsParams, onSuccess, onFailure, RequestType.post, getRequestHeader(propsFromContainer), propsFromContainer);
}

/**
 *
 * @param {The input parameters for Driver status request call} driverStatusParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function driverStatus(driverStatusParams, onSuccess, onFailure, propsFromContainer) {
    callAPI(CHANGE_DRIVER_STATUS, driverStatusParams, onSuccess, onFailure, RequestType.post, getRequestHeader(propsFromContainer), propsFromContainer);
}

/**
 *
 * @param {The input parameters for get cancel reason list request call} reasonParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function getCancelReasonList(reasonParams, onSuccess, onFailure, propsFromContainer) {
    callAPI(GET_CANCEL_REASON_LIST, reasonParams, onSuccess, onFailure, RequestType.post, getRequestHeader(propsFromContainer), propsFromContainer);
}

/**
 *
 * @param {The input parameters for get country code list request call} countryParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function getCoutryCodeListAPI(countryParams, onSuccess, onFailure, propsFromContainer) {
    callAPI(GET_COUTRY_CODE, countryParams, onSuccess, onFailure, RequestType.post, getRequestHeader(propsFromContainer), propsFromContainer);
}


/**
 *
 * @param {The input parameters for getting app version request call} appParams
 * @param {Callback function for handling success response} onSuccess
 * @param {Callback function for handling failure response} onFailure
 * @param {Props of the screen from which the API is getting called} propsFromContainer
 */
export function getAPPVersionAPI(appParams, onSuccess, onFailure, propsFromContainer) {
    callAPI(GET_APP_VERSION, appParams, onSuccess, onFailure, RequestType.post, getRequestHeader(propsFromContainer), propsFromContainer);
}




/**
 * Genric function to make api calls with method post
 * @param {apiPost} url  API end point to call
 * @param {apiPost} responseSuccess  Call-back function to get success response from api call
 * @param {apiPost} responseErr  Call-back function to get error response from api call
 * @param {apiPost} requestHeader  Request header to be send to api
 * @param {apiPost} body data to be send through api
 */
export async function callAPI(url, body, responseSuccess, responseErr, methodType, requestHeader = { "Content-Type": "application/json" }, propsFromContainer, isStringify) {


    Keyboard.dismiss();
    body['user_timezone'] = CurrentTimeZone  //vikrant 23-07-21
    let filtered_body = {}

    Object.keys(body || {}).map(keyToCheck => {
        if (keyToCheck !== 'image') {
            if (keyToCheck === 'items' && isStringify !== true) {
                filtered_body[keyToCheck] = JSON.stringify(body[keyToCheck])
            } else {
                filtered_body[keyToCheck] = body[keyToCheck]
            }
        }
    })
    let encryptedData = aes.encrypt(JSON.stringify(filtered_body), key, {
        iv: iv,
        padding: padZeroPadding
    }).toString()

    var finalParams = {
        encryptedData: encryptedData,
        isEncryptionActive: true
    }

    debugLog("ENCRYPTED DATA :::::", finalParams.encryptedData)
    debugLog("NON ENCRYPTED BODY ::::::", body)

    var params =
        methodType === RequestType.post
            ? {
                method: methodType,
                headers: requestHeader,
                body: (propsFromContainer !== undefined && propsFromContainer.body_stringify == false) ? body : (propsFromContainer !== undefined && propsFromContainer.forOrder == true) ? JSON.stringify(body) : JSON.stringify(finalParams),
            }
            : {
                method: methodType,
                headers: requestHeader
            }

    debugLog('===== URL =====', url);
    debugLog('===== encrypted Body =====', JSON.stringify(params));
    debugLog('===== Body =====', body);


    fetch(url, params)
        .then(errorHandler)
        .then(response => response.json())
        .then(encrypted_json => {

            let json = undefined
            if (encrypted_json.isEncryptionActive)
                json = JSON.parse(base64.decode(encrypted_json.encryptedResponse))
            else
                json = encrypted_json
            if (json.status === 1) {
                responseSuccess({ data: json || {}, message: json.message || '' });
            } else if (json.status === "OK") {
                responseSuccess({ data: json || {}, message: json.message || '' });
            } else if (json.status === 200) {
                responseSuccess({ data: json.json() || {}, message: json.message || '' });
            }
            else if (json.status === 2 || json.status === 0) {
                responseErr({ data: json || {}, message: json.message || strings('webServiceError') });
            }
            else if (json.status === -1 || json.status === "-1") {
                if (!url.match(/login/)) {

                    showDialogue(json.message !== undefined && json.message.trim().length > 0
                        ? json.message
                        : strings('loginError'), "", [],
                        () => {

                            clearLogin(
                                _response => {

                                    // TAKE THE USER TO INITIAL SCREEN
                                    if (propsFromContainer !== undefined && propsFromContainer.navigation !== undefined) {
                                        propsFromContainer.navigation.popToTop()
                                        propsFromContainer.navigation.dispatch(
                                            CommonActions.reset({
                                                index:0,
                                                routes:[{name:  'splash'}]
                                            })
                                        )
                                    }
                                },
                                _error => { }
                            );
                        })
                }
            }
            else {
                responseSuccess(json);
            }
        })
        .catch(err => responseErr(err));
}

var printError = function (error, explicit) {
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


    Keyboard.dismiss();

    const formdata = new FormData();

    if (body.image !== undefined && body.image.uri !== undefined && body.image.uri !== null) {
        const imageDetails = body.image
        const uriParts = imageDetails.fileName ? imageDetails.fileName.split('.') : imageDetails.uri.split('.')
        const strURIToUse = Platform.OS === 'ios' ? imageDetails.uri.replace('file:/', '') : imageDetails.uri

        const finalImageDetails = {
            uri: strURIToUse,
            name: imageDetails.fileName || (Math.round(new Date().getTime() / 1000) + '.' + uriParts[uriParts.length - 1]),
            type: `image/${uriParts[uriParts.length - 1]}`
        }

        var strImageKeyName = 'image'
        formdata.append(strImageKeyName, finalImageDetails);
        delete body['image']
    }

    Object.keys(body || {}).map(keyToCheck => {
        if (keyToCheck !== 'image') {
            if (keyToCheck === 'items') {
                let items = body.items
                delete body["items"]
                body.items = JSON.stringify(items)
            }
        }

    })
    body['user_timezone'] = CurrentTimeZone
    let encryptedData = aes.encrypt(JSON.stringify(body), key, {
        iv: iv,
        padding: padZeroPadding
    }).toString()



    formdata.append("encryptedData", encryptedData)
    formdata.append("isEncryptionActive", true)



    const finalParams = {
        method: methodType,
        body: formdata,
        headers: {
            Accept: "application/json",
            "Content-Type": "multipart/form-data",
            // 'timezone': CurrentTimeZone
            'user_timezone': CurrentTimeZone   //vikrant 23-07-21
        }
    }
    debugLog(' ::: url :::: ' + url)
    debugLog(' ::: finalParams :::: ' + JSON.stringify(finalParams))

    fetch(url, finalParams)
        .then(errorHandler)
        .then(response => response.json())
        .then(encrypted_json => {

            let json = undefined
            if (encrypted_json.isEncryptionActive)
                json = JSON.parse(base64.decode(encrypted_json.encryptedResponse))
            else
                json = encrypted_json

            if (json.status === 1) {
                responseSuccess(json);
            }
            else if (json.status === -1 || json.status === "-1") {
                if (!url.match(/login/)) {
                    showDialogue(json.message !== undefined && json.message.trim().length > 0
                        ? json.message
                        : strings('loginError'), "", [],
                        () => {
                            flushAllData(
                                _response => {

                                    // TAKE THE USER TO INITIAL SCREEN
                                    if (propsFromContainer !== undefined && propsFromContainer.navigation !== undefined) {
                                        propsFromContainer.navigation.popToTop()

                                        propsFromContainer.navigation.dispatch(
                                            CommonActions.reset({
                                                index:0,
                                                routes:[{name:  'splash'}]
                                            })
                                        )
                                        
                                    }
                                },
                                _error => { }
                            );
                        })
                } else {
                    responseError({ data: json || {}, message: json.message || strings('webServiceError') });
                }
            }
            else {
                responseError(json);
            }
        })
        .catch(err => {
            if (err == undefined) {

            }
            else if (err instanceof SyntaxError) {
                return responseError({ name: err.name, message: strings('webServiceError') })
            } else {
                return responseError(err)
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
                : strings('webServiceError');
        var error = new Error(errorMessage);
        error.response = response;
        return Promise.reject(error);
    }
};
