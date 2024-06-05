const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { isLoggedIn } = require('../middleware');

router.post('/payment_gateway/stripe', isLoggedIn, async (req, res) => {
    const { user } = req;
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: req.body.cart.map(item => ({
            price_data: {
                currency: 'inr',
                product_data: {
                    name: item.name,
                },
                unit_amount: item.price * 100, // Stripe uses paise
            },
            quantity: 1,
        })),
        mode: 'payment',
        success_url: 'http://localhost:5000/payment/success',
        cancel_url: 'http://localhost:5000/payment/fail',
        customer_email: user.email,
        billing_address_collection: 'required',
    });

    res.json({ id: session.id });
});

router.post('/payment/success', (req, res) => {
    res.send('Payment was successful!');
});

router.post('/payment/fail', (req, res) => {
    res.send('Payment failed. Please try again.');
});

module.exports = router;
