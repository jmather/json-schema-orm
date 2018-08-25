class Schema {
    /**
     *
     * @param {{ orm: Object, properties: Object }} schema
     */
    constructor(schema) {
        this.schema = schema
    }

    /**
     *
     * @returns Array{{ schema: string, local_property: string, local_key: string, foreign_key: string, type: string }}
     */
    getRelations() {
        return this.schema.orm.relations || []
    }

    getPrimaryProperty() {
        return this.schema.orm.primary_property
    }
}

module.exports = Schema