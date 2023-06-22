/* eslint-disable comma-dangle */
/* eslint-disable semi */
/* eslint-disable prettier/prettier */
import React from 'react';
import {View, StyleSheet} from 'react-native';
import NavBar from '../components/NavBar';
import EDPorgressLoader from '../components/EDProgressLoader';
import {SafeAreaView} from 'react-native-safe-area-context';
import NavigationEvents from '../components/NavigationEvents';
import NetInfo from '@react-native-community/netinfo';

export default class BaseContainer extends React.Component {
  //#region LIFE CYCLE METHODS

  /** CONSTRUCTOR */
  constructor (props) {
    super(props)
    this.connectivityChangeHandler = undefined
    this.isConnectedToInternet = true
  }

  render () {
    return (
      <View style = {styles.container} >
      {this.props.loading ? (<EDPorgressLoader />) : null}
      <SafeAreaView style={styles.mainView}>
        <View style={styles.mainView}>
          <NavBar
            title={this.props.title}
            left={this.props.left}
            onLeft={this.props.onLeft}
            right={this.props.right}
            onRight={this.props.onRight}
            rightIconFamily={this.props.rightIconFamily}
            rightIconSize={this.props.rightIconSize}
          />

          <NavigationEvents
            onFocus={this.onDidFocusBaseContainer}
            onBlur={this.onWillBlurBaseContainer}
            navigationProps={this.props.navigationProps}
          />

          <View style={styles.container}>{this.props.children}</View>

        </View>
      </SafeAreaView>
      </View>
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
  mainView: {flex: 1}
})
