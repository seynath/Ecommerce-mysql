const express = require('express');
const router = express.Router();
const {createProduct, getProduct, getAllProducts,updateProduct, deleteProduct, addToWishlist, rating} = require('../controllers/productCtrl');
const {authMiddleware, isAdmin} = require('../middlewares/authMiddleware');
const {productImgResize,uploadPhoto} = require('../middlewares/uploadImage');

//mewye piliwela waradunath a kiyanne isAdmin ekata kalin auth aawath error ekak enawa 

router.post('/', authMiddleware, isAdmin, uploadPhoto.array("images", 10), productImgResize, createProduct);
// router.post('/',authMiddleware, isAdmin, createProduct);
// router.put("/upload", authMiddleware, isAdmin, uploadPhoto.array("images",10),productImgResize,uploadImages);
router.get('/:id', getProduct);
router.put("/wishlist", authMiddleware, addToWishlist);
router.put("/rating", authMiddleware, rating);
router.get('/', getAllProducts );
router.put('/:id',authMiddleware,isAdmin, updateProduct);
router.delete('/:id',authMiddleware,isAdmin, deleteProduct);
router.delete('/delete-img/:id',authMiddleware,isAdmin);


module.exports = router;
