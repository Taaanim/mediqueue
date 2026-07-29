import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import React from 'react';
import { Link } from 'react-router';
import PaymentForm from '../../components/PaymentForm/PaymentForm';

const PayForRegistration = () => {

    const stripePromise = loadStripe('pk_test_51RldStHpEaskf8JMJ5SwDhdWuNxIRglVi8la6sINM70pGgo4fedFuZNMxkP2ZrOiVo9ZVGXsPWCYlHdhbqyidOMg00C6gBMeja');

    return (
        <Elements stripe={stripePromise}>
            <PaymentForm />
        </Elements>
    );
};

export default PayForRegistration;