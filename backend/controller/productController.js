const productSchema = require('../model/productModel');
const CategorySchema = require('../model/categoryModel');
const Offer = require('../model/offerModel');
const HTTP_STATUS = require('../utils/httpStatusCodes');

const getAllProducts = async (req, res) => {
    try {
        const products = await productSchema.find().populate('category');

        return res.status(200).json({
            message: 'All products fetched.',
            products,
        })
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
};

const addProduct = async (req, res) => {
    try {
        const { name, description, price, category, brand, stock } = req.body;
        

        if (!name || !description || !price || !category || !brand || !stock || !req.files) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'All fields are required, including images.' });
        }

        const existingProduct = await productSchema.findOne({
            name: { $regex: `^${name}$`, $options: 'i' } 
        });

        if (existingProduct) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Product with this name already exists!' });
        }

        const imageUrls = req.files.map((file) => file.path);

        const newProduct = new productSchema({
            name,
            description,
            price,
            category,
            brand,
            stock,
            images: imageUrls,
        });

        await newProduct.save();

        return res.status(HTTP_STATUS.CREATED).json({
            message: 'Product added successfully!',
            product: newProduct
        });
    } catch (error) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Sever error', error });
    }
};

const toggleStatus = async (req, res) => {
    try {
        const productId = req.params.productId;
    
        
        const product = await productSchema.findById(productId);
          
        if (!product) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Product not found!' });
        }

        product.isListed = !product.isListed;

        await product.save();

        return res.status(HTTP_STATUS.OK).json({
            message: `Product ${product.isListed ? 'listed' : 'unlisted'} successfully`,
            product,
        })
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
};

const singleProduct = async (req, res) => {
    const { productId } = req.params;

    try {
        const product = await productSchema.findById(productId).populate('category');

        if (!product) {
            return res.status(404).json({ message: 'Product not found!' });
        }

        return res.status(200).json({ product });
    } catch (error) {
        return res.status(500).json({ message:'Server error', error });
    }
};

const editProduct = async (req, res) => {
    try {
        const productId = req.params.productId;
        const { name, description, price, stock, category, brand, existingImages } = req.body;

        const product = await productSchema.findById(productId);

        if (!product) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Product not found!'});
        }

        if (!name || !description || !price || !category || !brand || !stock) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'All fields are required!' });
        }

        const existingProduct = await productSchema.findOne({
            _id: { $ne: productId },
            name: { $regex: `^${name}$`, $options: 'i' },
        });

        if (existingProduct) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Product with this name already exists!' });
        }

        product.name = name;
        product.description = description;
        product.price = price;
        product.category = category;
        product.brand = brand;
        product.stock = stock;

        // if (req.files && req.files.length > 0) {
        //     const imageUrls = req.files.map((file) => file.path);
        //     product.images = imageUrls;
        // }

        const imageUrls = req.files?.map((file) => file.path) || [];
        if (existingImages) {
            const parsedExistingImages = Array.isArray(existingImages) ? existingImages : [existingImages];
            product.images = [...parsedExistingImages, ...imageUrls];
        } else {
            product.images = imageUrls;
        }
        
        await product.save();

        return res.status(HTTP_STATUS.OK).json({
            message: 'Product updated successfully!',
            product,
        })

    } catch (error) {
        console.error(error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error });
    }
};

const getProductsForUser = async (req, res) => {
    const { categories, sort, search } = req.query;

    let query = { isListed: true };

    if (categories && categories !== 'All') {
        const categoryArray = categories.split(',');
        query.category = { $in: categoryArray };
    }

    if (search) {
        query.name = { $regex: search, $options: 'i' };
    }

    let sortQuery = {};
    if (sort === 'price-asc') sortQuery.price = 1;
    if (sort === 'price-desc') sortQuery.price = -1;
    if (sort === 'new-arrivals') sortQuery.createdAt = -1;
    if (sort === 'popularity') sortQuery.popularity = -1;
    if (sort === 'a-z') sortQuery.name = 1;
    if (sort === 'z-a') sortQuery.name = 1;

    try {
        const products = await productSchema.find(query).sort(sortQuery).populate('category');

        const currentDate = new Date();

        const offers = await Offer.find({
            isActive: true,
            endDate: { $gt: currentDate },
        });

        for (let product of products) {
            let applicableOffers = [];

            applicableOffers = offers.filter((offer) =>
                (offer.type === 'product' && offer.applicableProducts.some((p) => p.equals(product._id))) ||
                (offer.type === 'category' && offer.applicableCategories.some((c) => c.equals(product.category._id)))
            );

            if (applicableOffers.length > 0) {
                const bestOffer = applicableOffers.sort((a, b) => b.discountPercentage - a.discountPercentage)[0];

                const discount = parseInt((product.price * bestOffer.discountPercentage) / 100);
                
                product.discountPrice = Math.max(product.price - discount, 0);
            } else {
                product.discountPrice = product.price;
            }

            await product.save();
        }

        return res.status(HTTP_STATUS.OK).json({
            message: 'Filtered products for user fetched successfully!',
            products,
        });
    } catch (error) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error });
    }
};

const getLatestArrivals = async (req, res) => {
    try {
        const latestProducts = await productSchema.aggregate([
            { $sort: { createdAt: -1 } },
            { $limit: 4 } 
        ]);

        return res.status(HTTP_STATUS.OK).json({ message: 'New Arrivals fetched!', latestProducts });
    } catch (error) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error });
    }
}

module.exports = {
    getAllProducts,
    addProduct,
    toggleStatus,
    singleProduct,
    editProduct,
    getProductsForUser,
    getLatestArrivals,
}