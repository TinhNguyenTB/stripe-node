require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
app.set('view engine', 'ejs');

app.get("/", (req, res) => {
    res.render('index.ejs')
})

app.post("/checkout", async (req, res) => {
    const session = await stripe.checkout.sessions.create({
        success_url: `http://localhost:8081/complete?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: 'http://localhost:8081/cancel',
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Death note',

                    },
                    unit_amount: 100 * 100
                },
                quantity: 1
            },
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Die with a smile',

                    },
                    unit_amount: 50 * 100
                },
                quantity: 1
            },
        ],
        mode: 'payment',
        // shipping_address_collection: {
        //     allowed_countries: ["US", "VN"]
        // }
    })
    res.redirect(session.url)
    // console.log("session:", session)
    // console.log("url:", session.url)
})

app.get('/complete', async (req, res) => {
    const result = Promise.all([
        stripe.checkout.sessions.retrieve(req.query.session_id, { expand: ['payment_intent.payment_method'] }),
        stripe.checkout.sessions.listLineItems(req.query.session_id)
    ])

    console.log(JSON.stringify(await result))
    res.send("Your payment was successful")
})

app.get('/cancel', (req, res) => {
    res.redirect("/")
})

const port = 8081
app.listen(port, () => {
    console.log(`Server started on port ${port}`)
})