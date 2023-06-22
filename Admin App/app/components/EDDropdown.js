import React, { Component } from 'react';
import { TouchableOpacity, FlatList, StyleSheet, Text } from 'react-native';
import { EDColors } from '../utils/EDColors';
import { View } from 'native-base';
import { getProportionalFontSize, isRTLCheck } from '../utils/EDConstants';
import { EDFonts } from '../utils/EDFontConstants';
import Icon from 'react-native-vector-icons/MaterialIcons';
import EDRTLText from './EDRTLText';
import EDRTLView from './EDRTLView';
import EDPlaceholderComponent from './EDPlaceholderComponent';
import { strings } from '../locales/i18n';
import EDButton from './EDButton';
import Metrics from '../utils/metrics';

export default class EDDropdown extends Component {
    constructor(props) {
        super(props)
        this.state = {
            icon: this.renderDropdownIcon,
            selectedItem: undefined,
            selectedIndex: -1,
            showError: false
        }
    }
    componentDidMount() {
        if (this.props.forOrderStatus) {
            this.dropDownArray = Object.values(this.props.dropDownArray)
        }
        else
            this.dropDownArray = this.props.dropDownArray
        this.forceUpdate()
    }

    /**
     *
     * @param {Setting Position of picker} positionAttributes
     */
    adjustDropDownFrame = positionAttributes => {
        positionAttributes.right = 15
        positionAttributes.top -= 5
        return positionAttributes
    }

    /**
     *
     * @param {Passing selected index back to container} selectedIndex 
     */
    onSelectionChange = selectedIndex => {
        this.props.onDropDownSelectionChange(selectedIndex)
    }

    render() {
        return (
            <View style={styles.parentViewStyle}>
                <View style={styles.mainContainer}>
                    <EDRTLView style={styles.titleView}>
                        <Icon size={getProportionalFontSize(20)} name={'clear'} color={EDColors.transparent} />

                        <EDRTLText title={this.props.title || ''} style={styles.titleTextStyle} />
                        <Icon size={getProportionalFontSize(20)} name={'clear'} color={EDColors.text} onPress={this.closeClick} />
                    </EDRTLView >
                    {this.dropDownArray !== undefined && this.dropDownArray !== null && this.dropDownArray.length !== 0 ?
                        (
                            <View style={styles.flatlistViewStyle} >
                                <FlatList
                                    data={this.dropDownArray || []}
                                    keyExtractor={(item, index) => item + index}
                                    renderItem={this.renderCategory}
                                />
                                {this.state.showError ? <Text style={styles.errText} >{strings('orderSelectoption')}</Text> : false}
                                <EDButton
                                    style={styles.buttonStyle}
                                    textStyle={styles.buttonTextStyle}
                                    label={strings('dialogConfirm')}
                                    onPress={this.buttonConfirmPressed}
                                    disabled={this.state.selectedIndex == -1 ? true : false}
                                />
                            </View>
                        ) :
                        <View>
                            <EDRTLText title={strings('generalNoData')} style={styles.errorTextStyle} />
                        </View>
                    }
                </View>
            </View>
        )
    }
    //#region HELPER METHODS
    renderCategory = (items, index) => {
        return (
            <View style={[styles.marginViewStyle, this.state.selectedIndex == items.index ? { borderRadius: 16, backgroundColor: EDColors.radioSelected } : {}]}>
                <TouchableOpacity onPress={() => this.itemSelect(items)}>
                    <Text style={[styles.textStyle, this.state.selectedIndex == items.index ? { color: EDColors.black, fontFamily: EDFonts.semibold } : {}, { alignSelf: isRTLCheck() ? "flex-end" : "flex-start" }]}>{this.props.forOrderStatus ? items.item : items.item.first_name}</Text>
                </TouchableOpacity>
            </View>
        )
    }
    buttonConfirmPressed = () => {
        // console.log('index-------------' , this.state.selectedIndex)
        if (this.state.selectedIndex == -1) {
            this.setState({ showError: true })
        } else
            if (this.props.onSelectionChange !== undefined && this.state.selectedItem !== undefined) {
                this.props.onSelectionChange(this.props.forOrderStatus ? this.state.selectedItem : this.state.selectedItem.item)
            }
    }

    itemSelect = (selectedItem) => {
        this.setState({ selectedItem: selectedItem, selectedIndex: selectedItem.index, showError: false })
    }
    closeClick = () => {
        if (this.props.CloseClick !== undefined) {
            this.props.CloseClick()
        }
    }
}
//#region STYLES
const styles = StyleSheet.create({
    mainContainer: {
        padding: 10,
        justifyContent: 'center',
        margin: 15,
        backgroundColor: 'white',
        borderRadius: 24,
        // height: 300,
        marginBottom: 50,
        paddingBottom: 20,
        // maxHeight: Metrics.screenHeight* 0.75
    },
    errText: {
        fontFamily: EDFonts.regular,
        color: EDColors.error,
        fontSize: getProportionalFontSize(12),
        marginHorizontal: 20
    },
    textStyle: {
        fontSize: getProportionalFontSize(16),
        fontFamily: EDFonts.medium,
        color: EDColors.text,
        marginVertical: 5,
    },
    titleView: {
        margin: 10,
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomColor: EDColors.backgroundDark,
        borderBottomWidth: 1,
        paddingBottom: 10,
        // flex : 1
    },
    titleTextStyle: {
        fontSize: getProportionalFontSize(16),
        fontFamily: EDFonts.semibold,
        color: EDColors.primary,
        marginVertical: 5,
        textAlign: 'center',
        paddingHorizontal: 8,
        flex : 1
    },
    errorTextStyle: {
        fontSize: getProportionalFontSize(16),
        fontFamily: EDFonts.semibold,
        color: EDColors.black,
        marginVertical: 5,
        textAlign: 'center',
        paddingHorizontal: 8
    },
    marginViewStyle: { marginHorizontal: 10, padding: 10, justifyContent: 'center' },
    buttonStyle: { borderRadius: 16, marginHorizontal: 5, marginTop: 15 },
    parentViewStyle: { flex: 1, justifyContent: 'flex-end' },
    flatlistViewStyle: { maxHeight: Metrics.screenHeight * 0.65 },
    buttonTextStyle: { color: EDColors.white, fontSize: getProportionalFontSize(16), fontFamily: EDFonts.medium, marginVertical: 8 }
})
//#endregion

