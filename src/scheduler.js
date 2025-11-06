let isScheduled = false;
const jobs = [];

const processJobs = () => {
  while (jobs.length > 0) {
    const job = jobs.shift();
    const result = job();

    Promise.resolve(result).then(
      () => {},
      (err) => {
        console.error(`[scheduler]: ${err}`);
      }
    );
  }

  isScheduled = false;
};

const scheduleUpdate = () => {
  if (isScheduled) {
    return;
  }
  isScheduled = true;
  window.queueMicrotask(processJobs);
};

const enqueueJob = (job) => {
  jobs.push(job);
  scheduleUpdate();
};

const flushPromises = () => {
  return new Promise((resolve) => setTimeout(resolve));
};

const nextTick = () => {
  scheduleUpdate();
  return flushPromises();
};

module.exports = {
  enqueueJob,
  nextTick,
};
