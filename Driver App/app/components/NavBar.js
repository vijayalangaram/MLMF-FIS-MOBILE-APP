/* eslint-disable prettier/prettier */
'use strict';

import React, { Component } from 'react';
import { Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { Icon } from 'react-native-elements';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { getStatusBarHeight, isIPhoneX } from 'react-native-status-bar-height';
import { EDColors } from '../utils/EDColors';
import { getProportionalFontSize, isRTLCheck } from '../utils/EDConstants';
import { EDFonts } from '../utils/EDFontConstants';
import EDRTLView from './EDRTLView';
import { strings } from '../locales/i18n';
import Metrics from '../utils/metrics';

export default class NavBar extends Component {
  render() {
    return (
      <View style={styles.parentContainer}>
        <EDRTLView style={styles.contentContainer}>

          {/* LEFT BUTTONS */}
          <EDRTLView style={[styles.leftContainer, {
            flex: this.props.right
              ? 2 : 3,
              justifyContent:  'flex-start' ,
          }]}>
            {this.props.left ?
              <EDRTLView style={styles.leftSubContainer}>
                <TouchableOpacity style={styles.leftButton}
                  onPress={this.props.onLeft}>
                  {this.props.left == 'menu' ?
                    <View style={{ justifyContent: 'space-evenly', flex: 0.55, alignItems: isRTLCheck() ? 'flex-end' : 'flex-start' }}>
                      <View style={{ width: Metrics.screenWidth * 0.05, height: Metrics.screenHeight * 0.003, backgroundColor: EDColors.white }} />
                      <View style={{ width: Metrics.screenWidth * 0.065, height: Metrics.screenHeight * 0.003, backgroundColor: EDColors.white }} />
                      <View style={{ width: Metrics.screenWidth * 0.05, height: Metrics.screenHeight * 0.003, backgroundColor: EDColors.white }} />
                    </View>
                    : <Icon type={this.props.iconFamily || 'material'} size={30}
                      name={isRTLCheck() ? 'keyboard-arrow-right' : 'keyboard-arrow-left'} color={EDColors.white} />}
                </TouchableOpacity>
              </EDRTLView>
              : null}
            {/* TITLE */}
            <View style={[styles.titleContainer]}>
              <Text numberOfLines={2} style={styles.titleTextStyle}>
                {(this.props.title || '')}
              </Text>
            </View>
          </EDRTLView>

          {/* RIGHT BUTTONS */}
          <EDRTLView style={styles.leftContainer}>
            {this.props.right
              ? <EDRTLView style={styles.rightSubContainer}>
                <TouchableOpacity
                  style={[styles.rightButton]}
                  onPress={this.props.onRight}>
                  <Icon type={this.props.iconFamily || 'font-awesome'} size={25}
                    name={this.props.right} color={EDColors.white}  />
                </TouchableOpacity>
              </EDRTLView>
              : null}
            {this.props.availabilityStatus !== undefined
              ? <EDRTLView style={{
                justifyContent: "flex-end", alignItems: "center",flex : 1
              }}>
                <EDRTLView style={{ height: hp('4.25%'), justifyContent: 'center', alignItems: "center", backgroundColor: EDColors.white, borderTopRightRadius: isRTLCheck() ? hp('4%') / 2 : 0, borderBottomRightRadius: isRTLCheck() ? hp('4%') / 2 : 0, borderTopLeftRadius: isRTLCheck() ? 0 : hp('4%') / 2, borderBottomLeftRadius: isRTLCheck() ? 0 : hp('4%') / 2, justifyContent: 'center', paddingHorizontal: 5 }}>
                  <View style={{ marginHorizontal: 5, width: 10, height: 10, borderRadius: 5, backgroundColor: this.props.availabilityStatus ? 'rgb(127,255,0)' : EDColors.text }} />
                  <Text style={{ fontFamily: EDFonts.semiBold, marginHorizontal: 5, color: EDColors.textNew, fontSize: getProportionalFontSize(11) }}>{this.props.availabilityStatus ? strings("online") : strings("offline")}</Text>
                </EDRTLView>
              </EDRTLView>
              : null}
          </EDRTLView>
        </EDRTLView>
      </View>


    );
  }
}


const styles = StyleSheet.create({
  // parentContainer: { marginTop: DeviceInfo.hasNotch() ? -1 * (Platform.OS == 'ios' ? getStatusBarHeight() : hp('5%')) : -20, height: hp('12%'), backgroundColor: EDColors.primary },
  parentContainer: {
    marginTop: DeviceInfo.hasNotch() ? ((-1 * (Platform.OS == 'ios' ? getStatusBarHeight() : hp('5%'))) - (isIPhoneX() ? 20 : 0)) : -20, height: hp('12%'), backgroundColor: EDColors.primary,
    // borderColor: 'red', borderWidth: 1
  },

  contentContainer: { paddingTop: Platform.OS === 'ios' ? (DeviceInfo.hasNotch() ? 36 : 20) : StatusBar.currentHeight, flex: 1 },
  leftContainer: {
   justifyContent: isRTLCheck() ? 'flex-end' : 'flex-start' ,flex: 1
  },
  leftSubContainer: {
    marginLeft: 5, alignItems: 'center'
  },
  leftButton: {
    justifyContent: 'center', padding: 10, alignContent: 'center', alignItems: 'center'
  },
  titleContainer: { justifyContent: 'center', marginLeft: 10, marginRight: 10, alignItems: isRTLCheck() ? 'flex-end' : 'flex-start', overflow: 'visible' },
  titleTextStyle: { fontFamily: EDFonts.semiBold, fontSize: getProportionalFontSize(18), color: EDColors.white, },
  rightSubContainer: { justifyContent: 'flex-end', flex: 1, alignItems: 'center' },
  rightButton: { padding: 10, flexDirection: 'row', marginRight: 5, alignItems: 'center', justifyContent: 'center' },
});
