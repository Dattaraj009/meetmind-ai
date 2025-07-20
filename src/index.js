import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(express.static());
app.use(cookieParser());


import userRouter from './routes/user.routes.js'
app.use('/api/v1/users',userRouter)

const PORT = process.env.PORT||3000;


app.listen(PORT,()=>{
    console.log(`server is running on http:localhost:${PORT}`);
})

export default app;
