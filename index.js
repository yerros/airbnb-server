const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const passport = require("passport");
const connectDB = require("./config/database");
connectDB();
const cors = require("cors");
const app = express();
const requireAuth = passport.authenticate("jwt", { session: false });
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(morgan("dev"));
app.use(cors());

app.use("/property", require("./routes/property.routes"));
app.use("/auth", require("./routes/auth.routes"));
app.use("/", requireAuth, require("./routes/index.routes"));
app.use("/category", requireAuth, require("./routes/category.routes"));
app.use("/order", requireAuth, require("./routes/order.routes"));
app.use("/favorite", requireAuth, require("./routes/favorite.routes"));

// initialize app
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});
