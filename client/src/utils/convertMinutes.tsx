export function convertMinutes(num: number) {
    const days = Math.floor(num / 1440); // 60*24
    const hours = Math.floor((num - days * 1440) / 60);
    const minutes = Math.round(num % 60);

    if (days > 0) {
        return `${days} days ${hours} hours ${minutes} min`;
    } else if (hours > 0) {
        return `${hours} hours ${minutes} min`;
    } else {
        return `${minutes} min`;
    }
}