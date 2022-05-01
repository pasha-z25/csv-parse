const { isTableHead } = require('./helpers');

module.exports = function parseStreamData(row, dates, workers) {
  if (!isTableHead(row)) {
    const currentWorker = row[2];
    const currentProject = row[1].includes('♥') && row[1].length > 1 ? '♥' : row[1];
    const durationSeconds = row[5];
    const startTime = row[9];
    const getStartDate = () => new Date(startTime).toDateString();
    const getStartTime = () => new Date(startTime).toTimeString();

    const isWorkerAlreadyAdded = workers.some(
      (worker) => worker.name === currentWorker,
    );

    if (Date.parse(getStartDate())) {
      dates.add(getStartDate());
    }

    if (isWorkerAlreadyAdded) {
      workers.forEach((worker, index) => {
        const isCurrentWorker = worker.name === currentWorker;
        const workerCurrentProject = worker.projects[currentProject];
        const isStartTimeExists = workerCurrentProject
          ? workerCurrentProject.some(
              (project) => project.startTime === getStartTime(),
            )
          : false;

        if (isCurrentWorker && !workerCurrentProject) {
          // eslint-disable-next-line
          workers[index].projects = {
            ...worker.projects,
            [currentProject]: [
              {
                startDate: getStartDate(),
                startTime: getStartTime(),
                durationSeconds,
              },
            ],
          };
        } else if (isCurrentWorker && workerCurrentProject && !isStartTimeExists) {
          workerCurrentProject.push({
            startDate: getStartDate(),
            startTime: getStartTime(),
            durationSeconds,
          });
        }
      });
    } else {
      workers.push({
        name: currentWorker,
        projects: {
          [currentProject]: [
            {
              startDate: getStartDate(),
              startTime: getStartTime(),
              durationSeconds,
            },
          ],
        },
      });
    }
  }
};
