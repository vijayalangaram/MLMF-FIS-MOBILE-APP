import { CommonActions } from '@react-navigation/native';
import React from 'react';
import { Image, Platform, StyleSheet, View } from 'react-native';
import * as RNFS from 'react-native-fs';
import I18n from 'i18n-js';
import { connect } from 'react-redux';
import XLSX from 'xlsx';
import Assets from '../assets';
import { setI18nConfig } from '../locales/i18n';
import {
  rememberLoginInRedux,
  saveAppUpdatePrompt,
  saveAppVersionInRedux,
  saveCMSPagesData,
  saveCountryDataInRedux,
  saveDistanceUnit,
  saveLanguageArrayInRedux,
  saveLanguageInRedux,
  saveMapKeyInRedux,
  saveOnlineStatus,
  saveUserDetailsInRedux,
} from '../redux/actions/User';
import {
  getLanguage,
  getUserLoginDetails,
  getUserStatus,
  saveServerTranslations,
} from '../utils/AsyncStorageHelper';
import {
  ASCII_TYPE,
  BINARY_TYPE,
  EXCEL_FILE_NAME,
  isRTLCheck,
  RESPONSE_SUCCESS,
} from '../utils/EDConstants';
import { netStatus } from '../utils/NetworkStatusConnection';
import {
  fetchDriverLanguage,
  getAPPVersionAPI,
  getCMSPageDetails,
  getCoutryCodeListAPI,
} from '../utils/ServiceManager';

class SplashContainer extends React.Component {
  constructor(props) {
    super(props);
  }

  /** DID MOUNT */
  async componentDidMount() {
    getUserStatus(
      onSuccessStatus => {
        if (onSuccessStatus !== undefined && onSuccessStatus !== null) {
          this.props.saveStatus(onSuccessStatus);
        }
      },
      onFailureStatus => { },
    );

    // MAINTAIN LANGUAGE SELECTION
    await getLanguage(
      languageSelected => {
        if (
          languageSelected !== undefined &&
          languageSelected !== null &&
          languageSelected !== ''
        )
          this.savedLanguage = languageSelected;
        var languageToSave = languageSelected || 'en';
        I18n.locale = languageToSave;
        setI18nConfig(languageToSave);
        this.props.saveLanguageRedux(languageToSave);
        //Fetch app languages

        this.fetchAppLanguage(languageToSave);
        // GET CMS PAGES
        this.getCMSDetails(languageToSave);
      },
      _err => {
        var languageToSave = 'en';
        I18n.locale = languageToSave;
        setI18nConfig(languageToSave);
        this.props.saveLanguageRedux(languageToSave);
        //Fetch app languages

        this.fetchAppLanguage(languageToSave);
        // GET CMS PAGES
        // this.getCMSDetails(languageToSave)
      },
    );
    this.fetchCountryCodes();
    this.fetchAppVersion();
    this.checkUserLogin();
  }

  //Fetch locale data from server
  fetchLocalsFromServer = EXCEL_FILE_URL => {
    RNFS.downloadFile({
      fromUrl: EXCEL_FILE_URL,
      toFile: RNFS.DocumentDirectoryPath + EXCEL_FILE_NAME,
    })
      .promise.then(res => {
        this.convertExcelToJson();
      })
      .catch(err => {
        console.log('FETCH ERROR :::', err);
      });
  };
  convertExcelToJson = () => {
    RNFS.readFile(RNFS.DocumentDirectoryPath + EXCEL_FILE_NAME, ASCII_TYPE)
      .then(res => {
        /* parse file */
        const wb = XLSX.read(res, { type: BINARY_TYPE });

        // {console.log("wb ::: ",wb)}

        /* convert driver worksheet to AOA */
        const wsname = wb.SheetNames[1];

        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

        let mainArray = [];
        let obj = [];
        data.map((e, index) => {
          let i = 0;
          while (i < e.length - 1) {
            obj[i] = {};
            let child_obj = {};
            child_obj[e[0]] = e[i + 1];
            obj[i] = child_obj;

            if (mainArray[i] === undefined) mainArray[i] = [];
            mainArray[i].push(obj[i]);
            i++;
            if (mainArray[i - 1].length == data.length) {
              mainArray[i - 1] = mainArray[i - 1].reduce(function (
                result,
                current,
              ) {
                return Object.assign(result, current);
              },
                {});
            }
          }
        });
        saveServerTranslations(
          mainArray,
          this.onServerTranslationsSuccess,
          this.onServerTranslationsFail,
        );
      })
      .catch(err => {
        console.log('error::', err);
      });
  };

  onServerTranslationsSuccess = () => {
    setI18nConfig();
  };
  onServerTranslationsFail = err => {
    console.log('ERROR ::::::', err);
  };

  //Navigate to home

  navigateToHome = () => {
    setTimeout(() => {
      this.props.navigation.dispatch(
        CommonActions.reset({
          index: 0,
          // homeRight for Arabic Root Navigator - HOME_SCREEN_DRAWER_RIGHT_FUNCTION
          // home for other languages - HOME_SCREEN_DRAWER_FUNCTION
          routes: [{ name: isRTLCheck() ? 'homeRight' : 'home' }],
        }),
      );
    }, 2000);
  };

  //Navigate to login

  navigateToLogin = () => {
    setTimeout(() => {
      this.props.navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'login' }],
        }),
      );
    }, 2000);
  };
  /**
   *
   * @param {weather user is logged in or not}
   */
  checkUserLogin() {
    getUserLoginDetails(
      userDetails => {
        this.props.saveUserDetails(userDetails);
        this.props.rememberLogin(true);
        this.navigateToHome();
        // this.fetchDriverLanguage(userDetails)
      },
      failure => {
        // this.getLanguageFromAsync();
        this.props.saveUserDetails(undefined);
        this.navigateToLogin();
      },
    );
  }

  /** CALL CMS API */
  getCMSDetails = selectedLanguage => {
    netStatus(isConnected => {
      if (isConnected) {
        let objCMSParams = {
          language_slug: selectedLanguage,
        };
        getCMSPageDetails(
          objCMSParams,
          this.onSucessGetCMSDetails,
          this.onFailureGetCMSDetails,
        );
      }
    });
  };

  onSucessGetCMSDetails = objCMSSuccessResponse => {
    if (
      objCMSSuccessResponse.data !== undefined &&
      objCMSSuccessResponse.data.cmsData !== undefined
    ) {
      this.props.saveCMSDetails(objCMSSuccessResponse.data.cmsData);
    }

    if (
      objCMSSuccessResponse.data !== undefined &&
      objCMSSuccessResponse.data.google_map_api_key != undefined &&
      objCMSSuccessResponse.data.google_map_api_key != null &&
      objCMSSuccessResponse.data.google_map_api_key != ''
    ) {
      this.props.saveMapKey(objCMSSuccessResponse.data.google_map_api_key);
    }
  };

  onFailureGetCMSDetails = objCMSFailureResponse => { };

  /** CALL FETCH LANGUAGE API */
  fetchAppLanguage = lan => {
    netStatus(isConnected => {
      if (isConnected) {
        let objCMSParams = {
          language_slug: lan,
        };
        fetchDriverLanguage(
          objCMSParams,
          this.onSucessFetchLanguage,
          this.onFailureFetchLanguage,
        );
      }
    });
  };

  onSucessFetchLanguage = onSucess => {
    if (
      onSucess.data !== undefined &&
      onSucess.data.status == RESPONSE_SUCCESS
    ) {
      this.props.saveLanguageArray(onSucess.data.language_list);

      if (
        onSucess.data.language_file !== undefined &&
        onSucess.data.language_file !== null
      ) {
        this.fetchLocalsFromServer(onSucess.data.language_file);
      }
      if (
        this.savedLanguage == undefined ||
        (this.savedLanguage == null && this.savedLanguage == '')
      ) {
        let lan = onSucess.data.default_language_slug || 'en';
        I18n.locale = lan;
        setI18nConfig(lan);
        this.props.saveLanguageRedux(lan);
        this.getCMSDetails(lan);
      }
      if (
        onSucess.data.use_mile !== undefined &&
        onSucess.data.use_mile !== null &&
        onSucess.data.use_mile !== ''
      ) {
        this.props.saveDistanceUnitInRedux(onSucess.data.use_mile);
      }
    }
  };

  onFailureFetchLanguage = onFailure => { };

  /** CALL FETCH COUNTRY CODE API */
  fetchCountryCodes = lan => {
    netStatus(isConnected => {
      if (isConnected) {
        getCoutryCodeListAPI({}, this.onSuccessHandler, this.onFailureHandler);
      }
    });
  };

  onSuccessHandler = onSuccess => {
    if (
      onSuccess.data !== undefined &&
      onSuccess.data !== null &&
      onSuccess.data.country_list.length !== 0
    ) {
      this.props.saveCountryCode(onSuccess.data.country_list);
    }
  };

  onFailureHandler = onFailure => { };

  /** CALL FETCH APP VERSION API */
  fetchAppVersion = () => {
    netStatus(isConnected => {
      if (isConnected) {
        let appParams = {
          language_slug: 'en',
          user_type: 'driver',
          platform: Platform.OS,
        };
        getAPPVersionAPI(
          appParams,
          this.onSuccessAppVersionHandler,
          this.onFailureAppVersionHandler,
        );
      }
    });
  };

  onSuccessAppVersionHandler = onSuccess => {
    if (
      onSuccess.data !== undefined &&
      onSuccess.data !== null &&
      onSuccess.data.status == RESPONSE_SUCCESS
    ) {
      this.props.saveAppVersion(onSuccess.data);
    }
  };

  onFailureAppVersionHandler = onFailure => { };

  render() {
    return (
      <View style={styles.mainContainer}>
        <Image source={Assets.bgHome} style={styles.backgroundImage} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
});

export default connect(
  state => {
    return {};
  },
  dispatch => {
    return {
      saveUserDetails: userObject => {
        dispatch(saveUserDetailsInRedux(userObject));
      },
      saveLanguageRedux: language => {
        dispatch(saveLanguageInRedux(language));
      },
      saveLanguageArray: language => {
        dispatch(saveLanguageArrayInRedux(language));
      },
      rememberLogin: data => {
        dispatch(rememberLoginInRedux(data));
      },
      saveCMSDetails: data => {
        dispatch(saveCMSPagesData(data));
      },
      saveStatus: dataStatus => {
        dispatch(saveOnlineStatus(dataStatus));
      },
      saveCountryCode: code => {
        dispatch(saveCountryDataInRedux(code));
      },
      saveAppVersion: code => {
        dispatch(saveAppVersionInRedux(code));
      },
      saveStatus: dataStatus => {
        dispatch(saveOnlineStatus(dataStatus));
      },
      saveMapKey: dataStatus => {
        dispatch(saveMapKeyInRedux(dataStatus));
      },
      saveDistanceUnitInRedux: dataStatus => {
        dispatch(saveDistanceUnit(dataStatus));
      },
    };
  },
)(SplashContainer);
