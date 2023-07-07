const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/adminAssets/adminImages'));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + '-' + file.originalname;
    cb(null, name);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    !file.mimetype.includes('image/png') &&
    !file.mimetype.includes('image/jpeg')
  ) {
    return cb(null, false);
  }
  cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = {
  upload,
};
