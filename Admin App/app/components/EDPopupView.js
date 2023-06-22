import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { EDColors } from '../utils/EDColors';

export default class EDPopupView extends React.Component {
    constructor(props) {
        super(props);
    }
    state = {
        shouldShowModal: this.props.isModalVisible,
    };
    UNSAFE_componentWillReceiveProps(newProps) {
        this.setState({ shouldShowModal: newProps.isModalVisible });
    }

    render() {
        return (
            <Modal
                visible={this.state.shouldShowModal}
                animationType="slide"
                transparent={true}
                onRequestClose={this.props.onRequestClose}
                style={styles.modalStyle}>
                <View style={styles.mainViewStyle}>
                    {this.props.children}
                </View>
            </Modal>
        );
    }
}

const styles = StyleSheet.create({
    //Modal Style
    modalStyle: {
        flex: 1,
    },
    //Main top view
    mainViewStyle: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: EDColors.background,
    },
});
