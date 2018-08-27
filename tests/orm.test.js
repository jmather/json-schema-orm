const init = require('./support/init')
const loader = init.loader
const orm = init.orm

describe('ORM', () => {
    it('throws an exception when accessing an undefined repo', () => {
        expect((() => orm.getRepository('foo'))).toThrow()
    })

    it('returns defined repositories', () => {
        expect(orm.getRepositories().length).toBe(9)
    })
})
