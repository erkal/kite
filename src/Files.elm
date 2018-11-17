module Files exposing
    ( Files
    , empty
    , new, delete
    , open, close
    , update, updateWithoutRecording
    , hasChanged
    , save, saveAs
    , undo, redo
    , get
    )

{-| A data structure for a flat list of files (without folders!), which can be opened, closed, saved, etc.. Each file keeps its own history and hence allows undo redo operations. An example usage can be seen in the source of [this app](https://erkal.github.io/kite/).

The main data structure, called `Files`, keeps an order of the files. The API allows the user to move files via `move` function.
Apart from this, it behaves similar to most editors, namely:

  - If a new file is added (via `new`), it gets immediately opened.
  - If a file is closed, the past and the future of the file gets lost, in the sense that undo and redo will not work directly after the file is reopened.
  - `close`, and `reallyClose` gives you the oportunity to ask the user if she really wants to close the file, in the case that there are unsaved changes.


# Definition

@docs Files


# Constructor

@docs empty


# Adding and Deleting Files

@docs new, delete


# Opening and closing Files

@docs open, close, closeAll


# Updating the opened file

@docs update, updateWithoutRecording


# Queries, to use in the view

@docs getPresent, hasChanged


# Saving

@docs save, saveAs, saveAll


# Undo-redo on the opened file

@docs undo, redo

-}

import Array exposing (Array)
import UndoList as UL exposing (UndoList)


{-| -}
type Files data
    = Files
        { maybeOpenedFile : Maybe FileIndex
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
        { maybeOpenedFile = Nothing
        , arr = Array.empty
        }



--


get =
    42


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


{-| `open i` opens the file with the index **i** given that **i** is smaller than the number of files. If **i** is out of bounds, than it closes the opened file. This serves as a warning because, usually, the GUI should not allow this case to happen.
The indexing of files starts with 0.
-}
open : FileIndex -> Files data -> Files data
open i (Files files) =
    Files
        { files
            | maybeOpenedFile =
                if i < Array.length files.arr then
                    Just i

                else
                    Nothing
        }


close =
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
