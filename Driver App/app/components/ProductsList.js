/* eslint-disable semi */
/* eslint-disable prettier/prettier */
import React, { Component } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { strings } from '../locales/i18n';
import { EDColors } from '../utils/EDColors';
import { funGetFrench_Curr, getProportionalFontSize, isRTLCheck } from '../utils/EDConstants';
import { EDFonts } from '../utils/EDFontConstants';
import Metrics from '../utils/metrics';
import EDButton from './EDButton';
import EDRTLText from './EDRTLText';
import EDRTLView from './EDRTLView';

export default class ProductsList extends Component {

    renderProductItems() {
        return (
            <View style={{ marginVertical: 5 }}>
                {this.props.orderDetails.map(itemToIterate => {
                    return (
                        <View>
                            <View style={{ marginVertical: 5, borderBottomColor: '#EDEDED', borderBottomWidth: 1, flex: 1, marginHorizontal: 10 }} />
                            <EDRTLView style={styles.itemContainer}>
                                <EDRTLText style={styles.itemName} title={itemToIterate.item_name + ' (x' + (itemToIterate.qty_no) + ')'} />
                                <EDRTLText style={styles.itemPrice} title={this.props.currencySymbol + funGetFrench_Curr(itemToIterate.itemTotal, 1, this.props.lan)} />
                            </EDRTLView>

                        </View>
                    )
                })}
            </View>
        )
    }

   
    render() {
        var numberOfItems = 0;
        if (this.props.orderDetails !== undefined) {
            this.props.orderDetails.map(itemToIterate => { numberOfItems += parseInt(itemToIterate.qty_no) })
        }

        return (
            <View style={styles.productsSummaryContainer}>

                <EDRTLText
                    style={styles.modalTitle}
                    title={strings('productDetail') + ' (' + numberOfItems + ' ' + (numberOfItems === 1 ? strings('item') : strings('items')) + ')'} />
                <ScrollView>
                    {this.renderProductItems()}
                </ScrollView>
                <EDButton
                    style={styles.dismissButton}
                    label={strings('dismiss')}
                    onPress={this.props.dismissProductsListHandler}
                    textStyle={{ marginVertical: 7 }}
                />

            </View>


        )
    }
}

const styles = StyleSheet.create({
    productsSummaryContainer: { padding: 8, maxHeight: Metrics.screenHeight * 0.75, overflow: 'scroll', borderRadius: 24, marginHorizontal: 20, paddingVertical: 15, backgroundColor: EDColors.white, shadowOpacity: 0.25, shadowRadius: 5, shadowColor: EDColors.text, shadowOffset: { height: 0, width: 0 } },
    itemContainer: { marginVertical: 10, marginHorizontal: 0 },
    modalTitle: { alignSelf: isRTLCheck() ? 'flex-end' : 'flex-start', marginVertical: 10, marginHorizontal: 10, color: EDColors.black, fontSize: getProportionalFontSize(16), fontFamily: EDFonts.semiBold, fontWeight: '500' },
    itemName: { marginHorizontal: 10, flex: 1, color: EDColors.text, fontSize: getProportionalFontSize(16), fontFamily: EDFonts.medium, fontWeight: '500' },
    itemPrice: { marginHorizontal: 10, color: EDColors.text, fontSize: getProportionalFontSize(16), fontFamily: EDFonts.medium, fontWeight: '500' },
    dismissButton: { paddingHorizontal: 20, alignSelf: 'center', marginTop: 10, marginBottom: 5, width: '95%', borderRadius: 16 },
})
