export function generateRandomTemperature(previousTemperature: number) {
    const MIN_TEMP: number = 0;
    const MAX_TEMP: number = 100;
    const CHANGE_RATE: number = 0.2;

    const centralValue: number = previousTemperature > (MAX_TEMP - MIN_TEMP) / 2 ? MAX_TEMP : MIN_TEMP;

    const maxChange: number = Math.abs(centralValue - previousTemperature) * CHANGE_RATE;

    const delta: number = Math.random() * maxChange * (Math.random() > 0.5 ? 1 : -1);

    const newTemperature: number = previousTemperature + delta;

    return Math.max(MIN_TEMP, Math.min(MAX_TEMP, newTemperature));
}
