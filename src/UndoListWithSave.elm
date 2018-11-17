module UndoListWithSave exposing
    ( UndoList
    , undo, redo, fresh, new, mapPresent, forget, reset
    , hasPast, hasFuture
    , toList, fromList
    , goTo
    )

{-| UndoList Data Structure keeping also track of the last saved state.

This package is adapted from (`elm-community/undo-redo`).


# Definition

@docs UndoList


# Basic Operations

@docs undo, redo, fresh, new, mapPresent, forget, reset


# Query UndoList

@docs hasPast, hasFuture


# Conversions

@docs toList, fromList

-}

import List



-------------------
-- UndoList that keeps track of the last saved position --
-------------------


{-| The UndoList data structure.
An UndoList has:

1.  A list of past states
2.  A present state
3.  A list of future states

The head of the past list is the most recent state and the head of the future
list is the next state. (i.e., the tails of both lists point away from the
present)

-}
type alias UndoList state =
    { past : List state
    , present : state
    , future : List state
    }



--type UndoList state =
--  UndoList
--    { pastBeforeSaved : List state
--    , saved : state
--    , pastAfterSaved : List state
--    , present : state
--    , future : List state
--    }
-------------------------------
-- Basic UndoList Operations --
-------------------------------


{-| If the undolist has any past states, set the most recent past
state as the current state and turn the old present state into
a future state.

i.e.

    undo (UndoList [ 3, 2, 1 ] 4 [ 5, 6 ]) == UndoList [ 2, 1 ] 3 [ 4, 5, 6 ]

-}
undo : UndoList state -> UndoList state
undo { past, present, future } =
    case past of
        [] ->
            UndoList past present future

        x :: xs ->
            UndoList xs x (present :: future)


{-| If the undo-list has any future states, set the next
future state as the current state and turn the old present state
into a past state.

i.e.

    redo (UndoList [ 3, 2, 1 ] 4 [ 5, 6 ]) == UndoList [ 4, 3, 2, 1 ] 5 [ 6 ]

-}
redo : UndoList state -> UndoList state
redo { past, present, future } =
    case future of
        [] ->
            UndoList past present future

        x :: xs ->
            UndoList (present :: past) x xs


{-| Set the present to be a particular item the index of which is the first argument. The indexing starts with 0. This is useful when the history is visualized as a list of states and the user wants to jump somewhere by clicking an item.
-}
goTo : Int -> UndoList state -> UndoList state
goTo i undoList =
    let
        l =
            undoList |> toList

        past =
            l |> List.take i |> List.reverse
    in
    case l |> List.drop i of
        present :: future ->
            UndoList past present future

        _ ->
            undoList


{-| Turn a state into an undo-list with neither past nor future.
-}
fresh : state -> UndoList state
fresh state =
    UndoList [] state []


{-| Add a new present state to the undo-list, turning the old
present state into a past state and erasing the future.
-}
new : state -> UndoList state -> UndoList state
new event { past, present } =
    UndoList (present :: past) event []


{-| Forget the past and look to the future!
This simply clears the past list.

i.e.
forget (UndoList [3,2,1] 4 [5,6]) == UndoList [] 4 [5,6]

-}
forget : UndoList state -> UndoList state
forget { present, future } =
    UndoList [] present future


{-| Reset the undo-list by returning to the very first state
and clearing all other states.

i.e.

    reset (UndoList [ 3, 2, 1 ] 4 [ 5, 6 ]) == UndoList [] 1 []

-}
reset : UndoList state -> UndoList state
reset { past, present } =
    case past of
        [] ->
            fresh present

        x :: xs ->
            reset (UndoList xs x [])



----------------------
-- UndoList Queries --
----------------------


{-| Check if the undo-list has any past states.
-}
hasPast : UndoList state -> Bool
hasPast =
    not << List.isEmpty << .past


{-| Check if the undo-list has any future states.
-}
hasFuture : UndoList state -> Bool
hasFuture =
    not << List.isEmpty << .future



---------------------------
-- Functional Operations --
---------------------------


{-| Apply a function only to the present.
-}
mapPresent : (a -> a) -> UndoList a -> UndoList a
mapPresent f { past, present, future } =
    UndoList past (f present) future


{-| Convert an undo-list to a list :

    toList (UndoList [ 3, 2, 1 ] 4 [ 5, 6 ]) == [ 1, 2, 3, 4, 5, 6 ]

-}
toList : UndoList state -> List state
toList { past, present, future } =
    List.reverse past ++ [ present ] ++ future


{-| Convert a list to undolist. The provided state is used as the present
state and the list is used as the future states.

    fromList 1 [ 2, 3, 4 ] == UndoList [] 1 [ 2, 3, 4 ]

-}
fromList : state -> List state -> UndoList state
fromList present future =
    UndoList [] present future
