# GraphQL/Relay globalIdType
A "global ID" Type for Relay that can be used as an output Type or an input Type
in your GraphQL schema. Compared to Relay's `globalIdField`, this package has
three goals:

1. Provide type-checking for the `type` of a global ID when received as a
mutation or query arg.
2. Provide introspection into the `type` of the global ID.
3. Provide a global ID type that can be used as an input Type for mutation or
query args.  
`globalIdType` parses the incoming global ID and checks its resolved `type` against the
specified type of the global ID.

Usage
---
Still in flux...
