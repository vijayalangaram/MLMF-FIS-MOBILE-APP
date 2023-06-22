import NetInfo from "@react-native-community/netinfo";

export const netStatus = (callback) => {
  NetInfo.fetch().then(state => {
    callback(state.isConnected);
  })

};
