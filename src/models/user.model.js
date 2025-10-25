//schema is nothing but structure 
//it can have methods and hooks also

//what is hook they are just functions which run automatically
//before and after certain database event

//if a function is run before an opertaion we call it prehook
//if a function runs  after the operation it is called posthook

import mongoose , { Schema } from "mongoose";
import brcypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userScheme = new Schema(
    {
        avatar:{
            type:{
                url:String,
                localPath: String
            },
            default:{
                url:`https://placehold.co/200*200`,//u can keep any url of ur choice
                localPath:""
            }
        },
        username:{
            type: String,
            unique: true,
            required: true,
            index: true,
            trim:true,
            lowercase:true
        },
        email:{
            type: String,
            unique: true,
            required: true,
            trim:true,
            lowercase:true
        },
        fullName:{
            type:String,
            trim:true
        },
        password:{
            type:String,
            required:[true,"Please provide the password"],

        },
        isEmailVerified:{
            type:Boolean,
            default:false
        },
        refreshToken:{
            type:String
        },
        forgotPasswordToken:{
            type:String
        },
        forgotPasswordExpiry:{
            type:Date
        },
        emailVerificationToken:{
            type:String
        },
        emailVerificationExpiry:{
            type:Date
        }
    },
    {
        timestamps:true
    }
)

//we are using a prehook to hash the password here  
//the parameter next is the callback given by mongoose
//which is used to give control to next middlewar
userScheme.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    //here next give control to next middle ware
    this.password = await brcypt.hash(this.password,10)
    //here 10 is no of rounds
    next();
}
)

//lets create a method for userScheme
//schemanName.methods.methodName
userScheme.methods.isPasswordCorrect = async function (newPassword) {
    return await brcypt.compare(newPassword,this.password);
};

//lets craete access token
userScheme.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id:this._id,//will come from mongoose
            email:this.email,
            username:this.username
            //this is data OR PAYLOAD
        },
        process.env.ACCESS_TOKEN_SECRET,//your secret
        {expiresIn:process.env.ACCESS_TOKEN_EXPIRY}//expiry
    )
}

//lets create a refresh Token
userScheme.methods.generateRefreshToken = function (){
    return jwt.sign(
        {
            _id : this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

//lets craete a token without data
//temporary token

userScheme.methods.generateTemporaryTokens = function(){
    const unhashedToken = crypto.randomBytes(20).toString("hex");
    //hex is nothing but it will give the output which contain string
    //and it has all the alpabets of hexa decimal 

    const hashedToken = crypto
                    .createHash("sha256")
                    .update(unhashedToken)
                    .digest("hex")

    //here digest converst the hash object created by updarte functuion
    //into a string in hex format

    const tokenExpiry = Date.now() + (20*60*1000)
    //date + 20 min

    return { unhashedToken , hashedToken , tokenExpiry }
}
export const User = mongoose.model("User",userScheme);