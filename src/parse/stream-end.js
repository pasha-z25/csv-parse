const { STATIC_COLUMNS, TOTAL_PROJECTS_PER_WORKER } = require('./constants');
const {
  calcHoursSum,
  createHeadTitle,
  getSummaryWeeks,
  secondToTime,
  secondToTimeInHours,
} = require('./helpers');

module.exports = function processStreamEnd(dates, workers) {
  let dataToWrite = '';
  const workingWeeks = getSummaryWeeks(dates);
  dataToWrite = createHeadTitle(workingWeeks);

  workers.forEach((worker) => {
    let index = 0;
    const currentWorker = new Array(TOTAL_PROJECTS_PER_WORKER);
    const currentWorkerProjects = [];
    const projectsAccumulator = [];

    currentWorker[TOTAL_PROJECTS_PER_WORKER - 1] = new Array(
      workingWeeks.length + STATIC_COLUMNS,
    );
    currentWorker[TOTAL_PROJECTS_PER_WORKER - 1].fill('');
    currentWorker[TOTAL_PROJECTS_PER_WORKER - 1][0] = worker.name;
    currentWorker[TOTAL_PROJECTS_PER_WORKER - 1][1] = '♥';
    currentWorker[TOTAL_PROJECTS_PER_WORKER - 1][2] = '0';

    Object.entries(worker.projects).forEach(([projectName, projectTimesArray]) => {
      let timeAccumulator = 0;
      const newRow = new Array(workingWeeks.length + STATIC_COLUMNS).fill(0);
      newRow[0] = worker.name;
      newRow[1] = projectName;
      projectTimesArray.forEach((elem) => {
        timeAccumulator += parseInt(elem.durationSeconds, 10);
        const dateCellIndex = workingWeeks.findIndex((week) =>
          week.includes(elem.startDate),
        );
        newRow[dateCellIndex + STATIC_COLUMNS] =
          parseInt(newRow[dateCellIndex + STATIC_COLUMNS], 10) +
          parseInt(elem.durationSeconds, 10);
      });
      newRow[2] = secondToTimeInHours(timeAccumulator);
      newRow.forEach((el, ind) => {
        if (ind >= STATIC_COLUMNS) {
          newRow[ind] = el === 0 ? '' : secondToTime(el);
        }
      });
      currentWorkerProjects.push(newRow);
    });
    currentWorkerProjects.sort((a, b) => parseInt(b[2], 10) - parseInt(a[2], 10));

    currentWorkerProjects.forEach((projectRow) => {
      if (projectRow[1] === '♥') {
        currentWorker[TOTAL_PROJECTS_PER_WORKER - 1] = projectRow;
      } else {
        if (currentWorkerProjects.length <= TOTAL_PROJECTS_PER_WORKER) {
          currentWorker[index] = projectRow;
        } else {
          // eslint-disable-next-line
          if (index < TOTAL_PROJECTS_PER_WORKER - 2) {
            currentWorker[index] = projectRow;
          } else {
            projectsAccumulator.push(projectRow);
          }
        }
        index += 1;
      }
    });

    for (let i = 0; i < currentWorker.length; i += 1) {
      if (currentWorker[i] === undefined && projectsAccumulator.length) {
        let tmpRow = '';
        projectsAccumulator.forEach((project, indx) => {
          if (indx === 0) {
            tmpRow = project;
          } else {
            tmpRow.forEach((cell, ind) => {
              if (ind === 1) {
                tmpRow[ind] += ` + ${project[ind]}`;
              } else if (ind === 2) {
                tmpRow[ind] = parseInt(tmpRow[ind], 10) + parseInt(project[ind], 10);
              } else if (ind > 2) {
                tmpRow[ind] = calcHoursSum(tmpRow[ind], project[ind]);
              }
            });
          }
        });
        currentWorker[i] = tmpRow;
      } else if (currentWorker[i] === undefined) {
        currentWorker[i] = new Array(workingWeeks.length + STATIC_COLUMNS).fill('');
      }
    }

    currentWorker.forEach((oneRow) => {
      dataToWrite += `${oneRow.join(';')} \n`;
    });
  });

  return {
    data: dataToWrite,
  };
};
