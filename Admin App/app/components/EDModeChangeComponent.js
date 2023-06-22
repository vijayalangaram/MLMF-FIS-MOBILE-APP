import React, { useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { strings } from '../locales/i18n';
import { EDColors } from '../utils/EDColors';
import { getProportionalFontSize } from '../utils/EDConstants';
import { EDFonts } from '../utils/EDFontConstants';
import EDButton from './EDButton';
import EDPopupView from './EDPopupView';
import EDRTLText from './EDRTLText';
import EDRTLView from './EDRTLView';

export const EDModeChangeComponent = (props) => {

    const selectedRestaurant = props.selectedRestaurant || {}
    const [selectedMode, setSelectedMode] = useState(selectedRestaurant.currentMode || "")

    const timeout_steps = props.timeout_steps || []
    const available_mode = props.available_mode || []

    const [timeoutDuration, setTimeoutDuration] = useState(timeout_steps[0] || "")
    const [shouldShowTimeDropdown, setTimeDropdown] = useState(false)



    const switchMode = (mode) => {
        setSelectedMode(mode.id)
    }

    const showTimeDropdown = () => {
        setTimeDropdown(true)
    }

    const hideTimeDropdown = () => {
        setTimeDropdown(false)
    }

    const renderTimeModal = () => {
        return <EDPopupView
            isModalVisible={shouldShowTimeDropdown}
            onRequestClose={hideTimeDropdown}
        >
            <View
                style={{ backgroundColor: EDColors.white, justifyContent: 'center', margin: 50, padding: 15, borderRadius: 16 }}

            >

                <EDRTLText title={strings("orderSelectoption")} style={[styles.title, { textAlign: "center" }]} />

                <FlatList data={timeout_steps}
                    renderItem={renderTimeOut}
                    contentContainerStyle={{
                        marginVertical: 10,
                        paddingTop: 10,
                        borderTopColor: EDColors.separatorColor, borderTopWidth: 1,
                    }}
                    ItemSeparatorComponent={() => {
                        return <View style={styles.separatorStyle} />
                    }}
                />
            </View>
        </EDPopupView>
    }

    const setTimeout = (time) => {
        setTimeoutDuration(time)
        setTimeDropdown(false)
    }
    const renderTimeOut = ({ item }) => {
        return <TouchableOpacity
            onPress={() => setTimeout(item)}
            style={{ alignItems: 'center', justifyContent: "space-between", flexDirection: 'row' }}>
            <EDRTLText title={item + " " + strings("mins")} />
            {item == timeoutDuration ?
                <Icon name="done" size={getProportionalFontSize(23)} color={EDColors.primary} /> : null}

        </TouchableOpacity>
    }

    onSubmit = () => {
        props.onSubmit(selectedMode, timeoutDuration)
    }

    return (
        <View style={styles.mainView}>
            {renderTimeModal()}
            <EDRTLText title={selectedRestaurant.restaurant_name} style={styles.resName} />
            <View style={styles.separatorStyle} />
            <EDRTLText title={strings("estimateOrderTime")} style={styles.title} />
            <EDRTLView style={{ alignItems: 'center', flexWrap: "wrap", marginVertical: 20, }}>
                {available_mode.map(mode => {
                    return <TouchableOpacity
                        onPress={() => switchMode(mode)}
                        style={[styles.modeButton, selectedMode == mode.id ? { backgroundColor: EDColors.primary, borderColor: EDColors.primary } : {}]}>
                        <EDRTLText title={mode.title} style={[styles.modeTitle, selectedMode == mode.id ? { color: EDColors.white } : {}]} />
                        <EDRTLText title={mode.time} style={[styles.modeTime, selectedMode == mode.id ? { color: EDColors.white } : {}]} />

                    </TouchableOpacity>
                })}
            </EDRTLView>
            {selectedMode != 0 ?
                <EDRTLView style={{ alignItems: 'center', }}>
                    <EDRTLText title={strings("switchToNormal")} style={styles.normalText} />
                    <TouchableOpacity style={styles.dropdownBox}
                        activeOpacity={1}
                        onPress={showTimeDropdown}
                    >
                        <EDRTLText title={timeoutDuration + " " + strings("mins")} style={styles.timeText} />
                        <Icon name="caret-down" type="font-awesome" size={getProportionalFontSize(23)} color={EDColors.textNew} />
                    </TouchableOpacity>
                </EDRTLView> : null}
            <EDRTLView style={{ alignItems: 'center', justifyContent: "center", marginTop: 25 }}>
                <EDButton label={strings("dialogCancel")} onPress={props.onCancel} style={styles.cancelBtn} textStyle={styles.cancelBtnText} />
                <EDButton label={strings("generalSubmit")} onPress={onSubmit} style={styles.submitBtn} textStyle={styles.submitBtnText} />
            </EDRTLView>
        </View>
    )
}

const styles = StyleSheet.create({
    mainView: {
        backgroundColor: EDColors.white,
        borderRadius: 16,
        padding: 15,
        margin: 20,
    },
    separatorStyle: {
        height: 1, backgroundColor: EDColors.separatorColor,
        marginVertical: 10
    },
    title: {
        color: EDColors.black,
        fontFamily: EDFonts.semibold,
        fontSize: getProportionalFontSize(15),
    },
    resName: {
        color: EDColors.black,
        fontFamily: EDFonts.semibold,
        fontSize: getProportionalFontSize(18),
        textAlign: 'center'
    },
    normalText: {
        color: EDColors.black,
        fontFamily: EDFonts.medium,
        fontSize: getProportionalFontSize(14),
    },
    submitBtn: {
        flex: .5,
        marginRight: 0,
        marginLeft: 5
    },
    cancelBtn: {
        backgroundColor: EDColors.offWhite,
        borderWidth: 1,
        borderColor: EDColors.separatorColor,
        flex: .5,
        marginRight: 5,
        marginLeft: 0
    },
    submitBtnText: {
        fontSize: getProportionalFontSize(16)
    },
    cancelBtnText: {
        fontSize: getProportionalFontSize(16),
        color: EDColors.black
    },
    modeTitle: {
        color: EDColors.black,
        fontFamily: EDFonts.semibold,
        fontSize: getProportionalFontSize(14)
    },
    modeTime: {
        color: EDColors.black,
        fontFamily: EDFonts.regular,
        fontSize: getProportionalFontSize(13)
    },
    modeButton: {
        borderWidth: 1,
        borderColor: EDColors.secondaryBorderColor,
        marginRight: 10,
        marginBottom: 10,
        paddingVertical: 5,
        paddingHorizontal: 15,
        alignItems: 'center',
        borderRadius: 6
    },
    dropdownBox: {
        paddingVertical: 2.5,
        paddingHorizontal: 5,
        borderColor: EDColors.borderColor,
        borderWidth: 1,
        marginHorizontal: 10,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 6,
        flex: 1
    },
    timeText: {
        color: EDColors.black,
        fontFamily: EDFonts.semibold,
        fontSize: getProportionalFontSize(13),
        marginHorizontal: 10,
        flex: 2,
        textAlign: 'center'
    },
})