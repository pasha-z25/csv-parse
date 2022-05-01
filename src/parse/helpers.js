const path = require('path');
const fs = require('fs');
const { daysOfWeek, monthsOfYear } = require('./constants');

const isTableHead = (row) => row[2] === 'workers';
const getSummaryWeeks = (arrayDates) => {
  let lastWeekDayIndex = 0;
  let lastMonthIndex = 0;
  let weekIndex = 0;
  const result = [];
  Array.from(arrayDates)
    .reverse()
    .forEach((date) => {
      const weekDay = date.substring(0, 3);
      const month = date.substring(4, 7);
      const currentWeekDayIndex = daysOfWeek.findIndex(
        (itemDay) => itemDay === weekDay,
      );
      const currentMonthIndex = monthsOfYear.findIndex(
        (itemMonth) => itemMonth === month,
      );

      if (currentWeekDayIndex < lastWeekDayIndex) {
        result.push([date]);
        weekIndex += 1;
      } else {
        // eslint-disable-next-line
        if (currentMonthIndex !== lastMonthIndex) {
          result.push([date]);
          if (weekIndex !== 0) {
            weekIndex += 1;
          }
        } else {
          // eslint-disable-next-line
          if (Array.isArray(result[weekIndex])) {
            result[weekIndex].push(date);
          } else {
            result.push([date]);
          }
        }
      }

      lastMonthIndex = currentMonthIndex;
      lastWeekDayIndex = currentWeekDayIndex;
    });
  return result;
};
const writeResultJSON = (data, hash) => {
  const fileName = `result-${hash}.json`;
  fs.writeFileSync(path.join('./dist', fileName), JSON.stringify(data), (err) => {
    if (err) throw err;
    console.log('JSON data write success!'); // eslint-disable-line
  });
};
const writeResultCSV = (data, hash) => {
  const fileName = `result-${hash}.csv`;
  fs.writeFileSync(path.join('./dist', fileName), data, (err) => {
    if (err) throw err;
    console.log('Data write success!'); // eslint-disable-line
  });
};
const secondToTime = (sec) => {
  if (sec > 60) {
    const hours = Math.floor(sec / 60 / 60);
    const minutes = Math.floor(sec / 60) - hours * 60;
    // const seconds = sec % 60;
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      // seconds.toString().padStart(2, '0'),
    ].join(':');
  }
  return '';
};
const secondToTimeInHours = (sec) => {
  let hours = Math.floor(sec / 60 / 60);
  hours = Math.floor(sec / 60) - hours * 60 >= 30 ? hours + 1 : hours;
  // const minutes = hours === 0 ? 30 : 0;
  // const seconds = 0;
  return hours.toString().padStart(2, '0');
};
const createHeadTitle = (arrayDates) => {
  const headTitle = ['worker', 'project', 'total_time'];
  let weeksCounter = 1;
  let lastMonth = '';

  arrayDates.forEach((week) => {
    const month = week[0].substring(4, 7);
    const startWeek = week[0].substring(8, 10);
    const endWeek =
      week.length > 1 ? ` - ${week[week.length - 1].substring(8, 10)}` : '';
    if (month !== lastMonth) {
      weeksCounter = 1;
    }
    headTitle.push(`W${weeksCounter} ${month} ${startWeek}${endWeek}`);
    weeksCounter += 1;
    lastMonth = month;
  });

  return `${headTitle.join(';')} \n`;
};
const calcHoursSum = (time1, time2) => {
  if (time1 === '') return time2;
  if (time2 === '') return time1;
  const t1 = time1.split(':');
  const t2 = time2.split(':');

  let HH = parseInt(t1[0], 10) + parseInt(t2[0], 10);
  HH = parseInt(t1[1], 10) + parseInt(t2[1], 10) > 59 ? HH + 1 : HH;
  const MM =
    parseInt(t1[1], 10) + parseInt(t2[1], 10) > 59
      ? parseInt(t1[1], 10) + parseInt(t2[1], 10) - 60
      : parseInt(t1[1], 10) + parseInt(t2[1], 10);
  // const SS = '00';
  return [HH.toString().padStart(2, '0'), MM.toString().padStart(2, '0')].join(':');
};

module.exports = {
  isTableHead,
  getSummaryWeeks,
  writeResultJSON,
  writeResultCSV,
  secondToTime,
  secondToTimeInHours,
  createHeadTitle,
  calcHoursSum,
};
