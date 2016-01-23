# GraphQL/Relay globalIdType
A "global ID" Type for Relay that can be used as an output Type or an input Type
in your GraphQL schema. Compared to Relay's `globalIdField`, `globalIdType` is
more introspective, since you can see the expected type that the global ID will
resolve to. Also, `globalIdType` can be used as an input type, where it parses
the incoming global ID and checks its resolved `type` against the specified
type of the global ID.
