const path = require('path')
const JSORM = require(path.resolve(__dirname, '../../index'))
const JS_ORM = require('../../index')

const projectPath = '../../examples/software'
const projectSchemasFile = path.resolve(__dirname, projectPath, 'bundle/schemas.json')
const dataPath = path.resolve(__dirname, projectPath, 'data')

const orm = JS_ORM.Loader.loadSchemas(projectSchemasFile)

orm.loadData(dataPath)

module.exports = {
    JSORM: JSORM.ORM,
    orm,
    loader
}