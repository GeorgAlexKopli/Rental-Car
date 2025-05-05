const MIN_AGE = 18;
const COMPACT_MIN_AGE = 18;
const COMPACT_MAX_AGE = 21;
const RACER_YOUNG_DRIVER_AGE = 25;
const RACER_YOUNG_DRIVER_SURCHARGE = 0.5;
const HIGH_SEASON_MONTH_START = 4; // April
const HIGH_SEASON_MONTH_END = 10;  // October
const HIGH_SEASON_SURCHARGE = 0.15;
const LONG_RENTAL_DAYS = 10;
const LONG_RENTAL_DISCOUNT = 0.10;
const LICENSE_SURCHARGE_UNDER_2_YEARS = 0.30;
const LICENSE_FEE_UNDER_3_YEARS = 15;

function price(pickup, dropoff, pickupDate, dropoffDate, type, age, licenseYears) {
    const category = getCategory(type);
    const rentalDays = calculateRentalDays(pickupDate, dropoffDate);
    const season = determineSeason(pickupDate, dropoffDate);

    // Eligibility checks
    if (age < MIN_AGE) {
        return "Driver too young - cannot quote the price";
    }
    if (age <= COMPACT_MAX_AGE && category !== "Compact") {
        return "Drivers 21 y/o or less can only rent Compact vehicles";
    }
    if (licenseYears < 1) {
        return "Driver must hold a license for at least 1 year";
    }

    let dailyPrice = Math.max(age, 0);
    let basePrice = dailyPrice * rentalDays;

    // Category-based adjustments
    if (category === "Racer" && age <= RACER_YOUNG_DRIVER_AGE && season !== "Low") {
        basePrice *= 1 + RACER_YOUNG_DRIVER_SURCHARGE;
    }

    // Season adjustments
    if (season === "High") {
        basePrice *= 1 + HIGH_SEASON_SURCHARGE;
    }

    // Long rental discount (low season only)
    if (rentalDays > LONG_RENTAL_DAYS && season === "Low") {
        basePrice *= 1 - LONG_RENTAL_DISCOUNT;
    }

    // License-based surcharges
    if (licenseYears < 2) {
        basePrice *= 1 + LICENSE_SURCHARGE_UNDER_2_YEARS;
    }
    if (licenseYears < 3 && season === "High") {
        basePrice += LICENSE_FEE_UNDER_3_YEARS * rentalDays;
    }

    return `$${basePrice.toFixed(2)}`;
}

function getCategory(type) {
    const mapping = {
        "Compact": "Compact",
        "Electric": "Electric",
        "Cabrio": "Cabrio",
        "Racer": "Racer"
    };
    return mapping[type] || "Unknown";
}

function calculateRentalDays(pickupDate, dropoffDate) {
    const msPerDay = 24 * 60 * 60 * 1000;
    const days = Math.abs(new Date(dropoffDate) - new Date(pickupDate)) / msPerDay;
    return Math.ceil(days) + 1; // Include both pickup and dropoff days
}

function determineSeason(pickupDate, dropoffDate) {
    const pickupMonth = new Date(pickupDate).getMonth() + 1;
    const dropoffMonth = new Date(dropoffDate).getMonth() + 1;
    if (
        pickupMonth >= HIGH_SEASON_MONTH_START && pickupMonth <= HIGH_SEASON_MONTH_END ||
        dropoffMonth >= HIGH_SEASON_MONTH_START && dropoffMonth <= HIGH_SEASON_MONTH_END
    ) {
        return "High";
    }
    return "Low";
}

exports.price = price;
