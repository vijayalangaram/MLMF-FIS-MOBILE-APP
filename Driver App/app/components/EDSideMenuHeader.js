import React, {Component} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Platform,
} from 'react-native';
import {EDColors} from '../utils/EDColors';
import {
  capiString,
  getProportionalFontSize,
  isRTLCheck,
} from '../utils/EDConstants';
import {EDFonts} from '../utils/EDFontConstants';
import Metrics from '../utils/metrics';
import EDImage from './EDImage';
import EDRTLText from './EDRTLText';
import EDRTLView from './EDRTLView';
import {Icon} from 'react-native-elements';
import {strings} from '../locales/i18n';
import {initialWindowMetrics} from 'react-native-safe-area-context';

export default class EDSideMenuHeader extends Component {
  render() {
    return (
      <View>
        {/* THESE IS USED FOR THE DISPLAYING PROFILE PHOTO , USERNAME, PHONE NUMBER OR EMAIL AND VIEW PROFILE OPTION */}
        {/* MAIN CONTAINER */}
        <View
          style={[
            styles.mainContainer,
            {
              paddingTop:
                Platform.OS == 'ios' ? initialWindowMetrics.insets.top : 0,
            },
          ]}>
          {/* PROFILE DETAILS CONTAINER */}
          <View style={[styles.bgImage, {justifyContent: 'center'}]}>
            <TouchableOpacity
              style={styles.touchableContainer}
              onPress={this.props.onProfilePressed}>
              <View
                style={{alignItems: isRTLCheck() ? 'flex-end' : 'flex-start'}}>
                {/* PROFILE IMAGE */}
                <View style={styles.profileImageContainer}>
                  <EDImage
                    source={this.props.userDetails.image}
                    style={styles.profileImage}
                  />
                </View>

                {/* NAME AND EMAIL DETAILS */}
                <View style={styles.profileDetailsContainer}>
                  {/* FULL NAME */}
                  <EDRTLText
                    style={styles.fullName}
                    title={
                      this.props.userDetails !== undefined &&
                      this.props.userDetails.FirstName !== undefined &&
                      this.props.userDetails.FirstName.trim() !== ''
                        ? capiString(this.props.userDetails.FirstName).trim()
                        : 'User Name'
                    }
                  />

                  {/* EMAIL */}
                  {this.props.userDetails.PhoneNumber ? (
                    <EDRTLText
                      style={styles.email}
                      title={
                        this.props.userDetails.phone_code.includes('+')
                          ? this.props.userDetails.phone_code
                          : '+' +
                            this.props.userDetails.phone_code +
                            ' ' +
                            this.props.userDetails.PhoneNumber
                      }
                    />
                  ) : null}

                  {this.props.userDetails.driver_temperature ? (
                    <EDRTLText
                      style={styles.email}
                      title={this.props.userDetails.driver_temperature}
                      numberOfLines={2}
                    />
                  ) : null}
                  {/* View profile text */}

                  <EDRTLView style={{alignItems: 'center', marginTop: 5}}>
                    <EDRTLText
                      style={styles.sidebarTextStyle}
                      title={
                        this.props.userDetails !== undefined &&
                        this.props.userDetails.FirstName !== undefined &&
                        this.props.userDetails.FirstName.trim() !== ''
                          ? strings('viewProfile')
                          : null
                      }
                    />
                    {this.props.userDetails !== undefined &&
                    this.props.userDetails.FirstName !== undefined &&
                    this.props.userDetails.FirstName.trim() !== '' ? (
                      <Icon
                        containerStyle={{marginHorizontal: 2.5}}
                        name={isRTLCheck() ? 'caretleft' : 'caretright'}
                        size={10}
                        color={EDColors.text}
                        type={'ant-design'}
                      />
                    ) : null}
                  </EDRTLView>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}

// #region STYLE SHEET
const styles = StyleSheet.create({
  bgImage: {
    width: '100%',
    paddingVertical: 20,
  },
  mainContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  touchableContainer: {
    marginHorizontal: 10,
  },
  profileImageContainer: {
    borderWidth: 2,
    borderColor: EDColors.white,
    width: Metrics.screenWidth * 0.2,
    height: Metrics.screenWidth * 0.2,
    backgroundColor: EDColors.white,
    borderRadius: Metrics.screenWidth * 0.1,
    overflow: 'hidden',
    borderWidth: 5,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    backgroundColor: EDColors.transparent,
    borderRadius: Metrics.screenWidth * 0.1,
    overflow: 'hidden',
  },
  profileDetailsContainer: {
    marginHorizontal: 5,
    justifyContent: 'center',
    paddingTop: 15,
  },
  fullName: {
    fontFamily: EDFonts.semibold,
    color: EDColors.black,
    fontSize: getProportionalFontSize(20),
  },
  email: {
    fontSize: getProportionalFontSize(14),
    color: EDColors.text,
    fontFamily: EDFonts.medium,
    marginTop: 5,
  },
  sidebarTextStyle: {
    fontSize: getProportionalFontSize(14),
    fontFamily: EDFonts.semiBold,
    color: EDColors.blackSecondary,
  },
});
