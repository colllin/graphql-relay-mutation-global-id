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
  fromGlobalId
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
  let globalIdTypeName = `GlobalID<${type.name}>`;
  let typeIsInterface = type instanceof GraphQLInterfaceType;
  let typeIsUnion = type instanceof GraphQLUnionType;
  let possibleTypes = typeIsInterface || typeIsUnion ? type.getPossibleTypes() : [type];
  let possibleTypeNames = possibleTypes.map((possibleType) => possibleType.name);
  let parseValue = (strValue) => {
    let resolvedGlobalId = fromGlobalId(strValue);
    let isAnyPossibleType = possibleTypes.some(
      (possibleType) => globalIdHasExactType(resolvedGlobalId, possibleType)
    );
    if (isAnyPossibleType) return resolvedGlobalId;

    throw new GraphQLError(`Query error: Could not parse value ${strValue} as a Global ID of type \`${type.name}\`.`);
  }
  return new GraphQLScalarType({
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
}
