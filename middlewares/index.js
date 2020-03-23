const isAdmin = (req, res, next) => {
  const role = req.user.role;
  if (role === "admin") {
    next();
  } else {
    return res.status(401).json({
      message: "Access denied!"
    });
  }
};
const isHost = (req, res, next) => {
  const role = req.user.role;
  if (role === "host" || role === "admin") {
    next();
  } else {
    return res.status(401).json({
      message: "Access denied!"
    });
  }
};

module.exports = {
  isAdmin,
  isHost
};
