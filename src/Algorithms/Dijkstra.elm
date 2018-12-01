module Dijkstra exposing (Input, run)

import Algorithm
import Dict exposing (Dict)


run : Input -> List StepData
run input =
    Algorithm.run
        { input = input
        , init = init
        , step = step
        }



-- Input


type alias Input =
    { startVertex : VertexId
    , graph : Dict VertexId WeightedNeighbours
    }


type alias VertexId =
    Int


type alias WeightedNeighbours =
    Dict VertexId Weight


type alias Weight =
    Int



-- StepData


type alias StepData =
    Dict VertexId VertexState


type VertexState
    = UnTouched
    | Explored { pred : Maybe VertexId }
    | Finished { pred : Maybe VertexId }



-- init


init : Input -> StepData
init { startVertex, graph } =
    let
        initVertexState id _ =
            if startVertex == id then
                Explored { pred = Nothing }

            else
                UnTouched
    in
    Dict.map initVertexState graph



-- step


step : StepData -> Algorithm.StepResult StepData
step lastStep =
    case takeAnExploredVertex lastStep of
        Just id ->
            Algorithm.Next (handleVertex id lastStep)

        Nothing ->
            Algorithm.End



-- helpers


takeAnExploredVertex : StepData -> Maybe Int
takeAnExploredVertex =
    let
        isExplored _ vertexState =
            case vertexState of
                Explored _ ->
                    True

                _ ->
                    False
    in
    Dict.filter isExplored >> Dict.keys >> List.head


handleVertex : VertexId -> StepData -> StepData
handleVertex id =
    -- TODO
    identity
