import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { Notifier, NotifierComponents } from "react-native-notifier";
import { showCustomAlert } from "../components/EDCustomAlert";
import { EDColors } from "./EDColors";
import { strings } from "../locales/i18n";

export function showDialogue(message, title = strings("loginAppName"), arrayButtons = [], okButtonHandler = () => {

}, okayButtonTitle, isNotPreferred = undefined) {
  var arrayButtonsToShow = arrayButtons.concat([{ "text": okayButtonTitle || strings("dialogOkay"), onPress: okButtonHandler, isNotPreferred : isNotPreferred,}])
  showCustomAlert(
    title,
    message,
    arrayButtonsToShow
    )
}


export function showNoInternetAlert() {
  // let arrayButtonsToShow = [{ "text": strings("dialogOkay") }]
  // showCustomAlert(
  //   strings("loginAppName"),
  //   strings("generalNoInternet"),
  //   arrayButtonsToShow)
  showTopDialogue(strings("generalNoInternet"), true)
}

export function showTopDialogue(message, forError = false, autohide = true, onPress = () => {

}) {

  Notifier.showNotification({
    title: "",
    description: message,
    showAnimationDuration: 800,
    duration: autohide ? 3000 : 0,
    onPress: onPress,
    swipeEnabled: false,
    Component: NotifierComponents.Alert,
    hideOnPress: true,
    Component: () =>
      <SafeAreaView style={{ backgroundColor: forError ? EDColors.error : "green" }}>
        <View style={styles.container}>
          <Text style={styles.title}>{strings("loginAppName")}</Text>
          <Text style={styles.description}>{message}</Text>
        </View>
      </SafeAreaView>,
    componentProps: {
      titleStyle: {
        color: EDColors.white,
      },
      alertType: forError ? "error" : "success"
    },
  });
}

const CustomComponent = ({ title, description }) => (
  <SafeAreaView style={styles.safeArea}>
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({

  container: {
    padding: 20,
    alignItems: "center"
  },
  title: { color: 'white', fontWeight: 'bold' },
  description: { color: 'white' },
});