/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-cond-assign */
/* eslint-disable react/self-closing-comp */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable semi */
/* eslint-disable curly */
/* eslint-disable quotes */
/* eslint-disable prettier/prettier */
import moment from 'moment';
import React, {Component} from 'react';
import {
  FlatList,
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {Icon} from 'react-native-elements';
import Share from 'react-native-share';
import {connect} from 'react-redux';
import CancelReasonsList from '../components/CancelReasonsList';
import EDAcceptRejectButtons from '../components/EDAcceptRejectButtons';
import EDButton from '../components/EDButton';
import EDCustomerDetails from '../components/EDCustomerDetails';
import EDDateTimeDetails from '../components/EDDateTimeDetails';
import EDDropdown from '../components/EDDropdown';
import EDImage from '../components/EDImage';
import EDItemUpdateModal from '../components/EDItemUpdateModal';
import EDPlaceholderComponent from '../components/EDPlaceholderComponent';
import EDPopupView from '../components/EDPopupView';
import EDRefundAlert from '../components/EDRefundAlert';
import EDRTLDropDownText from '../components/EDRTLDropDownText';
import EDRTLText from '../components/EDRTLText';
import EDRTLTextInput from '../components/EDRTLTextInput';
import EDRTLView from '../components/EDRTLView';
import NavigationEvents from '../components/NavigationEvents';
import {strings} from '../locales/i18n';
import {
  showDialogue,
  showNoInternetAlert,
  showTopDialogue,
} from '../utils/EDAlert';
import {EDColors} from '../utils/EDColors';
import {
  capiString,
  debugLog,
  funGetDateStr,
  funGetFrench_Curr,
  getProportionalFontSize,
  isRTLCheck,
  RESPONSE_SUCCESS,
  TextFieldTypes,
  THIRD_PARTY_DELIVERY,
} from '../utils/EDConstants';
import {EDFonts} from '../utils/EDFontConstants';
import Metrics from '../utils/metrics';
import {netStatus} from '../utils/NetworkStatusConnection';
import {
  acceptNRejectOrderAPI,
  assignDriverAPI,
  editOrder,
  getDriverListAPI,
  initiateRefundAPI,
  payOrder,
  printOrder,
  updateOrderStatusAPI,
} from '../utils/ServiceManager';
import BaseContainer from './BaseContainer';

const NEWARRAYLIST = [];
class OrderDetailsContainer extends Component {
  constructor(props) {
    super(props);
    this.orderData = this.props.route.params.order;
    this.readOnly = this.props.route.params.readOnly || false;
    this.arrayDrivers = undefined;
    this.arrayOrderStatus = undefined;
    this.arrayPayment = [strings('orderCash'), strings('orderCard')];
  }
  state = {
    strOnScreenTitle: '',
    strOnScreenMessage: '',
    refreshCount: 0,
    isAccetped: false,
    selectedDriver: '',
    selectedOrderStatus: '',
    driverPickerOpen: false,
    statusPickerClick: false,
    isLoading: true,
    shouldShowModal: false,
    rejectReason: '',
    showEmptyField: false,
    order: undefined,
    isCancelOrder: false,
    dropdownValue: undefined,
    sendRejectReason: '',
    assignedDriver:
      this.props.route.params.order.driver !== undefined
        ? this.props.route.params.order.driver.first_name
        : undefined,
    showPaymentModal: false,
    selectedPaymentMethod: '',
    paymentPicker: false,
    paymentMethod: '',
    transaction_number: '',
    isPaid:
      this.props.route.params.order.paid_status == 'unpaid' ? false : true,
    isThirdPartyVisible: false,
    showCartModal: false,
    shouldShowRefund: false,
  };

  componentDidMount = () => {};
  onDidFocusOrderDetail = () => {
    let qty = 0;
    this.orderData.items.map(data => {
      qty = qty + Number(data.quantity);
    });
    this.totalItemQty = qty;
    this.getDriverList();
  };

  /**
   * Fetch driver list
   */

  getDriverList = () => {
    netStatus(status => {
      if (status) {
        let driverListParams = {
          token: this.props.userDetails.PhoneNumber,
          user_id: this.props.userDetails.UserID,
          language_slug: this.props.lan,
          order_id: this.orderData.order_id,
          restaurant_id: this.orderData.restaurant_id,
        };
        this.setState({isLoading: true});
        getDriverListAPI(
          driverListParams,
          this.onSuccessDriverList,
          this.onFailureDriverList,
          this.props,
        );
      } else {
        showNoInternetAlert();
        this.setState({isLoading: false});
      }
    });
  };

  /**
   * On driver fetch success
   */

  onSuccessDriverList = onSuccess => {
    // MY CODE
    // console.log('====================================');
    // console.log("Assigned Driver ::", this.state.assignedDriver);
    // console.log('====================================');
    // if (
    //   (onSuccess.status =
    //     RESPONSE_SUCCESS &&
    //     onSuccess.data !== undefined &&
    //     this.state.assignedDriver != null)
    // ) {
    //   NEWARRAYLIST.length = 0;
    //   for (let index = 0; index <= onSuccess.data.drivers.length; index++) {
    //     // console.log("on Sucess : ", onSuccess.data.drivers[index].entity_id);
    //     if (
    //       this.props.route.params.order.driver.driver_id !==
    //       onSuccess.data.drivers[index].entity_id
    //     ) {
    //       // console.log("a",onSuccess.data.drivers[index]);
    //       NEWARRAYLIST.push(onSuccess.data.drivers[index]);
    //     }
    //     this.arrayDrivers = NEWARRAYLIST;
    //     this.arrayOrderStatus = onSuccess.data.order_status_remain;
    //     this.arrayStaticStatus = onSuccess.data.order_status;
    //   }
    // } else {
      if (
        (onSuccess.status = RESPONSE_SUCCESS && onSuccess.data !== undefined)
      ) {
        this.arrayDrivers = onSuccess.data.drivers;
        this.arrayOrderStatus = onSuccess.data.order_status_remain;
        this.arrayStaticStatus = onSuccess.data.order_status;
      }
    this.setState({isLoading: false});
  };

  /**
   * On driver fetch failure
   */

  onFailureDriverList = onFailure => {
    this.setState({isLoading: false});
  };

  printPDF = () => {
    netStatus(status => {
      if (status) {
        this.setState({isLoading: true});
        let param = {
          language_slug: this.props.lan,
          token: this.orderData.users.mobile_number,
          user_id: this.props.userDetails.UserID,
          order_id: this.orderData.order_id,
        };
        // console.log("PrintOrderParams::::::", param)
        printOrder(param, this.onSuccessPrintOrder, this.onFailurePrintOrder);
      } else {
        // console.log("No Internet")
        showTopDialogue(strings('generalNoInternet'), true);
      }
    });
  };
  sharePdf = pdf => {
    let openOptions = {
      title: strings('shareReceipt'),
      url: pdf,
    };
    Share.open(openOptions);
  };
  onSuccessPrintOrder = onSuccess => {
    if (onSuccess != undefined) {
      // console.log("onSucess::::: ", onSuccess)
      if (onSuccess.data.status == RESPONSE_SUCCESS) {
        // console.log("onSuccessPrint:::::::: ", onSuccess)
        if (
          onSuccess.data.order_receipt_link != undefined &&
          onSuccess.data.order_receipt_link != null &&
          onSuccess.data.order_receipt_link != ''
        ) {
          this.sharePdf(onSuccess.data.order_receipt_link);
          this.setState({isLoading: false});
        } else {
          this.setState({isLoading: false});
          // showTopDialogue(strings("printError"), true)
        }
      } else {
        // console.log("onSuccess.status != 1")
        this.setState({isLoading: false});
        showTopDialogue(onSuccess.message, true);
      }
    } else {
      showTopDialogue(strings('generalWebServiceError'), false);
    }
  };
  onFailurePrintOrder = onFailure => {
    debugLog('FAILURE PRINT :::::', onFailure);
    this.setState({isLoading: false});
    showTopDialogue(strings('generalWebServiceError'), true);
  };
  renderThirdPartyModal = () => {
    return (
      <EDPopupView isModalVisible={this.state.isThirdPartyVisible}>
        <CancelReasonsList
          title={strings('chooseDelivery')}
          validationMsg={strings('deliveryError')}
          onDismissCancellationReasonDialogueHandler={
            this.onDismissDeliveryHandler
          }
          reasonList={this.availableDeliveryModes}
        />
      </EDPopupView>
    );
  };
  showCartEditModal = () => {
    this.setState({showCartModal: true});
  };
  hideCartEditModal = () => {
    this.setState({showCartModal: false});
  };
  buttonSubmitPressed = (updatedItems, reason) => {
    this.hideCartEditModal();
    netStatus(status => {
      if (status) {
        this.setState({isLoading: true});
        var params = {
          language_slug: this.props.lan,
          updated_items: '' + JSON.stringify(updatedItems),
          order_id: this.orderData.order_id,
          restaurant_id: this.orderData.restaurant_id,
          user_id: this.props.userDetails.UserID,
          partial_refund_reason: reason,
        };
        // debugLog("ITEMS :::::", JSON.stringify(updatedItems))

        // debugLog("PARAMS :::::", JSON.stringify(params))
        // this.setState({isLoading : false})
        // return;
        editOrder(
          params,
          this.onSuccessEditOrder,
          this.onFailureEditOrder,
          this.props,
        ); //this.onFailureEditOrder,
      } else showNoInternetAlert();
    });
  };
  onSuccessEditOrder = onSuccess => {
    this.setState({isLoading: false});
    if (onSuccess.data.status == RESPONSE_SUCCESS) {
      showTopDialogue(strings('updateSuccessful'));
      setTimeout(this.goBack, 1000);
    } else showTopDialogue(onSuccess.message, true);
  };

  // onFailureEditOrder = (onFailure) => {
  //     this.setState({ isLoading: false })
  //     showTopDialogue(onFailure.message, true)
  // }
  // onSuccessEditOrder = (onSuccess,onFailure) => {
  //     if (onSuccess != undefined) {
  //     this.setState({ isLoading: false })

  //     if (onSuccess.data.status == RESPONSE_SUCCESS) {
  //         showTopDialogue(strings("updateSuccessful"))
  //         setTimeout(this.goBack, 1000)
  //     }
  //     else
  //     this.setState({ isLoading: false })
  //     showTopDialogue(onFailure.message, true)
  //     setTimeout(this.goBack, 1000)

  // }
  // }
  onFailureEditOrder = onFailure => {
    this.setState({isLoading: false});
    //showTopDialogue(onFailure.message, true)
    showTopDialogue(strings('updateSuccessful'));
    setTimeout(this.goBack, 1000);
  };
  renderCartEditModal = () => {
    return (
      <EDPopupView
        isModalVisible={this.state.showCartModal}
        onRequestClose={this.hideCartEditModal}>
        <EDItemUpdateModal
          orderData={this.orderData}
          onDismiss={this.hideCartEditModal}
          buttonSubmitPressed={this.buttonSubmitPressed}
        />
      </EDPopupView>
    );
  };

  /** RENDER */
  render() {
    let subtotal = this.orderData.price.filter(data => {
      return data.label_key == 'Sub Total';
    });
    return (
      <BaseContainer
        title={strings('orderDetails') + ' - #' + this.orderData.order_id}
        left={isRTLCheck() ? 'arrow-forward' : 'arrow-back'}
        onLeft={this.buttonBackPressed}
        right={'print'}
        onRight={this.printPDF}
        loading={this.state.isLoading}
        connection={this.onConnectionChangeHandler}>
        <NavigationEvents
          onFocus={this.onDidFocusOrderDetail}
          navigationProps={this.props}
        />

        {/* PARENT VIEW */}
        <EDRTLView style={styles.mainViewStyle}>
          {this.renderRefundModal()}
          {/* REJECT ORDER POPUP VIEW */}
          {this.renderCancelReasonPopUp()}
          {this.renderPaymentModal()}
          {this.renderThirdPartyModal()}
          {this.renderCartEditModal()}

          {/* PLACEHOLDER CONDITION */}
          {this.state.strOnScreenTitle != '' &&
          this.state.strOnScreenTitle.length > 0 ? (
            <EDRTLView style={styles.quantityText}>
              <EDPlaceholderComponent
                title={this.state.strOnScreenTitle}
                subTitle={this.state.strOnScreenMessage}
              />
            </EDRTLView>
          ) : (
            // MAIN VIEW
            <EDRTLView style={styles.edrtlViewStyle}>
              {/* SCROLL VIEW */}
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Order Details */}

                <View>
                  <EDDateTimeDetails
                    timeOfOrder={funGetDateStr(
                      this.orderData.order_date,
                      'hh:mm A',
                    )}
                    dateOfOrder={funGetDateStr(
                      this.orderData.order_date,
                      'MMM DD YYYY',
                    )}
                    scheduled_date={this.orderData.scheduled_date}
                    slot_open_time={this.orderData.slot_open_time}
                    slot_close_time={this.orderData.slot_close_time}
                    // driverName="Test"
                    driverName={
                      this.state.assignedDriver !== undefined
                        ? this.state.assignedDriver
                        : this.orderData.thirdparty_driver_details !==
                            undefined &&
                          this.orderData.thirdparty_driver_details !== null &&
                          this.orderData.thirdparty_driver_details
                            .first_name !== undefined &&
                          this.orderData.thirdparty_driver_details
                            .first_name !== null &&
                          this.orderData.thirdparty_driver_details.first_name.trim()
                            .length !== 0
                        ? this.orderData.thirdparty_driver_details.first_name
                        : this.orderData.driver !== undefined
                        ? this.orderData.driver.first_name
                        : undefined
                    }
                  />
                </View>

                {this.orderData.delivery_type == 'Schedule' &&
                this.orderData.delivery_type != undefined &&
                this.orderData.delivery_type != null ? (
                  <View style={[styles.orderView, styles.marginStyle]}>
                    <EDRTLView style={styles.rowContainer}>
                      <Icon
                        name="info"
                        color={EDColors.text}
                        size={getProportionalFontSize(15)}
                      />
                      <EDRTLText
                        title={
                          strings('orderPreOrderTime') +
                          ' ' +
                          moment(this.orderData.delivery_date, [
                            'h:mm A',
                          ]).format('HH:mm')
                        }
                        style={styles.orderTimeStyle}
                      />
                    </EDRTLView>
                  </View>
                ) : null}

                <View
                  style={[
                    styles.orderView,
                    {
                      flexDirection: isRTLCheck() ? 'row-reverse' : 'row',
                      padding: 0,
                    },
                  ]}>
                  <View
                    style={[
                      styles.balckTopBorderStyle,
                      {
                        borderTopLeftRadius: isRTLCheck() ? 0 : 24,
                        borderTopRightRadius: isRTLCheck() ? 24 : 0,
                        borderBottomRightRadius: isRTLCheck() ? 24 : 0,
                        borderBottomLeftRadius: isRTLCheck() ? 0 : 24,
                      },
                    ]}
                  />

                  <View
                    style={[
                      styles.headerOrderDetailView,
                      {
                        borderLeftColor: isRTLCheck()
                          ? 'white'
                          : EDColors.black,
                      },
                    ]}>
                    {/* {this.orderData.is_delayed == "1" ?
                                            <EDRTLView style={styles.rowContainer}>
                                                <Icon name="running" color={EDColors.primary} size={15} type={'font-awesome-5'} />
                                                <EDRTLText title={strings("orderDelayed")} style={[styles.orderStatus,{color : EDColors.error, fontFamily : EDFonts.semibold}]} />
                                            </EDRTLView> : null} */}
                    <EDRTLView style={[styles.rowContainer, {flex: 1}]}>
                      <Icon
                        name="clockcircleo"
                        color={EDColors.primary}
                        size={getProportionalFontSize(13)}
                        type={'ant-design'}
                      />
                      <EDRTLText
                        title={strings('orderCurrentStatus')}
                        style={styles.orderStatus}
                      />
                      <EDRTLText
                        title={this.orderData.order_status_display}
                        style={styles.orderStatus2}
                      />
                      {this.orderData.is_delayed == '1' ? (
                        <EDRTLText
                          title={' (' + strings('orderDelayed') + ')'}
                          style={[styles.orderStatus2, {color: EDColors.error}]}
                        />
                      ) : null}
                    </EDRTLView>
                    <EDRTLView style={styles.rowContainer}>
                      <Icon
                        name="bike"
                        color={EDColors.primary}
                        size={getProportionalFontSize(15)}
                        type={'material-community'}
                      />
                      <EDRTLText
                        title={strings('orderType')}
                        style={styles.orderStatus}
                      />
                      {/* <EDRTLText title={(this.orderData.delivery_flag == "pickup" ? strings('orderPickup') : this.orderData.delivery_flag == "dinein" ? strings("orderDinein") : strings("orderDelivery"))} style={styles.orderStatus2} /> */}
                      {/* new code */}
                      <EDRTLText
                        title={
                          this.orderData.delivery_flag == 'pickup'
                            ? strings('orderPickup')
                            : this.orderData.delivery_flag == 'dinein'
                            ? strings('orderDinein')
                            : this.orderData.delivery_flag == 'delivery'
                            ? strings('orderDelivery')
                            : strings('donation')
                        }
                        style={styles.orderStatus2}
                      />
                    </EDRTLView>
                    {/* {this.orderData.delivery_method !== undefined &&
                                            this.orderData.delivery_method !== null &&
                                            this.orderData.delivery_method.trim().length !== 0 ?
                                             <EDRTLView style={styles.rowContainer}>
                                                <Icon name="shipping-fast" color={EDColors.primary} size={getProportionalFontSize(12)} type={'font-awesome-5'} />
                                                <EDRTLText title={strings("deliveryMethod") + ":"} style={styles.orderStatus} />
                                                <EDRTLText title={this.orderData.delivery_method_display} style={styles.orderStatus2} />
                                              </EDRTLView>
                                            : null} */}
                    {this.orderData.delivery_flag == 'dinein' &&
                    this.orderData.table_number != null &&
                    this.orderData.table_number != '' ? (
                      <EDRTLView style={styles.rowContainer}>
                        <Icon
                          name="restaurant-outline"
                          color={EDColors.primary}
                          size={getProportionalFontSize(15)}
                          type={'ionicon'}
                        />
                        <EDRTLText
                          title={strings('orderTable')}
                          style={styles.orderStatus}
                        />
                        <EDRTLText
                          title={this.orderData.table_number}
                          style={styles.orderStatus2}
                        />
                      </EDRTLView>
                    ) : null}
                    {this.orderData.delivery_flag == 'dinein' &&
                    this.orderData.paid_status != null &&
                    this.orderData.paid_status != '' ? (
                      <EDRTLView style={styles.rowContainer}>
                        <Icon
                          name="attach-money"
                          color={EDColors.primary}
                          size={getProportionalFontSize(15)}
                        />
                        <EDRTLText
                          title={strings('orderPaymentStatus')}
                          style={styles.orderStatus}
                        />
                        <EDRTLText
                          title={
                           this.state.isPaid  ==false // added 
                              ? strings('orderUnPaid')
                              : strings('orderPaidDineIn') 
                          }
                          style={styles.orderStatus2}
                        />
                      </EDRTLView>
                    ) : null}
                    {/* {this.orderData.delivery_flag == "dinein" ? null : */}
                    <EDRTLView style={styles.rowContainer}>
                      <Icon
                        name="creditcard"
                        type="ant-design"
                        color={EDColors.primary}
                        size={getProportionalFontSize(13)}
                      />
                      <EDRTLText
                        title={strings('orderPaymentMode')}
                        style={styles.orderStatus}
                      />
                      <EDRTLText
                        title={this.orderData.payment_option}
                        style={styles.orderStatus2}
                      />
                    </EDRTLView>
                    {/* } */}
                    {this.orderData.order_platform !== undefined &&
                    this.orderData.order_platform !== null ? (
                      <EDRTLView style={styles.rowContainer}>
                        <Icon
                          name="devices-other"
                          color={EDColors.primary}
                          size={getProportionalFontSize(13)}
                        />
                        <EDRTLText
                          title={strings('orderPlatform')}
                          style={styles.orderStatus}
                        />
                        <EDRTLText
                          title={capiString(this.orderData.order_platform)}
                          style={styles.orderStatus2}
                        />
                      </EDRTLView>
                    ) : null}
                    {this.orderData.refund_status !== undefined &&
                    this.orderData.refund_status !== null &&
                    this.orderData.refund_status !== '' ? (
                      <EDRTLView style={styles.rowContainer}>
                        <Icon
                          name="credit-card-refund-outline"
                          type="material-community"
                          color={EDColors.primary}
                          size={getProportionalFontSize(17)}
                          containerStyle={{marginLeft: -3}}
                        />
                        <EDRTLText
                          title={strings('refundStatus') + ':'}
                          style={styles.orderStatus}
                        />
                        <EDRTLText
                          title={capiString(this.orderData.refund_status)}
                          style={[styles.orderStatus2, {color: EDColors.error}]}
                        />
                      </EDRTLView>
                    ) : null}
                    {this.orderData.tips_refund_status !== undefined &&
                    this.orderData.tips_refund_status !== null &&
                    this.orderData.tips_refund_status !== '' ? (
                      <EDRTLView style={styles.rowContainer}>
                        <Icon
                          name="credit-card-refund-outline"
                          type="material-community"
                          color={EDColors.primary}
                          size={getProportionalFontSize(17)}
                          containerStyle={{marginLeft: -3}}
                        />
                        <EDRTLText
                          title={strings('tipRefundStatus')}
                          style={styles.orderStatus}
                        />
                        <EDRTLText
                          title={capiString(this.orderData.tips_refund_status)}
                          style={[styles.orderStatus2, {color: EDColors.error}]}
                        />
                      </EDRTLView>
                    ) : null}
                  </View>
                </View>
                {this.orderData.order_status == 'Cancel' &&
                this.orderData.cancel_reason != undefined &&
                this.orderData.cancel_reason != null &&
                this.orderData.cancel_reason != '' ? (
                  <EDRTLView style={styles.mainView}>
                    <EDRTLText
                      title={strings('orderCancelReason') + ': '}
                      style={styles.textStyle1}></EDRTLText>
                    <EDRTLText
                      title={this.orderData.cancel_reason}
                      style={styles.textStyle2}></EDRTLText>
                  </EDRTLView>
                ) : this.orderData.order_status == 'Rejected' &&
                  this.orderData.reject_reason != undefined &&
                  this.orderData.reject_reason != null &&
                  this.orderData.reject_reason != '' ? (
                  <EDRTLView style={styles.mainView}>
                    <EDRTLText
                      title={strings('orderRejectReason') + ': '}
                      style={styles.textStyle1}></EDRTLText>
                    <EDRTLText
                      title={this.orderData.reject_reason}
                      style={styles.textStyle2}></EDRTLText>
                  </EDRTLView>
                ) : null}

                {this.orderData.refund_reason != undefined &&
                this.orderData.refund_reason != null &&
                this.orderData.refund_reason != '' ? (
                  <EDRTLView style={styles.mainView}>
                    <EDRTLText
                      title={strings('refundReason') + ': '}
                      style={styles.textStyle1}></EDRTLText>
                    <EDRTLText
                      title={this.orderData.refund_reason}
                      style={styles.textStyle2}></EDRTLText>
                  </EDRTLView>
                ) : null}

                {this.orderData.delivery_method ==
                THIRD_PARTY_DELIVERY ? null : !this.readOnly &&
                  this.orderData.order_accepted != 0 ? (
                  <View>
                    <View>
                      {/* DRIVER ASSIGN */}
                      {this.orderData.delivery_flag === 'delivery' ? (
                        <View style={styles.orderView}>
                          <EDRTLDropDownText
                            title={
                              this.state.assignedDriver == undefined
                                ? strings('generalAssignDriver')
                                : strings('generalReassignDriver')
                            }
                            label={strings('selectOwn')}
                            placeholder={this.state.selectedDriver}
                            touchMethodEvent={this.driverPickerClick}
                            textStyle={styles.dropDownTextStyle}
                            containerStyle={styles.dropdownContainerStyle}
                            containerTextStyle={
                              styles.dropdownContainerTextStyle
                            }
                            iconName={'keyboard-arrow-down'}
                            iconType={'material'}
                          />
                          {this.state.driverPickerOpen ? (
                            <EDPopupView
                              onRequestClose={this.onRequestCloseDriverPicker}>
                              <EDDropdown
                                title={strings('generalChooseDriver')}
                                dropDownArray={this.arrayDrivers !=undefined && this.arrayDrivers !=null &&this.arrayDrivers.length !=0 && this.props.route.params.order.driver !==undefined && this.props.route.params.order.driver !==null ?
                                this.arrayDrivers.filter(data=>{return(data.entity_id !=this.props.route.params.order.driver.driver_id )}):this.arrayDrivers
                                }
                                placeholder={this.state.selectedDriver}
                                onSelectionChange={
                                  this.onDropdownDriverValueChange
                                }
                                CloseClick={this.onRequestCloseDriverPicker}
                              />
                            </EDPopupView>
                          ) : null}
                        </View>
                      ) : null}

                      {/* ORDER STATUS */}
                      <View style={styles.orderView}>
                        <EDRTLDropDownText
                          title={strings('generalUpdateStatus')}
                          label={
                            this.state.selectedOrderStatus == ''
                              ? this.orderData.order_status_display
                              : this.state.selectedOrderStatus
                          }
                          placeholder={this.state.selectedOrderStatus}
                          touchMethodEvent={this.statusPickerClick}
                          textStyle={styles.dropDownTextStyle}
                          containerTextStyle={styles.dropdownContainerTextStyle}
                          containerStyle={styles.dropdownContainerStyle}
                          iconName={'keyboard-arrow-down'}
                          iconType={'material'}
                        />
                        {this.state.statusPickerClick ? (
                          <EDPopupView
                            onRequestClose={this.onRequestCloseDriverPicker}>
                            <EDDropdown
                              dropDownArray={this.arrayOrderStatus}
                              title={strings('generalUpdateStatus')}
                              onSelectionChange={
                                this.onDropdownStatusValueChange
                              }
                              CloseClick={this.onRequestCloseDriverPicker}
                              forOrderStatus={true}
                            />
                          </EDPopupView>
                        ) : null}
                      </View>
                    </View>
                  </View>
                ) : null}

                {/* CUSTOMER DETAILS */}

                <View style={styles.orderFlexView}>
                  <EDRTLText
                    title={strings('orderCustomer')}
                    style={styles.customerText}
                  />
                  <EDCustomerDetails
                    name={this.orderData.users.first_name}
                    image={this.orderData.users.image}
                    // address={
                    //     this.orderData.delivery_flag == "pickup" ? "" :
                    //         this.orderData.users.address}
                    // landmark={
                    //     this.orderData.delivery_flag == "pickup" ? "" :
                    //         this.orderData.users.landmark}
                    phoneNumber={this.orderData.users.mobile_number}
                    onPhonePressed={this.onPhonePressed}
                  />
                </View>

                {/* RESTAURANT DETAILS */}

                {/* <View style={styles.orderFlexView}>
                                        <EDRTLText title={strings('orderRestDetails')} style={styles.restaurantText} />
                                        <EDCustomerDetails
                                            name={this.orderData.restaurant_name}
                                            image={this.orderData.restaurant_image}
                                            address={this.orderData.restaurant_address}
                                            phoneNumber={this.orderData.restaurant_phone_number}
                                            landmark={this.orderData.restaurant_landmark}
                                            onPhonePressed={this.onPhonePressed}
                                        />
                                    </View> */}

                <View style={styles.orderView}>
                  <View style={styles.flatlistChildView}>
                    <FlatList
                      showsVerticalScrollIndicator={false}
                      data={this.orderData.items}
                      renderItem={this.renderOrderDetails}
                      keyExtractor={(item, index) => item + index}
                    />
                  </View>

                  {/* PAYMENT DETAILS */}
                  {subtotal !== undefined &&
                  subtotal !== null &&
                  subtotal.length > 0 ? (
                    <EDRTLView style={styles.paymentView}>
                      {/* <FlatList
                                            showsVerticalScrollIndicator={false}
                                            style={styles.screenWidthStyle}
                                            // data={this.orderData.price.filter(data => { return data.value !== undefined && data.value !== null && data.value !== "" && data.value !== "0.00" })}
                                            renderItem={this.renderPaymentDetails}
                                            keyExtractor={(item, index) => item + index}
                                        /> */}
                      <EDRTLText
                        style={styles.paymentDetailsStyle}
                        title={subtotal[0].label}
                      />
                      <EDRTLText
                        title={
                          this.orderData.currency_symbol +
                          funGetFrench_Curr(
                            subtotal[0].value,
                            1,
                            this.props.lan,
                          )
                        }
                        style={styles.paymentDetailsStyle}
                      />
                    </EDRTLView>
                  ) : null}

                  {!(
                    this.orderData.refund_status !== undefined &&
                    this.orderData.refund_status !== null &&
                    this.orderData.refund_status.trim().length !== 0
                  ) &&
                  this.orderData.order_status.toLowerCase() == 'accepted' &&
                  this.totalItemQty > 1 ? (
                    <EDButton
                      label={strings('updateCart')}
                      onPress={this.showCartEditModal}
                      textStyle={{fontSize: getProportionalFontSize(13)}}
                      style={styles.updateCartBtn}
                    />
                  ) : null}
                  {/* ORDER DESCRIPTION IF ANY */}
                  {/* {this.orderData.extra_comment != undefined && this.orderData.extra_comment.length > 0 ? (
                                        <EDRTLView style={[styles.orderDesView, { alignSelf: isRTLCheck() ? "flex-end" : "flex-start", flexWrap: "wrap" }]} >
                                            <EDRTLText style={styles.orderDescriptionTitle} title={strings('generalOrderDescription')} />
                                            <EDRTLText style={styles.orderDescription} title={this.orderData.extra_comment} />
                                        </EDRTLView>
                                    ) : null} */}

                  {/* DELIVERY DESCRIPTION IF ANY */}
                  {this.orderData.delivery_instructions != undefined &&
                  (this.orderData.delivery_instructions != undefined) !==
                    null &&
                  this.orderData.delivery_instructions.length > 0 ? (
                    <EDRTLView
                      style={[
                        styles.orderDesView,
                        {
                          alignSelf: isRTLCheck() ? 'flex-end' : 'flex-start',
                          flexWrap: 'wrap',
                        },
                      ]}>
                      <EDRTLText
                        style={styles.orderDescriptionTitle}
                        title={strings('deliveryDescription')}
                      />
                      <EDRTLText
                        style={styles.orderDescription}
                        title={this.orderData.delivery_instructions}
                      />
                    </EDRTLView>
                  ) : null}

                  {/* BUTTONS VIEW */}

                  {this.orderData.order_status !== 'Rejected' &&
                  this.orderData.order_status !== 'Cancel' &&
                  !this.orderData.order_accepted &&
                  !this.readOnly ? (
                    <EDRTLView style={styles.buttonViewStyle}>
                      <EDAcceptRejectButtons
                        isShowAcceptButton={true}
                        onAcceptPressed={this.onAcceptPressed}
                        onRejectPressed={this.onRejectPressed}
                        onRefundPressed={this.initiateRefund}
                        isShowRefundButton={
                          this.orderData.order_type !== 'cod' &&
                          (!this.orderData.refund_flag ||
                            this.orderData.tips_refund_flag == false)
                        }
                      />
                      {/* {
                                                <EDButton textStyle={styles.buttonTextStyle} style={styles.acceptButtonStyle} label={strings('refund')} onPress={this.initiateRefund} />
                                                : null} */}
                    </EDRTLView>
                  ) : null}
                  {this.orderData.order_accepted &&
                  this.orderData.order_type !== 'cod' &&
                  (!this.orderData.refund_flag ||
                    this.orderData.tips_refund_flag == false) ? (
                    <EDRTLView style={styles.buttonViewStyle}>
                      <EDButton
                        textStyle={styles.buttonTextStyle}
                        style={styles.acceptButtonStyle}
                        label={strings('refund')}
                        onPress={this.initiateRefund}
                      />
                    </EDRTLView>
                  ) : null}
                </View>

                {this.orderData.delivery_flag == 'dinein' &&
                this.orderData.paid_status == 'unpaid' &&
                 (this.state.isPaid == false)   // new code
                 ?    
                (
                  <EDRTLView style={styles.footerPaidView}>
                    <EDRTLText
                      title={strings('orderMarkPaid')}
                      style={styles.markPaidText}
                    />
                    <TouchableOpacity
                      style={styles.paidButton}
                      onPress={this.onPaidButtonClick}>
                      <EDRTLText
                        title={strings('dialogYes')}
                        style={styles.yesButtonStyle}
                      />
                    </TouchableOpacity>
                  </EDRTLView>
                ) : null}
              </ScrollView>
            </EDRTLView>
          )}
        </EDRTLView>
      </BaseContainer>
    );
  }
  //#endregion

  onPaidButtonClick = () => {
    this.setState({showPaymentModal: true});
  };

  dismissPaymentModal = () => {
    this.setState({showPaymentModal:false});
  };

  renderPaymentModal = () => {
    return (
      <EDPopupView isModalVisible={this.state.showPaymentModal}>
        <View style={styles.parentPaymentView}>
          <EDRTLView style={styles.paymentHeaderStyle}>
            <EDRTLText
              title={strings('orderAddPayment')}
              style={styles.paymentTitleStyle}
            />
            <Icon
              name={'close'}
              size={getProportionalFontSize(15)}
              onPress={this.dismissPaymentModal}
            />
          </EDRTLView>
          <View>
            <EDRTLView style={styles.paymentMainViewStyle}>
              <EDRTLText
                title={strings('orderPaymentMethod')}
                style={styles.paymentMethodStyle}
              />
              <EDRTLDropDownText
                // title={strings("orderSelectPayment")}
                isMandatory={false}
                label={
                  this.state.paymentMethod == ''
                    ? strings('orderSelectPayment')
                    : this.state.paymentMethod
                }
                touchMethodEvent={this.paymentPickerClick}
                textStyle={styles.paymentTextStyle}
                containerStyle={styles.paymentDropDownContainer}
                iconName={'keyboard-arrow-down'}
                iconType={'material'}
              />
              {this.state.paymentPicker ? (
                <EDPopupView onRequestClose={this.dismissPaymentPicker}>
                  <EDDropdown
                    dropDownArray={this.arrayPayment}
                    title={strings('orderSelectPayment')}
                    onSelectionChange={this.onDropdownPaymentModeChange}
                    CloseClick={this.dismissPaymentPicker}
                    forOrderStatus={true}
                  />
                </EDPopupView>
              ) : null}
            </EDRTLView>

            {this.state.paymentMethod == strings('orderCash') ? null : (
              <EDRTLView style={styles.paymentButtonStyle}>
                <EDRTLText
                  title={strings('orderTransactionNo')}
                  style={[styles.paymentMethodStyle, {flex: 1}]}
                />
                <EDRTLTextInput
                  style={styles.transNoInputStyle}
                  textstyle={styles.textStyle}
                  type={TextFieldTypes.default}
                  placeholder={''}
                  onChangeText={this.changeTransactionNumber}
                  initialValue={this.state.transaction_number}
                  maxLength={20}
                />
              </EDRTLView>
            )}
          </View>
          <EDButton
            label={strings('profileSave')}
            onPress={this.updatePaymentMethod}
            style={styles.saveButtonStyle}
            disabled={this.state.paymentMethod == '' ? true : false}
          />
        </View>
      </EDPopupView>
    );
  };

  changeTransactionNumber = text => {
    this.setState({transaction_number: text});
  };

  paymentPickerClick = () => {
    this.setState({paymentPicker: true});
  };

  dismissPaymentPicker = () => {
    this.setState({paymentPicker: false});
  };

  onDropdownPaymentModeChange = dropdownValue => {
    this.setState({paymentPicker: false, paymentMethod: dropdownValue.item});
    // this.updatePaymentMethod(dropdownValue)
  };

  updatePaymentMethod = () => {
    this.setState({showPaymentModal: false});
    netStatus(status => {
      if (status) {
        let orderParams = {
          user_id: this.props.userDetails.UserID,
          language_slug: this.props.lan,
          order_id: this.orderData.order_id,
          payment_method:
            this.state.paymentMethod == strings('orderCard') ? 'card' : 'cash',
          transaction_id: this.state.transaction_id,
        };
        this.setState({isLoading: true});
        payOrder(orderParams, this.onSuccessPay, this.onFailurePay, this.props);
      } else showNoInternetAlert();
    });
  };

  /**
   * Accept/Reject Order success
   */

  onSuccessPay = onSuccess => {
    // console.log('success-------------------------' , onSuccess)
    this.orderData.paid_status == 'paid';
    if (onSuccess.data.status == RESPONSE_SUCCESS) {
      // setTimeout(() =>{
      //     this.setState({ isLoading: false })
      //     this.goBack() }
      //     , 3000)
      this.setState({isPaid: true});
      showTopDialogue(onSuccess.message);
      this.setState({isLoading: false});
    } else {
      this.setState({isLoading: false});
      showTopDialogue(onSuccess.message, true);
    }
  };

  /**
   * Accept/Reject Order failure
   */

  onFailurePay = onFailure => {
    // console.log('-------------------------' , onFailure)
    this.setState({isLoading: false});
    showTopDialogue(onFailure.message, true);
  };

  renderCancelReasonPopUp = () => {
    return (
      <EDPopupView isModalVisible={this.state.shouldShowModal}>
        <CancelReasonsList
          noteText={
            this.orderData.order_type === 'cod'
              ? ''
              : this.state.isCancelOrder
              ? strings('cancelRefundMsg')
              : strings('rejectRefundMsg')
          }
          onDismissCancellationReasonDialogueHandler={this.onDismissHandler}
          reasonList={
            this.state.isCancelOrder
              ? this.props.cancelReasonList
              : this.props.rejectReasonList
          }
          isCancel={this.state.isCancelOrder}
        />
      </EDPopupView>
    );
  };

  onChangeTextHandler = text => {
    this.setState({
      rejectReason: text,
      showEmptyField: false,
      sendRejectReason: text,
    });
  };

  onRejectOrderPress = () => {
    if (this.state.isCancelOrder) {
      this.setState({
        shouldShowModal: false,
        selectedOrderStatus: this.state.dropdownValue.item,
        isLoading: true,
      });
      this.updateOrderStatus(this.state.dropdownValue);
    } else {
      this.setState({shouldShowModal: false, isLoading: false});
      this.acceptNRejectOrder();
    }
  };

  onDismissHandler = flag => {
    if (flag == undefined || flag == null || flag == '') {
      this.setState({shouldShowModal: false});
      return;
    }
    this.state.sendRejectReason = flag;
    this.onRejectOrderPress();
  };

  //#region RENDER VIEW
  /** ORDER DETAILS */
  renderOrderDetails = item => {
    return (
      <EDRTLView
        style={[
          styles.orderViewStyle,
          {
            alignItems:
              item.item.addons_category_list !== undefined &&
              item.item.addons_category_list !== null &&
              item.item.addons_category_list.length !== 0
                ? 'flex-start'
                : 'center',
          },
        ]}>
        <EDImage source={item.item.image} style={styles.imageRecipeStyle} />
        <View style={styles.quantityText}>
          <EDRTLView>
            <EDRTLText
              style={[
                styles.dishTextStyle,
                {
                  marginHorizontal:
                    item.item.addons_category_list !== undefined &&
                    item.item.addons_category_list !== null &&
                    item.item.addons_category_list.length !== 0
                      ? 5
                      : 10,
                },
              ]}
              title={item.item.name}
            />
            {item.item.quantity > 1 ? (
              <EDRTLText
                title={'( X' + item.item.quantity + ')'}
                style={styles.itemQuantityText}
              />
            ) : null}
            <EDRTLText
              title={
                this.orderData.currency_symbol +
                funGetFrench_Curr(item.item.itemTotal, 1, this.props.lan)
              }
              style={[
                styles.addonsPriceText,
                {textAlign: isRTLCheck() ? 'left' : 'right'},
              ]}></EDRTLText>
          </EDRTLView>
          {item.item.addons_category_list !== undefined &&
          item.item.addons_category_list !== null &&
          item.item.addons_category_list.length !== 0
            ? item.item.addons_category_list.map(data => {
                return data.addons_list.map(items => {
                  return (
                    <EDRTLView style={styles.addonsViewStyle}>
                      <EDRTLText
                        style={styles.addonsTextStyle}
                        title={
                          ' - ' +
                          items.add_ons_name +
                          (item.item.quantity > 1
                            ? ' (x' + item.item.quantity + ')'
                            : '')
                        }
                      />
                      <EDRTLText
                        style={styles.addonsSubTextStyle}
                        title={
                          this.orderData.currency_symbol +
                          funGetFrench_Curr(
                            items.add_ons_price,
                            1,
                            this.props.lan,
                          )
                        }
                      />
                    </EDRTLView>
                  );
                });
              })
            : null}
          {item.item.is_combo_item == 1 &&
          item.item.combo_item_details != '' &&
          item.item.combo_item_details != undefined &&
          item.item.combo_item_details != null ? (
            <EDRTLText
              title={item.item.combo_item_details.replaceAll('+ ', '\r\n')}
              style={[
                styles.addonsCategoryText,
                {
                  maxWidth: isRTLCheck()
                    ? Metrics.screenWidth
                    : Metrics.screenWidth * 0.45,
                },
              ]}
            />
          ) : null}
          {item.item.comment !== undefined &&
          item.item.comment !== null &&
          item.item.comment !== '' ? (
            <EDRTLText
              style={[styles.addonsTextStyle, {marginHorizontal: 10}]}
              title={strings('instruction') + ' ' + item.item.comment}
            />
          ) : null}
        </View>
      </EDRTLView>
    );
  };

  /** PAYMENT DETAILS */
  renderPaymentDetails = item => {
    return (
      <EDRTLView style={styles.paymentView}>
        <EDRTLText style={styles.paymentTypeText} title={item.item.label} />
        <EDRTLText
          title={
            item.item.label_key.includes('Service') ||
            item.item.label_key.includes('Credit') ||
            item.item.label_key.includes('Delivery')
              ? isRTLCheck()
                ? '+ ' +
                  this.orderData.currency_symbol +
                  funGetFrench_Curr(item.item.value, 1, this.props.lan)
                : '+ ' +
                  this.orderData.currency_symbol +
                  funGetFrench_Curr(item.item.value, 1, this.props.lan)
              : item.item.label_key.includes('Discount') ||
                item.item.label_key.includes('Coupon')
              ? isRTLCheck()
                ? '- ' +
                  this.orderData.currency_symbol +
                  funGetFrench_Curr(item.item.value, 1, this.props.lan)
                : '- ' +
                  this.orderData.currency_symbol +
                  funGetFrench_Curr(item.item.value, 1, this.props.lan)
              : item.item.label_key.includes('Driver')
              ? isRTLCheck()
                ? '+ ' +
                  this.orderData.currency_symbol +
                  funGetFrench_Curr(item.item.value, 1, this.props.lan)
                : '+ ' +
                  this.orderData.currency_symbol +
                  funGetFrench_Curr(item.item.value, 1, this.props.lan)
              : this.orderData.currency_symbol +
                funGetFrench_Curr(item.item.value, 1, this.props.lan)
          }
          style={styles.paymentDetailsStyle}
        />
      </EDRTLView>
    );
  };
  //#endregion

  //#region BUTTON EVENTS
  buttonBackPressed = () => {
    this.props.navigation.goBack();
  };

  // onAcceptPressed = () => {
  //     this.acceptNRejectOrder(true)
  // }

  onAcceptPressed = () => {
    // if (this.orderData.delivery_flag == "delivery") {
    //     if (this.orderData.is_thirdparty_delivery_available == "no") {
    //         this.availableDeliveryModes = [
    //             { reason: strings('selectOwn') }
    //         ]
    //     }
    //     else {
    //         this.availableDeliveryModes = [
    //              { reason: strings('selectOwn') },
    //              { reason: strings('3rdParty'), }
    //         ]
    //     }
    //     this.showThirdPartyModal()
    // }
    // else
    this.acceptNRejectOrder(true);
  };

  showThirdPartyModal = () => {
    this.setState({isThirdPartyVisible: true});
  };

  onDismissDeliveryHandler = (flag, index) => {
    if (flag == undefined || flag == null || flag == '') {
      this.setState({isThirdPartyVisible: false});
      return;
    }
    this.deliveryMode = index;
    this.setState({isThirdPartyVisible: false});
    this.acceptNRejectOrder(true);
  };

  onRejectPressed = () => {
    this.setState({shouldShowModal: true});
    // this.acceptNRejectOrder()
  };

  onPhonePressed = data => {
    let url = `tel:${data}`;
    if (Linking.canOpenURL(url)) Linking.openURL(url);
  };

  driverPickerClick = () => {
    netStatus(status => {
      if (status) {
        if (this.arrayDrivers !== undefined)
          this.setState({driverPickerOpen: true});
      } else showNoInternetAlert();
    });
  };

  onDropdownDriverValueChange = dropdownValue => {
    if (this.state.assignedDriver !== undefined) {
      this.setState({driverPickerOpen: false});

      showDialogue(
        strings('reAssignConfirm'),
        '',
        [{text: strings('dialogNo'), onPress: () => {}}],
        () => {
          this.setState({selectedDriver: dropdownValue.first_name});
          this.assignDriver(dropdownValue);
        },
        strings('dialogYes'),
        true,
      );
    } else {
      this.setState({
        selectedDriver: dropdownValue.first_name,
        driverPickerOpen: false,
      });
      this.assignDriver(dropdownValue);
    }
  };

  statusPickerClick = () => {
    netStatus(status => {
      if (status) {
        if (this.arrayOrderStatus !== undefined)
          this.setState({statusPickerClick: true});
      } else showNoInternetAlert();
    });
  };

  onDropdownStatusValueChange = dropdownValue => {
    this.setState({
      statusPickerClick: false,
      dropdownValue: dropdownValue,
      isLoading: true,
    });
    if (
      dropdownValue.item == 'Cancel' ||
      dropdownValue.item == 'إلغاء' ||
      dropdownValue.item == 'Annuler'
    ) {
      this.setState({
        shouldShowModal: true,
        isCancelOrder: true,
        isLoading: false,
      });
    } else {
      this.setState({selectedOrderStatus: dropdownValue.item});
      this.updateOrderStatus(dropdownValue);
    }
  };

  onRequestCloseDriverPicker = () => {
    this.setState({driverPickerOpen: false, statusPickerClick: false});
  };
  //#endregion

  //#region Networks
  onConnectionChangeHandler = isConnected => {
    if (isConnected) {
      if (
        this.arrayDrivers == undefined ||
        this.arrayDrivers.length == 0 ||
        this.arrayOrderStatus == undefined
      )
        this.getDriverList();
    }
  };

  /**
   * Accept/Reject Order
   */

  acceptNRejectOrder = accept => {
    netStatus(status => {
      if (status) {
        let orderParams = {
          user_id: this.props.userDetails.UserID,
          token: this.orderData.users.mobile_number,
          language_slug: this.props.lan,
          order_id: this.orderData.order_id,
          restaurant_id: this.orderData.restaurant_id,
          reject_reason: this.state.sendRejectReason,
          choose_delivery_method:
            this.deliveryMode !== undefined
              ? this.deliveryMode == 0
                ? 'internal_drivers'
                : 'thirdparty_delivery'
              : '',
          order_mode: this.orderData.delivery_flag,
        };
        this.setState({isLoading: true});
        acceptNRejectOrderAPI(
          orderParams,
          this.onSuccessAcceptOrder,
          this.onFailureAcceptOrder,
          [this.props, {accept: accept}],
        );
      } else showNoInternetAlert();
    });
  };

  /**
   * Accept/Reject Order success
   */

  onSuccessAcceptOrder = onSuccess => {
    // console.log('success-------------------------' , onSuccess)
    if (onSuccess.data.status == RESPONSE_SUCCESS) {
      showTopDialogue(onSuccess.message);
      setTimeout(() => this.goBack(), 3000);
    } else {
      this.setState({isLoading: false});
      showTopDialogue(onSuccess.message, true);
    }
  };

  /**
   * Accept/Reject Order failure
   */

  onFailureAcceptOrder = onFailure => {
    // console.log('-------------------------' , onFailure)
    this.setState({isLoading: false});
    showTopDialogue(onFailure.message, true);
  };

  /**
   *  Initiate refund
   */

  // initiateRefund = () => {
  //     showDialogue(strings("refundConfirm"), strings("loginAppName"), [{
  //         "text": strings("dialogNo"),
  //         isNotPreferred: undefined,
  //         onPress: () => { }
  //     }], this.processRefund, strings("dialogYes"), true, true, Number(this.orderData.total) - Number(this.orderData.refunded_amount))
  // }

  initiateRefund = () => {
    this.setState({shouldShowRefund: true});
  };

  hideRefundModal = () => {
    this.setState({shouldShowRefund: false});
  };

  renderRefundModal = () => {
    return (
      <EDRefundAlert
        shouldShowAlert={this.state.shouldShowRefund}
        hideRefundModal={this.hideRefundModal}
        orderToRefund={this.orderData}
        lan={this.props.lan}
        processRefund={this.startRefund}
      />
    );
  };

  startRefund = (refundReason, amount, refundType) => {
    this.setState({shouldShowRefund: false});
    this.processRefund(refundReason, amount, refundType);
  };

  processRefund = (refundReason, amount, refundType) => {
    netStatus(status => {
      if (status) {
        let orderParams = {
          language_slug: this.props.lan,
          order_id: this.orderData.order_id,
          user_id: this.props.userDetails.UserID,
          refund_reason: refundReason,
          partial_refundedchk: refundType == 0 ? 'full' : 'partial',
          partial_refundedamt: amount,
        };
        this.tempReason = refundReason;
        this.tempRefundStaus =
          refundType == 0 ? 'refunded' : 'partial refunded';

        this.setState({isLoading: true});
        initiateRefundAPI(
          orderParams,
          this.onSuccessRefund,
          this.onFailureRefund,
          this.props,
        );
      } else showNoInternetAlert();
    });
  };

  /**
   * Refund Order success
   */

  onSuccessRefund = onSuccess => {
    if (
      onSuccess.data !== undefined &&
      onSuccess.data.status == RESPONSE_SUCCESS
    ) {
      showTopDialogue(onSuccess.message);

      this.orderData.refund_flag = true;
      this.orderData.refund_status = this.tempRefundStaus;
      this.orderData.refund_reason =
        this.tempReason + ', ' + this.orderData.refund_reason;

      if (this.orderData.tips_refund_flag == false) {
        this.orderData.tips_refund_flag = true;
        this.orderData.tips_refund_status = 'refunded';
      }
      this.setState({isLoading: false});
      this.tempReason = '';
      this.tempRefundStaus = '';
    } else {
      this.setState({isLoading: false});
      showTopDialogue(onSuccess.message, true);
    }
  };

  /**
   *  Refund Order failure
   */

  onFailureRefund = onFailure => {
    debugLog('STATUS FAILURE :::::', onSuccess);

    this.setState({isLoading: false});
    showTopDialogue(onFailure.message, true);
  };

  /**
   * API call to assign driver
   */

  assignDriver = driverDetails => {
    netStatus(status => {
      if (status) {
        let driverParam = {
          user_id: this.props.userDetails.UserID,
          token: this.orderData.users.mobile_number,
          language_slug: this.props.lan,
          order_id: this.orderData.order_id,
          driver_id: driverDetails.entity_id,
          is_reassign: this.state.assignedDriver == undefined ? 0 : 1,
        };
        this.setState({isLoading: true});
        this.selectedDriver = driverDetails.first_name;
        assignDriverAPI(
          driverParam,
          this.onSuccessAssignDriver,
          this.onFailureAssignDriver,
          this.props,
        );
      } else showNoInternetAlert();
    });
  };

  onSuccessAssignDriver = onSuccess => {
    // console.log('success-------------------------' , onSuccess)
    // this.setState({ isLoading: false, assignedDriver: this.selectedDriver, selectedOrderStatus: this.arrayStaticStatus['preparing'] })
    this.setState({isLoading: false, assignedDriver: this.selectedDriver});
    {
      this.orderData.order_status_display == this.arrayStaticStatus['accepted']
        ? (this.orderData.order_status_display =
            this.arrayStaticStatus['accepted'])
        : null;
    }
    if (onSuccess.data.status == RESPONSE_SUCCESS) {
      showTopDialogue(onSuccess.message);
      this.getDriverList();
    } else {
      showTopDialogue(onSuccess.message, true);
    }
  };

  onFailureAssignDriver = onFailure => {
    this.setState({isLoading: false});
    showTopDialogue(onFailure.message, true);
  };

  /**
   * API call to assign driver
   */

  assignThirdPartyDriver = () => {
    netStatus(status => {
      if (status) {
        let driverParam = {
          user_id: this.props.userDetails.UserID,
          token: this.orderData.users.mobile_number,
          language_slug: this.props.lan,
          order_id: this.orderData.order_id,
          is_third_party: true,
          is_reassign: this.state.assignedDriver == undefined ? 0 : 1,
        };
        this.setState({isLoading: true});
        //this.selectedDriver = driverDetails.first_name
        assignDriverAPI(
          driverParam,
          this.onSuccessAssignThirdPartyDriver,
          this.onFailureAssignThirdPartyDriver,
          this.props,
        );
      } else showNoInternetAlert();
    });
  };

  onSuccessAssignThirdPartyDriver = onSuccess => {
    this.setState({isLoading: false, assignedDriver: this.selectedDriver});
    {
      this.orderData.order_status_display == this.arrayStaticStatus['accepted']
        ? (this.orderData.order_status_display =
            this.arrayStaticStatus['accepted'])
        : null;
    }
    if (onSuccess.data.status == RESPONSE_SUCCESS) {
      showTopDialogue(onSuccess.message);
      this.getDriverList();
    } else {
      showTopDialogue(onSuccess.message, true);
    }
  };

  onFailureAssignThirdPartyDriver = onFailure => {
    this.setState({isLoading: false});
    showTopDialogue(onFailure.message, true);
  };

  /**
   * API call to update order status
   */

  updateOrderStatus = orderStatus => {
    netStatus(status => {
      if (status) {
        let driverParam = {
          user_id: this.props.userDetails.UserID,
          token: this.orderData.users.mobile_number,
          language_slug: this.props.lan,
          order_id: this.orderData.order_id,
          order_status: Object.keys(this.arrayOrderStatus)[orderStatus.index],
          cancel_reason: this.state.sendRejectReason,
        };
        this.tempStatus = Object.keys(this.arrayOrderStatus)[orderStatus.index];
        {
          this.tempStatus == 'delivered' ||
          this.tempStatus == 'cancel' ||
          this.tempStatus == 'complete'
            ? null
            : this.setState({isLoading: true});
        }
        updateOrderStatusAPI(
          driverParam,
          this.onSuccessUpdateOrderStatus,
          this.onFailureUpdateOrderStatus,
          this.props,
        );
      } else {
        this.setState({isLoading: false});
        showNoInternetAlert();
      }
    });
  };

  onSuccessUpdateOrderStatus = onSuccess => {
    {
      this.tempStatus == 'delivered' ||
      this.tempStatus == 'cancel' ||
      this.tempStatus == 'complete'
        ? null
        : this.setState({isLoading: true});
    }
    this.orderData.order_status_display = this.state.selectedOrderStatus;
    debugLog('ORDER STATUS :::::', onSuccess);
    if (onSuccess.data.status == RESPONSE_SUCCESS) {
      showTopDialogue(onSuccess.message);
      if (
        this.tempStatus == 'delivered' ||
        this.tempStatus == 'cancel' ||
        this.tempStatus == 'complete'
      )
        setTimeout(() => this.goBack(), 3000);
      else this.getDriverList();
    } else {
      showTopDialogue(onSuccess.message, true);
    }
  };

  onFailureUpdateOrderStatus = onFailure => {
    debugLog('ORDER STATUS FAILURE:::::', onFailure);

    this.setState({isLoading: false});
    showTopDialogue(onFailure.message, true);
  };

  // function to navigate back

  goBack = () => {
    this.props.navigation.goBack();
  };

  //#endregion
}

//#region STYLES
export const styles = StyleSheet.create({
  mainViewStyle: {
    flex: 1,
    // backgroundColor: EDColors.offWhite,
  },
  textStyle: {fontSize: getProportionalFontSize(16), marginTop: 0},
  paidButton: {
    backgroundColor: EDColors.primary,
    height: Metrics.screenHeight * 0.05,
    // width: 25,
    borderRadius: 5,
    marginHorizontal: 10,
    marginVertical: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  yesButtonStyle: {
    color: EDColors.white,
    alignSelf: 'center',
    marginHorizontal: 10,
    marginVertical: 5,
    fontFamily: EDFonts.regular,
    fontSize: getProportionalFontSize(14),
  },
  orderView: {
    backgroundColor: EDColors.white,
    borderRadius: 16,
    elevation: 4,
    shadowColor: EDColors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,

    elevation: 16,
    margin: 10,
    padding: 10,
  },
  balckTopBorderStyle: {
    marginVertical: 6,
    backgroundColor: EDColors.primary,
    width: 4,
  },
  orderFlexView: {
    flex: 1,
    backgroundColor: EDColors.white,
    borderRadius: 16,
    elevation: 4,
    shadowColor: EDColors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,

    elevation: 16,
    margin: 10,
    padding: 10,
  },
  headerOrderDetailView: {paddingVertical: 10, paddingHorizontal: 15},
  addonsPriceText: {
    flex: 1,
    color: EDColors.black,
    fontFamily: EDFonts.semibold,
    fontSize: getProportionalFontSize(14),
  },
  footerPaidView: {
    flex: 1,
    backgroundColor: EDColors.white,
    borderRadius: 16,
    elevation: 4,
    shadowColor: EDColors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,

    elevation: 16,
    margin: 10,
    padding: 10,
    justifyContent: 'space-between',
  },
  columnOrderView: {
    flexDirection: 'column',
    backgroundColor: EDColors.white,
    borderRadius: 5,
    elevation: 4,
    shadowColor: EDColors.black,
    shadowOffset: {height: 2, width: 2},
    shadowOpacity: 0.2,
    margin: 10,
    padding: 10,
  },
  rowContainer: {
    alignItems: 'center',
    marginVertical: 5,
  },
  dishTextStyle: {
    marginHorizontal: 10,
    maxWidth: Metrics.screenWidth * 0.45,
    marginBottom: 5,
    color: EDColors.black,
    fontFamily: EDFonts.semibold,
    fontSize: getProportionalFontSize(14),
  },
  addonsCategoryText: {
    fontSize: getProportionalFontSize(13),
    marginHorizontal: 10,
    fontFamily: EDFonts.bold,
    maxWidth: Metrics.screenWidth * 0.45,
  },
  orderStatus: {
    marginHorizontal: 5,
    fontFamily: EDFonts.semibold,
    color: EDColors.text,
    fontSize: getProportionalFontSize(14),
  },
  customerText: {
    fontFamily: EDFonts.semibold,
    marginLeft: 5,
    fontSize: getProportionalFontSize(16),
    borderBottomColor: EDColors.radioSelected,
    borderBottomWidth: 1,
    marginBottom: -1,
  },
  restaurantText: {
    fontFamily: EDFonts.semibold,
    marginLeft: 5,
    fontSize: getProportionalFontSize(16),
    borderBottomColor: EDColors.radioSelected,
    borderBottomWidth: 1,
    marginBottom: -5,
  },
  markPaidText: {
    fontFamily: EDFonts.semibold,
    fontSize: getProportionalFontSize(16),
    alignSelf: 'center',
    marginHorizontal: 5,
    marginVertical: 5,
    flex: 1,
  },
  updateCartBtn: {
    // alignSelf: "flex-end",
    borderRadius: 16,
    marginHorizontal: 0,
    padding: 10,
    marginTop: 10,
  },
  orderTimeStyle: {
    fontFamily: EDFonts.bold,
    marginLeft: 5,
    color: EDColors.primary,
  },
  orderStatus2: {
    marginLeft: 0,
    fontFamily: EDFonts.medium,
    fontSize: getProportionalFontSize(14),
  },
  paymentDetailsView: {paddingHorizontal: 2},
  imageRecipeStyle: {
    marginHorizontal: 5,
    borderRadius: 8,
    height: getProportionalFontSize(35),
    width: getProportionalFontSize(35),
  },
  orderDescription: {
    color: EDColors.grey,
    fontSize: getProportionalFontSize(13),
    marginHorizontal: 2,
  },
  orderDescriptionTitle: {
    fontSize: getProportionalFontSize(14),
    marginHorizontal: 2,
  },
  paymentTypeText: {
    fontFamily: EDFonts.regular,
    fontSize: getProportionalFontSize(12),
    color: EDColors.text,
  },
  paymentView: {
    alignItems: 'center',
    marginVertical: 4,
    justifyContent: 'space-between',
  },
  orderViewStyle: {alignItems: 'center', marginVertical: 5, paddingBottom: 5},
  quantityText: {flex: 1},
  edrtlViewStyle: {flex: 1, flexDirection: 'column'},
  buttonViewStyle: {
    justifyContent: 'flex-end',
    marginVertical: 5,
    marginTop: 15,
    marginHorizontal: -3,
  },
  addonsViewStyle: {flex: 1, justifyContent: 'space-between', marginBottom: 0},
  screenWidthStyle: {width: Metrics.screenWidth},
  itemQuantityText: {
    color: EDColors.black,
    fontFamily: EDFonts.semibold,
    fontSize: getProportionalFontSize(14),
  },
  dropDownTextStyle: {
    fontSize: getProportionalFontSize(16),
    fontFamily: EDFonts.semibold,
    marginBottom: 5,
  },
  dropdownContainerTextStyle: {
    fontSize: getProportionalFontSize(15),
    fontFamily: EDFonts.medium,
    flex: 1,
  },
  dropdownContainerStyle: {borderRadius: 8},
  flatlistChildView: {
    borderBottomColor: EDColors.radioSelected,
    borderBottomWidth: 1,
    marginBottom: 5,
  },
  addonsTextStyle: {
    fontFamily: EDFonts.semibold,
    maxWidth: Metrics.screenWidth * 0.55,
    marginHorizontal: 10,
    fontSize: getProportionalFontSize(13),
  },
  addonsSubTextStyle: {
    fontFamily: EDFonts.semibold,
    fontSize: getProportionalFontSize(13),
  },
  marginStyle: {marginBottom: 5},
  orderDesView: {flex: 1, marginTop: 10, alignItems: 'center'},
  paymentDetailsStyle: {
    fontFamily: EDFonts.semibold,
    fontSize: getProportionalFontSize(15),
    color: EDColors.black,
  },
  parentPaymentView: {
    backgroundColor: EDColors.white,
    marginHorizontal: 20,
    borderRadius: 20,
  },
  paymentHeaderStyle: {
    justifyContent: 'space-between',
    marginHorizontal: 10,
    marginTop: 10,
  },
  paymentTitleStyle: {
    alignSelf: 'center',
    marginHorizontal: 5,
    marginVertical: 5,
    fontFamily: EDFonts.semibold,
    fontSize: getProportionalFontSize(16),
  },
  paymentMethodStyle: {
    alignSelf: 'center',
    marginHorizontal: 5,
    marginVertical: 5,
    fontFamily: EDFonts.regular,
    fontSize: getProportionalFontSize(16),
  },
  paymentMainViewStyle: {marginHorizontal: 10},
  paymentTextStyle: {
    fontSize: getProportionalFontSize(16),
    fontFamily: EDFonts.regular,
  },
  paymentDropDownContainer: {
    marginHorizontal: 10,
    borderRadius: 8,
    marginBottom: getProportionalFontSize(13),
    maxWidth: Metrics.screenWidth * 0.4,
  },
  paymentButtonStyle: {marginHorizontal: 10, marginBottom: 20},
  transNoInputStyle: {width: Metrics.screenWidth * 0.4},
  saveButtonStyle: {marginTop: 5, marginBottom: 15},
  mainView: {
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  textStyle2: {
    fontSize: getProportionalFontSize(14),
    fontFamily: EDFonts.medium,
    color: EDColors.black,
  },
  textStyle1: {
    fontSize: getProportionalFontSize(14),
    fontFamily: EDFonts.regular,
    color: EDColors.text,
  },
  buttonTextStyle: {
    fontSize: getProportionalFontSize(12),
    fontFamily: EDFonts.medium,
    marginHorizontal: 15,
    marginVertical: 5,
  },
  acceptButtonStyle: {
    marginHorizontal: 3,
    marginVertical: 0,
    padding: 0,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: EDColors.reject,
  },
});
//#endregion

export default connect(
  state => {
    return {
      lan: state.userOperations.lan,
      userDetails: state.userOperations.userDetails || {},
      rejectReasonList: state.userOperations.rejectReasonList,
      cancelReasonList: state.userOperations.cancelReasonList,
    };
  },
  dispatch => {
    return {};
  },
)(OrderDetailsContainer);
