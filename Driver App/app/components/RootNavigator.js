import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import ChangePasswordContainer from '../containers/ChangePasswordContainer';
import CMSContainer from '../containers/CMSContainer';
import CurrentOrderContainerNew from '../containers/CurrentOrderContainerNew';
import HomeContainer from '../containers/HomeContainer';
import LoginContainer from '../containers/LoginContainer';
import MyEarningContainer from '../containers/MyEarningContainer';
import ProfileContainer from '../containers/ProfileContainer';
import SplashContainer from '../containers/SplashContainer';
import Sidebar from './SideBar';

const HOME_NAVIGATOR = createStackNavigator();
const RootNavigator = createStackNavigator()
const HOME_SCREEN_DRAWER = createDrawerNavigator()
const HOME_SCREEN_DRAWER_RIGHT = createDrawerNavigator()


// HOME SCREEN DRAWER NAVIGTOR INCLUDES  View Profile , Home , My Earning , Privacy Policy etc.
// HOME NAVIGATOR IS  STACK NAVIGATOR 
const HOME_NAVIGATOR_FUNCTION = ()=> {
    return (
      <HOME_NAVIGATOR.Navigator initialRouteName= 'HomeContainer'
        screenOptions={{ headerShown : false }}
      >
            <HOME_NAVIGATOR.Screen name="HomeContainer" component={ HomeContainer } />
            <HOME_NAVIGATOR.Screen name= "MyProfile" component={ ProfileContainer } />
            <HOME_NAVIGATOR.Screen name= "CurrentOrderContainer" component={ CurrentOrderContainerNew } />
            <HOME_NAVIGATOR.Screen name="changePassword" component={ ChangePasswordContainer } />
            <HOME_NAVIGATOR.Screen name="myEarningFromHome" component={ MyEarningContainer } />
        </HOME_NAVIGATOR.Navigator>
    );
  }

  // FOR ENGLISH , FRENCH ETC
  const HOME_SCREEN_DRAWER_FUNCTION  = ()=> {
    return (
        <HOME_SCREEN_DRAWER.Navigator initialRouteName = "Home" initialRouteParams = "Home" drawerLockMode= 'locked-closed'
            drawerContent={(props)=><Sidebar {...props}/>}
            screenOptions={{headerShown: false , drawerPosition : 'left', drawerType: 'front'}}
        >
          <HOME_SCREEN_DRAWER.Screen name="Home" component={HOME_NAVIGATOR_FUNCTION} />
          <HOME_SCREEN_DRAWER.Screen name="cms" component={CMSContainer} />
          <HOME_SCREEN_DRAWER.Screen name="myEarning" component={MyEarningContainer}  />
        </HOME_SCREEN_DRAWER.Navigator>
    );
  }
// FOR ARABIC
 const HOME_SCREEN_DRAWER_RIGHT_FUNCTION  = ()=>  {
    return (
      <HOME_SCREEN_DRAWER_RIGHT.Navigator initialRouteName = "Home" initialRouteParams = "Home" drawerLockMode= 'locked-closed'
      drawerContent={(props)=><Sidebar {...props}/>}
      screenOptions={{headerShown: false , drawerPosition : 'right',drawerType: 'front' }}
  >
        <HOME_SCREEN_DRAWER_RIGHT.Screen name="Home" component={HOME_NAVIGATOR_FUNCTION} />
        <HOME_SCREEN_DRAWER_RIGHT.Screen name="cms" component={CMSContainer} />
        <HOME_SCREEN_DRAWER_RIGHT.Screen name="myEarning" component={MyEarningContainer}  />
  </HOME_SCREEN_DRAWER_RIGHT.Navigator>
    );
  }

  // MAIN NAVIGATOR
const RootNavigator_FUNCTION  = ()=>  {
    return (
      
        <RootNavigator.Navigator  initialRouteName= 'splash' screenOptions={{headerShown:false}} >
          {/* Open Splash Screen  */}
          <RootNavigator.Screen name="splash" component={SplashContainer} /> 
          {/* Open Login Screen */}
          <RootNavigator.Screen name="login" component={LoginContainer} /> 
          {/* Open LEFT DRAWER NAVIGATOR */}
          <RootNavigator.Screen name="home" component={HOME_SCREEN_DRAWER_FUNCTION} /> 
          {/* Open RIGHT DRAWER NAVIGATOR = FOR ARABIC */}
          <RootNavigator.Screen name="homeRight" component={HOME_SCREEN_DRAWER_RIGHT_FUNCTION} /> 
        </RootNavigator.Navigator>
    );
  }
  
export default RootNavigator_FUNCTION ;

// export const HOME_NAVIGATOR = createStackNavigator(
//     {
//         HomeContainer: {
//             screen: HomeContainer,
//         },
//         MyProfile: {
//             screen: ProfileContainer
//         },
//         CurrentOrderContainer: {
//             screen: CurrentOrderContainerNew
//         },
//         changePassword: {
//             screen: ChangePasswordContainer
//         },
//         myEarningFromHome: {
//             screen: MyEarningContainer
//         }

//     },
//     {
//         initialRouteName: 'HomeContainer',
//         headerMode: 'none',
//     },
// )

// export const HOME_SCREEN_DRAWER = createDrawerNavigator(
//     {

//         Home: {
//             screen: HOME_NAVIGATOR
//         },
//         cms: {
//             screen: CMSContainer
//         },
//         myEarning: {
//             screen: MyEarningContainer
//         }
//     },
//     {
//         initialRouteName: 'Home',
//         initialRouteParams: 'Home',
//         contentComponent: Sidebar,
//         drawerLockMode: 'locked-closed',
//         drawerPosition: 'left'
//     }
// );

// export const HOME_SCREEN_DRAWER_RIGHT = createDrawerNavigator(
//     {

//         Home: {
//             screen: HOME_NAVIGATOR
//         },
//         cms: {
//             screen: CMSContainer
//         },
//         myEarning: {
//             screen: MyEarningContainer
//         }
//     },
//     {
//         initialRouteName: 'Home',
//         initialRouteParams: 'Home',
//         contentComponent: Sidebar,
//         drawerLockMode: 'locked-closed',
//         drawerPosition: 'right'
//     }
// );


// const RootNavigator = createStackNavigator(
//     {
//         splash: {
//             screen: SplashContainer,
//         },
//         login: {
//             screen: LoginContainer
//         },

//         home: {
//             screen: HOME_SCREEN_DRAWER
//         },
//         homeRight: {
//             screen: HOME_SCREEN_DRAWER_RIGHT
//         }
//     },
//     {
//         initialRouteName: 'splash',
//         headerMode: 'none',
//     },
// )

// export const AppNavigator = createAppContainer(withNavigation(RootNavigator))
