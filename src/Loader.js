const glob = require('glob')
// const _ = require('underscore')
const tools = require('./tools')
const ORM = require('./orm/ORM')
const ModelHandler = require('./orm/ModelHandler')
const Repository = require('./orm/Repository')
const Schema = require('./orm/Schema')
const SchemaCollection = require('./orm/SchemaCollection')

const classDefaults = Object.freeze({
    orm: ORM,
    modelHandler: ModelHandler,
    repository: Repository,
    schema: Schema,
    schemaCollection: SchemaCollection,
});

/**
 * @typedef {Object} ClassOverrides
 * @property {typeof ModelHandler} [modelHandler]
 * @property {typeof Repository} [repository]
 * @property {typeof Schema} [schema]
 * @property {typeof SchemaCollection} [schemaCollection]
 * @property {typeof ORM} [orm]
 */

class Loader {
    /**
     *
     * @static
     * @param {string|Object} schemasBundleFile
     * @param {ClassOverrides} [classOverrides]
     * @returns {ORM & {loadData: (filePath: string) => void}}
     */
    static loadSchemas(schemasBundleFile, classOverrides = {}) {
        const getClass = (name) => {
            return classOverrides[name] || classDefaults[name]
        }

        this.schemas = require(schemasBundleFile).definitions.schemas
        const schemaCollClass = getClass('schemaCollection')
        const schemaCollection = new schemaCollClass(this.schemas, getClass('schema'))
        const ormClass = getClass('orm')
        const orm = new ormClass(schemaCollection, getClass('modelHandler'), getClass('repository'))
        orm.loadData = (dataPath) => {
            const dataFiles = glob.sync(dataPath + '/**/**.yaml')
            dataFiles.forEach(dataFile => {
                const schemaName = dataFile.split('/').pop().split('.').splice(-2, 1)
                const repo = orm.getRepository(schemaName)
                const data = tools.loadYAML(dataFile)
                repo.add(data)
            })
        }

        return orm
    }
}

module.exports = Loader