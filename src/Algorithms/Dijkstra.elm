module Dijkstra exposing (InputData, run)

import Algorithm
import Dict exposing (Dict)


run : InputData -> List StepData
run =
    Algorithm.run
        { init = init
        , step = step
        }



-- InputData


type alias InputData =
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
    | Explored LastTouchData
    | Finished LastTouchData


type alias LastTouchData =
    { currentBestDistance : Int
    , pred : Maybe VertexId
    }



-- init


init : InputData -> StepData
init { startVertex, graph } =
    let
        initVertexState id _ =
            if startVertex == id then
                Explored startVertexTouchData

            else
                UnTouched
    in
    Dict.map initVertexState graph


startVertexTouchData : LastTouchData
startVertexTouchData =
    { currentBestDistance = 0
    , pred = Nothing
    }



-- step


step : InputData -> StepData -> Algorithm.StepResult StepData
step inputData lastStep =
    case takeAnExploredVertex lastStep of
        Just id ->
            Algorithm.Next
                (handleVertex inputData lastStep id)

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


handleVertex : InputData -> StepData -> VertexId -> StepData
handleVertex inputData lastStep id =
    -- TODO
    lastStep
