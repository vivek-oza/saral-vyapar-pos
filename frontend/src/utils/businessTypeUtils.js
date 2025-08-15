/**
 * Utility functions for handling business type compatibility
 */

/**
 * Normalizes business type for display purposes
 * Converts legacy "Freelancer" to "Freelancer or Service"
 * @param {string} businessType - The business type from database
 * @returns {string} - Normalized business type for display
 */
export const normalizeBusinessTypeForDisplay = (businessType) => {
    if (businessType === 'Freelancer') {
        return 'Freelancer or Service';
    }
    return businessType;
};

/**
 * Checks if a business type is service-based (includes both old and new terminology)
 * @param {string} businessType - The business type to check
 * @returns {boolean} - True if it's a service-based business
 */
export const isServiceBusiness = (businessType) => {
    return ['Freelancer', 'Freelancer or Service'].includes(businessType);
};

/**
 * Checks if a business type matches the given type (with backward compatibility)
 * @param {string} businessType - The business type from database
 * @param {string} targetType - The type to match against
 * @returns {boolean} - True if types match (considering backward compatibility)
 */
export const businessTypeMatches = (businessType, targetType) => {
    // Handle backward compatibility
    if (targetType === 'Freelancer or Service' && businessType === 'Freelancer') {
        return true;
    }
    if (targetType === 'Freelancer' && businessType === 'Freelancer or Service') {
        return true;
    }
    return businessType === targetType;
};

/**
 * Filters items based on business type with backward compatibility
 * @param {Array} items - Array of items with businessTypes property
 * @param {string} userBusinessType - User's business type
 * @returns {Array} - Filtered items
 */
export const filterByBusinessType = (items, userBusinessType) => {
    if (!userBusinessType) return items;

    return items.filter(item => {
        if (!item.businessTypes) return true;

        return item.businessTypes.some(type =>
            businessTypeMatches(userBusinessType, type)
        );
    });
};