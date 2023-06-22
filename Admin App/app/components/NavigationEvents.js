
import React from 'react';

export default class NavigationEvents extends React.Component {
    componentDidMount(){
        if(this.props.navigationProps !== undefined && this.props.navigationProps !== null && this.props.navigationProps.navigation !== null && this.props.navigationProps.navigation !== undefined ){
          if(this.props.onFocus !== undefined && this.props.onFocus !== null){
              this.props.navigationProps.navigation.addListener('focus' , this.props.onFocus)
          }
          if(this.props.onBlur !== undefined && this.props.onBlur !== null){
              this.props.navigationProps.navigation.addListener('blur' , this.props.onBlur)
          }
          if(this.props.onBack !== undefined && this.props.onBack !== null){
              this.props.navigationProps.navigation.addListener('beforeRemove' , this.props.onBack)
          }
          if(this.props.onNavigationStateChange !== undefined && this.props.onNavigationStateChange !== null){
              this.props.navigationProps.navigation.addListener('state' , this.props.onNavigationStateChange)
          }
          if(this.props.onTransitionStart !== undefined && this.props.onTransitionStart !== null){
              this.props.navigationProps.navigation.addListener('transitionStart' , this.props.onTransitionStart)
          }
          if(this.props.onTransitionEnd !== undefined && this.props.onTransitionEnd !== null){
              this.props.navigationProps.navigation.addListener('transitionEnd' , this.props.onTransitionEnd)
          }
          if(this.props.onGestureStart !== undefined && this.props.onGestureStart !== null){
              this.props.navigationProps.navigation.addListener('gestureStart' , this.props.onGestureStart)
          }
          if(this.props.onGestureEnd !== undefined && this.props.onGestureEnd !== null){
              this.props.navigationProps.navigation.addListener('gestureEnd' , this.props.onGestureEnd)
          }
          if(this.props.onGestureCancel !== undefined && this.props.onGestureCancel !== null){
              this.props.navigationProps.navigation.addListener('gestureCancel' , this.props.onGestureCancel)
          }
      }
    }

    componentWillUnmount(){
        if(this.props.navigationProps !== undefined && this.props.navigationProps !== null && this.props.navigationProps.navigation !== null && this.props.navigationProps.navigation !== undefined ){
            if(this.props.onFocus !== undefined && this.props.onFocus !== null){
                this.props.navigationProps.navigation.removeListener('focus' )
            }
            if(this.props.onBlur !== undefined && this.props.onBlur !== null){
                this.props.navigationProps.navigation.removeListener('blur')
            }
            if(this.props.onBack !== undefined && this.props.onBack !== null){
                this.props.navigationProps.navigation.removeListener('beforeRemove')
            }
            if(this.props.onNavigationStateChange !== undefined && this.props.onNavigationStateChange !== null){
                this.props.navigationProps.navigation.removeListener('state')
            }
            if(this.props.onTransitionStart !== undefined && this.props.onTransitionStart !== null){
                this.props.navigationProps.navigation.removeListener('transitionStart' )
            }
            if(this.props.onTransitionEnd !== undefined && this.props.onTransitionEnd !== null){
                this.props.navigationProps.navigation.removeListener('transitionEnd')
            }
            if(this.props.onGestureStart !== undefined && this.props.onGestureStart !== null){
                this.props.navigationProps.navigation.removeListener('gestureStart')
            }
            if(this.props.onGestureEnd !== undefined && this.props.onGestureEnd !== null){
                this.props.navigationProps.navigation.removeListener('gestureEnd' )
            }
            if(this.props.onGestureCancel !== undefined && this.props.onGestureCancel !== null){
                this.props.navigationProps.navigation.removeListener('gestureCancel' )
            }
        }
    }

    render() {
        return (null);
}

}


