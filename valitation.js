function Validator(options){

    function getParent(element, selector){
        while(element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    let selectorRules = {};

    function validate(inputElement, rule){
        let errorMessage;
        let errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);

        // lay ra cac rules cua selector
        let rules = selectorRules[rule.selector];

        // lap qua tung rules va kiem tra
        for( let i = 0; i< rules.length; i++){
            switch (inputElement.type){
                case 'radio':
                case 'checkbox':
                    formElement.querySelector(rule.selector + ':checked')
                    break
                default:
                    errorMessage = rules[i](inputElement.value);
            }
            if(errorMessage) break
        }
                   
        if(errorMessage){
            errorElement.innerText = errorMessage;
            getParent(inputElement, options.formGroupSelector).classList.add('invalid');
        }else{
            errorElement.innerText = '';
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid');

        }

        return !errorMessage;
    }

    let formElement = document.querySelector(options.form);

    if(formElement){

        formElement.onsubmit = e => {
            e.preventDefault();

            let isFormValid = true;

            options.rules.forEach(rule => {
                let inputElement = formElement.querySelector(rule.selector)
                let isValid = validate(inputElement, rule);
                if(!isValid){
                    isFormValid = false;
                }

            });
            
            if(isFormValid){
                // submit voi js
                if(typeof options.onSubmit === 'function'){
                    let enableInputs = formElement.querySelectorAll('[name]')
                    let formValues = Array.from(enableInputs).reduce((values, input)=>{
                        switch (inputElement.type){
                            case 'radio':
                                values[input.name] = formElement.querySelector(`input[name="${input.name}"]`)
                                break;
                            case 'checkbox':
                                if(!input.matches(':checked')) {
                                    values[input.name] = [];
                                    return values;
                                };
                                if(!Array.isArray(values[input.name]) ){
                                    values[input.name] = [];
                                }
                                values[input.name].push(input.value)
                                break;
                            case 'file':
                                values[input.name] = input.files;
                            default:
                                values[input.name] = input.value

                        }
                        return values;
                    }, {})

                    options.onSubmit(formValues) 
                }
                // submit voi hanh vi mac dinh
                else{
                    formElement.submit();
                }
            }


        }

        options.rules.forEach(rule => {

            // luu lai ca rules cho moi input
            if(Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.test);
            }else{
                selectorRules[rule.selector] = [rule.test];
            }

            let inputElements = formElement.querySelectorAll(rule.selector)

            Array.from(inputElements).forEach(inputElement => {
                if(inputElement){
                    inputElement.onblur = () => {
                        validate(inputElement, rule);  
                    }
    
                    inputElement.oninput = () => {
                        let errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
                        errorElement.innerText = '';
                        getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
                    }
                }
            })      
        })
    }

}

Validator.isRequired = function(selector, message){
    return {
        selector,
        test(value){
            return value ? undefined :  message || 'Vui long nhap truong nay'
        }
    }
}


Validator.isEmail = function(selector, message){
    return {
        selector,
        test(value){
            const regex =
                /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
            return regex.test(value) ? undefined :  message || 'Vui long nhap email'
        }
    }
}

Validator.minLength = function(selector, min, message){
    return {
        selector,
        test(value){
            return value.length >= min ? undefined :  message || `Vui long nhap toi thieu ${min} ky tu`
        }
    }
}

Validator.isConfirmed = function(selector, getConfirmValue, message){
    return {
        selector,
        test(value){
            return value === getConfirmValue() ? undefined : message || 'Gia tri nhap vao khong chinh xac'
        }
    }
}