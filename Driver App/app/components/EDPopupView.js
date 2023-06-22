import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';

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
                animationType={this.props.animationType || "slide"}
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
        backgroundColor: 'rgba(0,0,0,0.40)',
    },
});
