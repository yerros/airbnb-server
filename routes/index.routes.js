const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  console.log(req.user);

  res.status(200).send({
    apiServer: "Online"
  });
});

module.exports = router;
