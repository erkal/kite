module Digraph.Generators.GridGraph exposing (..)

import Set exposing (Set)
import AbstractDigraph exposing (AbstractDigraph)
import Extras


generate : { m : Int, n : Int } -> AbstractDigraph ( Int, Int )
generate { m, n } =
    let
        vertexList =
            Set.toList <|
                Extras.cartesianProd
                    (Set.fromList (List.range 1 m))
                    (Set.fromList (List.range 1 n))

        rightEdge ( i, j ) =
            if j < n then
                [ ( ( i, j ), ( i, j + 1 ) ) ]
            else
                []

        downEdge ( i, j ) =
            if i < m then
                [ ( ( i, j ), ( i + 1, j ) ) ]
            else
                []

        rightAndDownEdges v =
            List.concat [ rightEdge v, downEdge v ]
    in
        { vertexList = vertexList
        , edgeList = vertexList |> List.concatMap rightAndDownEdges
        }
