'use client'

const CheckoutButton = () => {

    const handleCheckout = async () => {

        const response = await fetch(
            'http://localhost:8080/create-checkout-session',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    productName: 'Motzklist Product',
                    quantity: 1,
                    amount: 1999
                })
            }
        )

        const data = await response.json()

        window.location.href = data.url
    }

    return (
        <button onClick={handleCheckout}>
            Checkout
        </button>
    )
}

export default CheckoutButton