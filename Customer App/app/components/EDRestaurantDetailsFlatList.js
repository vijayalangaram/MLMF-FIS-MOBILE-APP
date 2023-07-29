import React, { Component } from "react";
import { FlatList, RefreshControl, Image, StyleSheet } from "react-native";
import { EDColors } from "../utils/EDColors";
import PopularRestaurantCard from "./PopularRestaurantCard";
import Assets from "../assets";
import EDRTLView from "./EDRTLView";
import { Icon } from "react-native-elements";
import { View } from "react-native";
import { Spinner } from "native-base";
import {
  API_PAGE_SIZE,
  debugLog,
  getProportionalFontSize,
  GOOGLE_API_KEY,
  isRTLCheck,
  RESPONSE_SUCCESS,
} from "../utils/EDConstants";

export default class EDRestaurantDeatilsFlatList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      distanceForPickUp: [],
    };
  }

  componentDidMount() {
    this.filterRes();
  }

  onPullToRefreshHandler = () => {
    if (this.props.onPullToRefreshHandler !== undefined) {
      this.props.onPullToRefreshHandler();
    }
  };

  filterRes = async () => {
    let { distanceForPickUp } = this.state;
    // debugLog(
    //   "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~  this.props.arrayRestaurants ~",
    //   this.props.arrayRestaurants
    // );
    jsonObject =
      this.props.arrayRestaurants &&
      this.props.arrayRestaurants.map(JSON.stringify);
    uniqueSet = new Set(jsonObject);
    uniqueArray = Array.from(uniqueSet).map(JSON.parse);
    // debugLog(
    //   "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~  uniqueArray ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~   ",
    //   uniqueArray
    // );
    this.setState({ distanceForPickUp: uniqueArray });
  };

  render() {
    let { distanceForPickUp } = this.state;
    // debugLog(
    //   "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~render~~~~~~~~~~~~~~~~~~~~",
    //   this.state.distanceForPickUp
    // );

    return this.props.isLoading == true ? (
      <Spinner color={EDColors.primary} size={"large"} />
    ) : this.state?.distanceForPickUp || this.props?.arrayRestaurants ? (
      <FlatList
        data={this.state?.distanceForPickUp || this.props?.arrayRestaurants}
        extraData={
          this.state?.distanceForPickUp || this.props?.arrayRestaurants
        }
        showsVerticalScrollIndicator={false} //R.K 07-01-2021 On indicator
        keyExtractor={(item, index) => item + index}
        renderItem={this.renderPopularResList}
        ListFooterComponent={this.renderFooter}
        onEndReached={this.props.onEndReached}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={this.props.refreshing || false}
            colors={[EDColors.primary]}
            onRefresh={this.onPullToRefreshHandler}
          />
        }
      />
    ) : null;
  }

  renderFooter = () => {
    return <View style={{ height: 80 }} />;
  };

  renderPopularResList = (item, index) => {
    return (
      <PopularRestaurantCard
        restObjModel={item}
        onPress={(restObjModel) => {
          this.props.onPopularResEvent(restObjModel);
        }}
        isShowReview={this.props.isShowReview}
        useMile={this.props.useMile}
      />
    );
  };
}

const styles = StyleSheet.create({
  footerImage: {
    height: 100,
    width: 120,
    alignSelf: "center",
    marginVertical: 10,
  },
});
