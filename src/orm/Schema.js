class Schema {
    /**
     *
     * @param {string} name
     * @param {{ orm: { singular: string, plural: string, primary_property: string }}} schema
     */
    constructor(name, schema) {
        this.name = name
        this.schema = schema
    }

    /**
     *
     * @returns {string}
     */
    getName() {
        return this.name
    }

    /**
     *
     * @returns Array{{ schema: string, local_property: string, local_key: string, foreign_key: string, type: string }}
     */
    getRelations() {
        return this.schema.orm.relations || []
    }

    /**
     *
     * @returns {string}
     */
    getPrimaryProperty() {
        return this.schema.orm.primary_property
    }
}

module.exports = Schema