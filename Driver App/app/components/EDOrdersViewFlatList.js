import React, { Component } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { strings } from '../locales/i18n';
import { EDColors } from '../utils/EDColors';
import EDOrderDetailsView from './EDOrderDetailsView';

export default class EDOrdersViewFlatList extends Component {

    onPullToRefreshHandler = () => {
        if (this.props.onPullToRefreshHandler !== undefined) {
            this.props.onPullToRefreshHandler()
        }
    }

    // FOR VIEW OF ORDER 
    render() {
        return (
            this.props.arrayOrders
                ? <FlatList
                    showsVerticalScrollIndicator={false}
                    style={this.props.style}
                    data={this.props.arrayOrders}
                    renderItem={this.renderOrderDetailsView}
                    keyExtractor={(item, index) => item + index}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.props.refreshing || false}
                            title={strings("refresh")}
                            titleColor={EDColors.textAccount}
                            tintColor={EDColors.textAccount}
                            colors={[EDColors.primary]}
                            onRefresh={this.onPullToRefreshHandler}
                        />
                    }
                    onEndReached={this.props.onEndReached}
                />
                : null
        )
    }
    // RENDER ITEM METHOD FOR FLATLIST
    renderOrderDetailsView = (order) => {
        return <EDOrderDetailsView
            orderDetails={order.item}
            onPress={this.props.onPressHandler} />
    }
}