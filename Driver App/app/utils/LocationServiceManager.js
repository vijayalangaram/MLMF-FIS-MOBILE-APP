import Geolocation from "@react-native-community/geolocation";
import Geocoder from "react-native-geocoding";
import { strings } from "../locales/i18n";


export function getCurrentLocation(googleMapsAPIKey, onSucess, onFailure) {

    if (googleMapsAPIKey == undefined || googleMapsAPIKey == null) {
        // showDialogue('Please configure Google Maps API Key')
        onFailure({ data: {}, message: strings('webServiceError') })
        return;
    }

    Geocoder.init(googleMapsAPIKey);
    Geolocation.getCurrentPosition(
        position => {

            getAddress(position.coords.latitude, position.coords.longitude,
                onSuccess => {
                    var region = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        address: onSuccess
                    }
                    onSucess(region)
                },
                failure => {
                    onFailure(failure)
                })

        },
        error => {
            if (onFailure)
                onFailure(error);

        },
        { enableHighAccuracy: false, timeout: Number.MAX_SAFE_INTEGER, maximumAge: 1000 }
    )
}

export function getAddress(latitude, longitude, onSuccess, onFailure) {
    Geocoder.from(latitude, longitude)
        .then(json => {
            if (json.results.length !== 0) {
                var city = json.results[0].address_components.filter(
                    x =>
                        x.types.filter(t => t == "administrative_area_level_1").length > 0
                )

                if (city.length !== 0) {
                    city = city[0].long_name;
                } else {
                    city = ""
                }

                var pincode = json.results[0].address_components.filter(
                    x => x.types.filter(t => t == "postal_code").length > 0
                )

                if (pincode.length !== 0) {
                    pincode = pincode[0].short_name;
                } else {
                    pincode = ""
                }

                var addressComponent = json.results[0].formatted_address;

                var address = {
                    strAddress: addressComponent,
                    city: city,
                    zipCode: pincode
                }
                onSuccess(address)
            } else {
                onFailure()
            }
        })
}