import {body } from "express-validator";

const userRegisterValidator = ()=>{
    return[
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Please provide an email")
            .isEmail()
            .withMessage("Please provide a correct email"),
        body("username")
            .trim()
            .notEmpty()
            .withMessage("Please provide a username")
            .isLowercase()
            .withMessage("please provide a valid username")
            .isLength({min:3})
            .withMessage("min length should be 3"),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password is incorrect"),
        body("username")
            .optional()
            .trim()
    ]
}

const userLoginValidator=()=>{
    return [
        body("email")
            .trim().notEmpty()
            .withMessage("please give the email")
            .isEmail()
            .withMessage("Email format is wrong"),
        body("password")
            .trim().notEmpty()
            .withMessage("password is required")
    ]
}

const userChangeCurrentPasswordValidator=()=>{
    return [
        body("oldPassword").notEmpty().withMessage("Old password is required"),
        body("newPassword").notEmpty().withMessage("New password is required"),
    ]
}

const userForgotPasswordValidator =()=>{
    return[
        body("email").notEmpty().withMessage("Email is req")
        .isEmail().withMessage("Email Format is wrong")
    ]
}

const userResetForgotPasswordValidator = ()=>{
    return[
        body("newPassword").notEmpty().withMessage("Password is required")
    ]
}

export { userRegisterValidator, userLoginValidator, userChangeCurrentPasswordValidator, userForgotPasswordValidator,userResetForgotPasswordValidator }