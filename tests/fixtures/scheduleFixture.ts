import { test as base } from "@playwright/test";
import { SchedulePage } from "../pages/schedulePage";

type ScheduleFixture = {
  schedulePage: SchedulePage;
};

export const test = base.extend<ScheduleFixture>({
  schedulePage: async ({ page }, use) => {
    const schedulePage = new SchedulePage(page);
    await use(schedulePage);
  },
});
