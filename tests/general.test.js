const path = require('path')
const JSORM = require(path.resolve(__dirname, '../src/orm/index'))

const projectPath = '../examples/software'
const projectSchemasFile = path.resolve(__dirname, projectPath, 'bundle/schemas.json')
const dataPath = path.resolve(__dirname, projectPath, 'data')

let loader = null
let orm = null

beforeAll(() => {
    loader = new JSORM.Loader()
    orm = loader.loadSchemas(projectSchemasFile)

    loader.loadData(dataPath)
})

describe('Loader', () => {
    expect(orm).not.toBe(null)
})

describe('Repository', () => {
    expect(JSON.stringify(orm.getRepository('component').get('Core API'))).toBe('')
})