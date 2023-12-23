import {useState} from 'react'

import { CardElement, useStripe , useElements} from "@stripe/react-stripe-js";

import {useSelector} from 'react-redux'

import {selectCartTotal} from '../../store/cart/cart.selector.js'
import {selectCurrentUser} from '../../store/user/user.selector.js'

import Button , {BUTTON_TYPE_CLASSES} from "../button/button.component";

import {PaymentFormContainer , FormContainer , paymentButton} from './payment-form.styles.jsx';



const PaymentForm=()=>{
 const stripe = useStripe();
 const elements = useElements();
 const [isProcessingPayment , setIsProcessingPayment] = useState(false)

 const amount = useSelector(selectCartTotal);

 const currentUser = useSelector(selectCurrentUser);


 const paymentHandler = async(e) =>{

        e.preventDefault();
        if(!stripe || !elements){
            return;
        }

        setIsProcessingPayment(true); 

        const response = await fetch('/.netlify/functions/create-payment-intent',{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({amount: amount *100}),
        }).then(res => res.json());

        const{
            paymentIntent : {client_secret},
        }= response;


        const paymentResult = await stripe.confirmCardPayment(client_secret , {
            payment_method:{
                card:elements.getElement(CardElement),
                billing_details:{
                    name : currentUser ? currentUser.displayName : 'Guest',
                }
            }
        });

        setIsProcessingPayment(false); 

        if(paymentResult.error){
            alert(paymentResult.error.message);
        }else{
            if(paymentResult.paymentIntent.status === "succeeded"){
                alert("Payment Successfull");
            }
        }
        
        
 }
    return(
        <PaymentFormContainer>
            <FormContainer onSubmit={paymentHandler}>
                    <h2>Credit Card Payment: </h2>
                    <CardElement/>
                    <Button isLoading ={isProcessingPayment} buttonType={BUTTON_TYPE_CLASSES.inverted}>Pay Now</Button>
            </FormContainer>
        </PaymentFormContainer>
        )
    
}

export default PaymentForm;