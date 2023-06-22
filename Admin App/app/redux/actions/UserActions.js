
export const TYPE_SAVE_LOGIN_DETAILS = "TYPE_SAVE_LOGIN_DETAILS"
export function saveUserDetailsInRedux(details) {
    return {
        type: TYPE_SAVE_LOGIN_DETAILS,
        value: details
    }
}

export const TYPE_SAVE_LANGUAGE = "TYPE_SAVE_LANGUAGE";
export function saveLanguageInRedux(data) {
    return {
        type: TYPE_SAVE_LANGUAGE,
        value: data
    };
}

export const TYPE_SAVE_LOGIN_FCM = "TYPE_SAVE_LOGIN_FCM"
export function saveUserFCMInRedux(details) {
    return {
        type: TYPE_SAVE_LOGIN_FCM,
        value: details
    }
}

export const SAVE_CMS_PAGES_DATA = "SAVE_CMS_PAGES_DATA";
export function saveCMSPagesData(data) {
    return {
        type: SAVE_CMS_PAGES_DATA,
        value: data
    };
}


export const SAVE_PROMPT_STATUS  = "SAVE_PROMPT_STATUS";
export function savePromptStatus(data) {
    return {
        type: SAVE_PROMPT_STATUS ,
        value: data
    };
}

export const SAVE_APP_VERSION  = "SAVE_APP_VERSION";
export function saveAppVersion(data) {
    return {
        type: SAVE_APP_VERSION ,
        value: data
    };
}

export const SAVE_ALERT_DATA = "SAVE_ALERT_DATA";
export function saveAlertData(data) {
    return {
        type: SAVE_ALERT_DATA,
        value: data
    };
}

export const TYPE_SAVE_LANGUAGE_ARRAY = "TYPE_SAVE_LANGUAGE_ARRAY";
export function saveLanguageArrayInRedux(data) {
    return {
        type: TYPE_SAVE_LANGUAGE_ARRAY,
        value: data
    };
}

export const TYPE_SAVE_CANCEL_REASON_LIST = "TYPE_SAVE_CANCEL_REASON_LIST";
export function saveCancelReasonListInRedux(data) {
    return {
        type: TYPE_SAVE_CANCEL_REASON_LIST,
        value: data
    };
}

export const TYPE_SAVE_REJECT_REASON_LIST = "TYPE_SAVE_REJECT_REASON_LIST";
export function saveRejectReasonListInRedux(data) {
    return {
        type: TYPE_SAVE_REJECT_REASON_LIST,
        value: data
    };
}

export const TYPE_SAVE_COUNTRY_DATA = "TYPE_SAVE_COUNTRY_DATA";
export function saveCountryDataInRedux(data) {
    return {
        type: TYPE_SAVE_COUNTRY_DATA,
        value: data
    };
}

export const TYPE_SAVE_PRINTER = "TYPE_SAVE_PRINTER";
export function savePrinterInRedux(data) {
    return {
        type: TYPE_SAVE_PRINTER,
        value: data
    };
}

export const TYPE_SAVE_THERMAL_PRINTER = "TYPE_SAVE_THERMAL_PRINTER";
export function saveThermalPrinterInRedux(data) {
    return {
        type: TYPE_SAVE_THERMAL_PRINTER,
        value: data
    };
}

export const TYPE_SAVE_ADM_TOKEN = "TYPE_SAVE_ADM_TOKEN";
export function saveADMToken(data) {
    return {
        type: TYPE_SAVE_ADM_TOKEN,
        value: data
    };
}