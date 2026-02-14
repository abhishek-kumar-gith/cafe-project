import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import {connectDB} from "./db.js";
import Order from "./models/order.js";
import dotenv from "dotenv";
dotenv.config();



// const JWT_SECRET ="super_secret_key";

const JWT_SECRET = process.env.JWT_SECRET;


// let orders=[];

const statusFlow = {
    PENDING: ["PREPARING", "CANCELLED"],
    PREPARING: ["READY", "CANCELLED"],
    READY: ["COMPLETED"],
    COMPLETED: [],
    CANCELLED: []
};


const app =express();
// const PORT= 5000;
const PORT = process.env.PORT || 5000;



app.use(express.json());
app.use(cors());
app.get("/",(req,res)=>{
    res.send("cafe backend is running");
});





app.post("/orders",async (req,res)=>{

    const order=req.body;


    if(!order || !order.items || order.items.length === 0){
        return res.status(400).json({
            success:false,
            message:"Invalid order data"

        });
    }

    const newOrder={
        // id: Date.now(),
        status:"PENDING",
        // createdAt: new Date().toISOString(),
        ...order
    };


    // orders.push(newOrder);

   const savedOrder = await Order.create(newOrder);

    res.status(201).json({
        success:true,
        message:"Order Saved Successfully",
        orderId:savedOrder._id
    });



});



app.get("/orders",async (req,res)=>{
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({
        success:true,
        totalOrders: orders.length,
        orders:orders
    });
})


app.patch("/orders/:id/status",verifyAdmin, async (req, res) => {
    // const orderId = Number(req.params.id);
    // const { status: newStatus } = req.body;
    
    //  // order find karo
    // const order = orders.find(o => o.id === orderId);



    const {id} =req.params;
    const {status: newStatus}=req.body;

    const order= await Order.findById(id);

    if (!order) {
        return res.status(404).json({
            success: false,
            message: "Order not found"
        });
    }


    const  currentStatus=order.status;
    

   const allowedNextStatuses = statusFlow[currentStatus] || [];


    if (!allowedNextStatuses.includes(newStatus)) {
        return res.status(400).json({
            success: false,
            message: `Invalid status change from ${currentStatus} to ${newStatus}`
        });
    }

   

    // status update
    order.status = newStatus;

    await order.save();

    res.json({
        success: true,
        message: "Order status updated",
        order
    });
});







app.post("/login",(req,res)=>{
  
   if (!req.body || !req.body.username || !req.body.password) {
        return res.status(400).json({
            success: false,
            message: "Username and password are required"
        });
    }

  const {username ,password }=req.body;

    //temp admin later db

    if(username !== "admin" || password !== "admin123"){
        return res.status(401).json({
            success:false,
            message:"Invalid Credentials"
        });
    }


    //jwt create

    const token =jwt.sign(
        {username,role: "admin"},
        JWT_SECRET,
        {expiresIn:"1h"}
    );



    res.json({
        success:true,
        token

    });


})



function verifyAdmin(req,res,next){
    const authHeader =req.headers.authorization;

    if(!authHeader){
        return res.status(401).json({message:"No token provided"});
    }



    const token=authHeader.split(" ")[1];


    try{
        const decoded=jwt.verify(token,JWT_SECRET);

        if(decoded.role !== "admin"){
            return res.status(403).json({message:"Forbidden"});

        }


        req.admin =decoded;
        next();
    }catch(err){
        return res.status(401).json({message:"Invalid token"});
    }
}

connectDB();

app.listen(PORT,()=>{
    console.log(`server running on http://localhost:${PORT}`);
})
