/* eslint-disable semi */
/* eslint-disable prettier/prettier */
import React, { Component } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import EDOrderDetailCard from './EDOrderDetailCard';
import { EDColors } from '../utils/EDColors';
import { strings } from '../locales/i18n';
import { Spinner } from 'native-base';

export default class EDOrdersFlatList extends Component {
    onPullToRefreshHandler = () => {
        if (this.props.onPullToRefreshHandler !== undefined) {
            this.props.onPullToRefreshHandler()
        }
    }
    renderFooter = () => {
        return (
            this.props.isMoreLoading ?
                <Spinner size={"large"} color={EDColors.primary} /> : null
        )
    }

    renderHeader = () => {
        return (
            this.props.ListHeaderComponent ?
                this.props.ListHeaderComponent() : null
        )
    }

    render() {
        return (
            this.props.arrayOrders
                ? <FlatList
                    showsVerticalScrollIndicator={false}
                    style={this.props.style}
                    data={this.props.arrayOrders}
                    renderItem={this.renderOrderDetails}
                    keyExtractor={(item, index) => item + index}
                    onEndReached={this.props.onEndReached}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={this.renderFooter}
                    ListHeaderComponent={this.renderHeader}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.props.refreshing || false}
                            title={strings("generalFetchingNew")}
                            titleColor={EDColors.textAccount}
                            tintColor={EDColors.textAccount}
                            colors={[EDColors.textAccount]}
                            onRefresh={this.onPullToRefreshHandler}
                        />
                    }
                />
                : null
        )
    }

    /** RENDER VIEW */
    renderOrderDetails = (order) => {
        return <EDOrderDetailCard order={order}
            onPhoneNumberPressed={this.onPhoneNumberPressed}
            onOrderViewPressed={this.onOrderViewPressed}
            onOrderAcceptPressed={this.onOrderAcceptPressed}
            onOrderRejectPressed={this.onOrderRejectPressed}
            onRefundPressed={this.onRefundPressed}
        />
    }

    //#region BUTTON EVENTS
    onPhoneNumberPressed = item => {
        if (this.props.onPhoneNumberPressed != undefined) {
            this.props.onPhoneNumberPressed(item)
        }
    }

    onOrderViewPressed = item => {
        if (this.props.onOrderViewPressed != undefined) {
            this.props.onOrderViewPressed(item)
        }
    }

    onOrderAcceptPressed = item => {
        if (this.props.onOrderAcceptPressed != undefined) {
            this.props.onOrderAcceptPressed(item)
        }
    }

    onOrderRejectPressed = item => {
        if (this.props.onOrderRejectPressed != undefined) {
            this.props.onOrderRejectPressed(item)
        }
    }

    onRefundPressed = (orderData) => {
        if (this.props.onRefundPressed != undefined) {
            this.props.onRefundPressed(orderData)
        }
    }
    //#endregion
}