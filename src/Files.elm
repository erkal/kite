module Files exposing
    ( Files
    , empty
    , new, deleteAt
    , focus, close, reallyClose, closeAll
    , update, updateWithoutRecording
    , save, saveAs, saveAll
    , undo, redo
    , getPresent, hasChanged
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
  - There is no concept of "opening a file". Instead, use `hasChanged`.
  - There is no way of getting data of a file if the file is not focused.


# Definition

@docs Files


# Constructor

@docs empty


# Adding and Deleting Files

@docs new, deleteAt


# Focusing and Closing Files

@docs focus, close, reallyClose, closeAll


# Updating Focused File

@docs update, updateWithoutRecording


# Saving

@docs save, saveAs, saveAll


# Undo-Redo on Focused File

@docs undo, redo


# Queries (only to use in **view**)

@docs getPresent, hasChanged

-}

import Array exposing (Array)
import UndoListWithSave as ULWS exposing (UndoListWithSave)


{-| Main data structure. It keeps an array of files
-}
type Files data
    = Files
        { maybeFocus : Maybe Int
        , arr : Array (File data)
        }


type alias File data =
    { name : String
    , uLWS : UndoListWithSave data
    }



---------------
-- Internals --
---------------


insertAfter : Int -> a -> Array a -> Array a
insertAfter i a arr =
    Array.slice 0 (i + 1) arr
        |> Array.append (Array.fromList [ a ])
        |> Array.append (Array.slice (i + 1) (Array.length arr) arr)


removeAt : Int -> Array a -> Array a
removeAt i arr =
    Array.slice 0 i arr
        |> Array.append (Array.slice (i + 1) (Array.length arr) arr)



-----------------
-- Constructor --
-----------------


{-| an empty `Files`. This is the only constructor.
-}
empty : Files data
empty =
    Files
        { maybeFocus = Nothing
        , arr = Array.empty
        }



-------------------------------
-- Adding and Deleting Files --
-------------------------------


new : String -> data -> Files data -> Files data
new name d (Files { maybeFocus, arr }) =
    case maybeFocus of
        Just i ->
            Files
                { maybeFocus = Just (i + 1)
                , arr =
                    arr
                        |> insertAfter i
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


deleteAt : Int -> Files data -> Files data
deleteAt i (Files { arr }) =
    Files
        { maybeFocus =
            if i == 0 && Array.length arr == 1 then
                Nothing

            else if i == 0 then
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
focus : Int -> Files data -> Files data
focus i (Files files) =
    Files
        { files
            | maybeFocus =
                if i < Array.length files.arr then
                    Just i

                else
                    Nothing
        }


close =
    42


reallyClose =
    42


closeAll =
    42



---------------------------
-- Updating Focused File --
---------------------------


update : (data -> data) -> Files data -> Files data
update up (Files files) =
    Files files


updateWithoutRecording : (data -> data) -> Files data -> Files data
updateWithoutRecording up (Files files) =
    Files files



------------
-- Saving --
------------


save : Files data -> Files data
save fL =
    -- TODO
    fL


saveAs : String -> Files data -> Files data
saveAs name fL =
    -- TODO
    fL


saveAll =
    42



-------------------------------
-- Undo-Redo on Focused File --
-------------------------------


undo : Files data -> Files data
undo fL =
    -- TODO
    fL


redo : Files data -> Files data
redo fL =
    -- TODO
    fL



---------------------------------------
-- Queries (only to use in **view**) --
---------------------------------------


{-| Gets the present data of the focused File. Returns Nothing if no file is focused.
-}
getPresent : Files data -> Maybe data
getPresent (Files { maybeFocus, arr }) =
    let
        get i =
            Array.get i arr
                |> Maybe.map (.uLWS >> ULWS.getPresent)
    in
    maybeFocus
        |> Maybe.andThen get


{-| returns True if the history of the file in the fiven index has a past.
-}
hasChanged : Int -> Files data -> Bool
hasChanged fileId (Files { arr }) =
    Array.get fileId arr
        |> Maybe.map (.uLWS >> ULWS.hasPast)
        |> Maybe.withDefault False
