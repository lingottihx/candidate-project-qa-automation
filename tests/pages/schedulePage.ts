import { Locator, Page } from "@playwright/test";
import { scheduleData } from "../data/scheduleData";

export class SchedulePage {

    public readonly page: Page;

    public readonly navigation: {
        readonly schedule: Locator;
    }

    public readonly quickSelector: {
        readonly locationSelector: Locator;
        readonly serviceSelector: Locator;
        readonly dateSelector: Locator;
        readonly searchButton: Locator;
    }

    public readonly chatButtons: {
        readonly clinicCare: Locator;
        readonly videoCare: Locator;   
    }

    public footer: Locator;

    public constructor(page: Page) {
        this.page = page;
        this.navigation = {
            schedule: page.getByRole('navigation').getByRole("link", { name: scheduleData.navigation.schedule })
        }
        this.chatButtons = {
            clinicCare: page.getByTestId("text-Clinic Care"),
            videoCare: page.getByTestId("virtualVideoBox")
        }
        this.quickSelector = {
            locationSelector: page.getByTestId("quickSelector.locationSelector"),
            serviceSelector: page.getByTestId("quickSelector.serviceSelector"),
            dateSelector: page.getByTestId("quickSelector.dateSelector"),
            searchButton: page.getByTestId("button-quickSelector.searchButton")         
        };
        this.footer = page.getByRole("contentinfo");
    }

    public async goto() {
        await this.page.goto('/schedule');
    }

    public getServiceLine(serviceRow: number) {
        const serviceTestId = `ServiceLine.${serviceRow}`;
        const serviceLocator = this.page.getByTestId(serviceTestId);

        const getClinic = (clinicIndex: number) => {
            const clinicTestId = `${serviceTestId}.Clinic.${clinicIndex}`;
            const clinicLocator = serviceLocator.getByTestId(clinicTestId);

            const getProvider = (providerIndex: number) => {
                const providerTestId = `${clinicTestId}.Provider.${providerIndex}`;
                const providerLocator = clinicLocator.getByTestId(providerTestId);
                const timeSlotButtonTestIdPrefix = `button-${providerTestId}.TimeSlot`;

                const timeSlots = {
                    getByIndex: (index: number) => providerLocator.getByTestId(new RegExp(`${timeSlotButtonTestIdPrefix}.${index}-\\d*`)),
                    moreButton: providerLocator.getByTestId(`${timeSlotButtonTestIdPrefix}.moreButton`)
                };

                return {
                    providerLocator,
                    avatar: providerLocator.getByTestId("provider-avatar"),
                    name: providerLocator.getByTestId(`link-${providerTestId}.ProviderName`),
                    dateInfo: providerLocator.getByTestId(`${providerTestId}.DateInfo`),
                    timeSlots 
                };
            }

            const locationRow = clinicLocator.getByTestId(`${clinicTestId}.LocationRow`);
            const location = {
                name: locationRow.getByTestId(/link-\.*/),
                mapButton: locationRow.getByTestId(/map-button-\.*/)
            }

            return {
                clinicLocator,
                location,
                viewClinicServices: clinicLocator.getByTestId("text-View Clinic Services"),
                getProvider
            }
        };

        return {
            serviceLocator,
            title: serviceLocator.getByRole("heading"),
            info: serviceLocator.getByTestId(/text-scheduler.serviceLine.info-\.*/),
            getClinic
        };
    }

    public getLocationOption (location: string) {
        return this.page.getByTestId(`text-quick-selector-option-location-${location}`);
    }

    public getServiceOption (service: string) {
        return this.page.getByTestId(`text-quick-selector-option-service-${service}`);
    }

    public getDate (day:number) {
        return this.page.getByText(`${day}`, { exact: true} );
    }

} 
