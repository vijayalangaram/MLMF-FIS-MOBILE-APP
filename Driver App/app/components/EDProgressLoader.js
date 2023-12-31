import React from "react";
import { Dimensions, StyleSheet, View , ActivityIndicator } from "react-native";
import { EDColors } from "../utils/EDColors";

export default class EDProgressLoader extends React.Component {
  render() {
    return (
      <View style={styles.container} >
        <ActivityIndicator style={[styles.spinner,this.props.spinnerStyle]} color={EDColors.primary} size={'large'} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: Dimensions.get("window").width,
    height: Dimensions.get("screen").height ,
    zIndex: 997,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: EDColors.transparentBlack
  },
  spinner: {
    flex: 1,
    alignSelf: "center",
    zIndex: 1000
  }
});
