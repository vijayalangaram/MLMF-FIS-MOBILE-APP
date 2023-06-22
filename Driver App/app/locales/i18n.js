import ReactNative from "react-native";
import { default as i18n, default as I18n } from "i18n-js";
import memoize from "lodash.memoize"; // Use for caching/memoize for better performance
import { getServerTranslationsFromAsync } from "../utils/AsyncStorageHelper";

const getLocalTranslations = {
    // lazy requires (metro bundler does not support symlinks)

    en: () => require("./en.json"),
    fr: () => require("./fr.json"),
    ar: () => require("./ar.json")
}

export const getServerTranslations = async (lan) => {
    // lazy requires (metro bundler does not support symlinks)
    let temp = undefined

   await getServerTranslationsFromAsync(
      value => {
                if
                    (value !== undefined &&
                    value !== null &&
                    value !== 0) {
                    JSON.parse(value).map(data => {
                        if (data.key === lan)
                            temp = data
                    })
                }
            },
            error=>{}
    )
    return temp
}

export const strings = memoize(
    (key, config) => i18n.t(key, config),
    (key, config) => (config ? key + JSON.stringify(config) : key)
)

// Is it a RTL language?
export const isRTL = I18n.currentLocale().indexOf('ar') === 0;

export var currentLocale = I18n.currentLocale();
currentLocale = "en"
i18n.locale = currentLocale


// Allow RTL alignment in RTL languages
ReactNative.I18nManager.allowRTL(isRTL);

export const setI18nConfig = (lan) => {

    // clear translation cache
    strings.cache.clear()

    // set i18n-js config
    const languageTag = lan !== undefined && lan !== null && lan !== "" ? lan : I18n.currentLocale()
    i18n.translations = { [languageTag]: getLocalTranslations[languageTag]() };
    
    getServerTranslations(languageTag).then(value => {
        if (value !== undefined && value !== null){
            i18n.translations = {
                [languageTag]: value
            }
        }
        else{
            i18n.translations = { [languageTag]: getLocalTranslations[languageTag]() };
        }
    }

    )

    i18n.locale = languageTag

}

export default I18n;