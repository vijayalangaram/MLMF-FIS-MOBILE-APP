import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {heightPercentageToDP} from 'react-native-responsive-screen';
import {connect} from 'react-redux';
import {eatanceGlobalStore} from '../../App';
import EDRTLView from '../components/EDRTLView';
import {saveAlertData} from '../redux/actions/User';
import {EDColors} from '../utils/EDColors';
import {APP_NAME, getProportionalFontSize} from '../utils/EDConstants';
import {EDFonts} from '../utils/EDFontConstants';
import EDButton from './EDButton';
import EDPopupView from './EDPopupView';

export const showCustomAlert = (
  title = '',
  message = '',
  arrayButtonsToShow,
  iconName,
) => {
  eatanceGlobalStore.dispatch(
    saveAlertData({
      title: title,
      message: message,
      arrayButtonsToShow: arrayButtonsToShow,
      iconName,
    }),
  );
};

class EDCustomAlert extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      buttonHeight: null,
    };
  }

  hidePopUp = () => {
    this.props.saveAlertData({});
  };

  onLayout = (e) => {
    if (e.nativeEvent.layout.height > this.state.buttonHeight) {
      this.setState({buttonHeight: e.nativeEvent.layout.height});
    }
  };

  render() {
    return (
      <EDPopupView
        animationType={'none'}
        isModalVisible={this.props.shouldShowAlert}>
        <View style={{flex: 1, justifyContent: 'flex-end', marginBottom: 50}}>
          <EDRTLView style={styles.mainViewStyle}>
            {/* TITLE OF HEADER */}
            <EDRTLView style={styles.titleViewStyle}>
              {/* CHANGED CODE  */}
              <Text style={styles.titleTextStyle}>
                {this.props.alertData.title !== undefined &&
                this.props.alertData.title.trim().length !== 0
                  ? this.props.alertData.title
                  : APP_NAME}
              </Text>
            </EDRTLView>
            {/* MIDDLE TEXT VIEW */}
            <EDRTLView style={styles.middleTextView}>
              <Text style={styles.middleTextStyle}>
                {this.props.alertData.message}
              </Text>
            </EDRTLView>

            {/* BOTTOM BUTTON VIEW */}

            <EDRTLView style={styles.bottomButtonView}>
              {this.props.alertData.arrayButtonsToShow !== undefined
                ? this.props.alertData.arrayButtonsToShow.map((data, index) => {
                    return (
                      <EDButton
                        style={[
                          {
                            padding: 5,
                            flex: 1,
                            borderRadius: 16,
                            marginHorizontal: 5,
                            backgroundColor:
                              data.isNotPreferred == true
                                ? EDColors.offWhite
                                : EDColors.primary,
                            height: this.state.buttonHeight,
                          },
                        ]}
                        textStyle={{
                          fontSize: getProportionalFontSize(14),
                          fontFamily: EDFonts.medium,
                          margin: 8,
                          marginHorizontal: 15,
                          color:
                            data.isNotPreferred == true
                              ? EDColors.black
                              : EDColors.white,
                        }}
                        label={data.text}
                        key={index}
                        onLayout={this.onLayout}
                        onPress={() => {
                          this.hidePopUp();
                          if (data.onPress !== undefined) data.onPress();
                        }}
                      />
                    );
                  })
                : null}
            </EDRTLView>
          </EDRTLView>
        </View>
        <View></View>
      </EDPopupView>
    );
  }
}

const styles = StyleSheet.create({
  //Main top view
  mainViewStyle: {
    justifyContent: 'flex-end',
    flexDirection: 'column',
    margin: 15,
    // flex:1,
    borderRadius: 24,
    backgroundColor: EDColors.white,
    padding: 10,
  },
  titleViewStyle: {
    padding: 10,
    backgroundColor: EDColors.white,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  titleTextStyle: {
    color: EDColors.black,
    fontFamily: EDFonts.bold,
    textAlign: 'left',
    fontSize: heightPercentageToDP('2.2%'),
  },
  middleTextView: {
    backgroundColor: EDColors.white,
  },
  middleTextStyle: {
    color: EDColors.text,
    fontFamily: EDFonts.medium,
    textAlign: 'left',
    fontSize: getProportionalFontSize(14),
    marginHorizontal: 5,
    padding: 5,
    marginBottom: 10,
  },
  bottomButtonView: {
    backgroundColor: EDColors.white,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default connect(
  (state) => {
    return {
      shouldShowAlert:
        state.userOperations !== undefined
          ? state.userOperations.alertData !== undefined &&
            state.userOperations.alertData.message !== undefined
          : false,
      alertData: state.userOperations.alertData || {},
    };
  },
  (dispatch) => {
    return {
      saveAlertData: (dataToSave) => {
        dispatch(saveAlertData(dataToSave));
      },
    };
  },
)(EDCustomAlert);
