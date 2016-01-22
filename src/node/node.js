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
 * Creates the configuration for an id input field on a mutation, using
 * `fromGlobalId` to deconstruct the ID and validate for the provided typename.
 * The ResolvedGlobalID is passed into the mutateAndGetPayload function.
 */
export function globalIdForType(type: GraphQLNamedType): GraphQLScalarType {
  let globalIdTypeName = `${type.name}GlobalID`;
  let typeIsInterface = type instanceof GraphQLInterfaceType;
  let typeIsUnion = type instanceof GraphQLUnionType;
  let possibleTypes = typeIsInterface || typeIsUnion ? type.getPossibleTypes() : [type];
  let possibleTypeNames = possibleTypes.map((possibleType) => possibleType.name);
  return new GraphQLNonNull(new GraphQLScalarType({
    name: globalIdTypeName,
    description:
      `The \`${globalIdTypeName}\` scalar type represents a globally unique
      identifier, often used to refetch an object or as key for a cache. The
      \`${globalIdTypeName}\` type appears in a JSON response as a String;
      however, it is not intended to be human-readable. When expected as an
      input type, the incoming string will be accepted as a
      \`${globalIdTypeName}\` if it can be interpreted using Relay\'s
      \`fromGlobalId\` function, and the resolved global ID's \`type\`` +
      typeIsInterface || typeIsUnion ?
        `${typeIsInterface ? 'implements' : 'is a member of'} \`${type.name}\`.
        The possible types include \`${possibleTypeNames.join('`, `')}\`.`
      :
        `is \`${type.name}\`.`,
    serialize: String,
    parseValue: String,
    parseLiteral(ast) {
      if (ast.kind !== Kind.STRING) {
        throw new GraphQLError(`Query error: Global ID must be a String,
          but received a ${ast.kind}.`, [ast]);
      }

      var resolvedGlobalId = fromGlobalId(ast.value);
      var isAnyPossibleType = possibleTypes.some(
        (possibleType) => globalIdHasExactType(resolvedGlobalId, possibleType)
      );
      if (isAnyPossibleType) return resolvedGlobalId;

      return null;
    },
    getPossibleTypes: function() {
      return type.getPossibleTypes ? type.getPossibleTypes() : type;
    }
  }));
}
