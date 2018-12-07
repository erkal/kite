module Algorithms.Dijkstra.API exposing (run)

import Algorithm
import Algorithms.Dijkstra exposing (Distance(..), InputData, StepData)
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
                        , labelColor = Colors.black
                        , radius = 4 + label.radius
                    }
            }

        setLabel str ({ label } as node) =
            { node
                | label =
                    { label
                        | labelIsVisible = True
                        , labelColor = Colors.white
                        , label = Just str
                    }
            }

        up { hasBeenVisited, currentBestDistance, maybePredecessor } ctx =
            { ctx
                | node =
                    ctx.node
                        |> setLabel
                            (case currentBestDistance of
                                Finite dist ->
                                    String.fromInt dist

                                Infinity ->
                                    "∞"
                            )
                        |> (if hasBeenVisited then
                                markVisited

                            else
                                identity
                           )
            }

        applyVertexData id vData =
            Graph.update id (Maybe.map (up vData))

        predEdges =
            stepData
                |> IntDict.toList
                |> List.filterMap
                    (\( id, { maybePredecessor } ) ->
                        maybePredecessor |> Maybe.map (\pred -> ( pred, id ))
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

        upNextVertextoHandle =
            case Algorithms.Dijkstra.nextVertexToHandle stepData of
                Just id ->
                    Graph.Extra.mapNode id
                        (\vP ->
                            { vP
                                | borderWidth = 4
                                , radius = vP.radius + 4
                                , borderColor = Colors.white
                            }
                        )

                Nothing ->
                    identity
    in
    IntDict.foldr applyVertexData inputGraph stepData
        |> upNextVertextoHandle
        |> upPredEdges
