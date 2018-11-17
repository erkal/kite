module Files exposing
    ( Files
    , empty
    , new, delete
    , focus, close, reallyClose, closeAll
    , update, updateWithoutRecording
    , save, saveAs, saveAll
    , undo, redo
    , getPresent, hasChanged
    )

{-| Represent an ordered list of files, allowing undo-redo operations on each file. The files can be closed, saved, etc.. An example usage can be seen in the source of [this app](https://erkal.github.io/kite/).

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

@docs new, delete


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
import UndoList as UL exposing (UndoList)


{-| Main data structure. It keeps an array of files
-}
type Files data
    = Files
        { maybeFocus : Maybe FileIndex
        , arr : Array (File data)
        }


type alias File data =
    { name : String
    , uL : UndoList data
    , lastSave : data
    }


type alias FileIndex =
    Int


{-| an empty `Files`. This is the only constructor.
-}
empty : Files data
empty =
    Files
        { maybeFocus = Nothing
        , arr = Array.empty
        }



--


{-| Gets the present data of the focused File. Returns Nothing if no file is focused.
-}
getPresent : Files data -> Maybe data
getPresent (Files { maybeFocus, arr }) =
    let
        get i =
            Array.get i arr
                |> Maybe.map (.uL >> .present)
    in
    maybeFocus
        |> Maybe.andThen get


{-| returns True if the history of the file in the fiven index has a past.
-}
hasChanged : FileIndex -> Files data -> Bool
hasChanged fileId (Files { arr }) =
    Array.get fileId arr
        |> Maybe.map (.uL >> UL.hasPast)
        |> Maybe.withDefault False



--


new : String -> data -> Files data -> Files data
new name d fL =
    -- TODO
    fL


delete : Files data -> Files data
delete (Files files) =
    Files files



--


{-| `focus i` focuses the file with index **i** given that **i** is smaller than the number of files. If **i** is out of bounds, than it makes the focus get lost. This serves as a warning because, usually, the GUI should not allow such a high value for `i`.
The indexing of files starts with 0.
-}
focus : FileIndex -> Files data -> Files data
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


closeAll =
    42


reallyClose =
    42



--


update : (data -> data) -> Files data -> Files data
update up (Files files) =
    Files files


updateWithoutRecording : (data -> data) -> Files data -> Files data
updateWithoutRecording up (Files files) =
    Files files


undo : Files data -> Files data
undo fL =
    -- TODO
    fL


redo : Files data -> Files data
redo fL =
    -- TODO
    fL


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
