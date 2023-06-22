// import { createStackNavigator } from 'react-navigation-stack'
// import { createAppContainer } from 'react-navigation'
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import SplashContainer from '../containers/SplashContainer';
import LoginContainer from '../containers/LoginContainer';
import HomeContainer from '../containers/HomeContainer';
// import { createDrawerNavigator } from 'react-navigation-drawer'
import SideBar from './SideBar';
import MyOrderDetailContainer from '../containers/MyOrderDetailContainer';
import ChangePasswordContainer from '../containers/ChangePasswordContainer';
import OrderDetailsContainer from '../containers/OrderDetailsContainer';
import AccountContainer from '../containers/AccountContainer';
import EditProfileContainer from '../containers/EditProfileContainer';
import CMSContainer from '../containers/CMSContainer';
import FilterContainer from '../containers/FilterContainer';
import RestaurantListContainer from '../containers/RestaurantListContainer';
import { ModeUpdateContainer } from '../containers/ModeUpdateContainer';
const HOME_STACK_CONTAINER = createStackNavigator();
const RESTAURANT_STACK_NAVIGATOR = createStackNavigator();
const ACCOUNT_NAVIGATOR = createStackNavigator();
const ORDER_NAVIGATOR = createStackNavigator();
const HOME_SCREEN_DRAWER = createDrawerNavigator();
const HOME_SCREEN_DRAWER_RIGHT = createDrawerNavigator();

const APP_NAVIGATOR = createStackNavigator();

const HOME_STACK_CONTAINER_FUNCTION = () => {
    return(
        <HOME_STACK_CONTAINER.Navigator initialRouteName = "homeContainer" screenOptions = {{ headerShown: false }} >
            <HOME_STACK_CONTAINER.Screen name= "homeContainer" component= { HomeContainer } />
            <HOME_STACK_CONTAINER.Screen name= "orderDetails" component= { OrderDetailsContainer } />
            <HOME_STACK_CONTAINER.Screen name= "restaurantFromHome" component= { RESTAURANT_STACK_NAVIGATOR_FUNCTION } />
        </HOME_STACK_CONTAINER.Navigator>
    )
}

const RESTAURANT_STACK_NAVIGATOR_FUNCTION = () => {
    return(
        <RESTAURANT_STACK_NAVIGATOR.Navigator initialRouteName = "restaurantList" screenOptions = {{ headerShown: false }} >
            <RESTAURANT_STACK_NAVIGATOR.Screen name= "restaurantList" component= { RestaurantListContainer } />
            <RESTAURANT_STACK_NAVIGATOR.Screen name= "modeUpdate" component= { ModeUpdateContainer } />
        </RESTAURANT_STACK_NAVIGATOR.Navigator>
    )
}

const ACCOUNT_NAVIGATOR_FUNCTION = () => {
    return(
        <ACCOUNT_NAVIGATOR.Navigator initialRouteName = "accountScreen" screenOptions = {{ headerShown: false }} >
            <ACCOUNT_NAVIGATOR.Screen name = "accountScreen" component={ AccountContainer } />
            <ACCOUNT_NAVIGATOR.Screen name = "changePassword" component={ ChangePasswordContainer } />
            <ACCOUNT_NAVIGATOR.Screen name = "editProfile" component={ EditProfileContainer } />
        </ACCOUNT_NAVIGATOR.Navigator>
    )
}

const ORDER_NAVIGATOR_FUNCTION = () => {
    return(
        <ORDER_NAVIGATOR.Navigator initialRouteName = "pastOrder" screenOptions = {{ headerShown: false }} >
            <ORDER_NAVIGATOR.Screen name = "pastOrder" component = { MyOrderDetailContainer } />
            <ORDER_NAVIGATOR.Screen name = "orderDetails" component = { OrderDetailsContainer } />
            <ORDER_NAVIGATOR.Screen name = "filter" component = { FilterContainer } />
        </ORDER_NAVIGATOR.Navigator>
    )
}

const HOME_SCREEN_DRAWER_FUNCTION = () => {
    return(
        <HOME_SCREEN_DRAWER.Navigator initialRouteName = "Home" drawerContent={(props) => <SideBar {...props}/>} screenOptions = {{ headerShown: false, drawerPosition: "left", drawerType: 'front'  }} >
            <HOME_SCREEN_DRAWER.Screen name = "Home" component = { HOME_STACK_CONTAINER_FUNCTION } />
            <HOME_SCREEN_DRAWER.Screen name = "account" component = { ACCOUNT_NAVIGATOR_FUNCTION } />
            <HOME_SCREEN_DRAWER.Screen name = "cms" component = { CMSContainer } />
            <HOME_SCREEN_DRAWER.Screen name = "Order" component = { ORDER_NAVIGATOR_FUNCTION } />
            <HOME_SCREEN_DRAWER_RIGHT.Screen name = "Restaurant" component = { RESTAURANT_STACK_NAVIGATOR_FUNCTION } />
            <HOME_SCREEN_DRAWER.Screen name = "changePassword" component = { ChangePasswordContainer } />
        </HOME_SCREEN_DRAWER.Navigator>
    )
}

const HOME_SCREEN_DRAWER_RIGHT_FUNCTION = () => {
    return(
        <HOME_SCREEN_DRAWER_RIGHT.Navigator initialRouteName = "Home" drawerContent={(props) => <SideBar {...props}/>} screenOptions = {{ headerShown: false, drawerPosition: "right", drawerType: 'front'  }} >
            <HOME_SCREEN_DRAWER_RIGHT.Screen name = "Home" component = { HOME_STACK_CONTAINER_FUNCTION } />
            <HOME_SCREEN_DRAWER_RIGHT.Screen name = "account" component = { ACCOUNT_NAVIGATOR_FUNCTION } />
            <HOME_SCREEN_DRAWER_RIGHT.Screen name = "cms" component = { CMSContainer } />
            <HOME_SCREEN_DRAWER_RIGHT.Screen name = "Order" component = { ORDER_NAVIGATOR_FUNCTION } />
            <HOME_SCREEN_DRAWER_RIGHT.Screen name = "Restaurant" component = { RESTAURANT_STACK_NAVIGATOR_FUNCTION } />
            <HOME_SCREEN_DRAWER_RIGHT.Screen name = "changePassword" component = { ChangePasswordContainer } />
        </HOME_SCREEN_DRAWER_RIGHT.Navigator>
    )
}

const AppNavigator = () => {
    return(
        <APP_NAVIGATOR.Navigator initialRouteName = "splash" screenOptions = {{ headerShown: false }} >
            <APP_NAVIGATOR.Screen name = "splash" component = { SplashContainer } />
            <APP_NAVIGATOR.Screen name = "login" component = { LoginContainer } />
            <APP_NAVIGATOR.Screen name = "home" component = { HOME_SCREEN_DRAWER_FUNCTION } />
            <APP_NAVIGATOR.Screen name = "homeRight" component = { HOME_SCREEN_DRAWER_RIGHT_FUNCTION } />
            <APP_NAVIGATOR.Screen name = "editProfileFromSideMenu" component = { EditProfileContainer } />
        </APP_NAVIGATOR.Navigator>
    )
}

export default AppNavigator;

