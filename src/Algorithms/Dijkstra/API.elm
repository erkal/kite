module Algorithms.Dijkstra.API exposing (run)

import Algorithm
import Algorithms.Dijkstra exposing (InputData, StepData)
import Colors
import Dict exposing (Dict)
import Graph
import Graph.Extra
import GraphFile as GF exposing (GraphFile, MyGraph)
import IntDict exposing (IntDict)
import Set exposing (Set)


run : GraphFile -> List GraphFile
run inputGraphFile =
    runHelper (GF.getGraph inputGraphFile)
        |> List.map (\g -> GF.setGraph g inputGraphFile)


runHelper : MyGraph -> List MyGraph
runHelper inputGraph =
    Algorithm.run Algorithms.Dijkstra.algorithm (fromMyGraph inputGraph)
        |> List.map (toMyGraph inputGraph)


{-| If the the edges are labeled by numbers that number will be treated as the edge distance. Otherwise, the edge will be assigned the default distance, which is 1.

If there is vertex labeled with "start", then this vertex will be the start vertex, otherwise the start vertex will be the vertex with the smallest id.

-}
fromMyGraph : MyGraph -> InputData
fromMyGraph g =
    { startVertex =
        let
            maybeVertexWithLabelStart =
                Graph.nodes g
                    |> List.filter (\{ label } -> label.label == Just "start")
                    |> List.head
        in
        case maybeVertexWithLabelStart of
            Just { id } ->
                id

            Nothing ->
                case Graph.nodeIdRange g of
                    Just ( minId, _ ) ->
                        minId

                    Nothing ->
                        1
    , graph =
        let
            extract { from, to, label } =
                ( from
                , to
                , label.label
                    |> Maybe.andThen String.toInt
                    |> Maybe.withDefault 1
                )

            insert ( from, to, weight ) =
                IntDict.update from
                    (Maybe.map (IntDict.insert to weight))
        in
        g
            |> Graph.edges
            |> List.map extract
            |> List.foldr insert
                (g
                    |> Graph.nodeIds
                    |> List.map (\id -> ( id, IntDict.empty ))
                    |> IntDict.fromList
                )
    }


toMyGraph : MyGraph -> StepData -> MyGraph
toMyGraph inputGraph stepData =
    let
        markVisited ({ label } as node) =
            { node
                | label =
                    { label
                        | color = Colors.white

                        --    borderWidth = 4
                        --, borderColor = Colors.white
                        , labelColor = Colors.white
                        , radius = 4 + label.radius
                    }
            }

        setLabel str ({ label } as node) =
            { node
                | label =
                    { label
                        | labelIsVisible = True
                        , labelColor = Colors.black
                        , label = Just str
                    }
            }

        up { visited, maybeDist, maybePred } ctx =
            { ctx
                | node =
                    ctx.node
                        |> (if visited then
                                markVisited

                            else
                                identity
                           )
                        |> setLabel
                            (case maybeDist of
                                Just dist ->
                                    String.fromInt dist

                                Nothing ->
                                    "∞"
                            )
            }

        applyVertexData id vData =
            Graph.update id (Maybe.map (up vData))

        predEdges =
            stepData
                |> IntDict.toList
                |> List.filterMap
                    (\( id, { maybePred } ) ->
                        maybePred |> Maybe.map (\pred -> ( pred, id ))
                    )
                |> Set.fromList

        upPredEdges =
            let
                upPE eP =
                    { eP
                        | color = Colors.white
                        , labelColor = Colors.white
                        , thickness = 2 + eP.thickness
                    }
            in
            Graph.Extra.updateEdges predEdges upPE

        setColor color ({ label } as node) =
            { node | label = { label | color = color } }

        upNextVertextoHandle =
            case Algorithms.Dijkstra.nextVertexToHandle stepData of
                Just id ->
                    let
                        yellowize ctx =
                            { ctx | node = ctx.node |> setColor Colors.yellow }
                    in
                    Graph.update id (Maybe.map yellowize)

                Nothing ->
                    identity
    in
    stepData
        |> IntDict.foldr applyVertexData inputGraph
        |> upNextVertextoHandle
        |> upPredEdges
