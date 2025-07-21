import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/AsyncHandler";
import { jwt } from "jsonwebtoken";
import { Prisma } from "@prisma/client/extension";

const authMiddleware = async(req,res,next)=>{
    try {
        let token = req.cookies.accessToken;

        if(!token && req.headers.authorization && req.headers.authorization.starstWise("Bearer")){
            token = req.headers.authorization.split(" ")[1];
        }

        if(!token){
            throw new ApiError(401,"Unauthorized: No token provided");
        }

        const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await Prisma.user.findUnique({
            where: {id: decode?.id},
        });

        if(!user){
            throw new ApiError(401,"Unauthorized: User not found");
        }

        req.user = user;
    } catch (error) {
        next(new ApiError(401,message));
    }
}

export {authMiddleware};