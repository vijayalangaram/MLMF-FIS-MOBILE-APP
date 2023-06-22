// Vikrant 19-07-21
import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { EDColors } from '../utils/EDColors';
import { getProportionalFontSize } from '../utils/EDConstants';
import { EDFonts } from '../utils/EDFontConstants';
import Metrics from '../utils/metrics';
import EDRTLView from './EDRTLView';


export default class EDTopTabBar extends Component {

    render() {
        return (
            <View style={{ backgroundColor: EDColors.primary }}>
                {/* <ScrollView
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                > */}
                <EDRTLView style={styles.tabView}>
                    {
                        this.props.data.map((item, index) => (
                            <TouchableOpacity
                                style={[styles.buttonStyle, { borderBottomColor: this.props.selectedIndex == item.index ? 'white' : EDColors.primary}]}
                                onPress={() => item.onPress(item.index)}
                            >
                                <Text
                                    // style={styles.buttonTextStyle}
                                    style={[styles.buttonTextStyle, { color: this.props.selectedIndex == item.index ? EDColors.white : EDColors.white }]}
                                    numberOfLines={2}
                                >
                                    {item.title}
                                </Text>
                            </TouchableOpacity>
                        ))

                    }
                </EDRTLView>
                {/* </ScrollView> */}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    tabView: {
        backgroundColor: EDColors.primary, alignItems: 'center',
        // borderColor: 'black', borderWidth: 2
    },
    buttonTextStyle: {
        lineHeight:getProportionalFontSize(20),
        textAlignVertical:'center',
        flexGrow:1,
        paddingVertical: 16, fontSize: getProportionalFontSize(16), fontFamily: EDFonts.semibold, color: EDColors.white, textAlign: 'center' }
    ,
    buttonStyle: {
        flex :1, alignItems: 'center', alignSelf: 'center', marginHorizontal: 10, borderBottomWidth: 3, }
})