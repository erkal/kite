module BreadthFirstSearch exposing (..)

import Dict exposing (Dict)
import Set exposing (Set)


type alias BFSInput comparable =
    { adjacencyList : Dict comparable (Set comparable)
    , source : comparable
    }


type alias BFSOutput comparable =
    Dict comparable
        { dist : Maybe Int
        , pred : Maybe comparable
        }


bfs : BFSInput comparable -> BFSOutput comparable
bfs { adjacencyList, source } =
    let
        discoveredInit : Set comparable
        discoveredInit =
            Set.fromList [ source ]

        queueInit : List comparable
        queueInit =
            [ source ]

        accInit : BFSOutput comparable
        accInit =
            adjacencyList
                |> Dict.map (\_ _ -> { dist = Nothing, pred = Nothing })
                |> Dict.insert source { dist = Just 0, pred = Nothing }

        step : List comparable -> Set comparable -> BFSOutput comparable -> BFSOutput comparable
        step queue discovered acc =
            case queue of
                [] ->
                    acc

                h :: tail ->
                    let
                        vs : Set comparable
                        vs =
                            case Dict.get h adjacencyList of
                                Just neighbours ->
                                    Set.diff neighbours discovered

                                Nothing ->
                                    Debug.crash ""

                        newQueue : List comparable
                        newQueue =
                            tail ++ (Set.toList vs)

                        newDiscovered : Set comparable
                        newDiscovered =
                            Set.union discovered vs

                        distOfh : Int
                        distOfh =
                            case Dict.get h acc of
                                Just o ->
                                    case o.dist of
                                        Just d ->
                                            d

                                        Nothing ->
                                            Debug.crash ""

                                Nothing ->
                                    Debug.crash ""

                        newAcc : BFSOutput comparable
                        newAcc =
                            let
                                u =
                                    { dist = Just (distOfh + 1)
                                    , pred = Just h
                                    }

                                updateEntry : comparable -> BFSOutput comparable -> BFSOutput comparable
                                updateEntry i =
                                    Dict.insert i u
                            in
                                Set.foldl updateEntry acc vs
                    in
                        step newQueue newDiscovered newAcc
    in
        step queueInit discoveredInit accInit
