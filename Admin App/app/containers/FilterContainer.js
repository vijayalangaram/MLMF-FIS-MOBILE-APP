import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { connect } from "react-redux";
import EDRTLText from "../components/EDRTLText";
import EDRTLView from "../components/EDRTLView";
import { strings } from "../locales/i18n";
import { EDColors } from "../utils/EDColors";
import { funGetDate, funGetDateStr, getProportionalFontSize, isRTLCheck } from "../utils/EDConstants";
import { EDFonts } from "../utils/EDFontConstants";
import metrics from "../utils/metrics";
import BaseContainer from "./BaseContainer";
import EDFilterCheckBox from "../components/EDFilterCheckBox"
import EDPopupView from "../components/EDPopupView";
import EDDatePicker from "../components/EDDatePicker"
import EDThemeButton from "../components/EDThemeButton";
import moment from "moment";

class FilterContainer extends React.Component {
    constructor(props) {
        super(props);

        this.filterOptions = [strings("filterToday"), strings("filterYesterday"), strings("filterThisWeek"), strings("filterThisMonth"), strings("filterCustomRange")]

    }

    state = {
        sendFilterDetailsBack: this.props.route.params.getFilterDetails,
        isLoading: false,
        isSelected: false,
        currentStartDate: this.props.route.params.startDate != "" ? this.props.route.params.startDate : moment(new Date().toISOString()).format('YYYY-MM-DD'),
        currentEndDate: this.props.route.params.endDate != "" ? this.props.route.params.endDate : moment(new Date().toISOString()).format('YYYY-MM-DD'),
        startDate: this.props.route.params.startDate != "" ? funGetDateStr(this.props.route.params.startDate.toLocaleString(), 'MM-DD-YYYY') : moment(new Date().toISOString()).format('MM-DD-YYYY'),
        endDate: this.props.route.params.endDate != "" ? funGetDateStr(this.props.route.params.endDate.toLocaleString(), 'MM-DD-YYYY') : moment(new Date().toISOString()).format('MM-DD-YYYY'),
        isStartDatePickerVisible: false,
        isEndDatePickerVisible: false,
        showCustomRange: this.props.route.params.selectedFilter == strings("filterCustomRange") ? true : false,
        selectedFilter: this.props.route.params.selectedFilter,
        newDate: new Date()
    };

    addToFilterType = (data) => {
        this.setState({ selectedFilter: data })
        if (data == strings("filterCustomRange")) {
            this.setState({ showCustomRange: true })
        } else {
            this.setState({ showCustomRange: false })
        }
    }

    removeFromFilterType = () => {
        this.setState({ showCustomRange: false })

    }

    renderFilterOptions = (data) => {
        return (
            <SafeAreaView style={styles.horizontalMarginView} >
                <EDFilterCheckBox
                    isSelected={this.state.selectedFilter == data}
                    data={data}
                    addToFilterType={this.addToFilterType}
                    removeFromFilterType={this.removeFromFilterType}
                />
            </SafeAreaView>
        )
    }

    /** SHOW FIRST DATE PICKER */
    _showStartDatePicker = () => {
        this.setState({ isStartDatePickerVisible: true })
        // console.log("THIS STATE ISSELECTED::::::::::", this.state.isSelected)
    };

    /** HIDE FIRST DATE PICKER */
    _hideStartDatePicker = () => this.setState({ isStartDatePickerVisible: false });

    /** SHOW END DATE PICKER */
    _showEndDatePicker = () => { this.setState({ isEndDatePickerVisible: true }) };

    /** HIDE END DATE PICKER */
    _hideEndDatePicker = () => this.setState({ isEndDatePickerVisible: false });

    confirmStartDate = (date) => {
        console.log("CONFIRM:::::", this.state.currentStartDate)
        var datePicked = funGetDate(this.state.currentStartDate)
        this.setState({ startDate: datePicked, isStartDatePickerVisible: false })
        // console.log("THIS STATE START DATE::::::", this.state.startDate )
    };

    /** DATE PICKER HANDLER */
    _handleStartDatePicked = date => {
        console.log("DATE PICKED:::::", date)
        var datePicked = funGetDate(date.dateString);
        this.setState({ currentStartDate: date.dateString });
        // this._hideDatePicker()
    };

    confirmEndDate = () => {
        var datePicked = funGetDate(this.state.currentEndDate)
        this.setState({ endDate: datePicked, isEndDatePickerVisible: false })
        // console.log("CONFIRM END DATE:::::", this.state.currentEndDate)
    };

    /** DATE PICKER HANDLER */
    _handleEndDatePicked = date => {
        // console.log("DATE PICKED:::::", date.dateString)
        var datePicked = funGetDate(date.dateString);
        this.setState({ currentEndDate: date.dateString });
        // console.log("CONFIRM END DATE:::::", this.state.currentEndDate)
        // this._hideDatePicker()
    };


    renderStartCustomCalender = () => {
        return (
            <EDPopupView isModalVisible={this.state.isStartDatePickerVisible}>
                <EDDatePicker
                    title={strings("filterFrom")}
                    currentDate={this.state.currentStartDate}
                    _handleDatePicked={this._handleStartDatePicked}
                    confirmDate={this.confirmStartDate}
                    _hideDatePicker={this._hideStartDatePicker}
                    maxDate={this.state.currentEndDate}
                />
            </EDPopupView>
        )
    }

    renderEndCustomCalender = () => {
        return (
            <EDPopupView isModalVisible={this.state.isEndDatePickerVisible}>
                <EDDatePicker
                    title={strings("filterTill")}
                    currentDate={this.state.currentEndDate}
                    _handleDatePicked={this._handleEndDatePicked}
                    confirmDate={this.confirmEndDate}
                    _hideDatePicker={this._hideEndDatePicker}
                    minDate={this.state.currentStartDate}
                />
            </EDPopupView>
        )
    }

    reset = () => {
        this.state.showCustomRange = false,
            this.state.selectedFilter = "",
            this.state.startDate = funGetDateStr(new Date().toLocaleString(), 'MM-DD-YYYY')
        this.state.endDate = funGetDateStr(new Date().toLocaleString(), 'MM-DD-YYYY')
        this.state.currentStartDate = new Date()
        this.state.currentEndDate = new Date()
        var data = {
            startDate: this.state.currentStartDate,
            endDate: this.state.currentEndDate,
            selectedFilter: this.state.selectedFilter
        };
        this.applyFilter(data)
        // console.log("DATA PASSED:::::::: ", data)
    }

    applyFilter(data) {
        // console.log("DATA PASSED:::::::: ", data)
        if (this.state.sendFilterDetailsBack != undefined) {
            this.state.sendFilterDetailsBack(data);
        }
        this.props.navigation.goBack();
    }

    render() {
        return (
            <BaseContainer
                title={strings("filterTitle")}
                left={isRTLCheck() ? 'arrow-forward' : 'arrow-back'}
                onLeft={() => { this.props.navigation.goBack() }}
                loading={this.state.isLoading}>

                {this.renderStartCustomCalender()}
                {this.renderEndCustomCalender()}

                <ScrollView>

                    <Text style={styles.headerTextStyle} >{strings("filterHeader")}</Text>

                    <EDRTLView style={styles.filterView}>
                        {this.filterOptions.map(data => {
                            return this.renderFilterOptions(data)
                        })}
                    </EDRTLView>

                    {this.state.showCustomRange ?
                        <EDRTLView style={styles.customRangeView} >
                            <EDRTLView style={styles.datePickerView} >
                                <EDRTLText title={strings("orderFrom")} style={styles.datePickerText} />
                                <TouchableOpacity onPress={this._showStartDatePicker}>
                                    <EDRTLView>
                                        <EDRTLText
                                            numberOfLines={1}
                                            style={styles.datePickerText}
                                            title={this.state.startDate} />
                                    </EDRTLView>
                                </TouchableOpacity>
                            </EDRTLView>

                            <EDRTLView style={styles.datePickerView} >
                                <EDRTLText title={strings("orderTo")} style={styles.datePickerText} />
                                <TouchableOpacity onPress={this._showEndDatePicker}>
                                    <EDRTLView>
                                        <EDRTLText
                                            numberOfLines={1}
                                            style={styles.datePickerText}
                                            title={this.state.endDate} />
                                    </EDRTLView>
                                </TouchableOpacity>
                            </EDRTLView>
                        </EDRTLView>
                        : null}

                </ScrollView>
                <EDRTLView
                    style={styles.buttonView}>
                    <EDThemeButton
                        style={styles.buttonStyle}
                        textStyle={styles.themeButton}
                        onPress={() => {
                            var data = {
                                startDate: this.state.currentStartDate,
                                endDate: this.state.currentEndDate,
                                selectedFilter: this.state.selectedFilter
                            };
                            this.applyFilter(data);
                        }}
                        label={strings("filterApply")}
                    />
                    <EDThemeButton
                        style={styles.buttonStyle2}
                        textStyle={styles.themeButton2}
                        onPress={this.reset}
                        label={strings("filterReset")}
                    />
                </EDRTLView>
            </BaseContainer>
        );
    }
}

export const styles = StyleSheet.create({
    datePickerView: { paddingHorizontal: 10, alignItems: "center", alignSelf: 'center', marginHorizontal: 10, height: 30, borderRadius: 8, borderWidth: 1, borderColor: '#EDEDED' },
    datePickerText: { fontSize: getProportionalFontSize(14), fontFamily: EDFonts.medium, color: EDColors.black, marginTop: 7 },
    buttonStyle: {
        width: (metrics.screenWidth * 0.5) - 60,
        height: metrics.screenHeight * 0.07,
        borderColor: EDColors.primary,
        paddingBottom: 0,
        backgroundColor: EDColors.primary,
        borderRadius: 16,
    },
    buttonStyle2: {
        width: (metrics.screenWidth * 0.5) - 60,
        height: metrics.screenHeight * 0.07,
        borderColor: EDColors.white,
        paddingBottom: 0,
        backgroundColor: EDColors.white,
        borderRadius: 16,
    },
    themeButton: { color: EDColors.white, fontFamily: EDFonts.regular, paddingHorizontal: 10, },
    themeButton2: { color: EDColors.black, fontFamily: EDFonts.regular, paddingHorizontal: 10, },
    headerTextStyle: { fontSize: getProportionalFontSize(16), fontFamily: EDFonts.semibold, marginHorizontal: 10, marginVertical: 10 },
    filterView: { flexWrap: "wrap", justifyContent: "flex-start" },
    customRangeView: { justifyContent: "space-between", marginTop: 10 },
    buttonView: { marginHorizontal: 10, justifyContent: "space-around", marginVertical: 10 },
    horizontalMarginView: { marginHorizontal: 5 },

});


// CONNECT FUNCTION
export default connect(
    state => {
        return {
            lan: state.userOperations.lan,
        };
    },
    dispatch => {
        return {

        }
    }
)(FilterContainer);