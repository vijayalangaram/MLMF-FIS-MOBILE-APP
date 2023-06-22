import React from "react";
import { FlatList, RefreshControl, SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import { connect } from "react-redux";
import EDCommissionOrders from "../components/EDCommissionOrders";
import EDPlaceholderComponent from "../components/EDPlaceholderComponent";
import { strings } from "../locales/i18n";
import { saveNavigationSelection } from "../redux/actions/Navigation";
import { EDColors } from "../utils/EDColors";
import { netStatus } from "../utils/NetworkStatusConnection";
import { getEarnings } from "../utils/ServiceManager";
import BaseContainer from "./BaseContainer";
import NavigationEvents from '../components/NavigationEvents';
import { saveCurrencySymbol, saveEarningInRedux } from "../redux/actions/User";

class MyEarningContainer extends React.PureComponent {
    constructor(props) {
        super(props);
        this.route = this.props.route.name
        this.userDetails = this.props.userData
        this.commissionArray = []
        this.strOnScreenTitleMessage = ''
        this.strOnScreenSubMessage = ''
    }
    state = {
        isLoading: false,
        strOnScreenTitleMessage: '',
        strOnScreenSubMessage: ''
    };

    componentDidMount() {
    }

    onConnectionChangeHandler = () => {
        this.getEarningData()
    }

    onDidFocus = () => {
        this.props.saveNavigationSelection(strings("myEarning"))
        this.getEarningData()

    }

    /** RENDER METHOD */
    render() {
        return (
            <BaseContainer
                title={strings("myEarning")}
                left={this.route == 'myEarning' ? 'menu' : 'arrow-back'}
                onLeft={this.onLeftPressed}
                loading={this.state.isLoading}
                onConnectionChangeHandler={this.onConnectionChangeHandler} >
                <NavigationEvents onFocus={this.onDidFocus} navigationProps={this.props} />
                {/* MAIN VIEW */}
                <View style={{ flex: 1 }}>

                    {/* SAFE AREA VIEW */}
                    <SafeAreaView style={{ flex: 1 }}>
                        {/* IS PREVIOUS ORDER AVAILABLE */}
                        {this.commissionArray !== undefined && this.commissionArray.length > 0 ?

                            // FLATLIST 
                            <FlatList
                                style={{ flex: 1, marginBottom: 15 }}
                                extraData={this.state}
                                showsVerticalScrollIndicator={true}
                                showsHorizontalScrollIndicator={false}
                                horizontal={false}
                                data={this.commissionArray}
                                renderItem={this.earningRenderView}
                                keyExtractor={(item, index) => item + index}
                                initialNumToRender={0}
                                initialScrollIndex={0}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={false}
                                        title={strings("refresh")}
                                        titleColor={EDColors.textAccount}
                                        tintColor={EDColors.textAccount}
                                        colors={[EDColors.textAccount]}
                                        onRefresh={this.getEarningData}
                                    />
                                }

                            /> : (this.state.strOnScreenTitleMessage || '').trim().length > 0 ?
                                <View style={{ flex: 1 }}>
                                    <ScrollView
                                        contentContainerStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                                        refreshControl={
                                            <RefreshControl
                                                refreshing={this.refreshing || false}
                                                titleColor={EDColors.textAccount}
                                                title={strings("refresh")}
                                                tintColor={EDColors.textAccount}
                                                colors={[EDColors.textAccount]}
                                                onRefresh={this.getEarningData}
                                            />
                                        }>
                                        <EDPlaceholderComponent
                                            title={this.state.strOnScreenTitleMessage}
                                            subTitle={this.state.strOnScreenSubMessage} />
                                    </ScrollView>
                                </View> : null
                        }
                    </SafeAreaView>
                </View>
            </BaseContainer>
        );
    }

    earningRenderView = (order) => {
        return <EDCommissionOrders
            orderCommission={order.item}
            lan={this.props.lan}
        />
    }

    onLeftPressed = () => {
        this.route == 'myEarning' ? this.props.navigation.openDrawer()
            : this.props.navigation.goBack()
    }

    //#region NETWORK
    /** 
     * 
     */
    getEarningData = () => {

        netStatus(status => {
            if (status) {
                let param = {
                    user_id: this.userDetails.UserID,
                    language_slug: this.props.lan,
                }
                this.strOnScreenTitleMessage = '';
                this.strOnScreenSubMessage = '';
                this.commissionArray = [];
                this.setState({ isLoading: true, strOnScreenTitleMessage: '', strOnScreenSubMessage: '' })
                getEarnings(param, this.onSuccessEarning, this.onFailureEarning, this.props);
            } else {
                this.strOnScreenTitleMessage = strings("noInternetTitle")
                this.strOnScreenSubMessage = strings("noInternet")
                this.commissionArray = [];
                this.setState({ isLoading: false, strOnScreenTitleMessage: strings("noInternetTitle"), strOnScreenSubMessage: strings("noInternet") })
            }
        })
    }

    /**
     * @param { Success object objSuccess} objSuccess
     */
    onSuccessEarning = objSuccess => {
        this.strOnScreenTitleMessage = strings("noPreviousOrder")
        this.setState({ strOnScreenTitleMessage: strings("noPreviousOrder") })
        if (objSuccess.data.total_earning !== undefined &&
            objSuccess.data.total_earning !== null &&
            objSuccess.data.total_earning !== "" &&
            objSuccess.data.total_earning !== "0.00"
        ) {
            this.props.saveTotalEarning(objSuccess.data.total_earning)
        }
        this.props.saveCurrency(objSuccess.data.currency)

        if (objSuccess.data.CommissionList !== undefined &&
            objSuccess.data.CommissionList.last.length > 0) {
            this.commissionArray = objSuccess.data.CommissionList.last
        } else {
            this.strOnScreenTitleMessage = strings("noPreviousOrder")
            this.setState({ strOnScreenTitleMessage: strings("noPreviousOrder") })
        }

        this.setState({ isLoading: false })
    }

    /**
    * @param { Failure object objFailure} objFailure
    */
    onFailureEarning = (objFailure) => {
        this.strOnScreenTitleMessage = strings("noPreviousOrder")
        this.setState({ strOnScreenTitleMessage: strings("noPreviousOrder") })
        this.setState({
            isLoading: false
        })
    }
    //#endregion
}

const styles = StyleSheet.create({
    sectionHeader: {
        marginTop: 15,
        fontSize: 18,
        marginHorizontal: 10,
    },
    item: {
        padding: 10,
        fontSize: 18,
        height: 44,
    }
})

export default connect(
    state => {
        return {
            userData: state.userOperations.userData,
            lan: state.userOperations.lan,
        };
    },
    dispatch => {
        return {
            saveNavigationSelection: dataToSave => {
                dispatch(saveNavigationSelection(dataToSave));
            },
            saveTotalEarning: token => {
                dispatch(saveEarningInRedux(token))
            },
            saveCurrency: token => {
                dispatch(saveCurrencySymbol(token))
            }
        };
    }
)(MyEarningContainer);