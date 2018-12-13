module Algorithms.Dijkstra exposing (Distance(..), Input, State, algorithm, nextVertexToHandle)

import Algorithm exposing (Algorithm, Result(..))
import IntDict exposing (IntDict)
import Set exposing (Set)


algorithm : Algorithm Input State
algorithm =
    Algorithm.basic
        { init = init
        , step = step
        }



-- Input


type alias Input =
    { startVertex : VertexId
    , graph : IntDict (IntDict Weight)
    }


type alias VertexId =
    Int


type alias Weight =
    Int



-- State


type alias State =
    IntDict
        { hasBeenVisited : Bool
        , currentBestDistance : Distance
        , maybePredecessor : Maybe VertexId
        }


type Distance
    = Infinity
    | Finite Int



-- init


init : Input -> State
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


step : Input -> State -> Algorithm.Result State
step input lastState =
    case unvisitedWithTheSmallestTDist lastState of
        Just idAndDist ->
            Next
                (handleVertex input lastState idAndDist)

        Nothing ->
            End



-- queries


nextVertexToHandle : State -> Maybe VertexId
nextVertexToHandle =
    unvisitedWithTheSmallestTDist >> Maybe.map Tuple.first



-- helpers


unvisitedWithTheSmallestTDist : State -> Maybe ( VertexId, Int )
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
    let
        up d =
            { d
                | currentBestDistance = Finite newDist
                , maybePredecessor = Just newPred
            }
    in
    IntDict.update id (Maybe.map up)


handleVertex : Input -> State -> ( VertexId, Int ) -> State
handleVertex { graph } lastState ( idOfHandled, distOfHandled ) =
    let
        neighboursWithWeights =
            IntDict.get idOfHandled graph
                |> Maybe.withDefault IntDict.empty

        updateNeighbour neighbourId w state =
            case IntDict.get neighbourId state of
                Just { currentBestDistance } ->
                    case currentBestDistance of
                        Finite currentBest ->
                            if distOfHandled + w < currentBest then
                                updateDist neighbourId
                                    (distOfHandled + w)
                                    idOfHandled
                                    state

                            else
                                state

                        Infinity ->
                            updateDist neighbourId
                                (distOfHandled + w)
                                idOfHandled
                                state

                Nothing ->
                    state

        markAsVisited d =
            { d | hasBeenVisited = True }
    in
    IntDict.foldr updateNeighbour lastState neighboursWithWeights
        |> IntDict.update idOfHandled (Maybe.map markAsVisited)
