const calculateCartTotals = (cart) => {
    const subtotal = cart.items.reduce((sum, item) => {
        return sum + item.product.discountPrice * item.quantity;
    }, 0);

    const shipping = 100;
    const total = subtotal + shipping;

    return { subtotal, shipping, total };
}

module.exports = calculateCartTotals;