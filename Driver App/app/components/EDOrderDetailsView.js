import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import { strings } from '../locales/i18n';
import { EDColors } from '../utils/EDColors';
import { getProportionalFontSize } from '../utils/EDConstants';
import { EDFonts } from '../utils/EDFontConstants';
import metrics from '../utils/metrics';
import EDImage from './EDImage';
import EDRTLText from './EDRTLText';
import EDRTLView from './EDRTLView';
import EDThemeButton from './EDThemeButton';

export default class EDOrderDetailsView extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
        

            // ORDER LIST DATA i.e. IMAGE , NAME , ORDER ID , VIEW BUTTON
            <EDRTLView style={styles.orderViewMainContainer}>
            {/* USER IMAGE VIEW */}
            <View style={styles.orderImageViewContainer}>
                <EDImage
                    style={styles.orderImageView}
                    source={this.props.orderDetails.user_image}
                />
            </View>

            {/* MIDDLE TEXT CONTAINER */}
            <View style={styles.orderMiddleText}>

                {/* NAME OF STORE */}
                <EDRTLText style={styles.titleText} title={this.props.orderDetails.user_name} />

                {/* ORDER ID */}
                <EDRTLText style={styles.orderTextStyle} title={strings("orderId") + this.props.orderDetails.order_id} />
            </View>

            {/* VIEW BUTTON CONTAINER */}
            <EDThemeButton
                label={strings("view")}
                onPress={this.onPressHandler}
                style={styles.orderViewButton}
                textStyle={styles.orderViewButtonTextStyle}
            />
        </EDRTLView>
        )
    }

    onPressHandler = () => {
        if (this.props.onPress !== undefined) {
            this.props.onPress(this.props.orderDetails)
        }
    }
}



const styles = StyleSheet.create({
    summaryContainer: {
        margin: 10,
        borderColor: EDColors.primary,
        borderRadius: 5,
        backgroundColor: EDColors.white,
        shadowOpacity: 0.2,
        shadowRadius: 2,
        shadowColor: EDColors.primary,
        shadowOffset: { height: 0, width: 0 },
        padding: 10,
        marginVertical: metrics.screenHeight * 0.02,
        elevation: 2
    },
    orderViewMainContainer: {
        flex: 1,
        marginTop: 15,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        borderRadius: 16,
        backgroundColor: EDColors.white,
        // borderColor: EDColors.shadow,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.18,
        shadowRadius: 1.00,
        
        elevation: 1,
    
    },
    orderImageViewContainer: {
        justifyContent: 'center',
        marginHorizontal: 10,
        marginVertical: 10,
    },
    orderImageView: {
        width: metrics.screenWidth * 0.18,
        height: metrics.screenWidth * 0.18,
        borderRadius: 8,
    },
    orderMiddleText: {
        flex: 1,
        justifyContent: 'space-evenly',
        // paddingHorizontal:5
    },
    orderViewButton: {
        backgroundColor: EDColors.primary,
        marginHorizontal: metrics.screenWidth * 0.02,
        marginTop: 0,
        paddingHorizontal :7.5,
        paddingVertical: 0,
        height : 30,
        borderRadius:16,
        marginHorizontal:10
    },
    orderViewButtonTextStyle: {
        fontFamily: EDFonts.semiBold,
        fontSize: getProportionalFontSize(14),
        color: EDColors.white,
    },
    titleText: {
        fontFamily: EDFonts.semiBold,
        fontSize: getProportionalFontSize(16),
        marginBottom: 5,
    },
    orderTextStyle: {
        fontSize: getProportionalFontSize(14),
        marginTop: 5,
        color: '#999999',
        fontFamily: EDFonts.medium,
    }
})
