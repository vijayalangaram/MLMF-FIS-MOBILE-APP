/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { Image, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import Assets from '../assets';
import { EDColors } from '../utils/EDColors';

export default class EDImage extends React.PureComponent {
    render() {
        return this.props.source !== undefined &&
            this.props.source !== null &&
            this.props.source.trim().length > 0 ? (
                <FastImage style={[styles.fastImageStyle, this.props.style]}
                    source={{
                        uri: this.props.source,
                        priority: FastImage.priority.normal,
                    }}
                    // fallback={true}
                    resizeMode={this.props.resizeMode || FastImage.resizeMode.cover}
                />
            ) : (
                <Image
                    style={[styles.fastImageStyle, this.props.style]}
                    resizeMode="contain"
                    source={this.props.placeholder || Assets.user_placeholder}
                />
            );
    }
}
const styles = StyleSheet.create({
    fastImageStyle: { overflow: 'hidden', backgroundColor: EDColors.white },
})
