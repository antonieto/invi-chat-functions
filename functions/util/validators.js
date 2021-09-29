const isEmail = (string)=> {
    const regExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;  
    
    return string.match(regExp) 
}
 
const isEmpty = (string)=> {
    return string.trim() === ""
}

exports.validateSignUp = (data)=> { 
    let errors = {} 
    if (isEmpty(data.email)){ 
        errors.email = 'Email must not be empty';
    } else if(!isEmail(data.email)){
        errors.email = 'Not a valid email';
    } 
    if (data.password !== data.confirmPassword){
        errors.password = 'Passwords must match';
    }
    return { 
        errors, 
        valid: Object.keys(errors).length === 0 ? true : false //Si no hay errores, valid: true, else, valid: false
    }
} 
 
exports.validateLogIn = (data) =>{
    let errors = {};

    if(isEmpty(data.email)) errors.email = 'Email must not be empty'
    if(isEmpty(data.password)) errors.password = 'Password must not be empty';

    return { 
        errors, 
        valid: Object.keys(errors).length === 0 ? true: false
    }

}
