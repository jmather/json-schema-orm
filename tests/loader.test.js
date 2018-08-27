const init = require('./support/init')
const loader = init.loader
const orm = init.orm

describe('Loader', () => {
    it('is not null', () => {
        expect(orm).not.toBe(null)
    })
})
