'use strict';

var GPIO = require('r-pi-gpio').GPIO;
var now = require('microtime').now;

function UltrasonicSensor(echoID, triggerID) {
    this.echo = GPIO.input(echoID);
    this.trigger = GPIO.output(triggerID);
}

exports.UltrasonicSensor = UltrasonicSensor;

UltrasonicSensor.create = function (echoID, triggerID) {
    return new UltrasonicSensor(echoID, triggerID);
};

UltrasonicSensor.prototype.destroy = function () {
    this.echo.destroy();
    this.trigger.destroy();
};

function waitForHighEcho(echo) {
    var echoStartTime = -1;
    var loopStartTime = now();

    while (!echo.read()) {
        echoStartTime = now();

        if (echoStartTime - loopStartTime > 1000) {
            return -1;
        }
    }

    return echoStartTime;
}

function waitForLowEcho(echo) {
    var echoStopTime = -1;

    while (echo.read()) {
        echoStopTime = now();
    }

    return echoStopTime;
}

UltrasonicSensor.prototype.measureDistanceInCm = function () {
    var methodStartTime = now();

    this.trigger.write(false).write(true).write(false);

    var echoStartTime = waitForHighEcho(this.echo);

    if (echoStartTime === -1) {
        return -1;
    }

    var echoStopTime = waitForLowEcho(this.echo);

    if (echoStopTime === -1) {
        return -1;
    }

    var echoTime = echoStopTime - echoStartTime;

    if (echoTime < 150 || echoTime > 25000) {
        return -1;
    }

    if (now() - methodStartTime - echoTime > 1000) {
        return -1;
    }

    return Math.floor(echoTime / 58);
};
