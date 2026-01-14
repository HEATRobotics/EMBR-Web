// Since I don't know what format the date/time will be sent by the bot, all you will need to do is update this function once you know the actual format
export function parseDateTime(datetime){
    // Logic for parsing javascript's Date() object into YYYY-MM-DD HH:MM:SS format
    const year = datetime.getUTCFullYear();
    const month = String(datetime.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(datetime.getUTCDate()).padStart(2, '0');
    const hours = String(datetime.getUTCHours()).padStart(2, '0');
    const minutes = String(datetime.getUTCMinutes()).padStart(2, '0');
    const seconds = String(datetime.getUTCSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
