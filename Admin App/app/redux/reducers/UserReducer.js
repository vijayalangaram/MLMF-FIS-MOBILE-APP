import { TYPE_SAVE_LOGIN_DETAILS, TYPE_SAVE_LANGUAGE, SAVE_CMS_PAGES_DATA, TYPE_SAVE_LOGIN_FCM, SAVE_ALERT_DATA, TYPE_SAVE_LANGUAGE_ARRAY, TYPE_SAVE_CANCEL_REASON_LIST, TYPE_SAVE_REJECT_REASON_LIST, TYPE_SAVE_COUNTRY_DATA, SAVE_APP_VERSION, SAVE_PROMPT_STATUS, TYPE_SAVE_PRINTER, TYPE_SAVE_ADM_TOKEN, TYPE_SAVE_THERMAL_PRINTER } from "../actions/UserActions";

const initialStateUser = {
  // LOGIN DETAILS
  lan: "en",
  userDetails: {},
  isLoggedIn: false,
  arrayCMSData: [],
  alertData: {},
  countryData: [],
  updatePrompt:false,
  connectedPrinter : undefined,
  thermalPrinter : undefined
};

export function userOperations(state = initialStateUser, action) {
  switch (action.type) {

    case TYPE_SAVE_LOGIN_DETAILS: {
      return Object.assign({}, state, {
        userDetails: action.value,
        isLoggedIn:
          action.value !== undefined && action.value.Email !== undefined
      });
    }

    case TYPE_SAVE_LANGUAGE: {
      return Object.assign({}, state, {
        lan: action.value
      });
    }

    case TYPE_SAVE_LOGIN_FCM: {
      return Object.assign({}, state, {
        token: action.value
      });
    }

    case SAVE_CMS_PAGES_DATA: {
      return Object.assign({}, state, {
        arrayCMSData: (action.value)
      });
    }

    case SAVE_ALERT_DATA: {
      return Object.assign({}, state, {
        alertData: (action.value)
      });
    }

    case SAVE_APP_VERSION : {
      return Object.assign({}, state, {
          appVersion : (action.value)
      });
  }

  case SAVE_PROMPT_STATUS : {
      return Object.assign({}, state, {
          updatePrompt : (action.value)
      });
  }

    case TYPE_SAVE_LANGUAGE_ARRAY: {
      return Object.assign({}, state, {
        languageArray: (action.value)
      });
    }

    case TYPE_SAVE_CANCEL_REASON_LIST: {
      return Object.assign({}, state, {
        cancelReasonList: (action.value)
      });
    }

    case TYPE_SAVE_REJECT_REASON_LIST: {
      return Object.assign({}, state, {
        rejectReasonList: (action.value)
      });
    }

    case TYPE_SAVE_COUNTRY_DATA: {
      return Object.assign({}, state, {
        countryData: action.value
      });
    }

    case TYPE_SAVE_PRINTER: {
      return Object.assign({}, state, {
        connectedPrinter: action.value
      });
    }

    case TYPE_SAVE_THERMAL_PRINTER: {
      return Object.assign({}, state, {
        thermalPrinter: action.value
      });
    }

    case TYPE_SAVE_ADM_TOKEN: {
      return Object.assign({}, state, {
        admToken: action.value
      });
    }

    default:
      return state;
  }
}
