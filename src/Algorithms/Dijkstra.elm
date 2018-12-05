module Algorithms.Dijkstra exposing (InputData, StepData, algorithm, nextVertexToHandle)

import Algorithm exposing (Algorithm)
import IntDict exposing (IntDict)
import Set exposing (Set)


algorithm : Algorithm InputData StepData
algorithm =
    Algorithm.basic
        { init = init
        , step = step
        }



-- inputData


type alias InputData =
    { startVertex : VertexId
    , graph : IntDict (IntDict Weight)
    }


type alias VertexId =
    Int


type alias Weight =
    Int



-- stepData


type alias StepData =
    IntDict
        { visited : Bool
        , maybeDist : Maybe Int
        , maybePred : Maybe VertexId
        }



-- init


init : InputData -> StepData
init { startVertex, graph } =
    let
        initVertexState id _ =
            { visited = False
            , maybeDist =
                if startVertex == id then
                    Just 0

                else
                    Nothing
            , maybePred = Nothing
            }

        nextStepData =
            IntDict.map initVertexState graph
    in
    nextStepData



-- step


step : InputData -> StepData -> Algorithm.StepResult StepData
step inputData lastStep =
    case unvisitedWithTheSmallestTDist lastStep of
        Just idAndDist ->
            Algorithm.Next
                (handleVertex inputData lastStep idAndDist)

        Nothing ->
            Algorithm.End



-- queries


nextVertexToHandle : StepData -> Maybe VertexId
nextVertexToHandle =
    unvisitedWithTheSmallestTDist >> Maybe.map Tuple.first



-- helpers


unvisitedWithTheSmallestTDist : StepData -> Maybe ( VertexId, Int )
unvisitedWithTheSmallestTDist =
    let
        take ( id, v ) =
            if not v.visited then
                v.maybeDist |> Maybe.map (\dist -> ( id, dist ))

            else
                Nothing
    in
    IntDict.toList
        >> List.filterMap take
        >> List.sortBy Tuple.second
        >> List.head


updateDist id newDist newPred stepData =
    let
        up d =
            { d
                | maybeDist = Just newDist
                , maybePred = Just newPred
            }
    in
    stepData |> IntDict.update id (Maybe.map up)


handleVertex :
    InputData
    -> StepData
    -> ( VertexId, Int )
    -> StepData
handleVertex { graph } lastStep ( idOfHandled, tDistOfHandled ) =
    let
        neighboursWithWeights =
            IntDict.get idOfHandled graph
                |> Maybe.withDefault IntDict.empty

        updateNeighbour neighbourId w stepData =
            let
                up =
                    stepData
                        |> updateDist neighbourId
                            (tDistOfHandled + w)
                            idOfHandled
            in
            case IntDict.get neighbourId stepData of
                Just { maybeDist } ->
                    case maybeDist of
                        Just dist ->
                            if tDistOfHandled + w < dist then
                                up

                            else
                                stepData

                        Nothing ->
                            up

                Nothing ->
                    stepData

        nextStepData =
            neighboursWithWeights
                |> IntDict.foldr updateNeighbour lastStep
                |> IntDict.update idOfHandled (Maybe.map (\d -> { d | visited = True }))
    in
    nextStepData
