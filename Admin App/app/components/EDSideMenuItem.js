import React, { Component } from 'react';
import { Image, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { EDFonts } from '../utils/EDFontConstants';
import { isRTLCheck, getProportionalFontSize } from '../utils/EDConstants';
import { EDColors } from '../utils/EDColors';
import { Icon } from 'react-native-elements'

export default class EDSideMenuItem extends Component {

    onPressHandler = () => {
        if (this.props.onPressHandler !== undefined) {
            this.props.onPressHandler(this.props.item, this.props.index)
        }
    }

    render() {
        return (
            <TouchableOpacity
                style={[styles.touchableContainer, { flexDirection: isRTLCheck() ? 'row-reverse' : 'row', backgroundColor: this.props.isSelected ? EDColors.primary : EDColors.white }]}
                onPress={this.onPressHandler}
            >

                {this.props.item.isAsset
                    ? <Image
                        style={[styles.styleImage, this.props.item.assetStyle, { tintColor: this.props.isSelected ? EDColors.white : EDColors.text }]}
                        source={this.props.item.icon}
                        resizeMode="contain"
                    />
                    : <Icon
                        size={getProportionalFontSize(20)}
                        name={this.props.item.icon}
                        type={this.props.item.iconType || 'material'}
                        color={this.props.isSelected ? EDColors.white : EDColors.text}
                        style={styles.iconStyle}
                    />
                }
                <Text style={[styles.textStyle, { color: this.props.isSelected ? EDColors.white : EDColors.text }]}>
                    {this.props.item.screenName}
                </Text>
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
        marginBottom: 17,
        paddingHorizontal: 15,
        borderRadius: 16,
    },
    styleImage: { width: getProportionalFontSize(20), height: getProportionalFontSize(20), marginVertical: 15, },
    textStyle: { fontSize: getProportionalFontSize(14), marginHorizontal: 15, fontFamily: EDFonts.semibold, marginVertical: 15, },
    iconStyle: { marginVertical: 15 }
});
