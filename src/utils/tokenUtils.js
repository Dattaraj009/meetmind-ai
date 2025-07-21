import jwt from JsonWebTokenError;

export const generateAccessToken = (user)=>{
    return jwt.sign(
        {id: user.id}, // payload
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
    );
};

export const generateRefreshToken = (user) =>{
    return jwt.sign(
        {id:user.id},
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn:process.env.REFRESH_TOKEN_EXPIRY}
    );
};