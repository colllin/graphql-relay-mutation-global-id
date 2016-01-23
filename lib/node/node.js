'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.globalIdType = globalIdType;

var _graphql = require('graphql');

var _graphqlError = require('graphql/error');

var _graphqlLanguage = require('graphql/language');

var _graphqlRelay = require('graphql-relay');

function globalIdHasExactType(resolvedGlobalId, type) {
  return resolvedGlobalId.type === type.name;
}

/**
 * Returns a type that can be declared on fields or args. It uses Relay's
 * `toGlobalId` and `fromGlobalId` to serialize or parse the ID and validate
 * that it is for correct `type`.
 * When this type is used as a mutation arg, the resolved global ID is passed
 * into the mutateAndGetPayload function, instead of the original global ID
 * String that came from the client query. A resolved global ID has structure
 * `{type: String, id: String}`.
 */

function globalIdType(type) {
  var globalIdTypeName = 'GlobalID<' + type.name + '>';
  var typeIsInterface = type instanceof _graphql.GraphQLInterfaceType;
  var typeIsUnion = type instanceof _graphql.GraphQLUnionType;
  var possibleTypes = typeIsInterface || typeIsUnion ? type.getPossibleTypes() : [type];
  var possibleTypeNames = possibleTypes.map(function (possibleType) {
    return possibleType.name;
  });
  var parseValue = function parseValue(strValue) {
    var resolvedGlobalId = (0, _graphqlRelay.fromGlobalId)(strValue);
    var isAnyPossibleType = possibleTypes.some(function (possibleType) {
      return globalIdHasExactType(resolvedGlobalId, possibleType);
    });
    if (isAnyPossibleType) return resolvedGlobalId;

    throw new _graphqlError.GraphQLError('Query error: Could not parse value ' + strValue + ' as a Global ID of type `' + type.name + '`.');
  };
  return new _graphql.GraphQLScalarType({
    name: globalIdTypeName,
    description: 'The `' + globalIdTypeName + '` scalar type represents a globally unique\n      identifier, often used to refetch an object or as key for a cache. The\n      `' + globalIdTypeName + '` type appears in a JSON response as a String;\n      however, it is not intended to be human-readable. When expected as an\n      input type, the incoming string will be accepted as a\n      `' + globalIdTypeName + '` if it can be interpreted using Relay\'s\n      `fromGlobalId` function, and the resolved global ID\'s `type` ' + (typeIsInterface || typeIsUnion ? (typeIsInterface ? 'implements' : 'is a member of') + ' `' + type.name + '`.\n          The possible types include `' + possibleTypeNames.join('`, `') + '`.' : 'is `\'' + type.name + '\'`.'),
    serialize: String,
    parseValue: parseValue,
    parseLiteral: function parseLiteral(ast) {
      if (ast.kind !== _graphqlLanguage.Kind.STRING) {
        throw new _graphqlError.GraphQLError('Query error: Global ID must be a String,\n          but received a ' + ast.kind + '.', [ast]);
      }

      return parseValue(ast.value);
    },
    getPossibleTypes: function getPossibleTypes() {
      return type.getPossibleTypes ? type.getPossibleTypes() : type;
    }
  });
}