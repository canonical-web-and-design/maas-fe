/* Copyright 2019 Canonical Ltd.  This software is licensed under the
 * GNU Affero General Public License version 3 (see the file LICENSE).
 *
 * Unit tests for sendAnalyticsEvent.
 */
import angular from "angular";

describe("sendAnalyticsEvent", () => {
  // Load the MAAS module.
  beforeEach(angular.mock.module("MAAS"));

  // Load the sendAnalyticsEvent.
  var sendAnalyticsEvent;
  beforeEach(inject($filter => {
    sendAnalyticsEvent = $filter("sendAnalyticsEvent");
  }));

  it("sends an event to Google Analytics", () => {
    spyOn(window, "ga");
    sendAnalyticsEvent("eventCategory", "eventAction", "eventLabel");
    expect(window.ga).toHaveBeenCalled();
  });

  it("does not send an event if argument missing", () => {
    spyOn(window, "ga");
    sendAnalyticsEvent("eventCategory", "eventAction");
    expect(window.ga).not.toHaveBeenCalled();
  });
});
