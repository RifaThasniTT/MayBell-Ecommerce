const addressSchema = require('../model/addressModel');
const HTTP_STATUS = require('../utils/httpStatusCodes');

const getAddress = async (req, res) => {
    try {
        const userId = req.user.id;

        const addresses = await addressSchema.find({ user: userId }).sort({ isDefault: -1 });

        if (!addresses.length) {
            return res.status(HTTP_STATUS.OK).json({ message: 'No addresses found!' , addresses: [] });
        }

        return res.status(HTTP_STATUS.OK).json({ message: 'Addresses of the user fetched successfully!', addresses });
    } catch (error) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error });
    }
};

const addAddress = async (req, res) => {
    try {
        const { name, phone, street, city, state, country, zipCode, isDefault } = req.body;
        const userId = req.user.id;

        if (!name.trim() || !phone.trim() || !street.trim() || !city.trim() || !state.trim() || !country.trim() || !zipCode.trim() ) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'All fields are required!' });
        }

        if (isDefault) {
            await addressSchema.updateMany({ user: userId}, { isDefault: false });
        }

        const newAddress = new addressSchema({
            user: userId,
            name,
            phone,
            street,
            city,
            state,
            country,
            zipCode,
            isDefault: isDefault || false,
        });

        await newAddress.save();

        return res.status(HTTP_STATUS.CREATED).json({ message: 'Address added successfully!' , address: newAddress });
    } catch (error) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error });
    };
};

const editAddress = async (req, res) => {
    try {
        const addressId = req.params.addressId;
        const { name, phone, street, city, state, country, zipCode, isDefault } = req.body;

        const address = await addressSchema.findById(addressId);

        if (!address) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Address not found!' });
        }

        if (!name.trim() || !phone.trim() || !street.trim() || !city.trim() || !state.trim() || !country.trim() || !zipCode.trim() ) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'All fields are required!' });
        }

        address.name = name;
        address.street = street;
        address.phone = phone;
        address.city = city;
        address.state = state;
        address.country = country;
        address.zipCode = zipCode;

        await address.save();

        return res.status(HTTP_STATUS.OK).json({ message: 'Address updated successfully!', address });

    } catch (error) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error });
    }
};

const deleteAddress = async (req, res) => {
    try {
        const addressId = req.params.addressId;

        await addressSchema.findByIdAndDelete(addressId);

        return res.status(HTTP_STATUS.OK).json({ message: 'Address deleted successfully!'});
    } catch (error) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error });
    }
}

module.exports = {
    addAddress,
    getAddress,
    editAddress,
    deleteAddress,
}