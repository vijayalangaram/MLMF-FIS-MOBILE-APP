import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { Notifier, NotifierComponents } from "react-native-notifier";
import { showCustomAlert } from "../components/EDCustomAlert";
import { showUpdateAlert } from '../components/EDUpdateAlert';
import { strings } from "../locales/i18n";
import { EDColors } from "./EDColors";
import { APP_NAME } from './EDConstants';

export function showDialogue(message, title = strings("appName"), arrayButtons = [], okButtonHandler = () => {

}, okayButtonTitle, iconName, isNotPreferred) {
  var arrayButtonsToShow = arrayButtons.concat([{ "text": okayButtonTitle || strings("okay"), onPress: okButtonHandler, isNotPreferred: isNotPreferred || false }])
  showCustomAlert(
    title,
    message,
    arrayButtonsToShow,
    iconName)
}

export function showUpdateDialogue(message, title = strings("appName"), arrayButtons = [], okButtonHandler = () => {

}, okayButtonTitle, iconName, isNotPreferred) {
  var arrayButtonsToShow = arrayButtons.concat([{ "text": okayButtonTitle || strings("okay"), onPress: okButtonHandler, isNotPreferred: isNotPreferred || false }])
  showUpdateAlert(
    title,
    message,
    arrayButtonsToShow,
    iconName)
}


export function showNoInternetAlert() {

  showTopDialogue(strings("noInternet"), true)
}


export function showNotImplementedAlert() {
  let arrayButtonsToShow = [{ "text": strings("okay") }]
  showCustomAlert(
    strings("appName"),
    strings("notImplementedMessage"),
    arrayButtonsToShow)
}



export function showMailDialogue(message, arrayButtons, title = strings("appName"), okButtonHandler = () => {

}) {
  var arrayButtonsToShow = arrayButtons.concat([{ "text": strings("cancel"), key: (arrayButtons || []).length + 1 }])
  arrayButtonsToShow = (arrayButtons || []).concat([
    { text: strings("mailUs"), onPress: okButtonHandler }
  ]);
  showCustomAlert(
    strings("appName"),
    // "MLMF Driver",
    message,
    arrayButtonsToShow)
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
          <Text style={styles.title}>{APP_NAME}</Text>
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