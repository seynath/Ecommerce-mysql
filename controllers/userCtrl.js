// const User = require("../models/userModel");
// const Product = require("../models/productModel");
// const Cart = require("../models/cartModel");
// const Coupon = require("../models/couponModel");
// const Order = require("../models/orderModel");
// const asyncHandler = require("express-async-handler");
// const generateToken = require("../config/jwtToken");
// // const validateMongoDbId = require("../utils/validateMongodbid");
// const generateRefreshToken = require("../config/refreshtoken");
// const jwt = require("jsonwebtoken");
// const sendEmail = require("../controllers/emailCtrl");
// const crypto = require("crypto");
// const uniqid = require("uniqid");
// const mysql = require("mysql2");
// const saltRounds = 10;
// const bcrypt = require("bcrypt");

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

// // // userCtrl.js
// // const createUser = async (req, res) => {
// //   try {
// //       const { firstname, lastname, email, mobile, password, role, address } = req.body;
// //       const connection = req.db;

// //       // Check if user with the given email already exists
// //       connection.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {
// //           if (error) {
// //               throw error;
// //           }

// //           if (results.length === 0) {
// //               // If user does not exist, create a new user
// //               const sql = 'INSERT INTO users (firstname, lastname, email, mobile, password, role, address) VALUES (?, ?, ?, ?, ?, ?, ?)';
// //               connection.query(sql, [firstname, lastname, email, mobile, password, role, address], (error, results) => {
// //                   if (error) {
// //                       throw error;
// //                   }
// //                   res.json(results);
// //                   // Close the connection
// //               });
// //           } else {
// //               // If user already exists, throw an error
// //               throw new Error("User Already Exists");
// //           }
// //       });
// //   } catch (error) {
// //       res.status(400).json({ message: error.message });
// //   }
// // };

// // const createUser = async (req, res) => {
// //   try {
// //       const { firstname, lastname, email, mobile, password, role, address } = req.body;
// //       const connection = req.connection; // Get the connection from req object

// //       // Wait for the connection to be obtained from the pool
// //       await new Promise((resolve, reject) => {
// //           connection.query('SELECT 1', (err) => {
// //               if (err) {
// //                   reject(err);
// //               } else {
// //                   resolve();
// //               }
// //           });
// //       });

// //       // Check if user with the given email already exists
// //       connection.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {
// //           if (error) {
// //               throw error;
// //           }

// //           if (results.length === 0) {
// //               // If user does not exist, create a new user
// //               const sql = 'INSERT INTO users (firstname, lastname, email, mobile, password, role, address) VALUES (?, ?, ?, ?, ?, ?, ?)';
// //               connection.query(sql, [firstname, lastname, email, mobile, password, role, address], (error, results) => {
// //                   if (error) {
// //                       throw error;
// //                   }
// //                   res.json(results);
// //                   // Close the connection
// //               });
// //           } else {
// //               // If user already exists, throw an error
// //               throw new Error("User Already Exists");
// //           }
// //       });
// //   } catch (error) {
// //       res.status(400).json({ message: error.message });
// //   }
// // };

// // const createUser = async (req, res) => {
// //   try {
// //     const { firstname, lastname, email, mobile, password, role, address } = req.body;
// //     const connection = req.connection;

// //     // Wait for the connection to be obtained from the pool
// //     // await new Promise((resolve, reject) => {
// //     //   connection.query('SELECT 1', (err) => {
// //     //     if (err) {
// //     //       reject(err);
// //     //     } else {
// //     //       resolve();
// //     //     }
// //     //   });
// //     // });

// //     await checkConnection(connection);
// //     const hashedPassword = await bcrypt.hash(password, saltRounds);
// //     // Check if user with the given email already exists
// //     connection.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {
// //       if (error) {
// //         throw error;
// //       }

// //       if (results.length === 0) {
// //         // If user does not exist, create a new user
// //         const sql = 'INSERT INTO users (firstname, lastname, email, mobile, password, role, address) VALUES (?, ?, ?, ?, ?, ?, ?)';
// //         connection.query(sql, [firstname, lastname, email, mobile, hashedPassword, role, address], (error, results) => {
// //           if (error) {
// //             throw error;
// //           }
// //           res.json(results);
// //         });
// //       } else {
// //         // If user already exists, send a response to the client
// //         res.status(400).json({ message: "User Already Exists" });
// //       }
// //     });
// //   } catch (error) {
// //     res.status(400).json({ message: error.message });
// //   }
// // };

// const createUser = async (req, res) => {
//   try {
//     const { firstname, lastname, email, mobile, password, role, address } =
//       req.body;
//     const connection = req.connection;

//     await checkConnection(connection);

//     // Check if user with the given email already exists
//     const [existingUsers] = await connection
//       .promise()
//       .query("SELECT * FROM users WHERE email = ?", [email]);
//     if (existingUsers.length > 0) {
//       connection.release();
//       return res.status(400).json({ message: "User Already Exists" });
//     }

//     const hashedPassword = await bcrypt.hash(password, saltRounds);
//     // Create a new user
//     const sql =
//       "INSERT INTO users (firstname, lastname, email, mobile, password, role, address) VALUES (?, ?, ?, ?, ?, ?, ?)";
//     await connection
//       .promise()
//       .query(sql, [
//         firstname,
//         lastname,
//         email,
//         mobile,
//         hashedPassword,
//         role,
//         address,
//       ]);
                            
//     connection.release();
//     res.json({ message: "User created successfully" });
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

const asyncHandler = require("express-async-handler");
const generateToken = require("../config/jwtToken");
const generateRefreshToken = require("../config/refreshtoken");
const jwt = require("jsonwebtoken");
const sendEmail = require("../controllers/emailCtrl");
const crypto = require("crypto");
const uniqid = require("uniqid");
const { pool } = require("../config/db"); // import the connection pool
const saltRounds = 10;
const bcrypt = require("bcrypt");

const createUser = asyncHandler(async (req, res) => {
  try {
    const { firstname, lastname, email, mobile, password, role, address } =
      req.body;

    // Get a connection from the pool
    const connection = await pool.getConnection();

    // Check if user with the given email already exists
    const [existingUsers] = await connection.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (existingUsers.length > 0) {
      connection.release();
      return res.status(400).json({ message: "User Already Exists" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user
    const result = await connection.execute(
      "INSERT INTO users (firstname, lastname, email, mobile, password, role, address) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [firstname, lastname, email, mobile, hashedPassword, role, address]
    );

    connection.release();

    res.status(201).json({ message: "User created successfully", userId: result[0].insertId });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// mongo way
// const createUser = asyncHandler(async (req, res) => {
//   /**
//    * TODO:Get the email from req.body
//    */
//   const email = req.body.email;
//   /**
//    * TODO:With the help of email find the user exists or not
//    */
//   const findUser = await User.findOne({ email: email });

//   if (!findUser) {
//     /**
//      * TODO:if user not found user create a new user
//      */
//     const newUser = await User.create(req.body);
//     res.json(newUser);
//   } else {
//     /**
//      * TODO:if user found then thow an error: User already exists
//      */
//     throw new Error("User Already Exists");
//   }
// });

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  try {
    // Get a connection from the pool
    const connection = await pool.getConnection();

    // Check if user with the given email exists
    const [rows] = await connection.execute("SELECT * FROM users WHERE email = ?", [email]);
    const user = rows[0];
    // if (!user) {
    //   connection.release();
    //   throw new Error("User not found")}

    if (rows.length === 0 || !user) {
      connection.release();
      return res.status(401).json({ message: "Invalid Credentials" });
    }


    // Compare the provided password with the hashed password stored in the database
    const passwordMatched = await bcrypt.compare(password, user.password);
   
    if (!passwordMatched) {
      connection.release();
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    // Generate a JSON Web Token (JWT) for the user
    const token = generateToken(user.id);
    // store the token in user table , refreshToken field
    const [rows1] = await  connection.execute("UPDATE users SET refreshToken = ? where id = ?", [token, user.id])

    if(rows1.length === 0){
      connection.release();
      return res.status(401).json({ message: "Server Error" });      
    }

    connection.release();

    // Send the user data and token as a response
    res.json({
      _id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      mobile: user.mobile,
      isAdmin: user.isAdmin,
      token: token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// mongo loginuser
// const loginUser = asyncHandler(async (req, res) => {
//   const { email, password } = req.body;
//   const findUser = await User.findOne({ email: email });
//   if (findUser && (await findUser.isPasswordMatched(password))) {
//     const refreshToken = generateRefreshToken(findUser._id);
//     const updateUser = await User.findByIdAndUpdate(
//       findUser._id,
//       { refreshToken: refreshToken },
//       { new: true }
//     );
//     res.cookie("refreshToken", refreshToken, {
//       httpOnly: true,
//       //path:'/api/user/refreshToken',
//       maxAge: 3 * 24 * 60 * 60 * 1000,
//     });
//     res.json({
//       _id: findUser?._id,
//       firstname: findUser?.firstname,
//       lastname: findUser?.lastname,
//       email: findUser?.email,
//       mobile: findUser?.mobile,
//       isAdmin: findUser?.isAdmin,
//       token: generateToken(findUser?._id), //generateToken
//     });
//   } else {
//     throw new Error("Invalid Credentials");
//   }
// });

const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Get a MySQL connection from the pool
    const connection = await pool.getConnection();


    // Execute a SELECT query to find the user with the provided email
    const [rows] = await connection.execute("SELECT * FROM users WHERE email = ?", [email]);
    const findAdmin = rows[0];
    console.log(findAdmin)

    if (!findAdmin) {
      connection.release();
      throw new Error("Email not found");
    }

    // Check if the user is an admin
    if (findAdmin.role !== "admin") {
      connection.release();
      throw new Error("Unauthorized access");
    }

    // Compare the provided password with the hashed password stored in the database
    const passwordMatched = await bcrypt.compare(password, findAdmin.password);

    if (!passwordMatched) {
      connection.release();
      throw new Error("Incorrect password");
    }

    // Generate a refresh token
    const refreshToken = await generateRefreshToken(findAdmin.id);
    console.log(refreshToken)

    // Update the user's refresh token in the database
    const [rows1] = await connection
      .execute("UPDATE users SET refreshToken = ? WHERE id = ?", [
        refreshToken,
        findAdmin.id,
      ]);

    if (rows1.length === 0) {
      connection.release();
      throw new Error("Server Error");
    }

    connection.release();

    // Set the refresh token in a cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });

    // Send the user's information along with an access token in the response
    res.json({
      _id: findAdmin.id,
      firstname: findAdmin.firstname,
      lastname: findAdmin.lastname,
      email: findAdmin.email,
      mobile: findAdmin.mobile,
      isAdmin: true,
      token: refreshToken,
    });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};


// const loginAdmin = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // Get a MySQL connection from the pool
//     const connection = req.connection;
//     await checkConnection(connection);

//     // Execute a SELECT query to find the user with the provided email
//     const [rows] = await connection
//       .promise()
//       .query("SELECT * FROM users WHERE email = ?", [email]);
//     const findAdmin = rows[0];

//     if (!findAdmin) {
//       connection.release();
//       throw new Error("Invalid Credentials");
//     }

//     // Check if the user is an admin
//     if (findAdmin.role !== "admin") {
//       connection.release();
//       throw new Error("Not Authorised");
//     }

//     // Compare the provided password with the hashed password stored in the database
//     const passwordMatched = await bcrypt.compare(password, findAdmin.password);

//     if (!passwordMatched) {
//       connection.release();
//       throw new Error("Invalid Credentials");
//     }

//     // Generate a refresh token
//     const refreshToken = await generateRefreshToken(findAdmin.id);

//     // Update the user's refresh token in the database
//     await connection
//       .promise()
//       .query("UPDATE users SET refreshToken = ? WHERE id = ?", [
//         refreshToken,
//         findAdmin.id,
//       ]);

//     connection.release();

//     // Set the refresh token in a cookie
//     res.cookie("refreshToken", refreshToken, {
//       httpOnly: true,
//       maxAge: 72 * 60 * 60 * 1000,
//     });

//     // Send the user's information along with an access token in the response
//     res.json({
//       _id: findAdmin.id,
//       firstname: findAdmin.firstname,
//       lastname: findAdmin.lastname,
//       email: findAdmin.email,
//       mobile: findAdmin.mobile,
//       token: generateToken(findAdmin.id),
//     });
//   } catch (error) {
//     res.status(401).json({ message: error.message });
//   }
// };

//mongo login Admin
// const loginAdmin = asyncHandler(async (req, res) => {
//   const { email, password } = req.body;
//   // check if user exists or not
//   const findAdmin = await User.findOne({ email });
//   if (findAdmin.role !== "admin") throw new Error("Not Authorised");
//   if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
//     const refreshToken = await generateRefreshToken(findAdmin?._id);
//     const updateuser = await User.findByIdAndUpdate(
//       findAdmin.id,
//       {
//         refreshToken: refreshToken,
//       },
//       { new: true }
//     );
//     res.cookie("refreshToken", refreshToken, {
//       httpOnly: true,
//       maxAge: 72 * 60 * 60 * 1000,
//     });
//     res.json({
//       _id: findAdmin?._id,
//       firstname: findAdmin?.firstname,
//       lastname: findAdmin?.lastname,
//       email: findAdmin?.email,
//       mobile: findAdmin?.mobile,
//       token: generateToken(findAdmin?._id),
//     });
//   } else {
//     throw new Error("Invalid Credentials");
//   }
// });

const getallUser = async (req, res) => {
  try {
    // Get a MySQL connection from the pool
    const connection = await pool.getConnection();

    // Execute a SELECT query to fetch all users
    const [rows] = await connection.execute("SELECT * FROM users");
      if(rows.length === 0){
        connection.release();
        return res.status(404).json({ message: "No Users Found" });}
    connection.release();

    // Send the fetched users in the response
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//mongo getallUsers
// const getallUser = asyncHandler(async (req, res) => {
//   try {
//     const getUsers = await User.find();
//     res.json(getUsers);
//   } catch (error) {
//     throw new Error(error);
//   }
// });

const getaUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Get a MySQL connection from the pool
    const connection = req.connection;
    await checkConnection(connection);
    // Execute a SELECT query to fetch the user with the provided ID
    const [rows] = await connection
      .promise()
      .query("SELECT * FROM users WHERE id = ?", [id]);

    connection.release();

    // Check if user with the given ID exists
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send the fetched user in the response
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//get a user
// const getaUser = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   validateMongoDbId(id);

//   try {
//     const getaUser = await User.findById(id);
//     res.json({
//       getaUser,
//     });
//   } catch (error) {
//     throw new Error(error);
//   }
// });

const deleteaUser = async (req, res) => {
  const { id } = req.params;
  

  try {
    // Get a MySQL connection from the pool
    const connection = req.connection;
    await checkConnection(connection);

    // Execute a DELETE query to delete the user with the provided ID
    await connection.promise().query("DELETE FROM users WHERE id = ?", [id]);

    connection.release();

    // Send a success response
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//delete user
// const deleteaUser = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   validateMongoDbId(id);

//   try {
//     const deleteaUser = await User.findByIdAndDelete(id);
//     res.json({
//       deleteaUser,
//     });
//   } catch (error) {
//     throw new Error(error);
//   }
// });


const updatedUser = async (req, res) => {
  // Retrieve the user ID from the request parameters
  // const { id } = req.params;
  const {id} = req.user;

  try {
    // Get user data from request body
    const { firstname, lastname, email, mobile, address } = req.body;

    // Get a MySQL connection from the pool
    const connection = await pool.getConnection();

    // Execute an UPDATE query to update the user's information
    const [result] = await connection
      .execute(
        "UPDATE users SET firstname = ?, lastname = ?, email = ?, mobile = ?, address = ? WHERE id = ?",
        [firstname, lastname, email, mobile, address, id] // Use 'id' instead of '_id'
      );

    connection.release();

    // Check if user was updated successfully
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send the updated user data in the response
    res.json({ message: "User updated successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// update user
// const updatedUser = asyncHandler(async (req, res) => {
//   const { _id } = req.user;
//   validateMongoDbId(_id);

//   try {
//     const updatedUser = await User.findByIdAndUpdate(
//       _id,
//       {
//         firstname: req?.body?.firstname,
//         lastname: req?.body?.lastname,
//         email: req?.body?.email,
//         mobile: req?.body?.mobile,
//       },
//       {
//         new: true,
//       }
//     );
//     res.json(updatedUser);
//   } catch (error) {
//     throw new Error(error);
//   }
// });



const saveAddress = async (req, res) => {
  // Retrieve the user ID from the request parameters

  //const { id } = req.user;
  const { id } = req.params;

  try {
    // Get the address from the request body
    const { address } = req.body;

    // Get a MySQL connection from the pool
    const connection = req.connection;
    await checkConnection(connection);

    // Execute an UPDATE query to update the user's address
    const [result] = await connection
      .promise()
      .query(
        "UPDATE users SET address = ? WHERE id = ?",
        [address, id]
      );

    connection.release();

    // Check if user was updated successfully
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send the updated user data in the response
    res.json({ message: "Address saved successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//save address
// const saveAddress = asyncHandler(async (req, res, next) => {
//   const { _id } = req.user;
//   validateMongoDbId(_id);

//   try {
//     const updatedUser = await User.findByIdAndUpdate(
//       _id,
//       {
//         address: req?.body?.address,
//       },
//       {
//         new: true,
//       }
//     );
//     res.json(updatedUser);
//   } catch (error) {
//     throw new Error(error);
//   }
// });

const blockUser = async (req, res) => {
  // Retrieve the user ID from the request parameters
  const { id } = req.params;

  try {
    // Get a MySQL connection from the pool
    const connection = req.connection;
    await checkConnection(connection);

    // Execute an UPDATE query to block the user
    const [result] = await connection
      .promise()
      .query(
        "UPDATE users SET isBlocked = ? WHERE id = ?",
        [true, id]
      );

    connection.release();

    // Check if user was blocked successfully
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send the response
    res.json({ message: "User Blocked" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// const blockUser = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   validateMongoDbId(id);

//   try {
//     const blockusr = await User.findByIdAndUpdate(
//       id,
//       {
//         isBlocked: true,
//       },
//       {
//         new: true,
//       }
//     );
//     res.json({
//       message: "User Blocked",
//     });
//   } catch (error) {
//     throw new Error(error);
//   }
// });



const unblockUser = async (req, res) => {
  // Retrieve the user ID from the request parameters
  const { id } = req.params;

  try {
    // Get a MySQL connection from the pool
    const connection = req.connection;
    await checkConnection(connection);

    // Execute an UPDATE query to unblock the user
    const [result] = await connection
      .promise()
      .query(
        "UPDATE users SET isBlocked = ? WHERE id = ?",
        [false, id]
      );

    connection.release();

    // Check if user was unblocked successfully
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send the response
    res.json({ message: "User Unblocked" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// const unblockUser = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   validateMongoDbId(id);

//   try {
//     const unblock = await User.findByIdAndUpdate(
//       id,
//       {
//         isBlocked: false,
//       },
//       {
//         new: true,
//       }
//     );
//     res.json({
//       message: "User UnBlocked",
//     });
//   } catch (error) {
//     throw new Error(error);
//   }
// });

// const handleRefreshToken = asyncHandler(async (req, res) => {
//   const cookie = req.cookies;
//   if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
//   const refreshToken = cookie.refreshToken;
//   const user = await User.findOne({ refreshToken });
//   if (!user) throw new Error(" No Refresh token present in db or not matched");
//   jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
//     if (err || user.id !== decoded.id) {
//       throw new Error("There is something wrong with refresh token");
//     }
//     const accessToken = generateToken(user?._id);
//     res.json({ accessToken });
//   });
// });

const handleRefreshToken = async (req, res) => {
  try {
    // Extract the 'refreshToken' from cookies in the request
    const cookie = req.cookies;

    // Check if there is a 'refreshToken' in the cookies
    if (!cookie?.refreshToken) {
      // If not, send a 401 Unauthorized response with an error message
      return res.status(401).json({ message: "No Refresh Token in Cookies" });
    }

    // Retrieve the 'refreshToken' from the cookies
    const refreshToken = cookie.refreshToken;

    // Get a MySQL connection from the pool
    const connection = req.connection;
    await checkConnection(connection);

    // Execute a SELECT query to find the user with the provided 'refreshToken'
    const [rows] = await connection
      .promise()
      .query('SELECT * FROM users WHERE refreshToken = ?', [refreshToken]);
    const user = rows[0];

    connection.release();

    // If no user is found or the 'refreshToken' doesn't match, send an error response
    if (!user) {
      return res
        .status(401)
        .json({ message: "No Refresh token present in db or not matched" });
    }

    // Verify the 'refreshToken' using the JWT_SECRET
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
      // If there's an error or the user ID in the token doesn't match the user ID in the database
      if (err || user.id !== decoded.id) {
        // Send an error response
        return res
          .status(401)
          .json({ message: "There is something wrong with the refresh token" });
      }

      // If verification is successful, generate a new access token
      const accessToken = generateToken(user.id);

      // Send the new access token in the response
      res.json({ accessToken });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// const handleRefreshToken = asyncHandler(async (req, res) => {
//   // Extract the 'refreshToken' from cookies in the request
//   const cookie = req.cookies;

//   // Check if there is a 'refreshToken' in the cookies
//   if (!cookie?.refreshToken) {
//     // If not, send a 401 Unauthorized response with an error message
//     return res.status(401).json({ message: "No Refresh Token in Cookies" });
//   }

//   // Retrieve the 'refreshToken' from the cookies
//   const refreshToken = cookie.refreshToken;

//   // Find a user in the database based on the 'refreshToken'
//   const user = await User.findOne({ refreshToken });

//   // If no user is found or the 'refreshToken' doesn't match, send an error response
//   if (!user) {
//     return res
//       .status(401)
//       .json({ message: "No Refresh token present in db or not matched" });
//   }

//   // Verify the 'refreshToken' using the JWT_SECRET
//   jwt.verify(refreshToken, process.env.JWT_SECRET, async (err, decoded) => {
//     // If there's an error or the user ID in the token doesn't match the user ID in the database
//     if (err || user.id !== decoded.id) {
//       // Send an error response
//       return res
//         .status(401)
//         .json({ message: "There is something wrong with the refresh token" });
//     }

//     // If verification is successful, generate a new access token
//     const accessToken = generateToken(user?._id);

//     // Send the new access token in the response
//     res.json({ accessToken });
//   });
// });

// logout functionality

// const logout = asyncHandler(async (req, res) => {
//   const cookie = req.cookies;
//   if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
//   const refreshToken = cookie.refreshToken;
//   const user = await User.findOne({ refreshToken });
//   if (!user) {
//     res.clearCookie("refreshToken", {
//       httpOnly: true,
//       secure: true,
//     });
//     return res.sendStatus(204); // forbidden
//   }
//   await User.findOneAndUpdate(refreshToken, {
//     refreshToken: "",
//   });
//   res.clearCookie("refreshToken", {
//     httpOnly: true,
//     secure: true,
//   });
//   res.sendStatus(204); // forbidden
// });


const logout = async (req, res) => {
  try {
    const cookie = req.cookies;
    if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
    const refreshToken = cookie.refreshToken;

    // Get a MySQL connection from the pool
    const connection = req.connection;
    await checkConnection(connection);

    // Execute a SELECT query to find the user with the provided 'refreshToken'
    const [rows] = await connection
      .promise()
      .query('SELECT * FROM users WHERE refreshToken = ?', [refreshToken]);
    const user = rows[0];

    // Clear the refreshToken cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });

    // If no user is found, send a 204 No Content response
    if (!user) {
      return res.sendStatus(204); // No Content
    }

    // Update the user's refreshToken to an empty string
    await connection
      .promise()
      .query('UPDATE users SET refreshToken = ? WHERE id = ?', ["", user.id]);

    connection.release();

    return res.sendStatus(204); // No Content
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// const logout = asyncHandler(async (req, res) => {
//   const cookie = req.cookies;
//   if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
//   const refreshToken = cookie.refreshToken;
//   const user = await User.findOne({ refreshToken });

//   if (!user) {
//     res.clearCookie("refreshToken", {
//       httpOnly: true,
//       secure: true,
//     });
//     return res.sendStatus(204); // No Content
//   }

//   // Update the user's refreshToken to an empty string
//   // methana thamai case eke thiyennne
//   await User.findOneAndUpdate(
//     { refreshToken },
//     {
//       $set: { refreshToken: "" },
//     }
//   );

//   // Clear the refreshToken cookie
//   res.clearCookie("refreshToken", {
//     httpOnly: true,
//     secure: true,
//   });

//   return res.sendStatus(204); // No Content
// });

const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { password } = req.body;
  validateMongoDbId(_id);
  const user = await User.findById(_id);
  if (password) {
    user.password = password;
    const updatedPassword = await user.save();
    res.json(updatedPassword);
  } else {
    res.json(user);
  }
});

const generateResetToken = () => {
  // Generate a random token
  const resetToken = crypto.randomBytes(32).toString('hex');
  return resetToken;
};


const forgotPasswordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const connection = req.connection;
  await checkConnection(connection);
  try {
        // Get a MySQL connection from the pool

    // Find the user by email
    const [rows] = await connection.promise().query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    const user = rows[0];

    if (!user) {
      throw new Error("User not found with this email");
    }

    // Generate a password reset token
    const resetToken = await generateResetToken();

    // Update the user's password reset token in the database
    await connection.promise().query(
      "UPDATE users SET passwordResetToken = ?, passwordResetExpires = DATE_ADD(NOW(), INTERVAL 10 MINUTE) WHERE id = ?",
      [resetToken, user.id]
    );

    // Send email with reset link
    const resetURL = `Hi, Please follow this link to reset Your Password. This link is valid till 10 minutes from now. <a href='http://localhost:5000/api/user/reset-password/${resetToken}'>Click Here</>`;
    const data = {
      to: email,
      text: "Hey User",
      subject: "Forgot Password Link",
      htm: resetURL,
    };
    sendEmail(data);

    res.json({ message: "Password reset token sent to your email" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// const forgotPasswordToken = asyncHandler(async (req, res) => {
//   const { email } = req.body;
//   const user = await User.findOne({ email });
//   if (!user) throw new Error("User not found with this email");
//   try {
//     const token = await user.createPasswordResetToken();
//     await user.save();
//     const resetURL = `Hi, Please follow this link to reset Your Password. This link is valid till 10 minutes from now. <a href='http://localhost:5000/api/user/reset-password/${token}'>Click Here</>`;
//     const data = {
//       to: email,
//       text: "Hey User",
//       subject: "Forgot Password Link",
//       htm: resetURL,
//     };
//     sendEmail(data);
//     res.json(token);
//   } catch (error) {
//     throw new Error(error);
//   }
// });

const hashPassword = async (password) => {
  const saltRounds = 10; // Number of salt rounds for bcrypt
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;

  try {
    // Hash the provided token
    // const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find the user by hashed token and check token expiration
    const connection = req.connection;
    await checkConnection(connection);

    const [rows] = await connection.promise().query(
      "SELECT * FROM users WHERE passwordResetToken = ? AND passwordResetExpires > NOW()",
      [token]
    );
    const user = rows[0];

    if (!user) {
      throw new Error("Token expired or invalid");
    }

    // Hash the new password
    const hashedPassword = await hashPassword(password);

    // Update the user's password and reset token fields in the database
    await connection.promise().query(
      "UPDATE users SET password = ?, passwordResetToken = NULL, passwordResetExpires = NULL WHERE id = ?",
      [hashedPassword, user.id]
    );

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// const resetPassword = asyncHandler(async (req, res) => {
//   const { password } = req.body;
//   const { token } = req.params;
//   const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
//   const user = await User.findOne({
//     passwordResetToken: hashedToken,
//     passwordResetExpires: { $gt: Date.now() },
//   });
//   if (!user) throw new Error(" Token Expired, Please try again later");
//   user.password = password;
//   user.passwordResetToken = undefined;
//   user.passwordResetExpires = undefined;
//   await user.save();
//   res.json(user);
// });

const getWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const findUser = await User.findById(_id).populate("wishlist");
    res.json(findUser);
  } catch (error) {
    throw new Error(error);
  }
});

const userCart = asyncHandler(async (req, res) => {
  const { cart } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    let products = [];
    const user = await User.findById(_id);
    // check if user already have product in cart
    const alreadyExistCart = await Cart.findOne({ orderby: user._id });
    if (alreadyExistCart) {
      alreadyExistCart.remove();
    }
    for (let i = 0; i < cart.length; i++) {
      let object = {};
      object.product = cart[i]._id;
      object.count = cart[i].count;
      object.color = cart[i].color;
      let getPrice = await Product.findById(cart[i]._id).select("price").exec();
      object.price = getPrice.price;
      products.push(object);
    }
    let cartTotal = 0;
    for (let i = 0; i < products.length; i++) {
      cartTotal = cartTotal + products[i].price * products[i].count;
    }
    let newCart = await new Cart({
      products,
      cartTotal,
      orderby: user?._id,
    }).save();
    res.json(newCart);
  } catch (error) {
    throw new Error(error);
  }
});

const getUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const cart = await Cart.findOne({ orderby: _id }).populate(
      "products.product"
    );
    res.json(cart);
  } catch (error) {
    throw new Error(error);
  }
});

const emptyCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const user = await User.findOne({ _id });
    //const cart = await Cart.findOneAndRemove({ orderby: user._id });
    const cart = await Cart.findOneAndDelete({ orderby: user._id });

    res.json(cart);
  } catch (error) {
    throw new Error(error);
  }
});

const applyCoupon = asyncHandler(async (req, res) => {
  const { coupon } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  const validCoupon = await Coupon.findOne({ name: coupon });
  if (validCoupon === null) {
    throw new Error("Invalid Coupon");
  }
  const user = await User.findOne({ _id });
  let { cartTotal } = await Cart.findOne({
    orderby: user._id,
  }).populate("products.product");
  let totalAfterDiscount = (
    cartTotal -
    (cartTotal * validCoupon.discount) / 100
  ).toFixed(2);
  await Cart.findOneAndUpdate(
    { orderby: user._id },
    { totalAfterDiscount },
    { new: true }
  );
  res.json(totalAfterDiscount);
});

const createOrder = asyncHandler(async (req, res) => {
  const { COD, couponApplied } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    if (!COD) throw new Error("Create cash order failed");
    const user = await User.findById(_id);
    let userCart = await Cart.findOne({ orderby: user._id });
    let finalAmout = 0;
    if (couponApplied && userCart.totalAfterDiscount) {
      finalAmout = userCart.totalAfterDiscount;
    } else {
      finalAmout = userCart.cartTotal;
    }

    let newOrder = await new Order({
      products: userCart.products,
      paymentIntent: {
        id: uniqid(),
        method: "COD",
        amount: finalAmout,
        status: "Cash on Delivery",
        created: Date.now(),
        currency: "usd",
      },
      orderby: user._id,
      orderStatus: "Cash on Delivery",
    }).save();

    //update database after order is placed
    let update = userCart.products.map((item) => {
      return {
        updateOne: {
          filter: { _id: item.product._id },
          update: { $inc: { quantity: -item.count, sold: +item.count } },
        },
      };
    });
    const updated = await Product.bulkWrite(update, {});
    res.json({ message: "success" });
  } catch (error) {
    throw new Error(error);
  }
});

const getOrders = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const userorders = await Order.findOne({ orderby: _id })
      .populate("products.product")
      .populate("orderby")
      .exec();
    res.json(userorders);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllOrders = asyncHandler(async (req, res) => {
  try {
    const alluserorders = await Order.find()
      .populate("products.product")
      .populate("orderby")
      .exec();
    res.json(alluserorders);
  } catch (error) {
    throw new Error(error);
  }
});
const getOrderByUserId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const userorders = await Order.findOne({ orderby: id })
      .populate("products.product")
      .populate("orderby")
      .exec();
    res.json(userorders);
  } catch (error) {
    throw new Error(error);
  }
});
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updateOrderStatus = await Order.findByIdAndUpdate(
      id,
      {
        orderStatus: status,
        paymentIntent: {
          status: status,
        },
      },
      { new: true }
    );
    res.json(updateOrderStatus);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createUser,
  loginUser,
  getallUser,
  getaUser,
  deleteaUser,
  updatedUser,
  blockUser,
  unblockUser,
  handleRefreshToken,
  logout,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
  loginAdmin,
  getWishlist,
  saveAddress,
  userCart,
  getUserCart,
  emptyCart,
  applyCoupon,
  createOrder,
  getOrders,
  updateOrderStatus,
};
