const express = require('express');
const multer = require('multer');
const path = require('path');
// const fs = require('fs');
const parser = require('../parse/index.js');

const router = express.Router();
const upload = multer({ dest: 'uploads' });

router.get('/', (req, res) => {
  res.render('index', {
    title: 'CSV parse application',
    description:
      'Application for converting a CSV report into a new structured table',
  });
});
router.post('/', upload.single('csvFile'), async (req, res) => {
  const filedata = req.file;
  console.log('Source file:'); // eslint-disable-line
  console.log(filedata); // eslint-disable-line
  if (!filedata) {
    res.send('Ошибка при загрузке файла');
  } else {
    const finalFile = await parser(
      path.join(require.main.path, filedata.path),
      filedata.filename,
    );
    console.log(`File loading: ${finalFile}`); // eslint-disable-line
    res.download(finalFile);
  }
});

module.exports = router;
