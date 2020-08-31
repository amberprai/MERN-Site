import React,  {useState, useEffect} from 'react'
import { loadCart, cartEmpty } from './helper/cartHelper';
import { Link } from 'react-router-dom';
import { getmeToken, processPayment } from './helper/paymentBHelper';
import{createOrder} from "../auth/helper"
import { isAutheticated } from '../auth/helper';
import DropIn from 'braintree-web-drop-in-react';



const  PaymentB = ({products, setReload = f =>f, reload=undefined}) =>{
    const [info, setinfo] = useState({

        loading :false,
        success:false,
        clientToken: null,
        error: "",
        instance: {} // to fill in all the request
    })

    const userId = isAutheticated() && isAutheticated().user._id
    const token = isAutheticated() && isAutheticated().token
    
    
    const getToken =(userId, token) =>{
        getmeToken(userId, token).then(info => {
            console.log("Information :",info);
            if(info.error){
                setinfo({...info,error: info.error})
            }else{
                const clientToken = info.clientToken;
                setinfo({clientToken});

            }
        })
    }

    useEffect(() => {
        getToken(userId, token)
     }, [])


    const showbtdropIn = () =>{
        
        console.log(" Client info ", info.clientToken)
        return (
        <div>
           {info.clientToken !== null && products.length > 0 ? (
          <div>
            <DropIn
              options={{ authorization: info.clientToken }}
              onInstance={instance => (info.instance = instance)}
            />
            <button className="btn btn-block btn-success" onClick={onPurchase}>
              Buy
            </button>

        </div>
            ) : (<h3>PLease Login or add something to card </h3>)}
          </div>
        ) 
    }
   

    const onPurchase = () =>{
        //1. This is requesting for payment and getting the nounce data
        setinfo({loading:true})
        let nonce;
        let getNonce =info.instance
        .requestPaymentMethod()
        .then( data => {
            nonce=data.nonce
            console.log(nonce);
            
            const paymentData = {
                paymentMethodNonce: nonce,
                amount:getAmount()
            }
        //2. This is to actual process the payment with nounce
            processPayment(userId, token,paymentData)
            .then(response =>{
                setinfo({...info, success: response.success, loading: false})
                console.log("Payment Success")


                const orderData = {
                    products : products,
                    transaction_id: response.transaction_id,
                    amount: response.transaction.amount
                }
                createOrder(userId, token, orderData)
                //empty cart
                cartEmpty(() =>{
                    console.log("Did we got crash ?");
                    
                })

                //force reload
                setReload(!reload);
            })
            .catch(error => {
                setinfo({loading:false, success:false})
                console.log("Payment Failed")
            })
        })
    }

    const getAmount = () => {
        let amount =0
        products.map(p => {
            amount=amount+p.price
        })
        return amount
    }
    
    return (
        <div>
            <h3>Your bill is {getAmount()}</h3>
            {showbtdropIn()}
        </div>
    )
    }

export default PaymentB;
