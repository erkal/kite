module UndoListWithSave exposing (UndoListWithSave)

{-| ( UndoList
, undo, redo, fresh, new, mapPresent, forget, reset
, hasPast, hasFuture
, toList, fromList
, goTo
)

UndoList Data Structure keeping also track of the last saved state.
It allows the user to check fast whether the current state has changed after last save.

The terminology of functions is adapted to [elm-community/undo-redo](https://package.elm-lang.org/packages/elm-community/undo-redo/latest/)


# Definition

@docs UndoListWithSave


# Basic Operations

@docs undo, redo, fresh, new, mapPresent, forget, reset


# Query UndoList

@docs hasPast, hasFuture


# Conversions

@docs toList, fromList

-}

import UndoList as UL exposing (UndoList)


{-| Note that the last saved state can lie in the past, present or in the future, or in none of them!
-}
type UndoListWithSave state
    = UndoListWithSave
        { savedAt : Maybe Int
        , savedState : state
        , ul : UndoList state
        }



-------------------------------
-- Basic UndoList Operations --
-------------------------------
--undo : UndoList state -> UndoList state
--undo { past, present, future } =
--    case past of
--        [] ->
--            UndoList past present future
--        x :: xs ->
--            UndoList xs x (present :: future)
--redo : UndoList state -> UndoList state
--redo { past, present, future } =
--    case future of
--        [] ->
--            UndoList past present future
--        x :: xs ->
--            UndoList (present :: past) x xs
--goTo : Int -> UndoList state -> UndoList state
--goTo i undoList =
--    let
--        l =
--            undoList |> toList
--        past =
--            l |> List.take i |> List.reverse
--    in
--    case l |> List.drop i of
--        present :: future ->
--            UndoList past present future
--        _ ->
--            undoList
--fresh : state -> UndoList state
--fresh state =
--    UndoList [] state []
--new : state -> UndoList state -> UndoList state
--new event { past, present } =
--    UndoList (present :: past) event []
--forget : UndoList state -> UndoList state
--forget { present, future } =
--    UndoList [] present future
--reset : UndoList state -> UndoList state
--reset { past, present } =
--    case past of
--        [] ->
--            fresh present
--        x :: xs ->
--            reset (UndoList xs x [])
----------------------
-- UndoList Queries --
----------------------
--hasPast : UndoList state -> Bool
--hasPast =
--    not << List.isEmpty << .past
--hasFuture : UndoList state -> Bool
--hasFuture =
--    not << List.isEmpty << .future
---------------------------
-- Functional Operations --
---------------------------
--mapPresent : (a -> a) -> UndoList a -> UndoList a
--mapPresent f { past, present, future } =
--    UndoList past (f present) future
--toList : UndoList state -> List state
--toList { past, present, future } =
--    List.reverse past ++ [ present ] ++ future
--fromList : state -> List state -> UndoList state
--fromList present future =
--    UndoList [] present future
