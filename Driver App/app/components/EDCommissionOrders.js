import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import EDRTLView from "../components/EDRTLView";
import { strings } from "../locales/i18n";
import { EDColors } from "../utils/EDColors";
import { funGetDateFormat, funGetFrench_Curr, getProportionalFontSize } from "../utils/EDConstants";
import { EDFonts } from "../utils/EDFontConstants";
import Metrics from "../utils/metrics";
import EDImage from "./EDImage";
import EDRTLText from "./EDRTLText";

export default class EDCommissionOrders extends React.Component {

    state = {
        isOpen: false
    };

    buttonArrowPressed = () => {
        this.setState({ isOpen: !this.state.isOpen })
    }

    render() {
        return (

            <View style={styles.mainView}>
                {/* // MAIN CONTAINER  */}
                <View style={styles.subView}>
                    <TouchableOpacity
                        onPress={this.buttonArrowPressed}
                        activeOpacity={1}
                    >
                        {/* RTL VIEW */}
                        <EDRTLView
                            style={{
                                alignItems: 'center',
                                paddingVertical: 10
                            }}>

                            {/* SHOW MIDDLE TEXT ( ORDER_ID ) and ID Number  */}

                            <EDRTLText style={styles.middleText}
                                title={strings("orderId") + this.props.orderCommission.order_id} />

                            {/* SHOW EXPAND IMAGE BUTTON */}

                            <View
                                style={styles.expandBtn}
                            >
                                <MaterialIcon size={25} iconStyle={{ backgroundColor: 'green' }} containerStyle={{ backgroundColor: 'yellow' }} color={EDColors.text} name={this.state.isOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} />
                            </View>
                        </EDRTLView>
                    </TouchableOpacity>

                    {/* IF OPEN */}
                    {this.state.isOpen ?
                        // MAIN VIEW
                        <View style={styles.openView}>
                            <EDRTLView style={{ marginVertical: 5 }} >

                                {/* SHOW MIDDLE TEXT */}
                                <View style={{ flex: 1, justifyContent: 'space-between', paddingHorizontal: 1, }}>
                                   {/* HEADER NAME ie RESTAURANT NAME ie in bold letter  */}
                                    <EDRTLText style={styles.name} title={this.props.orderCommission.name} />

                                    {this.props.orderCommission.commission !== undefined &&
                                        this.props.orderCommission.commission !== null &&
                                        this.props.orderCommission.commission.trim().length !== 0
                                        ?
                                        (this.props.orderCommission.commission !== null ?
                                            <EDRTLText style={{ fontSize: getProportionalFontSize(12), fontFamily: EDFonts.regular, color: EDColors.text }}
                                                title={strings("earnings") + this.props.orderCommission.currency_symbol + funGetFrench_Curr(this.props.orderCommission.commission, 1, this.props.lan)} /> : null)

                                        : null}
                                    {this.props.orderCommission.driver_tip !== undefined &&
                                        this.props.orderCommission.driver_tip !== null &&
                                        this.props.orderCommission.driver_tip.trim().length !== 0 &&
                                        this.props.orderCommission.order_status !== "Cancel"
                                        ?
                                        (this.props.orderCommission.driver_tip !== null ?
                                            <EDRTLText style={{ fontSize: getProportionalFontSize(12), fontFamily: EDFonts.regular, color: EDColors.text }}
                                                title={strings("earningTip") + this.props.orderCommission.currency_symbol + funGetFrench_Curr(this.props.orderCommission.driver_tip, 1, this.props.lan)} />
                                                 : null)

                                        : null}
                                    {/* <EDRTLText style={styles.orderStatus} title={this.props.orderCommission.order_status_display} /> */}

                                    {/* DAY , MONTH , DAY , YEAR AND TIME  */}
                                    <EDRTLText style={styles.date} title={funGetDateFormat(this.props.orderCommission.time,
                                        "dddd MMM DD, YYYY, hh:mm A"
                                        )} />
                                </View>
                                {/* USER IMAGE VIEW CONTAINER */}
                                <View style={{ justifyContent: 'center' }}>

                                    <EDImage
                                        source={this.props.orderCommission.image}
                                        style={styles.userImage}
                                    />
                                </View>
                            </EDRTLView>
                            <EDRTLView style={{ justifyContent: 'space-between', flex: 1, paddingHorizontal: 1, marginVertical: 5, marginTop: 8 }}>
                                {/* SHOW bottom TEXT */}
                                <EDRTLText style={[styles.orderStatus , { color : this.props.orderCommission.order_status == "Cancel" ? "red" : '#189652'   }]} title={this.props.orderCommission.order_status_display} />

                                {this.props.orderCommission.commission !== undefined &&
                                    this.props.orderCommission.commission !== null &&
                                    this.props.orderCommission.commission.trim().length !== 0
                                    ?
                                    <EDRTLView style={{}}>
                                        <EDRTLText style={styles.commission} title={this.props.orderCommission.currency_symbol + funGetFrench_Curr(this.props.orderCommission.total_rate, 1, this.props.lan)} />


                                    </EDRTLView> : null}

                            </EDRTLView>
                        </View>
                        : null}
                </View>
                {/* <View style={styles.separator} /> */}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    mainView: { backgroundColor: EDColors.white, marginTop: 15, marginHorizontal: 15, borderRadius: 16,
     },
    subView: { paddingHorizontal: 10, backgroundColor: EDColors.white, borderRadius: 16 },
    middleText: { flex: 1, fontFamily: EDFonts.medium, fontSize: getProportionalFontSize(12), color: EDColors.text },
    expandBtn: { justifyContent: 'center', alignItems: 'center', },
    openView: { paddingVertical: 5, backgroundColor: EDColors.white, borderTopColor: '#F6F6F6', borderTopWidth: 1 },
    userImage: { width: Metrics.screenWidth / 5, height: Metrics.screenWidth / 5, borderRadius: 5 },
    name: { fontSize: getProportionalFontSize(16), fontFamily: EDFonts.semiBold },
    orderStatus: { fontSize: getProportionalFontSize(12), fontFamily: EDFonts.semiBold, color: '#189652' },
    date: { fontSize: getProportionalFontSize(12), fontFamily: EDFonts.regular, color: EDColors.text },
    commission: { alignSelf: "center", fontSize: getProportionalFontSize(12), fontFamily: EDFonts.semiBold, color: EDColors.black, paddingHorizontal: 15 },
    separator: { height: 1, flex: 1, borderWidth: 0.6, borderColor: EDColors.shadow }
})
