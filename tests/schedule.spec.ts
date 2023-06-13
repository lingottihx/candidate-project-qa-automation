import { scheduleData } from './data/scheduleData';
import { test } from './fixtures/scheduleFixture';
import { expect } from '@playwright/test';

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
  await expect.soft(schedulePage.chatButtons.clinicCare).toBeVisible();
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
