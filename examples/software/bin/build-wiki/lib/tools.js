const sanitizeFilename = require('sanitize-filename')
const path = require('path')

module.exports = {
    /**
     * Sanitizes a file name
     *
     * @param {string} fileName File name to sanitize
     * @returns {string}
     */
    sanitizeFileName: (fileName) => {
        return sanitizeFilename(fileName).replace(/ +/g, '-')
    },
}
