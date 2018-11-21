module Files exposing
    ( Files
    , empty
    , new, delete, deleteFocused
    , focus, close, reallyClose, closeAll
    , set, mapPresent
    , save, saveAs, saveAll
    , undo, redo, goTo
    , fileNames, hasTheFocus, present, lengthPast, hasPast, hasChangedAfterLastSave, hasFuture, focusedHasFuture, focusedHasPast, uLToList
    )

{-| Represent an ordered list of files, allowing saving and undo-redo operations on each file.
An example usage can be seen in the source of [this app](https://erkal.github.io/kite/).

The main data structure, called `Files`, keeps an **ordered** list of files and the API allows the user to move files via `move` function.
Apart from this, it behaves similar to most editors, namely:

  - If a new file is added (via `new`), it immediately gets the focus.
  - If a file is closed, the past and the future of the file gets lost, in the sense that undo and redo will not work directly after the file is refocused.
  - `close`, and `reallyClose` gives you the oportunity to ask the user if she really wants to close the file, in the case that there are unsaved changes.

**Main restrictions:**

  - There is no folder structure.
  - There is no concept of "opening a file". Instead, use `hasPast`.
  - There is no way of getting data of a file if the file is not focused.


# Definition

@docs Files


# Constructor

@docs empty


# Adding and Deleting Files

@docs new, delete, deleteFocused


# Focusing and Closing Files

@docs focus, close, reallyClose, closeAll


# Updating Focused File

@docs set, mapPresent


# Saving

@docs save, saveAs, saveAll


# Undo-Redo on Focused File

@docs undo, redo, goTo


# Queries (only to use in **view**)

@docs fileNames, hasTheFocus, present, lengthPast, hasPast, hasChangedAfterLastSave, hasFuture, focusedHasFuture, focusedHasPast, uLToList

-}

import Array exposing (Array)
import Files.UndoListWithSave as ULWS exposing (UndoListWithSave)


{-| Main data structure. It keeps an array of files
-}
type Files a
    = Files
        { maybeFocus : Maybe Int
        , arr : Array (File a)
        }


type alias File a =
    { name : String
    , uLWS : UndoListWithSave a
    }



---------------
-- Internals --
---------------


mapFocused : (File a -> File a) -> Files a -> Files a
mapFocused up (Files { maybeFocus, arr }) =
    Files
        { maybeFocus = maybeFocus
        , arr =
            case maybeFocus of
                Just i ->
                    case Array.get i arr of
                        Nothing ->
                            arr

                        Just file ->
                            Array.set i (up file) arr

                Nothing ->
                    arr
        }


mapULWS :
    (UndoListWithSave state -> UndoListWithSave state)
    -> File state
    -> File state
mapULWS up file =
    { file | uLWS = up file.uLWS }


insertAt : Int -> a -> Array a -> Array a
insertAt i a arr =
    let
        l =
            Array.toList arr
    in
    List.take i l
        ++ [ a ]
        ++ List.drop i l
        |> Array.fromList


removeAt : Int -> Array a -> Array a
removeAt i arr =
    let
        l =
            Array.toList arr
    in
    List.take i l
        ++ List.drop (i + 1) l
        |> Array.fromList



-----------------
-- Constructor --
-----------------


{-| an empty `Files`. This is the only constructor.
-}
empty : Files a
empty =
    Files
        { maybeFocus = Nothing
        , arr = Array.empty
        }



-------------------------------
-- Adding and Deleting Files --
-------------------------------


new : String -> a -> Files a -> Files a
new name d (Files { maybeFocus, arr }) =
    case maybeFocus of
        Just i ->
            Files
                { maybeFocus = Just (i + 1)
                , arr =
                    arr
                        |> insertAt (i + 1)
                            { name = name
                            , uLWS = ULWS.fresh d
                            }
                }

        Nothing ->
            Files
                { maybeFocus = Just (Array.length arr)
                , arr =
                    arr
                        |> Array.push
                            { name = name
                            , uLWS = ULWS.fresh d
                            }
                }


deleteFocused : Files a -> Files a
deleteFocused ((Files { maybeFocus }) as files) =
    case maybeFocus of
        Just i ->
            delete i files

        Nothing ->
            files


{-| This doesn't do anything if it is the last item in the list.
-}
delete : Int -> Files a -> Files a
delete i ((Files { arr }) as files) =
    if i == 0 && Array.length arr == 1 then
        files

    else
        Files
            { maybeFocus =
                if i == 0 then
                    Just 0

                else
                    Just (i - 1)
            , arr = arr |> removeAt i
            }



--------------------------------
-- Focusing and Closing Files --
--------------------------------


{-| `focus i` focuses the file with index **i** given that **i** is smaller than the number of files. If **i** is out of bounds, than it makes the focus get lost. This serves as a warning because, usually, the GUI should not allow such a high value for `i`.
The indexing of files starts with 0.
-}
focus : Int -> Files a -> Files a
focus i (Files files) =
    Files
        { files
            | maybeFocus =
                if i < Array.length files.arr then
                    Just i

                else
                    Nothing
        }


close : Int -> Files a -> Files a
close i =
    -- TODO
    identity


reallyClose : Int -> Files a -> Files a
reallyClose i (Files { maybeFocus, arr }) =
    Files
        { maybeFocus =
            if i == 0 && Array.length arr == 1 then
                Nothing

            else if i == 0 then
                Just 0

            else
                Just (i - 1)
        , arr =
            case Array.get i arr of
                Nothing ->
                    arr

                Just file ->
                    Array.set i
                        { file | uLWS = ULWS.resetToSaved file.uLWS }
                        arr
        }


closeAll : Files a -> Files a
closeAll =
    -- TODO
    identity



---------------------------
-- Updating Focused File --
---------------------------


set : a -> Files a -> Files a
set newState =
    mapFocused (mapULWS (ULWS.new newState))


mapPresent : (a -> a) -> Files a -> Files a
mapPresent up =
    mapFocused (mapULWS (ULWS.mapPresent up))



------------
-- Saving --
------------


save : Files a -> Files a
save =
    mapFocused (mapULWS ULWS.savePresent)


saveAs : String -> Files a -> Files a
saveAs name =
    -- TODO
    identity


saveAll : Files a -> Files a
saveAll =
    -- TODO
    identity



-------------------------------
-- Undo-Redo on Focused File --
-------------------------------


undo : Files a -> Files a
undo =
    mapFocused (mapULWS ULWS.undo)


redo : Files a -> Files a
redo =
    mapFocused (mapULWS ULWS.redo)


goTo : Int -> Files a -> Files a
goTo i =
    mapFocused (mapULWS (ULWS.goTo i))



---------------------------------------
-- Queries (only to use in **view**) --
---------------------------------------


fileNames : Files a -> List String
fileNames (Files { arr }) =
    arr |> Array.toList |> List.map .name


hasTheFocus : Int -> Files a -> Bool
hasTheFocus i (Files { maybeFocus }) =
    maybeFocus == Just i


hasChangedAfterLastSave : Int -> Files a -> Bool
hasChangedAfterLastSave i (Files { arr }) =
    Array.get i arr
        |> Maybe.map (.uLWS >> ULWS.presentIsTheLastSaved >> not)
        |> Maybe.withDefault False


{-| The present a of the focused File.
-}
present : Files a -> a
present (Files { maybeFocus, arr }) =
    let
        get i =
            Array.get i arr
                |> Maybe.map (.uLWS >> ULWS.present)
    in
    case maybeFocus |> Maybe.andThen get of
        Just a ->
            a

        Nothing ->
            Debug.todo ""


{-| The length of the past of the focused File. Returns 0 if no file is focused.
-}
lengthPast : Files a -> Int
lengthPast (Files { maybeFocus, arr }) =
    let
        get i =
            Array.get i arr
                |> Maybe.map (.uLWS >> ULWS.lengthPast)
    in
    maybeFocus
        |> Maybe.andThen get
        |> Maybe.withDefault 0


{-| returns True if the file in the given index has a past.
-}
hasPast : Int -> Files a -> Bool
hasPast i (Files { arr }) =
    Array.get i arr
        |> Maybe.map (.uLWS >> ULWS.hasPast)
        |> Maybe.withDefault False


{-| returns True if the file in the given index has a future.
-}
hasFuture : Int -> Files a -> Bool
hasFuture i (Files { arr }) =
    Array.get i arr
        |> Maybe.map (.uLWS >> ULWS.hasFuture)
        |> Maybe.withDefault False


focusedHasPast : Files a -> Bool
focusedHasPast (Files { maybeFocus, arr }) =
    let
        get i =
            Array.get i arr
                |> Maybe.map (.uLWS >> ULWS.hasPast)
    in
    maybeFocus
        |> Maybe.andThen get
        |> Maybe.withDefault False


focusedHasFuture : Files a -> Bool
focusedHasFuture (Files { maybeFocus, arr }) =
    let
        get i =
            Array.get i arr
                |> Maybe.map (.uLWS >> ULWS.hasFuture)
    in
    maybeFocus
        |> Maybe.andThen get
        |> Maybe.withDefault False


uLToList : Files a -> List a
uLToList (Files { maybeFocus, arr }) =
    let
        get i =
            Array.get i arr
                |> Maybe.map (.uLWS >> ULWS.toList)
    in
    maybeFocus
        |> Maybe.andThen get
        |> Maybe.withDefault []
