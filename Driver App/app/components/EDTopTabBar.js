// Vikrant 19-07-21
import React, {Component} from 'react';
import {Text, TouchableOpacity, StyleSheet} from 'react-native';
import {EDColors} from '../utils/EDColors';
import {getProportionalFontSize} from '../utils/EDConstants';
import {EDFonts} from '../utils/EDFontConstants';
import Metrics from '../utils/metrics';
import EDRTLView from './EDRTLView';

export default class EDTopTabBar extends Component {
  render() {
    return (
      <EDRTLView style={styles.tabView}>
        {this.props.data.map((item, index) => (
          <TouchableOpacity
            style={[
              styles.buttonStyle,
              {
                borderBottomColor:
                  this.props.selectedIndex == item.index
                    ? 'white'
                    : EDColors.primary,
              },
            ]}
            onPress={() => item.onPress(item.index)}>
            <Text
              style={[
                styles.buttonTextStyle,
                {
                  color:
                    this.props.selectedIndex == item.index
                      ? EDColors.white
                      : EDColors.white,
                },
              ]}>
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </EDRTLView>
    );
  }
}

const styles = StyleSheet.create({
  tabView: {
    backgroundColor: EDColors.primary,
    alignItems: 'center',
  },
  buttonTextStyle: {
    paddingVertical: 16,
    fontSize: getProportionalFontSize(16),
    fontFamily: EDFonts.semiBold,
    color: EDColors.white,
    textAlign: 'center',
  },
  buttonStyle: {
    flex: 0.4,
    height: '100%',
    alignItems: 'center',
    alignSelf: 'center',
    marginHorizontal: 10,
    borderBottomWidth: 3,
  },
});
