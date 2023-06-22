import React from 'react';
import { View, ImageBackground, StyleSheet, Animated } from 'react-native';
import Assets from '../assets';
// import { StackActions, NavigationActions } from 'react-navigation'
import { CommonActions } from "@react-navigation/native";
import { getUserLoginDetails, getLanguage, saveServerTranslations } from '../utils/AsyncStorageHelper';
import { connect } from 'react-redux';
import { debugLog, isRTLCheck, RESPONSE_SUCCESS } from '../utils/EDConstants';
import { saveUserDetailsInRedux, saveLanguageInRedux, saveCMSPagesData, saveLanguageArrayInRedux, saveCancelReasonListInRedux, saveRejectReasonListInRedux, saveCountryDataInRedux, saveAppVersion } from '../redux/actions/UserActions';
import I18n from "i18n-js";
import { netStatus } from '../utils/NetworkStatusConnection';
import { getCMSPageDetails, fetchLanguageArray, fetchReasonList, fetchCountryCodes, getAPPVersionAPI } from '../utils/ServiceManager'
import Metrics from '../utils/metrics';
import { setI18nConfig } from '../locales/i18n';
import XLSX from 'xlsx';
import * as RNFS from 'react-native-fs';

class SplashContainer extends React.Component {
    //#region LIFE CYCLE METHODS

    constructor(props) {
        super(props)
    }

    state = {
        isVisible: false,
        bounceValue: new Animated.Value(Metrics.actualScreenHeight),
        isLoading: false,
    }

    /** DID MOUNT */
    componentDidMount() {
        // this.getFromServer();
        this.fetchAppVersion();
        // MAINTAIN LANGUAGE SELECTION
        getLanguage(languageSelected => {
            if (languageSelected !== undefined && languageSelected !== null && languageSelected !== "")
            this.savedLanguage = languageSelected
            var languageToSave = languageSelected || 'en'
            I18n.locale = languageToSave
            setI18nConfig(languageToSave)
            this.props.saveLanguageRedux(languageToSave)

            //FETCH LANGUAGE ARRAY
            this.fetchLanguageArray(languageToSave)
            // this.getFromServer();


            //FETCH CANCEL REASON LIST
            this.fetchCancelReasonList(languageToSave)

            //FETCH REJECT REASON LIST
            this.fetchRejectReasonList(languageToSave)

            // FETCH COUNTRY CODES
            this.fetchCountryCodes(languageToSave)

            // GET CMS PAGES
            this.getCMSDetails(languageToSave) //TO DO

        },
            _err => {
                var languageToSave = 'en'
                I18n.locale = languageToSave
                setI18nConfig(languageToSave)
                this.props.saveLanguageRedux(languageToSave)

                //FETCH LANGUAGE ARRAY
                this.fetchLanguageArray(languageToSave)
                // this.getFromServer();

                //FETCH CANCEL REASON LIST
             //   this.fetchCancelReasonList(languageToSave)

                //FETCH REJECT REASON LIST
             //   this.fetchRejectReasonList(languageToSave)

                // FETCH COUNTRY CODES
                this.fetchCountryCodes(languageToSave)

                // GET CMS PAGES
               // this.getCMSDetails(languageToSave) //TO DO
            })
        this.checkUserLogin()
    }

    //Fetch locale data from server
    async getFromServer (locales_url) {
        // // console.log("LOCALES URL:::::::::: ", locales_url)
        if(locales_url != undefined && locales_url != null && locales_url != ""){
            await RNFS.downloadFile({
                fromUrl: locales_url,
                toFile: `${RNFS.DocumentDirectoryPath}/translations.xlsx`,
            }).promise.then((res) => {
            
                // // console.log('The file saved to ', res)
                this.convertExcelToJson()
            
            }).catch(
                err => {
                    setI18nConfig()
                    // // console.log("FETCH ERROR :::", err)
                    // this.checkUserLogin()
                }
            )
        } else {
            setI18nConfig()
            // this.checkUserLogin()
        }
    }

    convertExcelToJson = async () => {
        await RNFS.readFile(RNFS.DocumentDirectoryPath + "/translations.xlsx", 'ascii').then((res) => {
            /* parse file */
            const wb = XLSX.read(res, { type: 'binary' });

            /* convert first worksheet to AOA */
            const wsname = wb.SheetNames[2];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
            // // console.log("DATA ::::::", RNFS.DocumentDirectoryPath, data)
            let mainArray = []
            let obj = []
            data.map((e, index) => {

                let i = 0
                while (i < e.length - 1) {
                    obj[i] = {}
                    let child_obj = {}
                    child_obj[e[0]] = e[i + 1]
                    obj[i] = child_obj

                    if (mainArray[i] === undefined)
                        mainArray[i] = []
                    mainArray[i].push(obj[i])
                    i++;
                    if (mainArray[i - 1].length == data.length) {
                        mainArray[i - 1] = mainArray[i - 1].reduce(function (result, current) {
                            return Object.assign(result, current);
                        }, {});
                    }
                }
            })

            // // console.log("FINAL ARRAY ::::::", mainArray)
            saveServerTranslations(mainArray, this.onSaveTranslationsSuccess , this.onSaveTranslationFail)
        }).catch((err) => { debugLog("Conversion Error", "Error " + err.message); });
        // this.checkUserLogin()

    }

    onSaveTranslationsSuccess=()=>{
        setI18nConfig()
    }
    onSaveTranslationFail=(err)=>{
        setI18nConfig()
        // // console.log("ERROR ::::::", err)
    }

     /** CALL FETCH APP VERSION API */
     fetchAppVersion = () => {
        netStatus(isConnected => {
            if (isConnected) {
                let appParams = {
                    language_slug: "en",
                    user_type: "admin",
                    platform: Platform.OS
                }
                getAPPVersionAPI(appParams, this.onSuccessAppVersionHandler, this.onFailureAppVersionHandler)
            }
        })
    }


    onSuccessAppVersionHandler = (onSuccess) => {
        if (onSuccess.data !== undefined && onSuccess.data !== null && onSuccess.data.status == RESPONSE_SUCCESS) {
            this.props.saveAppVersionInRedux(onSuccess.data)
        }
    }

    onFailureAppVersionHandler = (onFailure) => {
    }


    // CALL LANGUAGE ARRAY API
    fetchLanguageArray = (selectedLanguage) => {
        netStatus(isConnected => {
            // console.log("IS CONNECTED:::::::: ", isConnected)
            if (isConnected) {
                let objLangArrayParams = {
                    language_slug: selectedLanguage
                }
                fetchLanguageArray(objLangArrayParams, this.onSuccessLanguageArray, this.onFailureLanguageArray)
            } else {
                // console.log("NET NOT CONNECTED:::: ")
                this.getFromServer()
            }
        })
    }

    onSuccessLanguageArray = (onSuccess) => {
        if(onSuccess.data != undefined && onSuccess.data.status == RESPONSE_SUCCESS) {
            // console.log("ONSUCCESS LANGUAGE:::", onSuccess)
            
            // this.locales_url = onSuccess.data.language_file
            this.props.saveLanguageArray(onSuccess.data.language_list)

            if( onSuccess.data.language_file !== undefined && onSuccess.data.language_file !== null ){
                this.getFromServer(onSuccess.data.language_file)
            }

            if (this.savedLanguage == undefined || this.savedLanguage == null && this.savedLanguage == "") {
                let lan = onSuccess.data.default_language_slug || "en"
                I18n.locale = lan
                setI18nConfig(lan)
                this.props.saveLanguageRedux(lan);
                this.getCMSDetails(lan)

                //FETCH REJECT REASON LIST
                this.fetchRejectReasonList(lan)

                this.fetchCancelReasonList(languageToSave)
            }
            // this.getFromServer();
        }
    }

    onFailureLanguageArray = (onFailure) => {
        // this.getFromServer();
    }

    // CALL CANCEL REASON LIST API
    fetchCancelReasonList = (selectedLanguage) => {
        netStatus(isConnected => {
            if (isConnected) {
                let objLangArrayParams = {
                    language_slug: selectedLanguage,
                    reason_type: "cancel",
                    user_type : "Admin"
                }
                fetchReasonList(objLangArrayParams, this.onSuccessCancelReasonList, this.onFailureCancelReasonList)
            }
        })
    }

    onSuccessCancelReasonList = (onSuccess) => {
        // console.log('---------------------------------------------' , onSuccess)
        if(onSuccess.data != undefined && onSuccess.data.status == RESPONSE_SUCCESS) {
            this.props.saveCancelReasonList(onSuccess.data.reason_list)
        }
    }

    onFailureCancelReasonList = (onFailure) => {

    }

    // CALL CANCEL REASON LIST API
    fetchRejectReasonList = (selectedLanguage) => {
        netStatus(isConnected => {
            if (isConnected) {
                let objLangArrayParams = {
                    language_slug: selectedLanguage,
                    reason_type: "reject",
                    user_type : "Admin"
                }
                fetchReasonList(objLangArrayParams, this.onSuccessRejectReasonList, this.onFailureRejectReasonList)
            }
        })
    }

    onSuccessRejectReasonList = (onSuccess) => {
        // console.log('---------------------------------------------' , onSuccess)
        if(onSuccess.data != undefined && onSuccess.data.status == RESPONSE_SUCCESS) {
            this.props.saveRejectReasonList(onSuccess.data.reason_list)
        }
    }

    onFailureRejectReasonList = (onFailure) => {

    }

    fetchCountryCodes = (selectedLanguage) => {
        netStatus(isConnected => {
            if (isConnected) {
                let objCountryCodeParams ={
                    language_slug: selectedLanguage
                }
                fetchCountryCodes(objCountryCodeParams, this.onSuccessCountryCodesList, this.onFailureCountryCodesList)
            }
        })
    }

    onSuccessCountryCodesList = (onSuccess) => {
        // console.log("COUNTRY CODE DATA:::::::: ", onSuccess)
        if (onSuccess.data !== undefined && onSuccess.data !== null && onSuccess.data.country_list.length !== 0) {
            // let country_symbols = []
            // onSuccess.data.country_list.map(data => {
            //     country_symbols.push(data.iso)
            // })
            this.props.saveCountryCode(onSuccess.data.country_list)
        }
    }

    onFailureCountryCodesList = (onFailure) => {
        
    }

    /** CALL CMS API */
    getCMSDetails = (selectedLanguage) => {
        netStatus(isConnected => {
            if (isConnected) {
                let objCMSParams = {
                    language_slug: selectedLanguage,
                }
                getCMSPageDetails(objCMSParams, this.onSucessGetCMSDetails, this.onFailureGetCMSDetails)
            }
        })
    }

    onSucessGetCMSDetails = (objCMSSuccessResponse) => {
        if (objCMSSuccessResponse.data !== undefined && objCMSSuccessResponse.data.cmsData !== undefined) {
            this.props.saveCMSDetails(objCMSSuccessResponse.data.cmsData)
        }
    }

    onFailureGetCMSDetails = (objCMSFailureResponse) => {

    }

    /**
     * RENDER METHOD
     */
    render() {
        return (
            <View style={styles.mainViewStyle}>
                <ImageBackground
                    source={Assets.bgHome}
                    style={styles.mainViewStyle}
                    resizeMode={'cover'}
                > 
                </ImageBackground>
            </View>
        )
    }
    //#endregion

    /** TOGGLE ANIMATION VIEW */
    _toggleSubview() {
        Animated.spring(this.state.bounceValue, { toValue: 0, velocity: 3, tension: 2, friction: 8, useNativeDriver: true }).start();
    }

    //#region BUTTON PRESS EVENTS
    /** 
     * 
     */
     _onPressSignIn = (byEmail) => {
        this.props.navigation.navigate("login", { useEmail: byEmail == true })
    }

    //Navigate to home


    navigateToHome = () => {
        setTimeout(() => {
            this.props.navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: isRTLCheck() ? 'homeRight' : 'home' }]
                    // actions: [NavigationActions.navigate({ routeName: isRTLCheck() ? 'homeRight' : 'home' })],
                }),
            )

        }, 3000)
    }

    //Navigate to login 

    navigateToLogin = () => {
        setTimeout(() => {
            this.props.navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'login' }]
                    // actions: [NavigationActions.navigate({ routeName: 'login' })],
                }),
            )
        }, 3000)
    }
    /**
     *
     * @param {weather user is logged in or not}
     */
    checkUserLogin() {
        getUserLoginDetails(
            userDetails => {
                this.props.saveUserDetails(userDetails)
                this.navigateToHome();

            },
            failure => {
                this.props.saveUserDetails(undefined)
                this.navigateToLogin();

            },
        )
    }
}

//#region STYLES
export const styles = StyleSheet.create({
    mainViewStyle: {
        flex: 1,
        height: Metrics.actualScreenHeight,
        width: Metrics.actualScreenWidth
    },
    buttonViewStyle: {
        flex: 1,
        justifyContent: 'flex-end',
        marginBottom: 50
    }
});
//#endregion

/** REDUX CONNECT */
export default connect(
    state => {
        return {}
    },
    dispatch => {
        return {
            saveUserDetails: userData => {
                dispatch(saveUserDetailsInRedux(userData))
            },
            saveLanguageRedux: userLan => {
                dispatch(saveLanguageInRedux(userLan))
            },
            saveAppVersionInRedux: data => {
                dispatch(saveAppVersion(data))
            },
            saveCMSDetails: cmsDetails => {
                dispatch(saveCMSPagesData(cmsDetails))
            },
            saveLanguageArray: language => {
                dispatch(saveLanguageArrayInRedux(language));
            },
            saveCancelReasonList: cancelReasonList => {
                dispatch(saveCancelReasonListInRedux(cancelReasonList));
            },
            saveRejectReasonList: rejectReasonList => {
                dispatch(saveRejectReasonListInRedux(rejectReasonList));
            },
            saveCountryCode: countryData => {
                dispatch(saveCountryDataInRedux(countryData));
            },
        }
    },
)(SplashContainer)
