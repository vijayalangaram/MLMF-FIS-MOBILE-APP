import React, { Component } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { EDFonts } from '../utils/EDFontConstants';
import Metrics from '../utils/metrics';
import EDRTLText from './EDRTLText';
import { capiString, getProportionalFontSize, isRTLCheck } from '../utils/EDConstants';
import EDRTLView from './EDRTLView';
import { EDColors } from '../utils/EDColors';
import EDImage from './EDImage';
import { Icon } from 'react-native-elements';
import { strings } from '../locales/i18n';
import { Platform } from 'react-native';
import { initialWindowMetrics } from 'react-native-safe-area-context';

export default class EDSideMenuHeader extends Component {
    render() {
        return (
            <>
                {/* <View style={styles.bgImage}> */}


                {/* MAIN CONTAINER */}
                {/* <View style={styles.mainContainer}> */}

                {/* PROFILE DETAILS CONTAINER */}
                <View style={styles.touchableView}>
                    <TouchableOpacity style={styles.touchableContainer} onPress={this.props.onProfilePressed}>
                        {/* <EDRTLView> */}

                        {/* PROFILE IMAGE */}
                        <View style={styles.profileImageContainer}>
                            <EDImage
                                source={this.props.userDetails.image} style={styles.profileImage} />
                        </View>

                        {/* </EDRTLView> */}
                        {/* NAME AND EMAIL DETAILS */}
                        <View style={[styles.profileDetailsContainer]}>
                            {/* FULL NAME */}
                            <EDRTLText
                                style={styles.fullName}
                                title={this.props.userDetails !== undefined && this.props.userDetails.FirstName !== undefined && this.props.userDetails.FirstName.trim() !== ''
                                    ? capiString(this.props.userDetails.FirstName + ' ' + this.props.userDetails.LastName).trim()
                                    : 'User Name'} />

                            {/* EMAIL */}
                            {this.props.userDetails.Email
                                ? <EDRTLText
                                    style={styles.email}
                                    title={this.props.userDetails.Email} />
                                : null}

                            {/* View profile text */}

                            <EDRTLView style={{ alignItems: 'center', marginTop: 5, }}>
                                <EDRTLText
                                    style={styles.sidebarTextStyle}
                                    title={this.props.userDetails !== undefined && this.props.userDetails.FirstName !== undefined && this.props.userDetails.FirstName.trim() !== ''
                                        ? strings("viewProfile")
                                        : null} />
                                {this.props.userDetails !== undefined && this.props.userDetails.FirstName !== undefined && this.props.userDetails.FirstName.trim() !== ''
                                    ? <Icon
                                        containerStyle={{ marginHorizontal: 2.5 }}
                                        name={isRTLCheck() ? 'caretleft' : 'caretright'} size={getProportionalFontSize(10)} color={EDColors.text} type={'ant-design'} /> : null}
                            </EDRTLView>
                        </View>

                    </TouchableOpacity>
                    <View style={styles.marginView}></View>
                </View>
                {/* </View> */}
                {/* </View> */}
            </>
        );
    }
}



// #region STYLE SHEET
const styles = StyleSheet.create({
    bgImage: {
        width: '100%',
        flex: 1
        // height: (Metrics.screenWidth * 216) / 380,
        // backgroundColor : EDColors.primary,
    },
    mainContainer: {
        // position: 'absolute', 
        flex:1,
        width: '100%',
        // height: (Metrics.screenWidth * 216) / 380,
        // top: 0,
        // left: 0, 
        alignItems: 'center', justifyContent: 'center',
    },
    touchableView: {
        width: '100%',
        //  height: (Metrics.screenWidth * 216) / 414, 
        justifyContent: 'center', paddingHorizontal: 5,
        paddingTop: Platform.OS=="ios" ? initialWindowMetrics.insets.top :0
    },
    touchableContainer: {
        margin: 10
    },
    profileImageContainer: {
        borderWidth: 2,
        borderColor: EDColors.white,
        width: Metrics.screenWidth * 0.2,
        height: Metrics.screenWidth * 0.2,
        backgroundColor: EDColors.white,
        borderRadius: Metrics.screenWidth * 0.1,
        overflow: 'hidden'
    },
    profileImage: {
        width: '100%',
        height: '100%',
        backgroundColor: EDColors.transparent,
        borderRadius: Metrics.screenWidth * 0.1,
        overflow: 'hidden'
    },
    profileDetailsContainer: { marginHorizontal: 5, justifyContent: 'center', paddingVertical: 20 ,paddingBottom: 5},
    fullName: { fontFamily: EDFonts.semibold, marginVertical: 5, fontSize: getProportionalFontSize(20) },
    email: { fontSize: getProportionalFontSize(14), color: EDColors.text, fontFamily: EDFonts.medium },
    marginView: { borderBottomColor: EDColors.text, borderBottomWidth: 0.2 },
    sidebarTextStyle: {  fontSize: getProportionalFontSize(14), fontFamily: EDFonts.medium, color: EDColors.blackSecondary },

})
