module Algorithms.TopologicalSorting exposing (Input, State, algorithm)

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
algorithm : Algorithm Input State
algorithm =
    Algorithm.basic
        { init = init
        , step = step
        }



-- Input


type alias Input =
    IntDict (Set NodeId)


type alias NodeId =
    Int



-- State


type alias State =
    { edgesLeft : IntDict (Set NodeId)
    , l : List NodeId
    , s : Set NodeId
    }



-- init


init : Input -> State
init input =
    { edgesLeft = input
    , l = []
    , s = Set.fromList (rootNodes input)
    }



-- step


step : Input -> State -> Algorithm.Result State
step _ { edgesLeft, l, s } =
    case pick s of
        Just ( n, restOfS ) ->
            let
                outEdgesOfn =
                    outEdges n edgesLeft

                ( newEdgesLeft, newS ) =
                    List.foldr handleEdge ( edgesLeft, restOfS ) outEdgesOfn
            in
            Next
                { edgesLeft = newEdgesLeft
                , l = n :: l
                , s = newS
                }

        Nothing ->
            End



-- queries
-- helpers


type alias Acc =
    ( IntDict (Set NodeId), Set NodeId )


handleEdge : ( NodeId, NodeId ) -> Acc -> Acc
handleEdge ( n, m ) ( edgesLeft, s ) =
    let
        eRemoved =
            IntDict.update n (Maybe.map (Set.remove m)) edgesLeft
    in
    ( eRemoved
    , if List.member m (rootNodes eRemoved) then
        Set.insert m s

      else
        s
    )


outEdges : NodeId -> IntDict (Set NodeId) -> List ( NodeId, NodeId )
outEdges n edgesLeft =
    IntDict.get n edgesLeft
        |> Maybe.withDefault Set.empty
        |> Set.toList
        |> List.map (\m -> ( n, m ))


pick : Set comparable -> Maybe ( comparable, Set comparable )
pick s =
    case Set.toList s of
        e :: rest ->
            Just ( e, Set.fromList rest )

        [] ->
            Nothing


rootNodes : IntDict (Set NodeId) -> List NodeId
rootNodes adj =
    let
        allEdges =
            adj
                |> IntDict.map (\s ns -> Set.map (Tuple.pair s) ns)
                |> IntDict.values
                |> List.foldr Set.union Set.empty

        isRoot u =
            allEdges
                |> Set.filter (\( _, t ) -> t == u)
                |> Set.isEmpty
    in
    adj |> IntDict.keys |> List.filter isRoot
