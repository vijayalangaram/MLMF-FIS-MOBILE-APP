import moment from "moment";
import React from "react";
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Icon } from "react-native-elements";
import StarRating from "react-native-star-rating";
import { SvgXml } from "react-native-svg";
import { NavigationEvents } from "react-navigation";
import { connect } from "react-redux";
import EDImage from '../components/EDImage';
import EDPopupView from "../components/EDPopupView";
import EDRadioDailogWithButton from "../components/EDRadioDailogWithButton";
import EDRTLText from "../components/EDRTLText";
import EDRTLView from "../components/EDRTLView";
import EDThemeButton from "../components/EDThemeButton";
import EDTipComponent from "../components/EDTipComponent";
import EDWriteReview from "../components/EDWriteReview";
import ItemComponent from '../components/ItemComponent';
import OrderItem from "../components/OrderItem";
import PriceDetail from "../components/PriceDetail";
import { strings } from "../locales/i18n";
import { saveCartCount, saveCurrencySymbol } from "../redux/actions/Checkout";
import { saveNavigationSelection } from "../redux/actions/Navigation";
import { saveOrderMode } from "../redux/actions/User";
import { clearCartData, getCartList, saveCartData, saveCurrency_Symbol } from "../utils/AsyncStorageHelper";
import { showConfirmationDialogue, showDialogue, showNoInternetAlert, showValidationAlert } from "../utils/EDAlert";
import { EDColors } from "../utils/EDColors";
import { capiString, debugLog, funGetDateStr, funGetFrench_Curr, getProportionalFontSize, isRTLCheck, RESPONSE_SUCCESS } from "../utils/EDConstants";
import { EDFonts } from "../utils/EDFontConstants";
import { cart_icon } from "../utils/EDSvgIcons";
import metrics from "../utils/metrics";
import { netStatus } from "../utils/NetworkStatusConnection";
import { driverTipAPI, getPaymentList } from "../utils/ServiceManager";
import BaseContainer from "./BaseContainer";
import RazorpayCheckout from "react-native-razorpay";

class OrderDetailContainer extends React.Component {
    constructor(props) {
        super(props);
        this.orderItem = this.props.navigation.state.params.OrderItem;
        this.tempArrayItem = []
        this.taxable_fields = []

    }

    state = {
        isLoading: false,
        isCartModalVisible: false,
        isReview: false,
        reviewStar: "",
        reviewText: "",
        driverReviewStar: "",
        driverReviewText: "",
        cartModal: false,
        cartMsg: '',
        totalWave: 0,
        totalWidth: 0,
        isShowTip: false,
        paymentOptions: []

    }

    componentDidMount = () => {

        if (this.orderItem.shouldShowTipButton == true)
            this.getPaymentOptionsAPI()
    }



    //#region REVIEW SUBMIT MODEL
    /** RENDER REVIEW DIALOGUE */
    renderReviewSubmitDialogue = () => {
        return (
            <EDPopupView isModalVisible={this.state.isReview}
                style={{ justifyContent: "flex-end" }}>
                <EDWriteReview
                    containerProps={this.props}
                    orderData={this.orderItem}
                    dismissWriteReviewDialogueHandler={this.onDismissReviewSubmitHandler}
                    onDismissReviewAndReload={this.onDismissReviewAndReload}
                />
            </EDPopupView>
        )
    }
    //#endregion

    renderPopup = () => {
        return (
            <EDPopupView isModalVisible={this.state.cartModal}>
                <View style={styles.popupView}>
                    <View style={styles.popupSubView}>
                        <SvgXml xml={cart_icon} style={styles.iconStyle} />
                        <Text style={styles.paymentText}>
                            {this.state.cartMsg}
                        </Text>
                        <EDThemeButton
                            style={styles.popupBtn}
                            textStyle={styles.reorderBtnText}
                            label={strings("dialogOkay")}
                            onPress={() => {
                                this.setState({ isLoading: false, cartModal: false })
                            }}
                        />
                    </View>
                </View>
            </EDPopupView>
        )
    }

    //#region STAR SELECTION HANDLER
    onStarSelectionHandler = (star) => {
        this.setState({
            reviewStar: star,
        })
    }
    onDriverStarSelectionHandler = (star) => {
        this.setState({
            driverReviewStar: star,
        })
    }
    //#endregion

    //#region TEXT CHNAGE HANDLER
    onReviewSubmitTextChangeHandler = (newText) => {
        this.setState({
            reviewText: newText
        })
    }
    onDriverReviewSubmitTextChangeHandler = (newText) => {
        this.setState({
            driverReviewText: newText
        })
    }
    //#endregion

    //#region SUBMIT EVENT HANDLER
    onSubmitPressedhandler = () => {
        if (this.state.reviewStar !== 0 && this.state.reviewText !== "") {
            this.addReview();
            this.setState({ isReview: false });
        }
    }
    //#endregion

    //#region CLOSE REQUEST HANDLER
    onDismissReviewSubmitHandler = () => {
        this.setState({ isReview: false });
    }

    onAddReviewPressed = () => {
        this.setState({ isReview: true })
    }

    onTipDriverPressed = () => {
        this.setState({ isShowTip: true })
    }

    onDismissDriverTip = () => {
        this.setState({ isShowTip: false })
    }

    submitTip = (tip, isCustom, percentageActualTip, payment_option, publishable_key) => {
        this.publishable_key = publishable_key
        this.onDismissDriverTip()
        setTimeout(() => {
        this.navigateToPaymentGateway(tip, isCustom, percentageActualTip, payment_option)
        }, 500);
    }

    startRazorPayment = (final_total, isCustom, tip_percent_val) => {

        this.merchant_order_id = Date.now()
        var options = {
            description: 'Paying MLMF',
            image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASMAAAEkCAYAAABkJVeVAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAACVRSURBVHgB7d0JfBTl/T/w7zOzm4QbRYGQDUqlrVJvjgTUirVazyq11h5/e1nxQDAHClqUIFYskAOo1qq1aq2tRw+Plp9alfpTIAE8qYqiAjk4RIQQybE7z/P/PLOzm03IhULrj3zevJadnZmdnd3MfOf7HDMjQkRERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERET0eaSEaA+YIgnhaSAeQ/DoLY4YiUqtxKRK5shWbFBGiD4FBiPqlJkoYcmWU8WTs7HFnIpw8wWMTvfDTmILUrIT/7+McY/i+VFVJJuEaA8wGFGHkAmdgwAzD1vKcDxewfAzeH5dtKwXFwEoipm0DJA0+SKmfRWvThebMYncjml/Rub0iWyWD9SdskuIOsBgRLtBALLFsOPxOAUBphBbyRPIjWbK9fKGUh0Xw/De3pj/B5hrJl5mSrzYZrOm/8XjHjweR9YUE6JWGIzIZ0qkB2p+foDBn+FxnB2FreN9/F+GsHJXZ0Fot+XNlAje/1e86wm8fBvDF+LZZllvIaP6kbpR3hCiFAxGJOYmGYkgcT8eh+DlXxAsHkY19UvygdSheBWVT8nPkkQWIphdYoOZmSGHYbm3Y6sbjdzobDVblglRwBHq1swv5Gi/HsigDkjkSBShfqhukCfVdfIxClmT5DPAsuoQdJ6UWX5xTdTN8h6ezsVnPY2g9HuTj2yMKMBg1I2Za1GUiskjCA7LpUbOQ/BYl5xms2YlX5LPajaKatLcsobPaMLTFHzAIOknE4QowGDUTaEI9XXphSBkZAiylMt2K44VobCm5FDTxaK8uVBcM97vg9SCLZ4hAGljmpeD11vwtBxjThSiAINRN4RAdBaenkQgWo2AsFjNkMrdZpopnp+9FHWxKPUVOUFOkmPa+bzhcpN8s+VI2YZHbyEKMBh1M2aypCMA/QqD/0J19fkopq1sa76g9ex90Wje7wqFcBTG3K0/L16JfYM8L39PjrNZkoP5VXOxkIjBqLs5CEUjI8MwdIP6iTSgMLa6g7n/iC3kGlsE62yxCEPnYK7de10rmYFl3KOWpPQtmuUHuMMx5jEhCjAYdTdGjkOA2IihREY0xFwnA9qZ+3E8POQw13W4SNtk78iX5VW/Lqh5fJGMQpA6Tm6UF5Lj7KklIguwHs+jaX+VEAUYjLobJX0RCLbYSmX/tZH/QcFtRmoFc3JW21Pa9TtBXmFmSl7qPH6F9W8kjIDjoNo6D0srV48gcKUyMhdT7089eTaoKC/HkjrPtqhbCQl1N/bUjAE2sPgtXbOkysySd1B0WoAMaZaaIx+1mFv5xav78FyKSuiJCD6NeN0XjzDyK5vlaISawQg672Hag3j1BsJMBcJSCO85FtP+nro4cxPyLI3KbA/ZEVEK9sDuZvze1hrN6iLfQObzXHL8jfI9PF2HoLIGz//2z8I3KH6JpGH+d8We0pEu65HXbEM4qkdtkycZmKs3go7G/1qGYsxwvH8Uxp6A14fjeasfxBxZgfel43k8Xl+G5b4kO+TbqhTLIQowGHUzfr+hIj/TOQMvbpRd8gc118+WEie53o3xPTH+cvy/BQHmCGQ6x2HclxFMBuDZxcPBP9v0H8PjI7ynEsHnPeRJ6+RZBKwlmDYDwShNJmBoIqYPxeJtRmWD2t143BF0fiRKYjDqhoKTYm/C4JXYAsplu5ydyFJQZLOV1v+LIHMgHt/A9DfwWIqwsxphaDNCyg5M2SV1fqfInmKLbJ70sx0kMSaC9wzA6yYMb0VwWo73HYNx38d8E2SmfLKnJ9xS98Fg1I0hEzoST0/jsR2ZzrPIbmwAOgvD/fD8C4SsuWpaPGv6FMsO+RmW45+t31fNRHGNqANsTdtPFWSdeMz0oUcd0NE8KCqtRsAYg8EnkM0c6rdwKRSyDPKeGpnzaQNRsOwYKsdrsSwPQe7fQtQJtqbthyYPPulgMQ29Gr2ed+ZHcmtc5dw1v3Jpm50bbWsanqYlXiOjuRlPQ/bilRmbEI7WtzWhSIqcnYMXH64dc7Zy1HEowWVpUWGk6zUIiv+Ipn/0h0Vr1zYKdQsMRvuhULjph2KcbyvXm+1pVae0zMmP5PRDInxHY2P647d/uKSug7fb5vi3/T5Ft0p/1BEdgczmMORM9uqPBwTnk9ntxjbp70BuvQnP72H6u/K6rNutr5FGdvWJbGj9IQVZo0+tlcU3GyU5yp58IvGruTV3ZJILwvUDkLWtvVyoW2Cd0X6mMDNnpHblYkSBv6LJa4oxZrBSzs2e0dvxero4ejQawx5zYubu+RvLX259Nw9kRuuDFjLbKdFebK0Gj7Viz1NT8iGmbcZwg9gwo/250sTeLcT4dwvpgeePMXYFGvKftddEwvIOR8X1mtSK64LImJl4MTMRhNqDeT6KZXyUxeyoe2Aw2s9cm5UTiSrzPaXUj5U2i5BtvIo/88+N0gdi954d8twtnmOmizLnYfwaMerX28KbfnfvunU2wNhghPn9s+9XojXskq5c9zqV3yO7hwxG29zhyJE8BKu3gkuG+AoiORdgYY+oLm17ZnVxVcXRvP1R98Bi2n6mSZkJyqijjGd+JCE1CbvxJWiluCZmpBF1R7d4rk5Tom/WjprleKpQK3PbgbFBlxVmDjmveONSW7djL/VhL8JfIVF5f0+b4oPTTGqCh7S+HhKWlyemiwdBox5kIOo+mBnth/Kzc76rjMxQjuQbjfzG+NedftaJ1l+nwz1OQnz5JeLBBkf0PShp/QqbQT/UEb3WL7w5tyjIkPbZukVyKrHRRbowa3V0l4xYtK28VqhbYNP+fqi0svxPYsy3EIhuQKA50zQ5X8fzVhPqWYFANGTXzvrRyJ6e0Ma5ywYi+x5kLMfUxgZ9W/YxBKKPuzBbkxbvUgai7oXBaD9VUl3xTl1V7FQMVjnp3mNK6WWeljONUef27NNjmVa6Fn/9lpfwUPoY2UcmDx+eXpCV+2NEo4Edz2kaxTGXllWtXCzUrbCY1g3kZeYe4brmd2hGX6PrY9NVj9AYx5jfoqjW4jpGqPR+ItZoLl2wpXyz7CXjZXzo2Kz683HUuwlb2xEINp+gLuhD//SR3a1FwLxyQU35M0LdDq8p0w0sr6vaelTt4PvS+6rDnJBzG0Z9iNBjm+0PbjXrlx1XLhnbJ9Lr+L5Zr6/YWf2pz6ofP3586FtNg8/J7Be9F0XAfCPmIOWoJ9wmb4IOhRbgKNgLs2WjuGij4DvGmF+6sYZLSze9/LZQt8TMqJspzBx7uHb1rajg/oZRJh3BQIujXkMb2CIEjSsRNEYHs25FxffC+rrwr36948Wu1PP4bK/q2qynzjKiZ2F59hbZdiNbo5VMQ11W68vMqokjR4buXLXqU98okvYfDEbd1LQDRvaLZaRlYhOo77Px9EoEEV2EOsSdkdzvIZDchPFf8GeMd3JcEK2X2zqpUFYFWTnj7a0aEeTGBv2Idmhj5inllpRWLeO1i6hDDEa0mytHjOidUdt7khG5RjXXK9Vgc1nYaPTdt1VXtLga5NWRkTkhE5qNIIQKc+X41zkSc5cTCxXN37x0ixB1AYMRtWvqoHEDdVr0OjHOZSLB/dOMbNFK/bisavni/MGjv6JCzs0o8p2Dqp9EB9oXQsoUzq2sWClEe4DBiDo1PTJ2eKPoOYhEB6Ky+ZeekQ/Q8nEDUqCL0CKXFp/LbFRirlk1vNdDS5YsiQnRHmIwoi4rGPLVbHEap6H49lMlyTvN1hujbzfh6M1l617dLkSfEoMRdeqqQWOGpYeca9Hw9hNsMul2HJriDZrqn1ZRKVCuGWaUKtBiHhyWse2BKTzLnj4FBiNqV35kbA9lvAIUza7Hy56J8Wj+txnQpKqqQx4amlV1u1bepSmXA3lHazWprGb5P4VoD7DTI+3mwhEj0s7IOOxix97eWok9Xy3sT7CtZI480MNNnzCvctmyN+VNk5M+aJUTcnsgQB2DgGQrsQcgLF08tl/khNxeWeuW11VXClEXMDOipIflQnd5ZMP5CDqz46duxCHQGEfU81FPrl24sfxlaeOyHvaUE8fVt2DwPGnOkuxbl2lUdpdVVzwvvBwIdYDBiPxrDk2N5J6ByHEThke2uPCZMu+LlunF1eWPIvPpNJigaHeyEj0Xg2NafcRzyjFFxRvKXxSiNjAYdXN5Q3JPcBz9C0SLr7a6DGw9xi3Y0bD9lnu2rtmju4TYDKs8e/13xCh7edkvJ8Ybe7k0JXc6TfWF8ze//okQpWAw6sbyssaMdZQ8n2ghi7OX4ldPeJ537YKalWvkM7Anyx73Xv3FyKdm4WV2yqS/lVSVf0tYbKMUvOxsN6bEOQXxIL35tVmjtLlmfk3FE7IX2M6PS0R+N/ELI//SMxqagmVPUUodhM882giPhNQSt4durCBrzJeQBS1BLtQHQeLmOi+66M6Nq/bW/dJ2M/nAnL5uT3W8Z8zaRdXlVUJElHDtQSf0ufywcQOFiIiIiIg+J1hn1E0VZuacaELqDFQmZ+FRraPO3WWblq8T2qcmjhwZ7rUldAFaGL+GhkvtOuov8yrLnxZia1p3VJiVM9somWFb8eOUuK5+FwPrhPaZaw4eP9jbXG/P2fuKP0IpafCc3wj5GIw6ceXBoweHM+yF400vf4RR2+WTXuvKti/p8HIZ+ZFjsl4ZfsDm/8S1fewtrT0dayjeuGprZ/MG97mfYcQ8in1hjRgZYcSpLqkuv08+pcLMkQcZpbK1I8E92Lw6J+as62x98vqP7+9l7Agv2vTKh7IPXCgXuoMOWjso1Ds9rcMZt2ds7+zv+Vn5gSijfikOABl4ORe/fdh46r1FNcteEfKxmNaGovHjQzvf3TUZO9hEvDy87bnMCyVVFSe3NSU/e8z1SMNna62/UVazcp+cvT4p69QB6c7OfGXU5Qgu8UvDKnlLxcz1xRsr/laYOe4Q48amYh0nJ9crcvxw7APvYv67SqvKJ8pnVBjJ/QGC2lUYzG1nlm19Q5uz2rpLbX4k52psfLc4ovPmV624S/aiK4aeeEBPL/pzreRSfEbfLrzljZKq8qNlHyrIyvkd/j4/1jE1jMXhtjEzamXy4JMOrl1b/zgO77nIGj7BBrRWiWlARhTSygxTyd7Kapw98j4ij3ip7y+I5M7E0a8oPovqNFP5NKZmjzrSmLqntJadKG49gB3ubIwejvU9AvVAR00+MOc5E/KWiPavwpgMRsqEb7aHH6zwPPkMbL1Hn02h+xGIvouXNtAkfyOjzGB8Uv9g1gN3RQcdhNJfiz5F+I2mIJiX2WHPc9bLXuT3nTLRp/C7HOofae2VBpoviZsIihmJ+fH3fE8851zZhwqGjDrOBiIMPsZA1D4Go1ZCoabHsAEfbURd9Mng6F9Tb6NTkJ3zAaYdmph1aOb7B8hGSQac/Oyc05OByEJxTvayvMG5h2ox/7Q9p5t0aNxtG5fanTkP9UATtfFqS2tW/mnK0JyRouVQ7JDJitH8yNgDjXjfQYBct7Cy/F35DHpvchdg2d/FsmbUxaKlqR0lkfEsRxDISbxucDwbmJLBaDrWv8k/kTZIyl1vrxWP7G+DYPis0hLTSp3SP7Rp+c7YoMuQCZbZE35LKisOk/8G182zJ754op8TaheDUYqCrNFX4GmsNmpKWc3yh6W6eVp+ZPQZKYEoLiPd1iP5weiKficeoCSarIzErtawL+ohHNfMxXoMUko9FAQiX3F1+Z2JYddIxF6TWhrdSc3vjI1R4mA/lc8UiPKyx3wPGdAVxqg7SquW/yJ12uTscYcp4+W0WF8jB6W+bgyZp1XKuXCxmPeB7CWohF+Eg0hEe81FoYLIwLPsX0PbDOi/RZsTbGU1/i7/FmqXI9TMca61T66J/rGNid8PBpInd0ZjTX0Swz36RK+PBysTDWbaKHvZxMyRPYOLnWH7Nqvamy9cH3pO1/UcUfrhsrWJcco4x8Wf1Wc6+dURVWifQ+Lt1goUMt5l8SHTfNlZ4yaDUeGQnCsRpL+Y8pbYwk2v7JWi7JTMnJGo4zsHmemLqUUhBL4j4+utX5P/gisPHt8bgcjPyIzy9mqRdH/DzCiQPyTnu0Hms7Z1K1Deocf2V1G5IChZ2KLPN+xASLu9/ekoHiA8FIhxbKvQYsz3QzyqW39GYeb4g4xTPyUWcx9euHnp6uTyM3OPcMN6TPGGig5btHo67jESlG8crV5tb76mWNhVvesvn5I+7kn7OVcePMLuEEfaEOkY05gXyR3viBmAytRVdsf1K+zXNlyEIs4o0fq1kuoV97a13Lyho76AFGMkBmNzq1e81rriCQf/C+OhWi1J/EZG6Yz4d0eLm2Om+eFBzFxkMDbwb1Otzty3LWxur11XespZWla1fElyPH5jJ2y+XVJZPr+tdQu75jtG/CsxJYOtrf8z0jTEDmtx3pIustf8TnOcc3Va9JGy9avaPKjkRUaNd42bjYz0921NtweOHm5ouKvqTwq+YeyV4X3XCc/Iaxczo4Dj6FP8ASWbdpsWDZ+P8T2xE71qjE5eHAx1NH4wQtFpZvzmhWoW5vMv0WqMtLgGUF5WzsUmVL8a028Ip3uJCl5/J3Vc/T+eUeOlUyorMeSlqTaLW/4VF3vXr8ZuOcdxmwajQvfmjPQ+WBfjZ3ao6ynEitqrLj4acr0xdievfbd+JSqjH8BOk4ev8bu8Q0ZmtrVsV6tjg9/oo9ZBpHDIqNNsMDfGbBCj/5QYHxIVryx2QlfjjUPxpnn4beLZozE1qcu4OpKb4/SpfwUZzi+UXxHeDIHoebzvTGmPUaP8J1HJbgJpqil5LSVXyTups9tL604ddHSvFovAChZGRs9KCyN7dM0CFXP/bM/dS53H3ksuPyv3H464z+O3vH9qds4NrVcFdYtTe7tutSvyGhb6q2D0O7yFU8cYjBKME7+dszb/2m2aUj/1ZzHOAuU4yWZqx3HT/KzItpQYWVdSs+w2zDUk/hZJ7hSobzrZwYZr63rs653R2MvNHxu+0O6kjjbLpRPIKRLdDBrK1u3eKmPXxQ0ZW0kaD1oheR//2+4H9oaK8fVW5kGsR77y5CSjw+V2J7d9XhxHnRasUWN/9dHHbX0+dvTxwcDju01z3f8X/97uE8hC6hLjtZGQX3mu5Gf2N5Ja51ZUXcWvbaRUsk5t8sCRh7linkrUy5mYSgaPgiG5FwVF4HaLpsjqBvk9mo1O9tsxjh6eHNbyTEFkzMeoYK+0j6G1vXfqtIybUpdRGMl5CN9xOua+I756amxTj6bLktMzxx2i07xypTSCsvlD8P2m2Wwuua7ZY4qxrkgaFYrI5kllJF40ayNTppYYjAJofXkbR+orSqorZqSOzxt4IoKUOsnupF60brHRJrmjKc+kOSHjHxmxM/zcHxf0+cFRPLlDO0Ydj438t8H0NS0u06H0VP/JVZ1WbjrKfCkYbLOIpkLqVJRH/hK8jJZuWPkBvs9JfUM9sP7x5mxj3J+VVJeXzd9Y/pIJ6SftTu7F1Nk6ZoIsQi1qq1+QP8U4H2D9rytp1UfJFmPxuX5dlhhvoeM2B2wE0AxklBdgcDB2zHmltcu2oRZ9SHxek7zaYziUdjKWvSB42VS9Mbu5jscxP43/VE67wQh/gPc8x5wyv3rFw80rrFL7iGXYLgf4jIh9oJHimXQttyQm2gwSTxd6jjqnpKpiCn6XF4PvfHZyCa73BL6n6JgzLpzm2caBejx6ub3qvxNfxmgclFQBvvQ1+I1GYznnamU+jn9Vvdcq6vdXDEYBtAxNLq2uuKP1eBWO/iQYemTBltWbsSE3B5Kw9MPrCRhaW1pV8aAdhVTfL14gOCWDVnF1RSnGrI1PN8mNsiA795tYrp+R7doR7jQY4Sjsz6v9+9639R2W/VYrHb8wmjFrEkWp7aZhRDDLdsxT73921pjLMM+RmOHPKCamYce9FbOvrhsUu769zy+uXl5aXFV+a+vxbjTtPFuMxeByBL93VFS3bEVUxlbur9tpYvfGf4P4DSCRkSXnQ1Z5jzKmwh8v8kqi/9aUSI6t8D49WE67FcAIsOctqFzxQouPFXV08Fus0to7DTVmZyI4TMCCjymtLj9nTnXFR3ZyYebYw7EyOJiYuxdsKH8mePPLwbr4RdOpkTFXYb2PwhFhuq1n++X7q3Zg/vfj38fEi6+OM9O2otYNjC1IrDvWwZ+GHY3BqBOswO4EilcX+lcldLz77Ws0Ee9KRHCt1bnY+A7wj4ZJyq9H8jsBtjQseG4+4huTFwxt//WOF9ssGqVCPcpX4hXAenV786A4NNpeNl87KlnxqjxvYPy401z0cZQqsN8LY/+NBT9vRG+OxqJfu3PVK359jr1nWiJwdQafGQ/YSvye1J7j1jmS7At6WlD0mp3ICPE9+tnKZuzELa6DrYPggWnJYBsycn2iS1KoMbRHTePGLzIre+HtF8uqO+gJ7+rZ/vKV/Kb5vbIx+Nj+RfiZapUqxO/6cXHl8ocS8+C3q9T2PDNH9cjLGvM1v85M1NJE37SQMpfbHye+PCdZxzd5+PD0RbzR5W6YGXUAlcHHBxeUryzesNI/YrYsgphzML2qTkcfTnlbvMLW9vxNgQ15WDDeP0JOHpxjs5VT4qPkbenE1cNyBiV6NqN5vt0+M27QlK20aZ7HJHsYb7P/XZM1+lgTNLHj+UbsUK8hEI1NnCNWmDUORa6uddCbkjlyKD7N1ktp8dL938iYpuYgpuRr9kl76p7EKJ24IaRxWv5GKtGPS/tB09aBYVyiS8X2uVtf6vKNAYri27Z/uyVU2LcbvG3Q1WL836dnn7rXm1cm0T3BbNqeNWa8H2hUy35C+B7x9TdmMwLS14P5Pww+Hwd69a3k4hzZbJ+nZJ4wNNw44O2pkZx9evrJ/0XMjDqgHP+8K1uR+ffkOBRBTPLWlyodAekPbV6qVUm0xUtlMv1sQCs/GKW5OAojYGEDxwFUtkhn69KErChx846Qu7aDOQ+Lf3y8PxF2tu8jk7rSDiNT8MfhQ0cmFoX5ppVULZ+beHe8F7NXhsnTpQtCTrxOBct7pLjmBf+GjUqHGm1vx0CGMeq+Fn1/DHZN5b+n5QX5bTE0fp8kv7LXtlKa+OkcaV0J2Kl2Ds05HNHCP0EWletvtjefMrFx+EPbTph1RW++2ZSc4Kk+fjgzqsJV+uT4387saPle1ctPfFC/hHrBPHvEMSpedNuZNcZW2CdbPyUa89c/5KKoauSZ+VXlrwu1wMyoHUV+SSbeV0ZiKlGxKjrUovilUZl5R5sLMMFdWJMvJV757HrbC7NGTcRGjPTeLPbHKdNpHxjsvsckhp2GT15re53Hh7AD+vNp4622LVQIRItMUHekbLN7fFmJO3XUFacGov7H9nfC8k/sU39CBewD0hXK8QM2dtTk/CHjtAjOrjIlbb0VRcOWv5ESv0tBTOv1hZmjvxqcz/VwfN07D9ipPM8kisXGeNLumfGectrsxoAD0bHxN8sfTUqXilbrewR+2Mq6wd5TCEJ+AwBi8KbrDxmZiWnXYf0rgllrbN81e+kWfOlhjcZcJ7QbBqN21A7JRZM7Wn2UvFi8cVnyqOw16eZgZOT+1ic+qqB4hnqK3olxti8RpsSP0jrU1yh3FnbeOWjC6xFfqFPT2foorYLTLMzS9u45tiOy8wgTnBSqnHBtOD30T6z/b/BHfsOOi2njZwjYwRIZQO/4usX72Di9Mn6PKNa0c3CsSztLHop7eBrhd2uorngyMT7WY1dzhmHXt3UWoOK/EbKyXq0W6QeQkBPqY0LOfZihzElkmF0I2KkQAMcEn/VSF+u+eif6HV2VfZxt7fsa3vt4aU257TMVD+ZiT7OJKxySY7tCDEbwWTBkVR+TmIZGhtqGWGim7e2JH9ovtmoU7/IjOdOxkHzT5Jx2W1BxTi0xGLXhpwd9uY+4xm81QnZ0Weq0sGOS9Rwobex2xMcR0m8hwkY6+KpBY49Cq9UP8TJ5SoTj6D8iYG0qramYh637EP89YjosgkyWM9Mxr3+5EkdiV7Q3H4qAg4LBeqX0Q7Z+qu8lZ84wyboTHWQXJlnM89zw+fZrTs3KQYZnjkTdzlmpJwe3+1k2eCk1x3+hpEXHv/7Svzlga2dh6/cmK/eVGmjrwgqyc37qZ3WJuiSxgRpv3dljFprgg/5fqlL2gDHO2OB9v+1oPqRmyUBp0tJt73JJ02k32mp/HVVXx9c3mEepL9ie1X7PblfsuYDvr/pijwXbD92ePPAox7HdEC5xlW0BVEfZca49l9B2QlVyeeopOtQS64zEb+ZG0UbdhI1tg0LqYpuAsTUfgmJNQfGGihb1DZ4JNzj+vVHlgdLqZW/svjS/I5/NhL6XFtaXYHiWdtOW2lM1/alGNXiemmAvPyJmwzC7pSNwdXiSQCiyzTa3D8ZnbvVU+JRJmeN2pJ4km+SEBgUH8R4IeLvSYk0Xffibx7LT3TS/ONQ//aN4ZhSOPq2i6fbyKL0QoG4qzBrzTQyPNI3OyWUfLlvX1jr4lcmuXogAtMF+QoGYHGQ2o7C0WSVVFS2LdOuQ+UT8DGxdaU1z61MCWs0q8bWPxKqe5kZtL2zndlRdP5io8kd2McBTcuzC7Uu2F/TOOSR4T4fn1E3vd9QB0T495mpj1jvi9EeqYlvx3iqpXn5vR++bV1X+RmEkt8Z2VtXG+Vl+du4krMAFRusJZZtWrIt/trs4+Pv16eOGpiGx/I4fLD11qu1VPeLg8bGM9CD5MmY06genzauqeLcgC40O8f4VRyM7urGksotF326q22dG12afMAS1Q3/DRvNNbDZXoXh1OSJGvefI6fH+QS2pkPIDuHH1rW0tTwVnxePoX6s8MwE7alFaWpNtYUECJJs9rU63RbtI5L1hfpHKmE+KN5W3WcFqey4XRHKewzJvDBZ+EIbL0t3YCgSQ/NbzO8aLn4qCoomK1p8yB61jaSbj0GDya4nOjGXrXrUBMzjjXqHORB1njDmlo6O2EzJPoSL/XOxYtrPfJAQ7GyQutt+vvfdgmde38xsFwRdZpFZTUIE+uWjdkga/JQpB1J7jtrCq/F2bLanElRKaoh0260f79LwVdTs/U8qxl9QtxO+/olG7Z0on/FihzC3B8MU4GNkOoqeV1qxI3sgSxTzbm9o/edr4fwuzE4HolEQR/fYPl9TZVlVMxJ9XrimuqojXwznI9IxBcU0VllWWzxbqULfPjLxYQ5O47n3+C6O2G8esKqmseLH1uVcJ/bym7TtU+K7SqhVt7hwoHjyNjbvCq+tRlriEiO0gh8rLy5ERPZ3YgI0JDbUtWthxlkg7sBN8fPXQUXOUpwpw1BiAveZiBIQfYbc5GO8rwTLPwjIvTSxTuU6FeDK17/AeC4qWlMfrZdzYML9xW6Q8ddkl1eVzEOgqMf4rTqy+tHjz6+1WEPs9rGPxnREJwS4UB1/RPbe90ElfmafLair+2OYUT15QYbNdNTbMn5/yuTgQTMO6rsT39jPO2qxdaF3zg/9rZVtXtXsVhKIRI9J27kBe5ci9yGrqsY5/73/pWYuLi4q0dAEyltvys3I9R5n+Xl3PO9q69EuoIXxZNCO23p5u0vvSsx8tar1sY69mYDYg6DSf1qOdOx3xXp9fvXyZUKd42dn/koLsMSjpqGJsscguVnQ5fbe9hbWjFyf75CgUioxMQuvXP9r+nJz7MP2HeIxFAOr0/LfPk4LIqAtQ4/IofqOr8RstFNqvMRj9B7S+PK2tAA2HmypsmoEAMWwPF+dnArW1vZH2+5fhiDNyrxeV0gVbyl+3t5EO9VJF8XovOR2V6qtKqyrGy/8htqK4lxt6Cet/QKOYkWyB2v8xGP0HoDj1tHFkOCp016NFJYS6lCNRke3pJif3s7SuXD0k95towl4gKvUKlLY1T9m6I7+ZGn/gGi+mTvi8X3sZRcZfYV0vQFF0jbK1TfZ8L6P6aFedUbZh+T65qQF9vjAY7WP2om3KkRZ1J9jTXnd07KLijav2qFdxW2zfGJ2W9mPUqNsrMLbKstRqtPdfYE9elc+xwuxxo43xKlLHoSVzjWP0JfNqVr4k1C0wGO1jfpN42JyFnWsgjvoNqLx9Odbro3/tixMl/fokV59ve1Z6jvNGQyz2TJunqnzOxK8C6ZyDyupDUdyMxpS8ecAu9eysbeW1QkREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREe+r/A6oAvqKJBlvwAAAAAElFTkSuQmCC',
            currency: this.orderItem.currency_code,
            key: this.razorpayDetails.enable_live_mode == "1" ? this.razorpayDetails.live_publishable_key : this.razorpayDetails.test_publishable_key, // Your api key
            amount: (Number(final_total).toFixed(2) * 100).toFixed(0),
            name: "MLMF",
            // order_id : 
            prefill: {
                email: this.props.userID == undefined || this.props.userID == null || this.props.userID == "" ? this.props.guestDetails.email : this.props.email,
                contact: this.props.userID == undefined || this.props.userID == null || this.props.userID == "" ? this.props.guestDetails.phone_number : this.props.phoneNumber,
                name: this.props.userID == undefined || this.props.userID == null || this.props.userID == "" ?
                    (this.props.guestDetails.first_name + " " + this.props.guestDetails.last_name) : (this.props.firstName + " " + this.props.lastName)
            },
            theme: { color: EDColors.primary },
            note: {
                merchant_order_id: this.merchant_order_id
            }
        }
        RazorpayCheckout.open(options).then((data) => {
            // handle success
            debugLog("Payment success ::::::", data);
            this.razorpay_payment_id = data.razorpay_payment_id
            this.txn_id = data.razorpay_payment_id
            this.payTip(final_total, isCustom, tip_percent_val)

        }).catch((error) => {

            // handle failure
            debugLog("Payment failure ::::::", error);
            if (error.code !== 0)
                setTimeout(() => {
                    showValidationAlert(error.description)

                }, 500)
        });
    }

    payTip = (final_total, isCustom, tip_percent_val) => {
        netStatus(status => {
            if (status) {
                this.setState({ isLoading: true });
                let tipParams = {
                    language_slug: this.props.lan,
                    user_id: this.props.userID,
                    order_id: this.orderItem.order_id,
                    transaction_id: this.txn_id,
                    razorpay_payment_id: this.razorpay_payment_id,
                    merchant_order_id: this.merchant_order_id,
                    driver_tip: final_total,
                    tip_percent_val: !isCustom ? tip_percent_val : '',
                    payment_option: "razorpay"

                }
                driverTipAPI(tipParams, this.onSuccessTip, this.onFailureTip, this.props)
            } else {
                showValidationAlert(strings("noInternet"));
            }
        });
    }

    onSuccessTip = onSuccess => {
        this.setState({ isLoading: false, isCardCheckLoading: false });
        if (onSuccess.status == RESPONSE_SUCCESS) {
            showDialogue(onSuccess.message, [], '', () => {
                this.props.navigation.goBack()
            })
        }
        else {
            showValidationAlert(onSuccess.message || strings("generalWebServiceError"))

        }
    }

    onFailureTip = (onfailure) => {
        this.setState({ isLoading: false, isCardCheckLoading: false });
        showValidationAlert(onfailure.message || strings("generalWebServiceError"))
    }

    navigateToPaymentGateway = (tip, isCustom, percentageActualTip, payment_option) => {
        if (payment_option == "paypal") {
            this.props.navigation.navigate("PaymentGatewayContainer", {
                "currency_code": this.orderItem.currency_code,
                isPendingAdded: false,
                pendingTotalPayment: Number(isCustom ? tip : percentageActualTip),
                isForSelection: true,
                isForTip: true,
                order_id: this.orderItem.order_id,
                tip_percent_val: tip,
                isCustom: isCustom
            })
        }

        else if (payment_option == "razorpay") {
            this.startRazorPayment(Number(isCustom ? tip : percentageActualTip), isCustom, tip)
            // this.props.saveCurrencySymbol(this.orderItem.currency_symbol)

            // this.props.navigation.navigate("savedCards", {
            //     "currency_code": this.orderItem.currency_code,
            //     isPendingAdded: false,
            //     pendingTotalPayment: Number(isCustom ? tip : percentageActualTip),
            //     isForSelection: true,
            //     isForTip: true,
            //     order_id: this.orderItem.order_id,
            //     tip_percent_val: tip,
            //     isCustom: isCustom
            // })
        }
        else {
            this.props.saveCurrencySymbol(this.orderItem.currency_symbol)

            this.props.navigation.navigate("savedCards", {
                "currency_code": this.orderItem.currency_code,
                isPendingAdded: false,
                pendingTotalPayment: Number(isCustom ? tip : percentageActualTip),
                isForSelection: true,
                isForTip: true,
                order_id: this.orderItem.order_id,
                tip_percent_val: tip,
                isCustom: isCustom
            })
        }
    }

    onDismissReviewAndReload = (rating, driver_rating, reviewObj, message) => {
        this.setState({ isReview: false })
        showDialogue(message, [], '', () => {
            this.orderItem.rating = rating
            this.orderItem.review = reviewObj.orderRemarks
            this.orderItem.driver_rating = driver_rating
            this.orderItem.driver_review = reviewObj.driverRemarks
            this.setState({ isReview: false });
        })
    }
    //#endregion

    renderCartChangeModal = () => {
        return (
            <EDPopupView isModalVisible={this.state.isCartModalVisible}>
                <EDRadioDailogWithButton
                    title={strings('askAddToCart')}
                    Texttitle={strings('cartClearWarningMsg')}
                    titleStyle={{ fontFamily: EDFonts.bold, marginBottom: 20 }}
                    label={strings('dialogConfirm')}
                    onCancelPressed={this.onCartAddCancelPressed}
                    onContinueButtonPress={this.onCartAddContinuePressed} />

            </EDPopupView>
        )
    }

    renderTipModal = () => {
        return (
            <EDPopupView isModalVisible={this.state.isShowTip}>
                <EDTipComponent
                    onDismissDriverTip={this.onDismissDriverTip}
                    currency={this.orderItem.currency_symbol}
                    submitTip={this.submitTip}
                    tipArray={this.orderItem.driver_tiparr || []}
                    default_tip_percent_val={this.orderItem.default_tip_percent_val}
                    paymentOptions={this.state.paymentOptions}
                    lan={this.props.lan}
                />

            </EDPopupView>
        )
    }

    onCartAddContinuePressed = value => {
        if (value != undefined && value == 1) {
            this.setState({ isCartModalVisible: false })
        } else {
            this.props.saveCartCount(0);
            clearCartData(success => { }, failure => { })
            this.storeData(this.tempArrayItem)
            this.setState({ isCartModalVisible: false })
        }
    }

    onLayout = (e) => {
        // debugLog("ON LAYOUT ::::", e.nativeEvent)
        let totalWave = (e.nativeEvent.layout.width - 60) / 10
        if (totalWave % 2 !== 0)
            totalWave = totalWave + 1
        this.setState({ totalWave: totalWave, totalWidth: e.nativeEvent.layout.width - 60 })
    }


    onCartAddCancelPressed = () => {
        this.setState({ isCartModalVisible: false })
    }

    navigateToRestaurant = () => {
        this.props.navigation.push("RestaurantContainer", {
            restId: this.orderItem.restaurant_id,
            content_id: this.orderItem.restaurant_content_id
        })
    }

    getPaymentOptionsAPI = () => {
        netStatus(isConnected => {
            if (isConnected) {
                this.setState({ isLoading: true })

                var params = {
                    language_slug: this.props.lan,
                    user_id: this.props.userID,
                    is_dine_in: '0',
                    restaurant_id: this.orderItem.restaurant_id,
                    isLoggedIn: (this.props.userID !== undefined && this.props.userID !== null && this.props.userID !== "") ? 1 : 0
                }
                getPaymentList(params, this.onSuccessPaymentList, this.onFailurePaymentList, this.props)
            } else {
                showNoInternetAlert()
            }
        })
    }

    onSuccessPaymentList = (onSuccess) => {
        if (onSuccess.status == RESPONSE_SUCCESS && onSuccess.Payment_method instanceof Array && onSuccess.Payment_method.length !== 0) {
            let payment_options = onSuccess.Payment_method.filter(data => { return data.payment_gateway_slug !== "cod" })
            this.setState({ paymentOptions: payment_options, isLoading: false })

            payment_options.map(data => {
                if (data.payment_gateway_slug == "razorpay")
                    this.razorpayDetails = data
            })
        }
        else
            this.setState({ isLoading: false })

    }

    onFailurePaymentList = () => {
        this.setState({ isLoading: false })
    }

    onWillFocusOrderDetail = () => {
        this.props.saveNavigationSelection("Order");

        if (this.props.navigation.getParam("track") == true) {
            this.taxable_fields = this.props.navigation.getParam("taxable_fields")
            return;
        }
        this.orderItem.price = this.orderItem.price.filter(data => { return data.label_key !== undefined })
        if (this.orderItem.price !== undefined && this.orderItem.price !== null && this.orderItem.price instanceof Array) {
            this.taxable_fields = this.orderItem.price.filter(data => { return data.label_key !== undefined && (data.label_key.toLowerCase().includes("fee") || data.label_key.toLowerCase().includes("tax")) && data.value !== 0 })
            let taxable_fields = this.taxable_fields
            this.orderItem.price = this.orderItem.price.filter(function (data) {
                return !taxable_fields.includes(data);
            });
            let total_taxes = 0
            if (taxable_fields.length !== 0) {
                taxable_fields.map(data => {
                    total_taxes = total_taxes + Number(data.value)
                })
            }
            this.orderItem.price.splice(
                this.orderItem.price.length - 1, 0, {
                label: strings("taxes&Fees"),
                value: total_taxes,
                label_key: "Tax and Fee",
                showToolTip: true
            }
            )
        }
    }


    // RENDER METHOD
    render() {
        var wave = []
        let i = 0
        while (i < this.state.totalWave) {
            wave.push(
                <View style={{ marginHorizontal: 3, height: 20, width: 10, borderRadius: 10, backgroundColor: EDColors.white }} />
            )
            i++;
        }
        return (
            <BaseContainer
                title={strings("orderDetail")}
                left={isRTLCheck() ? 'arrow-forward' : 'arrow-back'}
                right={[]}
                onLeft={this.onBackPressedEvent}
                loading={this.state.isLoading}
            >
                <NavigationEvents onWillFocus={this.onWillFocusOrderDetail} />

                {/* SCROLL VIEW */}
                <ScrollView>

                    {/* MAIN VIEW */}
                    <View style={styles.topView}
                        pointerEvents={this.state.isLoading ? 'none' : 'auto'}
                    >
                        {/* REVIEW MODAL */}
                        {this.renderReviewSubmitDialogue()}
                        {this.renderPopup()}
                        {this.renderCartChangeModal()}
                        {this.renderTipModal()}
                        <View style={styles.mainContainer}>
                            <EDRTLView style={styles.mainView} >
                                <TouchableOpacity onPress={this.navigateToRestaurant}>
                                    <EDImage style={styles.orderImage}
                                        source={this.orderItem.restaurant_image}
                                        resizeMode="cover"

                                    />
                                </TouchableOpacity>
                                <View style={styles.subView}>

                                    {/* RES NAME */}
                                    <EDRTLText
                                        onPress={this.navigateToRestaurant}
                                        style={styles.resText}
                                        title={this.orderItem.restaurant_name} />
                                    <EDRTLText style={styles.simpleText}
                                        title={funGetDateStr(this.orderItem.order_date, "MMMM D, YYYY, hh:mm A")} />
                                    {/* ORDER ID AND STATUS*/}
                                    <EDRTLText style={styles.simpleText} title={strings("orderId") + " " + this.orderItem.order_id} />
                                </View>

                                {/* </View> */}
                            </EDRTLView>
                            {

                                this.orderItem.scheduled_date !== undefined &&
                                    this.orderItem.scheduled_date !== null &&
                                    this.orderItem.scheduled_date !== ""
                                    ?
                                    <>
                                        <EDRTLView style={styles.scheduled}>
                                            <Icon name="schedule" size={18} color={EDColors.primary} />
                                            <EDRTLText
                                                title={strings("orderScheduled") + " " +
                                                    moment(this.orderItem.scheduled_date, "YYYY-MM-DD").format("MMMM D, YYYY") + ", " +
                                                    this.orderItem.slot_open_time + " - " + this.orderItem.slot_close_time
                                                } style={[styles.schedulingText]} />
                                        </EDRTLView>
                                    </> : null}
                            <View style={styles.saparater} />
                            <EDRTLView style={styles.statusView}>
                                <Text style={[styles.statusText, {
                                    color: this.orderItem.order_status.toLowerCase() == "cancel" || this.orderItem.order_status.toLowerCase() == "rejected" ? EDColors.error : "green"
                                }]}
                                    numberOfLines={1}>
                                    {this.orderItem.order_status_display}
                                </Text>
                                <Text style={styles.simpleText}>
                                    {this.orderItem.items.length == 1 ? 1 + " " + strings("itemOrdered") : this.orderItem.items.length + " " + strings("itemsOrdered")}
                                </Text>
                            </EDRTLView>

                            {/* PAYMENT TYPE VIEW */}
                            <View style={{ margin: 15, backgroundColor: EDColors.radioSelected }}>
                                <EDRTLView style={[styles.waveContainer, { marginTop: -8 }]}>
                                    {wave}
                                </EDRTLView>
                                <View style={styles.viewStyle} onLayout={this.onLayout} >

                                    <EDRTLView style={styles.textStyle}>
                                        <EDRTLText style={styles.paymentText}
                                            title={strings("orderType")}
                                        />
                                        <EDRTLText style={styles.simpleText}
                                            title={this.orderItem.delivery_flag.toLowerCase() == 'dinein' ? strings('dineinOrder')
                                                : this.orderItem.delivery_flag.toLowerCase() == 'delivery' ? strings('deliveryOrder') : strings('pickUpOrder')}
                                        />
                                    </EDRTLView>

                                    {/* ONLINE OR COD */}
                                    <EDRTLView style={styles.textStyle}>
                                        <EDRTLText style={styles.paymentText}
                                            title={strings("paymenMethod")}
                                        />
                                        <EDRTLText style={styles.simpleText}
                                            title={this.orderItem.payment_option}
                                        />
                                    </EDRTLView>

                                    {/* REFUND STATUS */}
                                    {this.orderItem.refund_status !== undefined && this.orderItem.refund_status !== null && this.orderItem.refund_status !== "" ?
                                        <EDRTLView style={styles.textStyle}>
                                            <EDRTLText style={styles.paymentText}
                                                title={strings("refundStatus")}
                                            />
                                            <EDRTLText style={styles.simpleText}
                                                title={this.orderItem.refund_status !== undefined && this.orderItem.refund_status !== null ?
                                                    capiString(this.orderItem.refund_status) : ""}
                                            />
                                        </EDRTLView> : null}
                                    {this.orderItem.tips_refund_status !== undefined && this.orderItem.tips_refund_status !== null && this.orderItem.tips_refund_status !== "" ?
                                        <EDRTLView style={styles.textStyle}>
                                            <EDRTLText style={styles.paymentText}
                                                title={strings("tipRefundStatus")}
                                            />
                                            <EDRTLText style={styles.simpleText}
                                                title={this.orderItem.tips_refund_status !== undefined && this.orderItem.tips_refund_status !== null ?
                                                    capiString(this.orderItem.tips_refund_status) : ""}
                                            />
                                        </EDRTLView> : null}



                                    {this.orderItem.delivery_flag == "dinein" && this.orderItem.table_number !== null ?
                                        <EDRTLView style={styles.textStyle}>
                                            <EDRTLText style={styles.paymentText}
                                                title={strings("tableNo")}
                                            />
                                            <EDRTLText style={styles.simpleText}
                                                title={this.orderItem.table_number}
                                            />
                                        </EDRTLView> : null}

                                    {this.orderItem.cancel_reason !== '' || this.orderItem.reject_reason !== "" ?
                                        // < EDRTLView style={styles.textStyle}>
                                        <View style={{ marginHorizontal: 10, marginTop: 10, marginBottom: 5 }}>
                                            <EDRTLText style={styles.paymentText}
                                                title={strings("cancelReason")}
                                            />
                                            <EDRTLText style={{
                                                flex: 1,
                                                // color : EDColors.error,
                                                fontSize: getProportionalFontSize(13)
                                            }} title={this.orderItem.cancel_reason !== '' ? this.orderItem.cancel_reason : this.orderItem.reject_reason} />
                                            {/* </EDRTLView> */}
                                        </View>
                                        : null}

                                    {/* SEPARATOR */}
                                    <View style={styles.priceView} />

                                    {/* ITEMS */}
                                    {this.orderItem.items !== undefined && this.orderItem.items !== null ? this.orderItem.items.map((item, index) => {
                                        return (
                                            <ItemComponent
                                                quantity={item.quantity}
                                                name={item.name}
                                                titleStyle={styles.paymentText}
                                                priceStyle={styles.paymentText}
                                                data={item}
                                                currency_symbol={this.orderItem.currency_symbol}
                                                lan={this.props.lan}
                                                price={this.orderItem.currency_symbol + funGetFrench_Curr(item.offer_price !== "" && item.offer_price !== undefined && item.offer_price !== null ? item.offer_price : item.price, item.quantity, this.orderItem.currency_symbol)}
                                            />
                                        )
                                    }) : null}

                                    {/* SEPARATOR */}
                                    <View style={styles.totalSapareter} />

                                    {/* LIST ITEMS */}
                                    <View style={{ flexDirection: "row" }}>
                                        <FlatList
                                            data={this.orderItem.price.filter(p => (p.value != 0 && p.value != "0.00"))}
                                            listKey={(item, index) => "Q" + index.toString()}
                                            renderItem={this.createItemsList}
                                            keyExtractor={(item, index) => item + index}
                                        />
                                    </View>

                                    {/* SEPARATOR */}
                                    <View style={styles.totalSapareter} />

                                    {/* PRICE DETAILS */}
                                    <PriceDetail
                                        titleStyle={styles.paymentText}
                                        priceStyle={styles.simpleText}
                                        title={strings("cartTotal")}
                                        price={this.orderItem.currency_symbol + funGetFrench_Curr(this.orderItem.total, 1, this.orderItem.currency_symbol)}
                                    />

                                    {this.orderItem.extra_comment !== undefined && this.orderItem.extra_comment !== null && this.orderItem.extra_comment !== "" ?
                                        <>
                                            <View style={styles.commentView} />
                                            <View style={styles.commentContainer}>
                                                <EDRTLText style={styles.text} title={strings("orderComment") + ': ' + this.orderItem.extra_comment} />
                                                {/* <Text style={{ color: EDColors.black }}>{data.extra_comment}</Text> */}
                                            </View>
                                        </>
                                        : null}
                                    {this.orderItem.delivery_instructions !== undefined && this.orderItem.delivery_instructions !== null && this.orderItem.delivery_instructions !== "" ?
                                        <>
                                            <View style={styles.commentView} />
                                            <View style={styles.commentContainer}>
                                                <EDRTLText style={styles.text} title={strings("deliveryInstruction") + ' : ' + this.orderItem.delivery_instructions} />
                                                {/* <Text style={{ color: EDColors.black }}>{data.extra_comment}</Text> */}
                                            </View>
                                        </>
                                        : null}

                                </View>
                                <EDRTLView style={[styles.waveContainer, { marginTop: -10 }]}>
                                    {wave}
                                </EDRTLView>
                            </View>
                            {/* REORDER BUTTON */}
                            {/* {this.props.navigation.getParam("track") !== true ?
                                <EDRTLView style={styles.btnView}>
                                    <EDThemeButton
                                        style={styles.reorderBtn}
                                        textStyle={styles.reorderBtnText}
                                        label={strings("reOrder")}
                                        onPress={this.onOrderItemPressed}
                                    />
                                    {this.orderItem.order_status == "Delivered" || this.orderItem.order_status == "Complete" ?
                                        (this.orderItem.rating !== undefined && this.orderItem.rating !== null && this.orderItem.rating !== "" ? null :
                                            this.orderItem.show_restaurant_reviews !== undefined && this.orderItem.show_restaurant_reviews !== null && this.orderItem.show_restaurant_reviews ?
                                                <EDThemeButton
                                                    style={styles.rateBtn}
                                                    textStyle={styles.rateBtnText}
                                                    label={strings("rateOrder")}
                                                    onPress={this.onAddReviewPressed}
                                                />
                                                : null

                                        ) : null}
                                    {this.orderItem.shouldShowTipButton == true ?
                                        <EDThemeButton
                                            style={styles.reorderBtn}
                                            textStyle={styles.reorderBtnText}
                                            label={strings("tipDriver")}
                                            onPress={this.onTipDriverPressed}
                                        /> : null}
                                </EDRTLView>
                                : null} */}

                            {/* </View> */}
                            {
                                this.orderItem.show_restaurant_reviews !== undefined && this.orderItem.show_restaurant_reviews !== null && this.orderItem.show_restaurant_reviews &&
                                    this.orderItem.rating !== undefined && this.orderItem.rating !== null && this.orderItem.rating !== "" ?
                                    <View style={styles.reviewContainer}>
                                        <EDRTLView style={{ alignItems: 'center', justifyContent: 'space-between' }}>
                                            <EDRTLText title={strings("orderRating")} style={styles.rating} />
                                            <StarRating
                                                containerStyle={{ alignItems: 'center', justifyContent: 'center' }}
                                                starStyle={{}}
                                                starSize={getProportionalFontSize(22)}
                                                emptyStar={'star'}
                                                fullStar={'star'}
                                                halfStar={'star-half'}
                                                iconSet={'MaterialIcons'}
                                                maxStars={5}
                                                rating={this.orderItem.rating}
                                                emptyStarColor={EDColors.emptyStar}
                                                reversed={isRTLCheck()}
                                                disabled={true}
                                                animation='swing'
                                                halfStarEnabled={false}
                                                fullStarColor={EDColors.fullStar} />
                                        </EDRTLView>
                                        <EDRTLView style={styles.remarkView}>
                                            <EDRTLText title={strings("remark")} style={[styles.rating, { fontFamily: EDFonts.medium }]} />
                                            <EDRTLText title={this.orderItem.review} style={[styles.rating, { fontFamily: EDFonts.regular, flex: 1 }]} />
                                        </EDRTLView>

                                        {this.orderItem.driver_review !== undefined && this.orderItem.driver_review !== null && this.orderItem.driver_review !== "" ?
                                            <>
                                                <EDRTLView style={styles.rattingView}>
                                                    <EDRTLText title={strings("driverRating")} style={styles.rating} />
                                                    <StarRating
                                                        containerStyle={{ alignItems: 'center', justifyContent: 'center' }}
                                                        starStyle={{}}
                                                        starSize={getProportionalFontSize(22)}
                                                        emptyStar={'star'}
                                                        fullStar={'star'}
                                                        halfStar={'star-half'}
                                                        iconSet={'MaterialIcons'}
                                                        maxStars={5}
                                                        rating={this.orderItem.driver_rating}
                                                        emptyStarColor={EDColors.emptyStar}
                                                        reversed={isRTLCheck()}
                                                        disabled={true}
                                                        animation='swing'
                                                        halfStarEnabled={false}
                                                        fullStarColor={EDColors.fullStar} />
                                                </EDRTLView>
                                                <EDRTLView style={{ marginTop: 5, flex: 1 }}>
                                                    <EDRTLText title={strings("remark")} style={[styles.rating, { fontFamily: EDFonts.medium }]} />
                                                    <EDRTLText title={this.orderItem.driver_review} style={[styles.rating, { fontFamily: EDFonts.regular, flex: 1 }]} />
                                                </EDRTLView>
                                            </>
                                            : null
                                        }
                                    </View> : null}

                        </View>
                        {/* ====================================================================== */}
                        <EDRTLText style={styles.orderItemView} title={strings("orderedItems")} />

                        <FlatList
                            data={this.orderItem.items}
                            listKey={(item, index) => "Q" + index.toString()}
                            renderItem={({ item, index }) => {
                                return (
                                    <View style={styles.orderView}>
                                        <OrderItem
                                            imageStyle={styles.orderImage}
                                            titleStyle={styles.orderTitle}
                                            quantityStyle={styles.orderQuanText}
                                            priceStyle={styles.priceText}
                                            itemImage={item.image}
                                            itemName={item.name}
                                            quantity={strings("quantity") + ": " + item.quantity}
                                            price={this.orderItem.currency_symbol + funGetFrench_Curr(item.itemTotal, 1, this.orderItem.currency_symbol)}
                                            isVeg={item.is_veg}
                                            foodType={item.food_type_name}
                                        />
                                    </View>
                                );
                            }}
                            keyExtractor={(item, index) => item + index}
                        />
                    </View>
                </ScrollView>
            </BaseContainer >
        );
    }
    //#endregion

    //#region 
    /** ON LEFT PRESSED */
    onBackPressedEvent = () => {
        this.props.navigation.goBack();
    }
    //#endregion


    //#region 
    /** ON ORDER ITEM EVENT */
    onOrderItemPressed = () => {
        if (this.orderItem.restaurant_status == "" || this.orderItem.timings.closing.toLowerCase() !== "open") {

            this.setState({ cartModal: true, cartMsg: strings("resNotAccepting") })
        } else {
            if (this.orderItem.allow_scheduled_delivery == "1") {

                this.setState({ isLoading: true })
                this.props.saveOrderModeInRedux(this.orderItem.delivery_flag.toLowerCase() == 'delivery' ? 0 : 1)
                this.storeData(this.orderItem);
                return;
            }
            let original_items = this.orderItem.items
            let out_of_stock = original_items.filter(data => { return data.in_stock == "0" })


            if (out_of_stock.length == 0) {
                this.setState({ isLoading: true })
                this.props.saveOrderModeInRedux(this.orderItem.delivery_flag.toLowerCase() == 'delivery' ? 0 : 1)

                this.storeData(this.orderItem);
            }
            else if (original_items.length == out_of_stock.length) {
                showValidationAlert(strings("allOutOfStock"))

            }
            else {
                showConfirmationDialogue(strings("someOutOfStock"), [], "", () => {
                    let orderToPass = this.orderItem
                    orderToPass.items = this.orderItem.items.filter(data => { return data.in_stock != "0" })
                    this.setState({ isLoading: true })
                    this.props.saveOrderModeInRedux(orderToPass.delivery_flag.toLowerCase() == 'delivery' ? 0 : 1)

                    this.storeData(orderToPass);
                })
            }

        }
    }

    //#region 
    /** ITEM LIST */
    createItemsList = ({ item, index }) => {
        return (
            <View style={{ flex: 1 }}>
                {item !== "" ?
                    <PriceDetail
                        title={item.label}
                        titleStyle={styles.paymentText}
                        priceStyle={styles.paymentText}
                        showToolTip={item.showToolTip}
                        taxable_fields={this.taxable_fields.filter(data => { return data.value !== "" && data.value != "0.00" && data.value != 0 })}
                        currency={this.orderItem.currency_symbol}
                        price={
                            (item.label_key.includes("Tip") || item.label_key.includes("Delivery") || item.label_key.includes("Credit") || item.label_key.includes("Service")) ?
                                item.value !== undefined &&
                                    item.value != null &&
                                    item.value.toString() !== undefined &&
                                    item.value.toString() !== null ?
                                    item.value.toString().includes("%") ?
                                        isRTLCheck() ? item.value + ' +'
                                            : "+ " + item.value
                                        : isRTLCheck() ? this.orderItem.currency_symbol + funGetFrench_Curr(item.value, 1, this.orderItem.currency_symbol) + ' +'
                                            : "+ " + this.orderItem.currency_symbol + funGetFrench_Curr(item.value, 1, this.orderItem.currency_symbol) : ''
                                : (item.label_key.includes("Coupon") || item.label_key.includes("Discount") || item.label_key.includes("Used Earning Points") ?
                                    isRTLCheck() ? this.orderItem.currency_symbol + funGetFrench_Curr(item.value, 1, this.orderItem.currency_symbol) + ' -'
                                        : "- " + this.orderItem.currency_symbol + funGetFrench_Curr(item.value, 1, this.orderItem.currency_symbol)
                                    : this.orderItem.currency_symbol + funGetFrench_Curr(item.value, 1, this.orderItem.currency_symbol))
                        }
                    />
                    : null}
            </View>
        );
    }
    //#endregion

    //#region 
    /** STORE DATA */
    storeData(data) {
        var cartData = {};
        data.items.forEach(item => {
            item.comment = ""
        });
        getCartList(
            success => {
                if (success.items.length === 0) {
                    clearCartData(success => {
                        cartData = {
                            resId: data.restaurant_id,
                            content_id: data.restaurant_content_id,
                            items: data.items,
                            coupon_name: "",
                            cart_id: 0,
                            resName: data.restaurant_name,
                            coupon_array: []
                        };
                        console.log("cartData::", cartData)
                        this.saveData(cartData);
                    });
                } else {
                    if (success.resId == data.restaurant_id) {

                        this.setState({ cartModal: true, cartMsg: strings("alreadyInCart") })
                    } else {
                        this.tempArrayItem = data
                        this.setState({ isLoading: false, isCartModalVisible: true })
                    }

                }
            },
            onCartNotFound => {
                cartData = {
                    resId: data.restaurant_id,
                    content_id: data.restaurant_content_id,
                    items: data.items,
                    coupon_name: "",
                    cart_id: 0,
                    resName: data.restaurant_name,
                    coupon_array: []

                };
                this.saveData(cartData);
            },
            error => { }
        );
    }
    //#endregion

    //#region 
    /** UPDATE DATA */
    updateCount(data) {
        var count = 0;
        data.map((item, index) => {
            count = count + Number(item.quantity);
        });
        this.props.saveCartCount(count);
    }
    //#endregion

    //#region 
    /** SAVE DATA */
    saveData(data) {
        this.props.saveCurrencySymbol(this.orderItem.currency_symbol)
        this.updateCount(data.items)
        saveCartData(
            data,
            success => {
                saveCurrency_Symbol(this.orderItem.currency_symbol, onsuccess => {
                    this.setState({ isLoading: false })
                    this.props.navigation.popToTop()
                    this.props.navigation.navigate("CartContainer", { isview: false });
                }, onFailure => {

                    this.setState({ isLoading: false })
                })
            },
            fail => {
                this.setState({ isLoading: false })
            }
        );
    }
    //#endregion
}

const styles = StyleSheet.create({
    mainView: {
        // backgroundColor: EDColors.backgroundLight,
        padding: 5,
        marginHorizontal: 5,
        marginTop: 5,
        // borderTopLeftRadius: 5,
        // borderTopRightRadius: 5,
        // justifyContent: "space-between"
    },
    subView: {
        paddingHorizontal: 8,
        justifyContent: 'space-evenly',
        paddingVertical: 5,
        flex: 1
    },
    scheduled: {
        alignItems: 'center',
        flex: 1,
        marginTop: 10,
        marginHorizontal: 10,

    },
    schedulingText: {
        marginHorizontal: 5,
        color: EDColors.black,
        flex: 1,
        fontFamily: EDFonts.semiBold, fontSize: getProportionalFontSize(13)
    },
    saparater: {
        width: '100%',
        height: 1,
        backgroundColor: EDColors.radioSelected,
        marginVertical: 5
    },
    resText: {
        fontFamily: EDFonts.semiBold,
        fontSize: getProportionalFontSize(16),
        color: EDColors.primary,
    },
    viewStyle: {
        // borderRadius: 6,
        backgroundColor: EDColors.radioSelected,
        marginVertical: 20,
        // paddingBottom:5
    },
    mainContainer: {
        backgroundColor: EDColors.white,
        borderRadius: 16,
        margin: 10
    },
    textStyle: { marginHorizontal: 10, justifyContent: "space-between", marginTop: 10, marginBottom: 5 },
    priceView: { height: 1, backgroundColor: EDColors.backgroundDark, marginVertical: 5, paddingHorizontal: 10 },
    orderImage: { borderRadius: 8, width: metrics.screenWidth * 0.22, height: metrics.screenWidth * 0.22, alignSelf: 'center' },
    orderTitle: { fontFamily: EDFonts.semiBold, fontSize: getProportionalFontSize(16), color: EDColors.black },
    statusView: { justifyContent: 'space-between', marginHorizontal: 11, marginTop: 5 },
    remarkView: { marginTop: 5, flex: 1 },
    topView: { flex: 1, paddingBottom: 10 },
    rattingView: { alignItems: 'center', justifyContent: 'space-between', borderTopWidth: .75, borderTopColor: EDColors.black, marginTop: 7.5, paddingTop: 7.5 },
    statusText: {
        fontFamily: EDFonts.semiBold,
        fontSize: getProportionalFontSize(12),
        color: 'green'
    },
    orderQuanText: { fontFamily: EDFonts.regular, fontSize: getProportionalFontSize(13), color: EDColors.text },
    priceText: { fontFamily: EDFonts.semiBold, fontSize: getProportionalFontSize(14), color: EDColors.black, marginTop: 5 },
    reviewContainer: {
        backgroundColor: EDColors.palePrimary,
        padding: 10,
        margin: 10
    },
    rating: {
        fontFamily: EDFonts.bold,
        fontSize: getProportionalFontSize(16),
        color: EDColors.black
    },
    waveContainer: {
        zIndex: 1,
        marginBottom: -10,
        overflow: "hidden",
        // marginHorizontal: 3,

        borderRightColor: EDColors.offWhite,
        borderLeftColor: EDColors.offWhite,

    },
    paymentText: {
        fontFamily: EDFonts.medium,
        fontSize: getProportionalFontSize(14),
        color: EDColors.black, marginRight: 5
    },
    simpleText: { fontFamily: EDFonts.medium, fontSize: getProportionalFontSize(13), color: EDColors.text },
    commentContainer: { marginHorizontal: 10, marginTop: 5, marginBottom: 10 },
    reorderBtn: { alignSelf: 'center', flex: 1, borderRadius: 16, height: metrics.screenHeight * 0.07, marginHorizontal: 5 },
    popupBtn: { alignSelf: 'center', borderRadius: 16, height: metrics.screenHeight * 0.07, marginHorizontal: 5, width: '100%', marginVertical: 10 },
    commentView: { height: 1, backgroundColor: EDColors.backgroundDark, marginTop: 5, marginTop: 10, },
    reorderBtnText: { fontFamily: EDFonts.medium, fontSize: getProportionalFontSize(14) },
    rateBtn: { alignSelf: 'center', flex: 1, borderRadius: 16, backgroundColor: EDColors.offWhite, marginHorizontal: 5, height: metrics.screenHeight * 0.07 },
    rateBtnText: { fontFamily: EDFonts.medium, fontSize: getProportionalFontSize(16), color: EDColors.black },
    orderItemView: { margin: 10, fontFamily: EDFonts.semiBold, fontSize: getProportionalFontSize(16), color: EDColors.black, marginHorizontal: 10 },
    btnView: { justifyContent: "space-around", flex: 1, marginBottom: 10 },
    orderView: { flex: 1, margin: 10, borderRadius: 16, marginHorizontal: 15, backgroundColor: EDColors.white },
    totalSapareter: { height: 1, backgroundColor: EDColors.backgroundDark, marginVertical: 5, },
    popupView: { flex: 1, justifyContent: 'center', alignItems: 'center', },
    text: { color: EDColors.black, marginTop: 10 },
    popupSubView: { backgroundColor: EDColors.white, borderRadius: 24, width: '90%', padding: 15, justifyContent: 'center', alignItems: 'center' },
    iconStyle: {
        marginVertical: 10
    }
})

export default connect(
    state => {
        return {
            lan: state.userOperations.lan,
            email: state.userOperations.email,
            firstName: state.userOperations.firstName,
            phoneNumber: state.userOperations.phoneNumberInRedux,
            userID: state.userOperations.userIdInRedux,
            token: state.userOperations.phoneNumberInRedux,
            lastName: state.userOperations.lastName,
            phoneCode: state.userOperations.phoneCode,
            email: state.userOperations.email,
            guestDetails: state.checkoutReducer.guestDetails,
        }
    },
    dispatch => {
        return {
            saveCurrencySymbol: symbol => {
                dispatch(saveCurrencySymbol(symbol))
            },
            saveCartCount: data => {
                dispatch(saveCartCount(data));
            },
            saveOrderModeInRedux: mode => {
                dispatch(saveOrderMode(mode))
            },
            saveNavigationSelection: dataToSave => {
                dispatch(saveNavigationSelection(dataToSave));
            }
        };
    }
)(OrderDetailContainer);
