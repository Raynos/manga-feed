'use strict';

var ValidationError = require('error/validation');
var Result = require('rust-result');
var extend = require('xtend');
var themis = require('themis');
var createStore = require('weakmap-shim/create-store');

var ValidatorStore = createStore();

module.exports = validateShape;

function validateShape(schema, shape) {
    var validator = getValidator(schema);
    var report = validator(shape);

    if (!report.valid) {
        var err = ValidationError(report.errors);
        err.statusCode = 400;
        err.attribute = report.errors[0].relative_schema_path;
        err.original = report.errors;
        return Result.Err(err);
    } else {
        return Result.Ok(shape);
    }
}

function getValidator(schema) {
    var meta = ValidatorStore(schema);
    if (meta.validate) {
        return meta.validate;
    }

    var newSchema = extend({
        id: 'defaultSchemaId'
    }, schema);

    var validator = themis.validator(newSchema);
    meta.validate = validate;

    return validate;

    function validate(shape) {
        return validator(shape, newSchema.id);
    }
}
