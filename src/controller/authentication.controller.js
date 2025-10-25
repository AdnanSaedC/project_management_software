import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendEmail,emailVerificationMessage,forgotPasswordVerificationMessage } from "../utils/mail.js"
import jwt from "jsonwebtoken";
import crypto from "crypto"


//notes refer mailgen line
// `${req.protocol}://${req.host}/api/v1/users/verify-email/${unhashedToken}`
//example of this -> https://adnan.com/api/v1/users/../token

const generateAccessAndRefreshTokens = async (userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        
        //lets save then value in database
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave:false})
        //validateBeforeSave we do this for two reason
            //to skip validations
            //we dont want mongooose to reject the appeal because some fields are empty
            return {accessToken,refreshToken}
        } catch (error) {
        throw new ApiError(500,"Somethig went wrong while generating acccess and refresh token")
        
    }
}

const registerUser = asyncHandler( async (req, res)=>{

    const {email,username,password,role} = req.body;
    //here you will get four independent variables
    
    const existingUser = await User.findOne({
        $or : [{username},{email}]
    })
    //it will check for these two values present in the database or not
    
    
    //if user already exist we will get an object
    if(existingUser){
        throw new ApiError(409,"User already exist",[]);
    }
    //if user not present then create one
    const newUser = await User.create({
        email,
        password,
        username,
        isEmailVerified:false
    })
    
    const { unhashedToken , hashedToken , tokenExpiry } = newUser.generateTemporaryTokens();
    
    //lets save the tokens for sending email
    newUser.emailVerificationToken = hashedToken;
    newUser.emailVerificationExpiry = tokenExpiry;
    
    //lets save the user
    await newUser.save({validateBeforeSave:false})
    //validateBeforeSave we do this for two reason
    //to skip validations
    //we dont want mongooose to reject the appeal because some fields are empty
    
    //lets send the mail
    //newUser?.email means it check whether the user exist or not
    //returns undefined if new user does not exist else execute
    await sendEmail({
        email:newUser?.email,
        subject : "Please verify your account",
        mailgenContent: emailVerificationMessage(newUser.username,
            `${req.protocol}://${req.host}/api/v1/auth/verify-email/${unhashedToken}`
        )
    });
    
    //now we have send the mail now lets send the payload for user webpage
    //for that lets first remove the fields which we don't wnat to send
    
    const dataWeAreSendingToTheUser = await User.findById(newUser._id).select("-password -refreshToken -forgotPasswordToken -forgotPasswordExpiry -emailVerificationToken -emailVerificationExpiry"); 
    //these are the things which we dont want to send

    if(!dataWeAreSendingToTheUser){
        throw new ApiError(500,"Something went wrong while saving the user because we couldn't able to fetch them");
    }

    //lets send the payload
    return res
        .status(200).
        json(new ApiResponse(200,{user:dataWeAreSendingToTheUser},"User regoistered and verification mail ahs been send"))

})

const login = asyncHandler(async (req,res)=>{
    const {email,password} = req.body;

    if(!email){
        throw new ApiError(400,"Email is required");
    }

    //checking for existing user
    //since its login not signup(registering user)
    const user = await User.findOne({email});
    if(!user){
        throw new ApiError(400,"user does not exist \n Sign up please")
    }

    //user exist and now lets check password valid or not
    const passwordValidity = user.isPasswordCorrect(password);
    if(!passwordValidity){
        throw new ApiError(400,"Sorry your password is not correct")
    }

    //if the password is correct then generate all the tokens and send it via cookies

    const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id);

    //if we want to send the user data (used in mobiles since cookies dont work there) then
    const loggedInUser =await User.findById(user._id).select("-password -refreshToken -forgotPasswordToken -forgotPasswordExpiry -emailVerificationToken -emailVerificationExpiry"); 


    //now lets send the data fopr browser

    const options={
        httpOnly:true,
        secure:true
    }

    //what does this means
    //httpOnly means it can be used by browser only js running in browser can't use this cook9ie
    return res.status(200)
            .cookie("accessToken",accessToken)
            .cookie("refreshToken",refreshToken)
            .json(
                new ApiResponse(200,{  user:loggedInUser,
                    accessToken,
                    refreshToken
                },"user logged in successfully"
            )
            )
})

const logout = asyncHandler(async(req,res)=>{
    const user =await User.findByIdAndUpdate(req.user._id,
        {
        $set:{
            refreshToken:""
        }
        },
        {
        new:true,
        }
    )
    //new:true it will give the updated value in user
    //if we used user further it will help

    const options={
        httpOnly:true,
        secure:true,
    }
    return res.status(200).clearCookie("accessToken",options)
            .clearCookie("refreshToken",options)
            .json(
                new ApiResponse(200,{},"User logged out succesfully")
            )
})

const  getCurrentUser = asyncHandler(async(req,res)=>{
    return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    req.user,
                    "Current user fetched Succesfully"
            ))
})
const verifyEmail = asyncHandler(async(req,res)=>{
    const {verificationToken} = req.params

    if(!verificationToken){
        throw new ApiError(400,"Email verifcation Token is missing")
    }

    //lets convert it into hash and verify its authenticity
    const hashedToken = crypto.createHash("sha256")
                                        .update(verificationToken)
                                        .digest("hex")

    const user = await User.findOne({
        emailVerificationToken:hashedToken,
        emailVerificationExpiry:{$gt:Date.now()}
    })
    //what we are doing in the Date.now() is the value in this field should be greater than this value

    if(!user){
        throw new ApiError(400,"Token got expired or user doesn't exist")
    }

    user.isEmailVerified=true,
    //lets save this property
    await user.save({validateBeforeSave:false});

    return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {
                        isEmailVerified:true
                    },
                    "User got veridfied"
                )
            )
})

const  resendEmailVerifiaction = asyncHandler(async(req,res)=>{
    const user = await User.findById(req.user?._id);
    if(!user){
        throw new ApiError(404,"User doesn't exist")
    }
    if(user.isEmailVerified){
        throw new ApiError(409,"Email is already verified")
    }

    //if the control comes here then email is not verified
    //we need temporary tokens to verify
    const { unhashedToken , hashedToken , tokenExpiry } = user.generateTemporaryTokens();
    
    //lets save the tokens for sending email
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;
    
    //lets save the user
    await user.save({validateBeforeSave:false})

    await sendEmail({
        email:user?.email,
        subject : "Please verify your account",
        mailgenContent: emailVerificationMessage(user.username,
            `${req.protocol}://${req.host}/api/v1/users/verify-email/${unhashedToken}`
        )
    });

    return res.status(200)
            .json(
                new ApiResponse(200,{},"Mail has been sent to your mail id")
            )

})
const  refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized access")
    }
    
    //lets get the user data
    try {
        const decodedToken = await jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
        
        const user = await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401,"User not found or invalid referesh token")
        }
        
        //lets verify the refreshToken 
        if(incomingRefreshToken!==user?.refreshToken){
            throw new ApiError(401,"problem in refreshToken")
            
        }
        const {accessToken,refreshToken:newRefreshToken}=await generateAccessAndRefreshTokens(user._id);
        user.refreshToken=newRefreshToken
        
        await user.save({validateBeforeSave:true})

         //lets send the refreshToken
        const options={
            httpOnly:true,
            secure:true
        }

        return res
            .status(200)
            .cookie("accessToken",accessToken,options)
            .cookie("refreshToken",newRefreshToken,options)
            .json(new ApiResponse(
                200,
                {
                    accessToken,
                    refreshToken:newRefreshToken
                },
                "New access Token send"
            ))

    } catch (error) {
        throw new ApiError(401,"invalid refresh Token")
    }
})
const  forgotPasswordRequest = asyncHandler(async(req,res)=>{
    //the goal here is user will provide us with an email we will check whetehr that email exist or not inour database
    const {email} = req.body;
    const user = await User.findOne({email})

    if(!user){
        throw new ApiError(404,"User not found ",[])
    }

    //now there is a user
    const { unhashedToken , hashedToken , tokenExpiry } = user.generateTemporaryTokens()
    user.forgotPasswordToken = hashedToken;
    user.forgotPasswordExpiry = tokenExpiry;

    user.save({validateBeforeSave:false})

    await sendEmail({
        email:user?.email,
        subject : "Forgot password request",
        mailgenContent: forgotPasswordVerificationMessage(user.username,
            `${req.protocol}://${req.host}/forgot-password/${unhashedToken}`
        )
    });

    res.status(200)
        .json(
            new ApiResponse(
                200,{},"Password reset mail has been sent to your mail id"
            )
        )
})
const  resetForgotPassword = asyncHandler(async(req,res)=>{
    const {resetToken} = req.params
    const {newPassword} = req.body

    const hashedVersion = crypto
                            .createHash("sha256")
                            .update(resetToken)
                            .digest("hex")

    const user = await User.findOne({
        forgotPasswordToken:hashedVersion,
        forgotPasswordExpiry:{$gt: Date.now()}
    })
    if(!user){
        throw new ApiError(489,"Token is invalid or expired")
    }
    user.forgotPasswordExpiry=undefined
    user.forgotPasswordToken=undefined
    user.password=newPassword
    await user.save({validateBeforeSave:false})

    return res.status(200)
                .json(new ApiResponse(
                    200,{},"password got updated"
                ))
})
const  changeCurrentPassword = asyncHandler(async(req,res)=>{
    //if you are changing the password means you are already logged in

    const {oldPassword,newPassword} = req.body


    const user = await User.findById(req.user?._id);

    const isPasswordValid = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordValid){
        throw new ApiError(400,"Invalid old password")
    }

    user.password=newPassword
    await user.save({validateBeforeSave:false})

    return res.status(200).json(
        new ApiResponse(
            200,{},"Password Changed"
        )
    )
})



export { registerUser ,
    login ,
    logout ,
    getCurrentUser,
    verifyEmail,
    resendEmailVerifiaction,
    refreshAccessToken,
    forgotPasswordRequest,
    resetForgotPassword,
    changeCurrentPassword
}