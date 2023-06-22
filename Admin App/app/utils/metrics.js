'use strict';

import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

const Metrics = {
  screenWidth: width,
  screenHeight: height,
  actualScreenWidth: Dimensions.get('screen').width,
  actualScreenHeight: Dimensions.get('screen').height
};

export default Metrics;
