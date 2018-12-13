module TopologicalSorting exposing (Input, Step, algorithm)

import Algorithm exposing (Algorithm, Result(..))
import IntDict exposing (IntDict)
import Set exposing (Set)


{-| Kahn's algorithm as in Wikipdia:

    L ← Empty list that will contain the sorted elements
    S ← Set of all nodes with no incoming edge
    while S is non-empty do
        remove a node n from S
        add n to tail of L
        for each node m with an edge e from n to m do
            remove edge e from the graph
            if m has no other incoming edges then
                insert m into S
    if graph has edges then
        return error   (graph has at least one cycle)
    else
        return L   (a topologically sorted order)

-}
algorithm : Algorithm Input Step
algorithm =
    Algorithm.basic
        { init = init
        , step = step
        }



-- Input


type alias Input =
    IntDict VertexId


type alias VertexId =
    Int



-- Step


type alias Step =
    { edgesToHandle : IntDict VertexId
    , l : List VertexId
    , s : List VertexId
    }



-- init


init : Input -> Step
init inputData =
    let
        rootNodes =
            []
    in
    { edgesToHandle = inputData
    , l = []
    , s = rootNodes
    }



-- step


step : Input -> Step -> Algorithm.Result Step
step inputData lastStep =
    End



-- queries
-- helpers
