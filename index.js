const express = require('express');
const { checkConnection } = require('./config/db'); // adjust the path according to your project structure
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 4000;
const authRoute = require('./routes/authRoute');
const bodyParser = require('body-parser');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const morgan = require('morgan');
const productRoute = require('./routes/productRoute');
const blogRouter = require('./routes/blogRoute');
const categoryRouter = require('./routes/prodCategoryRoute');
const blogcategoryRouter = require("./routes/blogCatRoute");
const brandRouter = require("./routes/brandRoute");
const couponRouter = require("./routes/couponRoute");
const colorRouter = require("./routes/colorRoute");
const enqRouter = require("./routes/enqRoute");
const sizeRoute = require("./routes/sizeRoute")

app.use(morgan("dev"));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/user', authRoute);
app.use('/api/product', productRoute);
app.use('/api/blog', blogRouter);
app.use('/api/category', categoryRouter);
app.use("/api/blogcategory", blogcategoryRouter);
app.use("/api/brand", brandRouter);
app.use("/api/coupon", couponRouter);
app.use("/api/color", colorRouter);
app.use("/api/enquiry", enqRouter);
app.use("/api/size", sizeRoute)

app.use(notFound);
app.use(errorHandler);

checkConnection()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error starting the server:', err);
  });














// const express = require('express');
// const dbConnect = require('./config/dbConnect');
// const app = express();
// const dotenv = require('dotenv').config();
// const PORT = process.env.PORT || 4000;
// const authRoute = require('./routes/authRoute');
// const bodyParser = require('body-parser');
// const { notFound, errorHandler } = require('./middlewares/errorHandler');
// const cookieParser = require('cookie-parser');
// const cors  = require('cors');
// const mysql = require('mysql2');
// const dbMiddleware = require('./middlewares/dbMiddleware');


// app.use(dbMiddleware);


// const productRoute = require('./routes/productRoute');
// const blogRouter = require('./routes/blogRoute');
// const categoryRouter = require('./routes/prodCategoryRoute');
// const blogcategoryRouter = require("./routes/blogCatRoute");
// const brandRouter = require("./routes/brandRoute");
// const couponRouter = require("./routes/couponRoute");
// const morgan = require('morgan')
// const colorRouter = require("./routes/colorRoute");
// const enqRouter = require("./routes/enqRoute");

// // dbConnect();
// app.use(morgan("dev"))
// app.use(cors());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cookieParser());

// app.use('/api/user', authRoute);
// app.use('/api/product', productRoute);
// app.use('/api/blog', blogRouter);
// app.use('/api/category', categoryRouter);
// app.use("/api/blogcategory", blogcategoryRouter);
// app.use("/api/brand", brandRouter);
// app.use("/api/coupon",couponRouter);
// app.use("/api/color", colorRouter);
// app.use("/api/enquiry", enqRouter); 


// //mekata yatin mewa thiyen oona
// app.use(notFound);
// app.use(errorHandler);


// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });
