const path = require('path')
const JSORM = require(path.resolve(__dirname, '../src/orm/index'))

const projectPath = '../examples/software'
const projectSchemasFile = path.resolve(__dirname, projectPath, 'bundle/schemas.json')
const dataPath = path.resolve(__dirname, projectPath, 'data')

const loader = new JSORM.Loader()
const orm = loader.loadSchemas(projectSchemasFile)

loader.loadData(dataPath)

describe('Loader', () => {
    it('is not null', () => {
        expect(orm).not.toBe(null)
    })
})

describe('Repository', () => {
    it('returns as expected', () => {
        expect(JSON.stringify(orm.getRepository('component').get('Core API'))).toBe('{"name":"Core API","repository_name":"Core Project"}')
    })
})