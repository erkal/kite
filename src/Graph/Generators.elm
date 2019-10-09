module Graph.Generators exposing (star)

import Graph exposing (Graph, NodeId)
import Point2d exposing (Point2d)
import Vector2d


star :
    { numberOfLeaves : Int, vertexProperties : n, edgeProperties : e }
    -> { graph : Graph n e, suggestedLayout : List ( NodeId, Point2d ) }
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

        layoutForLeaves =
            List.range 1 numberOfLeaves
                |> List.map
                    (\i ->
                        ( i
                        , Point2d.fromPolarCoordinates
                            ( 100
                            , toFloat i * degrees 360 / toFloat numberOfLeaves
                            )
                            |> Point2d.translateBy
                                (Vector2d.fromComponents ( 200, 200 ))
                        )
                    )
    in
    { graph = Graph.fromNodesAndEdges vertexList edgeList
    , suggestedLayout = ( 0, Point2d.origin ) :: layoutForLeaves
    }
