import React, { Component } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { EDColors } from '../utils/EDColors';
import { getProportionalFontSize } from '../utils/EDConstants';
import { EDFonts } from '../utils/EDFontConstants';
import EDRTLView from '../components/EDRTLView';
import EDRTLText from '../components/EDRTLText';
import { Icon } from 'react-native-elements';

export default class EDTextIcon extends Component {
    constructor(props) {
        super(props)

    }

    render() {
        return (
            <EDRTLView style={[style.iconView, this.props.style]}>

                {/* ICON VIEW */}
                <Icon
                    style={this.props.iconStyle}
                    size={this.props.size !== undefined ? getProportionalFontSize(this.props.size) : getProportionalFontSize(20)}
                    name={this.props.icon}
                    type={this.props.type || 'material'}
                    color={this.props.is_delayed ? EDColors.textNew : EDColors.primary}
                />

                {/* IF BUTTON TEXT */}
                {this.props.isTouchable ? (
                    <TouchableOpacity onPress={this.props.onPress}>
                        <EDRTLText style={[style.textView, this.props.textStyle,]}
                            title={this.props.text} numberOfLines={this.props.numberOfLines}></EDRTLText>
                    </TouchableOpacity>
                ) : <EDRTLText style={[style.textView, this.props.textStyle]}
                    title={this.props.text} numberOfLines={this.props.numberOfLines}></EDRTLText>}

            </EDRTLView>
        )
    }
}

const style = StyleSheet.create({
    iconView: { marginVertical: 5 },
    textView: { fontSize: getProportionalFontSize(13), fontFamily: EDFonts.semibold, marginHorizontal: 5 }
})