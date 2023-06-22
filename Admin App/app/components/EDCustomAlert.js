import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Icon } from 'react-native-elements'
import { connect } from 'react-redux';
import { globalStore } from '../../App';
import EDRTLView from '../components/EDRTLView';
import { strings } from '../locales/i18n';
import { saveAlertData } from '../redux/actions/UserActions';
import { EDColors } from '../utils/EDColors';
import { getProportionalFontSize } from '../utils/EDConstants';
import { EDFonts } from '../utils/EDFontConstants';
import Metrics from '../utils/metrics';
import EDButton from './EDButton';
import EDPopupView from './EDPopupView';
export const showCustomAlert = (title = "", message = "", arrayButtonsToShow) => {
    globalStore.dispatch(
        saveAlertData({
            title: title,
            message: message,
            arrayButtonsToShow: arrayButtonsToShow
        })
    )

}

class EDCustomAlert extends React.Component {
    constructor(props) {
        super(props)
    }



    hidePopUp = () => {
        this.props.saveAlertData({})
    }



    render() {
        return (
            <EDPopupView
                animationType={"none"}
                isModalVisible={this.props.shouldShowAlert}
            >

                <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>

                    <View style={{ width: Metrics.screenWidth * 0.90, borderRadius: 24, backgroundColor: EDColors.white, marginBottom: 30, padding: 10 }}>

                        <EDRTLView style={{ width: '100%', padding: 10 }}>
                            {/* <Icon
                                name={'info'}
                                size={getProportionalFontSize(15)}
                                color={EDColors.text}
                                type={'ant-design'}
                                style={{ borderWidth: 1, borderColor: EDColors.text, borderRadius: 5, padding: 2 }}
                            /> */}

                        </EDRTLView>

                        <EDRTLView style={styles.titleViewStyle}>
                            <Text style={styles.titleTextStyle}>
                                {this.props.alertData.title !== undefined &&
                                    this.props.alertData.title.trim().length !== 0 ?
                                    this.props.alertData.title : strings("loginAppName")
                                }</Text>
                        </EDRTLView>
                        {/* MIDDLE TEXT VIEW */}
                        <EDRTLView >
                            <Text style={styles.middleTextStyle}>{this.props.alertData.message}</Text>
                        </EDRTLView>

                      
                        <EDRTLView style={{ alignItems: 'center', marginBottom: 10, marginTop: 5, }}>
                            {this.props.alertData.arrayButtonsToShow !== undefined ?

                                this.props.alertData.arrayButtonsToShow.map(
                                    data => {
                                        return <EDButton
                                            style={[styles.btnStyle, { backgroundColor: data.isNotPreferred !== undefined && data.isNotPreferred !== null ? EDColors.offWhite : EDColors.primary }]}
                                            textStyle={[styles.OkTextStyle, { color: data.isNotPreferred !== undefined && data.isNotPreferred !== null ? EDColors.black : EDColors.white }]}
                                            label={data.text}
                                            onPress={() => {
                                               
                                                this.hidePopUp();
                                                if (data.onPress !== undefined)
                                                    data.onPress();
                                            }}

                                        />
                                    }
                                ) : null}
                        </EDRTLView>
                    </View>
                </View>

            </EDPopupView>
        )
    }
}


const styles = StyleSheet.create({
    //Main top view
    mainViewStyle: {
        justifyContent: 'center',
        flexDirection: 'column',
        margin: 15,
        borderRadius: 24,
        height: Metrics.screenHeight * 0.7
    },
    titleViewStyle: {
        padding: 10,
        backgroundColor: EDColors.white,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
    },
    titleTextStyle: {
        color: EDColors.black,
        fontFamily: EDFonts.semibold,
        textAlign: 'left',
        fontSize: getProportionalFontSize(16),
    },
    middleTextView: {
        backgroundColor: EDColors.white,
    },
    middleTextStyle: {
        color: EDColors.text,
        fontFamily: EDFonts.medium,
        textAlign: 'left',
        fontSize: getProportionalFontSize(14),
        paddingHorizontal: 10,
    },
    bottomButtonView: {
        backgroundColor: EDColors.white,
        paddingBottom: 15,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        alignItems: 'flex-end'
    },
    btnStyle: { flex: 1, borderRadius: 16, marginHorizontal: 5, marginTop: 15 },
    textStyle: {
        marginHorizontal: 10
    },
    OkTextStyle: { color: EDColors.white, fontSize: getProportionalFontSize(16), fontFamily: EDFonts.medium, marginVertical: 8 }
})


export default connect(
    state => {
        return {
            shouldShowAlert:
                state.userOperations !== undefined ?
                    state.userOperations.alertData !== undefined &&
                    state.userOperations.alertData.message !== undefined
                    : false,
            alertData: state.userOperations.alertData || {},
            lan: state.userOperations.lan
        };
    },
    dispatch => {
        return {
            saveAlertData: dataToSave => {
                dispatch(saveAlertData(dataToSave));
            }
        };
    },
)(EDCustomAlert);


