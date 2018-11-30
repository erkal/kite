module Dijkstra exposing (run)

import Algorithm
import Dict exposing (Dict)


type alias VertexId =
    Int


type VertexState
    = StartVertex
    | Explored { pred : VertexId }
    | Finished { pred : VertexId }
    | UnTouched


{-| Each step will be a scene in the visualization.
-}
type alias StepData =
    { started : Bool
    , stepDataVertexDict : StepDataVertexDict
    }


type alias StepDataVertexDict =
    Dict VertexId
        { vertexState : VertexState
        , weightedNeighbours : WeightedNeighbours
        }


type alias WeightedNeighbours =
    Dict VertexId Weight


type alias Weight =
    Int


type alias Input =
    { inputStart : VertexId
    , inputGraph : Dict VertexId WeightedNeighbours
    }


run : Input -> List StepData
run input =
    Algorithm.run
        { input = input
        , init = init
        , step = step
        }


step : StepData -> Algorithm.StepResult StepData
step ({ started, stepDataVertexDict } as sD) =
    if not started then
        sD
            |> start
            |> exploreNeihgboursOf (startVertex stepDataVertexDict)
            |> Algorithm.Next

    else
        case anUntouchedVertex stepDataVertexDict of
            Just id ->
                sD
                    |> exploreNeihgboursOf id
                    |> Algorithm.Next

            Nothing ->
                Algorithm.End


init : Input -> StepData
init { inputStart, inputGraph } =
    { started = False
    , stepDataVertexDict =
        inputGraph
            |> Dict.map
                (\id wN ->
                    { vertexState =
                        if inputStart == id then
                            StartVertex

                        else
                            UnTouched
                    , weightedNeighbours = wN
                    }
                )
    }



-- helper functions


start : StepData -> StepData
start =
    -- TODO
    identity


exploreNeihgboursOf : VertexId -> StepData -> StepData
exploreNeihgboursOf id =
    -- TODO
    identity


anUntouchedVertex : StepDataVertexDict -> Maybe Int
anUntouchedVertex _ =
    -- TODO
    Nothing


startVertex : StepDataVertexDict -> Int
startVertex _ =
    -- TODO
    42
