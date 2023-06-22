import React from 'react';
import {  TouchableOpacity, StyleSheet } from 'react-native'
import { Icon } from 'react-native-elements';
import { EDColors } from '../utils/EDColors';
import { getProportionalFontSize } from '../utils/EDConstants';
import { EDFonts } from '../utils/EDFontConstants';
import EDRTLText from './EDRTLText';
import EDRTLView from './EDRTLView';


export default class EDCheckButton extends React.Component {

    state = {
        value: this.props.isChecked || false
    }

    toggleCheck = () => {
        this.setState({ value: !this.state.value })
        if (this.props.onPress)
            this.props.onPress(this.state.value)
    }

    render() {
        return (
        
            <TouchableOpacity
            onPress={this.toggleCheck}
            style={styles.fullFlex}
        >
            <EDRTLView style={{
                alignItems: "center",
            }}>
                <Icon name={this.state.value ? "check-square-o" : "square-o"}  type={'font-awesome'} containerStyle={{ marginTop: 5 }} color={EDColors.text} size={20} />
                <EDRTLText
                    style={styles.labelStyle}
                    textStyle={{fontFamily: EDFonts.semiBold , fontSize : getProportionalFontSize(14) , color : EDColors.text }}
                    title={this.props.label} />
            </EDRTLView>
        </TouchableOpacity>
        )
    }
}

const styles = StyleSheet.create({
    fullFlex: {
        flex: 1,
    },
    labelStyle: { marginHorizontal: 5, marginTop: 2.5 },

})