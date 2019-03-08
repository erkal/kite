module Algorithms.Dijkstra.API exposing (run)

import Algorithm
import Algorithms.Dijkstra as Dijkstra exposing (Distance(..), Input, State)
import Colors
import Graph
import Graph.Extra
import GraphFile as GF exposing (GraphFile, MyGraph)
import IntDict exposing (IntDict)
import Set exposing (Set)


run : GraphFile -> List GraphFile
run inputGF =
    let
        runOnMyGraph : MyGraph -> List MyGraph
        runOnMyGraph inputGraph =
            inputGraph
                |> toInputData
                |> Algorithm.run Dijkstra.algorithm
                |> List.map (toMyGraph inputGraph)
    in
    inputGF
        |> GF.getGraph
        |> runOnMyGraph
        |> List.map (\g -> GF.setGraph g inputGF)


{-| If the the edges are labeled by numbers that number will be treated as the edge distance. Otherwise, the edge will be assigned the default distance, which is 1.

If there is vertex labeled with "start", then this vertex will be the start vertex, otherwise the start vertex will be the vertex with the smallest id.

-}
toInputData : MyGraph -> Input
toInputData g =
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


toMyGraph : MyGraph -> State -> MyGraph
toMyGraph inputGraph state =
    let
        styleVertices =
            let
                setLabel currentBestDistance vP =
                    { vP
                        | labelIsVisible = True
                        , labelColor = Colors.white
                        , label =
                            case currentBestDistance of
                                Finite dist ->
                                    Just (String.fromInt dist)

                                Infinity ->
                                    Just "∞"
                    }

                markVisited hasBeenVisited vP =
                    if hasBeenVisited then
                        { vP
                            | color = Colors.white
                            , labelColor = Colors.black
                            , radius = 4 + vP.radius
                        }

                    else
                        vP

                up d vP =
                    vP
                        |> setLabel d.currentBestDistance
                        |> markVisited d.hasBeenVisited
            in
            Graph.Extra.updateNodesBy (IntDict.toList state) up

        --
        markPredecessorEdges =
            let
                takePred ( id, { maybePredecessor } ) =
                    Maybe.map (\pred -> ( pred, id )) maybePredecessor

                predEdges =
                    state
                        |> IntDict.toList
                        |> List.filterMap takePred
                        |> Set.fromList

                upPE eP =
                    { eP
                        | color = Colors.white
                        , labelColor = Colors.white
                        , thickness = 2 + eP.thickness
                    }
            in
            Graph.Extra.updateEdges predEdges upPE

        --
        markNextVertexToHandle =
            case Dijkstra.nextVertexToHandle state of
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
    inputGraph
        |> styleVertices
        |> markPredecessorEdges
        |> markNextVertexToHandle
