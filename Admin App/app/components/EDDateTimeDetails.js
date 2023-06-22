import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { getProportionalFontSize, isRTLCheck } from '../utils/EDConstants';
import Metrics from '../utils/metrics';
import { strings } from '../locales/i18n';
import EDRTLView from '../components/EDRTLView';
import EDRTLText from '../components/EDRTLText';
import { EDFonts } from '../utils/EDFontConstants';
import { EDColors } from '../utils/EDColors';
import moment from 'moment';
import { Icon } from 'react-native-elements';


export default class EDDateTimeDetails extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <View>
                <EDRTLView style={styles.mainView}>
                    <EDRTLText title={strings('orderTime') + ": "} style={styles.textStyle1}></EDRTLText>
                    <EDRTLText title={this.props.dateOfOrder + ', ' + this.props.timeOfOrder} style={styles.textStyle}></EDRTLText>
                </EDRTLView>

                {this.props.driverName !== undefined && this.props.driverName !== null && this.props.driverName.length !== 0 ?
                    <EDRTLView style={styles.subView}>
                        <EDRTLText title={strings('orderAssignedTo')} style={styles.textStyle}></EDRTLText>
                        <EDRTLText title={this.props.driverName} style={styles.textStyle}></EDRTLText>
                    </EDRTLView> : null}
                {this.props.scheduled_date != undefined &&
                    this.props.scheduled_date != null &&
                    this.props.scheduled_date != ""
                    ?
                    <EDRTLView style={[styles.scheduled]}>
                        <Icon name="schedule" size={getProportionalFontSize(18)} color={EDColors.primary} />
                        <EDRTLText
                            title={strings("orderScheduled") + " " +
                                moment(this.props.scheduled_date, "YYYY-MM-DD").format("MMMM D, YYYY") + ", " +
                                this.props.slot_open_time + " - " + this.props.slot_close_time
                            } style={styles.schedulingText} />
                    </EDRTLView> : null}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    mainView: { marginHorizontal: 15, marginTop: 15, marginBottom: 10 },
    subView: { marginHorizontal: 15, marginBottom: 10, flexWrap: "wrap" },
    textStyle: { fontSize: getProportionalFontSize(14), fontFamily: EDFonts.medium, color: EDColors.black },
    textStyle1: { fontSize: getProportionalFontSize(14), fontFamily: EDFonts.semibold, color: EDColors.text },
    scheduled: {
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 10

    },
    schedulingText: {
        marginHorizontal: 5,
        color: EDColors.black,
        flex: 1,
        fontFamily: EDFonts.semibold, fontSize: getProportionalFontSize(14)
    },
})

