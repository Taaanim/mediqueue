import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import useAxiosSecure from '../../hooks/useAxiosSecure/useAxiosSecure';
import Swal from 'sweetalert2';
import { BsArrowLeft } from 'react-icons/bs';

const PayForRegistration = () => {
  const { state } = useLocation();
  const registration = state?.registration;
  const navigate = useNavigate()

  const stripe = useStripe();
  const elements = useElements();
  const axiosSecure = useAxiosSecure();

  const [clientSecret, setClientSecret] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (registration?.camp_fee) {
      axiosSecure
        .post('/create-payment-intent', { amount: registration.camp_fee })
        .then((res) => setClientSecret(res.data.clientSecret))
        .catch((err) => {
          console.error('Error creating payment intent:', err);
          Swal.fire('Error', 'Failed to initiate payment.', 'error');
        });
    }
  }, [registration]);

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) return;

    const card = elements.getElement(CardElement);
    if (!card) return;

    setProcessing(true);

    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card,
      });

      if (error) {
        throw new Error(error.message);
      }

      const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethod.id,
      });

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      if (paymentIntent.status === 'succeeded') {
        const paymentInfo = {
          transactionId: paymentIntent.id,
          paymentStatus: 'Paid',
          paymentMethod: paymentMethod.card.brand,
          card_last4: paymentMethod.card.last4,
          card_country: paymentMethod.card.country || 'Unknown',
          paidAt: new Date().toISOString(),
          amountPaid: registration?.camp_fee,

        };

        await axiosSecure.patch(`/participants/payment/${registration._id}`, paymentInfo);

        Swal.fire('Success', 'Payment completed successfully!', 'success');
        navigate('/Dashboard/RegisteredCamps')
      }
    } catch (err) {
      Swal.fire('Payment Failed', err.message || 'Something went wrong', 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 font-sans">
        <div className='text-start w-4xl'>
            
        </div>
      <div className="w-full max-w-4xl mx-auto grid lg:grid-cols-2 rounded-2xl shadow-2xl overflow-hidden">
        {/* Left Side */}
        <div className="bg-slate-800 text-white p-8 sm:p-12 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payment Confirmation</h1>
            <p className="text-slate-300 mt-2">You're one step away from securing your spot.</p>

            <div className="mt-10 border-t border-slate-600 pt-6 space-y-4">
              <h2 className="text-lg font-semibold">Order Summary</h2>
              <div className="flex justify-between">
                <span className="text-slate-300">Camp:</span>
                <span className="font-medium">{registration?.camp_name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Participant:</span>
                <span className="font-medium">{registration?.participant_name || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-2xl font-bold border-t border-slate-600 pt-4 mt-4">
                <span>Total Amount:</span>
                <span>${registration?.camp_fee || 0}</span>
              </div>
            </div>
          </div>

          <div className="text-center text-slate-400 text-lg mt-8 flex items-center justify-center gap-2">
            <BsArrowLeft />
            <Link to='/Dashboard/RegisteredCamps'> Go Back</Link>
          </div>
        </div>

        {/* Right Side */}
        <div className="bg-white p-8 sm:p-12">
          <h2 className="text-2xl font-bold text-slate-800">Enter Card Details</h2>
          <p className="text-slate-500 mt-1 mb-8">Your payment is encrypted and secure.</p>

          <form onSubmit={handlePayment}>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Card Information</label>
              <div className="p-4 border border-slate-300 rounded-lg bg-slate-50 focus-within:ring-2 focus-within:ring-[#1e74d2]">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#32325d',
                        fontFamily: 'Arial, sans-serif',
                        '::placeholder': {
                          color: '#aab7c4',
                        },
                      },
                      invalid: {
                        color: '#fa755a',
                      },
                    },
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex cursor-pointer items-center justify-center gap-3 px-6 py-4 bg-[#1e74d2] text-white font-bold rounded-lg shadow-lg hover:bg-[#1e74d299] transition disabled:bg-slate-400 disabled:cursor-not-allowed"
              disabled={!stripe || !clientSecret || processing}
            >
              {processing ? (
                <>
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                  Processing...
                </>
              ) : (
                `Pay $${registration?.camp_fee || 0}`
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PayForRegistration;
