const Color = require("../models/colorModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbid");
const { pool } = require("../config/db");

const createColor = asyncHandler(async (req, res) => {
  const colorName = req.body.title;
  const colorCode = req.body.code;
  try {
    const connection = await pool.getConnection();
    
    const sql = "SELECT * FROM color WHERE col_name = ?";
    const [existingColor] = await connection.execute(sql, [colorName]);
    console.log(req.body.title);
    if (existingColor.length > 0) {
      connection.release();
      return res.status(400).json({ message: "Color name already exists" });
    }

    const insertColorQuery = "INSERT INTO color (col_name, col_code) VALUES (?, ?)";
    const [insertResult] = await connection.execute(insertColorQuery, [
      colorName, colorCode
    ]);
    console.log(insertResult);
    // const colorId = insertResult.insertId;
    console.log(colorId);
    const getColorQuery = "SELECT * FROM color WHERE col_id = ?";
    const [colorRows] = await connection.execute(getColorQuery, [colorId]);
    const newColor = colorRows[0];
    console.log(newColor);
    connection.release();
    return res.json(newColor);
  } catch (error) {
    throw new Error(error);
  }
});

// const createColor = asyncHandler(async (req, res) => {
//   try {
//     const newColor = await Color.create(req.body);
//     res.json(newColor);
//   } catch (error) {
//     throw new Error(error);
//   }
// });
const updateColor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updatedColor = await Color.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatedColor);
  } catch (error) {
    throw new Error(error);
  }
});
const deleteColor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deletedColor = await Color.findByIdAndDelete(id);
    res.json(deletedColor);
  } catch (error) {
    throw new Error(error);
  }
});
const getColor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getaColor = await Color.findById(id);
    res.json(getaColor);
  } catch (error) {
    throw new Error(error);
  }
});

const getallColor = asyncHandler(async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const sql = "SELECT * FROM color";
    const [colors] = await connection.execute(sql);
    connection.release();
    res.json(colors);
  } catch (error) {
    throw new Error(error);
  }
});

// const getallColor = asyncHandler(async (req, res) => {
//   try {
//     const getallColor = await Color.find();
//     res.json(getallColor);
//   } catch (error) {
//     throw new Error(error);
//   }
// });
module.exports = {
  createColor,
  updateColor,
  deleteColor,
  getColor,
  getallColor,
};
