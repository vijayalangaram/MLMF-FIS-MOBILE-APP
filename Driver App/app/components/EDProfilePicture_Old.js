/* eslint-disable jsx-quotes */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, { Component } from 'react';
import { Image, Linking, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import { PERMISSIONS, RESULTS } from 'react-native-permissions';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Assets from '../assets';
import { strings } from '../locales/i18n';
import { showDialogue, showTopDialogue } from '../utils/EDAlert';
import { EDColors } from '../utils/EDColors';
import { debugLog, getProportionalFontSize, isRTLCheck } from '../utils/EDConstants';
import { EDFonts } from '../utils/EDFontConstants';
import Metrics from '../utils/metrics';
import { checkPermission } from '../utils/PermissionManager';
import EDPopupView from './EDPopupView';
import EDRTLText from './EDRTLText';
import EDRTLView from './EDRTLView';
import EDUnderlineButton from './EDUnderlineButton';


export default class EDProfilePicture extends Component {

    //#region LIFE CYCLE METHODS
    constructor(props) {
        super(props);
        this.options = {
            quality: 1.0,
            maxWidth: 500,
            maxHeight: 500,
            mediaType: "photo",
            storageOptions: {
                skipBackup: true,
                path: 'images',
                cameraRoll: true,
                waitUntilSaved: true,
                privateDirectory: true,

            },
        };


    }

    launchCamera = () => {
        this.dismissImagePicker()
        setTimeout(() => {
            var paramPermission = Platform.OS == "ios" ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;
            checkPermission(paramPermission, () => {
                launchCamera(this.options, this.onImageSelectionHandler)
            }, (failure) => {
                if (failure == RESULTS.BLOCKED)
                    showDialogue(
                        strings('cameraError'),
                        "",
                        [{ text: strings("cancel"), isNotPreferred: true }],
                        () => {
                            if (Platform.OS == "ios")
                                Linking.openURL('app-settings:');
                            else
                                Linking.openSettings()
                        },
                    );
            })
        }, 500);
    }

    launchGalleryPicker = () => {
        this.dismissImagePicker()
        setTimeout(() => {
            var paramPermission = Platform.OS == "ios" ? PERMISSIONS.IOS.PHOTO_LIBRARY : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
            checkPermission(paramPermission,
                () => {
                    launchImageLibrary(this.options, this.onImageSelectionHandler);
                },
                (failure) => {
                    if (failure == RESULTS.BLOCKED)

                        showDialogue(
                            strings('fileError'),
                            "",
                            [{ text: strings("cancel"), isNotPreferred: true }],
                            () => {
                                if (Platform.OS == "ios")
                                    Linking.openURL('app-settings:');
                                else
                                    Linking.openSettings()
                            },
                        );
                })
        }, 500);
    }

    dismissImagePicker = () => {
        this.setState({ showImagePicker: false })
    }

    renderPickerModal = () => {
        return (
            <EDPopupView
                isModalVisible={this.state.showImagePicker}
                onRequestClose={this.dismissImagePicker}
            >
                <View style={styles.pickerPopUp}>
                    <EDRTLText title={strings('selectProfilePic')} style={styles.pickerTitle} />
                    <TouchableOpacity onPress={this.launchCamera}>
                        <EDRTLView style={styles.optionContainer}>
                            <Icon name="camera" color={EDColors.primary} size={20} />
                            <EDRTLText title={strings('capturePhotoTitle')} style={styles.optionTitle} />
                        </EDRTLView>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.launchGalleryPicker}>
                        <EDRTLView style={styles.optionContainer} >
                            <Icon name="image" color={EDColors.primary} size={20} />
                            <EDRTLText title={strings('choosePhotoTitle')} style={styles.optionTitle} />
                        </EDRTLView>
                    </TouchableOpacity>
                    <EDUnderlineButton
                        label={
                            strings('cancel')
                        }
                        textStyle={styles.cancel}
                        buttonStyle={{ alignSelf: isRTLCheck() ? "flex-start" : 'flex-end' }}
                        onPress={this.dismissImagePicker}
                    />
                </View>
            </EDPopupView>
        )
    }

    /** RENDER METHOD */
    render() {
        return (
            //  PARENT CONTAINER
            <View>

                {this.renderPickerModal()}
                <TouchableOpacity style={styles.touchableImageContainer} onPress={this.buttonChangeProfilePicturePressed}>

                    {/* PROFILE IMAGE  */}
                    <Image source={this.state.avatarSource
                        ? { uri: this.state.avatarSource.uri }
                        : this.props.imagePath
                            ? { uri: this.props.imagePath }
                            : this.props.placeholder || Assets.user_placeholder}
                        style={this.props.placeholder ? styles.prescriptionImage : styles.profileImage}
                    />
                    {/* </View> */}
                    {/* CAMERA ICON */}
                    <View style={styles.cameraIconContainer}>
                        <MaterialIcon
                            size={15}
                            color={EDColors.text}
                            name={'camera-alt'} />
                    </View>

                </TouchableOpacity>
            </View>
        );
    }

    state = {
        avatarSource: undefined,
        showImagePicker: false
    }
    //#endregion

    //#region
    /** BUTTON EVENTS */
    buttonChangeProfilePicturePressed = () => {
        this.setState({ showImagePicker: true })
    }
    //#endregion

    //#region HELPER FUNCTIONS
    /**
     *
     * @param {The image response received from image picker} response
     */
    onImageSelectionHandler = (response) => {
        if (response.didCancel) {
        } else if (response.errorMessage) {
            showTopDialogue(response.errorMessage + '', true);
        } else {
            this.resizeImage(response.assets[0].uri)
        }
    }

    resizeImage = (image) => {
        ImageResizer.createResizedImage(image, 500, 500, "JPEG", 50, 0, null, false).then(
            success => {
                this.setState({ avatarSource: success });
                if (this.props.onImageSelectionHandler !== undefined) {
                    this.props.onImageSelectionHandler(success);
                }
            }
        ).catch(
            err => showTopDialogue(err + '', true)
        )
    }
}

//#region STYLES
const styles = StyleSheet.create({
    touchableImageContainer: {
        alignSelf: 'center', marginVertical: 20,
    },
    profileImage: {
        borderWidth: 6,
        borderColor: '#E0E0E0',
        width: Metrics.screenWidth * 0.25,
        height: Metrics.screenWidth * 0.25,
        borderRadius: Metrics.screenWidth * 0.25 / 2,
    },
    prescriptionImage: {
        borderWidth: 2,
        borderColor: EDColors.secondary,
        width: Metrics.screenWidth * 0.25,
        height: Metrics.screenWidth * 0.25,
        borderRadius: Metrics.screenWidth * 0.25 / 2,
    },
    cameraIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 30,
        height: 30,
        backgroundColor: '#E0E0E0',
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pickerPopUp: {
        margin: 20,
        padding: 10,
        backgroundColor: EDColors.white
    },
    pickerTitle: {
        fontFamily: EDFonts.semiBold,
        fontSize: getProportionalFontSize(20),
        color: EDColors.black,
        marginBottom: 10
    },
    optionTitle: {
        fontFamily: EDFonts.medium,
        fontSize: getProportionalFontSize(16),
        color: EDColors.black,
        marginHorizontal: 5
    },
    optionContainer: {
        alignItems: 'center',
        paddingVertical: 10
    },
    cancel: {
        fontFamily: EDFonts.semiBold,
        fontSize: getProportionalFontSize(18),
        color: EDColors.black,
        alignSelf: "flex-end"
    },
});
//#endregion
