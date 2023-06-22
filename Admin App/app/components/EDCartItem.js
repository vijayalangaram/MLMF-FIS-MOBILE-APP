import React from 'react';
import { TextInput } from 'react-native';
import { View, StyleSheet } from 'react-native';
import { Icon } from 'react-native-elements/dist/icons/Icon';
import { EDColors } from '../utils/EDColors';
import { getProportionalFontSize } from '../utils/EDConstants';
import { EDFonts } from '../utils/EDFontConstants';
import EDImage from './EDImage';
import EDRTLText from './EDRTLText';
import EDRTLView from './EDRTLView';

export default class EDCartItem extends React.Component {

    itemToIterate = this.props.item
    maxQuantity = this.props.item.quantity || 0

    state = {
        quantity: this.props.item.quantity || 0,

    }

    increaseQty = () => {
        if (this.state.quantity < this.maxQuantity) {
            this.setState({ quantity: this.state.quantity + 1 })
            this.props.updateQty(this.state.quantity + 1, this.props.index)
        }
    }

    decreaseQty = () => {
        if (this.state.quantity > 1) {
            this.setState({ quantity: this.state.quantity - 1 })
            this.props.updateQty(this.state.quantity - 1, this.props.index)
        }
        else
            this.onDeletePress()
    }

    onDeletePress = () => {
        if (this.props.onDeletePress)
            this.props.onDeletePress(this.props.index)
    }

    onChangeText = (value) => {
        let newValue = value.replace(/\D/g, '')
        this.setState({ quantity: newValue })
    }


    render() {
        return (
            <EDRTLView style={{ flex: 1, alignItems: 'center', justifyContent: "space-between", marginVertical: 5 }}>
                <EDRTLView style={{ flex: 1, alignItems: 'center' }}>
                    <EDImage source={this.itemToIterate.image} style={styles.imageRecipeStyle} />

                    <EDRTLText title={this.itemToIterate.name} style={{
                        flex: 1,
                        marginHorizontal: 10,
                        color: EDColors.black, fontFamily: EDFonts.semibold, fontSize: getProportionalFontSize(14)
                    }} />
                </EDRTLView>
                <EDRTLView style={{ alignItems: 'center' }}>
                    <Icon
                        onPress={this.decreaseQty}
                        name={"remove-circle"} type={"ion-icon"} color={EDColors.primary} size={getProportionalFontSize(20)} />
                    <TextInput
                        style={styles.qtyInput}
                        maxLength={3}
                        keyboardType="numeric"
                        textAlign={'center'}
                        value={this.state.quantity.toString()} onChangeText={this.onChangeText}
                        editable={false}
                    />
                    <Icon
                        onPress={this.increaseQty}

                        name={"add-circle"}
                        type={"ion-icon"} color={
                            this.state.quantity == this.maxQuantity ?
                                EDColors.buttonUnreserve :
                                EDColors.primary} size={getProportionalFontSize(20)} />
                    {this.props.hideDeleteIcon ? null :
                        <Icon
                            onPress={this.onDeletePress}

                            name={"delete"}
                            type={"ant-design"} color={EDColors.primary} containerStyle={{ marginLeft: 15 }} size={getProportionalFontSize(17)} />
                    }

                </EDRTLView>
            </EDRTLView>
        )
    }
}


const styles = StyleSheet.create({
    imageRecipeStyle: { marginHorizontal: 5, borderRadius: 8, height: getProportionalFontSize(35), width: getProportionalFontSize(35) },
    qtyInput: {
        // borderRadius: 6, borderWidth: 1,
        // borderColor: EDColors.separatorColor,
        // height: getProportionalFontSize(25),
        color: EDColors.black,
        fontFamily: EDFonts.semibold,
        paddingVertical: 0,
        marginHorizontal: 5,
        paddingHorizontal: 0
    }
})
