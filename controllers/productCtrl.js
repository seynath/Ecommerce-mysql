// // const User = require("../models/userModel");
// // const Product = require("../models/productModel");
// const asyncHandler = require("express-async-handler");
// const slugify = require("slugify");
// const validateMongoDBId = require("../utils/validateMongodbid");
// const {
//   cloudinaryUploadImg,
//   cloudinaryDeleteImg,
// } = require("../utils/cloudinary");
// const fs = require("fs");

// const checkConnection = (connection) => {
//   return new Promise((resolve, reject) => {
//     connection.query("SELECT 1", (err) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve();
//       }
//     });
//   });
// };

const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const validateMongoDBId = require("../utils/validateMongodbid");
const { cloudinaryUploadImg, cloudinaryDeleteImg } = require("../utils/cloudinary");
const fs = require("fs");
const { pool } = require('../config/db'); // adjust the path according to your project structure
// const createProduct = asyncHandler(async (req, res) => {
//   try {
//     const { title, description, brand, quantity, price } = req.body;
//     const slug = req.body.title ? slugify(req.body.title) : "";

//     // Insert product into the database
//     const connection = await pool.getConnection();
//     const sql = `INSERT INTO product (p_title, p_slug, p_description, brand, quantity, price) VALUES (?, ?, ?, ?, ?, ?)`;
//     const [result] = await connection.execute(sql, [title, slug, description, brand, quantity, price]);
//     const productId = result.insertId;

//     // Upload images and insert image details into the database
//     console.log(result)
//     const uploader = (path) => cloudinaryUploadImg(path, 'images');
//     const urls = [];
//     const files = req.files;
//     for (const file of files) {
//       const { path } = file;
//       const newPath = await uploader(path);
//       urls.push(newPath);
//       fs.unlinkSync(path);

//       const imageSql = 'INSERT INTO image ( image_link, product_id,  asset_id, public_id) VALUES (?, ?, ?, ?)';
//       await connection.execute(imageSql, [ newPath.url, productId, newPath.asset_id, newPath.public_id]);
//     }

//     connection.release();

//     res.json({ message: "Product created successfully", productId, urls });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Failed to create product" });
//   }
// });

const createProduct = asyncHandler(async (req, res) => {
  try {
    // console.log(req.files)
    let  data = JSON.parse(req.body.data)
    console.log(data)
    const { title, description, brand, quantity, price } = data;
    const slug = req.body.title ? slugify(req.body.title) : "";

    // console.log({ title, description, brand, quantity, price, files: req.files });

    // Insert product into the database
    const connection = await pool.getConnection();
    const sql = `INSERT INTO product (p_title, p_slug, p_description, brand, quantity, price) VALUES (?, ?, ?, ?, ?, ?)`;
    const [result] = await connection.execute(sql, [title, slug, description, brand, quantity, price]);
    const productId = result.insertId;

    // Upload images and insert image details into the database
    // console.log(result)
    const uploader = (path) => cloudinaryUploadImg(path, 'images');
    const urls = [];
    const files = req.files;
    for (const file of files) {
      const { path } = file;
      const newPath = await uploader(path);
      urls.push(newPath);
      // fs.unlinkSync(path);

      const imageSql = 'INSERT INTO image ( image_link, product_id,  asset_id, public_id) VALUES (?, ?, ?, ?)';
      await connection.execute(imageSql, [ newPath.url, productId, newPath.asset_id, newPath.public_id]);
    }

    connection.release();

    res.json({ message: "Product created successfully", productId, urls });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to create product" });
  }
});


// const createProduct = asyncHandler(async (req, res) => {
//   try {
//     const { title, description, brand, quantity, price } = req.body;
    
//     const slug = req.body.title ? slugify(req.body.title) : "";
//     const connection = await pool.getConnection();
//     const sql = `INSERT INTO product (p_title, p_slug, p_description, brand, quantity, price) VALUES (?, ?, ?, ?, ?, ?)`;
//     const [result] = await connection.execute(sql, [title, slug, description, brand, quantity, price]);

    
//     connection.release();

//     res.json({ message: "Product created successfully" });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Failed to create product" });
//   }
// });




// const createProduct = asyncHandler(async (req, res) => {
//   try {
//     const { title, description, brand, quantity, price } = req.body;

//     // Generate slug if title exists
//     const slug = req.body.title ? slugify(req.body.title) : "";

//     // Connect to MySQL database
//     const connection = req.connection;

//     // Check if connection is established
//     await checkConnection(connection);

//     // Insert the new product into the database
//     const sql = `INSERT INTO product (p_title, p_slug, p_description, brand, quantity, price) 
//                  VALUES (?, ?, ?, ?, ?, ?)`;
//     await connection
//       .promise()
//       .query(sql, [title, slug, description, brand, quantity, price]);

//     res.json({ message: "Product created successfully" });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Failed to create product" });
//   }
// });

// const createProduct = asyncHandler(async (req, res) => {
//   try {

//     if (req.body.title){
//       req.body.slug = slugify(req.body.title);
//     }

//     const newProduct = await Product.create(req.body);
//     res.json(newProduct);
//   }
//   catch (error) {
//     console.log(error);
//   }});

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, brand, quantity, price } = req.body;

  try {
    // Generate slug if title exists
    const slug = title ? slugify(title) : "";

    // Connect to MySQL database
    const connection = req.connection;

    // Check if connection is established
    await checkConnection(connection);

    // Construct the SQL query
    const sql = `UPDATE product 
                 SET p_title = ?, p_slug = ?, p_description = ?, brand = ?, quantity = ?, price = ?
                 WHERE p_id = ?`;

    // Execute the SQL query
    await connection
      .promise()
      .query(sql, [title, slug, description, brand, quantity, price, id]);

    // Fetch the updated product
    const updatedProduct = await new Promise((resolve, reject) => {
      connection.query(
        "SELECT * FROM product WHERE p_id = ?",
        [id],
        (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results[0]);
          }
        }
      );
    });

    res.json(updatedProduct);
  } catch (error) {
    throw new Error(error);
  }
});

// const updateProduct = asyncHandler(async (req, res) => {
//   const {id} = req.params;
//   try{
//     if(req.body.title){
//       req.body.slug = slugify(req.body.title);
//     }
//     const updateProduct = await Product.findOneAndUpdate({ _id: id}, req.body, { new: true });

//     res.json(updateProduct);
//   }
//   catch(error){
//    throw new Error(error);
//   }
// });

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    // Connect to MySQL database
    const connection = req.connection;

    // Check if connection is established
    await checkConnection(connection);

    // Execute the SQL DELETE query
    const sql = "DELETE FROM product WHERE p_id = ?";
    await connection.promise().query(sql, [id]);

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    throw new Error(error);
  }
});

// const deleteProduct = asyncHandler(async (req, res) => {
//   const {id} = req.params;
//   try{
//     const deleteProduct = await Product.findByIdAndDelete(id);
//     res.json(deleteProduct);
//   }
//   catch(error){
//     throw new Error(error);
//   }
// });

const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    // Connect to MySQL database
    const connection = req.connection;

    // Check if connection is established
    await checkConnection(connection);

    // Execute the SQL SELECT query
    const [rows] = await connection
      .promise()
      .query("SELECT * FROM product WHERE p_id = ?", [id]);

    // If product is found, send it in the response
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    throw new Error(error);
  }
});

// const getProduct = asyncHandler(async (req, res) => {
//   const {id} = req.params;
//   try {
//     const findproduct = await Product.findById(id);
//     res.json(findproduct);
//   }
//   catch (error) {
//     console.log(error);
//   }});

// const getAllProducts = asyncHandler (async (req,res) =>{
//   try{
//     const getAllProducts = await Product.find();
//     res.json(getAllProducts);
//   }
//   catch(error){
//     throw new Error(error)
//   }
// })


const getAllProducts = async (req, res) => {
  try {
    // Get a MySQL connection from the pool
    const connection = await pool.getConnection();

    // Execute a SELECT query to fetch all users
    const [rows] = await connection.execute("SELECT * FROM product");
      if(rows.length === 0){
        connection.release();
        return res.status(404).json({ message: "No Products Found" });}
    connection.release();

    // Send the fetched users in the response
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// const getAllProducts = asyncHandler(async (req, res) => {
//   try {
//     // Build the base query
//     let query = 'SELECT * FROM product';

//     // Filtering
//     const { page = 1, limit = 2, sort, fields, ...filters } = req.query;
//     const filterParams = Object.entries(filters)
//       .map(([key, value]) => `${key}='${value}'`)
//       .join(' AND ');
//     if (filterParams) {
//       query += ` WHERE ${filterParams}`;
//     }

//     // Sorting
//     if (sort) {
//       query += ` ORDER BY ${sort.split(',').join(', ')}`;
//     } else {
//       query += ' ORDER BY created_at DESC';
//     }

//     // Limiting the fields
//     if (fields) {
//       query = query.replace('*', fields.split(',').join(', '));
//     }

//     // Pagination
//     const offset = (page - 1) * limit;
//     query += ` LIMIT ${limit} OFFSET ${offset}`;

//     // Execute the query
//     const [products] = await pool.query(query);

//     // Response
//     res.json(products);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// });


// const getAllProducts = asyncHandler(async (req, res) => {
//   try {
//     // Filtering
//     const queryObj = { ...req.query };
//     const excludeFields = ["page", "sort", "limit", "fields"];
//     excludeFields.forEach((el) => delete queryObj[el]);
//     let queryStr = JSON.stringify(queryObj);
//     queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

//     let query = Product.find(JSON.parse(queryStr));

//     // Sorting

//     if (req.query.sort) {
//       const sortBy = req.query.sort.split(",").join(" ");
//       query = query.sort(sortBy);
//     } else {
//       query = query.sort("-createdAt");
//     }

//     // limiting the fields

//     if (req.query.fields) {
//       const fields = req.query.fields.split(",").join(" ");
//       query = query.select(fields);
//     } else {
//       query = query.select("-__v");
//     }

//     // pagination

//     const page = req.query.page;
//     const limit = req.query.limit;
//     const skip = (page - 1) * limit;
//     query = query.skip(skip).limit(limit);
//     if (req.query.page) {
//       const productCount = await Product.countDocuments();
//       if (skip >= productCount) throw new Error("This Page does not exists");
//     }
//     const product = await query;
//     res.json(product);
//   } catch (error) {
//     throw new Error(error);
//   }
// });

const addToWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { prodId } = req.body;
  // const  _id = 13;
  try {
    // Connect to MySQL database
    const connection = req.connection;

    // Check if connection is established
    await checkConnection(connection);

    // Check if the user has already added the product to their wishlist
    const [existingWishlist] = await connection
      .promise()
      .query("SELECT * FROM wishlist WHERE user_id = ? AND product_id = ?", [
        _id,
        prodId,
      ]);

    if (existingWishlist.length > 0) {
      // If the product is already in the wishlist, remove it
      await connection
        .promise()
        .query("DELETE FROM wishlist WHERE user_id = ? AND product_id = ?", [
          _id,
          prodId,
        ]);
      res.json({ message: "Product removed from wishlist" });
    } else {
      // If the product is not in the wishlist, add it
      await connection
        .promise()
        .query("INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)", [
          _id,
          prodId,
        ]);
      res.json({ message: "Product added to wishlist" });
    }
  } catch (error) {
    throw new Error(error);
  }
});

// const addToWishlist = asyncHandler(async (req, res) => {
//   const { _id } = req.user;
//   const { prodId } = req.body;
//   try {
//     const user = await User.findById(_id);
//     const alreadyadded = user.wishlist.find((id) => id.toString() === prodId);
//     if (alreadyadded) {
//       let user = await User.findByIdAndUpdate(
//         _id,
//         {
//           $pull: { wishlist: prodId },
//         },
//         {
//           new: true,
//         }
//       );
//       res.json(user);
//     } else {
//       let user = await User.findByIdAndUpdate(
//         _id,
//         {
//           $push: { wishlist: prodId },
//         },
//         {
//           new: true,
//         }
//       );
//       res.json(user);
//     }
//   } catch (error) {
//     throw new Error(error);
//   }
// });


const rating = async (req, res) => {
  // const { _id } = req.user;
  const { star, prodId, comment } = req.body;
  const _id = 12;
  try {

      // Connect to MySQL database
      const connection = req.connection;
      await checkConnection(connection);

      // Check if the user has already rated the product
      const checkRatingQuery = `
          SELECT *
          FROM ratings
          WHERE user_id = ? AND product_id = ?
      `;
      const [ratingRows] = await connection.promise().query(checkRatingQuery, [_id, prodId]);
      const alreadyRated = ratingRows.length > 0;

      if (alreadyRated) {
          // Update existing rating
          const updateRatingQuery = `
              UPDATE ratings
              SET star = ?, comment = ?
              WHERE user_id = ? AND product_id = ?
          `;
          await connection.promise().query(updateRatingQuery, [star, comment, _id, prodId]);
      } else {
          // Add new rating
          const addRatingQuery = `
              INSERT INTO ratings (user_id, product_id, star, comment)
              VALUES (?, ?, ?, ?)
          `;
          await connection.promise().query(addRatingQuery, [_id, prodId, star, comment]);
      }

      // Calculate total rating and update product
      const calculateRatingQuery = `
          SELECT AVG(star) AS total_rating
          FROM ratings
          WHERE product_id = ?
      `;
      const [averageRatingRows] = await connection.promise().query(calculateRatingQuery, [prodId]);
      console.log("Average Rating Rows:", averageRatingRows);
      const totalRating = averageRatingRows[0].total_rating;
      console.log("Total Rating:", totalRating);

      const updateTotalRatingQuery = `
          UPDATE product
          SET total_rating = ?
          WHERE p_id = ?
      `;
      const [updateResult] = await connection.promise().query(updateTotalRatingQuery, [totalRating, prodId]);
      // console.log("Update Result:", updateResult);

      // Fetch and return updated product
      const getProductQuery = `
          SELECT *
          FROM product
          WHERE p_id = ?
      `;
      const [productRows] = await connection.promise().query(getProductQuery, [prodId]);
      const updatedProduct = productRows[0];

      res.json(updatedProduct);
  } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Failed to rate product" });
  }
};


// const rating = asyncHandler(async (req, res) => {
//   const { _id } = req.user;
//   const { star, prodId, comment } = req.body;
//   try {
//     const product = await Product.findById(prodId);
//     let alreadyRated = product.ratings.find(
//       (userId) => userId.postedby.toString() === _id.toString()
//     );

//     if (alreadyRated) {
//       const updateRating = await Product.updateOne(
//         {
//           ratings: { $elemMatch: alreadyRated },
//         },
//         {
//           $set: { "ratings.$.star": star, "ratings.$.comment": comment },
//         },
//         {
//           new: true,
//         }
//       );
//     } else {
//       const rateProduct = await Product.findByIdAndUpdate(
//         prodId,
//         {
//           $push: {
//             ratings: {
//               star: star,
//               comment: comment,
//               postedby: _id,
//             },
//           },
//         },
//         {
//           new: true,
//         }
//       );
//     }
//     const getallratings = await Product.findById(prodId);
//     let totalRating = getallratings.ratings.length;
//     let ratingsum = getallratings.ratings
//       .map((item) => item.star)
//       .reduce((prev, curr) => prev + curr, 0);
//     let actualRating = Math.round(ratingsum / totalRating);
//     let finalproduct = await Product.findByIdAndUpdate(
//       prodId,
//       {
//         totalrating: actualRating,
//       },
//       { new: true }
//     );
//     res.json(finalproduct);
//   } catch (error) {
//     throw new Error(error);
//   }
// });

// const uploadImages = asyncHandler(async (req, res) => {

//   const { id } = req.params;
//   validateMongoDBId(id);

//   try{
//     const uploader = (path) => cloudinaryUploadImg(path, 'images');
//     const urls = [];
//     const files = req.files;
//     for (const file of files) {
//       const { path } = file;
//       const newPath = await uploader(path);
//       urls.push(newPath);
//       fs.unlinkSync(path);
//     }
//     const findProduct = await Product.findByIdAndUpdate(id,
//     {
//       images: urls.map(file=>{return file;}),
//     },
//     {new:true});
//     res.json(findProduct);
//   }
//   catch(error){
//     console.log(error);
//     throw new Error(error);
//   }

// });


const uploadImages = asyncHandler(async (req, res) => {

       

  try{
    const uploader = (path) => cloudinaryUploadImg(path, 'images');
    const urls = [];
    const files = req.files;
    for (const file of files) {
      const { path } = file;
      const newPath = await uploader(path);
      urls.push(newPath);
      fs.unlinkSync(path);
    }

    const images = urls.map(file=>{return file;})

    res.json(images);
  }
  catch(error){
    console.log(error);
    throw new Error(error);
  }

   
});

const deleteImages = asyncHandler(async (req, res) => {
  const {id} = req.params;
  try{
    const deleted = cloudinaryDeleteImg(id, 'images');
    res.json({message:"Deleted Successfully"});
  }
  catch(error){
    throw new Error(error);
  }
});

module.exports = {createProduct, getProduct, getAllProducts,updateProduct,deleteProduct, addToWishlist, rating, uploadImages, deleteImages};