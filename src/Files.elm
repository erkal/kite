module Files exposing
    ( Files
    , singleton
    , new, delete, deleteFocused
    , getFile, indexHasTheFocus, indexWithTheFocus, indexHasFuture, indexHasPast, indexHasChangedAfterLastSave
    , reallyClose
    , present
    , hasFuture, hasPast
    , lengthPast
    , uLToList
    , mapPresent
    , save, saveAs
    , undo, redo, goTo
    , focus, set, saveAll, fileNames
    )

{-| Represent an ordered nonempty array of files, allowing efficent saving and undo-redo operations on each file. It also keeps track of a focused file.
An example usage can be seen in the source of [this app](https://erkal.github.io/kite/).

It behaves similar to most editors, namely:

  - If a new file is added (via `new`), it immediately gets the focus.
  - If a file is closed, the past and the future of the file gets lost, in the sense that undo and redo will not work directly after the file is refocused.
  - `close`, and `reallyClose` gives you the oportunity to ask the user if she really wants to close the file, in the case that there are unsaved changes.

**Main restrictions:**

  - There is no folder structure.
  - There is no concept of "opening a file". Instead, use `indexHasPast`.


# Definition

@docs Files


# Constructor

@docs singleton


# Adding and Deleting Files

@docs new, delete, deleteFocused


# Querying by Index

@docs getFile, indexHasTheFocus, indexWithTheFocus, indexHasFuture, indexHasPast, indexHasChangedAfterLastSave


# Updating by Index

@docs reallyClose


# Querying Focused

@docs present
@docs hasFuture, hasPast
@docs lengthPast
@docs uLToList


# Updating Focused

@docs mapPresent
@docs save, saveAs
@docs undo, redo, goTo


# Operations and Queries on all Files

@docs focus, set, saveAll, fileNames

-}

import Array exposing (Array)
import Files.UndoListWithSave as ULWS exposing (UndoListWithSave)


{-| Main data structure. It keeps an array of files with the index of focused file.
-}
type Files a
    = Files Int (Array (File a))


type File a
    = File Name (UndoListWithSave a)


type alias Name =
    String



---------------------
-- Array Internals --
---------------------


insertAt : Int -> a -> Array a -> Array a
insertAt i a arr =
    let
        l =
            Array.toList arr
    in
    Array.fromList
        (List.take i l ++ [ a ] ++ List.drop i l)


removeAt : Int -> Array a -> Array a
removeAt i arr =
    let
        l =
            Array.toList arr
    in
    Array.fromList
        (List.take i l ++ List.drop (i + 1) l)


mapArray : Int -> (a -> a) -> Array a -> Array a
mapArray i up arr =
    case Array.get i arr of
        Just file ->
            Array.set i (up file) arr

        Nothing ->
            arr



---------------
-- Internals --
---------------


mapFocused : (File a -> File a) -> Files a -> Files a
mapFocused up (Files i arr) =
    Files i
        (mapArray i up arr)


mapULWS :
    (UndoListWithSave a -> UndoListWithSave a)
    -> File a
    -> File a
mapULWS up (File name uLWS) =
    File name
        (up uLWS)


getULWSProperty :
    (UndoListWithSave a -> b)
    -> b
    -> Int
    -> Files a
    -> b
getULWSProperty get default i (Files _ arr) =
    Array.get i arr
        |> Maybe.map (\(File _ uLWS) -> get uLWS)
        |> Maybe.withDefault default


getFocusedULWSProperty : (UndoListWithSave a -> b) -> b -> Files a -> b
getFocusedULWSProperty get default ((Files i _) as files) =
    getULWSProperty get default i files


getName : File a -> Name
getName (File name _) =
    name


applyToFocused : (Int -> Files a -> b) -> Files a -> b
applyToFocused f ((Files i _) as files) =
    f i files


mapFocusedULWS =
    mapULWS >> mapFocused



-----------------
-- Constructor --
-----------------


{-| This is the only constructor.
-}
singleton : Name -> a -> Files a
singleton name d =
    let
        file =
            File name (ULWS.fresh d)

        arr =
            Array.push file Array.empty
    in
    Files 0 arr


new : Name -> a -> Files a -> Files a
new name d ((Files i arr) as files) =
    let
        file =
            File name (ULWS.fresh d)

        newArr =
            insertAt (i + 1) file arr
    in
    Files (i + 1) newArr


{-| This doesn't do anything if it is the last item in the list.
-}
delete : Int -> Files a -> Files a
delete i ((Files _ arr) as files) =
    let
        n =
            Array.length arr
    in
    if n == 1 || i >= n then
        files

    else
        Files (max 0 (i - 1)) (removeAt i arr)



------------------
-- Focused File --
------------------


set : a -> Files a -> Files a
set newState =
    mapFocusedULWS (ULWS.new newState)


mapPresent : (a -> a) -> Files a -> Files a
mapPresent up =
    mapFocusedULWS (ULWS.mapPresent up)


deleteFocused : Files a -> Files a
deleteFocused ((Files i _) as files) =
    delete i files


save : Files a -> Files a
save =
    mapFocusedULWS ULWS.savePresent


saveAs : Name -> Files a -> Files a
saveAs name =
    -- TODO
    identity


saveAll : Files a -> Files a
saveAll =
    -- TODO
    identity


undo : Files a -> Files a
undo =
    mapFocusedULWS ULWS.undo


redo : Files a -> Files a
redo =
    mapFocusedULWS ULWS.redo


hasPast : Files a -> Bool
hasPast =
    applyToFocused indexHasPast


hasFuture : Files a -> Bool
hasFuture =
    applyToFocused indexHasFuture


{-| The present a of the focused File.
-}
present : a -> Files a -> a
present =
    getFocusedULWSProperty ULWS.present


goTo : Int -> Files a -> Files a
goTo i =
    mapFocusedULWS (ULWS.goTo i)


{-| The length of the past of the focused File. Returns 0 if no file is focused.
-}
lengthPast : Files a -> Int
lengthPast =
    getFocusedULWSProperty ULWS.lengthPast 0


uLToList : Files a -> List a
uLToList =
    getFocusedULWSProperty ULWS.toList []



-------------------------------------------------------
-- Getter (only for using for transition animations) --
-------------------------------------------------------


{-| Returns the first argument as default if the index given as second parameter is out of bounds.
-}
getFile : a -> Int -> Files a -> a
getFile =
    getULWSProperty ULWS.present



---------------------------------------
-- Queries (only to use in **view**) --
---------------------------------------


fileNames : Files a -> List Name
fileNames (Files _ arr) =
    List.map getName (Array.toList arr)


closeAll : Files a -> Files a
closeAll =
    -- TODO
    identity


indexHasTheFocus : Int -> Files a -> Bool
indexHasTheFocus j (Files i _) =
    j == i


indexWithTheFocus : Files a -> Int
indexWithTheFocus (Files i _) =
    i


indexHasChangedAfterLastSave : Int -> Files a -> Bool
indexHasChangedAfterLastSave =
    getULWSProperty (ULWS.presentIsTheLastSaved >> not)
        False


{-| returns True if the file in the given index has a past.
-}
indexHasPast : Int -> Files a -> Bool
indexHasPast =
    getULWSProperty ULWS.hasPast False


{-| returns True if the file in the given index has a future.
-}
indexHasFuture : Int -> Files a -> Bool
indexHasFuture =
    getULWSProperty ULWS.hasFuture False


{-| `focus i` focuses the file with index **i** given that **i** is smaller than the number of files. If **i** is out of bounds, than it makes the focus get lost. This serves as a warning because, usually, the GUI should not allow such a high value for `i`.
The indexing of files starts with 0.
-}
focus : Int -> Files a -> Files a
focus i ((Files _ arr) as files) =
    if i < Array.length arr then
        Files i arr

    else
        files


close : Int -> Files a -> Files a
close i =
    -- TODO
    identity


reallyClose : Int -> Files a -> Files a
reallyClose i (Files _ arr) =
    Files
        (max 0 (i - 1))
        (mapArray i (mapULWS ULWS.resetToSaved) arr)
