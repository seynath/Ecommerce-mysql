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
const {
  cloudinaryUploadImg,
  cloudinaryDeleteImg,
} = require("../utils/cloudinary");
const fs = require("fs");
const { pool } = require("../config/db"); // adjust the path according to your project structure
const { createCanvas } = require("canvas");
const Barcode = require("jsbarcode");
const barcode = require("canvas-barcode");

const createProduct = asyncHandler(async (req, res) => {
  try {
    const { title, description, brand, category, attributes } = req.body;

    console.log(title, description, brand, category);

    console.log(attributes);

    console.log("before attributes");

    const parsedAttributes = JSON.parse(attributes);

    // let lowestPrice = Number.MAX_SAFE_INTEGER;
    // if (parsedAttributes && parsedAttributes.length > 0) {
    //   lowestPrice = Math.min(...parsedAttributes.map(attr => attr.price));
    // }

    let lowestPrice = Infinity;
    if (parsedAttributes && parsedAttributes.length > 0) {
      lowestPrice = Math.min(
        ...parsedAttributes.map((attr) => parseFloat(attr.price))
      );
    }

    const slug = title ? slugify(title) : "";

    // Insert product into the database
    const connection = await pool.getConnection();

    const sql = `INSERT INTO product (p_title, p_slug, p_description, brand, category_id, price) VALUES (?, ?, ?, ?, ?, ?)`;
    const [result] = await connection.execute(sql, [
      title,
      slug,
      description,
      brand,
      category,
      lowestPrice,
    ]);
    const productId = result.insertId;
    console.log(productId);

    if (parsedAttributes && parsedAttributes.length > 0) {
      parsedAttributes.forEach(async (attribute, index) => {
        console.log(`Attribute ${index + 1}:`);
        console.log(`Size: ${attribute.size}`);
        console.log(`Color: ${attribute.color}`);
        console.log(`Quantity: ${attribute.quantity}`);
        console.log(`Price: ${attribute.price}`);

        barcodeValue = `${productId}-${attribute.color}-${attribute.size}`;

        console.log(barcodeValue);
        

        const attributesSql = `INSERT INTO size_color_quantity (product_id, size_id, color_code, quantity, unit_price, barcode) VALUES (?, ?, ?, ?, ?, ?)`;
        const [resultsAttributes] = await connection.execute(attributesSql, [
          productId,
          attribute.size,
          attribute.color,
          attribute.quantity,
          attribute.price,
          barcodeValue
        ]);

        console.log(resultsAttributes);
      });
    }

    const uploader = (path) => cloudinaryUploadImg(path, "images");
    const urls = [];
    const files = req.files;
    // console.log(files);
    for (let i = 0; i < files.length; i++) {
      const { path } = files[i];
      const newPath = await uploader(path);
      urls.push(newPath);

      const imageSql =
        "INSERT INTO image ( image_link, product_id,  asset_id, public_id) VALUES (?, ?, ?, ?)";
      const [addedImage] = await connection.execute(imageSql, [
        newPath.url,
        productId,
        newPath.asset_id,
        newPath.public_id,
      ]);
    }

    connection.release();

    res.json({ message: "Product created successfully", productId, urls });
  } catch (err) {
    res.status(500).json({ message: "Failed to create product" });
  }
});

const AAAcreateProduct = asyncHandler(async (req, res) => {
  try {
    console.log(req.body);
    const {
      title,
      description,
      brand,
      price,
      category,
      color,
      size,
      quantity,
      attributes,
    } = req.body;
    const userID = req.user;
    console.log({ Userrrrrr: userID });
    const slug = req.body.title ? slugify(req.body.title) : "";
    // console.log({ title, description, brand, quantity, price, category, size });

    // Insert product into the database
    const connection = await pool.getConnection();

    const sql = `INSERT INTO product (p_title, p_slug, p_description, brand, quantity, price, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await connection.execute(sql, [
      title,
      slug,
      description,
      brand,
      quantity,
      price,
      category,
    ]);
    const productId = result.insertId;

    // Insert color into the database
    const colorArray = JSON.parse(color); // Convert color to array
    // console.log(colorArray);
    for (let i = 0; i < colorArray.length; i++) {
      // const colorNameFind = `SELECT col_name FROM color WHERE col_code = ?`;
      // const [colorName] = await connection.execute(colorNameFind, [colorArray[i]]);

      // const colorSql = `INSERT INTO color (col_name, product_id) VALUES (?, ?)`;
      // const colordone = await connection.execute(colorSql, [colorName[0].col_name, productId]);
      const colorSql = `INSERT INTO color_product (color_code, product_id) VALUES (?, ?)`;
      const colordone = await connection.execute(colorSql, [
        colorArray[i],
        productId,
      ]);
    }

    const sizeArray = JSON.parse(size);
    if (sizeArray.length > 0) {
      for (let i = 0; i < sizeArray.length; i++) {
        const sizeSql = `INSERT INTO size_product (size_id, product_id) VALUES (?, ?)`;
        const sizedone = await connection.execute(sizeSql, [
          sizeArray[i],
          productId,
        ]);
      }
      // Insert color into the database
      // const colorArray = JSON.parse(color); // Convert color to array
      // console.log (colorArray);
      // for (let i = 0; i < colorArray.length; i++) {
      //   const colorSql = `INSERT INTO color (col_name, product_id) VALUES (?, ?)`;
      //   const colorNameFind = `SELECT col_name FROM color WHERE col_code = ?`;
      //   const colorName = await connection.execute(colorNameFind, [colorArray[i]]);

      //   const colordone = await connection.execute(colorSql, [colorName, productId]);
      // }

      // Upload images and insert image details into the database

      const uploader = (path) => cloudinaryUploadImg(path, "images");
      const urls = [];
      const files = req.files;
      // console.log(files);
      for (let i = 0; i < files.length; i++) {
        const { path } = files[i];
        const newPath = await uploader(path);
        urls.push(newPath);

        const imageSql =
          "INSERT INTO image ( image_link, product_id,  asset_id, public_id) VALUES (?, ?, ?, ?)";
        const [addedImage] = await connection.execute(imageSql, [
          newPath.url,
          productId,
          newPath.asset_id,
          newPath.public_id,
        ]);
      }

      connection.release();

      res.json({ message: "Product created successfully", productId, urls });
    }
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

// const getProduct = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   console.log({id})

//   try {
//     // Connect to MySQL database
//     const connection = await pool.getConnection();

//     // Execute the SQL SELECT query
// sql = "SELECT p.product * , size."
//     const [rows] = await connection.execute("SELECT * FROM product WHERE p_id = ?", [id]);

//     // If product is found, send it in the response
//     if (rows.length > 0) {
//       res.json(rows[0]);
//     } else {
//       res.status(404).json({ message: "Product not found" });
//     }
//   } catch (error) {
//     throw new Error(error);
//   }
// });

const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    // Connect to MySQL database
    const connection = await pool.getConnection();

    // Execute the SQL SELECT query
    const [rows] = await connection.execute(
      `
    SELECT 
    p.p_id,
    p.p_title,
    p.p_slug,
    p.p_description,
    p.brand,
    p.sold,
    p.price,
    p.total_rating,
    p.category_id,
    scq.*,
    i.image_link,
    s.size_name
    FROM product p 
    LEFT JOIN 
    size_color_quantity scq ON p.p_id = scq.product_id
    LEFT JOIN
    image i ON p.p_id = i.product_id
    LEFT JOIN
    size s ON scq.size_id = s.size_id

    WHERE p.p_id = ?
    `,
      [id]
    );

    if (rows.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Product not found" });
    }
    console.log(rows);

    const product = {
      ...rows[0],
      images: [],
      size_color_quantity: [],
    };

    rows.forEach((row) => {
      // Add images to the product
      if (!product.images.find((img) => img.image_link === row.image_link)) {
        product.images.push({ image_link: row.image_link });
      }

      // Add size_color_quantity to the product
      const scqIndex = product.size_color_quantity.findIndex(
        (scq) => scq.size_color_quantity_id === row.size_color_quantity_id
      );

      if (scqIndex === -1) {
        product.size_color_quantity.push({
          size_color_quantity_id: row.size_color_quantity_id,
          product_id: row.product_id,
          size_id: row.size_id,
          size_name: row.size_name,
          color_code: row.color_code,
          quantity: row.quantity,
          unit_price: row.unit_price,
        });
      }
    });

    // console.log(product);

    connection.release();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const get1Product = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    // Connect to MySQL database
    const connection = await pool.getConnection();

    // Execute the SQL SELECT query
    const [rows] = await connection.execute(
      `
      SELECT
        p.p_id,
        p.p_title,
        p.p_slug,
        p.p_description,
        p.brand,
        p.sold,
        p.total_rating,
        p.category_id,
        i.image_link,
        cat.name,
        scq.*,
      FROM
        product p
      LEFT JOIN
        image i ON p.p_id = i.product_id
      LEFT JOIN
        category cat ON p.category_id = cat.cat_id
      LEFT JOIN
        size_color_quantity scq ON p.p_id = scq.product_id AND s.size_id = scq.size_id AND c.col_code = scq.color_code
      WHERE
        p.p_id = ?
    `,
      [id]
    );

    if (rows.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Product not found" });
    }

    const product = {
      ...rows[0],
      images: [],
      size_color_quantity: [],
    };

    rows.forEach((row) => {
      // Add images to the product
      if (!product.images.find((img) => img.image_link === row.image_link)) {
        product.images.push({ image_link: row.image_link });
      }

      // Add colors to the product

      // Add size_color_quantity to the product
      if (
        !product.size_color_quantity.find(
          (scq) => scq.size_color_quantity_id === row.size_color_quantity_id
        )
      ) {
        product.size_color_quantity.push({
          size_color_quantity_id: row.size_color_quantity_id,
          size_id: row.size_id,
          color_code: row.col_code,
          quantity: row.scq_quantity,
          price: row.scq_price,
        });
      }
    });
    console.log(product);

    connection.release();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const getAProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    // Connect to MySQL database
    const connection = await pool.getConnection();

    // Execute the SQL SELECT query
    const [rows] = await connection.execute(
      `
      SELECT
        p.*,
        i.image_link,
        c.col_code,
        c.col_name,
        s.size_id,
        s.size_name,
        cat.cat_name
      FROM
        product p
      LEFT JOIN
        image i ON p.p_id = i.product_id
      LEFT JOIN
        color_product cp ON p.p_id = cp.product_id
      LEFT JOIN
        color c ON cp.color_code = c.col_code
      LEFT JOIN
        size_product sp ON p.p_id = sp.product_id
      LEFT JOIN
        size s ON sp.size_id = s.size_id
      LEFT JOIN 
        category cat ON p.category_id = cat.cat_id
      WHERE
        p.p_id = ?
    `,
      [id]
    );

    if (rows.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Product not found" });
    }

    // console.log(rows)

    const product = rows.reduce((acc, row) => {
      const existingProductIndex = acc.findIndex((p) => p.p_id === row.p_id);

      if (existingProductIndex !== -1) {
        // If the product already exists in the accumulator, add the image, color, and size to their respective arrays
        const existingImageIndex = acc[existingProductIndex].images.findIndex(
          (i) => i.image_link === row.image_link
        );
        const existingColorIndex = acc[existingProductIndex].colors.findIndex(
          (c) => c.col_code === row.col_code
        );
        const existingSizeIndex = acc[existingProductIndex].sizes.findIndex(
          (s) => s.size_id === row.size_id
        );

        if (existingImageIndex === -1) {
          acc[existingProductIndex].images.push({
            image_link: row.image_link,
          });
        }

        if (existingColorIndex === -1) {
          acc[existingProductIndex].colors.push({
            col_code: row.col_code,
            col_name: row.col_name,
          });
        }

        if (existingSizeIndex === -1) {
          acc[existingProductIndex].sizes.push({
            size_id: row.size_id,
            size_name: row.size_name,
          });
        }
      } else {
        // If the product doesn't exist in the accumulator, create a new product object with images, colors, and sizes arrays
        acc.push({
          ...row,
          images: [
            {
              image_link: row.image_link,
            },
          ],
          colors: [
            {
              col_code: row.col_code,
              col_name: row.col_name,
            },
          ],
          sizes: [
            {
              size_id: row.size_id,
              size_name: row.size_name,
            },
          ],
        });
      }

      return acc;
    }, []);

    // Process the data to group images, colors, and sizes by product
    // const product = rows.reduce((acc, row) => {
    //   acc.images.push({
    //     image_id: row.image_id,
    //     image_link: row.image_link,
    //   });

    //   acc.colors.push({
    //     col_code: row.col_code,
    //     col_name: row.col_name
    //   });

    //   acc.sizes.push({
    //     size_id: row.size_id,
    //     size_name: row.size_name
    //   });

    //   return acc;
    // }, {
    //   ...rows[0],
    //   images: [],
    //   colors: [],
    //   sizes: [],
    // });
    //     const product = rows.reduce((acc, row) => {
    //   const existingProductIndex = acc.findIndex(p => p.p_id === row.p_id);

    //   if (existingProductIndex !== -1) {
    //     // If the product already exists in the accumulator, add the image, color, and size to their respective arrays
    //     acc[existingProductIndex].images.push({
    //       image_link: row.image_link,
    //     });

    //     acc[existingProductIndex].colors.push({
    //       col_code: row.col_code,
    //       col_name: row.col_name
    //     });

    //     acc[existingProductIndex].sizes.push({
    //       size_id: row.size_id,
    //       size_name: row.size_name
    //     });
    //   } else {
    //     // If the product doesn't exist in the accumulator, create a new product object with images, colors, and sizes arrays
    //     acc.push({
    //       ...row,
    //       images: [{
    //         image_link: row.image_link,
    //       }],
    //       colors: [{
    //         col_code: row.col_code,
    //         col_name: row.col_name
    //       }],
    //       sizes: [{
    //         size_id: row.size_id,
    //         size_name: row.size_name
    //       }]
    //     });
    //   }

    //   return acc;
    // }, []);

    connection.release();

    // Send the processed data in the response
    res.json({ product });
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

    sql = `SELECT  
    p.*,
    i.image_id,
    i.image_link,
    cat.cat_name

    FROM product p

    LEFT JOIN image i ON p.p_id = i.product_id
    LEFT JOIN category cat ON p.category_id = cat.cat_id
     `;

    // Execute a SELECT query to fetch all users
    // const [rows] = await connection.execute(
    //   "SELECT * FROM product LEFT JOIN image ON product.p_id = image.product_id");
    const [rows] = await connection.execute(sql);
    // console.log(rows);

    if (rows.length === 0) {
      connection.release();
      return res.status(404).json({ message: "No Products Found" });
    }

    // Process the data to group images by product
    const products = rows.reduce((acc, row) => {
      const existingProductIndex = acc.findIndex((p) => p.p_id === row.p_id);

      if (existingProductIndex !== -1) {
        // If the product already exists in the accumulator, add the image to its images array
        acc[existingProductIndex].images.push({
          image_id: row.image_id,
          image_link: row.image_link,
          // Add other image properties here if needed
        });
      } else {
        // If the product doesn't exist in the accumulator, create a new product object with an images array
        acc.push({
          ...row,
          images: [
            {
              image_id: row.image_id,
              image_link: row.image_link,
              // Add other image properties here if needed
            },
          ],
        });
      }

      return acc;
    }, []);
    // console.log(products)

    connection.release();

    // Send the processed data in the response
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// const getAllProducts = async (req, res) => {
//   try {
//     // Get a MySQL connection from the pool
//     const connection = await pool.getConnection();

//     // Execute a SELECT query to fetch all users
//     const [rows] = await connection.execute("SELECT * FROM product LEFT JOIN image ON product.p_id = image.product_id");

//     if (rows.length === 0) {
//       connection.release();
//       return res.status(404).json({ message: "No Products Found" });
//     }

//     // Process the data to group images by product
//     const products = rows.reduce((acc, row) => {
//       const existingProductIndex = acc.findIndex(p => p.p_id === row.p_id);

//       if (existingProductIndex !== -1) {
//         // If the product already exists in the accumulator, add the image to its images array
//         acc[existingProductIndex].images.push(row);
//       } else {
//         // If the product doesn't exist in the accumulator, create a new product object with an images array
//         acc.push({ ...row, images: [row] });
//       }

//       return acc;
//     }, []);

//     connection.release();

//     // Send the processed data in the response
//     res.json(products);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// const getAllProducts = async (req, res) => {
//   try {
//     // Get a MySQL connection from the pool
//     const connection = await pool.getConnection();

//     // Execute a SELECT query to fetch all users
//     // const [rows] = await connection.execute("SELECT * FROM product");
//     const [rows] = await connection.execute("SELECT * FROM product LEFT JOIN image ON product.p_id = image.product_id")
//     if (rows.length === 0) {
//       connection.release();
//       return res.status(404).json({ message: "No Products Found" });
//     }
//     connection.release();

//     // Send the fetched users in the response
//     res.json(rows);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

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
  const { id } = req.user;
  const { prodId } = req.body;

  // const  _id = 13;
  try {
    // Connect to MySQL database
    const connection = await pool.getConnection();

    // Check if the user has already added the product to their wishlist
    const [existingWishlist] = await connection.execute(
      "SELECT * FROM wishlist WHERE user_id = ? AND product_id = ?",
      [id, prodId]
    );

    if (existingWishlist.length > 0) {
      // If the product is already in the wishlist, remove it
      await connection.execute(
        "DELETE FROM wishlist WHERE user_id = ? AND product_id = ?",
        [id, prodId]
      );
      res.json({ message: "Product removed from wishlist" });
    } else {
      // If the product is not in the wishlist, add it
      await connection.execute(
        "INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)",
        [id, prodId]
      );
      res.status(204).json({ message: "Product added to wishlist" });
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
    const connection = await pool.getConnection();

    // Check if the user has already rated the product
    const checkRatingQuery = `
          SELECT *
          FROM ratings
          WHERE user_id = ? AND product_id = ?
      `;
    const [ratingRows] = await connection.execute(checkRatingQuery, [
      _id,
      prodId,
    ]);
    const alreadyRated = ratingRows.length > 0;

    if (alreadyRated) {
      // Update existing rating
      const updateRatingQuery = `
              UPDATE ratings
              SET star = ?, comment = ?
              WHERE user_id = ? AND product_id = ?
          `;
      await connection.execute(updateRatingQuery, [star, comment, _id, prodId]);
    } else {
      // Add new rating
      const addRatingQuery = `
              INSERT INTO ratings (user_id, product_id, star, comment)
              VALUES (?, ?, ?, ?)
          `;
      await connection.execute(addRatingQuery, [_id, prodId, star, comment]);
    }

    // Calculate total rating and update product
    const calculateRatingQuery = `
          SELECT AVG(star) AS total_rating
          FROM ratings
          WHERE product_id = ?
      `;
    const [averageRatingRows] = await connection.execute(calculateRatingQuery, [
      prodId,
    ]);
    console.log("Average Rating Rows:", averageRatingRows);
    const totalRating = averageRatingRows[0].total_rating;
    console.log("Total Rating:", totalRating);

    const updateTotalRatingQuery = `
          UPDATE product
          SET total_rating = ?
          WHERE p_id = ?
      `;
    const [updateResult] = await connection.execute(updateTotalRatingQuery, [
      totalRating,
      prodId,
    ]);
    // console.log("Update Result:", updateResult);

    // Fetch and return updated product
    const getProductQuery = `
          SELECT *
          FROM product
          WHERE p_id = ?
      `;
    const [productRows] = await connection.execute(getProductQuery, [prodId]);
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
  try {
    const uploader = (path) => cloudinaryUploadImg(path, "images");
    const urls = [];
    const files = req.files;
    for (const file of files) {
      const { path } = file;
      const newPath = await uploader(path);
      urls.push(newPath);
      fs.unlinkSync(path);
    }

    const images = urls.map((file) => {
      return file;
    });

    res.json(images);
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
});

const deleteImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = cloudinaryDeleteImg(id, "images");
    res.json({ message: "Deleted Successfully" });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createProduct,
  getProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  addToWishlist,
  rating,
  uploadImages,
  deleteImages,
};
