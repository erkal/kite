module Algorithms.TopologicalSorting.API exposing (run)

import Algorithm
import Algorithms.TopologicalSorting as TopologicalSorting exposing (Input, State)
import Colors
import Dict exposing (Dict)
import Graph
import Graph.Extra
import GraphFile as GF exposing (GraphFile, MyGraph)
import IntDict exposing (IntDict)
import Point2d exposing (Point2d)
import Set exposing (Set)


run : GraphFile -> List GraphFile
run inputGF =
    let
        runOnMyGraph : MyGraph -> List MyGraph
        runOnMyGraph inputGraph =
            inputGraph
                |> toInputData
                |> Algorithm.run TopologicalSorting.algorithm
                |> List.map (toMyGraph inputGraph)
    in
    inputGF
        |> GF.getGraph
        |> runOnMyGraph
        |> List.map (\g -> GF.setGraph g inputGF)


toInputData : MyGraph -> Input
toInputData g =
    let
        ins { from, to } acc =
            case IntDict.get from acc of
                Just neighbourSet ->
                    IntDict.insert from (Set.insert to neighbourSet) acc

                Nothing ->
                    -- This never happens because we start with `init`
                    IntDict.insert from (Set.singleton to) acc

        init =
            List.foldr (\{ id } -> IntDict.insert id Set.empty)
                IntDict.empty
                (Graph.nodes g)
    in
    List.foldr ins init (Graph.edges g)


toMyGraph : MyGraph -> State -> MyGraph
toMyGraph inputGraph { edgesLeft, l, s } =
    let
        n =
            Graph.size inputGraph

        dist =
            800 / toFloat n

        orderedPositions =
            List.reverse l
                |> List.indexedMap
                    (\i id ->
                        ( id
                        , Point2d.fromCoordinates ( 300, toFloat i * dist )
                        )
                    )

        upPos newPosition vP =
            { vP | position = newPosition }

        orderNodesInL =
            Graph.Extra.updateNodesBy orderedPositions upPos

        --
        upForTheSetS vP =
            { vP | color = Colors.white }

        --
        upForEdgesLeft eP =
            { eP | color = Colors.black }

        idsOfEdgesLeft =
            edgesLeft
                |> IntDict.map (\u -> Set.toList >> List.map (\v -> ( u, v )))
                |> IntDict.values
                |> List.concat
                |> Set.fromList
    in
    inputGraph
        |> orderNodesInL
        |> Graph.Extra.updateNodes s upForTheSetS
        |> Graph.Extra.updateEdges idsOfEdgesLeft upForEdgesLeft
