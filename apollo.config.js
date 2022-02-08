module.exports = {
    client: {
        includes: ['src/{pages,components,hocs,services}/**/*.{tsx,ts}'],
        localSchemaFile: 'schema.gql',
        service: {
            localSchemaFile: './schema.gql',
        },
    },
};