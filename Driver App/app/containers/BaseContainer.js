import NetInfo from '@react-native-community/netinfo';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EDProgressLoader from '../components/EDProgressLoader';
import NavBar from '../components/NavBar';
import NavigationEvents from '../components/NavigationEvents';
import { EDColors } from '../utils/EDColors';

export default class BaseContainer extends React.Component {
  //#region LIFE CYCLE METHODS

  /** CONSTRUCTOR */
  constructor(props) {
    super(props)
    this.connectivityChangeHandler = undefined
    this.isConnectedToInternet = true
  }

  render() {
    return (
      <>
        <SafeAreaView style={{ flex: 1, backgroundColor: EDColors.offWhite }}>
          <View style={{ flex: 1, backgroundColor: EDColors.offWhite }}>
            <NavBar
              title={this.props.title}
              left={this.props.left}
              onLeft={this.props.onLeft}
              right={this.props.right}
              onRight={this.props.onRight}
              iconFamily={this.props.iconFamily}
              availabilityStatus={this.props.availabilityStatus}
            />

            <NavigationEvents
              onFocus={this.onDidFocusBaseContainer}
              onBlur={this.onWillBlurBaseContainer}
              navigationProps={this.props.navigationProps}
            />

            <View style={styles.container}>{this.props.children}</View>


          </View>
        </SafeAreaView>
        {this.props.loading ? (<EDProgressLoader />) : null}
      </>
    )
  }

  onConnectivityChangeCallback = state => {
    if (
      this.props.connection !== undefined &&
      this.isConnectedToInternet !== state.isConnected
    ) {
      this.isConnectedToInternet = state.isConnected
      this.props.connection(state.isConnected)
    }
  }

  onDidFocusBaseContainer = () => {
    if (this.props.connection !== undefined) {
      this.connectivityChangeHandler = NetInfo.addEventListener(
        this.onConnectivityChangeCallback,
      )
    }
  }

  onWillBlurBaseContainer = () => {
    if (this.props.connection !== undefined) {
      if (this.connectivityChangeHandler !== undefined) {
        this.connectivityChangeHandler()
      }
    }
  }

  //#endregion
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  children: {},
})
