module Graph.Generators exposing (star)

import Graph exposing (Graph, NodeId)
import IntDict
import Set exposing (Set)


star :
    { numberOfLeaves : Int
    , vertexProperties : n
    , edgeProperties : e
    }
    -> Graph n e
star { numberOfLeaves, vertexProperties, edgeProperties } =
    let
        vertexList =
            List.range 0 numberOfLeaves
                |> List.map
                    (\i ->
                        { id = i
                        , label = vertexProperties
                        }
                    )

        edgeList =
            List.range 1 numberOfLeaves
                |> List.map
                    (\i ->
                        { from = 0
                        , to = i
                        , label = edgeProperties
                        }
                    )
    in
    Graph.fromNodesAndEdges vertexList edgeList
