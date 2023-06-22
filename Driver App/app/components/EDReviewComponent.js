import React from 'react';
import {StyleSheet, TextInput, View} from 'react-native';
import {Icon} from 'react-native-elements';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {SafeAreaView} from 'react-native-safe-area-context';
import StarRating from 'react-native-star-rating';
import {strings} from '../locales/i18n';
import {EDColors} from '../utils/EDColors';
import {getProportionalFontSize, isRTLCheck} from '../utils/EDConstants';
import {EDFonts} from '../utils/EDFontConstants';
import Metrics from '../utils/metrics';
import EDButton from './EDButton';
import EDImage from './EDImage';
import EDRTLText from './EDRTLText';
import EDRTLView from './EDRTLView';

const metricsValue = getProportionalFontSize(98);
export default class EDReviewComponent extends React.Component {
  state = {
    isVisible: this.props.isVisible,
    reviewText: '',
    starCount: 0,
  };

  onStarRatingPress = rating => {
    this.setState({
      starCount: rating,
    });
  };

  dismissReviewHandler = () => {
    if (this.state.starCount !== 0 && this.state.reviewText !== '') {
      this.props.dismissReviewHandler(
        this.state.starCount,
        this.state.reviewText,
      );
    }
  };
  render() {
    return (
      <SafeAreaView style={{flex: 1}}>
        <View style={{flex: 1}}>
          <KeyboardAwareScrollView
            behavior="padding"
            enabled
            contentContainerStyle={{flex: 1}}
            style={{flex: 1}}>
            <View style={{flex: 1}}></View>
            <View style={styles.mainView}>
              <EDRTLView style={{justifyContent: 'space-between'}}>
                <Icon
                  name="close"
                  size={25}
                  color={EDColors.transparent}
                  containerStyle={{padding: 10}}
                />

                <View style={{alignItems: 'center'}}>
                  <EDImage
                    style={styles.userImage}
                    source={this.props.item.user_image}
                  />
                  <EDRTLText
                    style={styles.userName}
                    title={this.props.item.name}
                  />

                  <StarRating
                    containerStyle={styles.starContainer}
                    starStyle={{}}
                    starSize={25}
                    disabled={false}
                    emptyStar={'star'}
                    fullStar={'star'}
                    halfStar={'star-half'}
                    iconSet={'MaterialIcons'}
                    maxStars={5}
                    rating={this.state.starCount}
                    selectedStar={this.onStarRatingPress}
                    fullStarColor={EDColors.primary}
                  />

                  <EDRTLText
                    style={styles.rateCustomer}
                    title={strings('rateCustomer')}
                  />
                  <EDRTLText
                    style={styles.feedback}
                    title={strings('orderFeedback')}
                  />
                </View>
                <Icon
                  name="close"
                  size={25}
                  color={EDColors.primary}
                  containerStyle={{padding: 10}}
                  onPress={this.props.closeReviewHandler}
                />
              </EDRTLView>
              <TextInput
                defaultValue={this.state.reviewText}
                style={[
                  styles.textInput,
                  {textAlign: isRTLCheck() ? 'right' : 'left'},
                ]}
                multiline={true}
                numberOfLines={3}
                maxLength={500}
                onChangeText={text => {
                  this.setState({
                    reviewText: text,
                  });
                }}
                placeholder={strings('writeReview')}
              />
              <EDButton
                label={strings('submitReview')}
                activeOpacity={
                  this.state.reviewText !== '' && this.state.starCount !== 0
                    ? 0.1
                    : 1.0
                }
                style={[
                  styles.submit,
                  {
                    backgroundColor:
                      this.state.reviewText !== '' && this.state.starCount !== 0
                        ? EDColors.primary
                        : EDColors.buttonUnreserve,
                  },
                ]}
                textStyle={{fontSize: getProportionalFontSize(14)}}
                onPress={this.dismissReviewHandler}
              />
            </View>
          </KeyboardAwareScrollView>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  mainView: {
    backgroundColor: EDColors.white,
    paddingBottom: 20,
  },
  userImage: {
    width: metricsValue,
    height: metricsValue,
    marginTop: -metricsValue / 2,
  },
  userName: {
    color: EDColors.black,
    fontFamily: EDFonts.bold,
    fontSize: getProportionalFontSize(15),
    marginTop: 15,
  },
  starContainer: {alignSelf: 'center', marginVertical: 5},
  rateCustomer: {
    color: EDColors.black,
    fontFamily: EDFonts.bold,
    fontSize: getProportionalFontSize(15),
    marginBottom: 10,
  },
  feedback: {
    marginBottom: 8,
    color: EDColors.textNew,
    fontFamily: EDFonts.medium,
    fontSize: getProportionalFontSize(12),
    textAlign: 'center',
  },
  textInput: {
    height: 80,
    borderRadius: 5,
    marginHorizontal: Metrics.screenWidth * 0.07,
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
  },
  submit: {alignSelf: 'center', width: Metrics.screenWidth * 0.85},
});
