import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeys } from './EDConstants';

export function flushAllData(onSuccess, onFailure) {
  AsyncStorage.clear().then(
    success => onSuccess(success),
    err => onFailure(err),
  )
}

export function saveUserLoginDetails(details, onSuccess, onFailure) {
  AsyncStorage.setItem(StorageKeys.userDetails, JSON.stringify(details)).then(
    success => onSuccess(success),
    err => onFailure(err),
  )
}

export function getUserLoginDetails(onSuccess, onFailure) {
  AsyncStorage.getItem(StorageKeys.userDetails).then(
    res => {
      if (res != '' && res != null && res != undefined) {
        onSuccess(JSON.parse(res))
      } else {
        onFailure('Token Null')
      }
    },
    err => onFailure(err),
  )
}



export function clearLogin(onSuccess, onError) {
  AsyncStorage.removeItem(StorageKeys.userDetails).then(
    response => {
      onSuccess(response);
    },
    error => {
      onError(error);
    }
  );
}


export function saveLanguage(lan, onSuccess, onFailure) {
  AsyncStorage.setItem("lan", JSON.stringify(lan)).then(
    success => {
      onSuccess(success);
    },
    error => {
      onFailure(error);
    }
  );
}

export function getLanguage(onSuccess, onFailure) {
  AsyncStorage.getItem("lan").then(
    res => {
      onSuccess(JSON.parse(res));
    },
    error => {
      onFailure("error");
    }
  );
}

export function saveServerTranslations(data, onSuccess, onFailure) {
  AsyncStorage.setItem("translations_from_server", JSON.stringify(data)).then(
    onSuccess()
  ).catch(err => { })
}

export async function getServerTranslationsFromAsync(onSuccess, onFailure) {
  await AsyncStorage.getItem("translations_from_server").then(
    onSuccess
  ).catch(onFailure)
}


export function saveConnectedDevice(data, onSuccess, onFailure) {
  AsyncStorage.setItem("device_detail", JSON.stringify(data)).then(
    onSuccess()
  ).catch(err => { })
}

export async function getConnectedDevice(onSuccess, onFailure) {
  await AsyncStorage.getItem("device_detail").then(
    device_detail => {
      if (device_detail !== undefined && device_detail !== null)
        onSuccess(JSON.parse(device_detail))
      else
        onFailure
    }
  ).catch(onFailure)
}

