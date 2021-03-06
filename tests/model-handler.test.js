const init = require('./support/init')
const JSORM = init.JSORM
const loader = init.loader
const orm = init.orm

let model = orm.getRepository('component').get('Core API')

describe('ModelHandler', () => {
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
        expect(model.___handler___ instanceof orm.ModelHandler).toBe(true)
    })

    it('component_dependency has records', () => {
        const repo = orm.getRepository('component_dependency')
        expect(repo.getAll().length).toBeGreaterThan(0)
    })

    it('Core API has a child component', () => {
        expect(model.child_components.length).toBe(1)
    })

    it('handles expressions for realizies', () => {
        const ref = orm.getRepository('component_dependency').getAll()[0]
        expect(ref.name).toBe('Core API Core UI')
    })
})