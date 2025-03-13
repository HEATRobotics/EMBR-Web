function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

export function generateRandomThermalTemperature(previousTemperature: number): number {
    const AMBIENT_TEMP: number = 10; 
    const MAX_TEMP: number = 90;
    const TEMP_CHANGE_RATE: number = 10;

    const temperatureChange: number = (Math.random() - 0.5) * 2 * TEMP_CHANGE_RATE;
    let newTemperature: number = previousTemperature + temperatureChange;
    newTemperature = clamp(newTemperature, AMBIENT_TEMP, MAX_TEMP);

    return newTemperature;
}
