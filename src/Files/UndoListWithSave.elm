module Files.UndoListWithSave exposing
    ( UndoListWithSave
    , fresh
    , undo, redo, new, mapPresent
    , getSavedState, savePresent
    , presentIsTheLastSaved
    , present, hasPast, lengthPast, hasFuture
    , goTo
    , vizData
    , ActionDescription(..), cleanHistoryAndResetToSaved
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

@docs getSavedState, savePresent, resetToSaved


# Saving Related Queries

@docs presentIsTheLastSaved


# Queries

@docs present, hasPast, lengthPast, hasFuture


# Expensive Operations

@docs goTo


# Conversions

@docs vizData

-}

import UndoList as UL exposing (UndoList)


{-|

     Note that the last saved state can lie in the past, present or in the future, or it can be lost.
      The latter happens because the future gets removed by `UndoList.new`.

-}
type UndoListWithSave a
    = UndoListWithSave
        { savedAt : Maybe Int
        , savedState : a
        , uL : UndoList a
        , uLForActionDescriptions : UndoList ActionDescription
        }


type ActionDescription
    = ActionDescription String



---------------
-- INTERNALS --
---------------


mapUL : (UndoList a -> UndoList a) -> UndoListWithSave a -> UndoListWithSave a
mapUL up (UndoListWithSave p) =
    UndoListWithSave
        { p | uL = up p.uL }


mapULForActionDescriptions : (UndoList ActionDescription -> UndoList ActionDescription) -> UndoListWithSave a -> UndoListWithSave a
mapULForActionDescriptions up (UndoListWithSave p) =
    UndoListWithSave
        { p | uLForActionDescriptions = up p.uLForActionDescriptions }


goToHelper : Int -> UndoList a -> UndoList a
goToHelper i uL =
    let
        l =
            uL |> UL.toList

        newPast =
            l |> List.take i |> List.reverse
    in
    case l |> List.drop i of
        newPresent :: newFuture ->
            UndoList newPast newPresent newFuture

        _ ->
            uL



-----------------
-- Constructor --
-----------------


fresh : ActionDescription -> a -> UndoListWithSave a
fresh actionDescription state =
    UndoListWithSave
        { savedAt = Just 0
        , savedState = state
        , uL = UL.fresh state
        , uLForActionDescriptions = UL.fresh actionDescription
        }



----------------------
-- Basic Operations --
----------------------


undo : UndoListWithSave a -> UndoListWithSave a
undo =
    mapUL UL.undo >> mapULForActionDescriptions UL.undo


redo : UndoListWithSave a -> UndoListWithSave a
redo =
    mapUL UL.redo >> mapULForActionDescriptions UL.redo


{-| Saved State Index gets lost if the saved state lies in the future!
-}
new : ActionDescription -> a -> UndoListWithSave a -> UndoListWithSave a
new actionDescription state (UndoListWithSave p) =
    UndoListWithSave
        { p
            | savedAt =
                let
                    savedStateLiesInTheFuture =
                        case p.savedAt of
                            Nothing ->
                                False

                            Just i ->
                                i > UL.lengthPast p.uL
                in
                if savedStateLiesInTheFuture then
                    Nothing

                else
                    p.savedAt
            , uL = UL.new state p.uL
            , uLForActionDescriptions = UL.new actionDescription p.uLForActionDescriptions
        }


mapPresent : (a -> a) -> UndoListWithSave a -> UndoListWithSave a
mapPresent up =
    mapUL (UL.mapPresent up)



-------------------------------
-- Saving Related Operations --
-------------------------------


savePresent : UndoListWithSave a -> UndoListWithSave a
savePresent (UndoListWithSave p) =
    UndoListWithSave
        { p
            | savedAt = Just (UL.lengthPast p.uL)
            , savedState = p.uL.present
        }


cleanHistoryAndResetToSaved : UndoListWithSave a -> UndoListWithSave a
cleanHistoryAndResetToSaved (UndoListWithSave p) =
    fresh (ActionDescription "") p.savedState


getSavedState : UndoListWithSave a -> a
getSavedState (UndoListWithSave p) =
    p.savedState



----------------------------
-- Saving Related Queries --
----------------------------


{-| This can be used in order to mark in the GUI, whether a file has changed after the last save.
-}
presentIsTheLastSaved : UndoListWithSave a -> Bool
presentIsTheLastSaved (UndoListWithSave p) =
    case p.savedAt of
        Just i ->
            i == UL.lengthPast p.uL

        Nothing ->
            False



--------------
--  Queries --
--------------


present : UndoListWithSave a -> a
present (UndoListWithSave p) =
    p.uL.present


{-| To determine whether the undo button should be disabled.
-}
hasPast : UndoListWithSave a -> Bool
hasPast (UndoListWithSave p) =
    UL.hasPast p.uL


{-| To determine whether the undo button should be disabled.
-}
lengthPast : UndoListWithSave a -> Int
lengthPast (UndoListWithSave p) =
    UL.lengthPast p.uL


{-| To determine whether the redo button should be disabled.
-}
hasFuture : UndoListWithSave a -> Bool
hasFuture (UndoListWithSave p) =
    UL.hasFuture p.uL



--------------------------
-- Expensive Operations --
--------------------------


{-| This is expensive but necessary if the whole history is visualized and the user wants to jump to states by clicking on history items.
-}
goTo : Int -> UndoListWithSave a -> UndoListWithSave a
goTo i =
    mapUL (goToHelper i) >> mapULForActionDescriptions (goToHelper i)



-----------------
-- Conversions --
-----------------


vizData : UndoListWithSave a -> List ActionDescription
vizData (UndoListWithSave p) =
    p.uLForActionDescriptions |> UL.toList
