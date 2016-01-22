'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.globalIdForType = globalIdForType;

var _graphql = require('graphql');

var _graphqlError = require('graphql/error');

var _graphqlLanguage = require('graphql/language');

var _graphqlRelay = require('graphql-relay');

function globalIdHasExactType(resolvedGlobalId, type) {
  return resolvedGlobalId.type === type.name;
}

/**
 * Creates the configuration for an id input field on a mutation, using
 * `fromGlobalId` to deconstruct the ID and validate for the provided typename.
 * The ResolvedGlobalID is passed into the mutateAndGetPayload function.
 */

function globalIdForType(type) {
  return new _graphql.GraphQLNonNull(new _graphql.GraphQLScalarType({
    name: type.name + 'GlobalID',
    description: 'The `' + type.name + 'GlobalID` scalar type represents a globally unique\n      identifier, often used to refetch an object or as key for a cache. The\n      Global ' + type.name + ' ID type appears in a JSON response as a String;\n      however, it is not intended to be human-readable. When expected as an\n      input type, the incoming string will be accepted as a ' + type.name + 'GlobalID\n      if it can be interpreted using Relay\'s `fromGlobalId` function, and\n      the resolved global ID type is ' + type.name + '. If ' + type.name + ' is a\n      GraphQLInterfaceType or GraphQLUnionType, the incoming string will be\n      accepted if its resolved global ID type implements or is a member of\n      ' + type.name + '.',
    serialize: String,
    parseValue: String,
    parseLiteral: function parseLiteral(ast) {
      if (ast.kind !== _graphqlLanguage.Kind.STRING) {
        throw new _graphqlError.GraphQLError('Query error: Global ID must be a String,\n          but received a ' + ast.kind + '.', [ast]);
      }

      var resolvedGlobalId = (0, _graphqlRelay.fromGlobalId)(ast.value);

      if (globalIdHasExactType(resolvedGlobalId, type)) {
        return resolvedGlobalId;
      }

      if (type instanceof _graphql.GraphQLInterfaceType) {
        throw new _graphqlError.GraphQLError('Query error: globalIdForType() does not yet\n          support GraphQLInterfaceType.');
      }

      if (type instanceof _graphql.GraphQLUnionType || type instanceof _graphql.GraphQLInterfaceType) {
        var isAnyPossibleType = type.getPossibleTypes().some(function (possibleType) {
          return globalIdHasExactType(resolvedGlobalId, possibleType);
        });
        if (isAnyPossibleType) {
          return resolvedGlobalId;
        }
      }

      return null;
    },
    getPossibleTypes: function getPossibleTypes() {
      return type.getPossibleTypes ? type.getPossibleTypes() : type;
    }
  }));
}