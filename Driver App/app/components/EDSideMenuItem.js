import React, {Component} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity} from 'react-native';
import {Icon} from 'react-native-elements';
import {EDColors} from '../utils/EDColors';
import {getProportionalFontSize, isRTLCheck} from '../utils/EDConstants';
import {EDFonts} from '../utils/EDFontConstants';
import EDRTLText from './EDRTLText';
import EDRTLView from './EDRTLView';

export default class EDSideMenuItem extends Component {
  onPressHandler = () => {
    if (this.props.onPressHandler !== undefined) {
      this.props.onPressHandler(this.props.item, this.props.index);
    }
  };

  render() {
    return (
      <TouchableOpacity
        style={[
          styles.touchableContainer,
          {
            // FOR MY EARNING $MONEY
            paddingVertical:
              this.props.item.route == 'myEarning' &&
              this.props.item.route == 'myEarning' &&
              this.props.totalEarning !== undefined &&
              this.props.totalEarning !== null &&
              this.props.totalEarning !== '' &&
              this.props.totalEarning !== '0.00'
                ? 10
                : 15,
            flexDirection: isRTLCheck() ? 'row-reverse' : 'row',
            backgroundColor: this.props.isSelected
              ? EDColors.primary
              : EDColors.white,
            borderRadius: 16,
          },
        ]}
        onPress={this.onPressHandler}>
        <EDRTLView style={{alignItems: 'center', flex: 1}}>
          {/* FOR ICONS AT HOME SCREEN */}
          {this.props.item.isAsset ? (
            <Image
              style={[
                styles.styleImage,
                {
                  tintColor: this.props.isSelected
                    ? EDColors.white
                    : EDColors.black,
                  opacity: this.props.isSelected ? 1 : 0.6,
                },
              ]}
              source={this.props.item.icon}
              resizeMode="contain"
            />
          ) : (
            <Icon
              size={this.props.item.iconSize || 20}
              name={this.props.item.icon}
              type={this.props.item.iconType || 'material'}
              style={{
                opacity: this.props.isSelected ? 1 : 0.6,
              }}
              color={this.props.isSelected ? EDColors.white : EDColors.black}
            />
          )}

          {/* SCREEN'S NAME ie HOME  */}

          <Text
            style={[
              styles.textStyle,
              {
                color: this.props.isSelected ? EDColors.white : EDColors.text,
                flex: 1,
              },
            ]}>
            {this.props.item.screenName}
          </Text>
        </EDRTLView>
        {this.props.item.route == 'myEarning' &&
        this.props.totalEarning !== undefined &&
        this.props.totalEarning !== null &&
        this.props.totalEarning !== '' &&
        this.props.totalEarning !== '0.00' &&
        this.props.totalEarning != 0 ? (
          <EDRTLView style={styles.walletView}>
            <EDRTLText
              style={styles.walletText}
              // title={this.props.currency + this.props.totalEarning}
              // Added line
              title={this.props.currency + ' '+this.props.totalEarning}
            />
          </EDRTLView>
        ) : null}
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  touchableContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: 5,
    marginHorizontal: 10,
    marginBottom: 5,
    paddingHorizontal: 15,
    // paddingVertical: 15,
    justifyContent: 'space-between',
  },
  styleImage: {width: 20, height: 20},
  textStyle: {
    fontSize: getProportionalFontSize(14),
    marginHorizontal: 15,
    fontFamily: EDFonts.semiBold,
  },
  walletView: {
    fontSize: getProportionalFontSize(12),
    backgroundColor: '#EFEFEF',
    padding: 8,
    overflow: 'hidden',
    borderRadius: 16,
    textAlignVertical: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingVertical: 7.5,
  },
  walletText: {
    color: EDColors.black,
    fontFamily: EDFonts.semiBold,
    fontSize: getProportionalFontSize(12),
    textAlignVertical: 'center',
  },
});
