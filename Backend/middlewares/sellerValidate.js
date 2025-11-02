export default function (fields) {
  return (req, res, next) => {
    for (let field of fields) {
      if (!req.body[field] || req.body[field].trim() === '')
        return res.status(400).json({ message: `Missing ${field}` });
    }
    next();
  }
};
