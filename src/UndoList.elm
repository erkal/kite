module UndoList exposing
    ( UndoList
    , undo, redo, fresh, new, forget, reset
    , hasPast, hasFuture, length, lengthPast, lengthFuture
    , Msg(..), mapMsg
    , map, mapPresent, update, connect, reduce, foldl, foldr, reverse, flatten, flatMap, andThen, map2, andMap
    , view
    , toList, fromList
    , goTo
    )

{-| UndoList Data Structure.

This package (`elm-community/undo-redo`) was not updated to 0.19.

TODO: After they update it, import the package and remove this file.


# Definition

@docs UndoList


# Basic Operations

@docs undo, redo, fresh, new, forget, reset


# Query UndoList

@docs hasPast, hasFuture, length, lengthPast, lengthFuture


# Messages

@docs Msg, mapMsg


# Functional Operations

@docs map, mapPresent, update, connect, reduce, foldl, foldr, reverse, flatten, flatMap, andThen, map2, andMap


# Shorthands

@docs view


# Conversions

@docs toList, fromList

-}

import List



-------------------
-- UndoList Type --
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


{-| Get the full length of an undo-list
-}
length : UndoList state -> Int
length undolist =
    lengthPast undolist + 1 + lengthFuture undolist


{-| Get the length of the past.
-}
lengthPast : UndoList state -> Int
lengthPast =
    .past >> List.length


{-| Get the length of the future
-}
lengthFuture : UndoList state -> Int
lengthFuture =
    .future >> List.length



--------------------------
-- UndoList Msg Type --
--------------------------


{-| Simple UndoList Msg type. This is a simple type that can be used for
most use cases. This works best when paired with the `update` function as
`update` will perform the corresponding operations on the undolist automatically.

Consider using your own data type only if you really need it.

-}
type Msg msg
    = Reset
    | Redo
    | Undo
    | Forget
    | New msg


{-| Map a function over a msg.
-}
mapMsg : (a -> b) -> Msg a -> Msg b
mapMsg f msg =
    case msg of
        Reset ->
            Reset

        Redo ->
            Redo

        Undo ->
            Undo

        Forget ->
            Forget

        New newMsg ->
            New (f newMsg)



---------------------------
-- Functional Operations --
---------------------------


{-| Map a function over an undo-list.
Be careful with this. The function will be applied to the past and the future
as well. If you just want to change the present, use `mapPresent`.

A good use case for `map` is to encode an undo-list as JSON.

Example:

    import UndoList.Encode as Encode

    encode encoder undolist =
        map encoder undolist
            |> Encode.undolist

-}
map : (a -> b) -> UndoList a -> UndoList b
map f { past, present, future } =
    UndoList (List.map f past) (f present) (List.map f future)


{-| Map a function over a pair of undo-lists.
-}
map2 : (a -> b -> c) -> UndoList a -> UndoList b -> UndoList c
map2 f undoListA undoListB =
    UndoList (List.map2 f undoListA.past undoListB.past)
        (f undoListA.present undoListB.present)
        (List.map2 f undoListA.future undoListB.future)


{-| Map a function over any number of undo-lists.

    map f xs
        |> andMap ys
        |> andMap zs

-}
andMap : UndoList a -> UndoList (a -> b) -> UndoList b
andMap undoList uF =
    map2 (<|) uF undoList


{-| Apply a function only to the present.
-}
mapPresent : (a -> a) -> UndoList a -> UndoList a
mapPresent f { past, present, future } =
    UndoList past (f present) future


{-| Convert a function that updates the state to a function that updates an undo-list.
This is very useful to allow you to write update functions that only deal with
the individual states of your system and treat undo/redo as an add on.

Example:

    -- Your update function
    update msg state =
      case msg of
        ... -- some implementation

    -- Your new update function
    update' = UndoList.update update

-}
update : (msg -> state -> state) -> Msg msg -> UndoList state -> UndoList state
update updater msg undolist =
    case msg of
        Reset ->
            reset undolist

        Redo ->
            redo undolist

        Undo ->
            undo undolist

        Forget ->
            forget undolist

        New msg_ ->
            new (updater msg_ undolist.present) undolist


{-| Alias for `foldl`
-}
reduce : (a -> b -> b) -> b -> UndoList a -> b
reduce =
    foldl


{-| Reduce an undo-list from the left (or from the past)
-}
foldl : (a -> b -> b) -> b -> UndoList a -> b
foldl reducer initial { past, present, future } =
    List.foldr reducer initial past
        |> reducer present
        |> (\b -> List.foldl reducer b future)


{-| Reduce an undo-list from the right (or from the future)
-}
foldr : (a -> b -> b) -> b -> UndoList a -> b
foldr reducer initial { past, present, future } =
    List.foldr reducer initial future
        |> reducer present
        |> (\b -> List.foldl reducer b past)


{-| Reverse an undo-list.
-}
reverse : UndoList a -> UndoList a
reverse { past, present, future } =
    UndoList future present past


{-| Flatten an undo-list of undo-lists into a single undo-list.
-}
flatten : UndoList (UndoList a) -> UndoList a
flatten { past, present, future } =
    UndoList (present.past ++ List.reverse (List.concatMap toList past))
        present.present
        (present.future ++ List.concatMap toList future)


{-| Map over an undo-list and then flatten the result.
-}
flatMap : (a -> UndoList b) -> UndoList a -> UndoList b
flatMap f =
    map f >> flatten


{-| Chain undo-list operations. This is simply an alias of `flatMap`
-}
andThen : (a -> UndoList b) -> UndoList a -> UndoList b
andThen =
    flatMap


{-| Connect two undo-lists end to end. The present of the first undolist is
considered the present of the output undolist.
-}
connect : UndoList state -> UndoList state -> UndoList state
connect { past, present, future } undolist =
    UndoList past present (future ++ toList undolist)



----------------
-- Shorthands --
----------------


{-| Function to help not having to deal with the full undolist from with
your actual view function.

Suppose you define the following:

    initial : model

    update : msg -> model -> model

    view : model -> Html (UndoList.Msg msg)

Then, you could construct the main function as follows:

    main =
        Html.beginnerProgram
            { model = UndoList.fresh initial
            , update = UndoList.update update
            , view = UndoList.view view
            }

-}
view : (state -> view) -> UndoList state -> view
view viewer { present } =
    viewer present



-----------------
-- Conversions --
-----------------


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
