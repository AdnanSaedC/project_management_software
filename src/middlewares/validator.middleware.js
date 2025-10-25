//here we design the middle ware the function which resides between systems
//it just check for the error given by previous middleware

import { validationResult } from "express-validator";
import { ApiError } from "../utils/api-error.js"

export const validator = (req,res,next) =>{
    const errors = validationResult(req);
    if(errors.isEmpty()){
        return next()
    }

    //if there is an error
    //converting errors into an arrau and soring two fields in the form object
    const extractedErrors =[];
    
    errors.array().map((err)=> {
        extractedErrors.push({[err.path]:err.msg,})
    })

    console.log(extractedErrors)
    throw new ApiError(422,"Data received is not valid",extractedErrors);
}