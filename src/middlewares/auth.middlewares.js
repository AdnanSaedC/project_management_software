//the plan is to extract the info from accessToken and inject it in the request so that when request reaches the server we can verify the user

import jwt from 'jsonwebtoken'; 
import { User } from "../models/user.model.js"
import {ApiError} from "../utils/api-error.js"
import { asyncHandler } from "../utils/asyncHandler.js"

export const verifyJWT = asyncHandler(async (req,res,next)=>{
    const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer "," ")
    //in case of mobiles the cookiesa are sent in  headers and in this format "Bearer cookies..."

    if(!accessToken){
        throw new ApiError(401,"No access token")
    }
    try {
        const decodedToken = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password -forgotPasswordToken -forgotPasswordExpiry -emailVerificationToken -emailVerificationExpiry")
        
        if(!user){
            throw new ApiError(401,"Invalid Access token");
        }
        
        req.user = user
        //just adding another field in request
        next();
        
    } catch (error) {
        throw new ApiError(401,"No access token")
    }
})