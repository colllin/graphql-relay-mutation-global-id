/* @flow */

import {
  GraphQLInterfaceType,
  GraphQLUnionType,
  GraphQLNonNull,
  GraphQLScalarType,
} from 'graphql';

import type {
  GraphQLNamedType,
} from 'graphql';

import { GraphQLError } from 'graphql/error';
import { Kind } from 'graphql/language';

import {
  toGlobalId,
  fromGlobalId,
} from 'graphql-relay';

type ResolvedGlobalId = {
  type: string,
  id: string
}

function globalIdHasExactType(
  resolvedGlobalId: ResolvedGlobalId, type: GraphQLNamedType
): boolean {
  return resolvedGlobalId.type === type.name;
}

let cachedTypes = {};

/**
 * Returns a type that can be declared on fields or args. It uses Relay's
 * `toGlobalId` and `fromGlobalId` to serialize or parse the ID and validate
 * that it is for correct `type`.
 * When this type is used as a mutation arg, the resolved global ID is passed
 * into the mutateAndGetPayload function, instead of the original global ID
 * String that came from the client query. A resolved global ID has structure
 * `{type: String, id: String}`.
 */
export function globalIdType(type: GraphQLNamedType): GraphQLScalarType {
  let globalIdTypeName = `GlobalID_${type.name}`;
  if (cachedTypes[globalIdTypeName]) return cachedTypes[globalIdTypeName];

  let typeIsInterface = type instanceof GraphQLInterfaceType;
  let typeIsUnion = type instanceof GraphQLUnionType;
  let possibleTypes = typeIsInterface || typeIsUnion ? type.getPossibleTypes() : [type];
  let possibleTypeNames = possibleTypes.map((possibleType) => possibleType.name);

  let serializeValue = (value) => {
    if (typeIsUnion || typeIsInterface) throw new GraphQLError(
      `Query error: Cannot generate a global ID of type ${type.name}.
      ${type.name} is a
      ${typeIsUnion ? 'GraphQLUnionType' : 'GraphQLInterfaceType'}, which is
      not a resolvable / queryable type.`
    )
    return toGlobalId(type.name, String(value));
  }
  let parseValue = (serialized) => {
    let resolvedGlobalId = fromGlobalId(serialized);
    let isAnyPossibleType = possibleTypes.some(
      (possibleType) => globalIdHasExactType(resolvedGlobalId, possibleType)
    );
    if (isAnyPossibleType) return resolvedGlobalId;

    throw new GraphQLError(
      `Query error: Expected Relay global ID of type \`${type.name}\`, but
      received Relay global ID of type ${resolvedGlobalId.type}.`,
      serialized
    );
  }
  cachedTypes[globalIdTypeName] = new GraphQLScalarType({
    name: globalIdTypeName,
    description:
      `The \`${globalIdTypeName}\` scalar type represents a globally unique
      identifier, often used to refetch an object or as key for a cache. The
      \`${globalIdTypeName}\` type appears in a JSON response as a String;
      however, it is not intended to be human-readable. When expected as an
      input type, the incoming string will be accepted as a
      \`${globalIdTypeName}\` if it can be interpreted using Relay\'s
      \`fromGlobalId\` function, and the resolved global ID's \`type\` ` +
      (
        typeIsInterface || typeIsUnion ?
          `${typeIsInterface ? 'implements' : 'is a member of'} \`${type.name}\`.
          The possible types include \`${possibleTypeNames.join('`, `')}\`.`
        :
          `is \`'${type.name}'\`.`
      ),
    serialize: String,
    parseValue: parseValue,
    parseLiteral(ast) {
      if (ast.kind !== Kind.STRING) {
        throw new GraphQLError(`Query error: Global ID must be a String,
          but received a ${ast.kind}.`, [ast]);
      }

      return parseValue(ast.value);
    },
    getPossibleTypes: function() {
      return type.getPossibleTypes ? type.getPossibleTypes() : type;
    }
  });
  return cachedTypes[globalIdTypeName];
}
