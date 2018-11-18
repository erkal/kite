module UndoListWithSave exposing
    ( UndoListWithSave
    , fresh
    , undo, redo, new, setPresent, mapPresent
    , savePresent, resetToSaved
    , presentIsTheLastSaved
    , getPresent, hasPast, hasFuture
    , goTo
    )

{-| UndoList Data Structure keeping also track of the last saved state.
It allows the user to check fast whether the current state has changed after last save.

The terminology of functions is adapted to [elm-community/undo-redo](https://package.elm-lang.org/packages/elm-community/undo-redo/latest/)


# Definition

@docs UndoListWithSave


# Constructor

@docs fresh


# Basic Operations

@docs undo, redo, new, setPresent, mapPresent


# Saving Related Operations

@docs savePresent, resetToSaved


# Saving Related Queries

@docs presentIsTheLastSaved


# Queries

@docs getPresent, hasPast, hasFuture


# Expensive Operations

@docs goTo

-}

import UndoList as UL exposing (UndoList)


{-| Note that the last saved state can lie in the past, present or in the future, or it can be lost. The latter happens because the future gets removed by `UndoList.new`.
-}
type UndoListWithSave state
    = UndoListWithSave
        { savedAt : Maybe Int
        , savedState : state
        , uL : UndoList state
        }



---------------
-- INTERNALS --
---------------


mapUL : (UndoList a -> UndoList a) -> UndoListWithSave a -> UndoListWithSave a
mapUL up (UndoListWithSave { savedAt, savedState, uL }) =
    UndoListWithSave
        { savedAt = savedAt
        , savedState = savedState
        , uL = up uL
        }


goToHelper : Int -> UndoList a -> UndoList a
goToHelper i uL =
    let
        l =
            uL |> UL.toList

        past =
            l |> List.take i |> List.reverse
    in
    case l |> List.drop i of
        present :: future ->
            UndoList past present future

        _ ->
            uL



-----------------
-- Constructor --
-----------------


fresh : a -> UndoListWithSave a
fresh state =
    UndoListWithSave
        { savedAt = Just 0
        , savedState = state
        , uL = UL.fresh state
        }



----------------------
-- Basic Operations --
----------------------


undo : UndoListWithSave a -> UndoListWithSave a
undo =
    mapUL UL.undo


redo : UndoListWithSave a -> UndoListWithSave a
redo =
    mapUL UL.undo


{-| Saved State Index gets lost if the saved state lies in the future!
-}
new : a -> UndoListWithSave a -> UndoListWithSave a
new state (UndoListWithSave { savedAt, savedState, uL }) =
    UndoListWithSave
        { savedAt =
            let
                savedStateLiesInTheFuture =
                    case savedAt of
                        Nothing ->
                            False

                        Just i ->
                            i > UL.lengthPast uL
            in
            if savedStateLiesInTheFuture then
                Nothing

            else
                savedAt
        , savedState = savedState
        , uL = UL.new state uL
        }


mapPresent : (a -> a) -> UndoListWithSave a -> UndoListWithSave a
mapPresent up =
    mapUL (UL.mapPresent up)


setPresent : a -> UndoListWithSave a -> UndoListWithSave a
setPresent newState =
    mapPresent (always newState)



-------------------------------
-- Saving Related Operations --
-------------------------------


savePresent : UndoListWithSave a -> UndoListWithSave a
savePresent (UndoListWithSave { savedAt, savedState, uL }) =
    UndoListWithSave
        { savedAt = Just (UL.lengthPast uL)
        , savedState = uL.present
        , uL = uL
        }


resetToSaved : UndoListWithSave a -> UndoListWithSave a
resetToSaved (UndoListWithSave { savedState }) =
    fresh savedState



----------------------------
-- Saving Related Queries --
----------------------------


{-| Fast check whether the state has changed after the last save.
This can be used in order to mark in the GUI, whether a file has changed after the last save.
-}
presentIsTheLastSaved : UndoListWithSave a -> Bool
presentIsTheLastSaved (UndoListWithSave { savedAt, uL }) =
    case savedAt of
        Just i ->
            i == UL.lengthPast uL

        Nothing ->
            False



--------------
--  Queries --
--------------


getPresent : UndoListWithSave a -> a
getPresent (UndoListWithSave { uL }) =
    uL.present


{-| To determine whether the undo button should be disabled.
-}
hasPast : UndoListWithSave a -> Bool
hasPast (UndoListWithSave { uL }) =
    UL.hasPast uL


{-| To determine whether the redo button should be disabled.
-}
hasFuture : UndoListWithSave a -> Bool
hasFuture (UndoListWithSave { uL }) =
    UL.hasFuture uL



--------------------------
-- Expensive Operations --
--------------------------


{-| This is expensive but necessary if the whole history is visualized and the user wants to jump to states by clicking on history items.
-}
goTo : Int -> UndoListWithSave a -> UndoListWithSave a
goTo i =
    mapUL (goToHelper i)
