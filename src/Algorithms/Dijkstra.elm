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
    { startVertex : VertexId
    , stepGraph : StepGraph
    }


type alias StepGraph =
    Dict VertexId
        { vertexState : VertexState
        , weightedNeighbours : WeightedNeighbours
        }


type VertexState
    = Explored { pred : Maybe VertexId }
    | Finished { pred : Maybe VertexId }
    | UnTouched



-- init


init : Input -> StepData
init { startVertex, graph } =
    { startVertex = startVertex
    , stepGraph =
        graph
            |> Dict.map
                (\id wN ->
                    { vertexState =
                        if startVertex == id then
                            Explored { pred = Nothing }

                        else
                            UnTouched
                    , weightedNeighbours = wN
                    }
                )
    }



-- step


step : StepData -> Algorithm.StepResult StepData
step ({ startVertex, stepGraph } as sD) =
    case takeAnExploredVertex stepGraph of
        Just id ->
            sD
                |> exploreNeihgboursOf id
                |> Algorithm.Next

        Nothing ->
            Algorithm.End



-- helpers


exploreNeihgboursOf : VertexId -> StepData -> StepData
exploreNeihgboursOf id =
    -- TODO
    identity


takeAnExploredVertex : StepGraph -> Maybe Int
takeAnExploredVertex _ =
    -- TODO
    Nothing
