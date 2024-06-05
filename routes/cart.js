const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware');
const Product = require('../models/Product');
const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const MAX_TRANSACTION_AMOUNT = 30000 * 100; // ₹30,000 in paise

router.get('/user/cart', isLoggedIn, async (req, res) => {
    const user = await User.findById(req.user._id).populate('cart');
    const totalAmount = user.cart.reduce((sum, curr) => sum + curr.price, 0);
    const productInfo = user.cart.map((p) => p.desc).join(',');

    // Check if total amount exceeds the limit
    if (totalAmount > MAX_TRANSACTION_AMOUNT) {
        return res.render('cart/error', { message: 'The total amount exceeds the allowed limit of ₹30,000.' });
    }

    // Create a Stripe session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: user.cart.map((item) => ({
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

    res.render('cart/cart', { user, totalAmount, productInfo, sessionId: session.id, STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY });
});

router.post('/user/:productId/add', isLoggedIn, async (req, res) => {
    let { productId } = req.params;
    let userId = req.user._id;
    let product = await Product.findById(productId);
    let user = await User.findById(userId);
    user.cart.push(product);
    await user.save();
    res.redirect('/user/cart');
});

router.post('/user/:productId/delete', isLoggedIn, async (req, res) => {
    let { productId } = req.params;
    let userId = req.user._id;
    let user = await User.findById(userId);

    user.cart = user.cart.filter(product => product.toString() !== productId);

    await user.save();
    res.redirect('/user/cart');
});

module.exports = router;
