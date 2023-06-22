/* eslint-disable react/no-string-refs */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import EDRTLView from '../components/EDRTLView';
import { strings } from '../locales/i18n';
import { EDColors } from '../utils/EDColors';
import { getProportionalFontSize, isRTLCheck } from "../utils/EDConstants";
import { EDFonts } from '../utils/EDFontConstants';
import Validations from '../utils/Validations';
import EDButton from './EDButton';

export default class EDLanguageSelect extends React.Component {
    //#region LIFE CYCLE METHODS
    constructor(props) {
        super(props)
        this.validationsHelper = new Validations();
        this.language = this.props.languages
    }

    state = {
        isLoading: false,
        selectedIndex :  this.props.languages !== undefined &&
        this.props.languages !== null &&
        this.props.languages.length !== 0 ?
        this.props.languages.map(data => data.language_slug).indexOf(this.props.lan) : -1
    }

    render() {
        return (

            // Vikrant 20-07-21

            <View style={styles.modalContainer} pointerEvents={this.state.isLoading ? 'none' : 'auto'}>
                <View style={styles.modalSubContainer}>
                    <EDRTLView style={styles.headerViewStyle}>
                        <Text style={styles.titleTextStyle}>
                            {this.props.title}
                        </Text>
                        <TouchableOpacity onPress={this.props.onDismissHandler} style={styles.touchableStyle}>
                            <Icon
                                name={"close"}
                                size={getProportionalFontSize(18)}
                                color={EDColors.text}
                            />
                        </TouchableOpacity>
                    </EDRTLView>

                    <View style={styles.separator} />

                    {
                        this.language.map((items,index)=>(
                            <View style={[styles.marginViewStyle ,this.state.selectedIndex == index ? {borderRadius:16 , backgroundColor :EDColors.radioSelected} : {}]}>
                            <TouchableOpacity onPress={() => this.itemSelect(index)}
                                style={{alignItems: isRTLCheck() ? 'flex-end':'flex-start'}}
                            >
                                <Text style={[styles.textStyle , this.state.selectedIndex == index ? {color : EDColors.black , fontFamily : EDFonts.semibold } : {} ]}>
                                    {items.language_name}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        ))
                    }

                     <EDButton
                        style={styles.buttonStyle}
                        textStyle={styles.buttonTextStyle}
                        label={strings('profileSave')}
                        onPress={ this.onChangeLanguageClick} 
                        
                        />
                    
                </View>
            </View>
        );
    }

    /**
 * @param { Option selected for Launguage } language
 */
   
    itemSelect = (selectedIndex) => {
        this.setState({selectedIndex : selectedIndex})
    }

    onChangeLanguageClick = () => {
        // this.props.onChangeLanguageHandler(this.state.selectedIndex)
        if (this.props.languages !== undefined &&
            this.props.languages !== null &&
            this.props.languages.length !== 0) {
                this.props.onChangeLanguageHandler(this.props.languages[this.state.selectedIndex].language_slug)
        }
    }
}

//#region STYLES
const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: EDColors.transparentBlack
    },
    modalSubContainer: {
        backgroundColor: EDColors.white,
        padding: 10,
        marginHorizontal: 20,
        borderRadius: 24,
        marginTop: 20,
        marginBottom: 20,
        // paddingVertical: 20
    },
    textStyle: {
        fontSize: getProportionalFontSize(16),
        fontFamily: EDFonts.medium,
        color: EDColors.text,
        marginVertical: 5,
    },
    titleTextStyle: { fontFamily : EDFonts.semibold , fontSize: getProportionalFontSize(16), padding: 15,  },
    separator: { height: 1, backgroundColor: EDColors.radioSelected , width: "100%", marginTop: 5, marginBottom:5 },
    marginViewStyle: { marginHorizontal: 6, padding:10 , justifyContent:'center'},
    buttonStyle: {borderRadius : 16 , marginHorizontal:10, marginVertical:10},
    buttonTextStyle: {color : EDColors.white , fontSize : getProportionalFontSize(16) , fontFamily : EDFonts.medium , marginVertical:8},
    headerViewStyle: { justifyContent: 'space-between' },
    touchableStyle: { margin:5 },
})
