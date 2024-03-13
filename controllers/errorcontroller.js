const appError=require('./../utils/apperror');
//handle invalid database ID
const handleCastErrorDB=(err)=>{//transfer weird error into an friendly readable operational error 
  const message=`Invalid ${err.path}:${err.value}.`
  return new appError(message,400);
}
//handle duplicate database fields
const handleDuplicateFieldsDB=(err)=>{
  const errors=Object.values(err.errors).map(el=>el.message);
  const value= err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message=`Duplicate field value : ${value} . please use another value`;
  return new appError(message, 400);
}

const handleValidationErrorDB=(err)=>{
  const message=`Invalid input data ${errors.join('. ')}`;
  return new appError(message,400)
}

const handleJWTError=()=>{
  return new appError('invalid token .please login again',401);
}

const handleExpiredJWTError=()=>{
    return new appError('your token has expired.please login again', 401);
}

const sendErrorDev=(err,res)=>{
  res.status(err.statusCode).json({
    status: err.status,
    err:err,
    message: err.message,
    stack:err.stack
  });
}

const sendErrorProd = (err, res) => {
  if(err.isOperational){// expected/ trusted error send message to client
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }else{//programming / unknown / 3rd party errors : dont leak error details
    //1)log the error
    console.error('ERROR',err);
    //2) send generic message to users
    res.status(500).json({
      status: 'error',
      message: 'something went very wrong',
    });
  }
};

module.exports=(err, req, res, next) => {
  err.statusCode = err.statusCode || 500; // 500 means internal server error
  err.status = err.status || 'error';
  if(process.env.NODE_ENV==='development'){
    console.log('dev errr')
    sendErrorDev(err,res);
  }else if (process.env.NODE_ENV.trim() === 'production') {
    console.log('prod errr');
    let error = err;
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name==='JsonWebTokenError') error=handleJWTError();
    if(error.name==='TokenExpiredError') error=handleExpiredJWTError();
    sendErrorProd(error, res);
}

};