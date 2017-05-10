export function getLastFriday() {
    const d = new Date();
    const friday = new Date();
    const dateOfMonth = d.getDate() + (6 - d.getDay() - 1) - 7;

    friday.setDate(dateOfMonth);
    friday.setHours(0);
    friday.setMinutes(0);
    friday.setSeconds(0);
    friday.setMilliseconds(0);

    const t = 5;

    return {
        date: friday,
        yyyyMmDd: friday.toISOString().split("T")[0]
    }
}