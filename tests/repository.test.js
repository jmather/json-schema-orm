const init = require('./support/init')
const JSORM = init.JSORM
const loader = init.loader
const orm = init.orm

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
            const components = componentRepo.getAllBy({ repository_name: 'Core Project' }).map(c => c.name)
            expect(components).toEqual(['Core API', 'Core UI'])
        })
    })
})
