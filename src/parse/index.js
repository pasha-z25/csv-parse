const path = require('path');
const fs = require('fs');
const csv = require('csv');

const { writeResultJSON, writeResultCSV } = require('./helpers');
const parseStreamData = require('./stream-data');
const processStreamEnd = require('./stream-end');

const dates = new Set();
const workers = [];

module.exports = function parser(fileToParse, hash) {
  return new Promise((resolve, reject) => {
    try {
      fs.accessSync(path.join(fileToParse));
      fs.createReadStream(path.join(fileToParse))
        .pipe(csv.parse())
        .on('data', (currentRow) => parseStreamData(currentRow, dates, workers))
        .on('end', () => {
          const result = processStreamEnd(dates, workers);
          const dataToWrite = result.data;

          fs.stat(path.join('./', 'dist'), (error) => {
            if (error) {
              fs.mkdir(path.join('./', 'dist'), (newError) => {
                if (newError) throw newError;
                writeResultJSON(workers, hash);
                writeResultCSV(dataToWrite, hash);
                resolve(path.join(require.main.path, 'dist', `result-${hash}.csv`));
              });
            } else {
              writeResultJSON(workers, hash);
              writeResultCSV(dataToWrite, hash);
              resolve(path.join(require.main.path, 'dist', `result-${hash}.csv`));
            }
          });
        });
    } catch (error) {
      reject(error);
    }
  });
};
