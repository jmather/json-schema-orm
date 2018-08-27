const path = require('path')
const JSORM = require(path.resolve(__dirname, '../../src/orm/index'))

const projectPath = '../../examples/software'
const projectSchemasFile = path.resolve(__dirname, projectPath, 'bundle/schemas.json')
const dataPath = path.resolve(__dirname, projectPath, 'data')

const loader = new JSORM.Loader()
const orm = loader.loadSchemas(projectSchemasFile)

loader.loadData(dataPath)

module.exports = {
    JSORM,
    orm,
    loader
}