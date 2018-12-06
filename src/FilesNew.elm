module FilesNew exposing
    ( Files
    , encode, decoder
    , singleton, newFile
    , focus
    , undo, redo, new, mapPresent, save, delete, rename, duplicate, close
    , present, hasFuture, hasPast
    , vizData
    )

{-| Represent an ordered nonempty list of files, each with unique names, keeping track of a focused file. It allows undo-redo operations on each file.
An example usage can be found in the source code of
[Kite](https://erkal.github.io/kite/).

It behaves similar to most editors, namely:

  - If a new file is added, it immediately gets the focus.
  - If a file is closed, the past and the future of the file gets lost, in the sense that undo and redo will not work directly after the file is refocused.

**Main restrictions:**

  - There is no folder structure.
  - There is no concept of "opening a file". Instead, `vizData` function exports a boolean field named `hasPast`.


# Definition

@docs Files


# Encoding and Decoding

@docs encode, decoder


# Constructors

@docs singleton, newFile


# Setting the Focus

@docs focus


# Operations on the Focused File

@docs undo, redo, new, mapPresent, save, delete, rename, duplicate, close


# Queries to the Focused File

@docs present, hasFuture, hasPast


# Exporting for View

@docs vizData

-}

import Files.UndoListWithSave as ULWS exposing (UndoListWithSave)
import Json.Decode as JD exposing (Decoder, Value)
import Json.Encode as JE exposing (Value)


{-| Main data structure.
-}
type Files data
    = Files
        { before : List (File data)
        , focused : File data
        , after : List (File data)
        }


type File data
    = File Name (UndoListWithSave data)


type alias Name =
    String



-------------
-- Encoder --
-------------


encode : (data -> Value) -> Files data -> Value
encode encodeFileData (Files { before, focused, after }) =
    JE.object
        [ ( "before", JE.list (encodeFile encodeFileData) before )
        , ( "focused", encodeFile encodeFileData focused )
        , ( "after", JE.list (encodeFile encodeFileData) after )
        ]


encodeFile : (data -> Value) -> File data -> Value
encodeFile encodeFileData (File name uLWS) =
    JE.object
        [ ( "name", JE.string name )
        , ( "savedData", encodeFileData (ULWS.getSavedState uLWS) )
        ]



-------------
-- Decoder --
-------------


decoder : Decoder data -> Decoder (Files data)
decoder dataDecoder =
    JD.map3 (\b f a_ -> Files { before = b, focused = f, after = a_ })
        (JD.field "before" (JD.list (fileDecoder dataDecoder)))
        (JD.field "focused" (fileDecoder dataDecoder))
        (JD.field "after" (JD.list (fileDecoder dataDecoder)))


fileDecoder : Decoder data -> Decoder (File data)
fileDecoder dataDecoder =
    JD.map2 File
        (JD.field "name" JD.string)
        (JD.field "savedData" (JD.map ULWS.fresh dataDecoder))



------------------
-- Constructors --
------------------


{-| This is the only constructor.
-}
singleton : Name -> data -> Files data
singleton name data =
    Files
        { before = []
        , focused = File name (ULWS.fresh data)
        , after = []
        }


{-| Adds a new file just after the focused, the new file gets the focus.
-}
newFile : Name -> data -> Files data -> Files data
newFile name d (Files { before, focused, after }) =
    -- TODO: Check if the name already exists, and if so, add a prefix.
    Files
        { before = focused :: before
        , focused = File name (ULWS.fresh d)
        , after = after
        }



-----------------------
-- Setting the Focus --
-----------------------


focus : Name -> Files data -> Files data
focus name =
    -- TODO
    identity



------------------------------------
-- Operations on the Focused File --
------------------------------------


undo : Files data -> Files data
undo =
    mapULWS ULWS.undo


redo : Files data -> Files data
redo =
    mapULWS ULWS.redo


new : data -> Files data -> Files data
new newState =
    mapULWS (ULWS.new newState)


mapPresent : (data -> data) -> Files data -> Files data
mapPresent up =
    mapULWS (ULWS.mapPresent up)


save : Files data -> Files data
save =
    mapULWS ULWS.savePresent


{-| Deletes the focused file. It doesn't do anything if it is the last item in the list.
-}
delete : Files data -> Files data
delete ((Files { before, focused, after }) as files) =
    case before of
        f :: fs ->
            Files
                { before = fs
                , focused = f
                , after = after
                }

        [] ->
            files


rename : Name -> Files data -> Files data
rename newName =
    map
        (\(File name arr) -> File newName arr)


duplicate : Files data -> Files data
duplicate =
    --TODO
    identity


close : Files data -> Files data
close =
    --TODO
    identity



---------------------------------
-- Queries to the Focused File --
---------------------------------


{-| The present data of the focused File.
-}
present : Files data -> data
present =
    queryULWS ULWS.present


hasFuture : Files data -> Bool
hasFuture =
    queryULWS ULWS.hasFuture


hasPast : Files data -> Bool
hasPast =
    queryULWS ULWS.hasPast



------------------------
-- Exporting for View --
------------------------


vizData : Files a -> List { name : Name, hasTheFocus : Bool, hasPast : Bool }
vizData (Files { before, focused, after }) =
    []



---------------
-- Internals --
---------------


queryULWS q (Files { focused }) =
    focused |> (\(File name uLWS) -> q uLWS)


mapULWS up =
    map (\(File name uLWS) -> File name (up uLWS))


map : (File data -> File data) -> Files data -> Files data
map up (Files { before, focused, after }) =
    Files
        { before = before
        , focused = up focused
        , after = after
        }
