/**
 * CSV Email Parser
 * 
 * Parses CSV files to extract email addresses.
 * Handles various CSV formats and validates emails.
 */

/**
 * Parse CSV content and extract email addresses
 * 
 * Supports:
 * - Single column of emails
 * - Multiple columns (finds email column)
 * - Headers or no headers
 * - Comma, semicolon, or tab delimiters
 * 
 * @param csvContent - Raw CSV content as string
 * @returns Array of valid email addresses (deduplicated)
 */
export function parseEmailsFromCSV(csvContent: string): string[] {
    const emails = new Set<string>();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Split into lines
    const lines = csvContent
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0);

    if (lines.length === 0) {
        return [];
    }

    // Try to detect delimiter
    const delimiter = detectDelimiter(lines[0]);

    // Process each line
    for (const line of lines) {
        // Split by delimiter
        const fields = line.split(delimiter).map(field => field.trim());

        // Check each field for email
        for (const field of fields) {
            // Remove quotes if present
            const cleanField = field.replace(/^["']|["']$/g, '');

            // Validate email
            if (emailRegex.test(cleanField)) {
                emails.add(cleanField.toLowerCase());
            }
        }
    }

    return Array.from(emails);
}

/**
 * Detect CSV delimiter
 */
function detectDelimiter(line: string): string {
    const delimiters = [',', ';', '\t', '|'];

    for (const delimiter of delimiters) {
        if (line.includes(delimiter)) {
            return delimiter;
        }
    }

    // Default to comma
    return ',';
}

/**
 * Parse comma-separated emails from textarea
 * 
 * @param text - Comma or newline separated emails
 * @returns Array of valid email addresses (deduplicated)
 */
export function parseEmailsFromText(text: string): string[] {
    const emails = new Set<string>();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Split by comma, semicolon, or newline
    const parts = text
        .split(/[,;\n\r]+/)
        .map(part => part.trim())
        .filter(part => part.length > 0);

    for (const part of parts) {
        if (emailRegex.test(part)) {
            emails.add(part.toLowerCase());
        }
    }

    return Array.from(emails);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Deduplicate and validate emails
 */
export function deduplicateEmails(emails: string[]): string[] {
    const unique = new Set<string>();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    for (const email of emails) {
        const cleaned = email.trim().toLowerCase();
        if (cleaned && emailRegex.test(cleaned)) {
            unique.add(cleaned);
        }
    }

    return Array.from(unique);
}
