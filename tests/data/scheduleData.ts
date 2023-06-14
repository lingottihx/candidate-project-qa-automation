export const scheduleData = {
    pageTitle: "Schedule | ZoomCare",
    navigation: {
        highlightedTextClass: /w--current/,
        schedule: 'Schedule'
    },
    directLinkButtons: [ "Clinic Care", "VideoCare (TM)" ],
    testCase: {
        blankSearch: {
            service: "Choose Service",
            date: "Choose Date"
        },
        defaultSearch: {
            filters: {
                location: "Portland, OR",
                service: "Illness/Injury",
                date: /Today|Tomorrow/
            },
            searchResults: {
                tableHeader: "Illness/Injury Clinic Visit",
            }        
        },
        newSearch: {
            filters: {
                location: "Seattle, WA",
                service: "Primary Care",
                date: 1
            },
            searchResults: {
                tableHeader: "Primary Care",
            } 
        },
        infoSearch: {
            filters: {
                location: "Portland, OR",
                service: "Women's Health (Gynecology)",
                date: 3
            },
            searchResults: {
                tableHeader: "Women's Health",
            } 
        }

    }
    
}