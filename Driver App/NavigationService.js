// It is used when we have to navigate to a screen from a file which is not in our Root navigator
// We have used it in our App.js file.
import { CommonActions } from "@react-navigation/native";

let _navigator;

function setTopLevelNavigator(navigatorRef) {

  _navigator = navigatorRef;
}

function navigate(routeName, param) {
  if (_navigator !== undefined && _navigator !== null)
    setTimeout(() => {
      _navigator.dispatch(
        CommonActions.reset({
          index : 0 , 
          key : null , 
          routes : [{name: routeName , params: param }]
        })
        );
    }, 100)
}

function getCurrentRoute() {
  return _navigator.getCurrentRoute().name
}



// add other navigation functions that you need and export them

export default {
  navigate,
  setTopLevelNavigator,
  getCurrentRoute

  // navigateToSpecificRoute
};
