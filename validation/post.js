import Validator from 'validator';
import isEmpty from './is-empty';

const validatePostInput = (data) => {
    let errors = {};

    data.text = !isEmpty(data.text) ? data.text : '';

    if(!Validator.isLength(data.text, { min: 0, max: 300 })) {
        errors.text = 'Text should be between 0 to 300 characters';
    }

    if(Validator.isEmpty(data.text)) {
        errors.text = 'Text field is required';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
};

export default validatePostInput;
