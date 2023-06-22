/* eslint-disable react/no-string-refs */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { EDColors } from '../utils/EDColors';
import { getProportionalFontSize, isRTLCheck } from '../utils/EDConstants';
import { EDFonts } from '../utils/EDFontConstants';
import Metrics from '../utils/metrics';
import EDRTLView from './EDRTLView';

export default class EDHomeSearchBar extends React.Component {
    render() {
        return (
            <EDRTLView
                onLayout={this.props.onLayout}
                style={[styles.mainContainer, this.props.style]} pointerEvents={this.props.pointerEvent} >

                {/* SEARCH ICON */}
                <View style={styles.childContianer} >
                    <Icon name={"search1"} type="ant-design" containerStyle={{ marginVertical: 10 }} color={EDColors.blackSecondary} size={getProportionalFontSize(20)} onPress={this.props.onSearchPress} />
                </View>

                {/* SEARCH BAR */}
                <EDRTLView style={styles.searchBarView} >

                    {/* INPUT FIELD */}
                    <TextInput
                        value={this.props.value}
                        style={{ flex: 1, fontFamily: EDFonts.regular, fontSize: getProportionalFontSize(14), textAlign: isRTLCheck() ? 'right' : 'left' , color : EDColors.text}}
                        numberOfLines={1}
                        ref={this.props.ref}
                        placeholder={this.props.placeholder}
                        placeholderTextColor={EDColors.text}
                        onChangeText={userText => { this.props.onChangeValue(userText) }}
                        returnKeyType="search"
                        onSubmitEditing={this.props.onSearchPress}
                        selectionColor={EDColors.primary}
                    />
                    {this.props.value.trim().length !== 0 ?
                        <View style={styles.childContianer} >
                            <Icon name={"close"} containerStyle={{ marginVertical: 10 }} color={EDColors.blackSecondary} size={getProportionalFontSize(20)} onPress={this.props.onClearPress} />
                        </View> : null}
                </EDRTLView>
            </EDRTLView>
        );
    }
}

const styles = StyleSheet.create({
    mainContainer: {
        backgroundColor: EDColors.white,
        marginHorizontal: 10,
        borderRadius: 16,
        overflow: 'visible',
        alignItems: "center",
        paddingHorizontal: 10,
        height: Metrics.screenHeight * 0.068,
        marginTop: 10,
        shadowColor: EDColors.shadow,
        shadowOffset: {
            width: 1,
            height: 1,
        },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 2,
    },
    childContianer: {
        paddingLeft: 5,
        paddingRight: 5,
        backgroundColor: EDColors.transparent,
        alignItems: "center",
        justifyContent: "center",
    },
    searchBarView: { paddingLeft: 0, flex: 1, height: '100%' },
    iconStyle: { flex: 1, marginTop: 12 }
})