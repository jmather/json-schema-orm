const tools = require('../../tools')
const cli = require('cli')
const Ajv = require('ajv')
const betterAjvErrors = require('better-ajv-errors');
const glob = require('glob')
const path = require('path')
const refResolver = require('json-schema-ref-parser')
const ajv = new Ajv({ jsonPointers: true })

cli.parse(null, ['meta-schemas', 'schemas', 'data'])

function ajvDefaultMeta(self) {
    var meta = self._opts.meta;
    self._opts.defaultMeta = typeof meta == 'object'
        ? self._getId(meta) || meta
        : self.getSchema(META_SCHEMA_ID)
            ? META_SCHEMA_ID
            : undefined;
    return self._opts.defaultMeta;
}

cli.main((args, options) => {
    let hadError = false,
        schemaPath = null,
        schemas = null,
        root = null,
        dataPath = null,
        datas = null,
        promises = null

    switch (cli.command) {
        case 'meta-schemas':
            schemaPath = tools.root('meta-schemas') + '/**.yaml'
            schemas = glob.sync(schemaPath)

            schemas.forEach(schemaFile => {
                const schema = tools.loadYAML(schemaFile)
                cli.info(`checking ${schemaFile}...`)

                if (!ajv.validateSchema(schema)) {
                    var $schema = schema.$schema;
                    if ($schema !== undefined && typeof $schema != 'string')
                        throw new Error('$schema must be a string')
                    $schema = $schema || ajv._opts.defaultMeta || ajvDefaultMeta(ajv)

                    cli.error(`Error processing ${schemaFile}`)
                    cli.error(betterAjvErrors($schema, schema, ajv.errors, { format: 'cli', indent: 2}))
                    // cli.error(betterAjvErrors($schema, schema, ajv.errors))
                    // cli.error(tools.prettyJSON(ajv.errors))
                    hadError = true
                }
            })

            if (hadError) {
                process.exit(1)
            }

            cli.ok('All schemas confirmed')
            break
        case 'schemas':
            root = tools.root('meta-schemas')

            refResolver.dereference(`${root}/json-schema-orm.schema.yaml`).then(metaSchema => {
                // console.log(tools.prettyJSON(metaSchema));
                // schema.allOf.push({ $ref: 'http://json-schema.org/draft-07/schema' })

                schemaPath = path.resolve(tools.root(options), 'schemas') + '/**.yaml'
                // console.log(schemaPath)
                schemas = glob.sync(schemaPath)

                schemas.forEach(schemaFile => {
                    cli.info(`Loading ${schemaFile}...`)
                    const schema = tools.loadYAML(schemaFile)
                    cli.info(`Checking ${schemaFile}...`)
                    const validate = ajv.compile(metaSchema);
                    if (! validate(schema)) {
                        cli.error(`Error processing ${schemaFile}`)
                        cli.error(betterAjvErrors(metaSchema, schema, validate.errors, { format: 'cli', indent: 2}));
                        // cli.error(tools.prettyJSON(validate.errors))
                        hadError = true
                    }
                })

                if (hadError) {
                    process.exit(1)
                }

                cli.ok('All schemas confirmed')

            }).catch(e => {
                cli.error(e)
            })

            break

        case 'data':
            root = path.resolve(tools.root(options), 'schemas')

            dataPath = path.resolve(tools.root(options), 'data') + '/**/**.yaml'
            // console.log(schemaPath)
            datas = glob.sync(dataPath)

            promises = datas.map(dataFile => {
                const schemaFile = path.resolve(root, path.basename(dataFile).split('.').splice(-2, 1) + '.schema.yaml')

                return refResolver.dereference(schemaFile).then(metaSchema => {
                    cli.info(`checking ${path.basename(dataFile)} against ${path.basename(schemaFile)}...`)
                    const data = tools.loadYAML(dataFile)
                    if (!ajv.validate(metaSchema, data)) {
                        cli.error(`Error processing ${dataFile}`)
                        cli.error(betterAjvErrors(metaSchema, data, ajv.errors, { format: 'cli', indent: 2}))
                        // cli.error(tools.prettyJSON(ajv.errors))
                        hadError = true
                    }
                }).catch(e => {
                    cli.error(e)
                })
            })

            Promise.all(promises).then(() => {
                if (hadError) {
                    process.exit(1)
                }

                cli.ok('All schemas confirmed')
            })

            break
    }
})
