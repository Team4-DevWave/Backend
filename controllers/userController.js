const userModel = require("../models/usermodel");
const appError = require("../utils/apperror");
const catchAsync = require("../utils/catchasync");
const handlerFactory = require("./handlerfactory"); //MIGHT NEED TO BE FIXED ,./handlerfactory
exports.usernameAvailable=catchAsync(async(req,res,next)=>{
    if(!req.params.username){
        return next(new appError("Please provide a username",400));
    }
    const username=req.params.username;
    const user=await userModel.findOne({username:username});
    if(user){
        return next(new appError("Username not available",400));
    }
    res.status(200).json({
        status:"success",
        message:"Username available",
    });
});
