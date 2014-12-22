'use strict';

var cachedKey = 'COMPILE_SCHEMA_CACHE_KEY';

module.exports = compileSchemaWrapper;

function compileSchemaWrapper(schema, opts) {
    if (schema[cachedKey]) {
        return schema[cachedKey];
    }

    var schemaType = opts.schemaType;
    var schemaName = opts.schemaName;

    var code = '';
    var fnName = 'validate' + schemaName + schemaType;
    code += 'function ' + fnName + '(shape) {\n';
    code += '    var errors = [];';
    code += compileSchema(schema);
    code += '}\n';

    schema[cachedKey] = true;
}

function compileSchema(schema) {
    if (schema.type === 'object') {
        return compileObjectSchema(schema);
    }
}

function compileObjectSchema(schema) {
    // var code = '';

    // if (schema.additionalProperties === false) {
    //     var keys = Object.keys(schema.properties);
    // }
}
