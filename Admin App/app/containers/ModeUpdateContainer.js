import React, { useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { RadioButton, RadioGroup } from 'react-native-flexi-radio-button';
import { useSelector } from 'react-redux';
import EDRTLText from '../components/EDRTLText';
import EDThemeButton from '../components/EDThemeButton';
import { strings } from '../locales/i18n';
import { showDialogue, showTopDialogue } from '../utils/EDAlert';
import { EDColors } from '../utils/EDColors';
import { getProportionalFontSize, isRTLCheck, RESPONSE_SUCCESS } from '../utils/EDConstants';
import { EDFonts } from '../utils/EDFontConstants';
import { netStatus } from '../utils/NetworkStatusConnection';
import { updateRestaurantModeAPI } from '../utils/ServiceManager';
import BaseContainer from './BaseContainer';


export const ModeUpdateContainer = (props) => {
    const selectedRestaurant = props.route.params.selectedRestaurant || {}
    const [selectedMode, setSelectedMode] = useState(selectedRestaurant.currentMode || "")
    const [isLoading, setLoading] = useState(false)


    const timeout_steps = props.route.params.timeout_steps || []
    const available_mode = props.route.params.available_mode || []
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [timeoutDuration, setTimeoutDuration] = useState(timeout_steps[0] || "")

    const language_slug = useSelector((state) => state.userOperations.lan)
    const user_id = useSelector((state) => state.userOperations.userDetails.UserID)


    const switchMode = (mode) => {
        setSelectedMode(mode.id)
    }

    const buttonBackPressed = () => {
        props.navigation.goBack()
    }

    const onSelectionIndexChangeHandler = (index) => {
        setSelectedIndex(index)
        setTimeoutDuration(timeout_steps[index])
    }

    const updateRestaurantMode = () => {
        netStatus(status => {
            if (status) {
                setLoading(true)
                let updateParams = {
                    user_id: user_id,
                    language_slug: language_slug,
                    restaurant_content_id: selectedRestaurant.restaurant_content_id,
                    off_time: timeoutDuration,
                    restaurant_schedule_mode: selectedMode
                }
                updateRestaurantModeAPI(updateParams, onSuccessModeUpdate, onFailureModeUpdate, props)
            }
            else
                showTopDialogue(strings("generalNoInternetMessage"), true)
        })
    }

    const onSuccessModeUpdate = (onSuccess) => {
        setLoading(false)
        if (onSuccess.data !== undefined && onSuccess.data.status == RESPONSE_SUCCESS) {
            showDialogue(onSuccess.message, "", [], buttonBackPressed)
        }

        else
            showTopDialogue(onSuccess.message, true)

    }

    const onFailureModeUpdate = (onFailure) => {
        setLoading(false)
        showTopDialogue(onFailure.message, true)


    }

    return (
        <BaseContainer
            title={selectedRestaurant.restaurant_name}
            left={
                isRTLCheck() ? 'arrow-forward' : 'arrow-back'}
            onLeft={buttonBackPressed}
            loading={isLoading}
        // connection={this.onConnectionChangeHandler}
        >
            <View style={styles.mainView}>

                <EDRTLText title={strings("estimateOrderTime")} style={styles.title} />
                <FlatList data={available_mode.length % 2 === 1 ? [...available_mode, { empty: true }] : available_mode}
                    style={{ marginTop: 10, marginBottom: 20, }}
                    numColumns={2}
                    extraData={selectedMode}
                    renderItem={({ item, index }) => {
                        return <TouchableOpacity
                            disabled={item.empty}
                            onPress={() => switchMode(item)}
                            style={[styles.modeButton, item.empty ? { backgroundColor: EDColors.transparent } : selectedMode == item.id ? { backgroundColor: EDColors.primary, borderColor: EDColors.primary } : {}]}>
                            <EDRTLText title={item.title} style={[styles.modeTitle, selectedMode == item.id ? { color: EDColors.white } : {}]} />
                            <EDRTLText title={item.time} style={[styles.modeTime, selectedMode == item.id ? { color: EDColors.white } : {}]} />

                        </TouchableOpacity>
                    }}
                />
                {selectedMode != 0 ?
                    <>
                        <EDRTLText title={strings("switchToNormal")} style={styles.title} />
                        <RadioGroup
                            color={EDColors.text}
                            onSelect={onSelectionIndexChangeHandler}
                            style={styles.radioGroupStyle}
                            selectedIndex={selectedIndex}
                            thickness={2}
                            size={18}
                            activeColor={EDColors.primary}
                        >
                            {timeout_steps.length !== 0 ?
                                timeout_steps.map((timeToIterate) => {
                                    return (
                                        <RadioButton
                                            style={[styles.radioButtonStyle, { flexDirection: isRTLCheck() ? 'row-reverse' : 'row' }]}
                                            key={timeToIterate}
                                            value={timeToIterate}
                                            color={EDColors.primary}
                                        >
                                            <EDRTLText title={timeToIterate + " " + strings("mins")} style={styles.radioText} />

                                        </RadioButton>
                                    )
                                }) : null}
                        </RadioGroup>
                    </>

                    : null}

            </View>
            <EDThemeButton label={strings("profileSave")} style={styles.submitBtn} textStyle={styles.submitBtnText} onPress={updateRestaurantMode} />

        </BaseContainer>
    )
}

const styles = StyleSheet.create({
    mainView: {
        paddingVertical: 15,
        paddingHorizontal: 5
    },
    separatorStyle: {
        height: 1, backgroundColor: EDColors.separatorColor,
        marginVertical: 10
    },
    title: {
        color: EDColors.black,
        fontFamily: EDFonts.semibold,
        fontSize: getProportionalFontSize(16),
        marginHorizontal: 5
    },
    resName: {
        color: EDColors.black,
        fontFamily: EDFonts.semibold,
        fontSize: getProportionalFontSize(18),
        textAlign: 'center'
    },
    normalText: {
        color: EDColors.black,
        fontFamily: EDFonts.semibold,
        fontSize: getProportionalFontSize(15),
    },
    submitBtn: {
        marginTop: 0,
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
        marginHorizontal: 5,
        marginBottom: 10,
        paddingVertical: 5,
        paddingHorizontal: 15,
        alignItems: 'center',
        borderRadius: 6,
        backgroundColor: EDColors.white,
        flex: 1 / 2
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
    radioGroupStyle: { marginVertical: 5 },
    radioButtonStyle: { alignItems: "center", },
    radioText: {
        textAlignVertical: "center",
        marginHorizontal: 5,
        color: EDColors.text,
        fontSize: getProportionalFontSize(14),
        fontFamily: EDFonts.medium
    },

})