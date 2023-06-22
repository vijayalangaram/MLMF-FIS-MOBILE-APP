import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { EDColors } from '../utils/EDColors';
import { getProportionalFontSize } from '../utils/EDConstants';
import { EDFonts } from '../utils/EDFontConstants';
import Metrics from '../utils/metrics';
import EDRTLView from '../components/EDRTLView'
import EDTextIcon from './EDTextIcon';
import EDImage from './EDImage';

export default class EDCustomerDetails extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <EDRTLView>
                {/* DETAILS VIEW */}
                <EDRTLView style={style.detailsView}>

                    <EDTextIcon
                        icon={'person-outline'}
                        text={this.props.name}
                        textStyle={style.textView1}
                        style={style.textIconStyle}
                        size={22}
                    />
                    {this.props.phoneNumber !== undefined && this.props.phoneNumber !== null && this.props.phoneNumber.trim().length !== 0 ?
                        <EDTextIcon
                            icon={'phone'}
                            isTouchable={true}
                            type={'feather'}
                            size={17}
                            onPress={this.onPhonePressed}
                            text={this.props.phoneNumber}
                            textStyle={style.textView} />
                        : null}
                    {/* {this.props.address !== undefined && this.props.address !== null && this.props.address.trim().length !== 0 ?
                        <EDTextIcon
                            icon={'location-pin'}
                            size={17}
                            type={'simple-line-icon'}
                            text={
                                (this.props.landmark !== undefined && this.props.landmark !== null && this.props.landmark.trim().length !== 0 ?
                                    this.props.landmark + ", " : '') + (this.props.address)}
                            numberOfLines={3}
                            textStyle={style.textView} /> : null} */}


                </EDRTLView>
                {/* IMAGE VIEW */}
                {/* <View style={style.imageView}>
                <EDImage source={this.props.image} style={style.imageStyle} />
            </View> */}
            </EDRTLView>
        )
    }

    onPhonePressed = () => {
        if (this.props.onPhonePressed != undefined) {
            this.props.onPhonePressed(this.props.phoneNumber)
        }
    }
}

const style = StyleSheet.create({
    imageView: { flex: 0.35, justifyContent: 'center', marginVertical: 10 },
    imageStyle: {
        width: Metrics.screenWidth * 0.20,
        height: Metrics.screenWidth * 0.20,
        backgroundColor: EDColors.white,
        borderRadius: 8,
        marginLeft: -10,
        alignSelf: 'center',
    },
    detailsView: { flexDirection: 'column', justifyContent: 'center', flex: 1, paddingHorizontal: 5 },
    textView: { color: EDColors.text, fontSize: getProportionalFontSize(14), fontFamily: EDFonts.semibold, marginHorizontal: 10 },
    textView1: { color: EDColors.text, fontSize: getProportionalFontSize(14), fontFamily: EDFonts.semibold, marginTop: 3, marginHorizontal: 7 },
    textIconStyle: { marginHorizontal: -2 }
})
