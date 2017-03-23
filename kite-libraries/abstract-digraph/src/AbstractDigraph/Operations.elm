module AbstractDigraph.Operations exposing (..)

import Set exposing (Set)
import Dict exposing (Dict)
import BreadthFirstSearch
import AbstractDigraph exposing (AbstractDigraph)


{-|
`adjacencyList g` is the adjacency list of g.
As data structure in elm, it is not a `List`.
It is a `Dict`, where a key is a name of a vertex and the corresponding value is the set of the names of its neighbours.
-}
adjacencyList : AbstractDigraph comparable -> Dict comparable (Set comparable)
adjacencyList { vertexList, edgeList } =
    let
        accumulate ( i, j ) acc =
            acc
                |> Dict.update j (Maybe.map (Set.insert i))
                |> Dict.update i (Maybe.map (Set.insert j))

        emptyAdjList =
            vertexList
                |> List.foldl
                    (\vertexName ac ->
                        ac |> Dict.insert vertexName Set.empty
                    )
                    Dict.empty
    in
        edgeList
            |> List.foldl accumulate emptyAdjList


{-|
`allReachable i g` is the set of vertices in graph g which are reachable from vertex i.
-}
allReachable : comparable -> AbstractDigraph comparable -> Set comparable
allReachable i g =
    let
        bfsOutput =
            BreadthFirstSearch.bfs
                { adjacencyList = adjacencyList g
                , source = i
                }
    in
        bfsOutput
            |> Dict.filter (\_ { dist } -> dist /= Nothing)
            |> Dict.keys
            |> Set.fromList


{-|
`connectedComponents g` is the list of connected components of g.
-}
connectedComponents : AbstractDigraph comparable -> List (Set comparable)
connectedComponents g =
    let
        helper : List comparable -> List (Set comparable) -> List (Set comparable)
        helper theRest acc =
            case theRest of
                i :: _ ->
                    let
                        newComp =
                            allReachable i g
                    in
                        helper (Set.toList (Set.diff (Set.fromList theRest) newComp))
                            (newComp :: acc)

                [] ->
                    acc
    in
        helper g.vertexList []



-- {-|
-- `induce s g` is the subgraph of g induced by the vertex set s.
-- -}
-- induce : Set comparable -> AbstractDigraph comparable -> AbstractDigraph comparable
-- induce s g =
--     { g
--         | vertexList = g.vertexList |> List.filter (\i -> Set.member i s)
--         , edgeList = g.edgeList |> List.filter (\( i, j ) -> Set.member i s && Set.member j s)
--     }
