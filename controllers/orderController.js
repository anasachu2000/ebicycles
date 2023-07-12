const Product = require('../models/productModal');
const User = require('../models/userModel');
const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const razorpay = require('razorpay');



//=========================== USER RAZORPAY INSTANCE CREATION SECTION START ===========================//

var instance = new razorpay({
  key_id: process.env.Razorpay_Key_Id,
  key_secret: process.env.Razorpay_Key_Secret,
});



//=========================== USER ORDER PLACING SECTION START ===========================//

const placeOrder = async (req,res,next) => {
  try {
    const id = req.session.user_id;
    const userName = await User.findOne({ _id: id });
    const address = req.body.address;
    const paymentMethod = req.body.payment;
    const cartData = await Cart.findOne({ userId: id });
    const products = cartData.products;
    const Total = parseInt(req.body.Total);
    
    const status = paymentMethod === 'COD' ? "placed" : "pending";
    const order = new Order({
      deliveryAddress: address,
      userId: id,
      userName: userName.name,
      paymentMethod: paymentMethod,
      products: products,
      totalAmount: Total,
      date: new Date(),
      status: status,
    });
    const orderData = await order.save();
    const orderId = orderData._id;
    if(orderData){
      if(order.status === 'placed'){
        await Cart.deleteOne({userId:id});
        for(let i=0;i<products.length;i++){
          const pro = products[i].productId
          const count = products[i].count
          await Product.findByIdAndUpdate({_id:pro},{$inc:{stockQuantity:-count}})
        }
        res.json({codsuccess:true,orderId});
      }else{
        if(paymentMethod === 'walletpayment'){
          const wallet = userName.wallet;
          if(wallet >= Total){
            await User.findByIdAndUpdate({_id:id},{$inc:{wallet:-Total}})
            await Cart.deleteOne({userId:id});
            for(let i=0;i<products.length;i++){
              const pro = products[i].productId
              const count = products[i].count
              await Product.findByIdAndUpdate({_id:pro},{$inc:{stockQuantity:-count}})
            }
            const orderId = order._id;
            await Order.findByIdAndUpdate({_id:orderId},{$set:{status:'placed'}});
            res.json({codsuccess:true,orderId});
          }else{
            res.json({walletFailed:true});
          }
        }else{
          const orderId = orderData._id;
          console.log(orderData)
          const totalAmount = orderData.totalAmount;
          var options = {
            amount: totalAmount*100,
            currency:'INR',
            receipt:''+ orderId
          } 
          instance.orders.create(options,function(err,order){
          
            res.json({order});
          })
        }
      }
    }else{
      res.redirect('/')
    }
  } catch (err) {
    next(err);
  }
};
  


//=========================== USER RAZORPAY PAYMENT VERIFICATION SECTION START ===========================//

const verifyPayment = async (req,res,next)=>{
  try{
    const id = req.session.user_id;
    const details = req.body
    const cartData = await Cart.findOne({ userId: id });
    const products = cartData.products;
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', process.env.Razorpay_Key_Secret);
    hmac.update(details.payment.razorpay_order_id + '|' + details.payment.razorpay_payment_id);
    const hmacValue = hmac.digest('hex');
  
    if(hmacValue === details.payment.razorpay_signature){
      for(let i=0;i<products.length;i++){
        const pro = products[i].productId
        const count = products[i].count
        await Product.findByIdAndUpdate({_id:pro},{$inc:{stockQuantity:-count}})
      }
      await Order.findByIdAndUpdate({_id:details.order.receipt},{$set:{status:"placed"}});
      await Order.findByIdAndUpdate({_id:details.order.receipt},{$set:{paymentId:details.payment.razorpay_payment_id}});
      await Cart.deleteOne({userId:req.session.user_id});
      const orderId = details.order.receipt;
      res.json({success:true,orderId});
    }else{
      await Order.findByIdAndRemove({_id:details.order.receipt});
      res.json({success:false});
    }
  }catch(err){
    next(err);
  }
}



const loadOrderPlace = async(req,res,next) =>{
  try{
    const id = req.params.id;
    const session = req.session.user_id;
    const userData = await User.findById(session); 
    const orderData = await Order.findOne({_id:id}).populate('products.productId');
    const orderDate = orderData.date
    const expectedDate = new Date(orderDate.getTime() + (5 * 24 * 60 * 60 * 1000)); 
    res.render('orderPlaced',{user:userData,session,order:orderData,expectedDate});

  }catch(err){
    next(err)
  }
}


module.exports ={
  placeOrder,
  verifyPayment,
  loadOrderPlace,
}