/* eslint-disable prettier/prettier */
'use strict';

import React, { Component } from 'react';
import { Title } from "native-base";
import { View, StyleSheet, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { EDColors } from '../utils/EDColors';
import { EDFonts } from '../utils/EDFontConstants';
import EDRTLView from './EDRTLView';
import { getProportionalFontSize, isRTLCheck } from '../utils/EDConstants';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import DeviceInfo from 'react-native-device-info';
import { Icon } from 'react-native-elements';
import Metrics from '../utils/metrics';

export default class NavBar extends Component {
  render() {
    return (
      <View style={styles.parentContainer}>

        {/* STATUS BAR */}
        <StatusBar barStyle="light-content" backgroundColor={EDColors.primary} />

        <EDRTLView style={styles.contentContainer}>

          {/* LEFT BUTTONS */}
          <EDRTLView style={[styles.leftMainContainer, { marginBottom: Platform.OS == "ios" ? -(Metrics.screenHeight * 0.02) : 0 }]}>
            {this.props.left ?
              <EDRTLView style={styles.leftSubContainer}>
                <TouchableOpacity style={styles.leftButton}
                  onPress={this.props.onLeft}>
                  {this.props.left == 'menu' ?
                    <View style={[styles.combinedViewStyle, { alignItems: isRTLCheck() ? 'flex-end' : 'flex-start' }]}>
                      <View style={styles.sideChildView} />
                      <View style={styles.centerChildView} />
                      <View style={styles.sideChildView} />
                    </View>
                    : <Icon type={this.props.iconFamily || 'material'} size={getProportionalFontSize(30)}
                      name={isRTLCheck() ? 'keyboard-arrow-right' : 'keyboard-arrow-left'} color={EDColors.white} />}
                </TouchableOpacity>
              </EDRTLView>
              : null}
            {/* TITLE */}
            <View style={styles.titleContainer}>
              <Title style={styles.titleTextStyle}>
                {(this.props.title || '')}
              </Title>
            </View>
          </EDRTLView>


          {/* RIGHT BUTTONS */}
          {this.props.right
            ?
            <EDRTLView style={[styles.leftContainer,{flex : .5}]}>
              <EDRTLView style={styles.rightSubContainer}>
                <TouchableOpacity
                  style={styles.rightButton}
                  onPress={this.props.onRight}>
                  <Icon type={this.props.rightIconFamily || 'material'} size={getProportionalFontSize(this.props.rightIconSize || 24)}
                    name={this.props.right} color={EDColors.white} />
                </TouchableOpacity>
              </EDRTLView>

            </EDRTLView>
            : null}
        </EDRTLView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  parentContainer: { marginTop: DeviceInfo.hasNotch() ? -1 * (Platform.OS == 'ios' ? getStatusBarHeight() : hp('5%')) : -20, height: hp('12%'), backgroundColor: EDColors.primary, },
  contentContainer: { paddingTop: Platform.OS === 'ios' ? (DeviceInfo.hasNotch() ? 36 : 20) : StatusBar.currentHeight, flex: 1 },
  leftContainer: { flex: 1, },
  centerChildView: { width: Metrics.screenWidth * 0.065, height: Metrics.screenHeight * 0.003, backgroundColor: EDColors.white },
  sideChildView: { width: Metrics.screenWidth * 0.05, height: Metrics.screenHeight * 0.003, backgroundColor: EDColors.white },
  combinedViewStyle: { justifyContent: 'space-evenly', flex: Platform.OS == "android" ? 0.75 : 0.55 },
  leftMainContainer: { flex: 3 },
  leftSubContainer: { marginHorizontal: 5, alignItems: 'center', marginBottom: 5 },
  leftButton: { justifyContent: 'center', height: 40, width: 40, alignContent: 'center', alignItems: 'center' },
  titleContainer: { flex: 1, justifyContent: 'center', marginLeft: 10, marginRight: 10, alignItems: isRTLCheck() ? 'flex-end' : 'flex-start', fontSize: getProportionalFontSize(18), fontFamily: EDFonts.semibold, marginBottom: 5 },
  titleTextStyle: { fontFamily: EDFonts.bold, fontSize: getProportionalFontSize(19), color: EDColors.white, alignSelf: isRTLCheck() ? 'flex-end' : 'flex-start' },
  rightSubContainer: { justifyContent: 'flex-end', flex: 2, marginRight: 10, alignItems: 'center', marginBottom: Platform.OS == "ios" ? 0 : 15 },
  rightButton: { height: 40, width: 40, flexDirection: 'row', marginRight: 5, marginTop: 10, alignItems: 'center', alignContent: "center" }
});
