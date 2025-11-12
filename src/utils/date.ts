export class DateUtil {
    static now(): Date {
        return new Date();
    }

    static addDays(date: Date, days: number): Date {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    static addHours(date: Date, hours: number): Date {
        const result = new Date(date);
        result.setHours(result.getHours() + hours);
        return result;
    }

    static addMinutes(date: Date, minutes: number): Date {
        const result = new Date(date);
        result.setMinutes(result.getMinutes() + minutes);
        return result;
    }

    static addSeconds(date: Date, seconds: number): Date {
        const result = new Date(date);
        result.setSeconds(result.getSeconds() + seconds);
        return result;
    }

    static isBefore(date1: Date, date2: Date): boolean {
        return date1.getTime() < date2.getTime();
    }

    static isAfter(date1: Date, date2: Date): boolean {
        return date1.getTime() > date2.getTime();
    }

    static isEqual(date1: Date, date2: Date): boolean {
        return date1.getTime() === date2.getTime();
    }

    static format(date: Date, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return format
            .replace('YYYY', String(year))
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds);
    }

    static parseExpiration(expiresIn: string): Date {
        const expiresAt = new Date();
        const match = expiresIn.match(/^(\d+)([dhms])$/);

        if (!match) {
            expiresAt.setDate(expiresAt.getDate() + 7);
            return expiresAt;
        }

        const value = parseInt(match[1] || '7');
        const unit = match[2] || 'd';

        switch (unit) {
            case 'd':
                return this.addDays(expiresAt, value);
            case 'h':
                return this.addHours(expiresAt, value);
            case 'm':
                return this.addMinutes(expiresAt, value);
            case 's':
                return this.addSeconds(expiresAt, value);
            default:
                return this.addDays(expiresAt, 7);
        }
    }

    static toISOString(date: Date): string {
        return date.toISOString();
    }

    static fromISOString(isoString: string): Date {
        return new Date(isoString);
    }
}

