// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

const config = require('./jest.config')

config.collectCoverage = true
config.coverageDirectory = 'coverage'
config.coveragePathIgnorePatterns = [ '/node_modules/' ]

module.exports = config