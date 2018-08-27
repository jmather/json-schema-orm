const init = require('./support/init')
const JSORM = init.JSORM
const loader = init.loader
const orm = init.orm

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