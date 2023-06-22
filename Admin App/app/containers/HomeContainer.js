/* eslint-disable radix */
/* eslint-disable no-return-assign */
/* eslint-disable quotes */
/* eslint-disable no-trailing-spaces */
/* eslint-disable semi */
/* eslint-disable prettier/prettier */
import React from 'react';
import { AppState, Linking, Platform, RefreshControl, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import deviceInfoModule from 'react-native-device-info';
import { heightPercentageToDP } from 'react-native-responsive-screen';
import { connect } from 'react-redux';
import Context from '../../Context';
import CancelReasonsList from "../components/CancelReasonsList";
import EDOrdersFlatList from '../components/EDOrdersFlatList';
import EDPlaceholderComponent from '../components/EDPlaceholderComponent';
import EDPopupView from '../components/EDPopupView';
import EDRefundAlert from '../components/EDRefundAlert';
import EDTopTabBar from '../components/EDTopTabBar';
import NavigationEvents from '../components/NavigationEvents';
import { strings } from '../locales/i18n';
import { saveNavigationSelection } from '../redux/actions/Navigation';
import { saveUserFCMInRedux } from '../redux/actions/UserActions';
import { showDialogue, showNoInternetAlert, showTopDialogue } from '../utils/EDAlert';
import { EDColors } from '../utils/EDColors';
import { debugLog, PAGE_COUNT, RESPONSE_SUCCESS } from '../utils/EDConstants';
import { EDFonts } from '../utils/EDFontConstants';
import { checkFirebasePermission } from '../utils/FirebaseServices';
import Metrics from '../utils/metrics';
import { netStatus } from '../utils/NetworkStatusConnection';
import { requestNotificationPermission } from '../utils/PermissionManager';
import { acceptNRejectOrderAPI, changeTOKEN, getOrderDetail, initiateRefundAPI } from '../utils/ServiceManager';
import BaseContainer from './BaseContainer';

class HomeContainer extends React.PureComponent {
    //#region LIFE CYCLE METHODS

    static contextType = Context
    /** CONSTRUCTOR */
    constructor(props) {
        super(props);

        this.scrollViewOrders = null;
        this.strNewOrdersTitle = '';
        this.strNewOrdersSubtitle = '';
        this.strInProgressOrdersTitle = '';
        this.strInProgressOrdersSubtitle = '';
        this.strRefundedTitle = '';
        this.strRefundedSubtitle = '';
        this.arrayNewOrders = undefined;
        this.arrayInProgressOrders = undefined;
        this.arrayRefundedOrder = undefined
        this.refreshing = false
        this.shouldLoadMoreNew = false;
        this.shouldLoadMoreInProgress = false;
        this.shouldLoadMoreRefunded = false;
        this.deliveryMode = undefined;
        this.loading = false
        this.orderToRefund = {}
    }


    //#region STATE
    state = {
        isLoading: false,
        isLoadingInProgressOrders: false,
        isLoadingRefundedOrders: false,
        selectedIndex: 0,
        strNoDataFound: '',
        strNewOrderTitle: '',
        strNewOrderMessage: '',
        strInProgressOrderTitle: '',
        strInProgressOrderMessage: '',
        refreshCount: 0,
        shouldShowModal: false,
        rejectReason: '',
        showEmptyField: false,
        order: undefined,
        sendRejectReason: '',
        isMoreLoading: false,
        isMoreinProgressLoading: false,
        isMoreRefundedLoading: false,
        isThirdPartyVisible: false,
        appState: AppState.currentState,
        key: 1,
        scannedDevices: [],
        pairedDevices: [],
        isScanning: false,
        isDeviceListVisible: false,
        isShowModeChange: false,
        shouldShowRefund: false,
        admToken: ''
    };
    //#endregion

    componentDidMount = async () => {
        debugLog("DID MOUNT ", this.props.admToken)

        this.isRefresh = this.context.isRefresh
        this.appStateListener = AppState.addEventListener("change", this.handleAppStateChange)

    }

    componentWillUnmount = () => {
        if (this.appStateListener)
            this.appStateListener.remove()
    }

    handleAppStateChange = nextAppState => {
        if (this.state.appState.match(/inactive|background/) && nextAppState == "active") {
            this.setState({ selectedIndex: 0 })
            if (this.scrollViewOrders !== undefined && this.scrollViewOrders !== null)
                this.scrollViewOrders.scrollTo({ x: 0, y: 0, animated: true })
            // debugLog("CALLED FROM :::::: handleAppStateChange")


            this.arrayNewOrders = undefined

            this.callNewOrderAPI()

            this.arrayInProgressOrders = undefined
            this.callInProgressOrderAPI()

            this.arrayRefundedOrder = undefined
            this.callRefundedOrderAPI()
        }
        this.setState({ appState: nextAppState });
    }

    componentDidUpdate = newProps => {
        if (this.isRefresh !== this.context.isRefresh) {
            this.isRefresh = this.context.isRefresh
            this.strNewOrdersTitle = '';
            this.strNewOrdersSubtitle = '';
            this.refreshing = false
            this.arrayNewOrders = []
            this.strInProgressOrdersTitle = '';
            this.strInProgressOrdersSubtitle = '';
            this.arrayInProgressOrders = []

            this.strRefundedSubtitle = '';
            this.strRefundedTitle = '';
            this.arrayRefundedOrder = []
            // debugLog("CALLED FROM :::::: didupdate")
            if (!this.loading) {
                this.callNewOrderAPI()
                this.callInProgressOrderAPI()
                this.callRefundedOrderAPI()
            }
            this.loading = false
        }
        // }
    }

    onChangeTokenSuccess = (objSuccess) => {
    }
    onChangeTokenFailure = (objFailure) => {
    };

    /**
        *
        * @param {The call API for get Change user token}
        */
    changeUserToken = () => {
        netStatus(isConnected => {
            if (isConnected) {
                let objChangeTokenParams = {
                    token: this.props.userDetails.PhoneNumber,
                    language_slug: this.props.lan,
                    user_id: this.props.userDetails.UserID,
                    firebase_token: this.props.token,
                };
                changeTOKEN(
                    objChangeTokenParams,
                    this.onChangeTokenSuccess,
                    this.onChangeTokenFailure,
                    this.props,
                )
            }
        })
    }
    /** NETWORK API FOR ORDERS */
    callNewOrderAPI = (isForRefresh = false) => {
        this.loading = true
        this.strNewOrdersTitle = '';
        this.strNewOrdersSubtitle = '';
        if (this.arrayNewOrders === undefined) {
            this.arrayNewOrders = [];
        }
        // this.setState({ isLoading: true });

        netStatus(isConnectedToNetwork => {
            if (isConnectedToNetwork) {
                let params = {
                    token: this.props.userDetails.PhoneNumber,
                    user_id: this.props.userDetails.UserID,
                    tabType: "new",
                    count: PAGE_COUNT,
                    language_slug: this.props.lan,
                    page_no: (this.arrayNewOrders && !isForRefresh) ? parseInt(this.arrayNewOrders.length / PAGE_COUNT) + 1 : 1,

                };
                if (!isForRefresh) {
                    this.setState({ isMoreLoading: this.arrayNewOrders !== undefined && this.arrayNewOrders.length >= PAGE_COUNT ? true : false, isLoading: this.arrayNewOrders === undefined || this.arrayNewOrders.length === 0 });
                }
                getOrderDetail(params, this.onGetNewOrderSuccess, this.onGetNewOrderFailure, this.props)
            } else {
                this.loading = false

                this.arrayNewOrders = [];
                this.strNewOrdersTitle = strings('generalNoInternet');
                this.strNewOrdersSubtitle = strings('generalNoInternetMessage');
                this.forceUpdate();
                this.setState({ isLoading: false, isMoreLoading: false })
            }
        })
    };


    /**
    * @param {The success response object} objSuccess
    */
    onGetNewOrderSuccess = objSuccess => {
        this.strNewOrdersTitle = strings('generalNoNewOrders');
        this.strNewOrdersSubtitle = strings('generalNoNewOrdersSubtitle');
        this.loading = false

        if (this.arrayNewOrders === undefined) {
            this.arrayNewOrders = []
        }

        // New ORDERS ARRAY
        if (objSuccess.data.orders !== undefined && objSuccess.data.orders.length > 0) {
            let arrNewOrder = objSuccess.data.orders || []
            let totalRecordCount = objSuccess.data.total_order_count || 0
            this.shouldLoadMoreNew = this.arrayNewOrders.length + arrNewOrder.length < totalRecordCount
            this.arrayNewOrders = [...this.arrayNewOrders, ...arrNewOrder].filter((value, index, self) =>
                index === self.findIndex((t) => (
                    t.order_id === value.order_id
                ))
            );
            this.forceUpdate();
        }

        this.setState({ isLoading: false, isMoreLoading: false });
    };

    /**
     * @param {The failure response object} objFailure
     */
    onGetNewOrderFailure = objFailure => {
        this.loading = false

        this.strNewOrdersTitle = objFailure.message
        this.strNewOrdersSubtitle = ''
        this.setState({ isLoading: false, isMoreLoading: false });
    };


    /** NETWORK API FOR ORDERS */
    callInProgressOrderAPI = (isForRefresh = false) => {
        this.strInProgressOrdersTitle = '';
        this.strInProgressOrdersSubtitle = '';
        if (this.arrayInProgressOrders === undefined) {
            this.arrayInProgressOrders = [];
        }

        netStatus(isConnectedToNetwork => {
            if (isConnectedToNetwork) {
                let params = {
                    language_slug: this.props.lan,
                    tabType: "inProgress",
                    user_id: this.props.userDetails.UserID,
                    count: PAGE_COUNT,
                    token: this.props.userDetails.PhoneNumber,
                    // page_no: 2
                    page_no: (this.arrayInProgressOrders && !isForRefresh) ? parseInt(this.arrayInProgressOrders.length / PAGE_COUNT) + 1 : 1,
                };
                if (!isForRefresh) {
                    this.setState({ isMoreinProgressLoading: this.arrayInProgressOrders !== undefined && this.arrayInProgressOrders.length >= PAGE_COUNT ? true : false, isLoadingInProgressOrders: this.arrayInProgressOrders === undefined || this.arrayInProgressOrders.length === 0 });
                }
                getOrderDetail(params, this.onGeInProgressOrderSuccess, this.onGetInProgressOrderFailure, this.props)
            } else {
                this.arrayInProgressOrders = [];
                this.strInProgressOrdersSubtitle = strings('generalNoInternetMessage');
                this.strInProgressOrdersTitle = strings('generalNoInternet');
                this.forceUpdate();

                this.setState({ isLoadingInProgressOrders: false, isMoreinProgressLoading: false })
            }
        })
    };


    /**
    * @param {The success response object} objSuccess
    */
    onGeInProgressOrderSuccess = objSuccess => {
        this.strInProgressOrdersTitle = strings('generalNoInProgressOrders');
        this.strInProgressOrdersSubtitle = strings('generalNoNewOrdersSubtitle');

        if (this.arrayInProgressOrders === undefined) {
            this.arrayInProgressOrders = []
        }

        // InProgress ORDERS ARRAY
        if (objSuccess.data.orders !== undefined && objSuccess.data.orders.length > 0) {
            let arrInProgressOrder = objSuccess.data.orders || []
            let totalRecordCount = objSuccess.data.total_order_count || 0
            this.shouldLoadMoreInProgress = this.arrayInProgressOrders.length + arrInProgressOrder.length < totalRecordCount
            this.arrayInProgressOrders = [...this.arrayInProgressOrders, ...arrInProgressOrder].filter((value, index, self) =>
                index === self.findIndex((t) => (
                    t.order_id === value.order_id
                ))
            );
            this.forceUpdate();
        }

        this.setState({ isLoadingInProgressOrders: false, isMoreinProgressLoading: false });
    };


    /**
     * @param {The failure response object} objFailure
     */
    onGetInProgressOrderFailure = objFailure => {
        this.strInProgressOrdersTitle = objFailure.message
        this.strInProgressOrdersSubtitle = ''
        this.setState({ isLoadingInProgressOrders: false, isMoreinProgressLoading: false });
    };
    /** NETWORK API FOR ORDERS */
    callRefundedOrderAPI = (isForRefresh = false) => {
        this.strRefundedTitle = '';
        this.strRefundedSubtitle = '';
        if (this.arrayRefundedOrder === undefined) {
            this.arrayRefundedOrder = [];
        }

        netStatus(isConnectedToNetwork => {
            if (isConnectedToNetwork) {
                let params = {
                    language_slug: this.props.lan,
                    tabType: "Refunded",
                    user_id: this.props.userDetails.UserID,
                    count: PAGE_COUNT,
                    token: this.props.userDetails.PhoneNumber,
                    // page_no: 2
                    page_no: (this.arrayRefundedOrder && !isForRefresh) ? parseInt(this.arrayRefundedOrder.length / PAGE_COUNT) + 1 : 1,
                };
                if (!isForRefresh) {
                    this.setState({ isMoreRefundedLoading: this.arrayRefundedOrder !== undefined && this.arrayRefundedOrder.length >= PAGE_COUNT ? true : false, isLoadingRefundedOrders: this.arrayRefundedOrder === undefined || this.arrayRefundedOrder.length === 0 });
                }
                getOrderDetail(params, this.onGeRefundedOrderSuccess, this.onGetRefundedOrderFailure, this.props)
            } else {
                this.arrayRefundedOrder = [];
                this.strRefundedSubtitle = strings('generalNoInternetMessage');
                this.strRefundedTitle = strings('generalNoInternet');
                this.forceUpdate();

                this.setState({ isLoadingRefundedOrders: false, isMoreRefundedLoading: false })
            }
        })
    };
    /**
    * @param {The success response object} objSuccess
    */
    onGeRefundedOrderSuccess = objSuccess => {
        this.strRefundedTitle = strings('noRefundedOrders');
        this.strRefundedSubtitle = strings('generalNoNewOrdersSubtitle');

        if (this.arrayRefundedOrder === undefined) {
            this.arrayRefundedOrder = []
        }

        // Refunded ORDERS ARRAY
        if (objSuccess.data.orders !== undefined && objSuccess.data.orders.length > 0) {
            let arrRefundedOrder = objSuccess.data.orders || []
            let totalRecordCount = objSuccess.data.total_order_count || 0
            this.shouldLoadMoreRefunded = this.arrayRefundedOrder.length + arrRefundedOrder.length < totalRecordCount
            this.arrayRefundedOrder = [...this.arrayRefundedOrder, ...arrRefundedOrder].filter((value, index, self) =>
                index === self.findIndex((t) => (
                    t.order_id === value.order_id
                ))
            );
            this.forceUpdate();
        }

        this.setState({ isLoadingRefundedOrders: false, isMoreRefundedLoading: false });
    };

    /**
     * @param {The failure response object} objFailure
     */
    onGetRefundedOrderFailure = objFailure => {
        this.strRefundedTitle = objFailure.message
        this.strRefundedSubtitle = ''
        this.setState({ isLoadingRefundedOrders: false, isMoreRefundedLoading: false });
    };
    //On did focus home

    onDidFocusHomeContainer = async () => {
        this.props.saveNavigationSelection(strings('homeTitle'))

        this.isRefresh = this.context.isRefresh

        this.setState({ selectedIndex: 0 })
        if (this.scrollViewOrders !== undefined && this.scrollViewOrders !== null)
            this.scrollViewOrders.scrollTo({ x: 0, y: 0, animated: true })
        this.arrayNewOrders = undefined
        // debugLog("CALLED FROM :::::: DID FOCUS")
        this.callNewOrderAPI()

        this.arrayInProgressOrders = undefined
        this.callInProgressOrderAPI()

        this.arrayRefundedOrder = undefined
        this.callRefundedOrderAPI()

        if (this.props.isLoggedIn && (this.props.token === undefined || this.props.token === null || this.props.token === "")) {
            if (Platform.OS == "android" && await deviceInfoModule.getApiLevel() >= 33) {
                requestNotificationPermission(
                    onSuccess => {
                        checkFirebasePermission(onSuccess => {
                            this.props.saveToken(onSuccess)
                            this.changeUserToken()
                        }, (error) => {
                        })
                    },
                    error => {
                        showDialogue(strings("notificationPermission"),  "",[],
                            () => { Linking.openSettings() })
                    }
                )
            }
            else
                checkFirebasePermission(onSuccess => {
                    this.props.saveToken(onSuccess)
                    this.changeUserToken()
                }, (error) => {
                })
        } else if (this.props.isLoggedIn) {
            this.changeUserToken()
        }
    }
    /** LOAD MORE EVENT */
    onLoadMoreNewHandler = () => {
        // debugLog("CALLED FROM :::::: onLoadMoreNewHandler")

        if (this.shouldLoadMoreNew && !this.state.isLoading && !this.state.isMoreLoading)
            this.callNewOrderAPI()
    }
    onLoadMoreInProgressHandler = () => {
        if (this.shouldLoadMoreInProgress && !this.state.isLoadingInProgressOrders && !this.state.isMoreinProgressLoading) {
            this.callInProgressOrderAPI();
        }
    }

    onLoadMoreRefundedHandler = () => {
        if (this.shouldLoadMoreRefunded && !this.state.isLoadingRefundedOrders && !this.state.isMoreRefundedLoading) {
            this.callRefundedOrderAPI();
        }
    }

    onPullToRefreshNewOrderHandler = () => {
        this.strNewOrdersTitle = '';
        this.strNewOrdersSubtitle = '';
        this.refreshing = false
        this.arrayNewOrders = []
        // debugLog("CALLED FROM :::::: PTR")

        this.callNewOrderAPI()
        if (this.scrollViewOrders !== undefined && this.scrollViewOrders !== null)
            this.scrollViewOrders.scrollTo({ x: 0, y: 0, animated: false })
    }

    onPullToRefreshInProgressOrderHandler = () => {
        this.strInProgressOrdersTitle = '';
        this.strInProgressOrdersSubtitle = '';
        this.refreshing = false
        this.arrayInProgressOrders = []
        this.callInProgressOrderAPI()
        if (this.scrollViewOrders !== undefined && this.scrollViewOrders !== null)
            this.scrollViewOrders.scrollTo({ x: (Metrics.screenWidth), y: 0, animated: false })

    }

    onPullToRefreshRefundedOrderHandler = () => {
        this.strRefundedTitle = '';
        this.strRefundedSubtitle = '';
        this.refreshing = false
        this.arrayRefundedOrder = []
        this.callRefundedOrderAPI()
        if (this.scrollViewOrders !== undefined && this.scrollViewOrders !== null)
            this.scrollViewOrders.scrollTo({ x: 2 * (Metrics.screenWidth), y: 0, animated: false })

    }

    onModeManagement = () => {
        // this.setState({ isShowModeChange: true })
        this.props.navigation.navigate("restaurantFromHome", {
            screen: "restaurantList",
            params: { isFromHome: 'jane' },
        })
    }
    /** RENDER */
    render() {
        // console.log("THIS.CONTEXT::::::::::::: ", this.context)
        return (
            <BaseContainer
                title={strings('homeTitle')}
                left={'menu'}
                onLeft={this.buttonMenuPressed}
               // right="timer"
                rightIconSize={26}
                onRight={this.onModeManagement}
                loading={this.state.isLoading || this.state.isLoadingInProgressOrders || this.state.isLoadingRefundedOrders}
                connection={this.onConnectionChangeHandler}
            >
                <NavigationEvents onFocus={this.onDidFocusHomeContainer} navigationProps={this.props} />
                {/* PARENT VIEW */}
                <View style={styles.mainViewStyle}>

                    {/* SAFE AREA VIEW */}
                    <SafeAreaView style={styles.mainViewStyle}>

                        {/* RENDER REFUND MODAL */}
                        {this.renderRefundModal()}

                        {/* CANCEL REASON POPUP */}
                        {this.state.order !== undefined ? this.renderCancelReasonPopUp() : null}

                        {/* DELIVERY ASSISGNMENT POPUP */}
                        {this.renderThirdPartyModal()}

                        {/* {this.componentWillReceiveProps()} */}
                        <EDTopTabBar
                            data={[{ title: strings('generalNewOrder'), onPress: this.onSegmentIndexChangeHandler, index: 0 },
                            { title: strings('generalInProgress'), onPress: this.onSegmentIndexChangeHandler, index: 1 },
                            { title: strings('refundedOrders'), onPress: this.onSegmentIndexChangeHandler, index: 2 }
                        ]}
                            selectedIndex={this.state.selectedIndex}
                        />

                        {/* HORIZONTAL SCROLL FOR ORDERS TAB */}
                        <ScrollView scrollEnabled={false} ref={scrollView => this.scrollViewOrders = scrollView}
                            bounces={false} pagingEnabled={true} horizontal={true} showsVerticalScrollIndicator={false}
                            contentContainerStyle={{
                                flexDirection: "row"
                            }}
                        >
                            {this.arrayNewOrders !== undefined && this.arrayNewOrders.length > 0
                                ? <EDOrdersFlatList style={[styles.orderFlatListStyle]}
                                    arrayOrders={this.arrayNewOrders}
                                    onPhoneNumberPressed={this.onPhoneNumberPressed}
                                    onOrderViewPressed={this.onOrderViewPressed}
                                    onOrderAcceptPressed={this.onOrderAcceptPressed}
                                    onOrderRejectPressed={this.onOrderRejectPressed}
                                    onRefundPressed={this.initiateRefund}
                                    onEndReached={this.onLoadMoreNewHandler}
                                    isMoreLoading={this.state.isMoreLoading}
                                    onPullToRefreshHandler={this.onPullToRefreshNewOrderHandler}
                                />

                                : this.strNewOrdersTitle !== '' ?
                                    <View style={styles.parentScrollViewStyle}>
                                        <ScrollView
                                            contentContainerStyle={styles.scrollViewStyle}
                                            showsVerticalScrollIndicator={false}
                                            refreshControl={
                                                <RefreshControl
                                                    refreshing={this.refreshing || false}
                                                    title={strings("generalFetchingNew")}
                                                    titleColor={EDColors.textAccount}
                                                    tintColor={EDColors.textAccount}
                                                    colors={[EDColors.textAccount]}
                                                    onRefresh={this.onPullToRefreshNewOrderHandler}
                                                />
                                            }
                                        >
                                            <EDPlaceholderComponent title={this.strNewOrdersTitle} subTitle={this.strNewOrdersSubtitle} />
                                        </ScrollView>
                                    </View>
                                    : <View style={{ width: Metrics.screenWidth }} />}

                            {this.arrayInProgressOrders !== undefined && this.arrayInProgressOrders.length > 0
                                ? <EDOrdersFlatList style={[styles.orderFlatListStyle]}

                                    arrayOrders={this.arrayInProgressOrders}
                                    onPhoneNumberPressed={this.onPhoneNumberPressed}
                                    onOrderViewPressed={this.onOrderInProgressViewPressed}
                                    onOrderAcceptPressed={this.onOrderAcceptPressed}
                                    onOrderRejectPressed={this.onOrderRejectPressed}
                                    onEndReached={this.onLoadMoreInProgressHandler}
                                    onRefundPressed={this.initiateRefund}
                                    isMoreLoading={this.state.isMoreinProgressLoading}
                                    onPullToRefreshHandler={this.onPullToRefreshInProgressOrderHandler}
                                />

                                : this.strInProgressOrdersTitle !== ''
                                    ? <View style={styles.parentScrollViewStyle}>
                                        <ScrollView
                                            contentContainerStyle={styles.scrollViewStyle}
                                            showsVerticalScrollIndicator={false}
                                            refreshControl={
                                                <RefreshControl
                                                    refreshing={this.refreshing || false}
                                                    title={strings("generalFetchingNew")}
                                                    titleColor={EDColors.textAccount}
                                                    tintColor={EDColors.textAccount}
                                                    colors={[EDColors.textAccount]}
                                                    onRefresh={this.onPullToRefreshInProgressOrderHandler}
                                                />
                                            }
                                        >
                                            <EDPlaceholderComponent title={this.strInProgressOrdersTitle} subTitle={this.strInProgressOrdersSubtitle} />
                                        </ScrollView>
                                    </View>
                                    : <View style={{ width: Metrics.screenWidth }} />
                            }

                            {this.arrayRefundedOrder !== undefined && this.arrayRefundedOrder.length > 0
                                ? <EDOrdersFlatList style={[styles.orderFlatListStyle]}

                                    arrayOrders={this.arrayRefundedOrder}
                                    onPhoneNumberPressed={this.onPhoneNumberPressed}
                                    onOrderViewPressed={this.onOrderRefundedViewPressed}
                                    onOrderAcceptPressed={this.onOrderAcceptPressed}
                                    onOrderRejectPressed={this.onOrderRejectPressed}
                                    onEndReached={this.onLoadMoreRefundedHandler}
                                    onRefundPressed={this.initiateRefund}
                                    isMoreLoading={this.state.isMoreRefundedLoading}
                                    onPullToRefreshHandler={this.onPullToRefreshRefundedOrderHandler}
                                />

                                : this.strRefundedTitle !== ''
                                    ? <View style={styles.parentScrollViewStyle}>
                                        <ScrollView
                                            contentContainerStyle={styles.scrollViewStyle}
                                            showsVerticalScrollIndicator={false}
                                            refreshControl={
                                                <RefreshControl
                                                    refreshing={this.refreshing || false}
                                                    title={strings("generalFetchingNew")}
                                                    titleColor={EDColors.textAccount}
                                                    tintColor={EDColors.textAccount}
                                                    colors={[EDColors.textAccount]}
                                                    onRefresh={this.onPullToRefreshRefundedOrderHandler}
                                                />
                                            }
                                        >
                                            <EDPlaceholderComponent title={this.strRefundedTitle} subTitle={this.strRefundedSubtitle} />
                                        </ScrollView>
                                    </View>
                                    : <View style={{ width: Metrics.screenWidth }} />
                            }
                        </ScrollView>
                    </SafeAreaView>
                </View>
            </BaseContainer >
        );
    }
    //#endregion
    renderCancelReasonPopUp = () => {
        return (
            <EDPopupView isModalVisible={this.state.shouldShowModal}>
                <CancelReasonsList
                    noteText={this.state.order.order_type === "cod" ? "" : strings("rejectRefundMsg")}
                    onDismissCancellationReasonDialogueHandler={this.onDismissHandler} reasonList={this.props.rejectReasonList} />
            </EDPopupView>
        )
    }

    renderThirdPartyModal = () => {
        return (
            <EDPopupView isModalVisible={this.state.isThirdPartyVisible}>
                <CancelReasonsList
                    title={strings("chooseDelivery")}
                    validationMsg={strings("deliveryError")}
                    onDismissCancellationReasonDialogueHandler={this.onDismissDeliveryHandler} reasonList={this.availableDeliveryModes} />
            </EDPopupView>
        )
    }

    onChangeTextHandler = (text) => {
        this.setState({ rejectReason: text, showEmptyField: false, sendRejectReason: text })
    }

    onRejectOrderPress = () => {
        this.setState({ shouldShowModal: false, rejectReason: '' })
        this.acceptNRejectOrder(this.state.order)
    }

    onDismissHandler = (flag) => {
        if (flag == undefined || flag == null || flag == '') {
            this.setState({ shouldShowModal: false })
            return;
        }
        this.state.sendRejectReason = flag
        this.setState({ shouldShowModal: false })
        this.acceptNRejectOrder(this.state.order)
    }

    /** SEGEMENT CHANGE INDEX */
    onSegmentIndexChangeHandler = (segmentIndex) => {
        this.setState({ selectedIndex: segmentIndex })
        this.scrollViewOrders.scrollTo({ x: (Metrics.screenWidth) * segmentIndex, y: 0, animated: true })
    }

    //#region BUTTON EVENTS
    buttonMenuPressed = () => {
        this.props.navigation.openDrawer()
    }

    onPhoneNumberPressed = (phoneNumber) => {
        let url = `tel:${phoneNumber}`
        if (Linking.canOpenURL(url))
            Linking.openURL(url)
    }

    onOrderViewPressed = (order) => {
        // console.log("ORDER PASSED::::::: ", order)
        this.props.navigation.navigate('orderDetails', { order: order })
    }

    onOrderInProgressViewPressed = order => {
        this.props.navigation.navigate('orderDetails', { order: order })
    }

    onOrderRefundedViewPressed = order => {
        this.props.navigation.navigate('orderDetails', {
            order: order, readOnly: order.order_status == "Rejected" || order.order_status == "Cancel"
                || order.order_status == "Complete" || order.order_status == "Delivered"
        })
    }

    showThirdPartyModal = () => {
        this.setState({ isThirdPartyVisible: true })
    }

    onDismissDeliveryHandler = (flag, index) => {
        if (flag == undefined || flag == null || flag == '') {
            this.setState({ isThirdPartyVisible: false })
            return;
        }
        this.deliveryMode = index
        this.setState({ isThirdPartyVisible: false })
        this.acceptNRejectOrder(this.state.order, true)
    }

    onOrderAcceptPressed = order => {
        this.setState({ order: order })
        // if (order.delivery_flag == "delivery") {
        //     if (order.is_thirdparty_delivery_available == "no") {
        //         this.availableDeliveryModes = [
        //             { reason: strings('selectOwn') }
        //         ]
        //     }
        //     else {
        //         this.availableDeliveryModes = [
        //             { reason: strings('selectOwn') },
        //             { reason: strings('3rdParty'), }
        //         ]
        //     }
        //     this.showThirdPartyModal()
        // }
        // else
            this.acceptNRejectOrder(order, true)
    }

    onOrderRejectPressed = order => {
        this.setState({ order: order })
        this.setState({ shouldShowModal: true })
    }

    //#endregion

    /**
     * Accept/Reject Order
     */

    acceptNRejectOrder = (order, accept) => {
        netStatus(status => {
            if (status) {
                let orderParams = {
                    user_id: this.props.userDetails.UserID,
                    token: order.users.mobile_number,
                    language_slug: this.props.lan,
                    order_id: order.order_id,
                    restaurant_id: order.restaurant_id,
                    reject_reason: this.state.sendRejectReason,
                    choose_delivery_method: this.deliveryMode !== undefined ? (this.deliveryMode == 0 ? "internal_drivers" : "thirdparty_delivery") : '',
                    // choose_delivery_method: "thirdparty_delivery",
                    order_mode: order.delivery_flag
                }
                this.setState({ isLoading: true })
                acceptNRejectOrderAPI(orderParams, this.onSuccessAcceptOrder, this.onFailureAcceptOrder, [this.props, { "accept": accept }])
            }
            else
                showNoInternetAlert()
        })
    }

    /**
     * Accept/Reject Order success
     */

    onSuccessAcceptOrder = onSuccess => {
        // console.log('success')
        this.deliveryMode = undefined
        this.setState({ isLoading: false, isMoreLoading: false })

        if (onSuccess.data.status == RESPONSE_SUCCESS) {
            showTopDialogue(onSuccess.message)
            this.arrayNewOrders = undefined
            this.arrayInProgressOrders = undefined
            this.arrayRefundedOrder = undefined
            // debugLog("CALLED FROM :::::: accept roder")

            this.callNewOrderAPI();
            this.callInProgressOrderAPI();
            this.callRefundedOrderAPI()
        }
        else
            showTopDialogue(onSuccess.message, true)

    }


    /**
     * Accept/Reject Order failure
     */

    onFailureAcceptOrder = onFailure => {
        // console.log('fail')
        this.deliveryMode = undefined
        this.setState({ isLoading: false, isMoreLoading: false })
        showTopDialogue(onFailure.message, true)
    }

    /**
    *  Initiate refund
    */

    initiateRefund = (orderData) => {
        this.orderToRefund = orderData
        this.setState({ shouldShowRefund: true })
        // showDialogue(strings("refundConfirm"), strings("loginAppName"), [{
        //     "text": strings("dialogNo"),
        //     isNotPreferred: undefined,
        //     onPress: () => { }
        // }], (refundReason, amount,refundType) => this.processRefund(order_id, refundReason, amount, refundType), strings("dialogYes"), true, true,total)
    }

    hideRefundModal = () => {
        this.orderToRefund = undefined
        this.setState({ shouldShowRefund: false })
    }
    renderRefundModal = () => {
        return <EDRefundAlert shouldShowAlert={this.state.shouldShowRefund}
            hideRefundModal={this.hideRefundModal}
            orderToRefund={this.orderToRefund}
            lan={this.props.lan}
            processRefund={this.startRefund}
        />
    }

    startRefund = (refundReason, amount, refundType) => {
        this.setState({ shouldShowRefund: false })
        this.processRefund(this.orderToRefund.order_id, refundReason, amount, refundType)
        this.orderToRefund = undefined

    }

    processRefund = (order_id, refundReason, amount, refundType) => {
        netStatus(status => {
            if (status) {
                let orderParams = {
                    language_slug: this.props.lan,
                    order_id: order_id,
                    user_id: this.props.userDetails.UserID,
                    refund_reason: refundReason,
                    partial_refundedchk: refundType == 0 ? "full" : "partial",
                    partial_refundedamt: amount
                }
                this.setState({ isLoading: true })
                initiateRefundAPI(orderParams, this.onSuccessRefund, this.onFailureRefund, this.props)
            }
            else
                showNoInternetAlert()
        })
    }

    /**
     * Refund Order success
     */

    onSuccessRefund = onSuccess => {
        if (onSuccess.data !== undefined && onSuccess.data.status == RESPONSE_SUCCESS) {
            showTopDialogue(onSuccess.message)
            this.arrayNewOrders = undefined
            this.arrayInProgressOrders = undefined
            this.arrayRefundedOrder = undefined
            // debugLog("CALLED FROM :::::: redunf")

            this.callNewOrderAPI();
            this.callInProgressOrderAPI();
            this.callRefundedOrderAPI()
        } else {
            this.setState({ isLoading: false })
            showTopDialogue(onSuccess.message, true)
        }
    }


    /**
     *  Refund Order failure
     */

    onFailureRefund = onFailure => {
        this.setState({ isLoading: false })
        showTopDialogue(onFailure.message, true)
    }



    //#region Networks
    onConnectionChangeHandler = isConnected => {
        if (isConnected) {
            // debugLog("CALLED FROM :::::: connection")

            this.callNewOrderAPI()
            this.callInProgressOrderAPI()
            this.callRefundedOrderAPI()
        }
    }
    //#endregion
}

export default connect(
    state => {
        return {
            isLoggedIn: state.userOperations.isLoggedIn,
            token: state.userOperations.token,
            userDetails: state.userOperations.userDetails || {},
            lan: state.userOperations.lan,
            rejectReasonList: state.userOperations.rejectReasonList,
            admToken: state.userOperations.admToken
        };
    },
    dispatch => {
        return {
            saveNavigationSelection: dataToSave => {
                dispatch(saveNavigationSelection(dataToSave));
            },
            saveToken: token => {
                dispatch(saveUserFCMInRedux(token))
            }
        };
    }
)(HomeContainer);

export const styles = StyleSheet.create({
    tabStyle: {
        marginTop: 10,
        backgroundColor: EDColors.white,
        borderColor: EDColors.primary,
        height: 40
    },
    tabTextStyle: {
        color: EDColors.black,
        fontFamily: EDFonts.bold,
        fontSize: heightPercentageToDP('1.8%'),
        alignSelf: 'center',
        textAlign: 'center',
    },
    activeTabStyle: {
        backgroundColor: EDColors.primary,
    },
    activeTabTextStyle: {
        color: EDColors.white,
        fontFamily: EDFonts.bold,
        fontSize: heightPercentageToDP('1.8%'),
        alignSelf: 'center',
        textAlign: 'center',
    },
    mainViewStyle: {
        flex: 1,
        // backgroundColor: EDColors.offWhite,
    },
    marginViewStyle: { margin: 10 },
    orderFlatListStyle: { width: Metrics.screenWidth },
    scrollViewStyle: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    parentScrollViewStyle: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: Metrics.screenWidth,
    }
});
