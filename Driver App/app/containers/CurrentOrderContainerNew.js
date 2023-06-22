import React from 'react';
import {
  AppState,
  Dimensions,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import BackgroundService from 'react-native-background-actions';
import Dash from 'react-native-dash';
import deviceInfoModule from 'react-native-device-info';
import {Icon} from 'react-native-elements';
import {stat} from 'react-native-fs';
import MapView, {
  Callout,
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
} from 'react-native-maps';
import {PERMISSIONS} from 'react-native-permissions';
import {initialWindowMetrics} from 'react-native-safe-area-context';
import {connect} from 'react-redux';
import Assets from '../assets';
import CancelReasonsList from '../components/CancelReasonsList';
import EDButton from '../components/EDButton';
import EDPopupView from '../components/EDPopupView';
import EDReviewComponent from '../components/EDReviewComponent';
import EDRTLText from '../components/EDRTLText';
import EDRTLView from '../components/EDRTLView';
import NavigationEvents from '../components/NavigationEvents';
import ProductsList from '../components/ProductsList';
import {strings} from '../locales/i18n';
import {saveUserDetailsInRedux} from '../redux/actions/User';
import {
  showDialogue,
  showNoInternetAlert,
  showTopDialogue,
} from '../utils/EDAlert';
import {EDColors} from '../utils/EDColors';
import {
  debugLog,
  funGetFrench_Curr,
  getProportionalFontSize,
  GOOGLE_API_KEY,
  isRTLCheck,
  RESPONSE_SUCCESS,
} from '../utils/EDConstants';
import {EDFonts} from '../utils/EDFontConstants';
import {getCurrentLocation} from '../utils/LocationServiceManager';
import Metrics from '../utils/metrics';
import {netStatus} from '../utils/NetworkStatusConnection';
import {checkPermission} from '../utils/PermissionManager';
import {
  acceptOrder,
  addReview,
  cancelOrder,
  checkOrderStatus,
  displayPolyLine,
  getCancelReasonList,
  ordersDeliver,
  pickupOrderAPI,
  updateDriverLocation,
} from '../utils/ServiceManager';
import BaseContainer from './BaseContainer';
let {width, height} = Dimensions.get('window');
const LATITUDE_DELTA = 0.05;
const LONGITUDE_DELTA = LATITUDE_DELTA * (width / height);
var timer;

class CurrentOrderContainerNew extends React.Component {
  //#region LIFE CYCLE METHODS

  constructor(props) {
    super(props);
    this.currentOrderDict = this.props.route.params.currentOrder || {};
    this.OrderProductArray = [];
    this.res_latitude = parseFloat(this.currentOrderDict.res_latitude);
    this.res_longitude = parseFloat(this.currentOrderDict.res_longitude);
    this.dest_latitude = 0.0;
    this.dest_longitude = 0.0;
    (this.coords = undefined), (this.strCancelReason = '');
    this.cancelReasonArray = [
      {label: strings('other'), value: strings('other')},
    ];
    this.allowedFullPermission = false;
    this.tastOptions = {
      taskName: strings('appName'),
      taskTitle: strings('backgroundTracking'),
      taskDesc: strings('backgroundEnable'),
      taskIcon: {
        name: 'ic_stat_name',
        type: 'drawable',
      },
      color: EDColors.primary,
      linkingURI: 'driver://openapp', // See Deep Linking for more info
      parameters: {
        delay: 5000,
      },
    };
    this.isPermission = true;
    this.taskStarted = false;
  }

  state = {
    isLoading: false,
    isModalVisible: false,
    isCancelModalVisible: false,
    isDeliveryVisible: false,
    isOrderDetailVisible: false,
    orderStatus: '',
    // starRating: 0,
    curr_latitude: 0.0,
    curr_longitude: 0.0,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
    unAssigned:
      this.props.route.params.currentOrder.is_order_assigned === 1
        ? false
        : true,
    appState: AppState.currentState,
    confirmDelivery: false,
    totalDistance: '',
    orderPopup: false,
    deliverTime: '',
    deliveryDistance: '',
    dottedLineHeight: 10,
    dottedLineHeightForPopup: 10,
    dottedPopupTop: 10,
    dottedPopupBottom: 10,
    topHeightPopup: 40,
    dottedTop: 10,
    topHeight: 40,
  };

  componentWillUnmount() {
    if (timer !== undefined) {
      clearInterval(timer);
    }
    // clearInterval(this.interval)
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  componentDidMount() {
    this.backGroundLocationHandler();
    this.android10BackgroundPermissionCheck();
    this.getOrderStatusAPI();
    this.fetchCancelReasons();

    AppState.addEventListener('change', this._handleAppStateChange);

    this.dest_latitude = parseFloat(this.currentOrderDict.latitude);
    this.dest_longitude = parseFloat(this.currentOrderDict.longitude);
    this.res_latitude = parseFloat(this.currentOrderDict.res_latitude);
    this.res_longitude = parseFloat(this.currentOrderDict.res_longitude);
    this.getPolyline(this.currentOrderDict.order_status.toLowerCase());
  }

  android10BackgroundPermissionCheck = () => {
    let system_version = Number(deviceInfoModule.getSystemVersion());
    if (Platform.OS == 'android' && system_version >= 10) {
      var paramPermission = PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION;

      checkPermission(
        paramPermission,
        () => {
          this.allowedFullPermission = true;
        },
        () => {
          this.isPermission = false;
          showDialogue(
            strings('backgroundLocation'),
            '',
            [
              {
                text: strings('cancel'),
                onPress: this.navigateToBack,
                isNotPreferred: true,
              },
            ],
            () => {
              this.isPermission = true;
              Linking.openSettings();
            },
          );
        },
      );
    } else this.allowedFullPermission = true;
  };

  sleep = time => new Promise(resolve => setTimeout(() => resolve(), time));
  startBackgroundTask = async taskDataArguments => {
    // if (this.taskStarted)
    //     return;

    this.taskStarted = true;
    const {delay} = taskDataArguments;
    await new Promise(async resolve => {
      for (let i = 0; BackgroundService.isRunning(); i++) {
        getCurrentLocation(
          this.props.googleMapKey || GOOGLE_API_KEY,
          onCurrentLocation => {
            this.setState({
              curr_latitude: onCurrentLocation.latitude,
              curr_longitude: onCurrentLocation.longitude,
            });
            this.getPolyline();
            this.driverTracking(
              onCurrentLocation.latitude,
              onCurrentLocation.longitude,
            );
          },
          err => {
            BackgroundService.stop();
            showDialogue(
              strings('currentLocationError'),
              '',
              [],
              this.navigateToBack,
            );
          },
        );
        await this.sleep(delay);
      }
    });
  };

  backGroundLocationHandler = () => {
    var paramPermission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
    checkPermission(
      paramPermission,
      () => {
        BackgroundService.stop();
        getCurrentLocation(
          this.props.googleMapKey || GOOGLE_API_KEY,
          onCurrentLocation => {
            this.setState({
              curr_latitude: onCurrentLocation.latitude,
              curr_longitude: onCurrentLocation.longitude,
            });
            this.driverTracking(
              onCurrentLocation.latitude,
              onCurrentLocation.longitude,
            );
          },
        );
        BackgroundService.start(
          this.startBackgroundTask,
          this.tastOptions,
        ).catch(err => {});
      },
      () => {
        this.isPermission = false;
        showDialogue(
          strings('permissionTitle'),
          strings('permissionSubTitle'),
          [
            {
              text: strings('cancel'),
              onPress: this.navigateToBack,
              isNotPreferred: true,
            },
          ],
          () => {
            this.isPermission = true;
            if (Platform.OS == 'ios') Linking.openURL('app-settings:');
            else Linking.openSettings();
          },
        );
      },
    );
  };

  _handleAppStateChange = nextAppState => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      if (this.isPermission) this.backGroundLocationHandler();
    }
    this.setState({appState: nextAppState});
  };

  getOrderStatusAPI = () => {
    if (this.state.orderStatus.toLowerCase() === 'ongoing') {
      if (timer !== undefined) {
        clearInterval(timer);
      }
      return;
    }

    let objOrderDeliver = {
      user_id: this.props.userData.UserID,
      order_id: this.currentOrderDict.order_id,
    };
    checkOrderStatus(
      objOrderDeliver,
      this.onSuccessGetOrderStaus,
      this.onFailureGetOrderStaus,
      this.props,
    );
  };

  onSuccessGetOrderStaus = onSuccess => {
    if (onSuccess.data.order_detail !== undefined) {
      this.setState({
        orderStatus: onSuccess.data.order_detail.order_status,
      });
      if (onSuccess.data.order_detail.products !== undefined) {
        this.OrderProductArray = onSuccess.data.order_detail.products;
        this.currency_symbol = onSuccess.data.order_detail.currency_symbol;
      }
    }
  };

  onFailureGetOrderStaus = onFailure => {};

  getPolyline = status => {
    let objGetPolyLineParams = {
      sourceLatitude: this.state.unAssigned
        ? this.res_latitude
        : this.state.curr_latitude,
      sourceLongitude: this.state.unAssigned
        ? this.res_longitude
        : this.state.curr_longitude,
      destinationLatitude: this.state.unAssigned
        ? this.dest_latitude
        : this.currentOrderDict.order_status.toLowerCase() !== 'ongoing'
        ? this.res_latitude
        : this.dest_latitude,
      destinationLongitude: this.state.unAssigned
        ? this.dest_longitude
        : this.currentOrderDict.order_status.toLowerCase() !== 'ongoing'
        ? this.res_longitude
        : this.dest_longitude,
    };
    debugLog('POLYLINE CALLED :::::', objGetPolyLineParams);
    displayPolyLine(
      objGetPolyLineParams,
      this.onSuccessDisplayPolyLine,
      this.onFailureDisplayPolyLine,
      this.props,
      this.props.googleMapKey || GOOGLE_API_KEY,
      this.props.useMile == '1',
    );
  };

  onSuccessDisplayPolyLine = onSuccess => {
    var routesArray = onSuccess.data.routes;

    if (routesArray.length !== 0) {
      this.coords = this.decode(routesArray[0].overview_polyline.points);
      this.setState({
        isLoading: false,
        deliverTime: routesArray[0].legs[0].duration.text,
        deliveryDistance: routesArray[0].legs[0].distance.text,
        totalDistance:
          routesArray[0].legs[0].distance.text +
          '\n(' +
          routesArray[0].legs[0].duration.text +
          ')',
      });
    } else {
      this.setState({isLoading: false});
    }
  };

  onFailureDisplayPolyLine = onFailure => {
    this.setState({isLoading: false});
  };

  decode = (t, e) => {
    for (
      var n,
        o,
        u = 0,
        l = 0,
        r = 0,
        d = [],
        h = 0,
        i = 0,
        a = null,
        c = Math.pow(10, e || 5);
      u < t.length;

    ) {
      (a = null), (h = 0), (i = 0);
      do (a = t.charCodeAt(u++) - 63), (i |= (31 & a) << h), (h += 5);
      while (a >= 32);
      (n = 1 & i ? ~(i >> 1) : i >> 1), (h = i = 0);
      do (a = t.charCodeAt(u++) - 63), (i |= (31 & a) << h), (h += 5);
      while (a >= 32);
      (o = 1 & i ? ~(i >> 1) : i >> 1),
        (l += n),
        (r += o),
        d.push([l / c, r / c]);
    }
    return (d = d.map(function (t) {
      return {latitude: t[0], longitude: t[1]};
    }));
  };

  reviewDialog() {
    return (
      <EDPopupView isModalVisible={this.state.isModalVisible}>
        <EDReviewComponent
          item={this.currentOrderDict}
          dismissReviewHandler={this.dismissReviewHandler}
          closeReviewHandler={this.closeReviewHandler}
        />
      </EDPopupView>
    );
  }

  closeReviewHandler = () => {
    this.setState({isModalVisible: false});
    this.navigateToBack();
  };

  dismissDeliveryModal = () => {
    this.setState({isDeliveryVisible: false});
  };

  showDeliveryModal = () => {
    this.setState({isDeliveryVisible: true});
  };

  toggleConfirm = () => {
    this.setState({confirmDelivery: !this.state.confirmDelivery});
  };

  deliverDialog() {
    return (
      <EDPopupView
        isModalVisible={this.state.isDeliveryVisible}
        shouldDismissModalOnBackButton={true}
        onRequestClose={this.dismissDeliveryModal}>
        <View style={stylesCurrentOrder.deliverModal}>
          <EDRTLView
            style={{
              borderBottomColor: EDColors.separatorColor,
              borderBottomWidth: 1,
              paddingBottom: 5,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <EDRTLText
              title={strings('confirm')}
              style={stylesCurrentOrder.textHeader}
            />
            <Icon
              name={'close'}
              color={EDColors.primary}
              size={20}
              onPress={this.dismissDeliveryModal}
            />
          </EDRTLView>
          <TouchableOpacity onPress={this.toggleConfirm} activeOpacity={1}>
            <EDRTLView
              style={{justifyContent: 'space-between', marginVertical: 20}}>
              <Icon
                name={
                  !this.state.confirmDelivery
                    ? 'check-box-outline-blank'
                    : 'check-box'
                }
                color={EDColors.black}
                size={20}
              />
              <EDRTLText
                title={strings('confirm')}
                style={stylesCurrentOrder.text}
              />
            </EDRTLView>
          </TouchableOpacity>
          <EDRTLView style={{justifyContent: 'center', marginVertical: 5}}>
            <EDButton
              label={strings('confirm')}
              disabled={!this.state.confirmDelivery}
              onPress={this.deliveredOrder}
              style={{
                width: Metrics.screenWidth * 0.35,
                backgroundColor: this.state.confirmDelivery
                  ? EDColors.primary
                  : EDColors.buttonUnreserve,
                marginHorizontal: 10,
              }}
            />
            <EDButton
              label={strings('cancel')}
              style={{width: Metrics.screenWidth * 0.35}}
              onPress={this.dismissDeliveryModal}
            />
          </EDRTLView>
        </View>
      </EDPopupView>
    );
  }

  orderDetailRender = () => {
    return (
      <EDPopupView isModalVisible={this.state.isOrderDetailVisible}>
        <ProductsList
          orderDetails={this.OrderProductArray}
          currencySymbol={this.currency_symbol}
          lan={this.props.lan}
          dismissProductsListHandler={this.dismissProductsListHandler}
        />
      </EDPopupView>
    );
  };

  cancelOrderModalRender = () => {
    return (
      <EDPopupView isModalVisible={this.state.isCancelModalVisible}>
        <CancelReasonsList
          reasonData={this.cancelReasonArray}
          onDismissCancellationReasonDialogueHandler={
            this.onDismissCancellationReasonDialogueHandler
          }
        />
      </EDPopupView>
    );
  };

  setMarkerRef = ref => {
    this.marker = ref;
  };

  onLayout = e => {
    this.setState({
      dottedTop: e.nativeEvent.layout.y,
      topHeight: e.nativeEvent.layout.height,
    });
  };
  onLayoutBottom = e => {
    this.setState({
      dottedLineHeight: e.nativeEvent.layout.y - this.state.dottedTop,
    });
  };

  renderAcceptPopUp = () => {
    return (
      <View
        style={[
          stylesCurrentOrder.acceptPopUp,
          {
            width: '100%',
            marginBottom: 0,
            borderTopRightRadius: 32,
            borderTopLeftRadius: 32,
            marginTop: -20,
          },
        ]}>
        <View style={stylesCurrentOrder.acceptHeader}>
          <EDRTLView style={{alignItems: 'center'}}>
            {/* <View style={{
                    backgroundColor: EDColors.white, padding: 7, borderRadius: 50,
                    marginHorizontal: 15, shadowColor: EDColors.text, shadowOffset: { width: 0, height: 2, },
                    shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5,
            }}> */}

            <Icon
              name="clockcircleo"
              type="ant-design"
              size={16}
              color={EDColors.primary}
              raised
            />
            {/* </View> */}
            <View>
              <EDRTLText
                title={
                  strings('distance') + ' - ' + this.state.deliveryDistance
                }
                style={[
                  stylesCurrentOrder.text,
                  {
                    fontFamily: EDFonts.medium,
                    fontSize: getProportionalFontSize(12),
                    color: EDColors.text,
                  },
                ]}
              />
              <EDRTLText
                title={strings('distance') + ': ' + this.state.deliverTime}
                style={[
                  stylesCurrentOrder.boldText,
                  {
                    marginTop: 3,
                    textAlign: !isRTLCheck() ? 'left' : 'right',
                    fontFamily: EDFonts.semiBold,
                    fontSize: getProportionalFontSize(14),
                  },
                ]}
              />
            </View>
          </EDRTLView>
        </View>

        {/* CASH TEXT */}
        <View style={stylesCurrentOrder.acceptHeader}>
          <EDRTLView style={{alignItems: 'center'}}>
            {/* <View style={{ backgroundColor: EDColors.white, padding: 7, borderRadius: 50, marginHorizontal: 15, shadowColor: EDColors.text, shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, }} > */}
            <Icon
              name="wallet-outline"
              type="ionicon"
              size={16}
              color={EDColors.primary}
              raised
            />
            {/* </View> */}

            <View>
              <EDRTLText
                title={
                  this.currentOrderDict.order_type == 'cod'
                    ? strings('cashToCollect')
                    : strings('paidAmount')
                }
                style={[
                  stylesCurrentOrder.text,
                  {
                    fontFamily: EDFonts.medium,
                    fontSize: getProportionalFontSize(12),
                    color: EDColors.text,
                  },
                ]}
              />
              <EDRTLText
                title={
                  this.currentOrderDict.currency_symbol +
                  funGetFrench_Curr(
                    this.currentOrderDict.total_rate,
                    1,
                    this.props.lan,
                  )
                }
                style={[
                  stylesCurrentOrder.boldText,
                  {
                    marginTop: 3,
                    fontFamily: EDFonts.semiBold,
                    fontSize: getProportionalFontSize(14),
                  },
                ]}
              />
            </View>
          </EDRTLView>
        </View>

        {/* instruction text */}
        {this.currentOrderDict.delivery_instructions !== null &&
        this.currentOrderDict.delivery_instructions !== undefined &&
        this.currentOrderDict.delivery_instructions.trim().length > 0 ? (
          <View style={[stylesCurrentOrder.acceptHeader]}>
            <EDRTLView style={{alignItems: 'center'}}>
              <Icon
                name="comment"
                type={'octicon'}
                size={16}
                color={EDColors.primary}
                raised
              />

              <View style={{flex: 1}}>
                <EDRTLText
                  title={strings('instruction')}
                  style={[
                    stylesCurrentOrder.text,
                    {
                      fontFamily: EDFonts.medium,
                      fontSize: getProportionalFontSize(12),
                      color: EDColors.text,
                    },
                  ]}
                />
                <EDRTLText
                  title={this.currentOrderDict.delivery_instructions}
                  style={[
                    stylesCurrentOrder.boldText,
                    {
                      marginTop: 3,
                      fontFamily: EDFonts.semiBold,
                      fontSize: getProportionalFontSize(14),
                    },
                  ]}
                />
              </View>
            </EDRTLView>
          </View>
        ) : null}

        {/* PICKUP FROM */}
        <View
          style={stylesCurrentOrder.acceptHeader}
          onLayout={this.state.dottedLineHeight == 10 ? this.onLayout : null}>
          <EDRTLView style={{alignItems: 'center'}}>
            <View style={{paddingTop: 5, alignSelf: 'flex-start'}}>
              {/* <View style={{ backgroundColor: EDColors.white, padding: 7, borderRadius: 50, marginHorizontal: 15, shadowColor: EDColors.text, shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, }}> */}
              <Icon
                name="compass"
                type="simple-line-icon"
                size={16}
                color={EDColors.primary}
                raised
              />
              {/* </View> */}
            </View>
            <View style={{flex: 1}}>
              <EDRTLText
                title={
                  this.currentOrderDict.order_status.toLowerCase() === 'ongoing'
                    ? strings('deliverTo')
                    : strings('pickFrom')
                }
                style={[
                  stylesCurrentOrder.text,
                  {
                    fontFamily: EDFonts.medium,
                    fontSize: getProportionalFontSize(12),
                    color: EDColors.text,
                  },
                ]}
              />
              <EDRTLText
                title={this.currentOrderDict.name}
                style={[
                  stylesCurrentOrder.boldText,
                  {
                    marginTop: 3,
                    fontFamily: EDFonts.semiBold,
                    fontSize: getProportionalFontSize(14),
                  },
                ]}
              />
              <EDRTLText
                title={this.currentOrderDict.res_address}
                style={[
                  stylesCurrentOrder.boldText,
                  {
                    marginTop: 3,
                    fontFamily: EDFonts.semiBold,
                    fontSize: getProportionalFontSize(14),
                  },
                ]}
              />
            </View>
          </EDRTLView>
        </View>

        {/* DOTTED LINE */}

        <Dash
          style={{
            position: 'absolute',
            top: this.state.dottedTop + 20 + getProportionalFontSize(13),
            height: this.state.dottedLineHeight * 0.75,
            flexDirection: 'column',
            left: isRTLCheck() ? null : 34.5,
            right: isRTLCheck() ? 34.5 : null,
            zIndex: -1,
          }}
          dashColor={EDColors.grayNew}
          dashThickness={1.5}
        />

        <View
          style={stylesCurrentOrder.acceptHeader}
          onLayout={
            this.state.dottedLineHeight == 10 ? this.onLayoutBottom : null
          }>
          <EDRTLView style={{alignItems: 'center'}}>
            <View style={{paddingTop: 5, alignSelf: 'flex-start'}}>
              {/* <View style={{ backgroundColor: EDColors.white, padding: 7, borderRadius: 50, marginHorizontal: 15, shadowColor: EDColors.text, shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, }}> */}
              <Icon
                name="location-outline"
                type="ionicon"
                size={16}
                color={EDColors.primary}
                raised
              />

              {/* </View> */}
            </View>
            <View style={{flex: 1}}>
              <EDRTLText
                title={strings('deliverTo')}
                style={[
                  stylesCurrentOrder.text,
                  {
                    fontFamily: EDFonts.medium,
                    fontSize: getProportionalFontSize(12),
                    color: EDColors.text,
                  },
                ]}
              />
              <EDRTLText
                title={this.currentOrderDict.user_name}
                style={[
                  stylesCurrentOrder.boldText,
                  {
                    marginTop: 3,
                    fontFamily: EDFonts.semiBold,
                    fontSize: getProportionalFontSize(14),
                  },
                ]}
              />
              <EDRTLText
                title={this.currentOrderDict.address}
                style={[
                  stylesCurrentOrder.boldText,
                  {
                    marginTop: 3,
                    fontFamily: EDFonts.semiBold,
                    fontSize: getProportionalFontSize(14),
                  },
                ]}
              />
            </View>
          </EDRTLView>
        </View>

        <View style={stylesCurrentOrder.separator} />

        <EDRTLView
          style={[
            stylesCurrentOrder.acceptRejectView,
            {marginHorizontal: 10, marginTop: 10},
          ]}>
          <EDButton
            label={strings('orderReject')}
            onPress={this.rejectOrderCheck}
            style={[
              stylesCurrentOrder.acceptButton,
              {
                backgroundColor: EDColors.offWhite,
                borderRadius: 16,
                height: '100%',
              },
            ]}
            textStyle={{
              fontSize: getProportionalFontSize(16),
              fontFamily: EDFonts.medium,
              margin: 8,
              color: EDColors.black,
            }}
          />
          <EDButton
            label={strings('orderAccept')}
            onPress={this.acceptOrderCheck}
            style={[
              stylesCurrentOrder.acceptButton,
              {borderRadius: 16, height: '100%'},
            ]}
            textStyle={{
              fontSize: getProportionalFontSize(16),
              fontFamily: EDFonts.medium,
              margin: 8,
            }}
          />
        </EDRTLView>
      </View>
    );
  };

  expandSheet = () => {
    // this.RBSheet.open()
    this.setState({orderPopup: true});
  };

  /** CALL BUTTON EVENT */
  buttonCallPressed = toUser => {
    this.dismissOrderDetails();

    const strCallURL =
      toUser == true
        ? 'tel:' + this.currentOrderDict.phone_number
        : 'tel:' + this.currentOrderDict.res_phone_number;
    if (Linking.canOpenURL(strCallURL)) {
      Linking.openURL(strCallURL).catch(error => {
        showTopDialogue('general.callNotConnect', true);
      });
    } else {
      showTopDialogue('general.callNotSupport', true);
    }
  };

  buttonMapPressed = (lat, long) => {
    this.dismissOrderDetails();
    const strMapURL =
      'https://www.google.com/maps/dir/?api=1&destination=' +
      lat +
      ',' +
      long +
      '&travelmode=driving&dir_action=navigate';
    if (Linking.canOpenURL(strMapURL)) {
      Linking.openURL(strMapURL).catch(error => {
        showTopDialogue('general.mapNotConnect', true);
      });
    } else {
      showTopDialogue('general.mapNotSupport', true);
    }
  };

  openMapHandler = toUser => {
    if (toUser == true) {
      this.buttonMapPressed(
        this.currentOrderDict.latitude,
        this.currentOrderDict.longitude,
      );
    } else {
      this.buttonMapPressed(
        this.currentOrderDict.res_latitude,
        this.currentOrderDict.res_longitude,
      );
    }
  };

  dismissOrderDetails = () => {
    this.setState({orderPopup: false, dottedLineHeightForPopup: 10});
  };

  onPopUpLayout = e => {
    this.setState({
      dottedPopupTop: e.nativeEvent.layout.y,
      topHeightPopup: e.nativeEvent.layout.height,
    });
  };
  onPopUpLayoutBottom = e => {
    this.setState({
      dottedLineHeightForPopup:
        e.nativeEvent.layout.y - this.state.dottedPopupTop,
    });
  };
  renderOrderDetails = () => {
    return (
      <EDPopupView
        isModalVisible={this.state.orderPopup}
        onRequestClose={this.dismissOrderDetails}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={this.dismissOrderDetails}
          style={{flex: 1, borderTopRightRadius: 32, borderTopLeftRadius: 32}}
        />
        <View style={{borderTopRightRadius: 32, borderTopLeftRadius: 32}}>
          <View
            style={[
              stylesCurrentOrder.acceptPopUp,
              {
                borderTopRightRadius: 32,
                borderTopLeftRadius: 32,
                paddingVertical: 15,
                width: '100%',
                paddingHorizontal: 0,
                marginBottom: 0,
                paddingBottom:
                  Platform.OS == 'ios'
                    ? initialWindowMetrics.insets.bottom + 15
                    : 15,
              },
            ]}>
            <EDRTLView
              style={{
                justifyContent: 'space-between',
                alignItems: 'center',
                marginHorizontal: 15,
                marginVertical: 8,
              }}>
              <EDRTLText
                title={strings('orderId') + this.currentOrderDict.order_id}
                style={stylesCurrentOrder.popupName}
              />
              <Icon
                size={18}
                name={'close'}
                // type="ant-design"
                color={EDColors.text}
                onPress={this.dismissOrderDetails}
              />
            </EDRTLView>
            <View style={stylesCurrentOrder.separator} />

            <View
              style={{marginBottom: 0}}
              onLayout={
                this.state.dottedLineHeightForPopup == 10
                  ? this.onPopUpLayout
                  : null
              }>
              <EDRTLView
                style={[
                  stylesCurrentOrder.acceptHeader,
                  {alignItems: 'center'},
                ]}>
                <EDRTLView style={{flex: 1, alignItems: 'center'}}>
                  <View style={{paddingTop: 5, alignSelf: 'flex-start'}}>
                    {/* <View style={{ backgroundColor: EDColors.white, padding: 7, borderRadius: 50, marginHorizontal: 15, shadowColor: EDColors.text, shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, }}> */}
                    <Icon
                      name="compass"
                      type="entypo"
                      size={16}
                      color={EDColors.primary}
                      raised
                    />
                    {/* </View> */}
                  </View>
                  <View style={{flex: 1, marginHorizontal: 5}}>
                    <EDRTLText
                      title={strings('pickFrom')}
                      style={[
                        stylesCurrentOrder.popupTitle,
                        {
                          marginBottom: 3,
                          textDecorationLine: 'none',
                          fontFamily: EDFonts.medium,
                          fontSize: getProportionalFontSize(12),
                          color: EDColors.text,
                        },
                      ]}
                    />
                    <EDRTLText
                      title={this.currentOrderDict.name}
                      style={[
                        [
                          stylesCurrentOrder.popupName,
                          {
                            fontFamily: EDFonts.semiBold,
                            fontSize: getProportionalFontSize(14),
                          },
                        ],
                      ]}
                    />
                    <EDRTLText
                      title={this.currentOrderDict.res_address}
                      style={[
                        [
                          stylesCurrentOrder.popupName,
                          {
                            fontFamily: EDFonts.semiBold,
                            fontSize: getProportionalFontSize(14),
                          },
                        ],
                      ]}
                    />
                  </View>
                </EDRTLView>
                <EDRTLView>
                  <Icon
                    reverse
                    raised
                    size={13}
                    name={'phone'}
                    type={'simple-line-icon'}
                    color={EDColors.primary}
                    onPress={this.buttonCallPressed}
                  />
                  <Icon
                    reverse
                    raised
                    size={13}
                    name={'directions'}
                    type="font-awesome-5"
                    color={EDColors.primary}
                    onPress={this.openMapHandler}
                  />
                </EDRTLView>
              </EDRTLView>
            </View>

            {/* DOTTED LINE */}

            <Dash
              style={{
                top:
                  this.state.dottedPopupTop +
                  this.state.topHeight +
                  getProportionalFontSize(13),
                position: 'absolute',
                width: 1,
                height: this.state.dottedLineHeightForPopup * 0.75,
                flexDirection: 'column',
                left: isRTLCheck() ? null : 34.5,
                right: isRTLCheck() ? 34.5 : null,
                zIndex: -1,
              }}
              dashColor={EDColors.grayNew}
              dashThickness={1.5}
            />
            <View
              onLayout={
                this.state.dottedLineHeightForPopup == 10
                  ? this.onPopUpLayoutBottom
                  : null
              }>
              <EDRTLView
                style={[
                  stylesCurrentOrder.acceptHeader,
                  {alignItems: 'center'},
                ]}>
                <EDRTLView style={{flex: 1, alignItems: 'center'}}>
                  <View style={{paddingTop: 5, alignSelf: 'flex-start'}}>
                    {/* <View style={{ backgroundColor: EDColors.white, padding: 5, borderRadius: 50, marginHorizontal: 15, shadowColor: EDColors.text, shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, }}> */}
                    <Icon
                      name="location-outline"
                      type="ionicon"
                      size={16}
                      color={EDColors.primary}
                      raised
                    />
                    {/* </View> */}
                  </View>
                  <View style={{flex: 1, marginHorizontal: 5}}>
                    <EDRTLText
                      title={strings('deliverTo')}
                      style={[
                        stylesCurrentOrder.popupTitle,
                        {
                          marginBottom: 3,
                          textDecorationLine: 'none',
                          fontFamily: EDFonts.medium,
                          fontSize: getProportionalFontSize(12),
                          color: EDColors.text,
                        },
                      ]}
                    />
                    <EDRTLText
                      title={this.currentOrderDict.user_name}
                      style={[
                        [
                          stylesCurrentOrder.popupName,
                          {
                            fontFamily: EDFonts.semiBold,
                            fontSize: getProportionalFontSize(14),
                          },
                        ],
                      ]}
                    />
                    <EDRTLText
                      title={this.currentOrderDict.address}
                      style={[
                        [
                          stylesCurrentOrder.popupName,
                          {
                            fontFamily: EDFonts.semiBold,
                            fontSize: getProportionalFontSize(14),
                          },
                        ],
                      ]}
                    />
                  </View>
                </EDRTLView>
                <EDRTLView>
                  <Icon
                    reverse
                    raised
                    size={13}
                    name={'phone'}
                    type={'simple-line-icon'}
                    color={EDColors.primary}
                    onPress={() => this.buttonCallPressed(true)}
                  />
                  <Icon
                    reverse
                    raised
                    size={13}
                    name={'directions'}
                    type="font-awesome-5"
                    color={EDColors.primary}
                    onPress={() => this.openMapHandler(true)}
                  />
                </EDRTLView>
              </EDRTLView>
            </View>

            {/* CASH TEXT */}
            <View style={[stylesCurrentOrder.acceptHeader]}>
              <EDRTLView style={{alignItems: 'center'}}>
                {/* <View style={{ backgroundColor: EDColors.white, padding: 7, borderRadius: 50, marginHorizontal: 15, shadowColor: EDColors.text, shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, }} > */}
                <Icon
                  name="wallet-outline"
                  type="ionicon"
                  size={16}
                  color={EDColors.primary}
                  raised
                />

                {/* </View> */}

                <View>
                  <EDRTLText
                    title={
                      this.currentOrderDict.order_type == 'cod'
                        ? strings('cashToCollect')
                        : strings('paidAmount')
                    }
                    style={[
                      stylesCurrentOrder.text,
                      {
                        fontFamily: EDFonts.medium,
                        fontSize: getProportionalFontSize(12),
                        color: EDColors.text,
                      },
                    ]}
                  />
                  <EDRTLText
                    title={
                      this.currentOrderDict.currency_symbol +
                      funGetFrench_Curr(
                        this.currentOrderDict.total_rate,
                        1,
                        this.props.lan,
                      )
                    }
                    style={[
                      stylesCurrentOrder.boldText,
                      {
                        marginTop: 3,
                        fontFamily: EDFonts.semiBold,
                        fontSize: getProportionalFontSize(14),
                      },
                    ]}
                  />
                </View>
              </EDRTLView>
            </View>

            {/* instruction text */}
            {this.currentOrderDict.delivery_instructions !== null &&
            this.currentOrderDict.delivery_instructions !== undefined &&
            this.currentOrderDict.delivery_instructions.trim().length > 0 ? (
              <View style={[stylesCurrentOrder.acceptHeader]}>
                <EDRTLView style={{alignItems: 'center'}}>
                  <Icon
                    name="comment"
                    type={'octicon'}
                    size={16}
                    color={EDColors.primary}
                    raised
                  />

                  <View style={{flex: 1}}>
                    <EDRTLText
                      title={strings('instruction')}
                      style={[
                        stylesCurrentOrder.text,
                        {
                          fontFamily: EDFonts.medium,
                          fontSize: getProportionalFontSize(12),
                          color: EDColors.text,
                        },
                      ]}
                    />
                    <EDRTLText
                      title={this.currentOrderDict.delivery_instructions}
                      style={[
                        stylesCurrentOrder.boldText,
                        {
                          marginTop: 3,
                          fontFamily: EDFonts.semiBold,
                          fontSize: getProportionalFontSize(14),
                        },
                      ]}
                    />
                  </View>
                </EDRTLView>
              </View>
            ) : null}
            <View style={stylesCurrentOrder.separator} />
            <EDRTLView
              style={[
                stylesCurrentOrder.acceptRejectView,
                {marginTop: 10, marginHorizontal: 15},
              ]}>
              <EDButton
                label={strings('cancel')}
                onPress={this.onCancelOrderPress}
                style={[
                  stylesCurrentOrder.acceptButton,
                  {
                    backgroundColor: EDColors.offWhite,
                    borderRadius: 16,
                    height: '100%',
                  },
                ]}
                textStyle={{
                  fontSize: getProportionalFontSize(16),
                  fontFamily: EDFonts.medium,
                  margin: 8,
                  color: EDColors.black,
                }}
              />

              <EDButton
                label={
                  this.currentOrderDict.order_status.toLowerCase() === 'ongoing'
                    ? strings('orderDeliver')
                    : strings('orderPickup')
                }
                onPress={
                  this.currentOrderDict.order_status.toLowerCase() === 'ongoing'
                    ? this.deliveredOrder
                    : this.pickupOrder
                }
                style={[
                  stylesCurrentOrder.acceptButton,
                  {borderRadius: 16, height: '100%'},
                ]}
                textStyle={{
                  fontSize: getProportionalFontSize(16),
                  fontFamily: EDFonts.medium,
                  margin: 8,
                  color: EDColors.white,
                }}
              />
            </EDRTLView>
          </View>
        </View>
      </EDPopupView>
    );
  };

  onDidBlurCurrentContainer = () => {
    BackgroundService.stop();
  };
  // RENDER METHOD
  render() {
    return (
      <BaseContainer
        title={strings('currentOrder')}
        left={isRTLCheck() ? 'arrow-forward' : 'arrow-back'}
        titleContainerStyle={{flex: 6}}
        onLeft={this.navigateToBack}
        loading={this.state.isLoading}
        right={'more'}
        iconFamily="material"
        onRight={this.openProductsListHandler}>
        <NavigationEvents
          onBlur={this.onDidBlurCurrentContainer}
          navigationProps={this.props}
        />

        <MapView
          style={stylesCurrentOrder.centerContainer}
          region={{
            latitude: this.state.curr_latitude,
            longitude: this.state.curr_longitude,
            latitudeDelta: this.state.latitudeDelta,
            longitudeDelta: this.state.longitudeDelta,
          }}
          provider={Platform.OS == 'ios' ? null : PROVIDER_GOOGLE}
          zoom={100}
          zoomEnabled={true}>
          <Marker
            coordinate={{
              latitude: this.state.curr_latitude,
              longitude: this.state.curr_longitude,
            }}
            image={Assets.driver}
          />
          {this.coords !== undefined &&
          this.coords instanceof Array &&
          this.coords.length > 0 ? (
            <Polyline
              coordinates={this.coords}
              strokeColor={EDColors.primary}
              strokeWidth={2}
              geodesic={true}
            />
          ) : null}
          {this.res_latitude !== undefined &&
          this.res_latitude !== null &&
          this.res_latitude !== NaN ? (
            <Marker
              coordinate={{
                latitude: this.res_latitude,
                longitude: this.res_longitude,
              }}
              image={Assets.restaurant}
              ref={this.setMarkerRef}>
              <Callout>
                <Text style={stylesCurrentOrder.calloutText} numberOfLines={1}>
                  {this.currentOrderDict.name}
                </Text>
              </Callout>
            </Marker>
          ) : null}
          {this.dest_latitude !== undefined &&
          this.dest_latitude !== null &&
          this.dest_latitude !== NaN ? (
            <Marker
              coordinate={{
                latitude: this.dest_latitude,
                longitude: this.dest_longitude,
              }}
              image={Assets.destination}
            />
          ) : null}
        </MapView>
        <View style={stylesCurrentOrder.absoluteView}>
          {this.state.unAssigned ? (
            this.renderAcceptPopUp()
          ) : (
            <View style={stylesCurrentOrder.bottomView}>
              <View style={{marginVertical: 15, marginBottom: 20}}>
                <EDRTLView>
                  {/* <View style={{ backgroundColor: EDColors.white, padding: 5, borderRadius: 50, marginHorizontal: 10, shadowColor: EDColors.text, shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, }}> */}

                  <Icon
                    name="location-outline"
                    type="ionicon"
                    size={16}
                    color={EDColors.primary}
                    raised
                  />
                  {/* </View> */}
                  <View style={{flex: 1}}>
                    <EDRTLText
                      title={
                        this.currentOrderDict.order_status.toLowerCase() ===
                        'ongoing'
                          ? strings('deliverTo')
                          : strings('pickFrom')
                      }
                      style={[
                        stylesCurrentOrder.text,
                        {
                          fontSize: getProportionalFontSize(12),
                          fontFamily: EDFonts.medium,
                          color: EDColors.text,
                        },
                      ]}
                    />
                    <EDRTLText
                      title={
                        this.currentOrderDict.order_status.toLowerCase() ===
                        'ongoing'
                          ? this.currentOrderDict.user_name +
                            ', ' +
                            this.currentOrderDict.address
                          : this.currentOrderDict.name +
                            ', ' +
                            this.currentOrderDict.res_address
                      }
                      style={[
                        stylesCurrentOrder.boldText,
                        {
                          marginTop: 5,
                          fontSize: getProportionalFontSize(14),
                          fontFamily: EDFonts.semiBold,
                        },
                      ]}
                    />
                  </View>
                </EDRTLView>
              </View>
              <EDRTLView
                style={{
                  borderTopWidth: 1,
                  paddingTop: 20,
                  borderTopColor: '#F6F6F6',
                  marginBottom: 5,
                }}>
                <EDButton
                  label={strings('view')}
                  onPress={this.expandSheet}
                  textStyle={[
                    stylesCurrentOrder.viewBtnText,
                    {
                      color: EDColors.black,
                      fontSize: getProportionalFontSize(16),
                      fontFamily: EDFonts.medium,
                    },
                  ]}
                  style={[
                    stylesCurrentOrder.acceptButton,
                    {borderWidth: 0, backgroundColor: EDColors.offWhite},
                  ]}
                />

                <EDButton
                  label={
                    this.currentOrderDict.order_status.toLowerCase() ===
                    'ongoing'
                      ? strings('orderDeliver')
                      : strings('orderPickup')
                  }
                  onPress={
                    this.currentOrderDict.order_status.toLowerCase() ===
                    'ongoing'
                      ? this.deliveredOrder
                      : this.pickupOrder
                  }
                  textStyle={[
                    stylesCurrentOrder.viewBtnText,
                    {
                      fontSize: getProportionalFontSize(16),
                      fontFamily: EDFonts.medium,
                    },
                  ]}
                  style={stylesCurrentOrder.acceptButton}
                />
              </EDRTLView>
            </View>
          )}
          {this.renderOrderDetails()}
          {this.reviewDialog()}
          {this.orderDetailRender()}
          {this.cancelOrderModalRender()}
          {this.deliverDialog()}
        </View>
      </BaseContainer>
    );
  }
  //#endregion

  //#region TRACK DRIVER LOCATION
  /**
   * @param { latitude cordinate for traking } latitude
   * @param { longitude cordinate for traking } longitude
   */
  driverTracking = (latitude, longitude) => {
    netStatus(status => {
      if (status) {
        let param = {
          user_id: this.props.userData.UserID,
          latitude: latitude,
          longitude: longitude,
          language_slug: this.props.lan,
        };
        updateDriverLocation(
          param,
          this.onSuccessTracking,
          this.onFailureTracking,
          this.props,
        );
      } else {
        showNoInternetAlert();
      }
    });
  };

  rejectOrderCheck = () => {
    netStatus(status => {
      if (status) {
        let objPickUpParams = {
          user_id: this.props.userData.UserID,
          order_id: this.currentOrderDict.order_id,
          driver_map_id: this.currentOrderDict.driver_map_id,
          order_status: 'cancel',
          cancel_reason: this.strCancelReason,
          language_slug: this.props.lan,
        };
        this.setState({isLoading: true, isCancelModalVisible: false});
        acceptOrder(
          objPickUpParams,
          this.onSuccessRejectOrder,
          this.onFailureRejectOrder,
          this.props,
        );
      } else {
        showNoInternetAlert();
      }
    });
  };

  onSuccessRejectOrder = () => {
    this.setState({isLoading: false});
    this.navigateToBack();
  };

  onFailureRejectOrder = onFailure => {
    this.setState({isLoading: false});
    this.navigateToBack();
  };

  acceptOrderCheck = () => {
    netStatus(status => {
      if (status) {
        let objPickUpParams = {
          user_id: this.props.userData.UserID,
          order_id: this.currentOrderDict.order_id,
          driver_map_id: this.currentOrderDict.driver_map_id,
          language_slug: this.props.lan,
        };
        this.setState({isLoading: true, isCancelModalVisible: false});
        acceptOrder(
          objPickUpParams,
          this.onSuccessAcceptOrder,
          this.onFailureAcceptOrder,
          this.props,
        );
      } else {
        showNoInternetAlert();
      }
    });
  };

  onSuccessAcceptOrder = onSuccess => {
    this.setState({isLoading: false});
    if (onSuccess.data.status == RESPONSE_SUCCESS) {
      showTopDialogue(onSuccess.message);
      //PROCESS ORDER UPDATE NOW ON
      this.setState({unAssigned: false});
      this.getPolyline();
    } else {
      showTopDialogue(onSuccess.message, true);
      setTimeout(() => this.navigateToBack(), 3000);
    }
  };

  onFailureAcceptOrder = onFailure => {
    this.setState({isLoading: false});
    showTopDialogue(onFailure.message, true);
    setTimeout(() => this.navigateToBack(), 3000);
  };

  pickupOrder = () => {
    netStatus(status => {
      if (status) {
        let objPickUpParams = {
          user_id: this.props.userData.UserID,
          order_id: this.currentOrderDict.order_id,
          driver_map_id: this.currentOrderDict.driver_map_id,
          language_slug: this.props.lan,
        };
        this.setState({
          orderPopup: false,
          isLoading: true,
          isCancelModalVisible: false,
        });
        pickupOrderAPI(
          objPickUpParams,
          this.onSuccessPickupOrder,
          this.onFailurePickupOrder,
          this.props,
        );
      } else {
        this.setState({
          orderPopup: false,
        });
        showNoInternetAlert();
      }
    });
  };

  onSuccessPickupOrder = onSuccess => {
    if (onSuccess.data.status == RESPONSE_SUCCESS) {
      this.currentOrderDict.order_status = 'onGoing';
      showTopDialogue(onSuccess.message);
      this.getPolyline();
    } else showTopDialogue(onSuccess.message, true);
    this.setState({isLoading: false});
  };

  onFailurePickupOrder = onFailure => {
    this.setState({isLoading: false});
    showTopDialogue(onFailure.message, true);
  };

  deliveredOrder = () => {
    netStatus(status => {
      if (status) {
        this.setState({
          orderPopup: false,
          isLoading: true,
          isDeliveryVisible: false,
        });
        let objOrderDeliver = {
          user_id: this.props.userData.UserID,
          order_id: this.currentOrderDict.order_id,
          status: 'delivered',
          subtotal: this.currentOrderDict.subtotal,
        };
        ordersDeliver(
          objOrderDeliver,
          this.onSuccessDeliveredOrder,
          this.onFailureDeliveredOrder,
          this.props,
        );
      } else {
        this.setState({
          orderPopup: false,
        });
        showNoInternetAlert();
      }
    });
  };

  onSuccessDeliveredOrder = response => {
    this.setState({
      // isModalVisible: true,
      isLoading: false,
    });
    this.navigateToBack();
  };
  onFailureDeliveredOrder = response => {
    this.setState({
      isLoading: false,
    });
    this.navigateToBack();
  };

  fetchCancelReasons = () => {
    netStatus(status => {
      if (status) {
        let objPickUpParams = {
          language_slug: this.props.lan,
          reason_type: 'cancel',
          user_type: 'Driver',
        };
        getCancelReasonList(
          objPickUpParams,
          this.onSuccessReasonList,
          this.onFailureReasonList,
          this.props,
        );
      } else {
        showNoInternetAlert();
      }
    });
  };

  onSuccessReasonList = onSuccess => {
    if (
      onSuccess.data !== undefined &&
      onSuccess.data !== null &&
      onSuccess.data.status == RESPONSE_SUCCESS
    ) {
      let reasons = [];
      onSuccess.data.reason_list.map(data => {
        reasons.push({
          label: data.reason,
          value: data.reason,
        });
      });
      this.cancelReasonArray = reasons.concat(this.cancelReasonArray);
    }
  };

  onFailureReasonList = onFailure => {};

  cancelOrderCheck = () => {
    netStatus(status => {
      if (status) {
        this.setState({
          orderPopup: false,
          isLoading: true,
        });
        let objCancelParams = {
          user_id: this.props.userData.UserID,
          order_id: this.currentOrderDict.order_id,
          driver_map_id: this.currentOrderDict.driver_map_id,
          order_status: 'cancel',
          cancel_reason: this.strCancelReason,
          language_slug: this.props.lan,
        };
        cancelOrder(
          objCancelParams,
          this.onSuccessCancelOrder,
          this.onFailureCancelOrder,
          this.props,
        );
      } else {
        this.setState({
          orderPopup: false,
        });
        showNoInternetAlert();
      }
    });
  };

  onSuccessCancelOrder = response => {
    this.navigateToBack();
    this.setState({
      isLoading: false,
    });
  };
  onFailureCancelOrder = response => {
    this.setState({
      isLoading: false,
    });
    showTopDialogue(response.message, true);
  };

  addReviewAPI = (rating, strReview) => {
    netStatus(status => {
      if (status) {
        this.setState({
          isLoading: true,
          isModalVisible: false,
        });
        let objAddOrderDeliver = {
          rating: rating,
          review: strReview,
          order_user_id: this.currentOrderDict.order_id,
          user_id: this.props.userData.UserID,
        };
        addReview(
          objAddOrderDeliver,
          this.onSuccessAddreview,
          this.onFailureAddReview,
          this.props,
        );
      } else {
        showNoInternetAlert();
      }
    });
  };

  onSuccessAddreview = response => {
    this.setState({
      isLoading: false,
    });
    this.navigateToBack();
  };
  onFailureAddReview = response => {
    this.setState({
      isLoading: false,
    });
    showDialogue(response, '', [], this.navigateToBack);
  };

  onSuccessTracking = () => {};

  onFailureTracking = () => {};

  onCancelOrderPress = () => {
    this.setState({
      isCancelModalVisible: true,
      orderPopup: false,
    });
  };

  onDismissCancellationReasonDialogueHandler = flag => {
    if (flag == undefined || flag == null || flag == '') {
      this.setState({isCancelModalVisible: false});
      return;
    }
    this.strCancelReason = flag;
    this.cancelOrderCheck();
  };

  dismissProductsListHandler = () => {
    this.setState({
      isOrderDetailVisible: false,
    });
  };
  openProductsListHandler = () => {
    this.setState({
      isOrderDetailVisible: true,
    });
  };

  dismissReviewHandler = (rating, review) => {
    this.addReviewAPI(rating, review);
  };

  navigateToBack = () => {
    this.props.navigation.goBack();
  };
  //#endregion
}

//#endregion

export default connect(
  state => {
    return {
      userData: state.userOperations.userData,
      lan: state.userOperations.lan,
      googleMapKey: state.userOperations.googleMapKey,
      useMile: state.userOperations.useMile,
    };
  },
  dispatch => {
    return {
      saveCredentials: detailsToSave => {
        dispatch(saveUserDetailsInRedux(detailsToSave));
      },
    };
  },
)(CurrentOrderContainerNew);

const stylesCurrentOrder = StyleSheet.create({
  absoluteView: {
    borderRadius: 32,
  },
  centerContainer: {flex: 1, width: Metrics.screenWidth, alignSelf: 'center'},
  calloutText: {padding: 5, maxWidth: 150},
  deliverModal: {
    // flex : 1,
    margin: 10,
    padding: 10,
    backgroundColor: EDColors.white,
    borderRadius: 5,
  },
  textHeader: {
    color: EDColors.primary,
    fontFamily: EDFonts.bold,
    fontSize: getProportionalFontSize(16),
  },
  text: {
    color: EDColors.primary,
    fontFamily: EDFonts.bold,
    fontSize: getProportionalFontSize(13),
  },
  boldText: {
    color: EDColors.black,
    fontFamily: EDFonts.regular,
    fontSize: getProportionalFontSize(14),
  },
  acceptPopUp: {
    backgroundColor: EDColors.white,
    width: Metrics.screenWidth * 0.95,
    alignSelf: 'center',
    paddingVertical: 15,
    marginBottom: 15,
  },
  acceptHeader: {
    // justifyContent: 'space-between',
    marginVertical: 10,
    marginHorizontal: 10,
  },
  acceptRejectView: {
    alignItems: 'center',
    // justifyContent: "flex-end",
    justifyContent: 'center',
  },
  acceptButton: {
    backgroundColor: EDColors.primary,
    // marginEnd: 0,
    borderRadius: 16,
    // maxWidth: Metrics.screenWidth * .45,
    flex: 1,
    marginHorizontal: 10,
  },
  separator: {
    borderWidth: 0.5,
    borderColor: '#F6F6F6',
    marginVertical: 7.5,
  },
  bottomView: {
    backgroundColor: EDColors.white,
    padding: 10,
    // alignItems: "center",
    borderTopRightRadius: 32,
    borderTopLeftRadius: 32,
    // borderWidth:5
    marginTop: -20,
  },
  viewBtnText: {
    fontFamily: EDFonts.medium,
    fontSize: getProportionalFontSize(13),
    margin: 8,
  },
  popupName: {
    color: EDColors.black,
    fontFamily: EDFonts.semiBold,
    fontSize: getProportionalFontSize(16),
  },
  popupTitle: {
    color: EDColors.primary,
    fontFamily: EDFonts.bold,
    fontSize: getProportionalFontSize(15),
    marginBottom: 7.5,
  },
  address: {
    color: EDColors.textAccount,
    fontFamily: EDFonts.regular,
    fontSize: getProportionalFontSize(13),
    marginTop: 2.5,
  },
  dottedLine: {
    borderStyle: 'dotted',
    borderWidth: 1,
    borderRadius: 1,
    borderColor: EDColors.textAccount,
    marginHorizontal: 26,
    width: 1,
  },
});
