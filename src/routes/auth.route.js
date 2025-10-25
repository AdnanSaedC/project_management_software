import { Router } from "express";
import { registerUser ,
    login ,
    logout ,
    getCurrentUser,
    verifyEmail,
    resendEmailVerifiaction,
    refreshAccessToken,
    forgotPasswordRequest,
    resetForgotPassword,
    changeCurrentPassword } from "../controller/authentication.controller.js";
import {userRegisterValidator, userLoginValidator, userChangeCurrentPasswordValidator, userForgotPasswordValidator,userResetForgotPasswordValidator} from "../validators/index.js"
import {validator} from "../middlewares/validator.middleware.js"
import {verifyJWT} from "../middlewares/auth.middlewares.js"

const router = Router();

//unsecure routes doesnot verify jwt
router.route("/register").post(userRegisterValidator(),validator,registerUser);
router.route("/login").post(userLoginValidator(),validator,login);
router.route("/verify-email/:verificationToken").post(verifyEmail);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/forgot-password").post(userResetForgotPasswordValidator(),validator,forgotPasswordRequest);
router.route("/reset-password/:resetToken").post(userForgotPasswordValidator(),validator,resetForgotPassword);

//secure roots needs to verify jwt
router.route("/logout").post(verifyJWT,logout);
router.route("/current-user").post(verifyJWT,getCurrentUser);
router.route("/change-password").post(verifyJWT,userChangeCurrentPasswordValidator(),validator,changeCurrentPassword);
router.route("/resend-email-verification").post(verifyJWT,userChangeCurrentPasswordValidator(),validator,resendEmailVerifiaction);

//express only works with middleware function((req,res,next)=>{})
//here what we are doing is userRegisterValidator() will give arrays of middle funtion which are executing it and getting all those values and keeping an array
//now whenever express needs to execute this line it hass the refrence variables to execute the function


export default router;