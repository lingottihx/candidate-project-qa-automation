import { scheduleData } from './data/scheduleData';
import { test } from './fixtures/scheduleFixture';
import { expect } from '@playwright/test';

test.use({
  locale: 'en-US',
  timezoneId: 'America/Los_Angeles'
});

test('Schedule page renders default values', async ({ schedulePage }) => {
  test.slow();

  await schedulePage.goto();

  // 1. The title of the page contains "Schedule".
  await expect.soft(schedulePage.page).toHaveTitle(scheduleData.pageTitle);

  // 2. Page header: Schedule. It should be shown with light blue color.
  await expect.soft(schedulePage.navigation.schedule).toHaveClass(scheduleData.navigation.highlightedTextClass);

  // 3. It shows default search criteria in the filters
  const { defaultSearch } = scheduleData.testCase;
  const { location, service, date } = defaultSearch.filters;
  await expect.soft(schedulePage.quickSelector.locationSelector).toContainText(location);
  await expect.soft(schedulePage.quickSelector.serviceSelector).toContainText(service);
  await expect.soft(schedulePage.quickSelector.dateSelector).toContainText(date, { timeout: 10000 });

  // 4. It shows the buttons "Clinic Care" and "VideoCare (TM)".
  await expect.soft(schedulePage.chatButtons.clinicCare).toBeVisible({timeout: 10000});
  await expect.soft(schedulePage.chatButtons.videoCare).toBeVisible();

  // 5. It shows a table with the header "Illness/Injury Clinic Visit"
  const serviceLine = schedulePage.getServiceLine(1);
  const { tableHeader } = defaultSearch.searchResults;
  await expect.soft(serviceLine.title).toContainText(tableHeader);
  await expect.soft(serviceLine.info).toBeVisible();

  const clinic = serviceLine.getClinic(1);
  await expect.soft(clinic.location.name).toBeVisible();
  await expect.soft(clinic.location.mapButton).toBeVisible();
  await expect.soft(clinic.viewClinicServices).toBeVisible();

  const provider = clinic.getProvider(1);
  await expect.soft(provider.avatar).toBeVisible();
  await expect.soft(provider.name).toBeVisible();
  await expect.soft(provider.dateInfo).toBeVisible();

  const firstTimeSlot = provider.timeSlots.getByIndex(1);

  await expect.soft(firstTimeSlot).toBeVisible();

  await expect(schedulePage.footer).toBeVisible();

});


test("Unauthenticated user searches the first time slot and schedules it.", async ({ page, schedulePage }) => {
  test.slow();

  await schedulePage.goto();

  // 3. It shows default search criteria in the filters
  const { newSearch } = scheduleData.testCase;
  const { location, service, date } = newSearch.filters;

  // Wait until the page completes loading before clicking
  const serviceLine = schedulePage.getServiceLine(1);
  await expect(serviceLine.title).toBeVisible({ timeout: 30000 });

  await test.step("Change location", async () => {
    await schedulePage.quickSelector.locationSelector.click();
    await schedulePage.getLocationOption(location).click();
    await expect(schedulePage.quickSelector.locationSelector).toContainText(location);
  });

  const scheduleResponse = await test.step("Change service", async () => {
    await schedulePage.quickSelector.serviceSelector.click();
    const schedulePromise = page.waitForResponse("https://api-prod.zoomcare.com/v1/schedule");
    await schedulePage.getServiceOption(service).click();
    await expect.soft(schedulePage.quickSelector.serviceSelector).toContainText(service);
    return await (await schedulePromise).json();
  });

  await test.step("Change day only in the current month.", async () => {
    const expectedDate = new Date(scheduleResponse.datesAvailable[date]);
    let newDay = expectedDate.getDate();
    await schedulePage.quickSelector.dateSelector.click();
    let expectedText: string
    if (newDay > 1) {
      expectedText = "Tomorrow";
    } else {
      newDay = new Date(scheduleResponse.datesAvailable[0]).getDate();
      expectedText = "Today";
    }
    await schedulePage.getDate(newDay).click();
    await expect(schedulePage.quickSelector.dateSelector).toContainText(expectedText);
  });

  await test.step("Click search button.", async () => {
    const { searchButton } = schedulePage.quickSelector;
    const schedulePromise = page.waitForResponse("https://api-prod.zoomcare.com/v1/schedule");
    await searchButton.click();
    return await schedulePromise;
  });

  // Check service line change
  const { tableHeader } = newSearch.searchResults;
  const newServiceLine = schedulePage.getServiceLine(1)
  await expect(newServiceLine.title).toContainText(tableHeader);

  // Click first time slot.
  const firstTimeSlot = serviceLine.getClinic(1).getProvider(1).timeSlots.getByIndex(1);
  await firstTimeSlot.click();

  // Wait for login page.
  await page.waitForURL(/login/);

});

test("Unauthenticated user search for a time slot and wants more info about a service.", async ({ page, schedulePage }) => {
  test.slow();

  await schedulePage.goto();

  // 3. It shows default search criteria in the filters
  const { infoSearch } = scheduleData.testCase;
  const { location, service, date } = infoSearch.filters;

  // Wait until the page completes loading before clicking
  const serviceLine = schedulePage.getServiceLine(1);
  await expect(serviceLine.info).toBeVisible({ timeout: 30000 });

  await expect(schedulePage.quickSelector.locationSelector).toContainText(location);

  const scheduleResponse = await test.step("Change service", async () => {
    await schedulePage.quickSelector.serviceSelector.click();
    const schedulePromise = page.waitForResponse("https://api-prod.zoomcare.com/v1/schedule");
    await schedulePage.getServiceOption(service).click();
    await expect.soft(schedulePage.quickSelector.serviceSelector).toContainText(service);
    return await (await schedulePromise).json();
  });

  await test.step("Change day only in the current month.", async () => {
    await page.waitForTimeout(1000);
    const expectedDate = new Date(scheduleResponse.datesAvailable[date]);
    let newDay = expectedDate.getDate();
    await schedulePage.quickSelector.dateSelector.click();
    let expectedText: string

    const padDate = (part: number) => part.toString().padStart(2, '0');

    if (newDay > 3) {
      expectedText = `${padDate(1+expectedDate.getMonth())}/${padDate(newDay)}/${expectedDate.getFullYear()}`;
    } else {
      newDay = new Date(Date.now()).getDate();
      expectedText = "Today";
    }

    await schedulePage.getDate(newDay).click();
    await expect(schedulePage.quickSelector.dateSelector).toContainText(expectedText);
  });

  await test.step("Click search button.", async () => {
    const { searchButton } = schedulePage.quickSelector;
    const schedulePromise = page.waitForResponse("https://api-prod.zoomcare.com/v1/schedule");
    await searchButton.click();
    return await schedulePromise;
  });

  // Check service line change
  const { tableHeader } = infoSearch.searchResults;
  const newServiceLine = schedulePage.getServiceLine(1)
  await expect(newServiceLine.title).toContainText(tableHeader);

  await test.step("Get info", async () => {
    await newServiceLine.info.click();
    await expect(serviceLine.moreInfo).toBeVisible();  
  });

  await test.step("Hide info", async () => {
    await newServiceLine.info.click();
    await expect(serviceLine.moreInfo).toBeHidden();  
  });

});