import React from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { connect } from 'react-redux';
import EDPlaceholderComponent from '../components/EDPlaceholderComponent';
import EDRTLText from '../components/EDRTLText';
import EDRTLView from '../components/EDRTLView';
import NavigationEvents from '../components/NavigationEvents';
import { strings } from '../locales/i18n';
import { saveNavigationSelection } from '../redux/actions/Navigation';
import { EDColors } from '../utils/EDColors';
import { getProportionalFontSize, isRTLCheck, RESPONSE_SUCCESS } from '../utils/EDConstants';
import { EDFonts } from '../utils/EDFontConstants';
import { netStatus } from '../utils/NetworkStatusConnection';
import { getRestaurantListAPI } from '../utils/ServiceManager';
import BaseContainer from './BaseContainer';



class RestaurantListContainer extends React.Component {

    constructor(props) {
        super(props);
        this.arrayRestaurants = undefined
        this.available_mode = []
        this.strOnScreenTitle = ''
        this.strOnScreenMessage = ''
        this.refreshing = false
        this.isFromHome =
            this.props.route.params !== undefined ?
                this.props.route.params.isFromHome : false
    }
    state = {
        isLoading: false
    }
    buttonBackPressed = () => {
        if (this.isFromHome)
            this.props.navigation.goBack()
        else
            this.props.navigation.openDrawer()
    }
    updateMode = item => {
        this.props.navigation.navigate("modeUpdate", {
            selectedRestaurant: item,
            timeout_steps: this.timeout_steps,
            available_mode: this.available_mode
        })
    }
    renderRestaurant = ({ item }) => {
        let index = -1
        if (this.available_mode !== undefined) {
            index = this.available_mode.map(data => Number(data.id)).indexOf(Number(item.currentMode))
        }
        return (
            <View style={styles.restaurantCard}>
                <EDRTLView style={{ flex: 1 }}>
                    <Icon name="local-restaurant" color={EDColors.primary} size={getProportionalFontSize(20)} />
                    <EDRTLText title={item.restaurant_name} style={styles.resName} />
                </EDRTLView>
                <EDRTLView style={{ alignItems: "center", flex: 1, marginTop: 5 }}>
                    <EDRTLView style={{ alignItems: "center", flex: 1, }}>
                        <Icon name="timer" color={EDColors.primary} size={getProportionalFontSize(21)} />
                        <EDRTLText title={strings("currentMode") + " : "} style={[styles.restMode, { marginRight: 0 }]} />
                        {this.available_mode !== undefined ?
                            <EDRTLText
                                style={[styles.restMode, { fontFamily: EDFonts.semibold, marginHorizontal: 0, flex: 1 }]}
                                title={this.available_mode[index].title + " (" + this.available_mode[index].time + ")"} />
                            : null}
                    </EDRTLView>
                    <Icon
                        onPress={() => { this.updateMode(item) }}
                        name="edit-3" type={"feather"} color={EDColors.primary} size={getProportionalFontSize(20)} />
                </EDRTLView>
            </View>
        )
    }
    onPullToRefreshHandler = () => {
        this.refreshing = false
        this.onConnectionChangeHandler()
    }
    onConnectionChangeHandler = () => {
        this.available_mode = undefined
        this.timeout_steps = undefined
        this.arrayRestaurants = undefined
        this.fetchRestaurants()
    }

    onFocus = () => {
        this.onConnectionChangeHandler()
        this.props.saveNavigationSelection(strings('modeMangement'));
    }
    fetchRestaurants = () => {
        this.strOnScreenTitle = ''
        this.strOnScreenMessage = ''
        this.setState({ isLoading: true })
        netStatus(status => {
            if (status) {
                let restParams = {
                    language_slug: this.props.lan,
                    user_id: this.props.userDetails.UserID
                }
                getRestaurantListAPI(restParams, this.onSuccessRestList, this.onFailureRestList, this.props)
            }
            else {
                this.strOnScreenTitle = strings("generalNoInternet")
                this.strOnScreenMessage = strings("generalNoInternetMessage")
                this.setState({ isLoading: false })
            }

        })
    }
    onSuccessRestList = onSuccess => {
        this.arrayRestaurants = []
        if (onSuccess.data !== undefined && onSuccess.data.status == RESPONSE_SUCCESS) {
            if (onSuccess.data.arrayRestaurants !== undefined &&
                onSuccess.data.arrayRestaurants !== null &&
                onSuccess.data.arrayRestaurants.length !== 0) {
                this.arrayRestaurants = onSuccess.data.arrayRestaurants
                this.available_mode = onSuccess.data.available_mode
                this.timeout_steps = onSuccess.data.timeout_steps


                this.setState({ isLoading: false })

            }
            else {
                this.strOnScreenTitle = strings("noRestaurants")
                this.strOnScreenMessage = strings("noRestaurantsMessage")
                this.setState({ isLoading: false })
            }
        }
        else {
            this.strOnScreenTitle = ''
            this.strOnScreenMessage = onSuccess.message
            this.setState({ isLoading: false })

        }
    }
    onFailureRestList = (onFailure) => {
        this.strOnScreenTitle = ''
        this.strOnScreenMessage = onFailure.message
        this.setState({ isLoading: false })
    }
    render() {
        return (
            <BaseContainer
                title={strings('modeMangement')}
                left={
                    this.isFromHome ?
                        isRTLCheck() ? 'arrow-forward' : 'arrow-back' :
                        "menu"}
                onLeft={this.buttonBackPressed}
                loading={this.state.isLoading}
                connection={this.onConnectionChangeHandler}
            >
                <NavigationEvents onFocus={this.onFocus} navigationProps={this.props} />


                {this.arrayRestaurants !== undefined && this.arrayRestaurants !== null && this.arrayRestaurants.length !== 0 ?
                    <FlatList
                        data={this.arrayRestaurants}
                        // keyExtractor={({ item, index }) => item.restaurant_id}
                        renderItem={this.renderRestaurant}
                        contentContainerStyle={{ margin: 15 }}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.refreshing || false}
                                title={strings("generalFetchingNew")}
                                titleColor={EDColors.textAccount}
                                tintColor={EDColors.textAccount}
                                colors={[EDColors.textAccount]}
                                onRefresh={this.onPullToRefreshHandler}
                            />
                        }
                    /> :
                    this.strOnScreenMessage.trim().length !== 0 ?
                        <ScrollView
                            contentContainerStyle={styles.scrollViewStyle}
                            refreshControl={
                                <RefreshControl
                                    refreshing={this.refreshing || false}
                                    title={strings("generalFetchingNew")}
                                    titleColor={EDColors.textAccount}
                                    tintColor={EDColors.textAccount}
                                    colors={[EDColors.textAccount]}
                                    onRefresh={this.onPullToRefreshHandler}
                                />
                            }
                        >
                            <EDPlaceholderComponent title={this.strOnScreenTitle} subTitle={this.strOnScreenMessage} />
                        </ScrollView>
                        : null}
            </BaseContainer>
        )
    }

}

const styles = StyleSheet.create({
    restaurantCard: {
        marginVertical: 5,
        padding: 15,
        borderRadius: 16,
        backgroundColor: EDColors.white,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.18,
        shadowRadius: 1.00,

        elevation: 1,
    },
    resName: {
        fontSize: getProportionalFontSize(16),
        fontFamily: EDFonts.semibold,
        color: EDColors.black,
        marginHorizontal: 5
    },
    restMode: {
        fontSize: getProportionalFontSize(14),
        fontFamily: EDFonts.medium,
        color: EDColors.black,
        marginHorizontal: 5

    },
    scrollViewStyle: { flex: 1, justifyContent: 'center', alignItems: 'center' },

})

export default connect(
    state => {
        return {
            lan: state.userOperations.lan,
            userDetails: state.userOperations.userDetails || {}
        };
    },
    dispatch => {
        return {
            saveNavigationSelection: dataToSave => {
                dispatch(saveNavigationSelection(dataToSave));
            },
        };
    }
)(RestaurantListContainer);