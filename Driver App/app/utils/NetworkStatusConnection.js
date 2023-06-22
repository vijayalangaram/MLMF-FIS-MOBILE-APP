import NetInfo from "@react-native-community/netinfo";

export const netStatus = (callback) => {
  NetInfo.fetch().then(state => {
    callback(state.isConnected);
  })

};
export const netStatusEvent = callback => {
  const unsubscribe = NetInfo.addEventListener(status => {
    if (status.isConnected) {
      callback(status);
    } else {
      unsubscribe;
    }
  });
};

export const removeNetStatusEvents = callback => {

  NetInfo.removeEventListener('removeEventListener', status => {
    callback(status)
  })
}
