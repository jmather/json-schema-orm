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

describe('ORM', () => {
    it('throws an exception when accessing an undefined repo', () => {
        expect((() => orm.getRepository('foo'))).toThrow()
    })

    it('returns defined repositories', () => {
        expect(orm.getRepositories().length).toBe(9)
    })
})

describe('Repository', () => {
    const componentRepo = orm.getRepository('component')

    describe('getName', () => {
        it('returns the name', () => {
            expect(componentRepo.getName()).toBe('component')
        })
    })

    describe('getSchema', () => {
        it('returns the schema', () => {
            expect(componentRepo.getSchema()).toBeInstanceOf(JSORM.Schema)
        })
    })

    describe('getAll', () => {
        it('returns all objects', () => {
            expect(componentRepo.getAll().length).toBe(2)
        })
    })

    describe('add', () => {
        it('refuses to add objects already tracked', () => {
            const obj = componentRepo.get('Core API')
            expect(componentRepo.add(obj)).toBe(null)
        })
    })

    describe('get', () => {
        it('returns Core API as expected', () => {
            expect(JSON.stringify(componentRepo.get('Core API'))).toBe('{"name":"Core API","repository_name":"Core Project"}')
        })

        it('returns null on no record', () => {
            expect(componentRepo.get('foo')).toBe(null)
        })
    })

    describe('getAllBy', () => {
        it('Returns all matches as expected', () => {
            const components = componentRepo.getAllBy('repository_name', 'Core Project').map(c => c.name)
            expect(components).toEqual(['Core API', 'Core UI'])
        })
    })
})

describe('ModelHandler', () => {
    let model = orm.getRepository('component').get('Core API')

    it('allows property access', () => {
        expect(model.name).toBe('Core API')
    })

    it('traverses hasOne relationships', () => {
        expect(model.repository.name).toBe('Core Project')
    })

    it('traverses belongsToMany relationships', () => {
        const manyModel = orm.getRepository('repository').get('Core Project')
        const components = manyModel.components.map(c => c.name)

        expect(components).toEqual(['Core API', 'Core UI'])
    })

    it('returns the model handler', () => {
        expect(model.___handler___ instanceof JSORM.ModelHandler).toBe(true)
    })
})