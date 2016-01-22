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
  var globalIdTypeName = type.name + 'GlobalID';
  var typeIsInterface = type instanceof _graphql.GraphQLInterfaceType;
  var typeIsUnion = type instanceof _graphql.GraphQLUnionType;
  var possibleTypes = typeIsInterface || typeIsUnion ? type.getPossibleTypes() : [type];
  var possibleTypeNames = possibleTypes.map(function (possibleType) {
    return possibleType.name;
  });
  return new _graphql.GraphQLNonNull(new _graphql.GraphQLScalarType({
    name: globalIdTypeName,
    description: 'The `' + globalIdTypeName + '` scalar type represents a globally unique\n      identifier, often used to refetch an object or as key for a cache. The\n      `' + globalIdTypeName + '` type appears in a JSON response as a String;\n      however, it is not intended to be human-readable. When expected as an\n      input type, the incoming string will be accepted as a\n      `' + globalIdTypeName + '` if it can be interpreted using Relay\'s\n      `fromGlobalId` function, and the resolved global ID\'s `type`' + (typeIsInterface || typeIsUnion ? (typeIsInterface ? 'implements' : 'is a member of') + ' `' + type.name + '`.\n          The possible types include `' + possibleTypeNames.join('`, `') + '`.' : 'is `' + type.name + '`.'),
    serialize: String,
    parseValue: String,
    parseLiteral: function parseLiteral(ast) {
      if (ast.kind !== _graphqlLanguage.Kind.STRING) {
        throw new _graphqlError.GraphQLError('Query error: Global ID must be a String,\n          but received a ' + ast.kind + '.', [ast]);
      }

      var resolvedGlobalId = (0, _graphqlRelay.fromGlobalId)(ast.value);
      var isAnyPossibleType = possibleTypes.some(function (possibleType) {
        return globalIdHasExactType(resolvedGlobalId, possibleType);
      });
      if (isAnyPossibleType) return resolvedGlobalId;

      return null;
    },
    getPossibleTypes: function getPossibleTypes() {
      return type.getPossibleTypes ? type.getPossibleTypes() : type;
    }
  }));
}