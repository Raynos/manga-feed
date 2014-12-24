'use strict';

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
        var err = reportError(report.errors);
        err.statusCode = 400;
        return Result.Err(err);
    } else {
        return Result.Ok(shape);
    }
}

function reportError(errors) {
    function errorDescription(err) {
        return 'The `' + err.path + '` attribute fails the `' +
            err.validator + '` check. ' + err.message;
    }

    function expandErrors(errors) {
        return errors.reduce(function fixOneOf(acc, e) {
            if (e.validator === 'oneOf') {
                var context = e.context;
                context = context.map(function getErrors(x) {
                    return x.errors;
                });
                context = context.sort(function byLen(a, b) {
                    return a.length > b.length ? 1 : -1;
                });
                // console.log('context', context);
                var size = context[0].length;
                context = context.filter(function isSmall(x) {
                    return x.length === size;
                });
                context = [].concat.apply([], context);

                acc = acc.concat(context);
                return acc;
            }

            acc.push(e);
            return acc;
        }, []);
    }

    errors = expandErrors(errors);

    var err = new Error();
    err.message = errorDescription(errors[0]);
    err.messages = [];

    errors.forEach(function setPath(error) {
        err.messages.push(errorDescription(error));
    });

    Object.defineProperty(err, 'original', {
        value: errors,
        configurable: true,
        enumerable: false
    });
    // console.log('original', err.original);

    return err;
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
