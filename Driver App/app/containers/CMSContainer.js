/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import NetInfo from '@react-native-community/netinfo';
import React from 'react';
import {Linking, SafeAreaView, StyleSheet, View} from 'react-native';
import WebView from 'react-native-webview';
import {connect} from 'react-redux';
import EDPlaceholderComponent from '../components/EDPlaceholderComponent';
import NavigationEvents from '../components/NavigationEvents';
import {strings} from '../locales/i18n';
import {showTopDialogue} from '../utils/EDAlert';
import {EDColors} from '../utils/EDColors';
import {getProportionalFontSize} from '../utils/EDConstants';
import Metrics from '../utils/metrics';
import {netStatus} from '../utils/NetworkStatusConnection';
import {getCMSPageDetails} from '../utils/ServiceManager';
import BaseContainer from './BaseContainer';

class CMSContainer extends React.Component {
  //#region LIFE CYCLE METHODS

  /** CONSTRUCTOR */
  constructor(props) {
    super(props);
    this.title = '';
    this.fontSize = getProportionalFontSize(14);
    this.meta =
      '<head><meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0"></head>';
    this.customStyle =
      this.meta +
      '<style>* {max-width: 100%;} body {font-size:' +
      this.fontSize +
      ';}</style>';
    this.cmsSlug = '';
  }

  /** STATE */
  state = {
    isLoading: false,
    objWebViewContent: undefined,
    strErrorMessage: '',
  };

  onConnectivityChange = state => {
    if (state.isConnected) this.getCMSContent();
    else this.setState({strErrorMessage: strings('noInternet')});
  };

  onDidFocusCMSContainer = () => {
    this.connectivityChangeHandler = NetInfo.addEventListener(
      this.onConnectivityChange,
    );
  };

  openEmail = email => {
    Linking.openURL(email.url).catch(er => {
      showTopDialogue('Failed to open Link: ' + er.message, true);
    });
  };

  /** RENDER FUNCTION */
  render() {
    // SCREEN TITLE
    this.title =
      this.props.route.params !== undefined &&
      this.props.route.params.routeParams !== undefined
        ? this.props.route.params.routeParams.screenName
        : 'About Us';
    return (
      <BaseContainer
        title={this.title}
        left={'menu'}
        onLeft={this.buttonMenuPressed}
        loading={this.state.isLoading}
        // connection={this.onConnectionChangeHandler}
      >
        <View
          pointerEvents={this.state.isLoading ? 'none' : 'auto'}
          style={styles.mainContainer}>
          <NavigationEvents
            onFocus={this.onDidFocusCMSContainer}
            navigationProps={this.props}
          />

          {/* THEME HEADER */}
          {/* <EDThemeHeader icon={'menu'} onLeftButtonPress={this.buttonMenuPressed} title={this.title} /> */}

          {this.state.isLoading ? null : this.state.objWebViewContent !==
            undefined ? (
            <SafeAreaView style={{flex: 1, backgroundColor: EDColors.white}}>
              <WebView
                source={{
                  html:
                    this.customStyle + this.state.objWebViewContent.description,
                }}
                containerStyle={{flex: 1}}
                width={Metrics.screenWidth - 40}
                startInLoadingState={true}
                style={[styles.webView, {flex: 1}]}
                scrollEnabled={true}
                originWhitelist={['http://*', 'https://*', 'intent://*', '*']}
                onShouldStartLoadWithRequest={event => {
                  if (event.url.slice(0, 4) === 'http') {
                    Linking.openURL(event.url);
                    return false;
                  } else if (event.url.slice(0, 3) === 'tel') {
                    const callNumber = event.url.slice(-10);
                    Linking.openURL(`tel://${callNumber}`);
                    return false;
                  } else if (event.url.startsWith('mailto:')) {
                    this.openEmail(event);
                    return false;
                  }
                  return true;
                }}
              />
            </SafeAreaView>
          ) : this.state.strErrorMessage.length > 0 ? (
            <EDPlaceholderComponent subTitle={this.state.strErrorMessage} />
          ) : null}
        </View>
      </BaseContainer>
    );
  }

  /** CHECK IF PROPS ARE BEING UPDATED OR NOT */
  shouldComponentUpdate(nextProps, nextState) {
    if (
      nextProps.route.params !== undefined &&
      nextProps.route.params.routeParams !== undefined &&
      this.props.route.params !== undefined &&
      this.props.route.params.routeParams !== undefined &&
      this.props.route.params.routeParams.cmsSlug !==
        nextProps.route.params.routeParams.cmsSlug
    ) {
      this.getCMSContent();
    }
    return true;
  }

  //#endregion

  //#region NETWORK
  /** FETCH CMS CONTENT API CALL */
  getCMSContent() {
    netStatus(status => {
      if (status) {
        this.setState({
          isLoading: true,
          webViewContent: '',
          strErrorMessage: '',
        });
        let paramsGetCMS = {
          language_slug: this.props.lan,
          cms_slug: this.props.route.params.routeParams.cmsSlug,
        };
        this.cmsSlug = paramsGetCMS.cms_slug;
        getCMSPageDetails(
          paramsGetCMS,
          this.onSuccessCMSPage,
          this.onFailureCMSPage,
          this.props,
        );
      } else {
        // showNoInternetAlert();
        this.setState({strErrorMessage: strings('noInternet')});
      }
    });
  }

  /**
   *
   * @param {The success response object parsed from CMS API response} objSuccess
   */
  onSuccessCMSPage = objSuccess => {
    if (
      objSuccess.data !== undefined &&
      objSuccess.data.cmsData !== undefined &&
      objSuccess.data.cmsData.length > 0
    ) {
      var cmsData = objSuccess.data.cmsData[0];
      this.setState({
        isLoading: false,
        strErrorMessage: '',
        objWebViewContent: cmsData,
      });
    } else {
      this.setState({isLoading: false, strErrorMessage: objSuccess.message});
    }
  };

  /**
   *
   * @param {The failure response object parsed from CMS API response} objFailure
   */
  onFailureCMSPage = objFailure => {
    this.setState({
      objWebViewContent: undefined,
      isLoading: false,
      strErrorMessage: objFailure.message,
    });
  };

  //#endregion

  //#region BUTTON EVENTS
  /** MENU BUTTON EVENT */
  buttonMenuPressed = () => {
    this.props.navigation.openDrawer();
  };
}

//#region CONNECT METHOD
export default connect(
  state => {
    return {
      lan: state.userOperations.lan,
      userDetails: state.userOperations.userDetails,
      isLoggedIn: state.userOperations.isLoggedIn,
    };
  },
  dispatch => {
    return {};
  },
)(CMSContainer);
//#endregion

//#region STYLES
export const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: EDColors.white,
  },
  webView: {
    flex: 1,
    margin: 20,
    alignSelf: 'center',
    borderRadius: 5,
    alignItems: 'center',
  },
});
//#endregion
