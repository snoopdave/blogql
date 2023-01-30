"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonthsAgo = exports.WeeksAgo = exports.Primary = void 0;
var DateTime_1 = require("./DateTime");
exports.default = {
    title: 'DateTime',
    component: DateTime_1.RelativeDateTime,
};
var now = new Date();
var Primary = function () {
    return <DateTime_1.RelativeDateTime when={now}/>;
};
exports.Primary = Primary;
var threeWeeksAgo = new Date();
threeWeeksAgo.setTime(threeWeeksAgo.getTime() - (3 * 7 * 24 * 60 * 60 * 1000));
var WeeksAgo = function () {
    return <DateTime_1.RelativeDateTime when={threeWeeksAgo}/>;
};
exports.WeeksAgo = WeeksAgo;
var threeMonthsAgo = new Date();
threeMonthsAgo.setTime(threeMonthsAgo.getTime() - (3 * 4 * 7 * 24 * 60 * 60 * 1000));
var MonthsAgo = function () {
    return <DateTime_1.RelativeDateTime when={threeMonthsAgo}/>;
};
exports.MonthsAgo = MonthsAgo;
