module Algorithms.Dijkstra.API exposing (run)

import Algorithm
import Algorithms.Dijkstra exposing (InputData, StepData)
import Colors
import Dict exposing (Dict)
import Graph
import GraphFile as GF exposing (GraphFile, MyGraph)
import IntDict exposing (IntDict)


run : GraphFile -> List GraphFile
run inputGraphFile =
    GF.getGraph inputGraphFile
        |> runHelper
        |> List.map (\g -> GF.setGraph g inputGraphFile)


runHelper : MyGraph -> List MyGraph
runHelper inputGraph =
    let
        extend stepData l =
            case l of
                h :: tail ->
                    applyStepData stepData h :: h :: tail

                [] ->
                    -- This does not happen.
                    []
    in
    inputDataFromMyGraph inputGraph
        |> Algorithm.run Algorithms.Dijkstra.algorithm
        |> List.foldr extend [ inputGraph ]
        |> List.reverse


{-| Parses edge labels to ints and stores them as edge weights. If it cannot parse, then it assigns the default edge weight to the edge, which is 1.
-}
inputDataFromMyGraph : MyGraph -> InputData
inputDataFromMyGraph g =
    { startVertex = {- TODO: If there is a vertex labeled by "start" then start with it -} 1
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


applyStepData : StepData -> MyGraph -> MyGraph
applyStepData stepData graph =
    let
        setColor color ({ label } as node) =
            { node | label = { label | color = color } }

        setLabel str ({ label } as node) =
            { node
                | label =
                    { label
                        | labelIsVisible = True
                        , label = Just str
                    }
            }

        up { visited, maybeDist, maybePred } ctx =
            { ctx
                | node =
                    ctx.node
                        |> setColor
                            (if visited then
                                Colors.black

                             else
                                Colors.white
                            )
                        |> setLabel
                            (case maybeDist of
                                Just dist ->
                                    String.fromInt dist

                                Nothing ->
                                    "Inf"
                            )
            }

        applyVertexData id vData =
            Graph.update id (Maybe.map (up vData))

        -- TODO : Make predecessor edges red.
    in
    stepData |> IntDict.foldr applyVertexData graph
