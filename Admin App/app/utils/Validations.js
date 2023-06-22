import { strings } from '../locales/i18n'

export default class Validations {
  checkForEmpty = (text, message = strings('validationRequiredField')) => {
    if (text.trim().length == 0) {
      return message
    }
    return ''
  }

  // Function for performing email validations
  validateEmail = (text, message = '') => {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    if (text.trim() == '') {
      return message
    } else if (reg.test(text) === false) {
      return strings('validationValidEmail')
    } else {
      return ''
    }
  }

  validateLoginMobile = (number, message) => {
    if (number === "") {
        return message;
    } else {
        return ""
    }
  }

  // Function for performing Password validations
  validatePassword = (text, message = '') => {
    
    let reg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#?!@$%^&*-.])[A-Za-z\d#?!@$%^&*-.]{6,12}$/;
    if (text.trim() == '') {
      return message
    } else {
      return reg.test(text) ? '' : strings('validationValidPassword')
    }
  }

  validateConfirmPassword = (
    text,
    text1,
    message = 'Confirm password Not Proper',
  ) => {
    if (text !== text1) {
      return message
    } else if (text1 === '') {
      return strings("emptyConfirmPassword")
    } else {
      return ''
    }
  }

}
