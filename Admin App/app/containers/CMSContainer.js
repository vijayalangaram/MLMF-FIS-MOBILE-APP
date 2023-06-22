/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { connect } from 'react-redux';
import { ABOUT_US, debugLog, getProportionalFontSize } from '../utils/EDConstants';
import { netStatus } from '../utils/NetworkStatusConnection';
import WebView from 'react-native-webview';
import { getCMSPageDetails } from '../utils/ServiceManager';
import Metrics from '../utils/metrics';
import NavigationEvents from '../components/NavigationEvents';
import { EDColors } from '../utils/EDColors';
import EDPlaceholderComponent from '../components/EDPlaceholderComponent';
import { strings } from '../locales/i18n';
import NetInfo from '@react-native-community/netinfo'
import BaseContainer from './BaseContainer';
import { Linking } from 'react-native';
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
        isLoading: true,
        objWebViewContent: undefined,
        strErrorMessage: ''
    };

    /** COMPONENT DID MOUNT */
    componentDidMount() {
    }

    onConnectivityChange = state => {
        if (state.isConnected)
            this.getCMSContent()
        else
            this.setState({ strErrorMessage: strings("generalNoInternet") , isLoading : false})
    }

    onDidFocusCMSContainer = () => {
        this.connectivityChangeHandler = NetInfo.addEventListener(
            this.onConnectivityChange,
        )
    }
    onWillBlurCMSContainer = () => {
        if (this.props.connection !== undefined) {
            if (this.connectivityChangeHandler !== undefined) {
                this.connectivityChangeHandler()
            }
        }
    }
    openEmail = email => {
        Linking.openURL(email.url).catch(er => {
            debugLog('Failed to open Link: ' + er.message);
        });
    };
    //#endregion

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
            >
                <NavigationEvents onFocus={this.onDidFocusCMSContainer} navigationProps={this.props} />
                {this.state.isLoading
                    ? null
                    : this.state.objWebViewContent !== undefined ?
                        <SafeAreaView style={styles.mainContainer}>
                            <WebView
                                source={{ html: this.customStyle + this.state.objWebViewContent.description }}
                                containerStyle={styles.webContainerStyle}
                                width={Metrics.screenWidth - 40}
                                startInLoadingState={true}
                                style={styles.webView}
                                scrollEnabled={true}
                                originWhitelist={['http://*', 'https://*', 'intent://*', '*']}
                                onShouldStartLoadWithRequest={event => {
                                    if (event.url.slice(0, 4) === 'http') {
                                        Linking.openURL(event.url);
                                        return false;
                                    } else if (event.url.slice(0, 3) === 'tel') {
                                        const callNumber = event.url.slice(-10);
                                        console.log('====> This is phone number', callNumber);
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
                        : this.state.strErrorMessage.length > 0
                            ? <EDPlaceholderComponent title={this.state.strErrorMessage} />
                            : null}
            </BaseContainer>

        );
    }
    /** CHECK IF PROPS ARE BEING UPDATED OR NOT */
    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.route.params !== undefined &&
            nextProps.route.params.routeParams !== undefined &&
            this.props.route.params !== undefined &&
            this.props.route.params.routeParams !== undefined &&
            this.props.route.params.routeParams.cmsSlug !== nextProps.route.params.routeParams.cmsSlug
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
                this.setState({ isLoading: true, webViewContent: '', strErrorMessage: '' });
                let paramsGetCMS = {
                    language_slug: this.props.lan,
                    cms_slug: this.props.route.params.routeParams.cmsSlug || ABOUT_US,
                    user_type: "admin",
                    user_id: this.props.userDetails.UserID
                };
                this.cmsSlug = paramsGetCMS.cms_slug;
                getCMSPageDetails(paramsGetCMS, this.onSuccessCMSPage, this.onFailureCMSPage, this.props);

            } else {
                
                this.setState({ strErrorMessage: strings("generalNoInternet") ,isLoading: false})
            }
        });
    }

    /**
     *
     * @param {The success response object parsed from CMS API response} objSuccess
     */
    onSuccessCMSPage = objSuccess => {
        if (objSuccess.data !== undefined && objSuccess.data.cmsData !== undefined && objSuccess.data.cmsData.length > 0) {
            var cmsData = objSuccess.data.cmsData[0];
            this.setState({ isLoading: false, strErrorMessage: '', objWebViewContent: cmsData });
        } else {
            this.setState({ isLoading: false, strErrorMessage: objSuccess.message });
        }
    };

    /**
     *
     * @param {The failure response object parsed from CMS API response} objFailure
     */
    onFailureCMSPage = objFailure => {
        this.setState({ objWebViewContent: undefined, isLoading: false, strErrorMessage: objFailure.message });
    };


    //#endregion

    //#region BUTTON EVENTS
    /** MENU BUTTON EVENT */
    buttonMenuPressed = () => {
        this.props.navigation.openDrawer();
    }

}

//#region CONNECT METHOD
export default connect(
    state => {
        return {
            lan: state.userOperations.lan,
            userDetails: state.userOperations.userDetails || {},
            isLoggedIn: state.userOperations.isLoggedIn,
        };
    },
    dispatch => {
        return {

        };
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
        flex: 1, margin: 20,
        alignSelf: 'center',
        borderRadius: 5,
        alignItems: 'center',
    },
    webContainerStyle: { flex: 1 }
});
//#endregion
