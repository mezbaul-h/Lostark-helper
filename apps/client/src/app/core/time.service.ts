import { Injectable } from "@angular/core";
import { distinctUntilChanged, map, timer } from "rxjs";
import { addWeeks, getWeek, subDays } from "date-fns";

@Injectable({
  providedIn: "root"
})
export class TimeService {

  public lastDailyReset$ = timer(0, 1000).pipe(
    map(() => {
      // Only supports EU servers for now.
      let reset = new Date();
      reset.setUTCSeconds(0);
      reset.setUTCMinutes(0);
      reset.setUTCMilliseconds(0);
      if (reset.getUTCHours() < 10) {
        // This means the reset was yesterday
        reset = subDays(reset, 1);
      }
      reset.setUTCHours(10);
      return reset.getTime();
    }),
    distinctUntilChanged()
  );

  public lastWeeklyReset$ = timer(0, 1000).pipe(
    map(() => {
      // Target reset day Wednesday
      const weeklyReset = 3;
      // Only supports EU servers for now.
      let reset = new Date();
      reset.setUTCSeconds(0);
      reset.setUTCMinutes(0);
      reset.setUTCMilliseconds(0);
      // Last Thursday
      if (reset.getUTCDay() === weeklyReset) {
        if (reset.getUTCHours() < 10) {
          reset = subDays(reset, 7);
        }
      } else {
        let diff = weeklyReset - reset.getUTCDay();
        if (diff < 0) {
          diff = Math.abs(diff);
        } else {
          diff = 7 - diff;
        }
        reset = subDays(reset, diff);
      }
      reset.setUTCHours(10);
      return reset.getTime();
    }),
    distinctUntilChanged()
  );

  public lastBiWeeklyReset$ = this.lastWeeklyReset$.pipe(
    map((timestamp) => {
      const reset = new Date(timestamp);
      // BiWeekly reset happens every odd week #
      const week = getWeek(reset);
      if (week % 2 === 1) {
        return timestamp;
      } else {
        return addWeeks(reset, -1).getTime();
      }
    }),
    distinctUntilChanged()
  );

  /**
   * Used for Theamine reset
   */
  public lastBiWeeklyOffsetReset$ = this.lastWeeklyReset$.pipe(
    map((timestamp) => {
      const reset = new Date(timestamp);
      // BiWeekly reset happens every odd week #
      const week = getWeek(reset);
      if (week % 2 === 0) {
        return timestamp;
      } else {
        return addWeeks(reset, -1).getTime();
      }
    }),
    distinctUntilChanged()
  );
}
