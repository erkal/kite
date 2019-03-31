module Files exposing
    ( Files
    , encode, decoder
    , singleton, newFile
    , undo, redo, goToInHistory, new, mapPresent, save, delete, rename, duplicate, close
    , present, getName, hasFuture, hasPast, lengthPast, uLWSVizData
    , vizData
    , open, openNext, openPrevious
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

@docs undo, redo, goToInHistory, new, mapPresent, save, delete, rename, duplicate, close


# Queries to the Focused File

@docs present, getName, hasFuture, hasPast, lengthPast, uLWSVizData


# Exporting for View

@docs vizData

-}

import Files.UndoListWithSave as ULWS exposing (ActionDescription(..), UndoListWithSave)
import Json.Decode as JD exposing (Decoder, Value)
import Json.Encode as JE exposing (Value)
import Set exposing (Set)


{-| Main data structure.
-}
type Files data
    = Files
        { before : List (File data)
        , focused : File data
        , after : List (File data)
        }


type File data
    = File
        { name : Name
        , isOpen : Bool
        , uLWS : UndoListWithSave data
        }


type alias Name =
    String



-------------
-- Encoder --
-------------


encode : (data -> Value) -> Files data -> Value
encode encodeFileData (Files { before, focused, after }) =
    let
        enc =
            encodeFile encodeFileData
    in
    JE.object
        [ ( "before", JE.list enc before )
        , ( "focused", enc focused )
        , ( "after", JE.list enc after )
        ]


encodeFile : (data -> Value) -> File data -> Value
encodeFile encodeFileData (File f) =
    JE.object
        [ ( "name", JE.string f.name )
        , ( "savedData", encodeFileData (ULWS.getSavedState f.uLWS) )
        ]



-------------
-- Decoder --
-------------


decoder : Decoder data -> Decoder (Files data)
decoder dataDecoder =
    let
        dec =
            fileDecoder dataDecoder

        setIsOpen b (File f) =
            File { f | isOpen = b }
    in
    JD.map3
        (\b f a_ ->
            Files
                { before = b
                , focused = setIsOpen True f
                , after = a_
                }
        )
        (JD.field "before" (JD.list dec))
        (JD.field "focused" dec)
        (JD.field "after" (JD.list dec))


fileDecoder : Decoder data -> Decoder (File data)
fileDecoder dataDecoder =
    JD.map2
        (\n d ->
            File
                { name = n
                , isOpen = False
                , uLWS = ULWS.fresh (ActionDescription "") d
                }
        )
        (JD.field "name" JD.string)
        (JD.field "savedData" dataDecoder)



------------------
-- Constructors --
------------------


{-| This is the only constructor.
-}
singleton : Name -> ActionDescription -> data -> Files data
singleton name actionDescription data =
    Files
        { before = []
        , focused =
            File
                { name = name
                , isOpen = True
                , uLWS = ULWS.fresh actionDescription data
                }
        , after = []
        }


{-| Adds a new file just after the focused, the new file gets the focus.
-}
newFile : Name -> data -> Files data -> Files data
newFile name d ((Files { before, focused, after }) as files) =
    Files
        { before = focused :: before
        , focused =
            File
                { name = newNameFrom name files
                , isOpen = True
                , uLWS = ULWS.fresh (ActionDescription "") d
                }
        , after = after
        }



-----------------------
-- Opening a file --
-----------------------


{-| Given a name which is not the name of the focused file, returns files with the file with the given name opened and focused.
-}
open : Name -> Files data -> Files data
open nameToFocus ((Files { before, focused, after }) as files) =
    let
        hasTheNameToPick : File a -> Bool
        hasTheNameToPick (File f) =
            f.name == nameToFocus

        setIsOpen b (File f) =
            File { f | isOpen = b }
    in
    case pick hasTheNameToPick before of
        Just ( oldBeforeAfterNewFocused, newFocused, newBefore ) ->
            Files
                { before = newBefore
                , focused = setIsOpen True newFocused
                , after = oldBeforeAfterNewFocused ++ (focused :: after)
                }

        Nothing ->
            case pick hasTheNameToPick after of
                Just ( oldAfterBeforeNewFocused, newFocused, newAfter ) ->
                    Files
                        { before =
                            oldAfterBeforeNewFocused ++ (focused :: before)
                        , focused = setIsOpen True newFocused
                        , after = newAfter
                        }

                Nothing ->
                    files



------------------------------------
-- Operations on the Focused File --
------------------------------------


undo : Files data -> Files data
undo =
    mapULWS ULWS.undo


redo : Files data -> Files data
redo =
    mapULWS ULWS.redo


goToInHistory : Int -> Files data -> Files data
goToInHistory i =
    mapULWS (ULWS.goTo i)


new : ActionDescription -> data -> Files data -> Files data
new actionDescription newState =
    mapULWS (ULWS.new actionDescription newState)


mapPresent : (data -> data) -> Files data -> Files data
mapPresent up =
    mapULWS (ULWS.mapPresent up)


save : Files data -> Files data
save =
    mapULWS ULWS.savePresent


{-| Deletes the focused file.
It doesn't do anything if it is the last item in the list.

After deletion, the focus is set to the file just before.
If there is no file before, then the file just after the deleted file gets the focus.

-}
delete : Files data -> Files data
delete ((Files { before, after }) as files) =
    case before of
        x :: xs ->
            Files
                { before = xs
                , focused = x
                , after = after
                }

        [] ->
            case after of
                y :: ys ->
                    Files
                        { before = before
                        , focused = y
                        , after = ys
                        }

                [] ->
                    files


rename : Name -> Files data -> Files data
rename newName files =
    map (\(File f) -> File { f | name = newNameFrom newName files }) files


duplicate : Files data -> Files data
duplicate files =
    newFile
        (newNameFrom (getName files ++ " copy") files)
        (present files)
        files


close : Files data -> Files data
close =
    map
        (\(File f) ->
            File { f | isOpen = False, uLWS = ULWS.cleanHistoryAndResetToSaved f.uLWS }
        )


openNext : Files data -> Files data
openNext ((Files { before, focused, after }) as files) =
    let
        setIsOpen b (File f) =
            File { f | isOpen = b }
    in
    case after of
        x :: xs ->
            Files
                { before = focused :: before
                , focused = setIsOpen True x
                , after = xs
                }

        [] ->
            files


openPrevious : Files data -> Files data
openPrevious ((Files { before, focused, after }) as files) =
    let
        setIsOpen b (File f) =
            File { f | isOpen = b }
    in
    case before of
        x :: xs ->
            Files
                { before = xs
                , focused = setIsOpen True x
                , after = focused :: after
                }

        [] ->
            files



---------------------------------
-- Queries to the Focused File --
---------------------------------


{-| The present data of the focused File.
-}
present : Files data -> data
present =
    queryULWS ULWS.present


{-| The present data of the focused File.
-}
getName : Files data -> Name
getName (Files { focused }) =
    (\(File f) -> f.name) focused


hasFuture : Files data -> Bool
hasFuture =
    queryULWS ULWS.hasFuture


hasPast : Files data -> Bool
hasPast =
    queryULWS ULWS.hasPast


lengthPast : Files data -> Int
lengthPast =
    queryULWS ULWS.lengthPast


uLWSVizData : Files data -> List ActionDescription
uLWSVizData =
    queryULWS ULWS.vizData



------------------------
-- Exporting for View --
------------------------


type alias VizDatum =
    { name : Name
    , isTheFocused : Bool
    , isEdited : Bool
    , isOpen : Bool
    , hasPast : Bool
    }


vizData : Files a -> List VizDatum
vizData (Files { before, focused, after }) =
    let
        datum isTheFocused (File f) =
            { name = f.name
            , isTheFocused = isTheFocused
            , isEdited = not (ULWS.presentIsTheLastSaved f.uLWS)
            , isOpen = f.isOpen
            , hasPast = ULWS.hasPast f.uLWS
            }
    in
    List.reverse (List.map (datum False) before)
        ++ (datum True focused :: List.map (datum False) after)



---------------
-- Internals --
---------------


queryULWS q (Files { focused }) =
    focused
        |> (\(File f) -> f.uLWS)
        |> q


mapULWS up =
    map (\(File f) -> File { f | uLWS = up f.uLWS })


map up (Files { before, focused, after }) =
    Files
        { before = before
        , focused = up focused
        , after = after
        }


newNameFrom : Name -> Files a -> Name
newNameFrom suggestedName (Files { before, focused, after }) =
    let
        allFiles =
            before ++ (focused :: after)

        allNames =
            allFiles
                |> List.map (\(File { name }) -> name)
                |> Set.fromList

        try i =
            let
                nameToTry =
                    suggestedName ++ " " ++ String.fromInt i
            in
            if Set.member nameToTry allNames then
                try (i + 1)

            else
                nameToTry
    in
    if Set.member suggestedName allNames then
        try 1

    else
        suggestedName


{-| Pick an element satisfiying the check and returns also the elements to the left and to the right
-}
pick : (a -> Bool) -> List a -> Maybe ( List a, a, List a )
pick check l =
    let
        helper checked unchecked =
            case unchecked of
                x :: xs ->
                    if check x then
                        Just ( checked, x, xs )

                    else
                        helper (x :: checked) xs

                [] ->
                    Nothing
    in
    helper [] l
