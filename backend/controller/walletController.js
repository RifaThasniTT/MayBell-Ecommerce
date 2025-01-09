const walletSchema = require('../model/walletModel');
const HTTP_STATUS = require('../utils/httpStatusCodes');

const getWallet = async (req, res) => {
    try {
        const userId = req.user.id;

        const wallet = await walletSchema.findOne({ userId });

        if (!wallet) {
            return res.status(HTTP_STATUS.OK).json({
                message: 'Wallet fetched!',
                wallet: {
                    balance: 0,
                    transactions: [],
                }
            });
        }

        const sortedTransactions = wallet.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        return res.status(HTTP_STATUS.OK).json({
            message: 'Wallet fetched successfully!',
            wallet: {
                balance: wallet.balance,
                transactions: sortedTransactions
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            message: 'Server error',
            error
        });
    }
};

module.exports = {
    getWallet,
}