// http://stackoverflow.com/questions/7279567/how-do-i-pause-a-window-setinterval-in-javascript

function RecurringTimer(callback, delay) {
  var timerId, start, remaining = delay;

  this.pause = function () {
    window.clearTimeout(timerId);
    remaining -= new Date() - start;
  };

  var resume = function () {
    start = new Date();
    timerId = window.setTimeout(function () {
      remaining = delay;
      resume();
      callback();
    }, remaining);
  };

  this.resume = resume;

  this.resume();
}