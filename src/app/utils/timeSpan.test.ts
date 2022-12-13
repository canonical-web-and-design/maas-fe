import {
  timeSpanToMinutes,
  timeSpanToSeconds,
  durationToSeconds,
  durationToDays,
  secondsToDuration,
  durationToHours,
} from "./timeSpan";

describe("timeSpanToSeconds", () => {
  it("converts a partial timespan string to a number of seconds", () => {
    expect(timeSpanToSeconds("60s")).toEqual(60);
    expect(timeSpanToSeconds("1m")).toEqual(60);
    expect(timeSpanToSeconds("1h")).toEqual(3600);
  });

  it("converts a timespan string in different formats to a number of seconds", () => {
    expect(timeSpanToSeconds("1hour 1minute 1second")).toEqual(3661);
    expect(timeSpanToSeconds("1hours 1minutes 1seconds")).toEqual(3661);
    expect(timeSpanToSeconds("1hs 1ms 1s")).toEqual(3661);
    expect(timeSpanToSeconds("1h1m1s")).toEqual(3661);
  });

  it("returns 0 for a timespan string in an invalid format", () => {
    expect(timeSpanToSeconds("1")).toEqual(0);
    expect(timeSpanToSeconds("s")).toEqual(0);
  });
});

describe("formatTimeSpanStringToMinutes", () => {
  it("converts a partial timespan string to a number of minutes", () => {
    expect(timeSpanToMinutes("1s")).toEqual(0);
    expect(timeSpanToMinutes("59s")).toEqual(0);
    expect(timeSpanToMinutes("60s")).toEqual(1);
  });
});

describe("durationToSeconds", () => {
  it("converts a duration to a number of seconds", () => {
    expect(durationToSeconds({ days: 1 })).toEqual(86400);
    expect(durationToSeconds({ hours: 1 })).toEqual(3600);
    expect(durationToSeconds({ minutes: 1 })).toEqual(60);
  });
});

describe("durationToDays", () => {
  it("converts a duration to a number of days", () => {
    expect(durationToDays({ hours: 24 })).toEqual(1);
    expect(durationToDays({ hours: 240 })).toEqual(10);
    expect(durationToDays({ seconds: 86400 })).toEqual(1);
    expect(durationToDays({ minutes: 1440 })).toEqual(1);
  });
});

describe("durationToHours", () => {
  it("converts a duration to a number of days", () => {
    expect(durationToHours({ days: 1 })).toEqual(24);
    expect(durationToHours({ days: 3 })).toEqual(72);
    expect(durationToHours({ seconds: 86400 })).toEqual(24);
    expect(durationToHours({ minutes: 60 })).toEqual(1);
  });
});

describe("secondsToDuration", () => {
  it("converts a number of seconds to a Duration", () => {
    expect(secondsToDuration(60)).toEqual({
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 1,
      seconds: 0,
    });

    expect(secondsToDuration(123456789)).toEqual({
      years: 3,
      months: 10,
      days: 28,
      hours: 21,
      minutes: 33,
      seconds: 9,
    });
  });
});
