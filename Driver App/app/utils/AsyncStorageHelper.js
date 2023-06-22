import AsyncStorage from '@react-native-async-storage/async-storage'

export function flushAllData(onSuccess, onFailure) {
  AsyncStorage.clear().then(
    success => onSuccess(success),
    err => onFailure(err),
  )
}

export function saveUserLoginDetails(details, onSuccess, onFailure) {
  AsyncStorage.setItem("UserDetails", JSON.stringify(details)).then(
    success => onSuccess(success),
    err => onFailure(err),
  )
}

export function getUserLoginDetails(onSuccess, onFailure) {
  AsyncStorage.getItem("UserDetails").then(
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
  AsyncStorage.removeItem("UserDetails").then(
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

export async function getLanguage(onSuccess, onFailure) {
  await AsyncStorage.getItem("lan").then(
    res => {
      onSuccess(JSON.parse(res));
    },
    error => {
      onFailure("error");
    }
  );
}

export function saveUserStatus(details, onSuccess, onFailure) {
  AsyncStorage.setItem("status", JSON.stringify(details)).then(
    success => onSuccess(success),
    err => onFailure(err)
  );
}

export function getUserStatus(onSuccess, onFailure) {
  AsyncStorage.getItem("status").then(
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
  ).catch(err => { }
  )
}

export async function getServerTranslationsFromAsync(onSuccess, onFailure) {
  await AsyncStorage.getItem("translations_from_server").then(
    onSuccess
  ).catch(onFailure)
}
