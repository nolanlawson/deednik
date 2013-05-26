/* useful functions for interacting with underscore */

"use strict";

var functions = {

    identity : function() {
        return function(element) {
            return element;
        };
    },

    save  : function(dao) {
        return function(element) {
            return dao.save(element);
        };
    },

    getId : function() {
        return function(element) {
            return element._id;
        };
    },

    failTest : function(spec) {
        return function(err){
            spec.fail(new Error(err));
        };
    },

    isString : function() {
        return function(element) {
            return typeof element === 'string';
        };
    }
};

module.exports = functions;