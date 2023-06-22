/* eslint-disable prettier/prettier */
import messaging from '@react-native-firebase/messaging';

export const checkFirebasePermission = async (onSuccessTokenRequest, onFailureTokenRequest) => {
    requestPermission(
        onSuccess => {
            getToken(onSuccessTokenRequest, onFailureTokenRequest)
        },
        onFailure => {
            onFailureTokenRequest(onFailure)
        }
    );
}

const getToken = async (onSuccess, onFailure) => {
    var fcmToken = await messaging().getToken();

    if (fcmToken !== "") {
        onSuccess(fcmToken)
    } else {
        onFailure(fcmToken)
    }
}



const requestPermission = async (onSuccessRequest, onFailureRequest) => {
    try {
        await messaging().requestPermission();
        // User has authorised
        getToken(onSuccessRequest, onFailureRequest)
    } catch (error) {
        // User has rejected permissions
        onFailureRequest(error)
    }
}

