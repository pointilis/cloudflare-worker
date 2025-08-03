export function extractJsonFromResponse(responseText: string): any {
    const jsonStartIndex = responseText.indexOf('```json');
    const jsonEndIndex = responseText.indexOf('```', jsonStartIndex + 1);

    let jsonString = '';
    if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
        jsonString = responseText.substring(jsonStartIndex + '```json'.length, jsonEndIndex).trim();
    } else {
        jsonString = responseText.trim();
    }

    try {
        return JSON.parse(jsonString);
    } catch (error) {
        return null;
    }
}