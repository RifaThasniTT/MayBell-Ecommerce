const CategorySchema = require('../model/categoryModel');
const productSchema = require('../model/productModel');

const addCategory = async (req, res) => {
    try {
        const category = req.body;

        const existing = await CategorySchema.findOne({ name: { $regex: `^${category.name}$`, $options: 'i' } });
        if (existing) {
            return res.status(400).json({ message: 'Category already exists!' });
        }

        const newCategory = new CategorySchema(category);
        await newCategory.save();

        return res.status(201).json({
            message: 'New category added',
            newCategory,
        })
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
};

const getCategories = async (req, res) => {
    try {
        const categories = await CategorySchema.find();

        return res.status(200).json({
            message: 'All categories fetch success!',
            categories,
        })
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
};

const toggleStatus = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;

        const category = await CategorySchema.findById(categoryId);

        if (!category) {
            return res.status(404).json({ message: 'Category not found!' });
        }

        category.isListed = !category.isListed;

        await category.save();

        await productSchema.updateMany(
            {category: categoryId},
            {isListed: category.isListed}
        );

        return res.status(200).json({
            message: `Category ${category.isListed ? 'listed' : 'unlisted'} successfully`,
            category,
        })
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
};

const editCategory = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;

        const existing = await CategorySchema.findOne({
            _id: { $ne: categoryId },
            name: { $regex: `^${req.body.name}$`, $options: 'i' },
        })

        if (existing) {
            return res.status(400).json({ message: 'Category name already exists' });
        }

        const updatedCategory = await CategorySchema.findByIdAndUpdate(
            categoryId,
            req.body,
            { new: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ message: 'Category not found!' });
        }

        return res.status(200).json({
            message: 'Category details updated successfully!',
            updatedCategory
        })
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
}

module.exports = {
    addCategory,
    getCategories,
    toggleStatus,
    editCategory
}