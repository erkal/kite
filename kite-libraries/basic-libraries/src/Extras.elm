module Extras exposing (..)

import Set exposing (Set)
import Dict exposing (Dict)


{-|
Shortcut for Maybe.withDefault.
-}
(?) : Maybe a -> a -> a
(?) maybe default =
    Maybe.withDefault default maybe
infixr 9 ?


{-|
Get the first element of a list which satisfies the predicate.
-}
first : (a -> Bool) -> List a -> Maybe a
first f list =
    case list of
        [] ->
            Nothing

        head :: tail ->
            if f head then
                Just head
            else
                first f tail


{-|
`getIndex e l` is the index of `e` in `l`, starting from 0.
-}
getIndex : a -> List a -> Maybe Int
getIndex element list =
    let
        --helper : a -> List a -> Int -> Maybe Int
        helper element list order =
            case list of
                [] ->
                    Nothing

                x :: tail ->
                    if element == x then
                        Just order
                    else
                        helper element tail (order + 1)
    in
        helper element list 0


{-|
Sorts pairs by their values of a function.
For example
`sortPairBy snd (('b',5),('z',3))`
equals
`(('z',3),('b',5))`
-}
sortPairBy : (a -> comparable) -> ( a, a ) -> ( a, a )
sortPairBy f ( a1, a2 ) =
    if f a1 <= f a2 then
        ( a1, a2 )
    else
        ( a2, a1 )


{-|
Sorts pairs
For example `sortPair (5,3)` is `(3,5)`
-}
sortPair : ( comparable, comparable ) -> ( comparable, comparable )
sortPair =
    sortPairBy identity


{-|
`isSubset s t` holds, iff `s` is a subset of `t`.
-}
isSubset : Set comparable -> Set comparable -> Bool
isSubset s t =
    Set.isEmpty (Set.diff s t)


{-|
`subsets k s` is the list of `k`-subsets of the set `s`
-}
subsets : Int -> Set comparable -> List (Set comparable)
subsets k set =
    if k > Set.size set then
        []
    else if k == 0 then
        [ Set.empty ]
    else
        case Set.toList set of
            [] ->
                []

            h :: tail ->
                let
                    t =
                        Set.fromList tail
                in
                    List.concat
                        [ t |> subsets k
                        , t |> subsets (k - 1) |> List.map (Set.insert h)
                        ]


{-|
Cartesian Product of two sets
-}
cartesianProd : Set comparable -> Set comparable_ -> Set ( comparable, comparable_ )
cartesianProd set1 set2 =
    let
        list1 =
            Set.toList set1

        list2 =
            Set.toList set2

        row i =
            List.map (\j -> ( i, j )) list2
    in
        list1
            |> List.concatMap row
            |> Set.fromList


{-|
groups the elements of list by their value under a given function
-}
groupBy : (a -> comparable) -> List a -> Dict comparable (List a)
groupBy f l =
    let
        upd e acc =
            let
                fe =
                    f e
            in
                case Dict.get fe acc of
                    Just l_ ->
                        acc |> Dict.insert fe (e :: l_)

                    Nothing ->
                        acc |> Dict.insert fe [ e ]
    in
        l
            |> List.foldr upd Dict.empty


{-|
like `groupBy` but the grouping function returns a maybe.
The elements which have value Nothing, are filtered out.
-}
groupMaybeBy : (a -> Maybe comparable) -> List a -> Dict comparable (List a)
groupMaybeBy f l =
    let
        upd e acc =
            case f e of
                Nothing ->
                    acc

                Just fe ->
                    case Dict.get fe acc of
                        Just l_ ->
                            acc |> Dict.insert fe (e :: l_)

                        Nothing ->
                            acc |> Dict.insert fe [ e ]
    in
        l
            |> List.foldr upd Dict.empty
