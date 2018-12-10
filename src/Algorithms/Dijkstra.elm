module Algorithms.Dijkstra exposing (Distance(..), InputData, StepData, algorithm, nextVertexToHandle)

import Algorithm exposing (Algorithm, StepResult(..))
import IntDict exposing (IntDict)
import Set exposing (Set)


algorithm : Algorithm InputData StepData
algorithm =
    Algorithm.basic
        { init = init
        , step = step
        }



-- InputData


type alias InputData =
    { startVertex : VertexId
    , graph : IntDict (IntDict Weight)
    }


type alias VertexId =
    Int


type alias Weight =
    Int



-- StepData


type alias StepData =
    IntDict
        { hasBeenVisited : Bool
        , currentBestDistance : Distance
        , maybePredecessor : Maybe VertexId
        }


type Distance
    = Infinity
    | Finite Int



-- init


init : InputData -> StepData
init { startVertex, graph } =
    let
        initVertex id _ =
            { hasBeenVisited = False
            , currentBestDistance =
                if startVertex == id then
                    Finite 0

                else
                    Infinity
            , maybePredecessor = Nothing
            }
    in
    IntDict.map initVertex graph



-- step


step : InputData -> StepData -> Algorithm.StepResult StepData
step inputData lastStep =
    case unvisitedWithTheSmallestTDist lastStep of
        Just idAndDist ->
            Next
                (handleVertex inputData lastStep idAndDist)

        Nothing ->
            End



-- queries


nextVertexToHandle : StepData -> Maybe VertexId
nextVertexToHandle =
    unvisitedWithTheSmallestTDist >> Maybe.map Tuple.first



-- helpers


unvisitedWithTheSmallestTDist : StepData -> Maybe ( VertexId, Int )
unvisitedWithTheSmallestTDist =
    let
        take ( id, v ) =
            case v.currentBestDistance of
                Finite dist ->
                    if not v.hasBeenVisited then
                        Just ( id, dist )

                    else
                        Nothing

                Infinity ->
                    -- This never happens
                    Nothing
    in
    IntDict.toList
        >> List.filterMap take
        >> List.sortBy Tuple.second
        >> List.head


updateDist id newDist newPred =
    IntDict.update id
        (Maybe.map
            (\d ->
                { d
                    | currentBestDistance = Finite newDist
                    , maybePredecessor = Just newPred
                }
            )
        )


handleVertex : InputData -> StepData -> ( VertexId, Int ) -> StepData
handleVertex { graph } lastStep ( idOfHandled, distOfHandled ) =
    let
        neighboursWithWeights =
            IntDict.get idOfHandled graph
                |> Maybe.withDefault IntDict.empty

        updateNeighbour neighbourId w stepData =
            let
                up =
                    updateDist neighbourId (distOfHandled + w) idOfHandled
            in
            stepData
                |> (case IntDict.get neighbourId stepData of
                        Just { currentBestDistance } ->
                            case currentBestDistance of
                                Finite currentBest ->
                                    if distOfHandled + w < currentBest then
                                        up

                                    else
                                        identity

                                Infinity ->
                                    up

                        Nothing ->
                            identity
                   )

        markAsVisited d =
            { d | hasBeenVisited = True }
    in
    IntDict.foldr updateNeighbour lastStep neighboursWithWeights
        |> IntDict.update idOfHandled (Maybe.map markAsVisited)
