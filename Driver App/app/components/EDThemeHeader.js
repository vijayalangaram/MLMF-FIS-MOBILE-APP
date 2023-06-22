/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, {Component} from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {Icon} from 'react-native-elements';
import Assets from '../assets';
import {EDColors} from '../utils/EDColors';
import {
  capiString,
  getProportionalFontSize,
  isRTLCheck,
} from '../utils/EDConstants';
import {EDFonts} from '../utils/EDFontConstants';
import Metrics from '../utils/metrics';
import EDRTLText from './EDRTLText';
import EDRTLView from './EDRTLView';
import EDButton from './EDButton';

export default class EDThemeHeader extends Component {
  render() {
    return (
      <View>
        {/* HEAD IMAGE ie LOGIN PAGE IMAGE  */}
        <Image style={styles.imageBackground} source={Assets.bg_login} />

        {/* e. LOGO ie inside the Image */}
        {this.props.showLogo ? (
          <Image
            style={{
              position: 'absolute',
              bottom: (Metrics.screenWidth * 216) / 314 / 4 + 25,
              width: '35%',
              height: 150,
              alignSelf: 'center',
              tintColor : EDColors.white,
            }}
            resizeMode="contain"
            source={Assets.login_check}
          />
        ) : null}
        <View
          style={[
            styles.backButtonContainer,
            {alignItems: isRTLCheck() ? 'flex-end' : 'flex-start'},
          ]}>
          <TouchableOpacity onPress={this.props.onLeftButtonPress}>
            <Icon size={25} color={EDColors.white} name={this.props.icon} />
          </TouchableOpacity>
        </View>
        <EDRTLView style={styles.welcomeContainer}>
          {/* <EDRTLText style={styles.welcomeText} title={strings('welcome')} /> */}
          <EDRTLText style={styles.titleText} title={this.props.title} />
          <View>
            {this.props.languages !== undefined &&
            this.props.languages !== null &&
            this.props.languages.length > 1 &&
            this.props.lan !== undefined &&
            this.props.lan !== null ? (
              <EDRTLView
                style={{
                  backgroundColor: EDColors.white,
                  borderWidth: 1,
                  borderColor: '#E0E0E0',
                  margin: 10,
                  borderRadius: 16,
                  padding: 10,
                  paddingVertical: 12,
                  alignItems: 'center',
                  marginHorizontal: 15,
                }}>
                <EDButton
                  label={capiString(this.props.lan)}
                  onPress={this.props.onLanguagePress}
                  icon={'language'}
                  style={[
                    {
                      backgroundColor: EDColors.white,
                      marginHorizontal: 0,
                      padding: 0,
                    },
                  ]}
                  iconColor={EDColors.primary}
                  textStyle={styles.languageText}
                />
                <Icon
                  name={'chevron-down'}
                  size={15}
                  color={EDColors.black}
                  type={'feather'}
                  onPress={this.props.onLanguagePress}
                />
              </EDRTLView>
            ) : null}
          </View>
        </EDRTLView>
      </View>
    );
  }
}

export const styles = StyleSheet.create({
  imageBackground: {
    width: Metrics.screenWidth,
    height: (Metrics.screenWidth * 216) / 314,
  },
  languageText: {
    color: EDColors.black,
    fontFamily: EDFonts.semiBold,
    fontSize: getProportionalFontSize(14),
    marginVertical: 0,
    marginHorizontal: 5,
  },
  backButtonContainer: {
    position: 'absolute',
    marginHorizontal: 20,
    top: DeviceInfo.hasNotch() && Platform.OS === 'ios' ? 44 : 20,
    width: Metrics.screenWidth - 40,
  },
  welcomeContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'absolute',
    top: '85%',
    width: '100%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: EDColors.white,
  },
  welcomeText: {
    fontFamily: EDFonts.semiBold,
    fontSize: getProportionalFontSize(18),
    color: EDColors.white,
  },
  titleText: {
    fontFamily: EDFonts.bold,
    fontSize: getProportionalFontSize(28),
    color: EDColors.black,
    margin: 20,
    marginTop: 30,
  },
});
