import mongoose  from "mongoose";

const orderSchema = new mongoose.Schema({


    customer:{
        name:{type: String , required:true},
        phone:{type: String ,required:true},
        address:{type: String ,required:true}
    },


    items: [

        {
            name:String,
            price:Number,
            quantity:Number,
            subtotal:Number
        }
    ],

    summary:{
        totalItems:Number,
        totalAmount:Number
    },

    status: {
        type:String,
        enum:["PENDING","PREPARING","READY","COMPLETED","CANCELLED"],
        default:"PENDING"
    },

    createdAt: {
        type:Date,
        default:Date.now
    }
});

const Order =mongoose.model("Order",orderSchema);

export default Order;